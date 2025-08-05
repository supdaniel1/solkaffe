"use client"

import { useState, useEffect } from "react"
import type { CartItem } from "@/lib/types"

export function useEnhancedCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("sol-kaffe-cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("sol-kaffe-cart", JSON.stringify(items))
    }
  }, [items, isLoading])

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      // Check if exact same item exists (same variations and add-ons)
      const existingItemIndex = prevItems.findIndex(
        (existingItem) =>
          existingItem.id === item.id &&
          JSON.stringify(existingItem.variations) === JSON.stringify(item.variations) &&
          JSON.stringify(existingItem.add_ons) === JSON.stringify(item.add_ons),
      )

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
          total: updatedItems[existingItemIndex].total + item.total,
        }
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, item]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
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

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.total, 0)
  }

  const getCartSummary = () => {
    const itemCount = getItemCount()
    const total = getCartTotal()
    const uniqueItems = items.length

    return {
      itemCount,
      uniqueItems,
      total,
      isEmpty: items.length === 0,
    }
  }

  return {
    items,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getCartTotal,
    getCartSummary,
  }
}
