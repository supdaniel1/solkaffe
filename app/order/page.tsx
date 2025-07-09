"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, MoreHorizontal, Plus, Star, ShoppingBag, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEnhancedCart } from "@/hooks/use-enhanced-cart"
import { useRealtimeProducts } from "@/hooks/use-realtime-products"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_active: boolean
  rating?: number
}

export default function OrderPage() {
  const [selectedCategory, setSelectedCategory] = useState("ESPRESSO")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState("S")
  const [quantity, setQuantity] = useState(1)

  const { products, loading } = useRealtimeProducts()
  const { addToCart, getItemCount } = useEnhancedCart()

  const categories = ["ESPRESSO", "SIGNATURE", "FRAPPUCINO", "FRIES", "WAFFLES", "MATCHA", "NON-COFFEE", "FRAPPE"]

  const filteredProducts = products.filter((product) => {
    return product.is_active && product.category.toUpperCase() === selectedCategory
  })

  const [showWelcome, setShowWelcome] = useState(true)
  const [customerName, setCustomerName] = useState("")
  const [nameError, setNameError] = useState("")
  const [savedName, setSavedName] = useState("")

  // Always show welcome screen on page load/refresh
  useEffect(() => {
    // Load saved name but still show welcome screen
    const storedName = localStorage.getItem("sol-kaffe-customer-name")
    if (storedName) {
      setSavedName(storedName)
      setCustomerName(storedName)
    }
    // Always start with welcome screen visible
    setShowWelcome(true)
  }, [])

  const handleGetStarted = () => {
    if (!customerName.trim()) {
      setNameError("Please enter your name to continue")
      return
    }
    setNameError("")
    setShowWelcome(false)
    // Store customer name in localStorage for later use
    localStorage.setItem("sol-kaffe-customer-name", customerName.trim())
  }

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart({
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        category: selectedProduct.category,
        image_url: selectedProduct.image_url,
        variations: [{ type: "size", name: selectedSize, price_modifier: 0 }],
        quantity,
      })
      setSelectedProduct(null)
      setQuantity(1)
      setSelectedSize("S")
    }
  }

  // Check if current name matches saved name
  const isReturningCustomer = savedName && customerName === savedName

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          {/* Large Logo */}
          <div className="mb-12">
            <Image
              src="/sol-kaffe-logo.png"
              alt="Sol Kaffé"
              width={500}
              height={200}
              className="h-40 w-auto mx-auto mb-8"
            />
            <p className="text-gray-500 text-lg">
              {isReturningCustomer ? `Welcome back, ${customerName}!` : "Welcome to our coffee experience"}
            </p>
          </div>

          {/* Name Input */}
          <div className="mb-12">
            <label className="block text-left text-sm font-medium text-gray-700 mb-4">
              {isReturningCustomer ? "Confirm your name" : "Your Name"}
            </label>
            <Input
              type="text"
              value={customerName}
              onChange={(e) => {
                const value = e.target.value
                const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
                setCustomerName(capitalizedValue)
                if (nameError) setNameError("")
              }}
              onKeyPress={(e) => e.key === "Enter" && handleGetStarted()}
              placeholder="Enter your name"
              className={`w-full px-6 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-colors text-center text-lg ${
                nameError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
              }`}
            />
            {nameError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mt-3 text-left"
              >
                {nameError}
              </motion.p>
            )}
          </div>

          {/* Get Started Button */}
          <Button
            onClick={handleGetStarted}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-2xl py-5 text-lg font-medium transition-all duration-200 mb-6"
          >
            {isReturningCustomer ? "Continue Ordering" : "Get Started"}
          </Button>

          <p className="text-sm text-gray-400">
            {isReturningCustomer
              ? "Ready to place your order?"
              : "We'll use your name to personalize your order experience"}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium text-gray-900">SOL KAFFE</h1>
          <div className="flex items-center gap-3">
            {customerName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Hi, {customerName}</span>
              </div>
            )}
            <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
              {customerName ? (
                <span className="text-sm font-medium text-gray-700">{customerName.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-6">
        <div className="relative h-64 bg-white rounded-2xl overflow-hidden shadow-sm">
          <Image src="/coffee-hero.jpg" alt="Coffee Drinks" fill className="object-cover" />
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {customerName ? `Welcome back, ${customerName}!` : "SOL KAFFE"}
          </h2>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Mon-Sat: 9:00 AM - 8:00 PM</span>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="px-6 mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`pb-2 px-2 text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-6 pb-20">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">☕</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500">Add products through the admin panel to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedProduct(product)}
                className="cursor-pointer"
              >
                <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
                  <div className="relative h-32 bg-gray-50 flex items-center justify-center">
                    {product.image_url ? (
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-2xl font-bold">☕</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 text-center">{product.name.toUpperCase()}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">₱{product.price.toFixed(2)}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                        <span className="text-xs text-gray-600">{product.rating || 4.8}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50 flex items-end"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <Button
                  onClick={() => setSelectedProduct(null)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:bg-gray-100 rounded-full p-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="text-center">
                  {customerName && <p className="text-sm text-gray-500">Ordering for {customerName}</p>}
                </div>
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>

              {/* Product Image */}
              <div className="px-6 mb-8">
                <div className="relative h-64 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center">
                  {selectedProduct.image_url ? (
                    <Image
                      src={selectedProduct.image_url || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-32 h-40 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-4xl font-bold">☕</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="px-6">
                <h3 className="text-3xl font-bold text-gray-900 text-center mb-4">
                  {selectedProduct.name.toUpperCase()}
                </h3>
                <p className="text-gray-500 text-center mb-8 leading-relaxed">
                  {selectedProduct.description ||
                    "We believe coffee should be as simple or complex as you want it to be."}
                </p>

                {/* Size Selection */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">SIZE</h4>
                  <div className="flex gap-3">
                    {["S", "M", "L"].map((size) => (
                      <Button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        variant={selectedSize === size ? "default" : "outline"}
                        className={`flex-1 rounded-xl py-4 ${
                          selectedSize === size
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Combo Section - Only show if there are other products */}
                {products.length > 1 && (
                  <div className="mb-8">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">COMBO</h4>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                            <span className="text-lg">🥐</span>
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">ADD PASTRY</h5>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                              <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                              <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                              <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                              <Star className="w-3 h-3 fill-gray-200 text-gray-200" />
                              <span className="text-xs text-gray-500 ml-1">4.8</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full w-8 h-8 p-0 border-gray-300 bg-transparent"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Section */}
                <div className="flex items-center gap-4 pb-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl relative">
                    <ShoppingBag className="w-6 h-6 text-gray-600" />
                    {getItemCount() > 0 && (
                      <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {getItemCount()}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl py-4 text-lg font-medium"
                  >
                    ADD TO BAG &nbsp;&nbsp;&nbsp; ₱{(selectedProduct.price * quantity).toFixed(2)}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
