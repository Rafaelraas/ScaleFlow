import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should have error method', () => {
    expect(logger.error).toBeDefined();
    expect(typeof logger.error).toBe('function');
  });

  it('should have warn method', () => {
    expect(logger.warn).toBeDefined();
    expect(typeof logger.warn).toBe('function');
  });

  it('should have info method', () => {
    expect(logger.info).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });

  it('should have debug method', () => {
    expect(logger.debug).toBeDefined();
    expect(typeof logger.debug).toBe('function');
  });

  it('should call console.error when logging errors', () => {
    logger.error('Test error', { detail: 'test' });

    // Logger calls console methods in dev mode (which includes test environment)
    expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Test error', { detail: 'test' });
  });

  it('should call console.warn when logging warnings', () => {
    logger.warn('Test warning');

    // Logger calls console methods in dev mode
    expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Test warning', '');
  });

  it('should call console.info when logging info', () => {
    logger.info('Test info');

    // Logger calls console methods in dev mode
    expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Test info', '');
  });

  it('should call console.log when logging debug', () => {
    logger.debug('Test debug');

    // Logger calls console methods in dev mode
    expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG] Test debug', '');
  });

  it('should accept context objects', () => {
    const context = { userId: 123, action: 'test' };

    // Should not throw
    expect(() => logger.error('Test', context)).not.toThrow();
    expect(() => logger.warn('Test', context)).not.toThrow();
    expect(() => logger.info('Test', context)).not.toThrow();
    expect(() => logger.debug('Test', context)).not.toThrow();
  });

  it('should work without context', () => {
    // Should not throw
    expect(() => logger.error('Test')).not.toThrow();
    expect(() => logger.warn('Test')).not.toThrow();
    expect(() => logger.info('Test')).not.toThrow();
    expect(() => logger.debug('Test')).not.toThrow();
  });
});
