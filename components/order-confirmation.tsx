"use client"

import { motion } from "framer-motion"
import { Check, Download, Printer, Share2, Store, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CartItem } from "@/hooks/use-cart"

interface OrderConfirmationProps {
  orderNumber: string
  customerName: string
  items: CartItem[]
  total: number
  paymentMethod: string
  transactionId: string
  timestamp: string
  onNewOrder: () => void
}

export function OrderConfirmation({
  orderNumber,
  customerName,
  items,
  total,
  paymentMethod,
  transactionId,
  timestamp,
  onNewOrder,
}: OrderConfirmationProps) {
  const isCounterPayment = paymentMethod === "Pay at Counter"

  const printReceipt = () => {
    const receiptContent = `
      SOL KAFFÉ - ORDER RECEIPT
      ========================
      
      Order #: ${orderNumber}
      Customer: ${customerName}
      Date: ${new Date(timestamp).toLocaleString()}
      
      ITEMS:
      ${items.map((item) => `${item.quantity}x ${item.name} - $${item.subtotal.toFixed(2)}`).join("\n")}
      
      TOTAL: $${total.toFixed(2)}
      Payment: ${paymentMethod}
      Transaction: ${transactionId}
      
      ${isCounterPayment ? "⚠️  PAYMENT REQUIRED AT COUNTER" : "✅ PAYMENT COMPLETED"}
      
      Thank you for your order!
      Please wait for your name to be called.
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`<pre>${receiptContent}</pre>`)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const shareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sol Kaffé Order",
          text: `Order #${orderNumber} for ${customerName} - $${total.toFixed(2)}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div
          className={`${
            isCounterPayment
              ? "bg-gradient-to-r from-orange-600 to-orange-700"
              : "bg-gradient-to-r from-green-600 to-green-700"
          } p-6 text-white text-center`}
        >
          <motion.div
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isCounterPayment ? (
              <Store className="w-8 h-8 text-orange-600" />
            ) : (
              <Check className="w-8 h-8 text-green-600" />
            )}
          </motion.div>
          <h2 className="text-2xl font-bold">{isCounterPayment ? "Order Placed!" : "Order Confirmed!"}</h2>
          <p className={`${isCounterPayment ? "text-orange-100" : "text-green-100"} mt-2`}>Thank you, {customerName}</p>
        </div>

        <div className="p-6">
          <Card
            className={`${isCounterPayment ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200"} mb-6`}
          >
            <CardHeader className="pb-3">
              <CardTitle className={`text-center ${isCounterPayment ? "text-orange-800" : "text-green-800"}`}>
                Order #{orderNumber}
              </CardTitle>
              <p className={`text-center text-sm ${isCounterPayment ? "text-orange-600" : "text-green-600"}`}>
                {new Date(timestamp).toLocaleString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className={`font-medium ${isCounterPayment ? "text-orange-800" : "text-green-800"}`}>
                        {item.name}
                      </p>
                      <p className={`${isCounterPayment ? "text-orange-600" : "text-green-600"}`}>
                        {item.quantity}x • {item.size} • {item.drinkType}
                      </p>
                    </div>
                    <p className={`font-semibold ${isCounterPayment ? "text-orange-800" : "text-green-800"}`}>
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className={`border-t pt-3 ${isCounterPayment ? "border-orange-300" : "border-green-300"}`}>
                  <div
                    className={`flex justify-between font-bold ${isCounterPayment ? "text-orange-800" : "text-green-800"}`}
                  >
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div
                    className={`flex justify-between text-sm mt-1 ${isCounterPayment ? "text-orange-600" : "text-green-600"}`}
                  >
                    <span>Payment:</span>
                    <span>{paymentMethod}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mb-6">
            {isCounterPayment ? (
              <div className="space-y-3">
                <Badge className="bg-orange-100 text-orange-800 px-4 py-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  Please proceed to the counter
                </Badge>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 font-medium text-sm mb-2">Next Steps:</p>
                  <ol className="text-orange-700 text-sm space-y-1 text-left">
                    <li>1. Show this order number at the counter</li>
                    <li>2. Complete payment (${total.toFixed(2)})</li>
                    <li>3. Wait for your name to be called</li>
                  </ol>
                </div>
              </div>
            ) : (
              <Badge className="bg-green-100 text-green-800 px-4 py-2">Please wait for your name to be called</Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button
              variant="outline"
              onClick={printReceipt}
              className="flex flex-col items-center p-3 h-auto bg-transparent"
            >
              <Printer className="w-4 h-4 mb-1" />
              <span className="text-xs">Print</span>
            </Button>
            <Button
              variant="outline"
              onClick={shareOrder}
              className="flex flex-col items-center p-3 h-auto bg-transparent"
            >
              <Share2 className="w-4 h-4 mb-1" />
              <span className="text-xs">Share</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-3 h-auto bg-transparent">
              <Download className="w-4 h-4 mb-1" />
              <span className="text-xs">Save</span>
            </Button>
          </div>

          <Button
            onClick={onNewOrder}
            className={`w-full ${
              isCounterPayment ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Place New Order
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
