// Enhanced type definitions for the new menu structure

export interface MainCategory {
  id: string
  name: string
  description?: string
  icon?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  description?: string
  main_category_id: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  products?: Product[]
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  main_category_id: string
  subcategory_id: string
  is_active: boolean
  is_featured: boolean
  rating: number
  prep_time: number
  stock_quantity: number
  tags?: string[]
  created_at: string
  updated_at: string
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
  updated_at: string
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
  updated_at: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
  variations?: { id: string; name: string; price_modifier: number }[]
  add_ons?: { id: string; name: string; price: number; quantity: number }[]
  total: number
}

export interface Order {
  id: string
  customer_name?: string
  total: number
  status: "pending" | "preparing" | "ready" | "completed" | "cancelled"
  payment_method: string
  items: CartItem[]
  created_at: string
  updated_at: string
}
