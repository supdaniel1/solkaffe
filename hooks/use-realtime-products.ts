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

      const res = await fetch("/api/products", { method: "GET" })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const body = await res.json()

      if (Array.isArray(body)) {
        // legacy: raw array
        setProducts(body)
      } else if (Array.isArray(body.data)) {
        // preferred: { data: [...] }
        setProducts(body.data)
      } else if (Array.isArray(body.products)) {
        // very old: { products: [...] }
        setProducts(body.products)
      } else {
        console.warn("Unknown payload shape from /api/products:", body)
        setProducts([])
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch products")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, error, refetch: fetchProducts }
}
