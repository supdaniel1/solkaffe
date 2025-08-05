"use client"

import { useState, useEffect } from "react"
import type { CartItem } from "@/lib/types"

interface UseEnhancedCartReturn {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  getItemsByCategory: () => Record<string, CartItem[]>
}

const CART_STORAGE_KEY = "sol-kaffe-cart"

export function useEnhancedCart(): UseEnhancedCartReturn {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        setItems(Array.isArray(parsedCart) ? parsedCart : [])
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      setItems([])
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item with same product and variations already exists
      const existingItemIndex = prevItems.findIndex((item) => {
        return (
          item.product.id === newItem.product.id &&
          JSON.stringify(item.selectedVariations) === JSON.stringify(newItem.selectedVariations) &&
          JSON.stringify(item.selectedAddOns) === JSON.stringify(newItem.selectedAddOns)
        )
      })

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
          total: updatedItems[existingItemIndex].total + newItem.total,
        }
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const unitPrice = item.total / item.quantity
          return {
            ...item,
            quantity,
            total: unitPrice * quantity,
          }
        }
        return item
      }),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.total, 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getItemsByCategory = () => {
    const grouped: Record<string, CartItem[]> = {}

    items.forEach((item) => {
      const categoryName = item.product.main_category?.name || "Other"
      if (!grouped[categoryName]) {
        grouped[categoryName] = []
      }
      grouped[categoryName].push(item)
    })

    return grouped
  }

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getItemsByCategory,
  }
}
