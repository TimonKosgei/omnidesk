const express = require('express');
const router = express.Router();

// 1. Import your JWT protective middleware
const protect = require('../middleware/authMiddleware'); // Adjust path as needed

// 2. Import all controllers
const {
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
} = require('../controllers/controller');

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/login', loginUser);
router.post('/auth/register', createUser); 
router.get('/users', protect, getUsers); // Protected admin/dev view

// ==========================================
// INVENTORY (PANTRY / STOO) ROUTES
// ==========================================
router.route('/inventory')
    .post(protect, addItem)         // POST /api/inventory (Add item to your pantry)
    .get(protect, getUserItems);    // GET /api/inventory (Replaces /inventory/user/:id securely!)

router.route('/inventory/:itemId')
    .put(protect, updateItem)       // PUT /api/inventory/:itemId (Edit item details/dates)
    .delete(protect, deleteItem);   // DELETE /api/inventory/:itemId (Remove item entirely)

// ==========================================
// MEAL PLANNER ROUTES
// ==========================================
router.route('/mealplan')
    .get(protect, getMealPlan)      // GET /api/mealplan (Fetch user's current 7-day layout)
    .put(protect, updateMealPlan);  // PUT /api/mealplan (Update specific days/meals)

// ==========================================
// SHOPPING LIST ROUTES
// ==========================================
router.route('/shoppinglist')
    .get(protect, getShoppingList)  // GET /api/shoppinglist (Get active grocery list)
    .post(protect, addShoppingItem); // POST /api/shoppinglist (Add missing item manually)

router.patch('/shoppinglist/:itemId/toggle', protect, toggleShoppingItem); // PATCH (Check/uncheck item)

// ==========================================
// GLOBAL RECIPE CATALOG ROUTES
// ==========================================
router.route('/recipes') // GET /api/recipes (Public catalog lookup)
    .get(getAllRecipes)
    .post(createRecipe);

    
module.exports = router;