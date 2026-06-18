import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { apiFetch } from '../lib/api'
import type { InventoryItem, MealPlan, MealSection, MealSlot, Recipe, ShoppingItem } from '../types'
import { DAYS } from '../data/kitchen'

export type KitchenContextValue = {
  inventory: InventoryItem[]
  mealPlan: MealPlan
  shoppingList: ShoppingItem[]
  recipes: Recipe[]
  cookingRecipe: Recipe | null
  loading: boolean
  error: string
  refreshAll: () => Promise<void>
  addInventoryItem: (item: Omit<InventoryItem, '_id'>) => Promise<void>
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => Promise<void>
  deleteInventoryItem: (itemId: string) => Promise<void>
  addShoppingItem: (name: string) => Promise<void>
  toggleShoppingItem: (itemId: string) => Promise<void>
  updateMealPlan: (plan: MealPlan) => Promise<void>
  setMealSlot: (day: string, section: MealSection, slot: MealSlot) => Promise<void>
  toggleMealLock: (day: string, section: MealSection) => Promise<void>
  openCookingRecipe: (recipe: Recipe) => void
  closeCookingRecipe: () => void
}

const KitchenContext = createContext<KitchenContextValue | null>(null)

function normalizeMealPlan(data: Partial<MealPlan> | Record<string, Record<MealSection, MealSlot>>) {
  const result = {} as MealPlan
  for (const day of DAYS) {
    result[day] = {
      Breakfast: data[day]?.Breakfast ?? {},
      Lunch: data[day]?.Lunch ?? {},
      Dinner: data[day]?.Dinner ?? {},
    }
  }
  return result
}

function cloneMealPlan(plan: MealPlan) {
  return structuredClone(plan)
}

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [mealPlan, setMealPlan] = useState<MealPlan>(normalizeMealPlan({}))
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadKitchenData() {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const [inventoryPayload, mealPlanPayload, shoppingPayload, recipesPayload] = await Promise.all([
        apiFetch<InventoryItem[]>('/api/inventory', token),
        apiFetch<MealPlan>('/api/mealplan', token),
        apiFetch<ShoppingItem[]>('/api/shoppinglist', token),
        apiFetch<Recipe[]>('/api/recipes', token),
      ])

      setInventory(inventoryPayload.data ?? [])
      setMealPlan(normalizeMealPlan(mealPlanPayload.data ?? {}))
      setShoppingList(shoppingPayload.data ?? [])
      setRecipes(recipesPayload.data ?? [])
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load kitchen data'
      setError(message)
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('token')) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadKitchenData()
  }, [token])

  async function refreshAll() {
    await loadKitchenData()
  }

  async function addInventoryItem(item: Omit<InventoryItem, '_id'>) {
    await apiFetch('/api/inventory', token, {
      method: 'POST',
      body: JSON.stringify(item),
    })
    await refreshAll()
  }

  async function updateInventoryItem(itemId: string, updates: Partial<InventoryItem>) {
    await apiFetch(`/api/inventory/${itemId}`, token, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
    await refreshAll()
  }

  async function deleteInventoryItem(itemId: string) {
    await apiFetch(`/api/inventory/${itemId}`, token, { method: 'DELETE' })
    await refreshAll()
  }

  async function addShoppingItem(name: string) {
    await apiFetch('/api/shoppinglist', token, {
      method: 'POST',
      body: JSON.stringify({
        name,
        displayName: name,
        category: 'Manual',
      }),
    })
    await refreshAll()
  }

  async function toggleShoppingItem(itemId: string) {
    await apiFetch(`/api/shoppinglist/${itemId}/toggle`, token, { method: 'PATCH' })
    await refreshAll()
  }

  async function updateMealPlan(plan: MealPlan) {
    const payload = await apiFetch<MealPlan>('/api/mealplan', token, {
      method: 'PUT',
      body: JSON.stringify({ plan }),
    })
    setMealPlan(normalizeMealPlan(payload.data ?? plan))
  }

  async function setMealSlot(day: string, section: MealSection, slot: MealSlot) {
    const nextPlan = cloneMealPlan(mealPlan)
    nextPlan[day] = {
      ...(nextPlan[day] ?? {}),
      [section]: slot,
    }
    await updateMealPlan(nextPlan)
  }

  async function toggleMealLock(day: string, section: MealSection) {
    const nextPlan = cloneMealPlan(mealPlan)
    const currentSlot = nextPlan[day]?.[section] ?? {}
    nextPlan[day] = {
      ...(nextPlan[day] ?? {}),
      [section]: {
        ...currentSlot,
        locked: !currentSlot.locked,
      },
    }
    await updateMealPlan(nextPlan)
  }

  const value = useMemo<KitchenContextValue>(() => ({
    inventory,
    mealPlan,
    shoppingList,
    recipes,
    cookingRecipe,
    loading,
    error,
    refreshAll,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addShoppingItem,
    toggleShoppingItem,
    updateMealPlan,
    setMealSlot,
    toggleMealLock,
    openCookingRecipe: setCookingRecipe,
    closeCookingRecipe: () => setCookingRecipe(null),
  }), [inventory, mealPlan, shoppingList, recipes, cookingRecipe, loading, error])

  return <KitchenContext.Provider value={value}>{children}</KitchenContext.Provider>
}

export function useKitchen() {
  const context = useContext(KitchenContext)
  if (!context) {
    throw new Error('KitchenContext is missing')
  }
  return context
}
