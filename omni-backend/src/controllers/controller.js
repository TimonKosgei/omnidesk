const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Ticket, Asset, Department, Location } = require('../models/model');

const JWT_SECRET = process.env.JWT_SECRET;

// =========================================================================
// 1. AUTHENTICATION CONTROLLERS
// =========================================================================

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, department: user.department }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(200).json({ success: true, token, name: user.name });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Register / Create User
// @route   POST /api/auth/register
// @access  Public / Admin
const createUser = async (req, res) => {
    try {
        const { name, email, role, password, department, phone } = req.body;
        
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists with this email" });
        }

        const saltRounds = 10;
        const hashedStr = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({ 
            name, 
            email, 
            role, 
            department, 
            phone, 
            passwordHash: hashedStr 
        });

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role, department: newUser.department }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            token,
            data: { id: newUser._id, name: newUser.name, email: newUser.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Supervisor)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================================================================
// 2. TICKETING CONTROLLERS
// =========================================================================

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (Staff/Technician/Supervisor/Admin)
const createTicket = async (req, res) => {
    try {
        const { title, description, department, location, asset, priority } = req.body;
        const reportedBy = req.user.id; // Extracted from auth middleware

        if (!title || !description || !department || !location) {
            return res.status(400).json({ success: false, message: "Please provide all required fields." });
        }

        const ticket = new Ticket({
            title,
            description,
            reportedBy,
            department,
            location,
            asset: asset || undefined,
            priority: priority || "medium"
        });

        const savedTicket = await ticket.save();
        res.status(201).json({ success: true, data: savedTicket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get tickets (filtered dynamically by role)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    try {
        let query = {};

        // If the user is plain staff, restrict them to their own logged issues
        if (req.user.role === "staff") {
            query.reportedBy = req.user.id;
        } else if (req.query.status) {
            query.status = req.query.status;
        }

        const tickets = await Ticket.find(query)
            .populate("reportedBy", "name email phone")
            .populate("department", "name")
            .populate("location", "building floor room")
            .populate("asset", "assetTag name category")
            .populate("assignedTechnician", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: tickets.length, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update ticket lifecycle status / Assign Tech
// @route   PUT /api/tickets/:id
// @access  Private (Technician/Supervisor/Admin)
// @desc    Update ticket lifecycle status / Log resolution notes
// @route   PUT /api/tickets/:id
// @access  Private (Technician/Supervisor/Admin)
const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedTechnician, resolutionNotes } = req.body;

        let ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        if (status) ticket.status = status;
        if (assignedTechnician) ticket.assignedTechnician = assignedTechnician;
        if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes;

        if (assignedTechnician && ticket.status === "pending") {
            ticket.status = "assigned";
        }

        // 💡 ADVANCED AUTOMATION: If ticket status is being changed to resolved, 
        // automatically push an entry into the asset's maintenance history block
        if ((status === "resolved" || status === "closed") && ticket.asset) {
            await Asset.findByIdAndUpdate(ticket.asset, {
                $push: {
                    maintenanceHistory: {
                        technician: req.user._id,
                        notes: resolutionNotes || `Ticket resolved: ${ticket.title}`
                    }
                }
            });
        }

        const updatedTicket = await ticket.save();
        
        const fullyPopulated = await Ticket.findById(updatedTicket._id)
            .populate("reportedBy", "name")
            .populate("assignedTechnician", "name");

        res.status(200).json({ success: true, data: fullyPopulated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a comment to an active conversation thread
// @route   POST /api/tickets/:id/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Comment message cannot be empty." });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: "Ticket not found" });
        }

        ticket.comments.push({
            user: req.user.id,
            message: message
        });

        await ticket.save();
        res.status(200).json({ success: true, comments: ticket.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const addDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({ success: false, message: "Name and description are required" });
        }

        const newDept = await Department.create({ name, description });
        res.status(201).json({ success: true, data: newDept });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a new physical location bound to a department
// @route   POST /api/locations
// @access  Private (Admin)
const addLocation = async (req, res) => {
    try {
        const { building, floor, room, department } = req.body;
        if (!building || !floor || !room || !department) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newLocation = await Location.create({ building, floor, room, department });
        res.status(201).json({ success: true, data: newLocation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a hardware asset to the ministry inventory
// @route   POST /api/assets
// @access  Private (Admin/Supervisor)
const addAsset = async (req, res) => {
    try {
        const { assetTag, name, category, serialNumber, manufacturer, location, department, purchaseDate, warrantyExpiry } = req.body;

        if (!assetTag || !name || !category || !serialNumber || !manufacturer || !location || !department || !purchaseDate || !warrantyExpiry) {
            return res.status(400).json({ success: false, message: "Please provide all required asset fields" });
        }

        const newAsset = await Asset.create({
            assetTag, name, category, serialNumber, manufacturer, location, department, purchaseDate, warrantyExpiry
        });

        res.status(201).json({ success: true, data: newAsset });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get setup data for dropdowns (Helper for frontend forms)
// @route   GET /api/setup-data
// @access  Public (Needed during user registration dropdown layout)
const getSetupData = async (req, res) => {
    try {
        const departments = await Department.find().select('name');
        const locations = await Location.find().select('building floor room department');
        res.status(200).json({ success: true, departments, locations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    loginUser,
    createUser,
    getUsers,
    createTicket,
    getTickets,
    updateTicket,
    addComment,
    addDepartment,
    addLocation,
    addAsset,
    getSetupData
};