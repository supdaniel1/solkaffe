-- Enhanced Menu Structure for Sol Kaffé
-- This script creates a hierarchical menu structure with main categories, subcategories, and products

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
    name VARCHAR(100) NOT NULL,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    main_category_id UUID NOT NULL REFERENCES main_categories(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0,
    prep_time INTEGER, -- in minutes
    stock_quantity INTEGER DEFAULT 0,
    tags TEXT[], -- array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create variations table (size, temperature, etc.)
CREATE TABLE variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'size', 'temperature', etc.
    price_modifier DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create add-ons table
CREATE TABLE add_ons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50), -- 'syrup', 'milk', 'topping', etc.
    max_quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Create indexes for better performance
CREATE INDEX idx_products_main_category ON products(main_category_id);
CREATE INDEX idx_products_subcategory ON products(subcategory_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_subcategories_main_category ON subcategories(main_category_id);
CREATE INDEX idx_main_categories_active ON main_categories(is_active);
CREATE INDEX idx_subcategories_active ON subcategories(is_active);

-- Create triggers for updated_at timestamps
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
CREATE TRIGGER update_variations_updated_at BEFORE UPDATE ON variations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_add_ons_updated_at BEFORE UPDATE ON add_ons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert main categories
INSERT INTO main_categories (name, description, display_order) VALUES
('Beverages', 'All drink items including coffee, tea, and specialty beverages', 1),
('Food', 'Food items including waffles, burgers, and other meals', 2);

-- Get the main category IDs for reference
DO $$
DECLARE
    beverages_id UUID;
    food_id UUID;
BEGIN
    SELECT id INTO beverages_id FROM main_categories WHERE name = 'Beverages';
    SELECT id INTO food_id FROM main_categories WHERE name = 'Food';

    -- Insert subcategories for Beverages
    INSERT INTO subcategories (main_category_id, name, description, display_order) VALUES
    (beverages_id, 'Espresso', 'Classic espresso-based drinks', 1),
    (beverages_id, 'Signature', 'House specialty beverages', 2),
    (beverages_id, 'Matcha', 'Matcha-based drinks and lattes', 3),
    (beverages_id, 'Milk Base', 'Milk-based beverages', 4),
    (beverages_id, 'Frappe', 'Blended ice drinks', 5),
    (beverages_id, 'Coffee Frappe', 'Coffee-based blended drinks', 6);

    -- Insert subcategories for Food
    INSERT INTO subcategories (main_category_id, name, description, display_order) VALUES
    (food_id, 'Waffle', 'Belgian waffles and waffle-based dishes', 1),
    (food_id, 'Grub', 'Light meals and snacks', 2),
    (food_id, 'Rise Up', 'Breakfast and brunch items', 3),
    (food_id, 'Burger', 'Gourmet burgers and sandwiches', 4);
END $$;

-- Insert variations
INSERT INTO variations (name, type, price_modifier) VALUES
('Small', 'size', -15),
('Medium', 'size', 0),
('Large', 'size', 20),
('Hot', 'temperature', 0),
('Iced', 'temperature', 5);

-- Insert add-ons
INSERT INTO add_ons (name, description, price, category, max_quantity) VALUES
('Extra Shot', 'Additional espresso shot', 15, 'coffee', 3),
('Vanilla Syrup', 'Sweet vanilla flavoring', 10, 'syrup', 2),
('Caramel Syrup', 'Rich caramel flavoring', 10, 'syrup', 2),
('Hazelnut Syrup', 'Nutty hazelnut flavoring', 10, 'syrup', 2),
('Oat Milk', 'Plant-based oat milk', 15, 'milk', 1),
('Almond Milk', 'Plant-based almond milk', 15, 'milk', 1),
('Soy Milk', 'Plant-based soy milk', 15, 'milk', 1),
('Whipped Cream', 'Fresh whipped cream topping', 15, 'topping', 1),
('Extra Foam', 'Additional milk foam', 5, 'topping', 1),
('Decaf', 'Decaffeinated coffee option', 0, 'coffee', 1);

-- Insert sample products
DO $$
DECLARE
    beverages_id UUID;
    food_id UUID;
    espresso_id UUID;
    signature_id UUID;
    matcha_id UUID;
    coffee_frappe_id UUID;
    waffle_id UUID;
    burger_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO beverages_id FROM main_categories WHERE name = 'Beverages';
    SELECT id INTO food_id FROM main_categories WHERE name = 'Food';
    
    -- Get subcategory IDs
    SELECT id INTO espresso_id FROM subcategories WHERE name = 'Espresso';
    SELECT id INTO signature_id FROM subcategories WHERE name = 'Signature';
    SELECT id INTO matcha_id FROM subcategories WHERE name = 'Matcha';
    SELECT id INTO coffee_frappe_id FROM subcategories WHERE name = 'Coffee Frappe';
    SELECT id INTO waffle_id FROM subcategories WHERE name = 'Waffle';
    SELECT id INTO burger_id FROM subcategories WHERE name = 'Burger';

    -- Insert Espresso products
    INSERT INTO products (name, description, price, main_category_id, subcategory_id, image_url, is_featured, rating, prep_time, stock_quantity, tags) VALUES
    ('Classic Espresso', 'Rich, bold espresso shot with perfect crema', 89, beverages_id, espresso_id, '/menu-espresso-updated.jpg', true, 4.8, 2, 100, ARRAY['coffee', 'espresso', 'hot']),
    ('Americano', 'Espresso with hot water for a clean, strong taste', 95, beverages_id, espresso_id, '/menu-espresso-updated.jpg', false, 4.6, 2, 100, ARRAY['coffee', 'espresso', 'hot']),
    ('Cappuccino', 'Espresso with steamed milk and thick foam', 115, beverages_id, espresso_id, '/menu-espresso-updated.jpg', true, 4.7, 3, 100, ARRAY['coffee', 'espresso', 'milk', 'hot']),
    ('Latte', 'Smooth espresso with steamed milk', 125, beverages_id, espresso_id, '/menu-espresso-updated.jpg', true, 4.8, 3, 100, ARRAY['coffee', 'espresso', 'milk', 'hot']),
    ('Macchiato', 'Espresso marked with a dollop of foamed milk', 105, beverages_id, espresso_id, '/menu-espresso-updated.jpg', false, 4.5, 2, 100, ARRAY['coffee', 'espresso', 'milk', 'hot']);

    -- Insert Signature products
    INSERT INTO products (name, description, price, main_category_id, subcategory_id, image_url, is_featured, rating, prep_time, stock_quantity, tags) VALUES
    ('Sol Signature Blend', 'Our house special coffee blend', 135, beverages_id, signature_id, '/menu-espresso-updated.jpg', true, 4.9, 4, 100, ARRAY['coffee', 'signature', 'hot']),
    ('Caramel Macchiato', 'Espresso with vanilla and caramel', 145, beverages_id, signature_id, '/menu-espresso-updated.jpg', true, 4.7, 4, 100, ARRAY['coffee', 'caramel', 'sweet', 'hot']),
    ('Mocha', 'Rich chocolate and espresso combination', 135, beverages_id, signature_id, '/menu-espresso-updated.jpg', false, 4.6, 4, 100, ARRAY['coffee', 'chocolate', 'sweet', 'hot']);

    -- Insert Matcha products
    INSERT INTO products (name, description, price, main_category_id, subcategory_id, image_url, is_featured, rating, prep_time, stock_quantity, tags) VALUES
    ('Matcha Latte', 'Premium matcha with steamed milk', 135, beverages_id, matcha_id, '/menu-matcha-updated.jpg', true, 4.6, 3, 100, ARRAY['matcha', 'tea', 'milk', 'hot']),
    ('Iced Matcha', 'Refreshing cold matcha drink', 125, beverages_id, matcha_id, '/menu-matcha-updated.jpg', false, 4.5, 2, 100, ARRAY['matcha', 'tea', 'cold', 'iced']),
    ('Matcha Frappe', 'Blended matcha with ice and cream', 155, beverages_id, matcha_id, '/menu-matcha-updated.jpg', true, 4.7, 5, 100, ARRAY['matcha', 'tea', 'frappe', 'cold']);

    -- Insert Coffee Frappe products
    INSERT INTO products (name, description, price, main_category_id, subcategory_id, image_url, is_featured, rating, prep_time, stock_quantity, tags) VALUES
    ('Classic Coffee Frappe', 'Blended coffee with ice and cream', 155, beverages_id, coffee_frappe_id, '/menu-frappucino-updated.jpg', true, 4.8, 5, 100, ARRAY['coffee', 'frappe', 'cold', 'blended']),
    ('Mocha Frappe', 'Chocolate coffee frappe with whipped cream', 165, beverages_id, coffee_frappe_id, '/menu-frappucino-updated.jpg', true, 4.7, 5, 100, ARRAY['coffee', 'chocolate', 'frappe', 'cold']),
    ('Caramel Frappe', 'Caramel coffee frappe with whipped cream', 165, beverages_id, coffee_frappe_id, '/menu-frappucino-updated.jpg', false, 4.6, 5, 100, ARRAY['coffee', 'caramel', 'frappe', 'cold']);

    -- Insert Waffle products
    INSERT INTO products (name, description, price, main_category_id, subcategory_id, image_url, is_featured, rating, prep_time, stock_quantity, tags) VALUES
    ('Classic Belgian Waffle', 'Crispy waffle with butter and syrup', 185, food_id, waffle_id, '/placeholder.svg?height=300&width=200&text=Waffle', true, 4.6, 8, 50, ARRAY['waffle', 'breakfast', 'sweet']),
    ('Chocolate Waffle', 'Waffle with chocolate chips and sauce', 215, food_id, waffle_id, '/placeholder.svg?height=300&width=200&text=Choco+Waffle', true, 4.7, 8, 50, ARRAY['waffle', 'chocolate', 'sweet']),
    ('Strawberry Waffle', 'Waffle with fresh strawberries and cream', 225, food_id, waffle_id, '/placeholder.svg?height=300&width=200&text=Strawberry+Waffle', false, 4.5, 8, 50, ARRAY['waffle', 'strawberry', 'fruit', 'sweet']);

    -- Insert Burger products
    INSERT INTO products (name, description, price, main_category_id, subcategory_id, image_url, is_featured, rating, prep_time, stock_quantity, tags) VALUES
    ('Sol Beef Burger', 'Juicy beef patty with fresh vegetables', 285, food_id, burger_id, '/placeholder.svg?height=300&width=200&text=Burger', true, 4.8, 12, 30, ARRAY['burger', 'beef', 'lunch']),
    ('Chicken Burger', 'Grilled chicken breast with special sauce', 265, food_id, burger_id, '/placeholder.svg?height=300&width=200&text=Chicken+Burger', false, 4.6, 12, 30, ARRAY['burger', 'chicken', 'lunch']),
    ('Veggie Burger', 'Plant-based patty with fresh vegetables', 245, food_id, burger_id, '/placeholder.svg?height=300&width=200&text=Veggie+Burger', false, 4.4, 10, 30, ARRAY['burger', 'vegetarian', 'healthy', 'lunch']);
END $$;

-- Create views for easier querying
CREATE OR REPLACE VIEW menu_structure AS
SELECT 
    mc.id as main_category_id,
    mc.name as main_category_name,
    mc.description as main_category_description,
    mc.display_order as main_category_order,
    sc.id as subcategory_id,
    sc.name as subcategory_name,
    sc.description as subcategory_description,
    sc.display_order as subcategory_order,
    p.id as product_id,
    p.name as product_name,
    p.description as product_description,
    p.price,
    p.image_url,
    p.is_active,
    p.is_featured,
    p.rating,
    p.prep_time,
    p.stock_quantity,
    p.tags
FROM main_categories mc
LEFT JOIN subcategories sc ON mc.id = sc.main_category_id
LEFT JOIN products p ON sc.id = p.subcategory_id
WHERE mc.is_active = true
ORDER BY mc.display_order, sc.display_order, p.name;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Display summary
SELECT 
    'Setup Complete!' as status,
    (SELECT COUNT(*) FROM main_categories) as main_categories,
    (SELECT COUNT(*) FROM subcategories) as subcategories,
    (SELECT COUNT(*) FROM products) as products,
    (SELECT COUNT(*) FROM variations) as variations,
    (SELECT COUNT(*) FROM add_ons) as add_ons;
