-- ============================================================
-- GRANT LUXURY OUTFITBOT — COMPLETE ALL-IN-ONE SUPABASE SQL SETUP
-- Run this script in: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    username VARCHAR(100),
    phone_number VARCHAR(50),
    language_code VARCHAR(10) DEFAULT 'uz',
    delivery_address TEXT,
    delivery_city VARCHAR(100) DEFAULT 'Tashkent',
    is_blocked BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_language ON public.users(language_code);

-- 3. USER ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_telegram_id ON public.user_activity(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON public.user_activity(action);

-- 4. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_uz VARCHAR(150) NOT NULL,
    name_ru VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    description_en TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    name_uz VARCHAR(200) NOT NULL,
    name_ru VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    description_en TEXT,
    base_price_uzs BIGINT NOT NULL,
    discount_price_uzs BIGINT DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_in_stock BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);

-- 7. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- 8. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(50) NOT NULL,
    color_name VARCHAR(50) NOT NULL,
    color_hex VARCHAR(20) DEFAULT '#000000',
    sku VARCHAR(100),
    stock_quantity INT NOT NULL DEFAULT 0,
    additional_price_uzs BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_product_size_color UNIQUE (product_id, size, color_name)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- 9. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_variant_cart UNIQUE (user_id, variant_id)
);

