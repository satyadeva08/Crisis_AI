import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client — single shared instance.
 *
 * Reads connection details from environment variables:
 *   VITE_SUPABASE_URL      — your Supabase project URL
 *   VITE_SUPABASE_ANON_KEY — the publishable (anon) API key
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
