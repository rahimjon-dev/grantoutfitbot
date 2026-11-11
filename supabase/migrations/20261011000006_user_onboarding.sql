-- ============================================================
-- 6. USER ONBOARDING, PROFILE & PHONE VERIFICATION ENHANCEMENT
-- ============================================================

-- Add onboarding, verification, and registration tracking columns to public.users if not present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone_verified') THEN
        ALTER TABLE public.users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'registration_status') THEN
        ALTER TABLE public.users ADD COLUMN registration_status VARCHAR(30) DEFAULT 'unregistered';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'registered_at') THEN
        ALTER TABLE public.users ADD COLUMN registered_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create index on registration_status for fast queries
CREATE INDEX IF NOT EXISTS idx_users_registration_status ON public.users(registration_status);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);

-- Update existing users who already have a phone number to 'completed' status
UPDATE public.users 
SET registration_status = 'completed', 
    phone_verified = COALESCE(phone_verified, true),
    registered_at = COALESCE(registered_at, created_at, NOW())
WHERE phone_number IS NOT NULL AND (registration_status IS NULL OR registration_status = 'unregistered');
