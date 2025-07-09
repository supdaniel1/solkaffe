-- Database schema for café ordering system
-- Run this script to set up your database tables

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Visitor analytics table
CREATE TABLE visitor_logs (
    id SERIAL PRIMARY KEY,
    page VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device VARCHAR(100),
    os VARCHAR(100),
    browser VARCHAR(100),
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Insert sample categories
INSERT INTO categories (name, icon, sort_order) VALUES
('Espresso', 'Coffee', 1),
('Iced', 'Snowflake', 2),
('Pastries', 'Cookie', 3),
('Tea', 'Leaf', 4);

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
('Earl Grey', 'Classic bergamot-infused black tea', 2.50, '/placeholder.svg?height=200&width=200', 'tea'),
('Green Tea', 'Refreshing and healthy green tea', 2.25, '/placeholder.svg?height=200&width=200', 'tea');

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_visitor_logs_visited_at ON visitor_logs(visited_at);
