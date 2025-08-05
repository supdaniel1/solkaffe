"use client"

import { useState, useEffect } from "react"
import type { CartItem } from "@/lib/types"

export function useEnhancedCart() {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("sol-kaffe-cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("sol-kaffe-cart", JSON.stringify(items))
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if exact same item exists (same product, variations, and add-ons)
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.product.id === newItem.product.id &&
          JSON.stringify(item.selectedVariations) === JSON.stringify(newItem.selectedVariations) &&
          JSON.stringify(item.selectedAddOns) === JSON.stringify(newItem.selectedAddOns),
      )

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

  const updateItemQuantity = (itemId: string, quantity: number) => {
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
    const categories: { [key: string]: CartItem[] } = {}

    items.forEach((item) => {
      const categoryName = item.product.main_category?.name || "Other"
      if (!categories[categoryName]) {
        categories[categoryName] = []
      }
      categories[categoryName].push(item)
    })

    return categories
  }

  return {
    items,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getItemsByCategory,
  }
}