-- 10. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    telegram_id BIGINT NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) DEFAULT 'Tashkent',
    delivery_notes TEXT,
    payment_method VARCHAR(50) DEFAULT 'cash_on_delivery',
    subtotal_uzs BIGINT NOT NULL,
    delivery_fee_uzs BIGINT DEFAULT 0,
    total_amount_uzs BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    tracking_number VARCHAR(100),
    dispatch_notes TEXT,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_telegram_id ON public.orders(telegram_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 11. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    selected_size VARCHAR(50) NOT NULL,
    selected_color VARCHAR(50) NOT NULL,
    unit_price_uzs BIGINT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price_uzs BIGINT NOT NULL,
    product_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 12. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(100) DEFAULT 'system',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    target_language VARCHAR(10) DEFAULT 'all',
    sent_by BIGINT,
    total_targeted INT DEFAULT 0,
    total_delivered INT DEFAULT 0,
    total_failed INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Public can view product variants" ON public.product_variants FOR SELECT USING (TRUE);

CREATE POLICY "Public can read users" ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "Public can insert users" ON public.users FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can update users" ON public.users FOR UPDATE USING (TRUE);

CREATE POLICY "Public can manage orders" ON public.orders FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public can manage order items" ON public.order_items FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public can manage cart" ON public.cart_items FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public can insert activity" ON public.user_activity FOR INSERT WITH CHECK (TRUE);

-- 15. ATOMIC ORDER CREATION RPC
CREATE OR REPLACE FUNCTION public.create_order_atomic(
    p_telegram_id BIGINT,
    p_customer_name VARCHAR,
    p_phone_number VARCHAR,
    p_delivery_address TEXT,
    p_delivery_city VARCHAR DEFAULT 'Tashkent',
    p_delivery_notes TEXT DEFAULT NULL,
    p_payment_method VARCHAR DEFAULT 'cash_on_delivery',
    p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_order_id UUID;
    v_order_number VARCHAR(50);
    v_subtotal BIGINT := 0;
    v_delivery_fee BIGINT := 0;
    v_total_amount BIGINT := 0;
    v_item JSONB;
    v_variant RECORD;
    v_item_price BIGINT;
    v_item_total BIGINT;
    v_today_str VARCHAR(8);
    v_random_suffix VARCHAR(4);
    v_result JSONB;
BEGIN
    SELECT id INTO v_user_id FROM public.users WHERE telegram_id = p_telegram_id;
    IF v_user_id IS NULL THEN
        INSERT INTO public.users (telegram_id, first_name, phone_number, delivery_address, delivery_city)
        VALUES (p_telegram_id, p_customer_name, p_phone_number, p_delivery_address, p_delivery_city)
        RETURNING id INTO v_user_id;
    ELSE
        UPDATE public.users
        SET phone_number = COALESCE(p_phone_number, phone_number),
            delivery_address = COALESCE(p_delivery_address, delivery_address),
            delivery_city = COALESCE(p_delivery_city, delivery_city),
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    IF jsonb_array_length(p_items) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'CART_EMPTY', 'message', 'Cart is empty');
    END IF;

    v_today_str := to_char(NOW(), 'YYYYMMDD');
    v_random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    v_order_number := 'ORD-' || v_today_str || '-' || v_random_suffix;

    INSERT INTO public.orders (
        order_number, user_id, telegram_id, customer_name, phone_number,
        delivery_address, delivery_city, delivery_notes, payment_method,
        subtotal_uzs, delivery_fee_uzs, total_amount_uzs, status
    ) VALUES (
        v_order_number, v_user_id, p_telegram_id, p_customer_name, p_phone_number,
        p_delivery_address, p_delivery_city, p_delivery_notes, p_payment_method,
        0, 0, 0, 'pending'
    ) RETURNING id INTO v_order_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT pv.*, p.name_en, p.base_price_uzs, p.discount_price_uzs
        INTO v_variant
        FROM public.product_variants pv
        JOIN public.products p ON pv.product_id = p.id
        WHERE pv.id = (v_item->>'variant_id')::UUID
        FOR UPDATE OF pv;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'ITEM_NOT_FOUND: Variant % does not exist', (v_item->>'variant_id');
        END IF;

        IF v_variant.stock_quantity < (v_item->>'quantity')::INT THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: Item "%" (% / %) only has % units in stock', 
                v_variant.name_en, v_variant.size, v_variant.color_name, v_variant.stock_quantity;
        END IF;

        v_item_price := COALESCE(v_variant.discount_price_uzs, v_variant.base_price_uzs) + COALESCE(v_variant.additional_price_uzs, 0);
        v_item_total := v_item_price * (v_item->>'quantity')::INT;
        v_subtotal := v_subtotal + v_item_total;

        DECLARE
            v_image_url TEXT := '';
        BEGIN
            SELECT image_url INTO v_image_url
            FROM public.product_images
            WHERE product_id = v_variant.product_id
            ORDER BY is_primary DESC, sort_order ASC
            LIMIT 1;

            INSERT INTO public.order_items (
                order_id, product_id, variant_id, product_name, selected_size,
                selected_color, unit_price_uzs, quantity, total_price_uzs, product_image_url
            ) VALUES (
                v_order_id, v_variant.product_id, v_variant.id, v_variant.name_en,
                v_variant.size, v_variant.color_name, v_item_price,
                (v_item->>'quantity')::INT, v_item_total, v_image_url
            );
        END;

        UPDATE public.product_variants
        SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT
        WHERE id = v_variant.id;

        UPDATE public.products
        SET sales_count = sales_count + (v_item->>'quantity')::INT
        WHERE id = v_variant.product_id;

        DELETE FROM public.cart_items
        WHERE user_id = v_user_id AND variant_id = v_variant.id;
    END LOOP;

    IF v_subtotal >= 500000 THEN
        v_delivery_fee := 0;
    ELSE
        v_delivery_fee := 30000;
    END IF;

    v_total_amount := v_subtotal + v_delivery_fee;

    UPDATE public.orders
    SET subtotal_uzs = v_subtotal,
        delivery_fee_uzs = v_delivery_fee,
        total_amount_uzs = v_total_amount
    WHERE id = v_order_id;

    INSERT INTO public.order_status_history (order_id, previous_status, new_status, changed_by, notes)
    VALUES (v_order_id, NULL, 'pending', 'customer', 'Order placed via Mini App');

    SELECT jsonb_build_object(
        'success', true,
        'order_id', o.id,
        'order_number', o.order_number,
        'total_amount_uzs', o.total_amount_uzs,
        'subtotal_uzs', o.subtotal_uzs,
        'delivery_fee_uzs', o.delivery_fee_uzs,
        'status', o.status,
        'created_at', o.created_at,
        'customer_name', o.customer_name,
        'phone_number', o.phone_number,
        'delivery_address', o.delivery_address
    ) INTO v_result
    FROM public.orders o
    WHERE o.id = v_order_id;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to place order: ' || SQLERRM
    );
END;
$$;

