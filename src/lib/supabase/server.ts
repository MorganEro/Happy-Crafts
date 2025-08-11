import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { config } from './config';

/**
 * Creates a server-side Supabase client
 * This is a simplified version that doesn't handle cookies
 * For auth, we'll rely on the client-side auth flow
 */
export function createServerSupabaseClient() {
  return createClient<Database>(
    config.url,
    config.anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-From-Server-Component': 'true',
        },
      },
    }
  );
}
