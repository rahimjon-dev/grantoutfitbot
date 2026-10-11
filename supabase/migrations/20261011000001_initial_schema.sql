-- ============================================================
-- 1. INITIAL SCHEMA: GRANT OUTFITBOT DATABASE
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    username VARCHAR(100),
    phone_number VARCHAR(50),
    language_code VARCHAR(10) DEFAULT 'uz', -- 'uz', 'ru', 'en'
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

-- 2. USER ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'bot_start', 'view_store', 'add_to_cart', 'order_placed', 'blocked_bot', 'unblocked_bot', 'change_language'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_telegram_id ON public.user_activity(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON public.user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at);

-- 3. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- 'superadmin', 'admin', 'manager'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
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

-- 5. PRODUCTS TABLE
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
    base_price_uzs BIGINT NOT NULL, -- Stored as integer in Uzbek so'm (UZS)
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
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- 6. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);

-- 7. PRODUCT VARIANTS TABLE (Size, Color, Specific Stock)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size VARCHAR(50) NOT NULL, -- e.g., 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Standard'
    color_name VARCHAR(50) NOT NULL, -- e.g., 'Midnight Black', 'Oatmeal', 'Navy'
    color_hex VARCHAR(20) DEFAULT '#000000',
    sku VARCHAR(100),
    stock_quantity INT NOT NULL DEFAULT 0,
    additional_price_uzs BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_product_size_color UNIQUE (product_id, size, color_name)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);

-- 8. CART ITEMS TABLE
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

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);

-- 9. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., ORD-20261011-8492
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    telegram_id BIGINT NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) DEFAULT 'Tashkent',
    delivery_notes TEXT,
    payment_method VARCHAR(50) DEFAULT 'cash_on_delivery', -- 'cash_on_delivery', 'card_on_delivery', 'manual_transfer'
    subtotal_uzs BIGINT NOT NULL,
    delivery_fee_uzs BIGINT DEFAULT 0,
    total_amount_uzs BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
    tracking_number VARCHAR(100),
    dispatch_notes TEXT,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_telegram_id ON public.orders(telegram_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- 10. ORDER ITEMS TABLE
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

-- 11. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(100) DEFAULT 'system', -- 'system', 'admin:123456789'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- 12. NOTIFICATIONS & BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    target_language VARCHAR(10) DEFAULT 'all', -- 'all', 'uz', 'ru', 'en'
    sent_by BIGINT,
    total_targeted INT DEFAULT 0,
    total_delivered INT DEFAULT 0,
    total_failed INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sending', 'completed', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_product_variants_updated_at BEFORE UPDATE ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