-- 16. SEED CATALOG
INSERT INTO public.categories (id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, image_url, sort_order)
VALUES
('c1000000-0000-0000-0000-000000000001', 'headwear', 'Bosh kiyimlar', 'Головные уборы', 'Headwear', 'Kepkalar, panamalar, bini va zamonaviy shapkalar to‘plami', 'Кепки, панамы, бини и стильные шапки для любого сезона', 'Premium caps, beanies, and hats crafted for modern silhouettes', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80', 1),
('c1000000-0000-0000-0000-000000000002', 'upperwear', 'Ustki kiyimlar', 'Верхняя одежда', 'Upperwear', 'Futbolkalar, ko‘ylaklar, xudi, svitshotlar va kurtkalar', 'Футболки, рубашки, худи, свитшоты, куртки и пальто', 'Minimalist t-shirts, oversized hoodies, tailored jackets and overcoats', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', 2),
('c1000000-0000-0000-0000-000000000003', 'bottomwear', 'Pastki kiyimlar', 'Брюки и джинсы', 'Bottomwear', 'Klassik shimlar, jinsilar, joggerlar va shortilar', 'Брюки классического кроя, премиальный деним, джоггеры и шорты', 'Tailored trousers, raw denim jeans, relaxed cargo pants and joggers', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', 3),
('c1000000-0000-0000-0000-000000000004', 'footwear', 'Oyoq kiyimlar', 'Обувь', 'Footwear', 'Krossovkalar, klassik tufli, etiklar va qulay poyabzallar', 'Кроссовки, кожаные ботинки, лоферы и минималистичная обувь', 'Handcrafted leather boots, architectural sneakers, and luxury loafers', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80', 4),
('c1000000-0000-0000-0000-000000000005', 'accessories', 'Aksessuarlar', 'Аксессуары', 'Accessories', 'Soatlar, charm kamarlar, sumkalar, hamyonlar va quyosh ko‘zoynaklari', 'Часы, кожаные ремни, сумки через плечо, портмоне и солнцезащитные очки', 'Luxury leather bags, stainless steel timepieces, eyewear and wallets', 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80', 5),
('c1000000-0000-0000-0000-000000000006', 'seasonal-collection', 'Mavsumiy to‘plam', 'Сезонная коллекция', 'Seasonal Collection', 'Cheklangan tirajdagi kuz-qish va bahor-yoz eksklyuziv liboslar', 'Лимитированная капсула: шерстяные пальто, тренчи и демисезонные образы', 'Curated capsule collection with seasonal knitwear, trench coats, and outerwear', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', 6)
ON CONFLICT (id) DO NOTHING;

-- INSERT PRODUCTS
INSERT INTO public.products (id, category_id, slug, name_uz, name_ru, name_en, description_uz, description_ru, description_en, base_price_uzs, discount_price_uzs, is_featured, is_active, is_in_stock)
VALUES
('p1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'heavyweight-boxy-tee', 'Og‘ir Paxtali Boxy Futbolka', 'Футболка Heavyweight Boxy Fit', 'Heavyweight Boxy Tee (280 GSM)', '100% organik paxtadan tayyorlangan 280 GSM zichlikdagi premium futbolka.', 'Плотная футболка из 100% органического хлопка плотностью 280 г/м².', 'Crafted from 280 GSM heavyweight organic combed cotton.', 280000, 240000, TRUE, TRUE, TRUE),
('p1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'minimalist-french-terry-hoodie', 'Premium French Terry Xudi', 'Худи оверсайз French Terry (450 GSM)', 'Minimal French Terry Hoodie (450 GSM)', '450 GSM zichlikdagi og‘ir paxtali lyuks xudi.', 'Ультра-плотный худи 450 GSM без шнурков в минималистичном стиле.', 'Luxury 450 GSM loopback cotton hoodie.', 590000, 520000, TRUE, TRUE, TRUE),
('p1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'structured-twill-cap', 'Strukturali Paxtali Kepka', 'Кепка из плотного твила с латунной застежкой', 'Structured Washed Twill Cap', 'Metall jez qisqichli, vintage ishlov berilgan 100% paxtali tvil kepka.', 'Кепка из плотного стираного хлопка-твил с металлической винтажной пряжкой.', 'Premium 6-panel silhouette cut from durable washed cotton twill.', 195000, NULL, FALSE, TRUE, TRUE),
('p1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'ribbed-cashmere-wool-beanie', 'Kashmir Junli Qalin Bini', 'Шапка-бини из смеси кашемира и мериносовой шерсти', 'Ribbed Cashmere-Wool Blend Beanie', 'Merinos juni va kashmir qorishmasidan to‘qilgan mayin, issiq bini shapka.', 'Ультра-мягкая шапка крупной вязки с отворотом из шерсти мериноса.', 'Spun from an insulating merino-cashmere blend.', 220000, 185000, TRUE, TRUE, TRUE),
('p1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'relaxed-pleated-wide-trousers', 'Keng Bichimli Bukmali Shim', 'Брюки свободного кроя с защипами Wide-Leg', 'Relaxed Pleated Wide Trousers', 'Zamonaviy erkin siluetli, bukmali va qulay klassik shim.', 'Элегантные брюки широкого кроя с двойными защипами.', 'Tailored from premium fluid drape suiting fabric.', 490000, 420000, TRUE, TRUE, TRUE),
('p1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000004', 'minimalist-leather-sneakers', 'Tabiiy Charm Minimal Krossovka', 'Кроссовки из натуральной итальянской кожи', 'Minimalist Calf Leather Low Sneakers', 'Haqiqiy silliq buzoq charmidan qo‘lda tikilgan krossovkalar.', 'Классические кеды из гладкой итальянской кожи.', 'Handcrafted in full-grain calfskin leather.', 890000, 790000, TRUE, TRUE, TRUE),
('p1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000005', 'leather-crossbody-sling-bag', 'Charm Crossbody Yelka Sumkasi', 'Кожаная сумка-кроссбоди с водоотталкивающей пропиткой', 'Matte Leather Crossbody Sling Bag', 'Suv o‘tkazmaydigan mot charm, YKK zamoklar va qulay yelkama tasma.', 'Компактная городская сумка через плечо из матовой зернистой кожи.', 'Architectural crossbody silhouette rendered in matte pebbled leather.', 370000, 330000, TRUE, TRUE, TRUE),
('p1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000006', 'double-breasted-wool-overcoat', 'Klassik Junli Ikki Qator Palto', 'Шерстяное двубортное пальто Oversize', 'Double-Breasted Heavy Wool Overcoat', '80% tabiiy jun matodan tikilgan hashamatli qishki va kuzgi palto.', 'Пальто прямого кроя из фактурной шерсти с шелковистой подкладкой.', 'Constructed from heavy 800 GSM wool melton.', 1450000, 1280000, TRUE, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- INSERT IMAGES
INSERT INTO public.product_images (product_id, image_url, is_primary) VALUES
('p1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80', TRUE),
('p1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', TRUE),
('p1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1000&q=80', TRUE),
('p1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=80', TRUE),
('p1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80', TRUE),
('p1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80', TRUE),
('p1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80', TRUE),
('p1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1539533018447-63fcce667823?auto=format&fit=crop&w=1000&q=80', TRUE);

-- INSERT VARIANTS
INSERT INTO public.product_variants (product_id, size, color_name, color_hex, stock_quantity) VALUES
('p1000000-0000-0000-0000-000000000001', 'M', 'Onyx Black', '#111111', 30),
('p1000000-0000-0000-0000-000000000001', 'L', 'Onyx Black', '#111111', 20),
('p1000000-0000-0000-0000-000000000002', 'M', 'Slate Grey', '#474B4E', 25),
('p1000000-0000-0000-0000-000000000002', 'L', 'Jet Black', '#0A0A0A', 20),
('p1000000-0000-0000-0000-000000000003', 'One Size', 'Washed Olive', '#556B2F', 40),
('p1000000-0000-0000-0000-000000000004', 'One Size', 'Heather Charcoal', '#333333', 25),
('p1000000-0000-0000-0000-000000000005', '32 (M)', 'Midnight Navy', '#1C2833', 20),
('p1000000-0000-0000-0000-000000000006', 'EU 42', 'Pure White', '#FFFFFF', 18),
('p1000000-0000-0000-0000-000000000007', 'Standard', 'Matte Noir', '#181818', 25),
('p1000000-0000-0000-0000-000000000008', '50 (L)', 'Camel Tan', '#C19A6B', 15)
ON CONFLICT DO NOTHING;
