import type { MealSection } from '../types'

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
export const STORAGE_KEY = 'mpishi-auth'
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const MEAL_SECTIONS: MealSection[] = ['Breakfast', 'Lunch', 'Dinner']
export const PANTRY_CATEGORIES = ['Beef & Meats', 'Vegetables & Herbs', 'Proteins', 'Legumes & Grains', 'Sauces & Spices']
