"use client"

import { useState, useEffect, useCallback } from "react"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_active: boolean
  rating?: number
  prep_time?: number
  stock_quantity?: number
}

export function useRealtimeProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching products from API...")
      const res = await fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      console.log("📡 API Response status:", res.status, res.statusText)

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      // Get response as text first to handle potential HTML responses
      const responseText = await res.text()
      console.log("📄 Raw response (first 200 chars):", responseText.substring(0, 200))

      // Try to parse as JSON
      let body
      try {
        body = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError)
        console.error("Response was:", responseText.substring(0, 500))

        // Check if it's an HTML error page
        if (responseText.includes("<html") || responseText.includes("<!DOCTYPE")) {
          throw new Error("Received HTML error page instead of JSON. Using fallback data.")
        }

        throw new Error("Invalid JSON response from server")
      }

      console.log("📦 Parsed response:", body)

      // Handle different response formats
      let productsArray: Product[] = []

      if (Array.isArray(body)) {
        // Legacy format: direct array
        productsArray = body
      } else if (body && typeof body === "object") {
        if (Array.isArray(body.data)) {
          // Preferred format: { data: [...] }
          productsArray = body.data
        } else if (Array.isArray(body.products)) {
          // Alternative format: { products: [...] }
          productsArray = body.products
        } else if (body.error && body.source === "mock") {
          // Mock data fallback
          productsArray = body.data || []
          console.log("⚠️ Using mock data:", body.message)
        } else if (body.error) {
          // Error response
          throw new Error(body.error || "API returned an error")
        }
      }

      console.log(`✅ Successfully loaded ${productsArray.length} products`)
      setProducts(productsArray)
    } catch (err) {
      console.error("❌ Error fetching products:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products"
      setError(errorMessage)

      // Set fallback products on error
      setProducts([
        {
          id: "1",
          name: "Espresso",
          description: "Rich and bold espresso shot",
          price: 89,
          category: "ESPRESSO",
          image_url: "/menu-espresso-updated.jpg",
          is_active: true,
          rating: 4.8,
          prep_time: 2,
          stock_quantity: 100,
        },
        {
          id: "2",
          name: "Latte",
          description: "Espresso with steamed milk",
          price: 109,
          category: "ESPRESSO",
          image_url: "/menu-espresso-updated.jpg",
          is_active: true,
          rating: 4.7,
          prep_time: 3,
          stock_quantity: 100,
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}
