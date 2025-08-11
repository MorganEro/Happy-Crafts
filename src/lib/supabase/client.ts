import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';
import { config } from './config';

/**
 * Creates a Supabase client for the browser with optional JWT
 */
function createSupabaseClient(jwt?: string) {
  return createBrowserClient<Database>(
    config.url,
    config.anonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        ...(jwt && { session: { access_token: jwt, token_type: 'bearer', user: {} } })
      },
      cookies: {
        get(name: string) {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return undefined;
        },
        set(name: string, value: string, options: any) {
          document.cookie = `${name}=${value}; ${Object.entries(options).map(
            ([key, val]) => `${key}=${val}`
          ).join('; ')}`;
        },
        remove(name: string, options: any) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${options.domain ? `domain=${options.domain};` : ''}`;
        }
      },
    }
  );
}

// Export a singleton instance of the Supabase client
const supabase = createSupabaseClient();

export { supabase, createSupabaseClient };
