-- ============================================================
-- 4. SEED DATA: CATEGORIES, PRODUCTS, IMAGES, VARIANTS
-- ============================================================

-- Clean up any prior seed data if needed
TRUNCATE public.order_items, public.orders, public.cart_items, public.product_variants, public.product_images, public.products, public.categories CASCADE;

-- Insert 6 Categories
INSERT INTO public.categories (id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, image_url, sort_order)
VALUES
(
    'c1000000-0000-0000-0000-000000000001',
    'headwear',
    'Bosh kiyimlar',
    'Головные уборы',
    'Headwear',
    'Kepkalar, panamalar, bini va zamonaviy shapkalar to‘plami',
    'Кепки, панамы, бини и стильные шапки для любого сезона',
    'Premium caps, beanies, and hats crafted for modern silhouettes',
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    1
),
(
    'c1000000-0000-0000-0000-000000000002',
    'upperwear',
    'Ustki kiyimlar',
    'Верхняя одежда',
    'Upperwear',
    'Futbolkalar, ko‘ylaklar, xudi, svitshotlar va kurtkalar',
    'Футболки, рубашки, худи, свитшоты, куртки и пальто',
    'Minimalist t-shirts, oversized hoodies, tailored jackets and overcoats',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    2
),
(
    'c1000000-0000-0000-0000-000000000003',
    'bottomwear',
    'Pastki kiyimlar',
    'Брюки и джинсы',
    'Bottomwear',
    'Klassik shimlar, jinsilar, joggerlar va shortilar',
    'Брюки классического кроя, премиальный деним, джоггеры и шорты',
    'Tailored trousers, raw denim jeans, relaxed cargo pants and joggers',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    3
),
(
    'c1000000-0000-0000-0000-000000000004',
    'footwear',
    'Oyoq kiyimlar',
    'Обувь',
    'Footwear',
    'Krossovkalar, klassik tufli, etiklar va qulay poyabzallar',
    'Кроссовки, кожаные ботинки, лоферы и минималистичная обувь',
    'Handcrafted leather boots, architectural sneakers, and luxury loafers',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    4
),
(
    'c1000000-0000-0000-0000-000000000005',
    'accessories',
    'Aksessuarlar',
    'Аксессуары',
    'Accessories',
    'Soatlar, charm kamarlar, sumkalar, hamyonlar va quyosh ko‘zoynaklari',
    'Часы, кожаные ремни, сумки через плечо, портмоне и солнцезащитные очки',
    'Luxury leather bags, stainless steel timepieces, eyewear and wallets',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    5
),
(
    'c1000000-0000-0000-0000-000000000006',
    'seasonal-collection',
    'Mavsumiy to‘plam',
    'Сезонная коллекция',
    'Seasonal Collection',
    'Cheklangan tirajdagi kuz-qish va bahor-yoz eksklyuziv liboslar',
    'Лимитированная капсула: шерстяные пальто, тренчи и демисезонные образы',
    'Curated capsule collection with seasonal knitwear, trench coats, and outerwear',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    6
);

-- ============================================================
-- INSERT PRODUCTS
-- ============================================================

-- PRODUCT 1: Upperwear - Heavyweight Boxy Tee
INSERT INTO public.products (id, category_id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, base_price_uzs, discount_price_uzs, is_featured, is_active, is_in_stock)
VALUES (
    'p1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000002',
    'heavyweight-boxy-tee',
    'Og‘ir Paxtali Boxy Futbolka',
    'Футболка Heavyweight Boxy Fit',
    'Heavyweight Boxy Tee (280 GSM)',
    '100% organik paxtadan tayyorlangan 280 GSM zichlikdagi premium futbolka. Tushirilgan yelkali zamonaviy bichim.',
    'Плотная футболка из 100% органического хлопка плотностью 280 г/м². Спущенное плечо, идеальный оверсайз силуэт.',
    'Crafted from 280 GSM heavyweight organic combed cotton. Features a relaxed boxy drape, dropped shoulders, and reinforced collar.',
    280000,
    240000,
    TRUE,
    TRUE,
    TRUE
);

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', TRUE, 1),
('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80', FALSE, 2);

INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
('p1000000-0000-0000-0000-000000000001', 'S', 'Onyx Black', '#111111', 25),
('p1000000-0000-0000-0000-000000000001', 'M', 'Onyx Black', '#111111', 30),
('p1000000-0000-0000-0000-000000000001', 'L', 'Onyx Black', '#111111', 20),
('p1000000-0000-0000-0000-000000000001', 'XL', 'Onyx Black', '#111111', 15),
('p1000000-0000-0000-0000-000000000001', 'M', 'Vintage Oatmeal', '#E5E0D8', 22),
('p1000000-0000-0000-0000-000000000001', 'L', 'Vintage Oatmeal', '#E5E0D8', 18);

