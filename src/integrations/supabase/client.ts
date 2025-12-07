import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '@/config/env';
import { logger } from '@/utils/logger';

// Create a dummy client for demo mode when env vars are missing
const createDummyClient = () => {
  logger.warn(
    'Supabase environment variables are not configured. Running in demo mode. ' +
      'To enable full functionality, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
  // Use placeholder values that won't actually connect
  return createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
};

// Export either a real client or a dummy client
export const supabase = isSupabaseConfigured
  ? createClient(config.supabase.url, config.supabase.anonKey)
  : createDummyClient();

// Re-export the configuration flag for backward compatibility
export { isSupabaseConfigured };
