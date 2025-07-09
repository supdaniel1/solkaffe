"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Search,
  X,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import type { Product, Category } from "@/lib/supabase"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  variations?: { name: string; price_modifier: number }[]
  add_ons?: { name: string; price: number; quantity: number }[]
  total: number
}

interface POSState {
  products: Product[]
  categories: Category[]
  cart: CartItem[]
  searchTerm: string
  selectedCategory: string
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
  paymentMethod: "cash" | "card" | "counter"
  loading: boolean
  error: string | null
}

export function AdminPOS() {
  const { toast } = useToast()
  const { getAuthHeaders } = useAdminAuth()

  const [state, setState] = useState<POSState>({
    products: [],
    categories: [],
    cart: [],
    searchTerm: "",
    selectedCategory: "all",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    notes: "",
    paymentMethod: "cash",
    loading: true,
    error: null,
  })

  const [processingOrder, setProcessingOrder] = useState(false)

  // Fetch data
  const fetchData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/admin/products", { headers: getAuthHeaders() }),
        fetch("/api/admin/categories", { headers: getAuthHeaders() }),
      ])

      if (!productsResponse.ok || !categoriesResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const [productsData, categoriesData] = await Promise.all([productsResponse.json(), categoriesResponse.json()])

      setState((prev) => ({
        ...prev,
        products: productsData.data || [],
        categories: categoriesData.data || [],
        loading: false,
      }))
    } catch (error) {
      console.error("Error fetching POS data:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load data",
        loading: false,
      }))
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Filter products
  const filteredProducts = state.products.filter((product) => {
    if (!product.is_active) return false

    const matchesSearch =
      product.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(state.searchTerm.toLowerCase())
    const matchesCategory = state.selectedCategory === "all" || product.category === state.selectedCategory

    return matchesSearch && matchesCategory
  })

  // Cart calculations
  const cartTotal = state.cart.reduce((sum, item) => sum + item.total, 0)
  const cartItemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0)

  // Add to cart
  const addToCart = (product: Product) => {
    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      price: product.price,
      quantity: 1,
      variations: [],
      add_ons: [],
      total: product.price,
    }

    const existingItemIndex = state.cart.findIndex(
      (item) =>
        item.name === product.name &&
        JSON.stringify(item.variations) === JSON.stringify([]) &&
        JSON.stringify(item.add_ons) === JSON.stringify([]),
    )

    if (existingItemIndex >= 0) {
      setState((prev) => ({
        ...prev,
        cart: prev.cart.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item,
        ),
      }))
    } else {
      setState((prev) => ({
        ...prev,
        cart: [...prev.cart, cartItem],
      }))
    }

    toast({
      title: "Added to cart",
      description: `${product.name} added to cart`,
    })
  }

  // Remove from cart
  const removeFromCart = (itemId: string) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart.filter((item) => item.id !== itemId),
    }))
  }

  // Update cart item quantity
  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
      return
    }

    setState((prev) => ({
      ...prev,
      cart: prev.cart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item,
      ),
    }))
  }

  // Clear cart
  const clearCart = () => {
    setState((prev) => ({ ...prev, cart: [] }))
  }

  // Process order
  const processOrder = async () => {
    if (state.cart.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to cart before placing order",
        variant: "destructive",
      })
      return
    }

    if (!state.customerName.trim()) {
      toast({
        title: "Customer name required",
        description: "Please enter customer name",
        variant: "destructive",
      })
      return
    }

    setProcessingOrder(true)

    try {
      const orderData = {
        customer_name: state.customerName,
        customer_phone: state.customerPhone || null,
        customer_email: state.customerEmail || null,
        items: state.cart,
        total_amount: cartTotal,
        payment_method:
          state.paymentMethod === "cash" ? "Cash" : state.paymentMethod === "card" ? "Card" : "Pay at Counter",
        payment_status: state.paymentMethod === "counter" ? "pending" : "completed",
        notes: state.notes || null,
        status: "pending",
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      toast({
        title: "Order placed successfully",
        description: `Order #${result.data.id.slice(-8)} has been created`,
      })

      // Reset form
      setState((prev) => ({
        ...prev,
        cart: [],
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        notes: "",
        paymentMethod: "cash",
      }))
    } catch (error) {
      console.error("Error processing order:", error)
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to process order",
        variant: "destructive",
      })
    } finally {
      setProcessingOrder(false)
    }
  }

  if (state.loading) {
    return (
      <Card className="bg-white border-0 shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading POS system...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state.error) {
    return (
      <Card className="bg-white border-0 shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load POS</h3>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <Button onClick={fetchData} className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Point of Sale</h2>
            <p className="text-gray-600">Select products to add to cart</p>
          </div>
          <Button
            onClick={fetchData}
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={state.searchTerm}
                    onChange={(e) => setState((prev) => ({ ...prev, searchTerm: e.target.value }))}
                    className="pl-10 border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              <Select
                value={state.selectedCategory}
                onValueChange={(value) => setState((prev) => ({ ...prev, selectedCategory: value }))}
              >
                <SelectTrigger className="w-48 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {state.categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">☕</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800 rounded-full text-xs">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">₱{product.price.toFixed(2)}</span>
                          <Button
                            size="sm"
                            className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(product)
                            }}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cart & Checkout Section */}
      <div className="space-y-6">
        {/* Cart */}
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart
                {cartItemCount > 0 && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 rounded-full">
                    {cartItemCount}
                  </Badge>
                )}
              </div>
              {state.cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                >
                  Clear
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {state.cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Cart is empty</p>
                <p className="text-sm text-gray-500">Add products to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {state.cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-xl"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">₱{item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0 border-gray-200 rounded-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0 border-gray-200 rounded-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg ml-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₱{cartTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <Input
                id="customer-name"
                value={state.customerName}
                onChange={(e) => setState((prev) => ({ ...prev, customerName: e.target.value }))}
                placeholder="Customer name"
                className="border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                id="customer-phone"
                value={state.customerPhone}
                onChange={(e) => setState((prev) => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="Phone number"
                className="border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="customer-email"
                type="email"
                value={state.customerEmail}
                onChange={(e) => setState((prev) => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="Email address"
                className="border-gray-200 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <Textarea
                id="notes"
                value={state.notes}
                onChange={(e) => setState((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Special instructions..."
                className="border-gray-200 rounded-xl"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment & Checkout */}
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={state.paymentMethod === "cash" ? "default" : "outline"}
                onClick={() => setState((prev) => ({ ...prev, paymentMethod: "cash" }))}
                className={`rounded-xl ${
                  state.paymentMethod === "cash"
                    ? "bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                }`}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Cash
              </Button>
              <Button
                variant={state.paymentMethod === "card" ? "default" : "outline"}
                onClick={() => setState((prev) => ({ ...prev, paymentMethod: "card" }))}
                className={`rounded-xl ${
                  state.paymentMethod === "card"
                    ? "bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                }`}
              >
                <CreditCard className="w-4 h-4 mr-1" />
                Card
              </Button>
              <Button
                variant={state.paymentMethod === "counter" ? "default" : "outline"}
                onClick={() => setState((prev) => ({ ...prev, paymentMethod: "counter" }))}
                className={`rounded-xl ${
                  state.paymentMethod === "counter"
                    ? "bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 bg-transparent"
                }`}
              >
                Counter
              </Button>
            </div>

            <Button
              onClick={processOrder}
              disabled={state.cart.length === 0 || !state.customerName.trim() || processingOrder}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 text-lg font-medium"
            >
              {processingOrder ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Place Order (₱{cartTotal.toFixed(2)})
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
