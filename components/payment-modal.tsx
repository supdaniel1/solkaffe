"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Smartphone, DollarSign, X, Check, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { CartItem } from "@/hooks/use-cart"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  customerName: string
  onPaymentComplete: (paymentMethod: string, transactionId: string) => void
}

type PaymentMethod = "card" | "cash" | "mobile" | "counter"

export function PaymentModal({ isOpen, onClose, items, total, customerName, onPaymentComplete }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("counter")
  const [processing, setProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })
  const [cashReceived, setCashReceived] = useState("")
  const { toast } = useToast()

  const change = selectedMethod === "cash" ? Math.max(0, Number.parseFloat(cashReceived) - total) : 0

  const processPayment = async () => {
    if (processing) {
      console.log("Payment already processing, ignoring duplicate click")
      return
    }

    setProcessing(true)

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let transactionId = ""
      let method = ""

      switch (selectedMethod) {
        case "card":
          if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
            toast({
              title: "Invalid card details",
              description: "Please fill in all card information",
              variant: "destructive",
            })
            return
          }
          transactionId = `CARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          method = "Credit Card"
          break
        case "cash":
          if (Number.parseFloat(cashReceived) < total) {
            toast({
              title: "Insufficient cash",
              description: "Please provide enough cash for the order",
              variant: "destructive",
            })
            return
          }
          transactionId = `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          method = "Cash"
          break
        case "mobile":
          transactionId = `MOBILE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          method = "Mobile Payment"
          break
        case "counter":
          transactionId = `COUNTER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          method = "Pay at Counter"
          break
      }

      console.log("Payment processed:", { method, transactionId })

      // Call the payment completion handler
      await onPaymentComplete(method, transactionId)
    } catch (error) {
      console.error("Payment processing error:", error)
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Please try again or contact support",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!processing ? onClose : undefined}
        >
          <motion.div
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Complete Payment</h2>
                {!processing && (
                  <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
              <p className="text-green-100 mt-2">Order for {customerName}</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Order Summary</h3>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <div>
                              <p className="font-medium text-green-800">{item.name}</p>
                              <p className="text-green-600">
                                {item.quantity}x • {item.size} • {item.milk} • {item.drinkType}
                              </p>
                            </div>
                            <p className="font-semibold text-green-800">${item.subtotal.toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="border-t border-green-300 pt-3">
                          <div className="flex justify-between text-lg font-bold text-green-800">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Payment Method</h3>

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <Button
                      variant={selectedMethod === "counter" ? "default" : "outline"}
                      onClick={() => setSelectedMethod("counter")}
                      disabled={processing}
                      className="flex flex-col items-center p-4 h-auto bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 hover:from-orange-200 hover:to-orange-300"
                    >
                      <Store className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Pay at Counter</span>
                      <span className="text-xs text-orange-700">Recommended</span>
                    </Button>
                    <Button
                      variant={selectedMethod === "card" ? "default" : "outline"}
                      onClick={() => setSelectedMethod("card")}
                      disabled={processing}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <CreditCard className="w-6 h-6 mb-2" />
                      <span className="text-sm">Card</span>
                    </Button>
                    <Button
                      variant={selectedMethod === "cash" ? "default" : "outline"}
                      onClick={() => setSelectedMethod("cash")}
                      disabled={processing}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <DollarSign className="w-6 h-6 mb-2" />
                      <span className="text-sm">Cash</span>
                    </Button>
                    <Button
                      variant={selectedMethod === "mobile" ? "default" : "outline"}
                      onClick={() => setSelectedMethod("mobile")}
                      disabled={processing}
                      className="flex flex-col items-center p-4 h-auto"
                    >
                      <Smartphone className="w-6 h-6 mb-2" />
                      <span className="text-sm">Mobile</span>
                    </Button>
                  </div>

                  {/* Payment Details */}
                  {selectedMethod === "counter" && (
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                      <Store className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                      <h4 className="font-semibold text-orange-800 mb-2">Pay at Counter</h4>
                      <p className="text-orange-700 text-sm mb-3">
                        Your order will be sent to our staff. Please proceed to the counter to complete payment when
                        your order is ready.
                      </p>
                      <div className="bg-orange-100 rounded-lg p-3">
                        <p className="text-orange-800 font-medium text-sm">
                          💡 This is the fastest way to order! No payment processing delays.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedMethod === "card" && (
                    <div className="space-y-4">
                      <Input
                        placeholder="Card Number"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        maxLength={19}
                        disabled={processing}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          maxLength={5}
                          disabled={processing}
                        />
                        <Input
                          placeholder="CVV"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          maxLength={4}
                          disabled={processing}
                        />
                      </div>
                      <Input
                        placeholder="Cardholder Name"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        disabled={processing}
                      />
                    </div>
                  )}

                  {selectedMethod === "cash" && (
                    <div className="space-y-4">
                      <Input
                        placeholder="Cash Received"
                        type="number"
                        step="0.01"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        disabled={processing}
                      />
                      {change > 0 && (
                        <div className="p-3 bg-green-100 rounded-lg">
                          <p className="text-green-800 font-semibold">Change: ${change.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMethod === "mobile" && (
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <Smartphone className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                      <p className="text-blue-800 font-medium">Scan QR code or tap to pay</p>
                      <p className="text-blue-600 text-sm mt-2">Apple Pay, Google Pay, Samsung Pay</p>
                    </div>
                  )}

                  <Button
                    onClick={processPayment}
                    disabled={processing}
                    className={`w-full mt-6 py-3 ${
                      selectedMethod === "counter"
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white`}
                  >
                    {processing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {selectedMethod === "counter"
                          ? `Place Order ($${total.toFixed(2)})`
                          : `Complete Payment ($${total.toFixed(2)})`}
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
