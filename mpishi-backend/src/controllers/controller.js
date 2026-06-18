const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, Inventory, MealPlan, ShoppingList, Recipe } = require('../models/model');
const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// AUTHENTICATION CONTROLLERS
// ==========================================

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
        if (hash !== user.passwordHash) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ success: true, token, displayName: user.displayName });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;
        if (!password) return res.status(400).json({ success: false, message: "Password is required" });

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

        const newUser = await User.create({ username, email, passwordHash, salt, displayName });
        const token = jwt.sign({ id: newUser._id, username: newUser.username }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            success: true,
            token,
            data: { id: newUser._id, username: newUser.username, displayName: newUser.displayName, email: newUser.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        // Securely strip both credentials fields
        const users = await User.find().select('-passwordHash -salt');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// INVENTORY CONTROLLERS (Pantry / Stoo)
// ==========================================

const addItem = async (req, res) => {
    try {
        // Automatically inject the logged-in user's ID from JWT middleware
        const newItem = await Inventory.create({ ...req.body, userId: req.user.id });
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getUserItems = async (req, res) => {
    try {
        // Secure: Reads directly from token payload instead of URL parameter manipulation
        const data = await Inventory.find({ userId: req.user.id });
        res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// NEW: Update pantry item details (like changing an expirationDate)
const updateItem = async (req, res) => {
    try {
        const updatedItem = await Inventory.findOneAndUpdate(
            { _id: req.params.itemId, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedItem) return res.status(404).json({ success: false, message: "Item not found or unauthorized" });
        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// NEW: Delete item when it runs completely out or gets used up
const deleteItem = async (req, res) => {
    try {
        const deletedItem = await Inventory.findOneAndDelete({ _id: req.params.itemId, userId: req.user.id });
        if (!deletedItem) return res.status(404).json({ success: false, message: "Item not found or unauthorized" });
        res.status(200).json({ success: true, message: "Item removed from inventory" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// MEAL PLANNER CONTROLLERS
// ==========================================

const getMealPlan = async (req, res) => {
    try {
        let mealPlan = await MealPlan.findOne({ userId: req.user.id });
        // Lazy initialization: Create a clean plan layout if it doesn't exist yet
        if (!mealPlan) {
            const blankPlan = { Monday: {}, Tuesday: {}, Wednesday: {}, Thursday: {}, Friday: {}, Saturday: {}, Sunday: {} };
            mealPlan = await MealPlan.create({ userId: req.user.id, plan: blankPlan });
        }
        res.status(200).json({ success: true, data: mealPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateMealPlan = async (req, res) => {
    try {
        const updatedPlan = await MealPlan.findOneAndUpdate(
            { userId: req.user.id },
            { plan: req.body.plan },
            { new: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: updatedPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// SHOPPING LIST CONTROLLERS
// ==========================================

const addShoppingItem = async (req, res) => {
    try {
        const newItem = await ShoppingList.create({ ...req.body, userId: req.user.id });
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getShoppingList = async (req, res) => {
    try {
        const list = await ShoppingList.find({ userId: req.user.id });
        res.status(200).json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const toggleShoppingItem = async (req, res) => {
    try {
        const item = await ShoppingList.findOne({ _id: req.params.itemId, userId: req.user.id });
        if (!item) return res.status(404).json({ success: false, message: "Shopping item not found" });

        item.completed = !item.completed;
        await item.save();
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// RECIPE CATALOG CONTROLLERS
// ==========================================
const createRecipe = async (req, res) => {
    try {
        const newRecipe = await Recipe.create(req.body);
        res.status(201).json({ success: true, data: newRecipe });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.status(200).json({ success: true, count: recipes.length, data: recipes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    loginUser,
    createUser,
    getUsers,
    addItem,
    getUserItems,
    updateItem,
    deleteItem,
    getMealPlan,
    updateMealPlan,
    addShoppingItem,
    getShoppingList,
    toggleShoppingItem,
    createRecipe,
    getAllRecipes
};