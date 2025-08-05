"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Coffee, Tag, Settings, Package } from "lucide-react"

// Types
interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  is_active: boolean
  rating?: number
  prep_time?: number
  stock_quantity?: number
  variations?: string[]
  add_ons?: string[]
}

interface Category {
  id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
}

interface Variation {
  id: string
  name: string
  type: string
  price_modifier: number
  is_active: boolean
}

interface AddOn {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  max_quantity: number
  is_active: boolean
}

interface FormData {
  name: string
  description: string
  price: string
  category: string
  image_url: string
  is_active: boolean
  rating: string
  prep_time: string
  stock_quantity: string
  variations: string[]
  add_ons: string[]
}

export default function EnhancedMenuManagement() {
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [variations, setVariations] = useState<Variation[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("products")

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    image_url: "",
    is_active: true,
    rating: "",
    prep_time: "",
    stock_quantity: "",
    variations: [],
    add_ons: [],
  })

  // Load data
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadProducts(), loadCategories(), loadVariations(), loadAddOns()])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/admin/products")
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      const data = await response.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadVariations = async () => {
    try {
      const response = await fetch("/api/admin/variations")
      const data = await response.json()
      setVariations(data.data || [])
    } catch (error) {
      console.error("Error loading variations:", error)
    }
  }

  const loadAddOns = async () => {
    try {
      const response = await fetch("/api/admin/add-ons")
      const data = await response.json()
      setAddOns(data.data || [])
    } catch (error) {
      console.error("Error loading add-ons:", error)
    }
  }

  // Form handlers
  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleVariationToggle = (variationId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      variations: checked ? [...prev.variations, variationId] : prev.variations.filter((id) => id !== variationId),
    }))
  }

  const handleAddOnToggle = (addOnId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      add_ons: checked ? [...prev.add_ons, addOnId] : prev.add_ons.filter((id) => id !== addOnId),
    }))
  }

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        image_url: product.image_url || "",
        is_active: product.is_active,
        rating: product.rating?.toString() || "",
        prep_time: product.prep_time?.toString() || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        variations: product.variations || [],
        add_ons: product.add_ons || [],
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image_url: "",
        is_active: true,
        rating: "",
        prep_time: "",
        stock_quantity: "",
        variations: [],
        add_ons: [],
      })
    }
    setIsProductModalOpen(true)
  }

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price) || 0,
        category: formData.category,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        rating: formData.rating ? Number.parseFloat(formData.rating) : null,
        prep_time: formData.prep_time ? Number.parseInt(formData.prep_time) : null,
        stock_quantity: formData.stock_quantity ? Number.parseInt(formData.stock_quantity) : null,
        variations: formData.variations,
        add_ons: formData.add_ons,
      }

      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products"

      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        await loadProducts()
        setIsProductModalOpen(false)
        setEditingProduct(null)
      } else {
        console.error("Failed to save product")
      }
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadProducts()
      } else {
        console.error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const handleToggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: isActive }),
      })

      if (response.ok) {
        await loadProducts()
      } else {
        console.error("Failed to update product status")
      }
    } catch (error) {
      console.error("Error updating product status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading menu management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button onClick={() => openProductModal()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="variations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Variations
          </TabsTrigger>
          <TabsTrigger value="addons" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Add-ons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.is_active}
                        onCheckedChange={(checked) => handleToggleProductStatus(product.id, checked)}
                      />
                      <Button variant="ghost" size="sm" onClick={() => openProductModal(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">${product.price}</span>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  {product.variations && product.variations.length > 0 && (
                    <div className="text-xs text-gray-500">Variations: {product.variations.length}</div>
                  )}
                  {product.add_ons && product.add_ons.length > 0 && (
                    <div className="text-xs text-gray-500">Add-ons: {product.add_ons.length}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="text-center py-8">
            <p className="text-gray-500">Category management coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="variations">
          <div className="text-center py-8">
            <p className="text-gray-500">Variation management coming soon...</p>
          </div>
        </TabsContent>

        <TabsContent value="addons">
          <div className="text-center py-8">
            <p className="text-gray-500">Add-on management coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Product name"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Product description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Available</Label>
                </div>
              </div>
            </div>

            {/* Variations Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Variations</h3>
              <p className="text-sm text-gray-600">Select which variations apply to this product</p>

              <div className="max-h-40 overflow-y-auto border rounded-lg p-4 space-y-3">
                {variations
                  .filter((v) => v.is_active)
                  .map((variation) => (
                    <div key={variation.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`variation-${variation.id}`}
                        checked={formData.variations.includes(variation.id)}
                        onCheckedChange={(checked) => handleVariationToggle(variation.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`variation-${variation.id}`} className="text-sm font-medium">
                          {variation.name}
                        </Label>
                        <div className="text-xs text-gray-500">
                          {variation.type} • {variation.price_modifier >= 0 ? "+" : ""}${variation.price_modifier}
                        </div>
                      </div>
                    </div>
                  ))}
                {variations.filter((v) => v.is_active).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No variations available. Create some variations first.
                  </p>
                )}
              </div>
            </div>

            {/* Add-ons Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add-ons</h3>
              <p className="text-sm text-gray-600">Select which add-ons are available for this product</p>

              <div className="max-h-40 overflow-y-auto border rounded-lg p-4 space-y-3">
                {addOns
                  .filter((a) => a.is_active)
                  .map((addOn) => (
                    <div key={addOn.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`addon-${addOn.id}`}
                        checked={formData.add_ons.includes(addOn.id)}
                        onCheckedChange={(checked) => handleAddOnToggle(addOn.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`addon-${addOn.id}`} className="text-sm font-medium">
                          {addOn.name}
                        </Label>
                        <div className="text-xs text-gray-500">
                          {addOn.description && `${addOn.description} • `}${addOn.price}
                        </div>
                      </div>
                    </div>
                  ))}
                {addOns.filter((a) => a.is_active).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No add-ons available. Create some add-ons first.
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>{editingProduct ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
