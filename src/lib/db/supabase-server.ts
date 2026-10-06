import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverClientInstance: SupabaseClient | null = null;

/**
 * Returns a Supabase client with administrative / service_role privileges.
 * 
 * SECURITY INVARIANT:
 * This client must ONLY ever be instantiated on the server.
 * Never import or execute this module in client components or browser runtime.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('FATAL SECURITY VIOLATION: getSupabaseServerClient() attempted on client-side / browser runtime.');
  }

  if (serverClientInstance) {
    return serverClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Supabase URL is not configured. Check NEXT_PUBLIC_SUPABASE_URL in server environment.');
  }

  if (!supabaseSecretKey) {
    throw new Error('SUPABASE_SECRET_KEY is not configured in server environment.');
  }

  serverClientInstance = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClientInstance;
}
