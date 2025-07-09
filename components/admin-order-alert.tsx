"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Order } from "@/lib/supabase"

interface AdminOrderAlertProps {
  newOrder: Order | null
  onDismiss: () => void
}

export function AdminOrderAlert({ newOrder, onDismiss }: AdminOrderAlertProps) {
  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (newOrder) {
      const timer = setTimeout(() => {
        onDismiss()
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [newOrder, onDismiss])

  return (
    <AnimatePresence>
      {newOrder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed top-20 right-4 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-6 max-w-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">New Order Received!</h4>
              <p className="text-sm text-gray-600 mb-2">
                Order #{newOrder.id.slice(-8)} from {newOrder.customer_name}
              </p>
              <p className="text-sm font-medium text-gray-900">Total: ₱{newOrder.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {newOrder.items.length} item{newOrder.items.length > 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
