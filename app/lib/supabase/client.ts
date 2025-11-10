import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance to avoid multiple GoTrueClient instances
let supabaseClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient {
  // Return existing client if already created
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Create singleton client instance
  // Use standard Supabase client for browser - it handles auth automatically via localStorage
  // This is more reliable than the SSR client for client-side operations
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  return supabaseClient;
}
