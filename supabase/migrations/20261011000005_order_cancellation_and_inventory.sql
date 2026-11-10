-- ============================================================
-- 5. ORDER CANCELLATION & REAL ANALYTICS RPC
-- ============================================================

-- Function to atomically cancel an order, restore inventory stock, and log history
CREATE OR REPLACE FUNCTION public.cancel_order_atomic(
    p_order_id UUID,
    p_changed_by VARCHAR DEFAULT 'system',
    p_reason TEXT DEFAULT 'Cancelled by admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_prev_status VARCHAR(50);
BEGIN
    -- 1. Lock the order row for update
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'ORDER_NOT_FOUND',
            'message', 'Order not found'
        );
    END IF;

    v_prev_status := v_order.status;

    -- 2. Prevent duplicate stock restoration
    IF v_prev_status = 'cancelled' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'ALREADY_CANCELLED',
            'message', 'Order is already cancelled. Stock was already restored.'
        );
    END IF;

    -- 3. Restore stock quantity for each order item
    FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
    LOOP
        IF v_item.variant_id IS NOT NULL THEN
            UPDATE public.product_variants
            SET stock_quantity = stock_quantity + v_item.quantity,
                updated_at = NOW()
            WHERE id = v_item.variant_id;
        END IF;

        IF v_item.product_id IS NOT NULL THEN
            UPDATE public.products
            SET sales_count = GREATEST(0, sales_count - v_item.quantity),
                updated_at = NOW()
            WHERE id = v_item.product_id;
        END IF;
    END LOOP;

    -- 4. Update order status to cancelled
    UPDATE public.orders
    SET status = 'cancelled',
        cancelled_reason = p_reason,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- 5. Record in status history
    INSERT INTO public.order_status_history (
        order_id,
        previous_status,
        new_status,
        changed_by,
        notes
    ) VALUES (
        p_order_id,
        v_prev_status,
        'cancelled',
        p_changed_by,
        p_reason
    );

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'order_number', v_order.order_number,
        'previous_status', v_prev_status,
        'status', 'cancelled',
        'message', 'Order cancelled successfully and stock was restored'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to cancel order: ' || SQLERRM
    );
END;
$$;

-- Function to get real-time aggregated dashboard analytics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_users INT;
    v_active_users INT;
    v_new_users_today INT;
    v_total_products INT;
    v_total_categories INT;
    v_total_orders INT;
    v_pending_orders INT;
    v_completed_orders INT;
    v_cancelled_orders INT;
    v_total_revenue BIGINT;
    v_top_selling JSONB;
BEGIN
    SELECT COUNT(*) INTO v_total_users FROM public.users;
    SELECT COUNT(*) INTO v_active_users FROM public.users WHERE last_active_at >= NOW() - INTERVAL '7 days';
    SELECT COUNT(*) INTO v_new_users_today FROM public.users WHERE created_at >= date_trunc('day', NOW());

    SELECT COUNT(*) INTO v_total_products FROM public.products WHERE is_active = TRUE;
    SELECT COUNT(*) INTO v_total_categories FROM public.categories WHERE is_active = TRUE;

    SELECT COUNT(*) INTO v_total_orders FROM public.orders;
    SELECT COUNT(*) INTO v_pending_orders FROM public.orders WHERE status = 'pending';
    SELECT COUNT(*) INTO v_completed_orders FROM public.orders WHERE status = 'delivered';
    SELECT COUNT(*) INTO v_cancelled_orders FROM public.orders WHERE status = 'cancelled';

    SELECT COALESCE(SUM(total_amount_uzs), 0) INTO v_total_revenue
    FROM public.orders
    WHERE status NOT IN ('cancelled');

    -- Top 5 selling products with images
    SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb) INTO v_top_selling
    FROM (
        SELECT 
            p.id,
            p.name_uz,
            p.name_en,
            p.sales_count AS sales,
            (p.sales_count * COALESCE(p.discount_price_uzs, p.base_price_uzs)) AS revenue,
            (
                SELECT image_url 
                FROM public.product_images 
                WHERE product_id = p.id 
                ORDER BY is_primary DESC, sort_order ASC 
                LIMIT 1
            ) AS image
        FROM public.products p
        WHERE p.is_active = TRUE
        ORDER BY p.sales_count DESC
        LIMIT 5
    ) sub;

    RETURN jsonb_build_object(
        'totalUsers', v_total_users,
        'activeUsers', v_active_users,
        'newUsersToday', v_new_users_today,
        'totalProducts', v_total_products,
        'availableProducts', v_total_products,
        'totalCategories', v_total_categories,
        'totalOrders', v_total_orders,
        'pendingOrders', v_pending_orders,
        'completedOrders', v_completed_orders,
        'cancelledOrders', v_cancelled_orders,
        'totalRevenueUzs', v_total_revenue,
        'topSellingProducts', v_top_selling
    );
END;
$$;
