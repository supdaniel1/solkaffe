"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit, Trash2, Upload, X, Star, Clock, Package, Eye, EyeOff, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import type { MainCategory, Subcategory, Product, Variation, AddOn, ProductFormData } from "@/lib/types"

interface MenuEditorState {
  products: Product[]
  mainCategories: MainCategory[]
  subcategories: Subcategory[]
  variations: Variation[]
  addOns: AddOn[]
  loading: boolean
  error: string | null
}

export default function MenuEditorPage() {
  const { toast } = useToast()

  // State
  const [state, setState] = useState<MenuEditorState>({
    products: [],
    mainCategories: [],
    subcategories: [],
    variations: [],
    addOns: [],
    loading: true,
    error: null,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all")
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [imageUploading, setImageUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    main_category_id: "",
    subcategory_id: "",
    image_url: "",
    is_active: true,
    is_featured: false,
    rating: undefined,
    prep_time: undefined,
    stock_quantity: undefined,
    tags: [],
    variation_ids: [],
    add_on_ids: [],
  })

  // Load all data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      await Promise.all([loadProducts(), loadMainCategories(), loadSubcategories(), loadVariations(), loadAddOns()])
    } catch (error) {
      console.error("Error loading data:", error)
      setState((prev) => ({
        ...prev,
        error: "Failed to load menu data. Please refresh the page.",
      }))
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      if (response.ok) {
        const data = await response.json()
        setState((prev) => ({ ...prev, products: data.data || [] }))
      }
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  const loadMainCategories = async () => {
    try {
      const response = await fetch("/api/menu/structure")
      if (response.ok) {
        const data = await response.json()
        setState((prev) => ({ ...prev, mainCategories: data.main_categories || [] }))
      }
    } catch (error) {
      console.error("Error loading main categories:", error)
    }
  }

  const loadSubcategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        // Assuming subcategories are returned from this endpoint
        setState((prev) => ({ ...prev, subcategories: data.data || [] }))
      }
    } catch (error) {
      console.error("Error loading subcategories:", error)
    }
  }

  const loadVariations = async () => {
    try {
      const response = await fetch("/api/admin/variations")
      if (response.ok) {
        const data = await response.json()
        setState((prev) => ({ ...prev, variations: data.data || [] }))
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
        setState((prev) => ({ ...prev, addOns: data.data || [] }))
      }
    } catch (error) {
      console.error("Error loading add-ons:", error)
    }
  }

  // Filter products
  const filteredProducts = state.products.filter((product) => {
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesMainCategory = !selectedMainCategory || product.main_category_id === selectedMainCategory
    const matchesSubcategory = !selectedSubcategory || product.subcategory_id === selectedSubcategory
    const matchesActive = !showActiveOnly || product.is_active

    return matchesSearch && matchesMainCategory && matchesSubcategory && matchesActive
  })

  // Get filtered subcategories based on selected main category
  const filteredSubcategories = selectedMainCategory
    ? state.subcategories.filter((sub) => sub.main_category_id === selectedMainCategory)
    : state.subcategories

  // Modal handlers
  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        main_category_id: product.main_category_id,
        subcategory_id: product.subcategory_id || "",
        image_url: product.image_url || "",
        is_active: product.is_active,
        is_featured: product.is_featured,
        rating: product.rating,
        prep_time: product.prep_time,
        stock_quantity: product.stock_quantity,
        tags: product.tags || [],
        variation_ids: [], // Would need to load from junction table
        add_on_ids: [], // Would need to load from junction table
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        price: 0,
        main_category_id: "",
        subcategory_id: "",
        image_url: "",
        is_active: true,
        is_featured: false,
        rating: undefined,
        prep_time: undefined,
        stock_quantity: undefined,
        tags: [],
        variation_ids: [],
        add_on_ids: [],
      })
    }
    setIsProductModalOpen(true)
  }

  const handleImageUpload = async (file: File) => {
    setImageUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, image_url: data.url }))
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setImageUploading(false)
    }
  }

  const handleSaveProduct = async () => {
    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"

      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${editingProduct ? "updated" : "created"} successfully`,
        })
        setIsProductModalOpen(false)
        loadProducts()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to save product")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        loadProducts()
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleToggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${!isActive ? "activated" : "deactivated"}`,
        })
        loadProducts()
      } else {
        throw new Error("Failed to update product status")
      }
    } catch (error) {
      console.error("Error updating product status:", error)
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      })
    }
  }

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu editor...</p>
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{state.error}</p>
          <Button onClick={loadAllData}>Retry</Button>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/admin")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Menu Editor</h1>
                <p className="text-sm text-gray-500">
                  {filteredProducts.length} of {state.products.length} products
                </p>
              </div>
            </div>

            <Button onClick={() => openProductModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-4">
              <Select value={selectedMainCategory} onValueChange={setSelectedMainCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {state.mainCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSubcategory}
                onValueChange={setSelectedSubcategory}
                disabled={!selectedMainCategory || selectedMainCategory === "all"}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Subcategories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center space-x-2">
              <Switch id="active-only" checked={showActiveOnly} onCheckedChange={setShowActiveOnly} />
              <Label htmlFor="active-only" className="text-sm whitespace-nowrap">
                Active only
              </Label>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <Image
                        src={product.image_url || "/placeholder.svg?height=200&width=300&query=product image"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {product.is_featured && <Badge className="bg-orange-500">Featured</Badge>}
                        {!product.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openProductModal(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleToggleProductStatus(product.id, product.is_active)}
                          className="h-8 w-8 p-0"
                        >
                          {product.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">{product.name}</h3>
                        <div className="text-lg font-bold text-gray-900 ml-2">₱{product.price.toFixed(2)}</div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                      {/* Product Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-3">
                          {product.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{product.rating}</span>
                            </div>
                          )}
                          {product.prep_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{product.prep_time}m</span>
                            </div>
                          )}
                          {product.stock_quantity !== undefined && (
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              <span>{product.stock_quantity}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {product.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {product.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{product.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? `No products match "${searchQuery}"` : "No products match your current filters"}
            </p>
            <Button onClick={() => openProductModal()}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Product
            </Button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (₱) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="main_category">Main Category *</Label>
                  <Select
                    value={formData.main_category_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        main_category_id: value,
                        subcategory_id: "", // Reset subcategory when main category changes
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {state.mainCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={formData.subcategory_id}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory_id: value }))}
                    disabled={!formData.main_category_id || formData.main_category_id === "all"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">No subcategory</SelectItem>
                      {state.subcategories
                        .filter((sub) => sub.main_category_id === formData.main_category_id)
                        .map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <div>
                  <Label>Product Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.image_url ? (
                      <div className="relative">
                        <Image
                          src={formData.image_url || "/placeholder.svg"}
                          alt="Product preview"
                          width={200}
                          height={150}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Drop an image here or click to upload</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file)
                          }}
                          disabled={imageUploading}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <Button variant="outline" disabled={imageUploading} asChild>
                            <span>{imageUploading ? "Uploading..." : "Choose File"}</span>
                          </Button>
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* Manual URL Input */}
                  <div className="mt-2">
                    <Label htmlFor="image_url" className="text-sm">
                      Or enter image URL
                    </Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product..."
                rows={3}
              />
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rating: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                    }))
                  }
                  placeholder="4.5"
                />
              </div>

              <div>
                <Label htmlFor="prep_time">Prep Time (minutes)</Label>
                <Input
                  id="prep_time"
                  type="number"
                  min="0"
                  value={formData.prep_time || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prep_time: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    }))
                  }
                  placeholder="5"
                />
              </div>

              <div>
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock_quantity: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    }))
                  }
                  placeholder="100"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  }))
                }
                placeholder="coffee, hot, signature"
              />
              {formData.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Status Toggles */}
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_featured: checked }))}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveProduct}
                disabled={!formData.name || !formData.main_category_id || formData.price <= 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingProduct ? "Update" : "Create"} Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
