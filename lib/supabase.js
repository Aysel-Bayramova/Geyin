import { createClient } from '@supabase/supabase-js';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
    rawAnonKey &&
    rawUrl !== PLACEHOLDER_URL &&
    rawAnonKey !== PLACEHOLDER_KEY &&
    !rawUrl.includes('your-project-ref')
);

let hasWarnedMissingEnv = false;

if (!isSupabaseConfigured && process.env.NODE_ENV === 'development' && !hasWarnedMissingEnv) {
  hasWarnedMissingEnv = true;
  console.warn(
    '[Geyin] Supabase environment variables are missing or using placeholders. ' +
      'Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

const supabaseUrl = rawUrl || PLACEHOLDER_URL;
const supabaseAnonKey = rawAnonKey || PLACEHOLDER_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
