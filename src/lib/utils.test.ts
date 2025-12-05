import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('should return an empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('should combine class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional class names', () => {
    const condition1 = true;
    const condition2 = false;
    expect(cn('class1', condition1 && 'class2', condition2 && 'class3')).toBe('class1 class2');
  });

  it('should merge Tailwind classes correctly', () => {
    // tailwind-merge handles conflicts, e.g., 'p-4' and 'p-8' results in 'p-8'
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should handle mixed arguments including objects and arrays', () => {
    expect(cn('foo', { bar: true, baz: false }, ['qux', 'quux'])).toBe('foo bar qux quux');
  });

  it('should handle duplicate classes', () => {
    // Note: tailwind-merge doesn't deduplicate non-Tailwind classes
    // It only merges conflicting Tailwind utility classes
    expect(cn('class1', 'class1', 'class2')).toBe('class1 class1 class2');
  });

  it('should handle empty strings and null/undefined values gracefully', () => {
    expect(cn('class1', '', null, undefined, 'class2')).toBe('class1 class2');
  });
});