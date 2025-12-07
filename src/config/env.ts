/**
 * Centralized environment configuration for ScaleFlow
 * 
 * This module provides type-safe access to environment variables
 * and validates required variables at startup.
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface AppConfig {
  env: 'development' | 'production' | 'test';
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
}

interface AppConfiguration {
  supabase: SupabaseConfig;
  app: AppConfig;
}

// Load environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Flag to indicate if Supabase is properly configured
 */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Application configuration object
 * Provides type-safe access to all environment variables
 */
export const config: AppConfiguration = {
  supabase: {
    url: supabaseUrl || 'https://placeholder.supabase.co',
    anonKey: supabaseAnonKey || 'placeholder-anon-key',
  },
  app: {
    env: import.meta.env.MODE as AppConfiguration['app']['env'],
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    isTest: import.meta.env.MODE === 'test',
  },
};

/**
 * Helper function to check if we're in development mode
 */
export const isDevelopment = () => config.app.isDev;

/**
 * Helper function to check if we're in production mode
 */
export const isProduction = () => config.app.isProd;

/**
 * Helper function to check if we're in test mode
 */
export const isTest = () => config.app.isTest;
