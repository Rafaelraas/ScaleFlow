import { describe, it, expect } from 'vitest';
import { config, isDevelopment, isProduction, isTest, isSupabaseConfigured } from './env';

describe('Environment Configuration', () => {
  it('should load configuration without errors', () => {
    expect(config).toBeDefined();
    expect(config.supabase).toBeDefined();
    expect(config.app).toBeDefined();
  });

  it('should have supabase configuration with default values when not set', () => {
    expect(config.supabase.url).toBeTruthy();
    expect(config.supabase.anonKey).toBeTruthy();
    expect(typeof config.supabase.url).toBe('string');
    expect(typeof config.supabase.anonKey).toBe('string');
  });

  it('should export isSupabaseConfigured flag', () => {
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });

  it('should have valid app configuration', () => {
    expect(['development', 'production', 'test']).toContain(config.app.env);
    expect(typeof config.app.isDev).toBe('boolean');
    expect(typeof config.app.isProd).toBe('boolean');
    expect(typeof config.app.isTest).toBe('boolean');
  });

  it('should provide helper functions', () => {
    expect(typeof isDevelopment()).toBe('boolean');
    expect(typeof isProduction()).toBe('boolean');
    expect(typeof isTest()).toBe('boolean');
  });

  it('should have consistent environment flags', () => {
    // In test mode, isTest should be true
    if (config.app.env === 'test') {
      expect(isTest()).toBe(true);
    }

    // Only one of isDev or isProd should be true in non-test mode
    if (config.app.env !== 'test') {
      expect(isDevelopment() || isProduction()).toBe(true);
      expect(isDevelopment() && isProduction()).toBe(false);
    }
  });
});
