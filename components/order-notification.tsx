"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrderNotificationProps {
  newOrderCount: number
  onAcknowledge: () => void
}

export function OrderNotification({ newOrderCount, onAcknowledge }: OrderNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (newOrderCount > 0) {
      setIsVisible(true)
    }
  }, [newOrderCount])

  const handleAcknowledge = () => {
    setIsVisible(false)
    onAcknowledge()
  }

  return (
    <AnimatePresence>
      {isVisible && newOrderCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 right-4 z-50 bg-orange-500 text-white rounded-2xl shadow-lg p-4 max-w-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">New Order{newOrderCount > 1 ? "s" : ""}!</h4>
              <p className="text-sm opacity-90">
                {newOrderCount} new order{newOrderCount > 1 ? "s" : ""} received
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAcknowledge}
              className="text-white hover:bg-orange-600 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