-- PRODUCT 2: Upperwear - Minimalist French Terry Hoodie
INSERT INTO public.products (id, category_id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, base_price_uzs, discount_price_uzs, is_featured, is_active, is_in_stock)
VALUES (
    'p1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000002',
    'minimalist-french-terry-hoodie',
    'Premium French Terry Xudi',
    'Худи оверсайз French Terry (450 GSM)',
    'Minimal French Terry Hoodie (450 GSM)',
    '450 GSM zichlikdagi og‘ir paxtali lyuks xudi. Qalin kapyushon, yashirin cho‘ntaklar va o‘zgarmas shakl.',
    'Ультра-плотный худи 450 GSM без шнурков в минималистичном стиле. Держит форму после множества стирок.',
    'Luxury 450 GSM loopback cotton hoodie. Double-layered structured hood with kangaroo pocket and seamless ribbing.',
    590000,
    520000,
    TRUE,
    TRUE,
    TRUE
);

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
('p1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', TRUE, 1),
('p1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80', FALSE, 2);

INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
('p1000000-0000-0000-0000-000000000002', 'S', 'Slate Grey', '#474B4E', 12),
('p1000000-0000-0000-0000-000000000002', 'M', 'Slate Grey', '#474B4E', 25),
('p1000000-0000-0000-0000-000000000002', 'L', 'Slate Grey', '#474B4E', 18),
('p1000000-0000-0000-0000-000000000002', 'M', 'Jet Black', '#0A0A0A', 30),
('p1000000-0000-0000-0000-000000000002', 'L', 'Jet Black', '#0A0A0A', 24);

-- PRODUCT 3: Headwear - Structured Washed Twill Cap
INSERT INTO public.products (id, category_id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, base_price_uzs, discount_price_uzs, is_featured, is_active, is_in_stock)
VALUES (
    'p1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000001',
    'structured-twill-cap',
    'Strukturali Paxtali Kepka',
    'Кепка из плотного твила с латунной застежкой',
    'Structured Washed Twill Cap',
    'Metall jez qisqichli, vintage ishlov berilgan 100% paxtali tvil kepka. Har qanday bosh o‘lchamiga moslashuvchan.',
    'Кепка из плотного стираного хлопка-твил с металлической винтажной пряжкой. Идеальная посадка.',
    'Premium 6-panel silhouette cut from durable washed cotton twill with an antique brass adjustment clasp.',
    195000,
    NULL,
    FALSE,
    TRUE,
    TRUE
);

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
('p1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80', TRUE, 1);

INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
('p1000000-0000-0000-0000-000000000003', 'One Size', 'Washed Olive', '#556B2F', 40),
('p1000000-0000-0000-0000-000000000003', 'One Size', 'Matte Black', '#151515', 50),
('p1000000-0000-0000-0000-000000000003', 'One Size', 'Ecru Khaki', '#C2B280', 35);

-- PRODUCT 4: Headwear - Ribbed Cashmere Wool Beanie
INSERT INTO public.products (id, category_id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, base_price_uzs, discount_price_uzs, is_featured, is_active, is_in_stock)
VALUES (
    'p1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000001',
    'ribbed-cashmere-wool-beanie',
    'Kashmir Junli Qalin Bini',
    'Шапка-бини из смеси кашемира и мериносовой шерсти',
    'Ribbed Cashmere-Wool Blend Beanie',
    'Merinos j褐i va kashmir qorishmasidan to‘qilgan mayin, issiq va shaklini yo‘qotmaydigan shapka.',
    'Ультра-мягкая шапка крупной вязки с отворотом из шерсти мериноса и кашемира. Тепло и элегантность.',
    'Spun from an insulating merino-cashmere blend. Features a dense ribbed knit and foldable cuff.',
    220000,
    185000,
    TRUE,
    TRUE,
    TRUE
);

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
('p1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=80', TRUE, 1);

INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
('p1000000-0000-0000-0000-000000000004', 'One Size', 'Heather Charcoal', '#333333', 25),
('p1000000-0000-0000-0000-000000000004', 'One Size', 'Camel Beige', '#C19A6B', 30);

-- PRODUCT 5: Bottomwear - Relaxed Pleated Wide Trousers
INSERT INTO public.products (id, category_id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, base_price_uzs, discount_price_uzs, is_featured, is_active, is_in_stock)
VALUES (
    'p1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000003',
    'relaxed-pleated-wide-trousers',
    'Keng Bichimli Bukmali Shim',
    'Брюки свободного кроя с защипами Wide-Leg',
    'Relaxed Pleated Wide Trousers',
    'Zamonaviy erkin siluetli, bukmali va qulay elastik bel qismli klassik matoli shim.',
    'Элегантные брюки широкого кроя с двойными защипами и драпирующейся костюмной тканью.',
    'Tailored from premium fluid drape suiting fabric. Double front pleats with tapered drape towards hem.',
    490000,
    420000,
    TRUE,
    TRUE,
    TRUE
);

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
('p1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80', TRUE, 1);

INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
('p1000000-0000-0000-0000-000000000005', '30 (S)', 'Midnight Navy', '#1C2833', 15),
('p1000000-0000-0000-0000-000000000005', '32 (M)', 'Midnight Navy', '#1C2833', 20),
('p1000000-0000-0000-0000-000000000005', '34 (L)', 'Midnight Navy', '#1C2833', 18),
('p1000000-0000-0000-0000-000000000005', '32 (M)', 'Charcoal Grey', '#2C3E50', 25),
('p1000000-0000-0000-0000-000000000005', '34 (L)', 'Charcoal Grey', '#2C3E50', 14);

-- PRODUCT 6: Footwear - Minimalist Leather Low Sneakers
INSERT INTO public.products (id, category_id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, base_price_uzs, discount_price_uzs, is_featured, is_active, is_in_stock)
VALUES (
    'p1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000004',
    'minimalist-leather-sneakers',
    'Tabiiy Charm Minimal Krossovka',
    'Кроссовки из натуральной итальянской кожи',
    'Minimalist Calf Leather Low Sneakers',
    'Haqiqiy silliq buzoq charmidan qo‘lda tikilgan, qulay yumshoq taglikli lyuks krossovkalar.',
    'Классические кеды из гладкой итальянской кожи с подошвой из натурального каучука Margom.',
    'Handcrafted in full-grain calfskin leather with a cushioned memory footbed and vulcanized rubber sole.',
    890000,
    790000,
    TRUE,
    TRUE,
    TRUE
);

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
('p1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80', TRUE, 1),
('p1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80', FALSE, 2);

INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
('p1000000-0000-0000-0000-000000000006', 'EU 40', 'Pure White', '#FFFFFF', 8),
('p1000000-0000-0000-0000-000000000006', 'EU 41', 'Pure White', '#FFFFFF', 15),
('p1000000-0000-0000-0000-000000000006', 'EU 42', 'Pure White', '#FFFFFF', 18),
('p1000000-0000-0000-0000-000000000006', 'EU 43', 'Pure White', '#FFFFFF', 12),
('p1000000-0000-0000-0000-000000000006', 'EU 44', 'Pure White', '#FFFFFF', 6),
('p1000000-0000-0000-0000-000000000006', 'EU 42', 'Triple Black', '#111111', 10);

-- PRODUCT 7: Accessories - Leather Crossbody Sling Bag
INSERT INTO public.products (id, category_id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, base_price_uzs, discount_price_uzs, is_featured, is_active, is_in_stock)
VALUES (
    'p1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000005',
    'leather-crossbody-sling-bag',
    'Charm Crossbody Yelka Sumkasi',
    'Кожаная сумка-кроссбоди с водоотталкивающей пропиткой',
    'Matte Leather Crossbody Sling Bag',
    'Suv o‘tkazmaydigan mot charm, YKK zamoklar va qulay yelkama tasma. Telefon, hamyon va kalitlar uchun ideal.',
    'Компактная городская сумка через плечо из матовой зернистой кожи с фурнитурой японского бренда YKK.',
    'Architectural crossbody silhouette rendered in matte pebbled leather. Features dual zipper compartments and padded nylon webbing strap.',
    370000,
    330000,
    TRUE,
    TRUE,
    TRUE
);

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
('p1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80', TRUE, 1);

INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
('p1000000-0000-0000-0000-000000000007', 'Standard', 'Matte Noir', '#181818', 25),
('p1000000-0000-0000-0000-000000000007', 'Standard', 'Espresso Brown', '#3B2F2F', 14);

-- PRODUCT 8: Seasonal Collection - Double-Breasted Wool Overcoat
INSERT INTO public.products (id, category_id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, base_price_uzs, discount_price_uzs, is_featured, is_active, is_in_stock)
VALUES (
    'p1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000006',
    'double-breasted-wool-overcoat',
    'Klassik Junli Ikki Qator Palto',
    'Шерстяное двубортное пальто Oversize',
    'Double-Breasted Heavy Wool Overcoat',
    '80% tabiiy jun matodan tikilgan, shamoldan himoya qiluvchi hashamatli qishki va kuzgi palto.',
    'Пальто прямого кроя из фактурной шерсти с шелковистой подкладкой. Символ безупречного стиля.',
    'Constructed from heavy 800 GSM wool melton. Peak lapels, horn buttons, deep internal welt pockets, and back vent.',
    1450000,
    1280000,
    TRUE,
    TRUE,
    TRUE
);

INSERT INTO public.product_images (product_id, image_url, is_primary, sort_order) VALUES
('p1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=1000&q=80', TRUE, 1);

INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
('p1000000-0000-0000-0000-000000000008', '48 (M)', 'Camel Tan', '#C19A6B', 10),
('p1000000-0000-0000-0000-000000000008', '50 (L)', 'Camel Tan', '#C19A6B', 8),
('p1000000-0000-0000-0000-000000000008', '52 (XL)', 'Camel Tan', '#C19A6B', 5),
('p1000000-0000-0000-0000-000000000008', '48 (M)', 'Onyx Black', '#111111', 12),
('p1000000-0000-0000-0000-000000000008', '50 (L)', 'Onyx Black', '#111111', 15);
