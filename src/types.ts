export interface InventoryItem {
  id: string;
  name: string;        // Normalized name (e.g. lowercase and trimmed)
  displayName: string; // Formatting for display (e.g. "Sukuma Wiki")
  category: string;    // "Grains & Cereals", "Vegetables & Herbs", "Proteins", "Spices", "Oils & Sauces", "Others"
  dateAdded: string;   // ISO string
  expirationDate?: string; // ISO string (optional)
  isAlwaysInStock: boolean; // Pantry staples feature
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[]; // List of required normalized ingredient names (e.g. ["sukuma wiki", "nyanya", "kitunguu"])
  pantryStaplesNeeded: string[]; // List of staples that are required but won't penalize score (e.g. ["cooking oil", "salt"])
  instructions: string[];
  category: string; // "Traditional", "Stew", "Fried", "Rice Dishes", "Boiled"
  cookingTime: number; // in minutes
  servings: number;
}

export type MealType = "Breakfast" | "Lunch" | "Dinner";

export interface MealSlot {
  recipeId: string | null;
  recipeName: string | null;
  locked?: boolean;
}

export interface DayPlan {
  Breakfast: MealSlot;
  Lunch: MealSlot;
  Dinner: MealSlot;
}

export interface WeeklyMealPlan {
  Monday: DayPlan;
  Tuesday: DayPlan;
  Wednesday: DayPlan;
  Thursday: DayPlan;
  Friday: DayPlan;
  Saturday: DayPlan;
  Sunday: DayPlan;
}

export interface ShoppingItem {
  id: string;
  name: string; // e.g. "Beef"
  category: string;
  completed: boolean;
}

export const DAYS_OF_WEEK: (keyof WeeklyMealPlan)[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner"];
