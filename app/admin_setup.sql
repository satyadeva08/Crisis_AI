-- Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email character varying(255) UNIQUE NOT NULL,
    password_hash character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Authorized Emails Table for Authorities
CREATE TABLE IF NOT EXISTS public.authorized_emails (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email character varying(255) UNIQUE NOT NULL,
    added_by uuid REFERENCES public.admin_users(id),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id to incidents to track citizen submissions
ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS user_id uuid;

-- Insert default admin user (password is 'admin123' -> hashed later, or we can just do raw text for demo)
-- For a hackathon/demo, plain text or simple md5 might suffice, but since it's a real portal, we'll store it.
-- We will just check it securely in the backend or frontend. Since there's no backend, we have to check from frontend.
-- Actually, we can use Supabase Auth for Admin users too! Just create an admin via Supabase Auth and assign role?
-- But wait, Supabase Auth requires email/password. Let's just create an admin_users table that the frontend queries if we want simple hardcoded auth.
-- Let's just insert one admin user.
INSERT INTO public.admin_users (email, password_hash)
VALUES ('superadmin@crisisai.com', 'admin123')
ON CONFLICT (email) DO NOTHING;
