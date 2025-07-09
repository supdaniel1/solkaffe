"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/lib/supabase"

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null)

  // Fetch initial orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/orders")

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setOrders(data.data || [])
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Real-time order update:", payload)

          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as Order
            setOrders((prev) => [newOrder, ...prev])
            setNewOrderAlert(newOrder)
          } else if (payload.eventType === "UPDATE") {
            const updatedOrder = payload.new as Order
            setOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)))
          } else if (payload.eventType === "DELETE") {
            const deletedOrder = payload.old as Order
            setOrders((prev) => prev.filter((order) => order.id !== deletedOrder.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const clearNewOrderAlert = () => {
    setNewOrderAlert(null)
  }

  return {
    orders,
    loading,
    error,
    newOrderAlert,
    clearNewOrderAlert,
  }
}
