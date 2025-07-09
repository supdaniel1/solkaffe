-- Supabase setup for café ordering system
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table with payment information
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visitor analytics table
CREATE TABLE IF NOT EXISTS visitor_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device VARCHAR(100),
    os VARCHAR(100),
    browser VARCHAR(100),
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for public access (customize as needed)
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to visitor_logs" ON visitor_logs FOR INSERT WITH CHECK (true);

-- Admin policies (you'll need to set up authentication)
CREATE POLICY "Allow admin full access to orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow admin full access to order_items" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow admin read access to visitor_logs" ON visitor_logs FOR SELECT USING (true);

-- Insert sample categories
INSERT INTO categories (name, icon, sort_order) VALUES
('espresso', 'Coffee', 1),
('iced', 'Snowflake', 2),
('pastries', 'Cookie', 3),
('tea', 'Leaf', 4)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category) VALUES
('Classic Espresso', 'Rich, bold espresso shot with perfect crema', 3.50, '/placeholder.svg?height=200&width=200', 'espresso'),
('Cappuccino', 'Espresso with steamed milk and foam art', 4.25, '/placeholder.svg?height=200&width=200', 'espresso'),
('Latte', 'Smooth espresso with steamed milk', 4.50, '/placeholder.svg?height=200&width=200', 'espresso'),
('Iced Americano', 'Refreshing cold espresso with ice water', 3.75, '/placeholder.svg?height=200&width=200', 'iced'),
('Cold Brew', 'Smooth, less acidic cold-steeped coffee', 4.00, '/placeholder.svg?height=200&width=200', 'iced'),
('Iced Latte', 'Chilled espresso with cold milk', 4.75, '/placeholder.svg?height=200&width=200', 'iced'),
('Croissant', 'Buttery, flaky French pastry', 2.75, '/placeholder.svg?height=200&width=200', 'pastries'),
('Blueberry Muffin', 'Fresh baked muffin with blueberries', 3.25, '/placeholder.svg?height=200&width=200', 'pastries'),
('Chocolate Chip Cookie', 'Warm, gooey chocolate chip cookie', 2.25, '/placeholder.svg?height=200&width=200', 'pastries'),
('Earl Grey', 'Classic bergamot-infused black tea', 2.50, '/placeholder.svg?height=200&width=200', 'tea'),
('Green Tea', 'Refreshing and healthy green tea', 2.25, '/placeholder.svg?height=200&width=200', 'tea'),
('Chamomile', 'Soothing herbal tea for relaxation', 2.75, '/placeholder.svg?height=200&width=200', 'tea')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_visitor_logs_visited_at ON visitor_logs(visited_at);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
