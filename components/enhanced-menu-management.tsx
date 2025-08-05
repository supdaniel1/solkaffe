"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

export function EnhancedMenuManagement() {
  const { toast } = useToast()

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
      toast({
        title: "Error",
        description: "Failed to load menu data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      } else {
        // Fallback categories
        setCategories([
          { id: "1", name: "ESPRESSO", description: "Espresso-based drinks", display_order: 1, is_active: true },
          { id: "2", name: "COLD_DRINKS", description: "Cold beverages", display_order: 2, is_active: true },
          { id: "3", name: "TEA", description: "Tea-based drinks", display_order: 3, is_active: true },
          { id: "4", name: "PASTRIES", description: "Baked goods", display_order: 4, is_active: true },
        ])
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadVariations = async () => {
    try {
      const response = await fetch("/api/admin/variations")
      if (response.ok) {
        const data = await response.json()
        setVariations(data.data || [])
      } else {
        // Fallback variations
        setVariations([
          { id: "1", name: "Small", type: "size", price_modifier: -10, is_active: true },
          { id: "2", name: "Medium", type: "size", price_modifier: 0, is_active: true },
          { id: "3", name: "Large", type: "size", price_modifier: 15, is_active: true },
          { id: "4", name: "Hot", type: "temperature", price_modifier: 0, is_active: true },
          { id: "5", name: "Iced", type: "temperature", price_modifier: 5, is_active: true },
        ])
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
      } else {
        // Fallback add-ons
        setAddOns([
          {
            id: "1",
            name: "Extra Shot",
            description: "Additional espresso shot",
            price: 15,
            max_quantity: 3,
            is_active: true,
          },
          {
            id: "2",
            name: "Vanilla Syrup",
            description: "Sweet vanilla flavoring",
            price: 10,
            max_quantity: 2,
            is_active: true,
          },
          {
            id: "3",
            name: "Caramel Syrup",
            description: "Rich caramel flavoring",
            price: 10,
            max_quantity: 2,
            is_active: true,
          },
          {
            id: "4",
            name: "Extra Foam",
            description: "Additional milk foam",
            price: 5,
            max_quantity: 1,
            is_active: true,
          },
          {
            id: "5",
            name: "Oat Milk",
            description: "Plant-based milk alternative",
            price: 12,
            max_quantity: 1,
            is_active: true,
          },
        ])
      }
    } catch (error) {
      console.error("Error loading add-ons:", error)
    }
  }

  // Form handlers
  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleVariationToggle = (variationId: string) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.includes(variationId)
        ? prev.variations.filter((id) => id !== variationId)
        : [...prev.variations, variationId],
    }))
  }

  const handleAddOnToggle = (addOnId: string) => {
    setFormData((prev) => ({
      ...prev,
      add_ons: prev.add_ons.includes(addOnId)
        ? prev.add_ons.filter((id) => id !== addOnId)
        : [...prev.add_ons, addOnId],
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
        image_url: formData.image_url,
        is_active: formData.is_active,
        rating: Number.parseFloat(formData.rating) || null,
        prep_time: Number.parseInt(formData.prep_time) || null,
        stock_quantity: Number.parseInt(formData.stock_quantity) || null,
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
        toast({
          title: "Success",
          description: `Product ${editingProduct ? "updated" : "created"} successfully`,
        })
        setIsProductModalOpen(false)
        loadProducts()
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
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading menu management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Menu Management</h2>
        <Button onClick={() => openProductModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="variations">Variations</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openProductModal(product)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">₱{product.price}</span>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                  {(product.variations?.length || product.add_ons?.length) && (
                    <div className="mt-2 flex gap-1">
                      {product.variations?.length && (
                        <Badge variant="secondary" className="text-xs">
                          {product.variations.length} variations
                        </Badge>
                      )}
                      {product.add_ons?.length && (
                        <Badge variant="secondary" className="text-xs">
                          {product.add_ons.length} add-ons
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="mt-3">
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={() => handleToggleProductStatus(product.id, product.is_active)}
                    />
                    <span className="ml-2 text-sm">Available</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {category.name}
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Display Order: {category.display_order}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="variations">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {variations.map((variation) => (
              <Card key={variation.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {variation.name}
                    <Badge variant={variation.is_active ? "default" : "secondary"}>
                      {variation.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Type: </span>
                      <Badge variant="outline">{variation.type}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Price Modifier: </span>
                      <span className={`text-sm ${variation.price_modifier >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {variation.price_modifier >= 0 ? "+" : ""}₱{variation.price_modifier}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="addons">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {addOns.map((addOn) => (
              <Card key={addOn.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {addOn.name}
                    <Badge variant={addOn.is_active ? "default" : "secondary"}>
                      {addOn.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{addOn.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">₱{addOn.price}</span>
                      <span className="text-xs text-muted-foreground">Max: {addOn.max_quantity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

              <div className="grid gap-4 md:grid-cols-2">
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
                  <Label htmlFor="price">Price (₱)</Label>
                  <Input
                    id="price"
                    type="number"
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

              <div className="grid gap-4 md:grid-cols-2">
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

                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange("image_url", e.target.value)}
                    placeholder="/images/product.jpg"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => handleInputChange("rating", e.target.value)}
                    placeholder="4.5"
                  />
                </div>

                <div>
                  <Label htmlFor="prep_time">Prep Time (min)</Label>
                  <Input
                    id="prep_time"
                    type="number"
                    value={formData.prep_time}
                    onChange={(e) => handleInputChange("prep_time", e.target.value)}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange("stock_quantity", e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Label htmlFor="is_active">Available</Label>
              </div>
            </div>

            {/* Variations Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Variations</h3>
              <p className="text-sm text-muted-foreground">Select which variations apply to this product</p>

              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                {variations
                  .filter((v) => v.is_active)
                  .map((variation) => (
                    <div key={variation.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`variation-${variation.id}`}
                        checked={formData.variations.includes(variation.id)}
                        onChange={() => handleVariationToggle(variation.id)}
                        className="rounded"
                      />
                      <Label htmlFor={`variation-${variation.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>{variation.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {variation.type}
                            </Badge>
                            <span
                              className={`text-xs ${variation.price_modifier >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {variation.price_modifier >= 0 ? "+" : ""}₱{variation.price_modifier}
                            </span>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Add-ons Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add-ons</h3>
              <p className="text-sm text-muted-foreground">Select which add-ons are available for this product</p>

              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                {addOns
                  .filter((a) => a.is_active)
                  .map((addOn) => (
                    <div key={addOn.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`addon-${addOn.id}`}
                        checked={formData.add_ons.includes(addOn.id)}
                        onChange={() => handleAddOnToggle(addOn.id)}
                        className="rounded"
                      />
                      <Label htmlFor={`addon-${addOn.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{addOn.name}</span>
                            {addOn.description && <p className="text-xs text-muted-foreground">{addOn.description}</p>}
                          </div>
                          <span className="text-sm font-medium">₱{addOn.price}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>{editingProduct ? "Update" : "Create"} Product</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
