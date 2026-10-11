-- ============================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on tables
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

-- 1. PUBLIC READ ACCESS FOR CATALOG
CREATE POLICY "Public can view active categories"
ON public.categories FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Public can view product images"
ON public.product_images FOR SELECT
USING (TRUE);

CREATE POLICY "Public can view product variants"
ON public.product_variants FOR SELECT
USING (TRUE);

-- 2. SERVICE ROLE FULL ACCESS (Used by Node.js backend & Telegram Bot)
-- Supabase automatically grants full access to service_role, but explicit policies ensure no lockouts:
CREATE POLICY "Service role full access on users"
ON public.users FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on user_activity"
ON public.user_activity FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on categories"
ON public.categories FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on products"
ON public.products FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on product_images"
ON public.product_images FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on product_variants"
ON public.product_variants FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on cart_items"
ON public.cart_items FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on orders"
ON public.orders FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on order_items"
ON public.order_items FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on order_status_history"
ON public.order_status_history FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on admin_users"
ON public.admin_users FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Service role full access on notifications"
ON public.notifications FOR ALL
TO service_role
USING (TRUE) WITH CHECK (TRUE);
