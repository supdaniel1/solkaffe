-- Enhanced Menu Structure with Main Categories and Subcategories
-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS product_variations CASCADE;
DROP TABLE IF EXISTS product_add_ons CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS main_categories CASCADE;
DROP TABLE IF EXISTS variations CASCADE;
DROP TABLE IF EXISTS add_ons CASCADE;

-- Create main categories table
CREATE TABLE main_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    main_category_id UUID NOT NULL REFERENCES main_categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(main_category_id, name)
);

-- Create enhanced products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    main_category_id UUID NOT NULL REFERENCES main_categories(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    prep_time INTEGER, -- in minutes
    stock_quantity INTEGER DEFAULT 0,
    tags TEXT[], -- array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create variations table
CREATE TABLE variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'size', 'temperature', etc.
    price_modifier DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create add-ons table
CREATE TABLE add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category VARCHAR(50), -- 'syrup', 'milk', 'extra', etc.
    max_quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction tables for many-to-many relationships
CREATE TABLE product_variations (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variation_id UUID REFERENCES variations(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, variation_id)
);

CREATE TABLE product_add_ons (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    add_on_id UUID REFERENCES add_ons(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, add_on_id)
);

-- Insert main categories
INSERT INTO main_categories (name, description, display_order) VALUES
('Beverages', 'Coffee, tea, and specialty drinks', 1),
('Food', 'Meals, snacks, and food items', 2);

-- Get main category IDs for subcategories
DO $$
DECLARE
    beverages_id UUID;
    food_id UUID;
BEGIN
    SELECT id INTO beverages_id FROM main_categories WHERE name = 'Beverages';
    SELECT id INTO food_id FROM main_categories WHERE name = 'Food';
    
    -- Insert beverage subcategories
    INSERT INTO subcategories (main_category_id, name, description, display_order) VALUES
    (beverages_id, 'Espresso', 'Classic espresso-based drinks', 1),
    (beverages_id, 'Signature', 'House specialty beverages', 2),
    (beverages_id, 'Matcha', 'Premium matcha drinks', 3),
    (beverages_id, 'Milk Base', 'Creamy milk-based beverages', 4),
    (beverages_id, 'Frappe', 'Blended iced drinks', 5),
    (beverages_id, 'Coffee Frappe', 'Coffee-based blended drinks', 6);
    
    -- Insert food subcategories
    INSERT INTO subcategories (main_category_id, name, description, display_order) VALUES
    (food_id, 'Waffle', 'Fresh waffles and waffle dishes', 1),
    (food_id, 'Grub', 'Hearty comfort food', 2),
    (food_id, 'Rise Up', 'Breakfast and brunch items', 3),
    (food_id, 'Burger', 'Gourmet burgers and sandwiches', 4);
END $$;

-- Insert variations
INSERT INTO variations (name, type, price_modifier) VALUES
('Small', 'size', -15.00),
('Medium', 'size', 0.00),
('Large', 'size', 20.00),
('Extra Large', 'size', 35.00),
('Hot', 'temperature', 0.00),
('Iced', 'temperature', 5.00),
('Blended', 'temperature', 10.00);

-- Insert add-ons
INSERT INTO add_ons (name, description, price, category, max_quantity) VALUES
('Extra Shot', 'Additional espresso shot', 15.00, 'coffee', 3),
('Decaf Shot', 'Decaffeinated espresso shot', 15.00, 'coffee', 3),
('Vanilla Syrup', 'Sweet vanilla flavoring', 10.00, 'syrup', 2),
('Caramel Syrup', 'Rich caramel flavoring', 10.00, 'syrup', 2),
('Hazelnut Syrup', 'Nutty hazelnut flavoring', 10.00, 'syrup', 2),
('Sugar-Free Vanilla', 'Sugar-free vanilla syrup', 12.00, 'syrup', 2),
('Oat Milk', 'Plant-based oat milk', 15.00, 'milk', 1),
('Almond Milk', 'Plant-based almond milk', 12.00, 'milk', 1),
('Coconut Milk', 'Creamy coconut milk', 12.00, 'milk', 1),
('Extra Foam', 'Additional milk foam', 5.00, 'extra', 1),
('Extra Hot', 'Served extra hot', 0.00, 'extra', 1),
('Whipped Cream', 'Fresh whipped cream topping', 15.00, 'topping', 1),
('Cinnamon Powder', 'Aromatic cinnamon dusting', 5.00, 'topping', 1);

-- Sample products for each subcategory
DO $$
DECLARE
    beverages_id UUID;
    food_id UUID;
    espresso_id UUID;
    signature_id UUID;
    matcha_id UUID;
    milk_base_id UUID;
    frappe_id UUID;
    coffee_frappe_id UUID;
    waffle_id UUID;
    grub_id UUID;
    rise_up_id UUID;
    burger_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO beverages_id FROM main_categories WHERE name = 'Beverages';
    SELECT id INTO food_id FROM main_categories WHERE name = 'Food';
    
    -- Get subcategory IDs
    SELECT id INTO espresso_id FROM subcategories WHERE name = 'Espresso';
    SELECT id INTO signature_id FROM subcategories WHERE name = 'Signature';
    SELECT id INTO matcha_id FROM subcategories WHERE name = 'Matcha';
    SELECT id INTO milk_base_id FROM subcategories WHERE name = 'Milk Base';
    SELECT id INTO frappe_id FROM subcategories WHERE name = 'Frappe';
    SELECT id INTO coffee_frappe_id FROM subcategories WHERE name = 'Coffee Frappe';
    SELECT id INTO waffle_id FROM subcategories WHERE name = 'Waffle';
    SELECT id INTO grub_id FROM subcategories WHERE name = 'Grub';
    SELECT id INTO rise_up_id FROM subcategories WHERE name = 'Rise Up';
    SELECT id INTO burger_id FROM subcategories WHERE name = 'Burger';
    
    -- Insert sample beverage products
    INSERT INTO products (name, description, price, main_category_id, subcategory_id, image_url, is_featured, rating, prep_time, stock_quantity, tags) VALUES
    -- Espresso
    ('Americano', 'Classic espresso with hot water', 95.00, beverages_id, espresso_id, '/menu-espresso.jpg', true, 4.5, 3, 100, ARRAY['classic', 'strong']),
    ('Cappuccino', 'Espresso with steamed milk and foam', 120.00, beverages_id, espresso_id, '/menu-espresso.jpg', true, 4.7, 4, 100, ARRAY['creamy', 'classic']),
    ('Latte', 'Smooth espresso with steamed milk', 125.00, beverages_id, espresso_id, '/menu-espresso.jpg', false, 4.6, 4, 100, ARRAY['smooth', 'mild']),
    
    -- Signature
    ('Sol Special Blend', 'Our signature house blend coffee', 140.00, beverages_id, signature_id, '/menu-espresso.jpg', true, 4.8, 5, 50, ARRAY['signature', 'premium']),
    ('Caramel Macchiato', 'Espresso with vanilla and caramel', 155.00, beverages_id, signature_id, '/menu-espresso.jpg', true, 4.7, 5, 75, ARRAY['sweet', 'signature']),
    
    -- Matcha
    ('Matcha Latte', 'Premium Japanese matcha with milk', 145.00, beverages_id, matcha_id, '/menu-matcha.jpg', true, 4.6, 4, 60, ARRAY['matcha', 'healthy']),
    ('Iced Matcha', 'Refreshing iced matcha drink', 135.00, beverages_id, matcha_id, '/menu-matcha.jpg', false, 4.5, 3, 60, ARRAY['matcha', 'refreshing']),
    
    -- Milk Base
    ('Hot Chocolate', 'Rich and creamy hot chocolate', 110.00, beverages_id, milk_base_id, '/menu-espresso.jpg', false, 4.4, 4, 80, ARRAY['chocolate', 'creamy']),
    ('Chai Latte', 'Spiced tea with steamed milk', 125.00, beverages_id, milk_base_id, '/menu-espresso.jpg', false, 4.5, 4, 70, ARRAY['spiced', 'warming']),
    
    -- Frappe
    ('Mango Frappe', 'Tropical mango blended drink', 150.00, beverages_id, frappe_id, '/menu-frappucino.jpg', true, 4.6, 3, 40, ARRAY['tropical', 'refreshing']),
    ('Strawberry Frappe', 'Sweet strawberry blended drink', 145.00, beverages_id, frappe_id, '/menu-frappucino.jpg', false, 4.4, 3, 40, ARRAY['fruity', 'sweet']),
    
    -- Coffee Frappe
    ('Mocha Frappe', 'Coffee and chocolate blended drink', 165.00, beverages_id, coffee_frappe_id, '/menu-frappucino.jpg', true, 4.7, 4, 50, ARRAY['coffee', 'chocolate']),
    ('Caramel Coffee Frappe', 'Coffee frappe with caramel', 170.00, beverages_id, coffee_frappe_id, '/menu-frappucino.jpg', true, 4.8, 4, 45, ARRAY['coffee', 'caramel']);
    
    -- Insert sample food products
    INSERT INTO products (name, description, price, main_category_id, subcategory_id, image_url, is_featured, rating, prep_time, stock_quantity, tags) VALUES
    -- Waffle
    ('Classic Waffle', 'Golden waffle with butter and syrup', 180.00, food_id, waffle_id, '/placeholder.svg?height=300&width=300', true, 4.5, 8, 30, ARRAY['classic', 'sweet']),
    ('Chocolate Waffle', 'Waffle with chocolate chips and sauce', 220.00, food_id, waffle_id, '/placeholder.svg?height=300&width=300', false, 4.6, 10, 25, ARRAY['chocolate', 'indulgent']),
    
    -- Grub
    ('Loaded Nachos', 'Crispy nachos with cheese and toppings', 250.00, food_id, grub_id, '/placeholder.svg?height=300&width=300', true, 4.4, 12, 20, ARRAY['sharing', 'cheesy']),
    ('Buffalo Wings', 'Spicy buffalo chicken wings', 280.00, food_id, grub_id, '/placeholder.svg?height=300&width=300', false, 4.7, 15, 15, ARRAY['spicy', 'chicken']),
    
    -- Rise Up
    ('Breakfast Sandwich', 'Egg, cheese, and bacon on toast', 195.00, food_id, rise_up_id, '/placeholder.svg?height=300&width=300', true, 4.5, 8, 25, ARRAY['breakfast', 'hearty']),
    ('Pancake Stack', 'Fluffy pancakes with syrup', 210.00, food_id, rise_up_id, '/placeholder.svg?height=300&width=300', true, 4.6, 10, 20, ARRAY['breakfast', 'fluffy']),
    
    -- Burger
    ('Classic Cheeseburger', 'Beef patty with cheese and fixings', 320.00, food_id, burger_id, '/placeholder.svg?height=300&width=300', true, 4.7, 12, 15, ARRAY['beef', 'classic']),
    ('Chicken Burger', 'Grilled chicken breast burger', 295.00, food_id, burger_id, '/placeholder.svg?height=300&width=300', false, 4.5, 10, 18, ARRAY['chicken', 'grilled']);
END $$;

-- Create indexes for better performance
CREATE INDEX idx_products_main_category ON products(main_category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_subcategories_main_category ON subcategories(main_category_id);
CREATE INDEX idx_subcategories_active ON subcategories(is_active);
CREATE INDEX idx_main_categories_active ON main_categories(is_active);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_main_categories_updated_at BEFORE UPDATE ON main_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
