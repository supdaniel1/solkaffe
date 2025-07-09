"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  RefreshCw,
  Search,
  Package,
  Tag,
  Settings,
  Coffee,
  CheckCircle,
  XCircle,
  Power,
  PowerOff,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import type { Product, Category, Variation, AddOn } from "@/lib/supabase"

// Helper to safely parse JSON
const parseJSONSafe = async (response: Response) => {
  const ct = response.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    return response.json()
  }
  // fallback to plain text for non-JSON (e.g. HTML error pages)
  return { error: await response.text() }
}

interface EnhancedMenuManagementProps {
  products: Product[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}

interface FormData {
  products: Partial<Product> & {
    variations?: string[]
    add_ons?: string[]
  }
  categories: Partial<Category>
  variations: Partial<Variation>
  addOns: Partial<AddOn>
}

interface ToastNotification {
  id: string
  type: "success" | "error" | "info"
  title: string
  message: string
}

export function EnhancedMenuManagement({ products, loading, error, onRefresh }: EnhancedMenuManagementProps) {
  const { toast } = useToast()
  const { getAuthHeaders } = useAdminAuth()
  const scrollPositionRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const [localProducts, setLocalProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [variations, setVariations] = useState<Variation[]>([])
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [notifications, setNotifications] = useState<ToastNotification[]>([])
  const [toggleLoading, setToggleLoading] = useState<{ [key: string]: boolean }>({})

  const [loadingStates, setLoadingStates] = useState({
    categories: false,
    variations: false,
    addOns: false,
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showInactive, setShowInactive] = useState(false)

  const [editingItem, setEditingItem] = useState<{
    type: "products" | "categories" | "variations" | "addOns"
    id: string | null
    data: any
  } | null>(null)

  const [formData, setFormData] = useState<FormData>({
    products: {},
    categories: {},
    variations: {},
    addOns: {},
  })

  // Update local products when props change
  useEffect(() => {
    setLocalProducts(products)
  }, [products])

  // Save scroll position before updates
  const saveScrollPosition = useCallback(() => {
    if (containerRef.current) {
      scrollPositionRef.current = containerRef.current.scrollTop
    } else {
      scrollPositionRef.current = window.scrollY
    }
  }, [])

  // Restore scroll position after updates
  const restoreScrollPosition = useCallback(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = scrollPositionRef.current
      } else {
        window.scrollTo(0, scrollPositionRef.current)
      }
    }, 100)
  }, [])

  // Enhanced notification system
  const showNotification = (type: "success" | "error" | "info", title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: ToastNotification = { id, type, title, message }

    setNotifications((prev) => [...prev, notification])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  // Toggle availability function with proper state management
  const toggleAvailability = async (type: "products" | "categories" | "variations" | "addOns", item: any) => {
    const toggleKey = `${type}-${item.id}`

    try {
      setToggleLoading((prev) => ({ ...prev, [toggleKey]: true }))
      saveScrollPosition()

      const newActiveState = !item.is_active
      const endpoint = `/api/admin/${type}/${item.id}`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, is_active: newActiveState }),
      })

      const payload = await parseJSONSafe(response)

      if (!response.ok) {
        throw new Error(typeof payload === "string" ? payload : payload.details || payload.error || response.statusText)
      }

      // Update local state immediately with the response data
      if (type === "products") {
        setLocalProducts((prev) =>
          prev.map((product) => (product.id === item.id ? { ...product, is_active: newActiveState } : product)),
        )
      } else if (type === "categories") {
        setCategories((prev) =>
          prev.map((category) => (category.id === item.id ? { ...category, is_active: newActiveState } : category)),
        )
      } else if (type === "variations") {
        setVariations((prev) =>
          prev.map((variation) => (variation.id === item.id ? { ...variation, is_active: newActiveState } : variation)),
        )
      } else if (type === "addOns") {
        setAddOns((prev) =>
          prev.map((addOn) => (addOn.id === item.id ? { ...addOn, is_active: newActiveState } : addOn)),
        )
      }

      showNotification(
        "success",
        "Status Updated",
        `${item.name} is now ${newActiveState ? "available" : "unavailable"}`,
      )

      restoreScrollPosition()
    } catch (error) {
      console.error(`Error toggling ${type} availability:`, error)
      showNotification("error", "Update Failed", `Failed to update ${item.name} availability`)
    } finally {
      setToggleLoading((prev) => ({ ...prev, [toggleKey]: false }))
    }
  }

  // Fetch additional data
  const fetchCategories = async () => {
    setLoadingStates((prev) => ({ ...prev, categories: true }))
    try {
      const response = await fetch("/api/admin/categories", {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      showNotification("error", "Fetch Error", "Failed to fetch categories")
    } finally {
      setLoadingStates((prev) => ({ ...prev, categories: false }))
    }
  }

  const fetchVariations = async () => {
    setLoadingStates((prev) => ({ ...prev, variations: true }))
    try {
      const response = await fetch("/api/admin/variations", {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setVariations(data.data || [])
    } catch (error) {
      console.error("Error fetching variations:", error)
      showNotification("error", "Fetch Error", "Failed to fetch variations")
    } finally {
      setLoadingStates((prev) => ({ ...prev, variations: false }))
    }
  }

  const fetchAddOns = async () => {
    setLoadingStates((prev) => ({ ...prev, addOns: true }))
    try {
      const response = await fetch("/api/admin/add-ons", {
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setAddOns(data.data || [])
    } catch (error) {
      console.error("Error fetching add-ons:", error)
      showNotification("error", "Fetch Error", "Failed to fetch add-ons")
    } finally {
      setLoadingStates((prev) => ({ ...prev, addOns: false }))
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchCategories()
    fetchVariations()
    fetchAddOns()
  }, [])

  // Filter products using local state
  const filteredProducts = localProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || product.category === filterCategory
    const matchesActive = showInactive || product.is_active

    return matchesSearch && matchesCategory && matchesActive
  })

  // Handle form submission with proper state updates
  const handleSubmit = async (type: "products" | "categories" | "variations" | "addOns") => {
    try {
      saveScrollPosition()

      const data = formData[type]
      const isEditing = editingItem?.id

      const endpoint = `/api/admin/${type}${isEditing ? `/${editingItem.id}` : ""}`
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const payload = await parseJSONSafe(response)

      if (!response.ok) {
        throw new Error(typeof payload === "string" ? payload : payload.details || payload.error || response.statusText)
      }

      showNotification("success", "Success", `${type.slice(0, -1)} ${isEditing ? "updated" : "created"} successfully`)

      // Update local state immediately
      if (type === "products") {
        if (isEditing) {
          setLocalProducts((prev) => prev.map((product) => (product.id === editingItem.id ? payload.data : product)))
        } else {
          setLocalProducts((prev) => [payload.data, ...prev])
        }
        // Also refresh from server to ensure consistency
        onRefresh()
      } else if (type === "categories") {
        if (isEditing) {
          setCategories((prev) => prev.map((category) => (category.id === editingItem.id ? payload.data : category)))
        } else {
          setCategories((prev) => [payload.data, ...prev])
        }
      } else if (type === "variations") {
        if (isEditing) {
          setVariations((prev) => prev.map((variation) => (variation.id === editingItem.id ? payload.data : variation)))
        } else {
          setVariations((prev) => [payload.data, ...prev])
        }
      } else if (type === "addOns") {
        if (isEditing) {
          setAddOns((prev) => prev.map((addOn) => (addOn.id === editingItem.id ? payload.data : addOn)))
        } else {
          setAddOns((prev) => [payload.data, ...prev])
        }
      }

      // Reset form and refresh data
      setEditingItem(null)
      setFormData((prev) => ({ ...prev, [type]: {} }))

      restoreScrollPosition()
    } catch (error) {
      console.error(`Error saving ${type}:`, error)
      showNotification(
        "error",
        "Save Failed",
        error instanceof Error ? error.message : `Failed to save ${type.slice(0, -1)}`,
      )
    }
  }

  // Handle edit
  const handleEdit = (type: "products" | "categories" | "variations" | "addOns", item: any) => {
    setEditingItem({ type, id: item.id, data: item })

    if (type === "products") {
      // Initialize with existing variations and add-ons if available
      setFormData((prev) => ({
        ...prev,
        [type]: {
          ...item,
          variations: item.variations || [],
          add_ons: item.add_ons || [],
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [type]: { ...item } }))
    }
  }

  // Handle delete with proper state updates
  const handleDelete = async (type: "products" | "categories" | "variations" | "addOns", id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      saveScrollPosition()

      const response = await fetch(`/api/admin/${type}/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      })

      const payload = await parseJSONSafe(response)

      if (!response.ok) {
        throw new Error(typeof payload === "string" ? payload : payload.details || payload.error || response.statusText)
      }

      showNotification("success", "Deleted Successfully", `"${name}" has been permanently deleted`)

      // Update local state immediately
      if (type === "products") {
        setLocalProducts((prev) => prev.filter((product) => product.id !== id))
        // Also refresh from server to ensure consistency
        onRefresh()
      } else if (type === "categories") {
        setCategories((prev) => prev.filter((category) => category.id !== id))
      } else if (type === "variations") {
        setVariations((prev) => prev.filter((variation) => variation.id !== id))
      } else if (type === "addOns") {
        setAddOns((prev) => prev.filter((addOn) => addOn.id !== id))
      }

      restoreScrollPosition()
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      showNotification("error", "Delete Failed", error instanceof Error ? error.message : `Failed to delete "${name}"`)
    }
  }

  // Handle variation selection
  const handleVariationToggle = (variationId: string, checked: boolean) => {
    setFormData((prev) => {
      const currentVariations = prev.products.variations || []
      const newVariations = checked
        ? [...currentVariations, variationId]
        : currentVariations.filter((id) => id !== variationId)

      return {
        ...prev,
        products: {
          ...prev.products,
          variations: newVariations,
        },
      }
    })
  }

  // Handle add-on selection
  const handleAddOnToggle = (addOnId: string, checked: boolean) => {
    setFormData((prev) => {
      const currentAddOns = prev.products.add_ons || []
      const newAddOns = checked ? [...currentAddOns, addOnId] : currentAddOns.filter((id) => id !== addOnId)

      return {
        ...prev,
        products: {
          ...prev.products,
          add_ons: newAddOns,
        },
      }
    })
  }

  if (error) {
    return (
      <Card className="bg-white border-0 shadow-sm rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load menu data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onRefresh} className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Enhanced Notification System */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 300, scale: 0.3 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.5 }}
                className={`p-4 rounded-xl shadow-lg border-l-4 bg-white min-w-80 ${
                  notification.type === "success"
                    ? "border-green-500"
                    : notification.type === "error"
                      ? "border-red-500"
                      : "border-blue-500"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {notification.type === "success" && <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />}
                    {notification.type === "error" && <XCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                    {notification.type === "info" && <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />}
                    <div>
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-600">Manage your products, categories, variations, and add-ons</p>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="products" className="rounded-lg">
            <Package className="w-4 h-4 mr-2" />
            Products ({localProducts.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg">
            <Tag className="w-4 h-4 mr-2" />
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="variations" className="rounded-lg">
            <Settings className="w-4 h-4 mr-2" />
            Variations ({variations.length})
          </TabsTrigger>
          <TabsTrigger value="addons" className="rounded-lg">
            <Coffee className="w-4 h-4 mr-2" />
            Add-ons ({addOns.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48 border-gray-200 rounded-xl">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
                  <Label htmlFor="show-inactive">Show inactive</Label>
                </div>
                <Button
                  onClick={() => {
                    setEditingItem({ type: "products", id: null, data: {} })
                    setFormData((prev) => ({ ...prev, products: { variations: [], add_ons: [] } }))
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredProducts.map((product) => {
                      const toggleKey = `products-${product.id}`
                      const isToggling = toggleLoading[toggleKey]

                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleAvailability("products", product)}
                                  disabled={isToggling}
                                  className={`p-1 rounded-full transition-colors ${
                                    product.is_active
                                      ? "text-green-600 hover:bg-green-50"
                                      : "text-red-600 hover:bg-red-50"
                                  } ${isToggling ? "opacity-50" : ""}`}
                                  title={product.is_active ? "Click to make unavailable" : "Click to make available"}
                                >
                                  {isToggling ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : product.is_active ? (
                                    <Power className="w-4 h-4" />
                                  ) : (
                                    <PowerOff className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-gray-100 text-gray-800 rounded-full">
                                  {product.category}
                                </Badge>
                                <Badge
                                  variant={product.is_active ? "default" : "secondary"}
                                  className={`rounded-full ${
                                    product.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {product.is_active ? "Available" : "Unavailable"}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">₱{product.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit("products", product)}
                              className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete("products", product.id, product.name)}
                              className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl bg-transparent"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <Button
              onClick={() => {
                setEditingItem({ type: "categories", id: null, data: {} })
                setFormData((prev) => ({ ...prev, categories: {} }))
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              {loadingStates.categories ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                  <p className="text-gray-600">Create your first category to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((category) => {
                    const toggleKey = `categories-${category.id}`
                    const isToggling = toggleLoading[toggleKey]

                    return (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleAvailability("categories", category)}
                              disabled={isToggling}
                              className={`p-1 rounded-full transition-colors ${
                                category.is_active ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"
                              } ${isToggling ? "opacity-50" : ""}`}
                              title={category.is_active ? "Click to make unavailable" : "Click to make available"}
                            >
                              {isToggling ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : category.is_active ? (
                                <Power className="w-4 h-4" />
                              ) : (
                                <PowerOff className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          {category.description && <p className="text-sm text-gray-600 mb-2">{category.description}</p>}
                          <Badge
                            variant={category.is_active ? "default" : "secondary"}
                            className={`rounded-full ${
                              category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {category.is_active ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit("categories", category)}
                            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete("categories", category.id, category.name)}
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl bg-transparent"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variations Tab */}
        <TabsContent value="variations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Variations</h3>
            <Button
              onClick={() => {
                setEditingItem({ type: "variations", id: null, data: {} })
                setFormData((prev) => ({ ...prev, variations: {} }))
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Variation
            </Button>
          </div>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              {loadingStates.variations ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading variations...</p>
                </div>
              ) : variations.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No variations found</h3>
                  <p className="text-gray-600">Create variations like sizes, temperatures, etc.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {variations.map((variation) => {
                    const toggleKey = `variations-${variation.id}`
                    const isToggling = toggleLoading[toggleKey]

                    return (
                      <div
                        key={variation.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{variation.name}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleAvailability("variations", variation)}
                              disabled={isToggling}
                              className={`p-1 rounded-full transition-colors ${
                                variation.is_active
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-red-600 hover:bg-red-50"
                              } ${isToggling ? "opacity-50" : ""}`}
                              title={variation.is_active ? "Click to make unavailable" : "Click to make available"}
                            >
                              {isToggling ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : variation.is_active ? (
                                <Power className="w-4 h-4" />
                              ) : (
                                <PowerOff className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">Type: {variation.type}</p>
                          <p className="text-sm text-gray-600">
                            Price modifier: {variation.price_modifier >= 0 ? "+" : ""}₱
                            {variation.price_modifier.toFixed(2)}
                          </p>
                          <Badge
                            variant={variation.is_active ? "default" : "secondary"}
                            className={`mt-2 rounded-full ${
                              variation.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {variation.is_active ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit("variations", variation)}
                            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete("variations", variation.id, variation.name)}
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl bg-transparent"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add-ons Tab */}
        <TabsContent value="addons" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Add-ons</h3>
            <Button
              onClick={() => {
                setEditingItem({ type: "addOns", id: null, data: {} })
                setFormData((prev) => ({ ...prev, addOns: {} }))
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Add-on
            </Button>
          </div>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              {loadingStates.addOns ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading add-ons...</p>
                </div>
              ) : addOns.length === 0 ? (
                <div className="text-center py-8">
                  <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No add-ons found</h3>
                  <p className="text-gray-600">Create add-ons like extra shots, syrups, etc.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addOns.map((addOn) => {
                    const toggleKey = `addOns-${addOn.id}`
                    const isToggling = toggleLoading[toggleKey]

                    return (
                      <div
                        key={addOn.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{addOn.name}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleAvailability("addOns", addOn)}
                              disabled={isToggling}
                              className={`p-1 rounded-full transition-colors ${
                                addOn.is_active ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50"
                              } ${isToggling ? "opacity-50" : ""}`}
                              title={addOn.is_active ? "Click to make unavailable" : "Click to make available"}
                            >
                              {isToggling ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : addOn.is_active ? (
                                <Power className="w-4 h-4" />
                              ) : (
                                <PowerOff className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          {addOn.description && <p className="text-sm text-gray-600 mb-1">{addOn.description}</p>}
                          <p className="text-sm text-gray-600">Price: ₱{addOn.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Max quantity: {addOn.max_quantity}</p>
                          <Badge
                            variant={addOn.is_active ? "default" : "secondary"}
                            className={`mt-2 rounded-full ${
                              addOn.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {addOn.is_active ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit("addOns", addOn)}
                            className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete("addOns", addOn.id, addOn.name)}
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl bg-transparent"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem.id ? "Edit" : "Add"} {editingItem.type.slice(0, -1)}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  className="text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {editingItem.type === "products" && (
                  <>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.products.name || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            products: { ...prev.products, name: e.target.value },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.products.description || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            products: { ...prev.products, description: e.target.value },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.products.price || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            products: { ...prev.products, price: Number.parseFloat(e.target.value) || 0 },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.products.category || ""}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            products: { ...prev.products, category: value },
                          }))
                        }
                      >
                        <SelectTrigger className="border-gray-200 rounded-xl">
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

                    {/* Variations Section */}
                    <div>
                      <Label className="text-base font-medium">Variations</Label>
                      <p className="text-sm text-gray-600 mb-3">Select which variations apply to this product</p>
                      <div className="space-y-3 max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3">
                        {variations
                          .filter((v) => v.is_active)
                          .map((variation) => (
                            <div key={variation.id} className="flex items-center space-x-3">
                              <Checkbox
                                id={`variation-${variation.id}`}
                                checked={(formData.products.variations || []).includes(variation.id)}
                                onCheckedChange={(checked) => handleVariationToggle(variation.id, checked as boolean)}
                              />
                              <Label htmlFor={`variation-${variation.id}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">{variation.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">({variation.type})</span>
                                  </div>
                                  {variation.price_modifier !== 0 && (
                                    <span className="text-sm text-gray-600">
                                      {variation.price_modifier > 0 ? "+" : ""}₱{variation.price_modifier.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </Label>
                            </div>
                          ))}
                        {variations.filter((v) => v.is_active).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No active variations available</p>
                        )}
                      </div>
                    </div>

                    {/* Add-ons Section */}
                    <div>
                      <Label className="text-base font-medium">Add-ons</Label>
                      <p className="text-sm text-gray-600 mb-3">Select which add-ons are available for this product</p>
                      <div className="space-y-3 max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3">
                        {addOns
                          .filter((a) => a.is_active)
                          .map((addOn) => (
                            <div key={addOn.id} className="flex items-center space-x-3">
                              <Checkbox
                                id={`addon-${addOn.id}`}
                                checked={(formData.products.add_ons || []).includes(addOn.id)}
                                onCheckedChange={(checked) => handleAddOnToggle(addOn.id, checked as boolean)}
                              />
                              <Label htmlFor={`addon-${addOn.id}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">{addOn.name}</span>
                                    {addOn.description && (
                                      <span className="text-sm text-gray-500 ml-2">- {addOn.description}</span>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-600">₱{addOn.price.toFixed(2)}</span>
                                </div>
                              </Label>
                            </div>
                          ))}
                        {addOns.filter((a) => a.is_active).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No active add-ons available</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.products.is_active ?? true}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            products: { ...prev.products, is_active: checked },
                          }))
                        }
                      />
                      <Label htmlFor="is_active">Available</Label>
                    </div>
                  </>
                )}

                {editingItem.type === "categories" && (
                  <>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.categories.name || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            categories: { ...prev.categories, name: e.target.value },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.categories.description || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            categories: { ...prev.categories, description: e.target.value },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sort_order">Display Order</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.categories.sort_order || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            categories: { ...prev.categories, sort_order: Number.parseInt(e.target.value) || 0 },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.categories.is_active ?? true}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            categories: { ...prev.categories, is_active: checked },
                          }))
                        }
                      />
                      <Label htmlFor="is_active">Available</Label>
                    </div>
                  </>
                )}

                {editingItem.type === "variations" && (
                  <>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.variations.name || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            variations: { ...prev.variations, name: e.target.value },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Input
                        id="type"
                        value={formData.variations.type || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            variations: { ...prev.variations, type: e.target.value },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                        placeholder="e.g., Size, Temperature"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_modifier">Price Modifier</Label>
                      <Input
                        id="price_modifier"
                        type="number"
                        step="0.01"
                        value={formData.variations.price_modifier || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            variations: { ...prev.variations, price_modifier: Number.parseFloat(e.target.value) || 0 },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.variations.is_active ?? true}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            variations: { ...prev.variations, is_active: checked },
                          }))
                        }
                      />
                      <Label htmlFor="is_active">Available</Label>
                    </div>
                  </>
                )}

                {editingItem.type === "addOns" && (
                  <>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.addOns.name || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            addOns: { ...prev.addOns, name: e.target.value },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.addOns.description || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            addOns: { ...prev.addOns, description: e.target.value },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.addOns.price || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            addOns: { ...prev.addOns, price: Number.parseFloat(e.target.value) || 0 },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_quantity">Max Quantity</Label>
                      <Input
                        id="max_quantity"
                        type="number"
                        value={formData.addOns.max_quantity || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            addOns: { ...prev.addOns, max_quantity: Number.parseInt(e.target.value) || 1 },
                          }))
                        }
                        className="border-gray-200 rounded-xl"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.addOns.is_active ?? true}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            addOns: { ...prev.addOns, is_active: checked },
                          }))
                        }
                      />
                      <Label htmlFor="is_active">Available</Label>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => handleSubmit(editingItem.type)}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingItem.id ? "Update" : "Create"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingItem(null)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
