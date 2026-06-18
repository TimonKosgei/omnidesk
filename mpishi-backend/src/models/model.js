const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Username is required"],
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    passwordHash:{
        type: String,
        required:true,
    },
    salt:{
        type: String,
        required: true,
    },
    displayName:{
        type: String,
        required: true,
    },
})

const sessionSchema = new mongoose.Schema({
    token:{
        type:String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now,
        expires: 86400
    }
});


const inventorySchema = new mongoose.Schema(
    {
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    name:{
        type:String,
        required: true,
    },
    displayName:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    expirationDate:{
        type: String,
        required: true
    },
    isAlwaysInStock:{
        type: Boolean,
        default: false,
    },
    dateAdded:{
        type: Date,
        required: true,
        default: Date.now
    }
    }
)
const mealPlanSchema = new mongoose.Schema(
    {
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    plan:{
        type: Map,
        of: new mongoose.Schema({
            Breakfast:{recipeId:String, recipeName: String, locked: Boolean},
            Lunch:{recipeId: String, recipeName: String, locked: Boolean},
            Dinner:{recipeId:String, recipeName: String, locked: Boolean}
        },{_id:false}),
        required: true
    },
    }
)

const shoppingListSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false,
        required: true
    },
    dateAdded: {
        type: Date,
        required: true,
        default: Date.now
    }
});

// ==========================================
// 6. RECIPE SCHEMA (Bonus Admin/Custom Feature)
// ==========================================
const recipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: [String], required: true },
    pantryStaplesNeeded: { type: [String], required: true },
    instructions: { type: [String], required: true },
    category: { type: String, required: true },
    cookingTime: { type: Number, required: true },
    servings: { type: Number, required: true }
});

// Compile Models
const User = mongoose.model('User', userSchema);
const Session = mongoose.model('Session', sessionSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);
const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);
const Recipe = mongoose.model('Recipe', recipeSchema);


module.exports = {User, Session, Inventory, MealPlan, ShoppingList, Recipe};