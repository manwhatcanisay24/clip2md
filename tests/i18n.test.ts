import { describe, expect, it } from 'vitest';
import { createTranslator, resolveLocale } from '../lib/i18n';

describe('bilingual interface', () => {
  it('follows Chinese browser locales', () => {
    expect(resolveLocale('auto', 'zh-CN')).toBe('zh-CN');
    expect(resolveLocale('auto', 'zh-TW')).toBe('zh-CN');
  });

  it('uses English for other browser locales', () => {
    expect(resolveLocale('auto', 'en-US')).toBe('en');
    expect(resolveLocale('auto', 'fr-FR')).toBe('en');
  });

  it('honors an explicit language choice', () => {
    expect(resolveLocale('en', 'zh-CN')).toBe('en');
    expect(resolveLocale('zh-CN', 'en-US')).toBe('zh-CN');
  });

  it('provides matching core messages in both languages', () => {
    expect(createTranslator('en')('copy')).toBe('Copy');
    expect(createTranslator('zh-CN')('copy')).toBe('复制');
    expect(createTranslator('zh-CN')('localOnly')).toContain('本地');
  });
});
