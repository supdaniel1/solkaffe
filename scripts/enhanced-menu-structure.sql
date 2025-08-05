-- Enhanced menu structure with main categories and subcategories
-- Drop existing tables if they exist
DROP TABLE IF EXISTS product_add_ons CASCADE;
DROP TABLE IF EXISTS product_variations CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS main_categories CASCADE;
DROP TABLE IF EXISTS variations CASCADE;
DROP TABLE IF EXISTS add_ons CASCADE;

-- Main categories table
CREATE TABLE main_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subcategories table
CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    main_category_id INTEGER REFERENCES main_categories(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    main_category_id INTEGER REFERENCES main_categories(id),
    subcategory_id INTEGER REFERENCES subcategories(id),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3, 2) DEFAULT 0,
    prep_time INTEGER DEFAULT 5,
    stock_quantity INTEGER DEFAULT 100,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Variations table
CREATE TABLE variations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- size, temperature, etc.
    price_modifier DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add-ons table
CREATE TABLE add_ons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    max_quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product variations junction table
CREATE TABLE product_variations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variation_id INTEGER REFERENCES variations(id) ON DELETE CASCADE,
    UNIQUE(product_id, variation_id)
);

-- Product add-ons junction table
CREATE TABLE product_add_ons (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    add_on_id INTEGER REFERENCES add_ons(id) ON DELETE CASCADE,
    UNIQUE(product_id, add_on_id)
);

-- Insert main categories
INSERT INTO main_categories (name, description, icon, display_order) VALUES
('Beverages', 'All drink items including coffee, tea, and specialty beverages', 'Coffee', 1),
('Food', 'Food items including waffles, burgers, and other meals', 'UtensilsCrossed', 2);

-- Insert subcategories for Beverages
INSERT INTO subcategories (name, description, main_category_id, display_order) VALUES
('Espresso', 'Classic espresso-based drinks', 1, 1),
('Signature', 'House specialty beverages', 1, 2),
('Matcha', 'Matcha-based drinks and lattes', 1, 3),
('Milk Base', 'Milk-based beverages and smoothies', 1, 4),
('Frappe', 'Blended ice beverages', 1, 5),
('Coffee Frappe', 'Coffee-based blended drinks', 1, 6);

-- Insert subcategories for Food
INSERT INTO subcategories (name, description, main_category_id, display_order) VALUES
('Waffle', 'Belgian waffles and waffle-based dishes', 2, 1),
('Grub', 'Light meals and snacks', 2, 2),
('Rise Up', 'Breakfast and brunch items', 2, 3),
('Burger', 'Gourmet burgers and sandwiches', 2, 4);

-- Insert variations
INSERT INTO variations (name, type, price_modifier) VALUES
('Small', 'size', -15),
('Medium', 'size', 0),
('Large', 'size', 20),
('Hot', 'temperature', 0),
('Iced', 'temperature', 5),
('Extra Hot', 'temperature', 0),
('Decaf', 'coffee_type', 0),
('Single Shot', 'shots', -10),
('Double Shot', 'shots', 0),
('Triple Shot', 'shots', 15);

-- Insert add-ons
INSERT INTO add_ons (name, description, price, category, max_quantity) VALUES
('Extra Shot', 'Additional espresso shot', 15, 'coffee', 3),
('Vanilla Syrup', 'Sweet vanilla flavoring', 10, 'syrup', 2),
('Caramel Syrup', 'Rich caramel flavoring', 10, 'syrup', 2),
('Hazelnut Syrup', 'Nutty hazelnut flavoring', 10, 'syrup', 2),
('Sugar-Free Vanilla', 'Sugar-free vanilla syrup', 10, 'syrup', 2),
('Oat Milk', 'Plant-based oat milk', 15, 'milk', 1),
('Almond Milk', 'Plant-based almond milk', 12, 'milk', 1),
('Soy Milk', 'Plant-based soy milk', 12, 'milk', 1),
('Extra Foam', 'Additional milk foam', 5, 'texture', 1),
('Whipped Cream', 'Fresh whipped cream topping', 15, 'topping', 1),
('Cinnamon Powder', 'Ground cinnamon sprinkle', 5, 'topping', 1),
('Chocolate Drizzle', 'Rich chocolate sauce', 12, 'topping', 1);

