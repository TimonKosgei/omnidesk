export type AuthState = {
  token: string | null
  displayName: string | null
}

export type InventoryItem = {
  _id: string
  name: string
  displayName: string
  category: string
  expirationDate: string
  isAlwaysInStock: boolean
}

export type ShoppingItem = {
  _id: string
  name: string
  displayName: string
  category: string
  completed: boolean
}

export type Recipe = {
  _id: string
  name: string
  description: string
  ingredients: string[]
  pantryStaplesNeeded: string[]
  instructions: string[]
  category: string
  cookingTime: number
  servings: number
}

export type MealSection = 'Breakfast' | 'Lunch' | 'Dinner'

export type MealSlot = {
  recipeId?: string
  recipeName?: string
  locked?: boolean
}

export type MealPlan = Record<string, Record<MealSection, MealSlot>>

export type MealDialogState = {
  day: string
  section: MealSection
}
