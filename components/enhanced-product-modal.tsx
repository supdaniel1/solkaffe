"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ProductWithRelations, Variation, AddOn } from "@/lib/supabase"
import Image from "next/image"

interface EnhancedProductModalProps {
  product: ProductWithRelations | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: CartItem) => void
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  variations: { [key: string]: Variation }
  addOns: { id: string; name: string; price: number; quantity: number }[]
  customizationNotes: string
  totalPrice: number
}

interface SelectedVariations {
  [type: string]: Variation
}

interface SelectedAddOns {
  [id: string]: { addOn: AddOn; quantity: number }
}

export function EnhancedProductModal({ product, isOpen, onClose, onAddToCart }: EnhancedProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariations, setSelectedVariations] = useState<SelectedVariations>({})
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOns>({})
  const [customizationNotes, setCustomizationNotes] = useState("")
  const [availableVariations, setAvailableVariations] = useState<Variation[]>([])
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([])

  // Fetch available variations and add-ons
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [variationsRes, addOnsRes] = await Promise.all([
          fetch("/api/admin/variations"),
          fetch("/api/admin/add-ons"),
        ])

        if (variationsRes.ok) {
          const variations = await variationsRes.json()
          setAvailableVariations(variations)
        }

        if (addOnsRes.ok) {
          const addOns = await addOnsRes.json()
          setAvailableAddOns(addOns)
        }
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }

    if (isOpen) {
      fetchOptions()
    }
  }, [isOpen])

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1)
      setSelectedVariations({})
      setSelectedAddOns({})
      setCustomizationNotes("")
    }
  }, [product])

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!product) return 0

    let basePrice = product.price

    // Add variation price modifiers
    Object.values(selectedVariations).forEach((variation) => {
      basePrice += variation.price_modifier
    })

    // Add add-on prices
    Object.values(selectedAddOns).forEach(({ addOn, quantity: addOnQty }) => {
      basePrice += addOn.price * addOnQty
    })

    return basePrice * quantity
  }

  const handleVariationChange = (type: string, variationId: string) => {
    const variation = availableVariations.find((v) => v.id === variationId)
    if (variation) {
      setSelectedVariations((prev) => ({
        ...prev,
        [type]: variation,
      }))
    }
  }

  const handleAddOnChange = (addOnId: string, change: number) => {
    setSelectedAddOns((prev) => {
      const current = prev[addOnId]
      const addOn = availableAddOns.find((a) => a.id === addOnId)

      if (!addOn) return prev

      if (!current && change > 0) {
        return {
          ...prev,
          [addOnId]: { addOn, quantity: 1 },
        }
      }

      if (current) {
        const newQuantity = Math.max(0, Math.min(addOn.max_quantity, current.quantity + change))

        if (newQuantity === 0) {
          const { [addOnId]: removed, ...rest } = prev
          return rest
        }

        return {
          ...prev,
          [addOnId]: { ...current, quantity: newQuantity },
        }
      }

      return prev
    })
  }

  const handleAddToCart = () => {
    if (!product) return

    const cartItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      price: product.price,
      quantity,
      variations: selectedVariations,
      addOns: Object.values(selectedAddOns).map(({ addOn, quantity: addOnQty }) => ({
        id: addOn.id,
        name: addOn.name,
        price: addOn.price,
        quantity: addOnQty,
      })),
      customizationNotes,
      totalPrice: calculateTotalPrice(),
    }

    onAddToCart(cartItem)
    onClose()
  }

  // Group variations by type
  const variationsByType = availableVariations.reduce(
    (acc, variation) => {
      if (!acc[variation.type]) {
        acc[variation.type] = []
      }
      acc[variation.type].push(variation)
      return acc
    },
    {} as Record<string, Variation[]>,
  )

  // Group add-ons by category
  const addOnsByCategory = availableAddOns.reduce(
    (acc, addOn) => {
      const category = addOn.category || "other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(addOn)
      return acc
    },
    {} as Record<string, AddOn[]>,
  )

  if (!product) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative">
              <div className="h-64 overflow-hidden rounded-t-2xl">
                <Image src={product.image_url || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-green-800">{product.name}</h2>
                  <Badge className="bg-green-100 text-green-800">{product.category}</Badge>
                </div>
                <p className="text-green-600 mb-4">{product.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-green-700">${product.price.toFixed(2)}</span>
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex gap-1">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Variations */}
              {Object.keys(variationsByType).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-800">Customize Your Order</h3>
                  {Object.entries(variationsByType).map(([type, variations]) => (
                    <div key={type} className="space-y-2">
                      <label className="text-sm font-medium text-green-700 capitalize">{type.replace("_", " ")}</label>
                      <Select
                        value={selectedVariations[type]?.id || ""}
                        onValueChange={(value) => handleVariationChange(type, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${type.replace("_", " ")}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {variations.map((variation) => (
                            <SelectItem key={variation.id} value={variation.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{variation.name}</span>
                                {variation.price_modifier !== 0 && (
                                  <span className="ml-2 text-sm text-green-600">
                                    {variation.price_modifier > 0 ? "+" : ""}${variation.price_modifier.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}

              {/* Add-ons */}
              {Object.keys(addOnsByCategory).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-800">Add-ons</h3>
                  {Object.entries(addOnsByCategory).map(([category, addOns]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-sm font-medium text-green-700 capitalize">{category.replace("_", " ")}</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {addOns.map((addOn) => {
                          const selected = selectedAddOns[addOn.id]
                          const quantity = selected?.quantity || 0

                          return (
                            <Card key={addOn.id} className="border-green-200">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-green-800">{addOn.name}</span>
                                      <span className="text-green-600">${addOn.price.toFixed(2)}</span>
                                    </div>
                                    {addOn.description && (
                                      <p className="text-xs text-green-600 mt-1">{addOn.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAddOnChange(addOn.id, -1)}
                                      disabled={quantity === 0}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAddOnChange(addOn.id, 1)}
                                      disabled={quantity >= addOn.max_quantity}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-700">Special Instructions</label>
                <Textarea
                  placeholder="Any special requests or modifications..."
                  value={customizationNotes}
                  onChange={(e) => setCustomizationNotes(e.target.value)}
                  className="border-green-300 focus:border-green-500"
                />
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center justify-between pt-4 border-t border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-green-700">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">${calculateTotalPrice().toFixed(2)}</div>
                  <Button onClick={handleAddToCart} className="bg-green-600 hover:bg-green-700 mt-2">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
