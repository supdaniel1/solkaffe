-- Fix database schema to ensure all required columns exist
-- This script will add missing columns and tables if they don't exist

-- Add missing columns to products table if they don't exist
DO $$ 
BEGIN
    -- Add sku column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sku') THEN
        ALTER TABLE products ADD COLUMN sku VARCHAR(100);
    END IF;
    
    -- Add stock_quantity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_quantity') THEN
        ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0;
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
        ALTER TABLE products ADD COLUMN tags TEXT[];
    END IF;
    
    -- Add image_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT '/placeholder.svg?height=300&width=200';
    END IF;
    
    -- Add category_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category_id') THEN
        ALTER TABLE products ADD COLUMN category_id UUID REFERENCES categories(id);
    END IF;
END $$;

-- Create product_variations table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variation_id UUID NOT NULL REFERENCES variations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, variation_id)
);

-- Create product_add_ons table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    add_on_id UUID NOT NULL REFERENCES add_ons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, add_on_id)
);

-- Add missing columns to categories table if they don't exist
DO $$ 
BEGIN
    -- Add sort_order column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
        ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add missing columns to variations table if they don't exist
DO $$ 
BEGIN
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'variations' AND column_name = 'type') THEN
        ALTER TABLE variations ADD COLUMN type VARCHAR(50) DEFAULT 'option';
    END IF;
    
    -- Add price_modifier column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'variations' AND column_name = 'price_modifier') THEN
        ALTER TABLE variations ADD COLUMN price_modifier DECIMAL(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- Add missing columns to add_ons table if they don't exist
DO $$ 
BEGIN
    -- Add max_quantity column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'add_ons' AND column_name = 'max_quantity') THEN
        ALTER TABLE add_ons ADD COLUMN max_quantity INTEGER DEFAULT 1;
    END IF;
    
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'add_ons' AND column_name = 'category') THEN
        ALTER TABLE add_ons ADD COLUMN category VARCHAR(50) DEFAULT 'other';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_variation_id ON product_variations(variation_id);
CREATE INDEX IF NOT EXISTS idx_product_add_ons_product_id ON product_add_ons(product_id);
CREATE INDEX IF NOT EXISTS idx_product_add_ons_add_on_id ON product_add_ons(add_on_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_variations_is_active ON variations(is_active);
CREATE INDEX IF NOT EXISTS idx_add_ons_is_active ON add_ons(is_active);

-- Update existing products to have default values for new columns
UPDATE products SET 
    stock_quantity = 0 
WHERE stock_quantity IS NULL;

UPDATE products SET 
    tags = '{}' 
WHERE tags IS NULL;

UPDATE products SET 
    image_url = '/placeholder.svg?height=300&width=200' 
WHERE image_url IS NULL OR image_url = '';

-- Update existing categories to have default sort_order
UPDATE categories SET 
    sort_order = 0 
WHERE sort_order IS NULL;

-- Update existing variations to have default values
UPDATE variations SET 
    type = 'option' 
WHERE type IS NULL;

UPDATE variations SET 
    price_modifier = 0.00 
WHERE price_modifier IS NULL;

-- Update existing add_ons to have default values
UPDATE add_ons SET 
    max_quantity = 1 
WHERE max_quantity IS NULL;

UPDATE add_ons SET 
    category = 'other' 
WHERE category IS NULL;

COMMIT;
