-- Complete Sol Kaffé Menu Update Script
-- This script updates the database with all menu items from the latest menu images
-- and ensures only oat milk and full cream milk are available

-- First, clean up existing data to avoid conflicts
DELETE FROM product_add_ons;
DELETE FROM product_variations;
DELETE FROM add_ons;
DELETE FROM variations;
DELETE FROM products;
DELETE FROM categories;

-- Create categories with proper styling
INSERT INTO categories (id, name, description, color, icon, sort_order, is_active) VALUES
('cat-espresso', 'ESPRESSO', 'Classic espresso-based drinks', '#8B4513', '☕', 1, true),
('cat-signature', 'SIGNATURE', 'Our signature specialty drinks', '#D2691E', '⭐', 2, true),
('cat-frappucino', 'FRAPPUCINO', 'Blended iced coffee drinks', '#4682B4', '🥤', 3, true),
('cat-fries', 'FRIES', 'Crispy golden fries with various toppings', '#FFD700', '🍟', 4, true),
('cat-waffles', 'WAFFLES', 'Fresh waffles with delicious toppings', '#DEB887', '🧇', 5, true),
('cat-matcha', 'MATCHA', 'Premium matcha-based beverages', '#90EE90', '🍵', 6, true),
('cat-non-coffee', 'NON-COFFEE', 'Refreshing non-coffee beverages', '#FFB6C1', '🥛', 7, true),
('cat-frappe', 'FRAPPE', 'Creamy blended frappe drinks', '#E6E6FA', '🍦', 8, true);

-- ESPRESSO Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-americano', 'Americano', 'Classic espresso with hot water', 89.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'espresso', 'classic'], 100, 10),
('prod-latte', 'Latte', 'Espresso with steamed milk', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'milk', 'espresso'], 100, 10),
('prod-spanish-latte', 'Spanish Latte', 'Latte with condensed milk', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'sweet', 'condensed milk'], 100, 10),
('prod-butterscotch-latte', 'Butterscotch Latte', 'Latte with butterscotch flavor', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'sweet', 'butterscotch'], 100, 10),
('prod-caramel-latte', 'Caramel Latte', 'Latte with caramel syrup', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'caramel', 'sweet'], 100, 10),
('prod-cappuccino', 'Cappuccino', 'Espresso with steamed milk foam', 119.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'foam', 'espresso'], 100, 10),
('prod-dark-mocha', 'Dark Mocha', 'Rich chocolate espresso drink', 119.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'chocolate', 'mocha'], 100, 10),
('prod-white-mocha', 'White Mocha', 'White chocolate espresso drink', 119.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'white chocolate', 'mocha'], 100, 10);

