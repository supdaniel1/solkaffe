-- Sol Kaffé Menu Population Script
-- This script populates the database with all menu items from the Sol Kaffé menu images

-- First, let's create the categories
INSERT INTO categories (id, name, description, color, icon, sort_order, is_active) VALUES
('cat-espresso', 'ESPRESSO', 'Classic espresso-based drinks', '#8B4513', '☕', 1, true),
('cat-signature', 'SIGNATURE', 'Our signature specialty drinks', '#D2691E', '⭐', 2, true),
('cat-frappucino', 'FRAPPUCINO', 'Blended iced coffee drinks', '#4682B4', '🥤', 3, true),
('cat-fries', 'FRIES', 'Crispy golden fries with various toppings', '#FFD700', '🍟', 4, true),
('cat-waffles', 'WAFFLES', 'Fresh waffles with delicious toppings', '#DEB887', '🧇', 5, true),
('cat-matcha', 'MATCHA', 'Premium matcha-based beverages', '#90EE90', '🍵', 6, true),
('cat-non-coffee', 'NON-COFFEE', 'Refreshing non-coffee beverages', '#FFB6C1', '🥛', 7, true),
('cat-frappe', 'FRAPPE', 'Creamy blended frappe drinks', '#E6E6FA', '🍦', 8, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- ESPRESSO Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags) VALUES
('prod-americano', 'Americano', 'Classic espresso with hot water', 89.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'espresso', 'classic']),
('prod-latte', 'Latte', 'Espresso with steamed milk', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'milk', 'espresso']),
('prod-spanish-latte', 'Spanish Latte', 'Latte with condensed milk', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'sweet', 'condensed milk']),
('prod-butterscotch-latte', 'Butterscotch Latte', 'Latte with butterscotch flavor', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'sweet', 'butterscotch']),
('prod-caramel-latte', 'Caramel Latte', 'Latte with caramel syrup', 109.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'caramel', 'sweet']),
('prod-cappuccino', 'Cappuccino', 'Espresso with steamed milk foam', 119.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'foam', 'espresso']),
('prod-dark-mocha', 'Dark Mocha', 'Rich chocolate espresso drink', 119.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'chocolate', 'mocha']),
('prod-white-mocha', 'White Mocha', 'White chocolate espresso drink', 119.00, 'ESPRESSO', 'cat-espresso', '/placeholder.svg?height=300&width=200', true, ARRAY['coffee', 'white chocolate', 'mocha'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags;

-- SIGNATURE Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags) VALUES
('prod-caramel-macchiato', 'Caramel Macchiato', 'Espresso with vanilla and caramel', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200', true, ARRAY['signature', 'caramel', 'vanilla']),
('prod-seasalt-latte', 'Seasalt Latte', 'Latte with sea salt foam', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200', true, ARRAY['signature', 'sea salt', 'unique']),
('prod-black-sesame', 'Black Sesame', 'Unique black sesame flavored drink', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200', true, ARRAY['signature', 'sesame', 'unique']),
('prod-tiramisu', 'Tiramisu', 'Coffee-flavored Italian dessert drink', 139.00, 'SIGNATURE', 'cat-signature', '/placeholder.svg?height=300&width=200', true, ARRAY['signature', 'tiramisu', 'dessert'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags;

-- FRAPPUCINO Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags) VALUES
('prod-salted-caramel-frap', 'Salted Caramel', 'Blended caramel frappuccino with sea salt', 149.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200', true, ARRAY['frappuccino', 'caramel', 'salt']),
('prod-java-chip-frap', 'Java Chip', 'Coffee frappuccino with chocolate chips', 149.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200', true, ARRAY['frappuccino', 'chocolate', 'chips']),
('prod-oreo-espresso-frap', 'Oreo Espresso', 'Espresso frappuccino with Oreo cookies', 149.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200', true, ARRAY['frappuccino', 'oreo', 'cookies']),
('prod-daily-dose-frap', 'Daily Dose', 'Our signature daily frappuccino blend', 169.00, 'FRAPPUCINO', 'cat-frappucino', '/placeholder.svg?height=300&width=200', true, ARRAY['frappuccino', 'signature', 'daily'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags;

-- FRIES Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags) VALUES
('prod-plain-fries', 'Plain', 'Classic golden crispy fries', 119.00, 'FRIES', 'cat-fries', '/placeholder.svg?height=300&width=200', true, ARRAY['fries', 'classic', 'crispy']),
('prod-cheese-fries', 'Cheese', 'Fries topped with melted cheese', 119.00, 'FRIES', 'cat-fries', '/placeholder.svg?height=300&width=200', true, ARRAY['fries', 'cheese', 'melted']),
('prod-sour-cream-fries', 'Sour and Cream', 'Fries with sour cream topping', 119.00, 'FRIES', 'cat-fries', '/placeholder.svg?height=300&width=200', true, ARRAY['fries', 'sour cream', 'creamy'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags;

-- WAFFLES Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags) VALUES
('prod-choco-chips-waffle', 'Choco Chips', 'Waffle with chocolate chips', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200', true, ARRAY['waffle', 'chocolate', 'chips']),
('prod-matcha-waffle', 'Matcha', 'Waffle with matcha flavor', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200', true, ARRAY['waffle', 'matcha', 'green tea']),
('prod-cookies-cream-waffle', 'Cookies and Cream', 'Waffle with cookies and cream', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200', true, ARRAY['waffle', 'cookies', 'cream']),
('prod-cinnamon-muscavado-waffle', 'Cinnamon Muscavado', 'Waffle with cinnamon and muscavado sugar', 109.00, 'WAFFLES', 'cat-waffles', '/placeholder.svg?height=300&width=200', true, ARRAY['waffle', 'cinnamon', 'muscavado'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags;

-- MATCHA Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags) VALUES
('prod-matcha-latte', 'Matcha Latte', 'Premium matcha with steamed milk', 109.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200', true, ARRAY['matcha', 'latte', 'green tea']),
('prod-white-matcha', 'White Matcha', 'Matcha with white chocolate', 119.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200', true, ARRAY['matcha', 'white chocolate', 'sweet']),
('prod-strawberry-matcha', 'Strawberry Matcha', 'Matcha with strawberry flavor', 119.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200', true, ARRAY['matcha', 'strawberry', 'fruity']),
('prod-matcha-banana-creme', 'Matcha Banana Creme Top', 'Matcha with banana cream topping', 129.00, 'MATCHA', 'cat-matcha', '/placeholder.svg?height=300&width=200', true, ARRAY['matcha', 'banana', 'cream'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags;

-- NON-COFFEE Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags) VALUES
('prod-strawberry-milk', 'Strawberry Milk', 'Fresh strawberry flavored milk', 99.00, 'NON-COFFEE', 'cat-non-coffee', '/placeholder.svg?height=300&width=200', true, ARRAY['milk', 'strawberry', 'non-coffee']),
('prod-blueberry-milk', 'Blueberry Milk', 'Fresh blueberry flavored milk', 99.00, 'NON-COFFEE', 'cat-non-coffee', '/placeholder.svg?height=300&width=200', true, ARRAY['milk', 'blueberry', 'non-coffee']),
('prod-caramel-graham', 'Caramel Graham', 'Caramel with graham crackers', 99.00, 'NON-COFFEE', 'cat-non-coffee', '/placeholder.svg?height=300&width=200', true, ARRAY['caramel', 'graham', 'non-coffee'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags;

-- FRAPPE Category Products
INSERT INTO products (id, name, description, price, category, category_id, image_url, is_active, tags) VALUES
('prod-mango-graham-frappe', 'Mango Graham', 'Mango frappe with graham crackers', 129.00, 'FRAPPE', 'cat-frappe', '/placeholder.svg?height=300&width=200', true, ARRAY['frappe', 'mango', 'graham']),
('prod-strawberry-oreo-frappe', 'Strawberry Oreo', 'Strawberry frappe with Oreo cookies', 129.00, 'FRAPPE', 'cat-frappe', '/placeholder.svg?height=300&width=200', true, ARRAY['frappe', 'strawberry', 'oreo']),
('prod-white-almond-frappe', 'White Almond', 'Creamy white almond frappe', 129.00, 'FRAPPE', 'cat-frappe', '/placeholder.svg?height=300&width=200', true, ARRAY['frappe', 'almond', 'creamy'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  category_id = EXCLUDED.category_id,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  tags = EXCLUDED.tags;

-- Create variations for temperature (Hot/Iced)
INSERT INTO variations (id, name, type, price_modifier, is_active, sort_order) VALUES
('var-hot', 'Hot', 'temperature', 0.00, true, 1),
('var-iced', 'Iced', 'temperature', 0.00, true, 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  price_modifier = EXCLUDED.price_modifier,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Create size variations
INSERT INTO variations (id, name, type, price_modifier, is_active, sort_order) VALUES
('var-small', 'Small', 'size', 0.00, true, 1),
('var-medium', 'Medium', 'size', 20.00, true, 2),
('var-large', 'Large', 'size', 40.00, true, 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  price_modifier = EXCLUDED.price_modifier,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

-- Create add-ons
INSERT INTO add_ons (id, name, description, price, category, is_active, max_quantity, sort_order) VALUES
('addon-oat-milk', 'Oat Milk', 'Premium oat milk substitute', 30.00, 'milk_alternative', true, 1, 1),
('addon-espresso-shot', 'Espresso Shot', 'Extra shot of espresso', 25.00, 'coffee', true, 3, 2),
('addon-extra-hot', 'Extra Hot', 'Served extra hot', 0.00, 'preparation', true, 1, 3),
('addon-decaf', 'Decaf', 'Decaffeinated option', 0.00, 'preparation', true, 1, 4),
('addon-extra-foam', 'Extra Foam', 'Additional milk foam', 10.00, 'preparation', true, 1, 5),
('addon-vanilla-syrup', 'Vanilla Syrup', 'Sweet vanilla flavoring', 15.00, 'syrup', true, 2, 6),
('addon-caramel-syrup', 'Caramel Syrup', 'Rich caramel flavoring', 15.00, 'syrup', true, 2, 7),
('addon-hazelnut-syrup', 'Hazelnut Syrup', 'Nutty hazelnut flavoring', 15.00, 'syrup', true, 2, 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  max_quantity = EXCLUDED.max_quantity,
  sort_order = EXCLUDED.sort_order;

-- Link temperature variations to coffee products
INSERT INTO product_variations (product_id, variation_id, is_default)
SELECT p.id, 'var-hot', true
FROM products p
WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA')
ON CONFLICT (product_id, variation_id) DO NOTHING;

INSERT INTO product_variations (product_id, variation_id, is_default)
SELECT p.id, 'var-iced', false
FROM products p
WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA')
ON CONFLICT (product_id, variation_id) DO NOTHING;

-- Link size variations to all drink products
INSERT INTO product_variations (product_id, variation_id, is_default)
SELECT p.id, 'var-small', true
FROM products p
WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'FRAPPUCINO', 'MATCHA', 'NON-COFFEE', 'FRAPPE')
ON CONFLICT (product_id, variation_id) DO NOTHING;

INSERT INTO product_variations (product_id, variation_id, is_default)
SELECT p.id, 'var-medium', false
FROM products p
WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'FRAPPUCINO', 'MATCHA', 'NON-COFFEE', 'FRAPPE')
ON CONFLICT (product_id, variation_id) DO NOTHING;

INSERT INTO product_variations (product_id, variation_id, is_default)
SELECT p.id, 'var-large', false
FROM products p
WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'FRAPPUCINO', 'MATCHA', 'NON-COFFEE', 'FRAPPE')
ON CONFLICT (product_id, variation_id) DO NOTHING;

-- Link add-ons to coffee products
INSERT INTO product_add_ons (product_id, add_on_id)
SELECT p.id, a.id
FROM products p
CROSS JOIN add_ons a
WHERE p.category IN ('ESPRESSO', 'SIGNATURE', 'MATCHA')
  AND a.category IN ('milk_alternative', 'coffee', 'preparation', 'syrup')
ON CONFLICT (product_id, add_on_id) DO NOTHING;

-- Update stock quantities for all products
UPDATE products SET stock_quantity = 100, min_stock_level = 10 WHERE stock_quantity = 0;

-- Add some nutritional info for popular items
UPDATE products SET nutritional_info = jsonb_build_object(
  'calories', 150,
  'caffeine_mg', 95,
  'sugar_g', 12,
  'fat_g', 8
) WHERE name = 'Latte';

UPDATE products SET nutritional_info = jsonb_build_object(
  'calories', 180,
  'caffeine_mg', 95,
  'sugar_g', 18,
  'fat_g', 9
) WHERE name = 'Caramel Latte';

UPDATE products SET nutritional_info = jsonb_build_object(
  'calories', 200,
  'caffeine_mg', 95,
  'sugar_g', 22,
  'fat_g', 10
) WHERE name = 'Dark Mocha';

-- Set created_at and updated_at timestamps
UPDATE products SET 
  created_at = NOW(),
  updated_at = NOW()
WHERE created_at IS NULL;

UPDATE categories SET 
  created_at = NOW(),
  updated_at = NOW()
WHERE created_at IS NULL;

-- Final verification query
SELECT 
  c.name as category,
  COUNT(p.id) as product_count,
  AVG(p.price) as avg_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
WHERE c.is_active = true
GROUP BY c.name, c.sort_order
ORDER BY c.sort_order;
