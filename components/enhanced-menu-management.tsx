"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star, Clock, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import type { Product, MainCategory, ProductFormData } from "@/lib/types"

interface EnhancedMenuManagementProps {
  onProductUpdate?: () => void
}

export function EnhancedMenuManagement({ onProductUpdate }: EnhancedMenuManagementProps) {
  const { toast } = useToast()

  // State
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<MainCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showInactiveOnly, setShowInactiveOnly] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

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
    rating: 0,
    prep_time: 0,
    stock_quantity: 0,
    tags: [],
    variation_ids: [],
    add_on_ids: [],
  })

  // Load data
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error loading products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/menu/structure")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.main_categories || [])
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || product.main_category_id === selectedCategory

    const matchesActiveFilter = showInactiveOnly ? !product.is_active : product.is_active

    return matchesSearch && matchesCategory && matchesActiveFilter
  })

  // Modal handlers
  const openCreateModal = () => {
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
      rating: 0,
      prep_time: 0,
      stock_quantity: 0,
      tags: [],
      variation_ids: [],
      add_on_ids: [],
    })
    setIsProductModalOpen(true)
  }

  const openEditModal = (product: Product) => {
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
      rating: product.rating || 0,
      prep_time: product.prep_time || 0,
      stock_quantity: product.stock_quantity || 0,
      tags: product.tags || [],
      variation_ids: [],
      add_on_ids: [],
    })
    setIsProductModalOpen(true)
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
        onProductUpdate?.()
      } else {
        throw new Error("Failed to save product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
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
        onProductUpdate?.()
      } else {
        throw new Error("Failed to delete product")
      }
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
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, is_active: !product.is_active }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${!product.is_active ? "activated" : "deactivated"}`,
        })
        loadProducts()
        onProductUpdate?.()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-600">Manage your products, categories, and menu items</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Switch id="inactive-only" checked={showInactiveOnly} onCheckedChange={setShowInactiveOnly} />
          <Label htmlFor="inactive-only" className="text-sm">
            Show inactive only
          </Label>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={() => openEditModal(product)}
            onDelete={() => handleDeleteProduct(product.id)}
            onToggleStatus={() => toggleProductStatus(product)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? `No products match "${searchQuery}"` : "Get started by adding your first product"}
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      )}

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="main-category">Main Category</Label>
                <Select
                  value={formData.main_category_id}
                  onValueChange={(value) => setFormData({ ...formData, main_category_id: value, subcategory_id: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select main category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
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
                  onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
                  disabled={!formData.main_category_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .find((cat) => cat.id === formData.main_category_id)
                      ?.subcategories?.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image */}
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="4.5"
                />
              </div>
              <div>
                <Label htmlFor="prep-time">Prep Time (min)</Label>
                <Input
                  id="prep-time"
                  type="number"
                  value={formData.prep_time}
                  onChange={(e) => setFormData({ ...formData, prep_time: Number.parseInt(e.target.value) || 0 })}
                  placeholder="5"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: Number.parseInt(e.target.value) || 0 })}
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
                  setFormData({
                    ...formData,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="coffee, hot, espresso"
              />
            </div>

            {/* Switches */}
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is-active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="is-featured">Featured</Label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>{editingProduct ? "Update Product" : "Create Product"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Product Card Component
function ProductCard({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  product: Product
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: () => void
}) {
  return (
    <Card className={`${!product.is_active ? "opacity-60" : ""}`}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <Image
            src={product.image_url || "/placeholder.svg?height=200&width=300&query=product"}
            alt={product.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            {product.is_featured && <Badge className="bg-orange-500">Featured</Badge>}
            {!product.is_active && <Badge variant="secondary">Inactive</Badge>}
          </div>
          <div className="absolute top-2 right-2">
            <Button variant="secondary" size="sm" onClick={onToggleStatus} className="h-8 w-8 p-0">
              {product.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
            <div className="text-lg font-bold text-gray-900">₱{product.price.toFixed(2)}</div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between mb-3">
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
            <div className="text-xs text-gray-500">Stock: {product.stock_quantity}</div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex gap-1 mb-3">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 bg-transparent">
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
