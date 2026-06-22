const express = require('express');
const router = express.Router();

// 1. Import your JWT protective middleware
const protect = require('../middleware/authMiddleware'); // Adjust path as needed

// 2. Import unified OmiDesk controllers
const {
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
} = require('../controllers/controller');
// ==========================================
// AUTHENTICATION & USER MANAGEMENT ROUTES
// ==========================================
router.post('/auth/login', loginUser);       // POST /api/auth/login (Public access)
router.post('/auth/register', createUser);   // POST /api/auth/register (Public/Admin user creation)
router.get('/users', protect, getUsers);     // GET /api/users (Protected view for Admins/Supervisors)

// ==========================================
// TICKETING LIFECYCLE ROUTES
// ==========================================
router.route('/tickets')
    .post(protect, createTicket)             // POST /api/tickets (Staff logs a ticket; auto-populates reporter details)
    .get(protect, getTickets);               // GET /api/tickets (Fetches full pipeline for tech, or user-specific log for staff)

router.route('/tickets/:id')
    .put(protect, updateTicket);             // PUT /api/tickets/:id (Technician updates status, assigns worker, or logs resolution)

// ==========================================
// TICKET CONVERSATION / COMMENT ROUTES
// ==========================================
router.route('/tickets/:id/comments')
    .post(protect, addComment);              // POST /api/tickets/:id/comments (Appends chat update to embedded array)

    // Publicly available helper endpoint to populate drop-downs on the sign-up page
router.get('/setup-data', getSetupData); 

// Protected Configuration Endpoints
router.post('/departments', protect, addDepartment);
router.post('/locations', protect, addLocation);
router.post('/assets', protect, addAsset);
module.exports = router;