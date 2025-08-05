"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, MoreHorizontal, Plus, Star, ShoppingBag, User, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useEnhancedCart } from "@/hooks/use-enhanced-cart"
import Image from "next/image"
import type { MainCategory, Product } from "@/lib/types"

export default function OrderPage() {
  const [menuStructure, setMenuStructure] = useState<{ main_categories: MainCategory[] } | null>(null)
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("1") // Beverages by default
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("1") // Espresso by default
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState("2") // Medium by default
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)

  const { addToCart, getItemCount } = useEnhancedCart()

  const [showWelcome, setShowWelcome] = useState(true)
  const [customerName, setCustomerName] = useState("")
  const [nameError, setNameError] = useState("")
  const [savedName, setSavedName] = useState("")

  // Load menu structure
  useEffect(() => {
    loadMenuStructure()
  }, [])

  // Always show welcome screen on page load/refresh
  useEffect(() => {
    const storedName = localStorage.getItem("sol-kaffe-customer-name")
    if (storedName) {
      setSavedName(storedName)
      setCustomerName(storedName)
    }
    setShowWelcome(true)
  }, [])

  const loadMenuStructure = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/menu/structure")
      const data = await response.json()
      setMenuStructure(data.data)
    } catch (error) {
      console.error("Error loading menu structure:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetStarted = () => {
    if (!customerName.trim()) {
      setNameError("Please enter your name to continue")
      return
    }
    setNameError("")
    setShowWelcome(false)
    localStorage.setItem("sol-kaffe-customer-name", customerName.trim())
  }

  const handleAddToCart = () => {
    if (selectedProduct && menuStructure) {
      const selectedVariations = []
      const selectedAddOnItems = []

      // Add size variation
      const sizeVariation = menuStructure.variations?.find((v) => v.id === selectedSize)
      if (sizeVariation) {
        selectedVariations.push({
          id: sizeVariation.id,
          name: sizeVariation.name,
          price_modifier: sizeVariation.price_modifier,
        })
      }

      // Add selected add-ons
      selectedAddOns.forEach((addOnId) => {
        const addOn = menuStructure.add_ons?.find((a) => a.id === addOnId)
        if (addOn) {
          selectedAddOnItems.push({
            id: addOn.id,
            name: addOn.name,
            price: addOn.price,
            quantity: 1,
          })
        }
      })

      const basePrice = selectedProduct.price + (sizeVariation?.price_modifier || 0)
      const addOnsPrice = selectedAddOnItems.reduce((sum, addOn) => sum + addOn.price, 0)
      const totalPrice = (basePrice + addOnsPrice) * quantity

      addToCart({
        id: `${selectedProduct.id}-${Date.now()}`,
        name: selectedProduct.name,
        price: basePrice,
        quantity,
        image_url: selectedProduct.image_url,
        variations: selectedVariations,
        add_ons: selectedAddOnItems,
        total: totalPrice,
      })

      // Reset modal state
      setSelectedProduct(null)
      setQuantity(1)
      setSelectedSize("2")
      setSelectedAddOns([])
    }
  }

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) => (prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]))
  }

  // Get current subcategory and its products
  const currentMainCategory = menuStructure?.main_categories.find((cat) => cat.id === selectedMainCategory)
  const currentSubcategory = currentMainCategory?.subcategories?.find((sub) => sub.id === selectedSubcategory)

  // Filter products based on search and featured filter
  const filteredProducts =
    currentSubcategory?.products?.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFeatured = !showFeaturedOnly || product.is_featured
      return product.is_active && matchesSearch && matchesFeatured
    }) || []

  const isReturningCustomer = savedName && customerName === savedName

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
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
      <header className="bg-white px-6 py-4 sticky top-0 z-40 shadow-sm">
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
        <div className="relative h-48 bg-white rounded-2xl overflow-hidden shadow-sm">
          <Image src="/coffee-hero.jpg" alt="Coffee Drinks" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-2">
                {customerName ? `Welcome back, ${customerName}!` : "SOL KAFFE"}
              </h2>
              <p className="text-sm opacity-90">Mon-Sat: 9:00 AM - 8:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="px-6 mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 rounded-xl bg-white"
            />
          </div>
          <Button
            variant={showFeaturedOnly ? "default" : "outline"}
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className="rounded-xl border-gray-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            Featured
          </Button>
        </div>
      </section>

      {/* Main Category Tabs */}
      <section className="px-6 mb-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {menuStructure?.main_categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedMainCategory(category.id)
                // Set first subcategory as default
                const firstSubcategory = category.subcategories?.[0]
                if (firstSubcategory) {
                  setSelectedSubcategory(firstSubcategory.id)
                }
              }}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                selectedMainCategory === category.id
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Subcategory Tabs */}
      <section className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {currentMainCategory?.subcategories?.map((subcategory) => (
            <button
              key={subcategory.id}
              onClick={() => setSelectedSubcategory(subcategory.id)}
              className={`pb-2 px-3 text-sm font-medium transition-colors whitespace-nowrap ${
                selectedSubcategory === subcategory.id
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {subcategory.name}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No items found" : "No products yet"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Add products through the admin panel to see them here."}
            </p>
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
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs">Featured</Badge>
                    )}
                    {product.image_url ? (
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <span className="text-2xl font-bold">{selectedMainCategory === "1" ? "☕" : "🍽️"}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 text-center text-sm leading-tight">
                      {product.name.toUpperCase()}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">₱{product.price.toFixed(2)}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                        <span className="text-xs text-gray-600">{product.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {product.prep_time} min • {product.stock_quantity} left
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
              <div className="px-6 mb-6">
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
                      <span className="text-4xl font-bold">{selectedMainCategory === "1" ? "☕" : "🍽️"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="px-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.name.toUpperCase()}</h3>
                  {selectedProduct.is_featured && <Badge className="bg-orange-500 text-white">Featured</Badge>}
                </div>

                <p className="text-gray-500 mb-6 leading-relaxed">{selectedProduct.description}</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                    <span className="text-sm font-medium">{selectedProduct.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-sm text-gray-500">{selectedProduct.prep_time} min prep time</div>
                  <div className="text-sm text-gray-500">{selectedProduct.stock_quantity} available</div>
                </div>

                {/* Size Selection - Only for beverages */}
                {selectedMainCategory === "1" && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">SIZE</h4>
                    <div className="flex gap-3">
                      {menuStructure?.variations
                        ?.filter((v) => v.type === "size")
                        .map((size) => (
                          <Button
                            key={size.id}
                            onClick={() => setSelectedSize(size.id)}
                            variant={selectedSize === size.id ? "default" : "outline"}
                            className={`flex-1 rounded-xl py-4 ${
                              selectedSize === size.id
                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-medium">{size.name}</div>
                              {size.price_modifier !== 0 && (
                                <div className="text-xs opacity-75">
                                  {size.price_modifier > 0 ? "+" : ""}₱{size.price_modifier}
                                </div>
                              )}
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Add-ons Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">ADD-ONS</h4>
                  <div className="space-y-3">
                    {menuStructure?.add_ons?.slice(0, 5).map((addOn) => (
                      <div
                        key={addOn.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-xl"
                      >
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{addOn.name}</h5>
                          <p className="text-sm text-gray-500">{addOn.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">₱{addOn.price}</span>
                          <Button
                            variant={selectedAddOns.includes(addOn.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAddOnToggle(addOn.id)}
                            className="rounded-full w-8 h-8 p-0"
                          >
                            {selectedAddOns.includes(addOn.id) ? "✓" : <Plus className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">QUANTITY</h4>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="rounded-full w-10 h-10 p-0"
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="rounded-full w-10 h-10 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

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
                    ADD TO BAG • ₱{(() => {
                      const sizeVariation = menuStructure?.variations?.find((v) => v.id === selectedSize)
                      const basePrice = selectedProduct.price + (sizeVariation?.price_modifier || 0)
                      const addOnsPrice = selectedAddOns.reduce((sum, addOnId) => {
                        const addOn = menuStructure?.add_ons?.find((a) => a.id === addOnId)
                        return sum + (addOn?.price || 0)
                      }, 0)
                      return ((basePrice + addOnsPrice) * quantity).toFixed(2)
                    })()}
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
