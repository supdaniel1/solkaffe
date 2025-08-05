"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  ImageIcon,
  Star,
  Clock,
  Package,
  Coffee,
  UtensilsCrossed,
  Search,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import Image from "next/image"
import Link from "next/link"
import type { MainCategory, Product, Variation, AddOn } from "@/lib/types"

interface MenuEditorState {
  menuStructure: { main_categories: MainCategory[]; variations: Variation[]; add_ons: AddOn[] } | null
  loading: boolean
  searchTerm: string
  selectedMainCategory: string
  selectedSubcategory: string
  showInactiveOnly: boolean
  editingProduct: Product | null
  isModalOpen: boolean
}

export default function MenuEditorPage() {
  const { toast } = useToast()
  const { isAuthenticated, loading: authLoading } = useAdminAuth()

  const [state, setState] = useState<MenuEditorState>({
    menuStructure: null,
    loading: true,
    searchTerm: "",
    selectedMainCategory: "1",
    selectedSubcategory: "1",
    showInactiveOnly: false,
    editingProduct: null,
    isModalOpen: false,
  })

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    is_active: true,
    is_featured: false,
    rating: 4.5,
    prep_time: 5,
    stock_quantity: 100,
    tags: [],
  })

  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)

  // Load menu structure
  useEffect(() => {
    if (isAuthenticated) {
      loadMenuStructure()
    }
  }, [isAuthenticated])

  const loadMenuStructure = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }))
      const response = await fetch("/api/menu/structure")
      const data = await response.json()
      setState((prev) => ({ ...prev, menuStructure: data.data, loading: false }))
    } catch (error) {
      console.error("Error loading menu structure:", error)
      toast({
        title: "Error",
        description: "Failed to load menu structure",
        variant: "destructive",
      })
      setState((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setUploadingImage(true)
    try {
      // In a real app, you would upload to a cloud service like Cloudinary or AWS S3
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file)
      setImagePreview(imageUrl)
      setFormData((prev) => ({ ...prev, image_url: imageUrl }))

      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const openProductModal = (product?: Product) => {
    if (product) {
      setState((prev) => ({ ...prev, editingProduct: product, isModalOpen: true }))
      setFormData({
        ...product,
        tags: product.tags || [],
      })
      setImagePreview(product.image_url || "")
    } else {
      setState((prev) => ({ ...prev, editingProduct: null, isModalOpen: true }))
      setFormData({
        name: "",
        description: "",
        price: 0,
        image_url: "",
        main_category_id: state.selectedMainCategory,
        subcategory_id: state.selectedSubcategory,
        is_active: true,
        is_featured: false,
        rating: 4.5,
        prep_time: 5,
        stock_quantity: 100,
        tags: [],
      })
      setImagePreview("")
    }
  }

  const handleSaveProduct = async () => {
    try {
      // In a real app, this would make an API call to save the product
      toast({
        title: "Success",
        description: `Product ${state.editingProduct ? "updated" : "created"} successfully`,
      })
      setState((prev) => ({ ...prev, isModalOpen: false, editingProduct: null }))
      setFormData({})
      setImagePreview("")
      // Reload menu structure
      loadMenuStructure()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    try {
      // In a real app, this would make an API call to delete the product
      toast({
        title: "Success",
        description: `"${productName}" has been deleted successfully`,
      })
      // Reload menu structure
      loadMenuStructure()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const toggleProductStatus = async (product: Product) => {
    try {
      // In a real app, this would make an API call to toggle the product status
      toast({
        title: "Success",
        description: `${product.name} is now ${!product.is_active ? "active" : "inactive"}`,
      })
      // Reload menu structure
      loadMenuStructure()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      })
    }
  }

  // Get current data
  const currentMainCategory = state.menuStructure?.main_categories.find((cat) => cat.id === state.selectedMainCategory)
  const currentSubcategory = currentMainCategory?.subcategories?.find((sub) => sub.id === state.selectedSubcategory)

  // Filter products
  const filteredProducts =
    currentSubcategory?.products?.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(state.searchTerm.toLowerCase())
      const matchesStatus = state.showInactiveOnly ? !product.is_active : product.is_active
      return matchesSearch && matchesStatus
    }) || []

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need to be logged in as an admin to access this page.</p>
            <Link href="/admin">
              <Button>Go to Admin Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Editor</h1>
              <p className="text-gray-600">Manage your menu items, categories, and pricing</p>
            </div>
          </div>
          <Button onClick={() => openProductModal()} className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={state.searchTerm}
                  onChange={(e) => setState((prev) => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10 border-gray-200 rounded-xl"
                />
              </div>

              {/* Category Selection */}
              <Select
                value={state.selectedMainCategory}
                onValueChange={(value) => {
                  setState((prev) => ({ ...prev, selectedMainCategory: value }))
                  // Set first subcategory as default
                  const category = state.menuStructure?.main_categories.find((cat) => cat.id === value)
                  const firstSubcategory = category?.subcategories?.[0]
                  if (firstSubcategory) {
                    setState((prev) => ({ ...prev, selectedSubcategory: firstSubcategory.id }))
                  }
                }}
              >
                <SelectTrigger className="w-48 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {state.menuStructure?.main_categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Subcategory Selection */}
              <Select
                value={state.selectedSubcategory}
                onValueChange={(value) => setState((prev) => ({ ...prev, selectedSubcategory: value }))}
              >
                <SelectTrigger className="w-48 border-gray-200 rounded-xl">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {currentMainCategory?.subcategories?.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-inactive"
                  checked={state.showInactiveOnly}
                  onCheckedChange={(checked) => setState((prev) => ({ ...prev, showInactiveOnly: checked }))}
                />
                <Label htmlFor="show-inactive" className="text-sm">
                  Show inactive
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Category Info */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {state.selectedMainCategory === "1" ? (
              <Coffee className="w-6 h-6 text-gray-600" />
            ) : (
              <UtensilsCrossed className="w-6 h-6 text-gray-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {currentMainCategory?.name} → {currentSubcategory?.name}
            </h2>
          </div>
          <p className="text-gray-600">{currentSubcategory?.description}</p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {state.searchTerm ? "No products found" : "No products in this category"}
              </h3>
              <p className="text-gray-600 mb-4">
                {state.searchTerm
                  ? "Try adjusting your search terms or filters"
                  : "Get started by adding your first product to this category"}
              </p>
              <Button
                onClick={() => openProductModal()}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gray-50">
                      {product.image_url ? (
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {product.is_featured && <Badge className="bg-orange-500 text-white text-xs">Featured</Badge>}
                        <Badge
                          variant={product.is_active ? "default" : "secondary"}
                          className={`text-xs ${
                            product.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggleProductStatus(product)}
                          className="rounded-full w-8 h-8 p-0 bg-white/90 hover:bg-white"
                        >
                          {product.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openProductModal(product)}
                          className="rounded-full w-8 h-8 p-0 bg-white/90 hover:bg-white"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="rounded-full w-8 h-8 p-0 bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{product.name}</h3>
                        <span className="text-lg font-bold text-gray-900">₱{product.price.toFixed(2)}</span>
                      </div>

                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{product.prep_time}min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          <span>{product.stock_quantity}</span>
                        </div>
                      </div>

                      {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {product.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {product.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              +{product.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {state.isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setState((prev) => ({ ...prev, isModalOpen: false }))}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {state.editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setState((prev) => ({ ...prev, isModalOpen: false }))}
                    className="text-gray-400 hover:text-gray-600 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Image Upload */}
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium mb-4 block">Product Image</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                        {imagePreview ? (
                          <div className="relative">
                            <Image
                              src={imagePreview || "/placeholder.svg"}
                              alt="Product preview"
                              width={300}
                              height={200}
                              className="mx-auto rounded-lg object-cover"
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setImagePreview("")
                                setFormData((prev) => ({ ...prev, image_url: "" }))
                              }}
                              className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Drag and drop an image here, or click to select</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file)
                              }}
                              className="hidden"
                              id="image-upload"
                            />
                            <label htmlFor="image-upload">
                              <Button
                                variant="outline"
                                className="cursor-pointer bg-transparent"
                                disabled={uploadingImage}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {uploadingImage ? "Uploading..." : "Choose Image"}
                              </Button>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rating">Rating</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
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
                                rating: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="prep_time">Prep Time (min)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <Input
                            id="prep_time"
                            type="number"
                            min="1"
                            value={formData.prep_time || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                prep_time: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                            className="border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Product Details */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={formData.name || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter product name"
                          className="border-gray-200 rounded-xl"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your product"
                          rows={3}
                          className="border-gray-200 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Price (₱)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                price: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                            placeholder="0.00"
                            className="border-gray-200 rounded-xl"
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
                                stock_quantity: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                            placeholder="100"
                            className="border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Main Category</Label>
                        <Select
                          value={formData.main_category_id || state.selectedMainCategory}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              main_category_id: value,
                            }))
                          }
                        >
                          <SelectTrigger className="border-gray-200 rounded-xl">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {state.menuStructure?.main_categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Subcategory</Label>
                        <Select
                          value={formData.subcategory_id || state.selectedSubcategory}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              subcategory_id: value,
                            }))
                          }
                        >
                          <SelectTrigger className="border-gray-200 rounded-xl">
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentMainCategory?.subcategories?.map((subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={formData.tags?.join(", ") || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            tags: e.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter(Boolean),
                          }))
                        }
                        placeholder="coffee, hot, espresso"
                        className="border-gray-200 rounded-xl"
                      />
                    </div>

                    {/* Status Toggles */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="is_active">Active</Label>
                          <p className="text-sm text-gray-500">Product is available for ordering</p>
                        </div>
                        <Switch
                          id="is_active"
                          checked={formData.is_active || false}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              is_active: checked,
                            }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="is_featured">Featured</Label>
                          <p className="text-sm text-gray-500">Highlight this product</p>
                        </div>
                        <Switch
                          id="is_featured"
                          checked={formData.is_featured || false}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              is_featured: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setState((prev) => ({ ...prev, isModalOpen: false }))}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProduct} className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
                    <Save className="w-4 h-4 mr-2" />
                    {state.editingProduct ? "Update Product" : "Create Product"}
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
