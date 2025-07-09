"use client"

import { useState, useCallback } from "react"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  variations?: { name: string; price_modifier: number }[]
  add_ons?: { name: string; price: number; quantity: number }[]
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (existing) =>
          existing.id === item.id &&
          JSON.stringify(existing.variations) === JSON.stringify(item.variations) &&
          JSON.stringify(existing.add_ons) === JSON.stringify(item.add_ons),
      )

      if (existingIndex >= 0) {
        return prev.map((existing, index) =>
          index === existingIndex ? { ...existing, quantity: existing.quantity + (item.quantity || 1) } : existing,
        )
      }

      return [...prev, { ...item, quantity: item.quantity || 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id)
        return
      }

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    },
    [removeItem],
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getTotal = useCallback(() => {
    return items.reduce((total, item) => {
      const basePrice = item.price
      const variationPrice = item.variations?.reduce((sum, v) => sum + v.price_modifier, 0) || 0
      const addOnPrice = item.add_ons?.reduce((sum, a) => sum + a.price * a.quantity, 0) || 0
      return total + (basePrice + variationPrice + addOnPrice) * item.quantity
    }, 0)
  }, [items])

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }, [items])

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total: getTotal(),
    itemCount: getItemCount(),
  }
}
