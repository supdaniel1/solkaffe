"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Star, Clock, Package, ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useEnhancedCart } from "@/hooks/use-enhanced-cart"
import Image from "next/image"
import type { MainCategory, Product, Variation, AddOn } from "@/lib/types"

interface MenuData {
  main_categories: MainCategory[]
  featured_products: Product[]
  total_products: number
}

export default function OrderPage() {
  const { toast } = useToast()
  const { addItem, items, getTotalPrice, getTotalItems } = useEnhancedCart()

  // State
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [variations, setVariations] = useState<Variation[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  // Product modal state
  const [selectedVariations, setSelectedVariations] = useState<Variation[]>([])
  const [selectedAddOns, setSelectedAddOns] = useState<{ addOn: AddOn; quantity: number }[]>([])
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")

  // Load menu data
  useEffect(() => {
    loadMenuData()
    loadVariations()
    loadAddOns()
  }, [])

  const loadMenuData = async () => {
    try {
      setLoading(true)
      console.log("🔍 Loading menu data...")

      const response = await fetch("/api/menu/structure")

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Check content type
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("❌ Non-JSON response:", text.substring(0, 200))
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      console.log("✅ Menu data loaded successfully:", data.source || "unknown")

      setMenuData(data)

      // Auto-select first category if available
      if (data.main_categories && data.main_categories.length > 0) {
        setSelectedMainCategory(data.main_categories[0].id)
      }
    } catch (error) {
      console.error("❌ Error loading menu:", error)

      // Set fallback data
      const fallbackData = {
        main_categories: [
          {
            id: "1",
            name: "Beverages",
            description: "Coffee and drinks",
            display_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            subcategories: [
              {
                id: "1",
                main_category_id: "1",
                name: "Coffee",
                description: "Hot and cold coffee drinks",
                display_order: 1,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                products: [
                  {
                    id: "1",
                    name: "Americano",
                    description: "Classic black coffee",
                    price: 95,
                    main_category_id: "1",
                    subcategory_id: "1",
                    image_url: "/menu-espresso-updated.jpg",
                    is_active: true,
                    is_featured: true,
                    rating: 4.5,
                    prep_time: 3,
                    stock_quantity: 100,
                    tags: ["coffee", "hot"],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                ],
              },
            ],
          },
        ],
        featured_products: [],
        total_products: 1,
        source: "fallback",
      }

      setMenuData(fallbackData)
      setSelectedMainCategory("1")

      toast({
        title: "Connection Issue",
        description: "Using offline menu. Some features may be limited.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadVariations = async () => {
    try {
      const response = await fetch("/api/admin/variations")
      if (response.ok) {
        const data = await response.json()
        setVariations(data.data || [])
      }
    } catch (error) {
      console.error("Error loading variations:", error)
    }
  }

  const loadAddOns = async () => {
    try {
      const response = await fetch("/api/admin/add-ons")
      if (response.ok) {
        const data = await response.json()
        setAddOns(data.data || [])
      }
    } catch (error) {
      console.error("Error loading add-ons:", error)
    }
  }

  // Get current products based on selection
  const currentProducts = useMemo(() => {
    if (!menuData) return []

    let products: Product[] = []

    if (selectedSubcategory) {
      // Show products from selected subcategory
      const subcategory = menuData.main_categories
        .flatMap((cat) => cat.subcategories || [])
        .find((sub) => sub.id === selectedSubcategory)
      products = subcategory?.products || []
    } else if (selectedMainCategory) {
      // Show all products from selected main category
      const mainCategory = menuData.main_categories.find((cat) => cat.id === selectedMainCategory)
      products = mainCategory?.subcategories?.flatMap((sub) => sub.products || []) || []
    } else {
      // Show featured products or all products
      products = showFeaturedOnly
        ? menuData.featured_products
        : menuData.main_categories.flatMap((cat) => cat.subcategories?.flatMap((sub) => sub.products || []) || [])
    }

    // Apply search filter
    if (searchQuery) {
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    return products.filter((product) => product.is_active)
  }, [menuData, selectedMainCategory, selectedSubcategory, searchQuery, showFeaturedOnly])

  // Navigation handlers
  const handleMainCategorySelect = (categoryId: string) => {
    setSelectedMainCategory(categoryId)
    setSelectedSubcategory(null)
  }

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId)
  }

  const handleBackToCategories = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null)
    } else {
      setSelectedMainCategory(null)
    }
  }

  // Product modal handlers
  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setSelectedVariations([])
    setSelectedAddOns([])
    setQuantity(1)
    setNotes("")
    setIsProductModalOpen(true)
  }

  const handleVariationChange = (variation: Variation, selected: boolean) => {
    if (selected) {
      // Remove any existing variation of the same type
      const filtered = selectedVariations.filter((v) => v.type !== variation.type)
      setSelectedVariations([...filtered, variation])
    } else {
      setSelectedVariations(selectedVariations.filter((v) => v.id !== variation.id))
    }
  }

  const handleAddOnChange = (addOn: AddOn, quantity: number) => {
    if (quantity === 0) {
      setSelectedAddOns(selectedAddOns.filter((item) => item.addOn.id !== addOn.id))
    } else {
      const existing = selectedAddOns.find((item) => item.addOn.id === addOn.id)
      if (existing) {
        setSelectedAddOns(selectedAddOns.map((item) => (item.addOn.id === addOn.id ? { ...item, quantity } : item)))
      } else {
        setSelectedAddOns([...selectedAddOns, { addOn, quantity }])
      }
    }
  }

  const calculateItemTotal = () => {
    if (!selectedProduct) return 0

    let total = selectedProduct.price

    // Add variation price modifiers
    selectedVariations.forEach((variation) => {
      total += variation.price_modifier
    })

    // Add add-on prices
    selectedAddOns.forEach((item) => {
      total += item.addOn.price * item.quantity
    })

    return total * quantity
  }

  const handleAddToCart = () => {
    if (!selectedProduct) return

    addItem({
      id: `${selectedProduct.id}-${Date.now()}`,
      product: selectedProduct,
      quantity,
      selectedVariations,
      selectedAddOns,
      total: calculateItemTotal(),
      notes: notes.trim() || undefined,
    })

    toast({
      title: "Added to cart",
      description: `${selectedProduct.name} has been added to your cart`,
    })

    setIsProductModalOpen(false)
  }

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

  if (!menuData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load menu. Please refresh the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {(selectedMainCategory || selectedSubcategory) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToCategories}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {selectedSubcategory
                    ? menuData.main_categories
                        .flatMap((cat) => cat.subcategories || [])
                        .find((sub) => sub.id === selectedSubcategory)?.name
                    : selectedMainCategory
                      ? menuData.main_categories.find((cat) => cat.id === selectedMainCategory)?.name
                      : "Menu"}
                </h1>
                <p className="text-sm text-gray-500">{currentProducts.length} items available</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="relative bg-transparent"
                onClick={() => (window.location.href = "/cart")}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="featured-only" checked={showFeaturedOnly} onCheckedChange={setShowFeaturedOnly} />
                <Label htmlFor="featured-only" className="text-sm">
                  Featured only
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Categories (when no category selected) */}
        {!selectedMainCategory && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuData.main_categories.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleMainCategorySelect(category.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                          <p className="text-gray-600 mb-4">{category.description}</p>
                          <div className="flex gap-2">
                            {category.subcategories?.map((sub) => (
                              <Badge key={sub.id} variant="secondary" className="text-xs">
                                {sub.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {category.subcategories?.reduce((total, sub) => total + (sub.products?.length || 0), 0)}
                          </div>
                          <div className="text-sm text-gray-500">items</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Featured Products */}
            {menuData.featured_products.length > 0 && !searchQuery && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Items</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuData.featured_products.slice(0, 6).map((product) => (
                    <ProductCard key={product.id} product={product} onClick={() => openProductModal(product)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subcategories (when main category selected but no subcategory) */}
        {selectedMainCategory && !selectedSubcategory && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {menuData.main_categories.find((cat) => cat.id === selectedMainCategory)?.name} Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuData.main_categories
                .find((cat) => cat.id === selectedMainCategory)
                ?.subcategories?.map((subcategory) => (
                  <Card
                    key={subcategory.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleSubcategorySelect(subcategory.id)}
                  >
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{subcategory.name}</h3>
                      <p className="text-gray-600 mb-4">{subcategory.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{subcategory.products?.length || 0} items</Badge>
                        <div className="text-sm text-gray-500">View menu →</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {currentProducts.length > 0 && (selectedSubcategory || searchQuery || showFeaturedOnly) && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => openProductModal(product)} />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {currentProducts.length === 0 && (selectedSubcategory || searchQuery || showFeaturedOnly) && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">
              {searchQuery ? `No items match "${searchQuery}"` : "No items available in this category"}
            </p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProduct.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Product Image */}
                {selectedProduct.image_url && (
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                    <Image
                      src={selectedProduct.image_url || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div>
                  <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-2xl font-bold text-gray-900">₱{selectedProduct.price.toFixed(2)}</div>
                    {selectedProduct.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{selectedProduct.rating}</span>
                      </div>
                    )}
                    {selectedProduct.prep_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedProduct.prep_time} min</span>
                      </div>
                    )}
                  </div>
                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {selectedProduct.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Variations */}
                {variations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Customize Your Order</h4>
                    <div className="space-y-4">
                      {["size", "temperature"].map((type) => {
                        const typeVariations = variations.filter((v) => v.type === type && v.is_active)
                        if (typeVariations.length === 0) return null

                        return (
                          <div key={type}>
                            <Label className="text-sm font-medium capitalize mb-2 block">{type}</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {typeVariations.map((variation) => (
                                <Button
                                  key={variation.id}
                                  variant={
                                    selectedVariations.some((v) => v.id === variation.id) ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleVariationChange(
                                      variation,
                                      !selectedVariations.some((v) => v.id === variation.id),
                                    )
                                  }
                                  className="justify-between"
                                >
                                  <span>{variation.name}</span>
                                  {variation.price_modifier !== 0 && (
                                    <span className="text-xs">
                                      {variation.price_modifier > 0 ? "+" : ""}₱{variation.price_modifier}
                                    </span>
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Add-ons */}
                {addOns.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Add-ons</h4>
                    <div className="space-y-3">
                      {addOns
                        .filter((a) => a.is_active)
                        .map((addOn) => {
                          const selectedQuantity =
                            selectedAddOns.find((item) => item.addOn.id === addOn.id)?.quantity || 0
                          return (
                            <div key={addOn.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{addOn.name}</div>
                                {addOn.description && <div className="text-sm text-gray-600">{addOn.description}</div>}
                                <div className="text-sm font-medium text-gray-900">₱{addOn.price}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddOnChange(addOn, Math.max(0, selectedQuantity - 1))}
                                  disabled={selectedQuantity === 0}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center">{selectedQuantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleAddOnChange(addOn, Math.min(addOn.max_quantity, selectedQuantity + 1))
                                  }
                                  disabled={selectedQuantity >= addOn.max_quantity}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                    Special Instructions (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or modifications..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Quantity and Total */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Label className="font-medium">Quantity:</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xl font-bold">₱{calculateItemTotal().toFixed(2)}</div>
                </div>

                {/* Add to Cart Button */}
                <Button onClick={handleAddToCart} className="w-full" size="lg">
                  Add to Cart - ₱{calculateItemTotal().toFixed(2)}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Product Card Component
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow group" onClick={onClick}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <Image
            src={product.image_url || "/placeholder.svg?height=200&width=300&query=coffee product"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {product.is_featured && <Badge className="absolute top-2 left-2 bg-orange-500">Featured</Badge>}
          {product.stock_quantity !== undefined && product.stock_quantity <= 5 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Low Stock
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
            <div className="text-lg font-bold text-gray-900">₱{product.price.toFixed(2)}</div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">{product.rating}</span>
                </div>
              )}
              {product.prep_time && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-600">{product.prep_time}m</span>
                </div>
              )}
            </div>

            {product.tags && product.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {product.tags[0]}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