-- Insert sample products for Beverages
INSERT INTO products (name, description, price, image_url, main_category_id, subcategory_id, is_featured, rating, prep_time) VALUES
-- Espresso subcategory
('Classic Espresso', 'Rich, bold espresso shot with perfect crema', 89, '/menu-espresso-updated.jpg', 1, 1, true, 4.8, 2),
('Americano', 'Espresso with hot water for a clean, strong taste', 95, '/menu-espresso-updated.jpg', 1, 1, false, 4.6, 2),
('Cappuccino', 'Espresso with steamed milk and thick foam', 115, '/menu-espresso-updated.jpg', 1, 1, true, 4.7, 3),
('Latte', 'Smooth espresso with steamed milk', 125, '/menu-espresso-updated.jpg', 1, 1, true, 4.8, 3),

-- Signature subcategory
('Sol Signature Blend', 'Our house special coffee blend', 135, '/menu-espresso-updated.jpg', 1, 2, true, 4.9, 4),
('Caramel Macchiato', 'Espresso with vanilla and caramel', 145, '/menu-espresso-updated.jpg', 1, 2, true, 4.7, 4),

-- Matcha subcategory
('Matcha Latte', 'Premium matcha with steamed milk', 135, '/menu-matcha-updated.jpg', 1, 3, true, 4.6, 3),
('Iced Matcha', 'Refreshing cold matcha drink', 125, '/menu-matcha-updated.jpg', 1, 3, false, 4.5, 2),

-- Coffee Frappe subcategory
('Classic Coffee Frappe', 'Blended coffee with ice and cream', 155, '/menu-frappucino-updated.jpg', 1, 6, true, 4.8, 5),
('Mocha Frappe', 'Chocolate coffee frappe with whipped cream', 165, '/menu-frappucino-updated.jpg', 1, 6, true, 4.7, 5);

-- Insert sample products for Food
INSERT INTO products (name, description, price, image_url, main_category_id, subcategory_id, is_featured, rating, prep_time) VALUES
-- Waffle subcategory
('Classic Belgian Waffle', 'Crispy waffle with butter and syrup', 185, '/placeholder.svg?height=300&width=200&text=Waffle', 2, 7, true, 4.6, 8),
('Chocolate Waffle', 'Waffle with chocolate chips and sauce', 215, '/placeholder.svg?height=300&width=200&text=Choco+Waffle', 2, 7, true, 4.7, 8),

-- Burger subcategory
('Sol Beef Burger', 'Juicy beef patty with fresh vegetables', 285, '/placeholder.svg?height=300&width=200&text=Burger', 2, 10, true, 4.8, 12),
('Chicken Burger', 'Grilled chicken breast with special sauce', 265, '/placeholder.svg?height=300&width=200&text=Chicken+Burger', 2, 10, false, 4.6, 12),

-- Rise Up subcategory
('Breakfast Sandwich', 'Egg, cheese, and bacon on toasted bread', 165, '/placeholder.svg?height=300&width=200&text=Breakfast', 2, 9, false, 4.5, 6),
('Pancake Stack', 'Three fluffy pancakes with syrup', 195, '/placeholder.svg?height=300&width=200&text=Pancakes', 2, 9, true, 4.7, 10);

-- Create indexes for better performance
CREATE INDEX idx_products_main_category ON products(main_category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_subcategories_main_category ON subcategories(main_category_id);
CREATE INDEX idx_main_categories_active ON main_categories(is_active);
CREATE INDEX idx_subcategories_active ON subcategories(is_active);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_main_categories_updated_at BEFORE UPDATE ON main_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subcategories_updated_at BEFORE UPDATE ON subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_variations_updated_at BEFORE UPDATE ON variations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_add_ons_updated_at BEFORE UPDATE ON add_ons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
