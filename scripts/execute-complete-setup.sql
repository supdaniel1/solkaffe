-- Complete Database Setup and Menu Population
-- This script will set up the entire database structure and populate it with Sol Kaffé menu

-- First, ensure we have the proper database structure
-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS product_add_ons CASCADE;
DROP TABLE IF EXISTS product_variations CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS add_ons CASCADE;
DROP TABLE IF EXISTS variations CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS visitor_logs CASCADE;

-- Create categories table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    category_id TEXT REFERENCES categories(id),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    tags TEXT[],
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    nutritional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create variations table
CREATE TABLE variations (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price_modifier DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create add_ons table
CREATE TABLE add_ons (
    id TEXT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    max_quantity INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_variations junction table
CREATE TABLE product_variations (
    id SERIAL PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    variation_id TEXT REFERENCES variations(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, variation_id)
);

-- Create product_add_ons junction table
CREATE TABLE product_add_ons (
    id SERIAL PRIMARY KEY,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    add_on_id TEXT REFERENCES add_ons(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, add_on_id)
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    variations JSONB,
    add_ons JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visitor_logs table
CREATE TABLE visitor_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device VARCHAR(100),
    os VARCHAR(100),
    browser VARCHAR(100),
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert categories
INSERT INTO categories (id, name, description, color, icon, sort_order, is_active) VALUES
('cat-espresso', 'ESPRESSO', 'Classic espresso-based drinks', '#8B4513', '☕', 1, true),
('cat-signature', 'SIGNATURE', 'Our signature specialty drinks', '#D2691E', '⭐', 2, true),
('cat-frappucino', 'FRAPPUCINO', 'Blended iced coffee drinks', '#4682B4', '🥤', 3, true),
('cat-fries', 'FRIES', 'Crispy golden fries with various toppings', '#FFD700', '🍟', 4, true),
('cat-waffles', 'WAFFLES', 'Fresh waffles with delicious toppings', '#DEB887', '🧇', 5, true),
('cat-matcha', 'MATCHA', 'Premium matcha-based beverages', '#90EE90', '🍵', 6, true),
('cat-non-coffee', 'NON-COFFEE', 'Refreshing non-coffee beverages', '#FFB6C1', '🥛', 7, true),
('cat-frappe', 'FRAPPE', 'Creamy blended frappe drinks', '#E6E6FA', '🍦', 8, true);

-- Insert ESPRESSO products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-americano', 'Americano', 'Classic espresso with hot water', 89.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200&text=Americano', true, ARRAY['coffee', 'espresso', 'classic'], 100, 10),
('prod-latte', 'Latte', 'Espresso with steamed milk', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200&text=Latte', true, ARRAY['coffee', 'milk', 'espresso'], 100, 10),
('prod-spanish-latte', 'Spanish Latte', 'Latte with condensed milk', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200&text=Spanish+Latte', true, ARRAY['coffee', 'sweet', 'condensed milk'], 100, 10),
('prod-butterscotch-latte', 'Butterscotch Latte', 'Latte with butterscotch flavor', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200&text=Butterscotch+Latte', true, ARRAY['coffee', 'sweet', 'butterscotch'], 100, 10),
('prod-caramel-latte', 'Caramel Latte', 'Latte with caramel syrup', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200&text=Caramel+Latte', true, ARRAY['coffee', 'caramel', 'sweet'], 100, 10),
('prod-cappuccino', 'Cappuccino', 'Espresso with steamed milk foam', 119.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200&text=Cappuccino', true, ARRAY['coffee', 'foam', 'espresso'], 100, 10),
('prod-dark-mocha', 'Dark Mocha', 'Rich chocolate espresso drink', 119.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200&text=Dark+Mocha', true, ARRAY['coffee', 'chocolate', 'mocha'], 100, 10),
('prod-white-mocha', 'White Mocha', 'White chocolate espresso drink', 119.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200&text=White+Mocha', true, ARRAY['coffee', 'white chocolate', 'mocha'], 100, 10);

-- Insert SIGNATURE products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-caramel-macchiato', 'Caramel Macchiato', 'Espresso with vanilla and caramel', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200&text=Caramel+Macchiato', true, ARRAY['signature', 'caramel', 'vanilla'], 100, 10),
('prod-seasalt-latte', 'Seasalt Latte', 'Latte with sea salt foam', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200&text=Seasalt+Latte', true, ARRAY['signature', 'sea salt', 'unique'], 100, 10),
('prod-black-sesame', 'Black Sesame', 'Unique black sesame flavored drink', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200&text=Black+Sesame', true, ARRAY['signature', 'sesame', 'unique'], 100, 10),
('prod-tiramisu', 'Tiramisu', 'Coffee-flavored Italian dessert drink', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200&text=Tiramisu', true, ARRAY['signature', 'tiramisu', 'dessert'], 100, 10);

-- Insert FRAPPUCINO products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-salted-caramel-frap', 'Salted Caramel', 'Blended caramel frappuccino with sea salt', 149.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200&text=Salted+Caramel+Frap', true, ARRAY['frappuccino', 'caramel', 'salt'], 100, 10),
('prod-java-chip-frap', 'Java Chip', 'Coffee frappuccino with chocolate chips', 149.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200&text=Java+Chip+Frap', true, ARRAY['frappuccino', 'chocolate', 'chips'], 100, 10),
('prod-oreo-espresso-frap', 'Oreo Espresso', 'Espresso frappuccino with Oreo cookies', 149.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200&text=Oreo+Espresso+Frap', true, ARRAY['frappuccino', 'oreo', 'cookies'], 100, 10),
('prod-daily-dose-frap', 'Daily Dose', 'Our signature daily frappuccino blend', 169.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200&text=Daily+Dose+Frap', true, ARRAY['frappuccino', 'signature', 'daily'], 100, 10);

-- Insert FRIES products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-plain-fries', 'Plain', 'Classic golden crispy fries', 119.00, 'FRIES', 'cat-fries', '/placeholder.svg?height=300&width=200&text=Plain+Fries', true, ARRAY['fries', 'classic', 'crispy'], 100, 10),
('prod-cheese-fries', 'Cheese', 'Fries topped with melted cheese', 119.00, 'FRIES', 'cat-fries', '/placeholder.svg?height=300&width=200&text=Cheese+Fries', true, ARRAY['fries', 'cheese', 'melted'], 100, 10),
('prod-sour-cream-fries', 'Sour and Cream', 'Fries with sour cream topping', 119.00, 'FRIES', 'cat-fries', '/placeholder.svg?height=300&width=200&text=Sour+Cream+Fries', true, ARRAY['fries', 'sour cream', 'creamy'], 100, 10);

-- Insert WAFFLES products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-choco-chips-waffle', 'Choco Chips', 'Waffle with chocolate chips', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200&text=Choco+Chips+Waffle', true, ARRAY['waffle', 'chocolate', 'chips'], 100, 10),
('prod-matcha-waffle', 'Matcha', 'Waffle with matcha flavor', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200&text=Matcha+Waffle', true, ARRAY['waffle', 'matcha', 'green tea'], 100, 10),
('prod-cookies-cream-waffle', 'Cookies and Cream', 'Waffle with cookies and cream', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200&text=Cookies+Cream+Waffle', true, ARRAY['waffle', 'cookies', 'cream'], 100, 10),
('prod-cinnamon-muscavado-waffle', 'Cinnamon Muscavado', 'Waffle with cinnamon and muscavado sugar', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200&text=Cinnamon+Waffle', true, ARRAY['waffle', 'cinnamon', 'muscavado'], 100, 10);

-- Insert MATCHA products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-matcha-latte', 'Matcha Latte', 'Premium matcha with steamed milk', 109.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200&text=Matcha+Latte', true, ARRAY['matcha', 'latte', 'green tea'], 100, 10),
('prod-white-matcha', 'White Matcha', 'Matcha with white chocolate', 119.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200&text=White+Matcha', true, ARRAY['matcha', 'white chocolate', 'sweet'], 100, 10),
('prod-strawberry-matcha', 'Strawberry Matcha', 'Matcha with strawberry flavor', 119.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200&text=Strawberry+Matcha', true, ARRAY['matcha', 'strawberry', 'fruity'], 100, 10),
('prod-matcha-banana-creme', 'Matcha Banana Creme Top', 'Matcha with banana cream topping', 129.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200&text=Matcha+Banana', true, ARRAY['matcha', 'banana', 'cream'], 100, 10);

-- Insert NON-COFFEE products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-strawberry-milk', 'Strawberry Milk', 'Fresh strawberry flavored milk', 99.00, 'NON-COFFEE', 'cat-non-coffee', '/placeholder.svg?height=300&width=200&text=Strawberry+Milk', true, ARRAY['milk', 'strawberry', 'non-coffee'], 100, 10),
('prod-blueberry-milk', 'Blueberry Milk', 'Fresh blueberry flavored milk', 99.00, 'NON-COFFEE', 'cat-non-coffee', '/placeholder.svg?height=300&width=200&text=Blueberry+Milk', true, ARRAY['milk', 'blueberry', 'non-coffee'], 100, 10),
('prod-caramel-graham', 'Caramel Graham', 'Caramel with graham crackers', 99.00, 'NON-COFFEE', 'cat-non-coffee', '/placeholder.svg?height=300&width=200&text=Caramel+Graham', true, ARRAY['caramel', 'graham', 'non-coffee'], 100, 10);

-- Insert FRAPPE products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-mango-graham-frappe', 'Mango Graham', 'Mango frappe with graham crackers', 129.00, 'FRAPPE', 'cat-frappe', '/placeholder.svg?height=300&width=200&text=Mango+Graham', true, ARRAY['frappe', 'mango', 'graham'], 100, 10),
('prod-strawberry-oreo-frappe', 'Strawberry Oreo', 'Strawberry frappe with Oreo cookies', 129.00, 'FRAPPE', 'cat-frappe', '/placeholder.svg?height=300&width=200&text=Strawberry+Oreo', true, ARRAY['frappe', 'strawberry', 'oreo'], 100, 10),
('prod-white-almond-frappe', 'White Almond', 'Creamy white almond frappe', 129.00, 'FRAPPE', 'cat-frappe', '/placeholder.svg?height=300&width=200&text=White+Almond', true, ARRAY['frappe', 'almond', 'creamy'], 100, 10);

-- Insert variations
INSERT INTO variations (id, name, type, price_modifier, is_active, sort_order) VALUES
('var-hot', 'Hot', 'temperature', 0.00, true, 1),
('var-iced', 'Iced', 'temperature', 0.00, true, 2),
('var-small', 'Small', 'size', 0.00, true, 1),
('var-medium', 'Medium', 'size', 20.00, true, 2),
('var-large', 'Large', 'size', 40.00, true, 3),
('var-full-cream', 'Full Cream Milk', 'milk_type', 0.00, true, 1),
('var-oat-milk', 'Oat Milk', 'milk_type', 30.00, true, 2);

-- Insert add-ons
INSERT INTO add_ons (id, name, description, price, category, is_active, max_quantity, sort_order) VALUES
('addon-oat-milk', 'Oat Milk', 'Premium oat milk substitute', 30.00, 'milk_alternative', true, 1, 1),
('addon-espresso-shot', 'Espresso Shot', 'Extra shot of espresso', 25.00, 'coffee', true, 3, 2),
('addon-extra-hot', 'Extra Hot', 'Served extra hot', 0.00, 'preparation', true, 1, 3),
('addon-decaf', 'Decaf', 'Decaffeinated option', 0.00, 'preparation', true, 1, 4),
('addon-extra-foam', 'Extra Foam', 'Additional milk foam', 10.00, 'preparation', true, 1, 5),
('addon-vanilla-syrup', 'Vanilla Syrup', 'Sweet vanilla flavoring', 15.00, 'syrup', true, 2, 6),
('addon-caramel-syrup', 'Caramel Syrup', 'Rich caramel flavoring', 15.00, 'syrup', true, 2, 7),
('addon-hazelnut-syrup', 'Hazelnut Syrup', 'Nutty hazelnut flavoring', 15.00, 'syrup', true, 2, 8),
('addon-whipped-cream', 'Whipped Cream', 'Fresh whipped cream topping', 20.00, 'topping', true, 1, 9);

-- Link temperature variations to coffee products
INSERT INTO product_variations (product_id, variation_id, is_default)
SELECT p.id, 'var-hot', true FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA')
UNION ALL
SELECT p.id, 'var-iced', false FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA');

-- Link size variations to all drink products
INSERT INTO product_variations (product_id, variation_id, is_default)
SELECT p.id, 'var-small', true FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'FRAPPUCINO', 'MATCHA', 'NON-COFFEE', 'FRAPPE')
UNION ALL
SELECT p.id, 'var-medium', false FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'FRAPPUCINO', 'MATCHA', 'NON-COFFEE', 'FRAPPE')
UNION ALL
SELECT p.id, 'var-large', false FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'FRAPPUCINO', 'MATCHA', 'NON-COFFEE', 'FRAPPE');

-- Link milk variations to coffee and matcha products (excluding Americano)
INSERT INTO product_variations (product_id, variation_id, is_default)
SELECT p.id, 'var-full-cream', true FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA') AND p.name NOT LIKE '%Americano%'
UNION ALL
SELECT p.id, 'var-oat-milk', false FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA') AND p.name NOT LIKE '%Americano%';

-- Link add-ons to coffee products
INSERT INTO product_add_ons (product_id, add_on_id)
SELECT p.id, a.id FROM products p CROSS JOIN add_ons a 
WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA', 'FRAPPUCINO')
AND a.category IN ('milk_alternative', 'coffee', 'preparation', 'syrup', 'topping');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visited_at ON visitor_logs(visited_at);

-- Final verification
SELECT 
    c.name as category,
    COUNT(p.id) as product_count,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price,
    ROUND(AVG(p.price), 2) as avg_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
WHERE c.is_active = true
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order;
