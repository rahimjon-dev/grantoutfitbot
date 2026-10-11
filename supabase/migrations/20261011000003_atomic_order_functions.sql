-- ============================================================
-- 3. ATOMIC ORDER CREATION & STOCK CONTROL RPC
-- ============================================================

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
    v_product RECORD;
    v_item_price BIGINT;
    v_item_total BIGINT;
    v_today_str VARCHAR(8);
    v_random_suffix VARCHAR(4);
    v_result JSONB;
BEGIN
    -- 1. Get or create user
    SELECT id INTO v_user_id FROM public.users WHERE telegram_id = p_telegram_id;
    IF v_user_id IS NULL THEN
        INSERT INTO public.users (telegram_id, first_name, phone_number, delivery_address, delivery_city)
        VALUES (p_telegram_id, p_customer_name, p_phone_number, p_delivery_address, p_delivery_city)
        RETURNING id INTO v_user_id;
    ELSE
        -- Update user details
        UPDATE public.users
        SET phone_number = COALESCE(p_phone_number, phone_number),
            delivery_address = COALESCE(p_delivery_address, delivery_address),
            delivery_city = COALESCE(p_delivery_city, delivery_city),
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    -- Validate items list
    IF jsonb_array_length(p_items) = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'CART_EMPTY', 'message', 'Cart is empty');
    END IF;

    -- 2. Generate unique order number: ORD-YYYYMMDD-XXXX
    v_today_str := to_char(NOW(), 'YYYYMMDD');
    v_random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    v_order_number := 'ORD-' || v_today_str || '-' || v_random_suffix;

    -- Create empty order record first to get order_id
    INSERT INTO public.orders (
        order_number,
        user_id,
        telegram_id,
        customer_name,
        phone_number,
        delivery_address,
        delivery_city,
        delivery_notes,
        payment_method,
        subtotal_uzs,
        delivery_fee_uzs,
        total_amount_uzs,
        status
    ) VALUES (
        v_order_number,
        v_user_id,
        p_telegram_id,
        p_customer_name,
        p_phone_number,
        p_delivery_address,
        p_delivery_city,
        p_delivery_notes,
        p_payment_method,
        0,
        0,
        0,
        'pending'
    ) RETURNING id INTO v_order_id;

    -- 3. Loop through items, lock variant rows FOR UPDATE to prevent race conditions & overselling
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Lock variant row
        SELECT pv.*, p.name_uz, p.name_ru, p.name_en, p.base_price_uzs, p.discount_price_uzs, p.is_active
        INTO v_variant
        FROM public.product_variants pv
        JOIN public.products p ON pv.product_id = p.id
        WHERE pv.id = (v_item->>'variant_id')::UUID
        FOR UPDATE OF pv;

        IF NOT FOUND THEN
            -- Rollback automatically on error
            RAISE EXCEPTION 'ITEM_NOT_FOUND: Variant % does not exist', (v_item->>'variant_id');
        END IF;

        -- Check stock
        IF v_variant.stock_quantity < (v_item->>'quantity')::INT THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: Item "%" (% / %) only has % units in stock', 
                v_variant.name_en, v_variant.size, v_variant.color_name, v_variant.stock_quantity;
        END IF;

        -- Determine price (use discount if set)
        v_item_price := COALESCE(v_variant.discount_price_uzs, v_variant.base_price_uzs) + COALESCE(v_variant.additional_price_uzs, 0);
        v_item_total := v_item_price * (v_item->>'quantity')::INT;
        v_subtotal := v_subtotal + v_item_total;

        -- Get product primary image
        DECLARE
            v_image_url TEXT := '';
        BEGIN
            SELECT image_url INTO v_image_url
            FROM public.product_images
            WHERE product_id = v_variant.product_id
            ORDER BY is_primary DESC, sort_order ASC
            LIMIT 1;

            -- Insert order item
            INSERT INTO public.order_items (
                order_id,
                product_id,
                variant_id,
                product_name,
                selected_size,
                selected_color,
                unit_price_uzs,
                quantity,
                total_price_uzs,
                product_image_url
            ) VALUES (
                v_order_id,
                v_variant.product_id,
                v_variant.id,
                v_variant.name_en,
                v_variant.size,
                v_variant.color_name,
                v_item_price,
                (v_item->>'quantity')::INT,
                v_item_total,
                v_image_url
            );
        END;

        -- Safely reduce stock
        UPDATE public.product_variants
        SET stock_quantity = stock_quantity - (v_item->>'quantity')::INT
        WHERE id = v_variant.id;

        -- Update product sales count
        UPDATE public.products
        SET sales_count = sales_count + (v_item->>'quantity')::INT
        WHERE id = v_variant.product_id;

        -- Delete from user cart
        DELETE FROM public.cart_items
        WHERE user_id = v_user_id AND variant_id = v_variant.id;
    END LOOP;

    -- Free delivery if order >= 500,000 UZS, otherwise standard 30,000 UZS
    IF v_subtotal >= 500000 THEN
        v_delivery_fee := 0;
    ELSE
        v_delivery_fee := 30000;
    END IF;

    v_total_amount := v_subtotal + v_delivery_fee;

    -- Update final order totals
    UPDATE public.orders
    SET subtotal_uzs = v_subtotal,
        delivery_fee_uzs = v_delivery_fee,
        total_amount_uzs = v_total_amount
    WHERE id = v_order_id;

    -- Insert into order status history
    INSERT INTO public.order_status_history (
        order_id,
        previous_status,
        new_status,
        changed_by,
        notes
    ) VALUES (
        v_order_id,
        NULL,
        'pending',
        'customer',
        'Order placed via Mini App'
    );

    -- Log user activity
    INSERT INTO public.user_activity (
        user_id,
        telegram_id,
        action,
        metadata
    ) VALUES (
        v_user_id,
        p_telegram_id,
        'order_placed',
        jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'total', v_total_amount)
    );

    -- Return JSON payload of created order
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
    -- Any exception rolls back entire transaction
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to place order: ' || SQLERRM
    );
END;
$$;
