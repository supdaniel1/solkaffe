// Enhanced type definitions for the new menu structure

export interface MainCategory {
  id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: string
  main_category_id: string
  name: string
  description?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  main_category?: MainCategory
  products?: Product[]
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  main_category_id: string
  subcategory_id?: string
  image_url?: string
  is_active: boolean
  is_featured: boolean
  rating?: number
  prep_time?: number
  stock_quantity?: number
  tags?: string[]
  created_at: string
  updated_at: string
  main_category?: MainCategory
  subcategory?: Subcategory
  variations?: Variation[]
  add_ons?: AddOn[]
}

export interface Variation {
  id: string
  name: string
  type: string
  price_modifier: number
  is_active: boolean
  created_at: string
}

export interface AddOn {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  max_quantity: number
  is_active: boolean
  created_at: string
}

export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedVariations: Variation[]
  selectedAddOns: { addOn: AddOn; quantity: number }[]
  total: number
  notes?: string
}

export interface MenuStructure {
  main_categories: MainCategory[]
  featured_products: Product[]
  total_products: number
  variations: Variation[]
  add_ons: AddOn[]
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  main_category_id: string
  subcategory_id: string
  image_url: string
  is_active: boolean
  is_featured: boolean
  rating?: number
  prep_time?: number
  stock_quantity?: number
  tags: string[]
  variation_ids: string[]
  add_on_ids: string[]
}

export interface ImageUploadResponse {
  success: boolean
  url?: string
  error?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
