"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"

interface UseRealtimeProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useRealtimeProducts(): UseRealtimeProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/menu/structure")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Flatten products from all categories and subcategories
      const allProducts: Product[] = []
      data.data.main_categories?.forEach((category: any) => {
        category.subcategories?.forEach((subcategory: any) => {
          if (subcategory.products) {
            allProducts.push(...subcategory.products)
          }
        })
      })

      setProducts(allProducts)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch products")

      // Fallback to empty array
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchProducts()
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    refetch,
  }
}