-- SIGNATURE Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-caramel-macchiato', 'Caramel Macchiato', 'Espresso with vanilla and caramel', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200', true, ARRAY['signature', 'caramel', 'vanilla'], 100, 10),
('prod-seasalt-latte', 'Seasalt Latte', 'Latte with sea salt foam', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200', true, ARRAY['signature', 'sea salt', 'unique'], 100, 10),
('prod-black-sesame', 'Black Sesame', 'Unique black sesame flavored drink', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200', true, ARRAY['signature', 'sesame', 'unique'], 100, 10),
('prod-tiramisu', 'Tiramisu', 'Coffee-flavored Italian dessert drink', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200', true, ARRAY['signature', 'tiramisu', 'dessert'], 100, 10);

-- FRAPPUCINO Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-salted-caramel-frap', 'Salted Caramel', 'Blended caramel frappuccino with sea salt', 149.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200', true, ARRAY['frappuccino', 'caramel', 'salt'], 100, 10),
('prod-java-chip-frap', 'Java Chip', 'Coffee frappuccino with chocolate chips', 149.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200', true, ARRAY['frappuccino', 'chocolate', 'chips'], 100, 10),
('prod-oreo-espresso-frap', 'Oreo Espresso', 'Espresso frappuccino with Oreo cookies', 149.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200', true, ARRAY['frappuccino', 'oreo', 'cookies'], 100, 10),
('prod-daily-dose-frap', 'Daily Dose', 'Our signature daily frappuccino blend', 169.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200', true, ARRAY['frappuccino', 'signature', 'daily'], 100, 10);

-- FRIES Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-plain-fries', 'Plain', 'Classic golden crispy fries', 119.00, 'FRIES', 'cat-fries', '/placeholder.svg?height=300&width=200', true, ARRAY['fries', 'classic', 'crispy'], 100, 10),
('prod-cheese-fries', 'Cheese', 'Fries topped with melted cheese', 119.00, 'FRIES', 'cat-fries', '/placeholder.svg?height=300&width=200', true, ARRAY['fries', 'cheese', 'melted'], 100, 10),
('prod-sour-cream-fries', 'Sour and Cream', 'Fries with sour cream topping', 119.00, 'FRIES', 'cat-fries', '/placeholder.svg?height=300&width=200', true, ARRAY['fries', 'sour cream', 'creamy'], 100, 10);

-- WAFFLES Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-choco-chips-waffle', 'Choco Chips', 'Waffle with chocolate chips', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200', true, ARRAY['waffle', 'chocolate', 'chips'], 100, 10),
('prod-matcha-waffle', 'Matcha', 'Waffle with matcha flavor', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200', true, ARRAY['waffle', 'matcha', 'green tea'], 100, 10),
('prod-cookies-cream-waffle', 'Cookies and Cream', 'Waffle with cookies and cream', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200', true, ARRAY['waffle', 'cookies', 'cream'], 100, 10),
('prod-cinnamon-muscavado-waffle', 'Cinnamon Muscavado', 'Waffle with cinnamon and muscavado sugar', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200', true, ARRAY['waffle', 'cinnamon', 'muscavado'], 100, 10);

-- MATCHA Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-matcha-latte', 'Matcha Latte', 'Premium matcha with steamed milk', 109.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200', true, ARRAY['matcha', 'latte', 'green tea'], 100, 10),
('prod-white-matcha', 'White Matcha', 'Matcha with white chocolate', 119.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200', true, ARRAY['matcha', 'white chocolate', 'sweet'], 100, 10),
('prod-strawberry-matcha', 'Strawberry Matcha', 'Matcha with strawberry flavor', 119.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200', true, ARRAY['matcha', 'strawberry', 'fruity'], 100, 10),
('prod-matcha-banana-creme', 'Matcha Banana Creme Top', 'Matcha with banana cream topping', 129.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200', true, ARRAY['matcha', 'banana', 'cream'], 100, 10);

-- NON-COFFEE Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-strawberry-milk', 'Strawberry Milk', 'Fresh strawberry flavored milk', 99.00, 'NON-COFFEE', 'cat-non-coffee', '/placeholder.svg?height=300&width=200', true, ARRAY['milk', 'strawberry', 'non-coffee'], 100, 10),
('prod-blueberry-milk', 'Blueberry Milk', 'Fresh blueberry flavored milk', 99.00, 'NON-COFFEE', 'cat-non-coffee', '/placeholder.svg?height=300&width=200', true, ARRAY['milk', 'blueberry', 'non-coffee'], 100, 10),
('prod-caramel-graham', 'Caramel Graham', 'Caramel with graham crackers', 99.00, 'NON-COFFEE', 'cat-non-coffee', '/placeholder.svg?height=300&width=200', true, ARRAY['caramel', 'graham', 'non-coffee'], 100, 10);

-- FRAPPE Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags, stock_quantity, min_stock_level) VALUES
('prod-mango-graham-frappe', 'Mango Graham', 'Mango frappe with graham crackers', 129.00, 'FRAPPE', 'cat-frappe', '/placeholder.svg?height=300&width=200', true, ARRAY['frappe', 'mango', 'graham'], 100, 10),
('prod-strawberry-oreo-frappe', 'Strawberry Oreo', 'Strawberry frappe with Oreo cookies', 129.00, 'FRAPPE', 'cat-frappe', '/placeholder.svg?height=300&width=200', true, ARRAY['frappe', 'strawberry', 'oreo'], 100, 10),
('prod-white-almond-frappe', 'White Almond', 'Creamy white almond frappe', 129.00, 'FRAPPE', 'cat-frappe', '/placeholder.svg?height=300&width=200', true, ARRAY['frappe', 'almond', 'creamy'], 100, 10);

-- Create variations
INSERT INTO variations (id, name, type, price_modifier, is_active, sort_order) VALUES
('var-hot', 'Hot', 'temperature', 0.00, true, 1),
('var-iced', 'Iced', 'temperature', 0.00, true, 2),
('var-small', 'Small', 'size', 0.00, true, 1),
('var-medium', 'Medium', 'size', 20.00, true, 2),
('var-large', 'Large', 'size', 40.00, true, 3),
('var-full-cream', 'Full Cream Milk', 'milk_type', 0.00, true, 1),
('var-oat-milk', 'Oat Milk', 'milk_type', 30.00, true, 2);

-- Create add-ons
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

-- Link variations to products
INSERT INTO product_variations (product_id, variation_id, is_default)
SELECT p.id, 'var-hot', true FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA')
UNION ALL
SELECT p.id, 'var-iced', false FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA')
UNION ALL
SELECT p.id, 'var-small', true FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'FRAPPUCINO', 'MATCHA', 'NON-COFFEE', 'FRAPPE')
UNION ALL
SELECT p.id, 'var-medium', false FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'FRAPPUCINO', 'MATCHA', 'NON-COFFEE', 'FRAPPE')
UNION ALL
SELECT p.id, 'var-large', false FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'FRAPPUCINO', 'MATCHA', 'NON-COFFEE', 'FRAPPE')
UNION ALL
SELECT p.id, 'var-full-cream', true FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA') AND p.name NOT LIKE '%Americano%'
UNION ALL
SELECT p.id, 'var-oat-milk', false FROM products p WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA') AND p.name NOT LIKE '%Americano%';

-- Link add-ons to products
INSERT INTO product_add_ons (product_id, add_on_id)
SELECT p.id, a.id FROM products p CROSS JOIN add_ons a 
WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA', 'FRAPPUCINO')
AND a.category IN ('milk_alternative', 'coffee', 'preparation', 'syrup', 'topping');

-- Set timestamps
UPDATE products SET created_at = NOW(), updated_at = NOW();
UPDATE categories SET created_at = NOW(), updated_at = NOW();
UPDATE variations SET created_at = NOW(), updated_at = NOW();
UPDATE add_ons SET created_at = NOW(), updated_at = NOW();
