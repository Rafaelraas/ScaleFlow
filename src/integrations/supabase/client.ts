import { createClient } from '@supabase/supabase-js';

// Load Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Flag to indicate if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a dummy client for demo mode when env vars are missing
const createDummyClient = () => {
  console.warn(
    'Supabase environment variables are not configured. Running in demo mode. ' +
    'To enable full functionality, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
  // Use placeholder values that won't actually connect
  return createClient(
    'https://placeholder.supabase.co',
    'placeholder-anon-key'
  );
};

// Export either a real client or a dummy client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyClient();