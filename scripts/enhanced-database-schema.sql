-- Enhanced database schema for cafe ordering system
-- This creates all necessary tables for products, categories, variations, and add-ons

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Variations table (size, temperature, milk type etc.)
CREATE TABLE IF NOT EXISTS variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'size', 'temperature', 'milk_type', etc.
  price_modifier DECIMAL(10,2) DEFAULT 0,
  options JSONB DEFAULT '[]'::jsonb, -- Additional options/metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add-ons table (syrups, toppings, extras)
CREATE TABLE IF NOT EXISTS add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category VARCHAR(50) NOT NULL, -- 'syrup', 'topping', 'extra', etc.
  max_quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (enhanced)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  sku VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  nutritional_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for product variations
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variation_id UUID REFERENCES variations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, variation_id)
);

-- Junction table for product add-ons
CREATE TABLE IF NOT EXISTS product_add_ons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  add_on_id UUID REFERENCES add_ons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, add_on_id)
);

-- Orders table (enhanced)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(200),
  customer_email VARCHAR(200),
  customer_phone VARCHAR(50),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_type VARCHAR(50) DEFAULT 'pickup', -- 'pickup', 'delivery', 'dine_in'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table (enhanced)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(200) NOT NULL, -- Store name for historical reference
  base_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  variations JSONB DEFAULT '[]'::jsonb, -- Selected variations with prices
  add_ons JSONB DEFAULT '[]'::jsonb, -- Selected add-ons with prices
  item_total DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description, color, sort_order) VALUES
  ('Coffee', 'Hot and cold coffee beverages', '#8B4513', 1),
  ('Tea', 'Various tea selections', '#228B22', 2),
  ('Pastries', 'Fresh baked goods', '#FFD700', 3),
  ('Sandwiches', 'Light meals and sandwiches', '#FF6347', 4),
  ('Desserts', 'Sweet treats and desserts', '#FF69B4', 5),
  ('Beverages', 'Non-coffee beverages', '#4169E1', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert default variations
INSERT INTO variations (name, type, price_modifier) VALUES
  -- Sizes
  ('Small', 'size', 0.00),
  ('Medium', 'size', 0.50),
  ('Large', 'size', 1.00),
  ('Extra Large', 'size', 1.50),
  
  -- Temperatures
  ('Hot', 'temperature', 0.00),
  ('Iced', 'temperature', 0.00),
  ('Extra Hot', 'temperature', 0.00),
  
  -- Milk Types
  ('Regular Milk', 'milk_type', 0.00),
  ('Oat Milk', 'milk_type', 0.60),
  ('Almond Milk', 'milk_type', 0.50),
  ('Soy Milk', 'milk_type', 0.50),
  ('Coconut Milk', 'milk_type', 0.60),
  ('No Milk', 'milk_type', 0.00),
  
  -- Intensity
  ('Regular', 'intensity', 0.00),
  ('Decaf', 'intensity', 0.00),
  ('Extra Shot', 'intensity', 0.75),
  ('Double Shot', 'intensity', 1.50)
ON CONFLICT DO NOTHING;

-- Insert default add-ons
INSERT INTO add_ons (name, price, category, max_quantity) VALUES
  -- Syrups
  ('Vanilla Syrup', 0.50, 'syrup', 3),
  ('Caramel Syrup', 0.50, 'syrup', 3),
  ('Hazelnut Syrup', 0.50, 'syrup', 3),
  ('Sugar-Free Vanilla', 0.50, 'syrup', 3),
  ('Cinnamon Syrup', 0.50, 'syrup', 3),
  
  -- Toppings
  ('Whipped Cream', 0.75, 'topping', 2),
  ('Extra Foam', 0.00, 'topping', 1),
  ('Cinnamon Powder', 0.25, 'topping', 1),
  ('Cocoa Powder', 0.25, 'topping', 1),
  
  -- Extras
  ('Extra Shot', 0.75, 'extra', 3),
  ('Decaf', 0.00, 'extra', 1),
  ('Half Caff', 0.00, 'extra', 1),
  ('Extra Hot', 0.00, 'extra', 1),
  ('Light Ice', 0.00, 'extra', 1),
  ('Extra Ice', 0.00, 'extra', 1)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Enable Row Level Security (RLS) - uncomment if using Supabase auth
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE variations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_add_ons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust based on your needs)
-- CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON variations FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON add_ons FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON products FOR SELECT USING (is_active = true);
-- CREATE POLICY "Public read access" ON product_variations FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON product_add_ons FOR SELECT USING (true);
