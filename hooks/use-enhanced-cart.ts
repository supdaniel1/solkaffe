"use client"

import { useState, useEffect } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  category: string
  image_url?: string
  quantity: number
  variations?: Array<{
    type: string
    name: string
    price_modifier: number
  }>
  addOns?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

interface AddToCartItem {
  id: string
  name: string
  price: number
  category: string
  image_url?: string
  variations?: Array<{
    type: string
    name: string
    price_modifier: number
  }>
  quantity?: number
}

export function useEnhancedCart() {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("sol-kaffe-cart")
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        // Ensure parsed data is an array
        if (Array.isArray(parsed)) {
          setItems(parsed)
        } else {
          // Clear invalid data
          localStorage.removeItem("sol-kaffe-cart")
          setItems([])
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
      localStorage.removeItem("sol-kaffe-cart")
      setItems([])
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem("sol-kaffe-cart", JSON.stringify(items))
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
  }, [items])

  const addToCart = (item: AddToCartItem) => {
    setItems((prevItems) => {
      // Ensure prevItems is always an array
      const currentItems = Array.isArray(prevItems) ? prevItems : []

      // Create a unique key for the item including variations
      const itemKey = `${item.id}-${JSON.stringify(item.variations || [])}`

      // Check if item with same variations already exists
      const existingItemIndex = currentItems.findIndex(
        (cartItem) =>
          cartItem.id === item.id &&
          JSON.stringify(cartItem.variations || []) === JSON.stringify(item.variations || []),
      )

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex].quantity += item.quantity || 1
        return updatedItems
      } else {
        // Add new item
        const newItem: CartItem = {
          ...item,
          quantity: item.quantity || 1,
        }
        return [...currentItems, newItem]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => {
      const currentItems = Array.isArray(prevItems) ? prevItems : []
      return currentItems.filter((item) => item.id !== itemId)
    })
  }

  const updateQuantity = (itemId: string, newQuantity: number, variations?: any, addOns?: any) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setItems((prevItems) => {
      const currentItems = Array.isArray(prevItems) ? prevItems : []
      return currentItems.map((item) => {
        if (
          item.id === itemId &&
          JSON.stringify(item.variations || []) === JSON.stringify(variations || []) &&
          JSON.stringify(item.addOns || []) === JSON.stringify(addOns || [])
        ) {
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    })
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalPrice = () => {
    const currentItems = Array.isArray(items) ? items : []
    return currentItems.reduce((total, item) => {
      let itemPrice = item.price

      // Add variation price modifiers
      if (item.variations) {
        itemPrice += item.variations.reduce((sum, variation) => sum + variation.price_modifier, 0)
      }

      // Add add-on prices
      if (item.addOns) {
        itemPrice += item.addOns.reduce((sum, addOn) => sum + addOn.price * addOn.quantity, 0)
      }

      return total + itemPrice * item.quantity
    }, 0)
  }

  const getItemCount = () => {
    const currentItems = Array.isArray(items) ? items : []
    return currentItems.reduce((count, item) => count + item.quantity, 0)
  }

  return {
    items: Array.isArray(items) ? items : [],
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
  }
}
