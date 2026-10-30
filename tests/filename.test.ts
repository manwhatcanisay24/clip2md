import { describe, expect, it } from 'vitest';
import { sanitizeFilename } from '../lib/markdown/filename';

describe('safe Markdown filenames', () => {
  it('keeps readable Unicode titles', () => {
    expect(sanitizeFilename('用 Markdown 做笔记')).toBe('用 Markdown 做笔记.md');
  });

  it('replaces path separators and other invalid characters', () => {
    expect(sanitizeFilename('a/b\\c:d*e?f"g<h>i|j')).toBe('a-b-c-d-e-f-g-h-i-j.md');
  });

  it('normalizes whitespace and removes trailing dots', () => {
    expect(sanitizeFilename('  A   useful\n title...  ')).toBe('A useful title.md');
  });

  it('provides a fallback for empty or unsafe-only names', () => {
    expect(sanitizeFilename('')).toBe('clip2md-note.md');
    expect(sanitizeFilename('???')).toBe('clip2md-note.md');
  });

  it('avoids reserved Windows device names', () => {
    expect(sanitizeFilename('CON')).toBe('CON-note.md');
    expect(sanitizeFilename('com1')).toBe('com1-note.md');
  });

  it('bounds long names and always keeps the extension', () => {
    const result = sanitizeFilename('长'.repeat(200));
    expect(result).toHaveLength(100);
    expect(result.endsWith('.md')).toBe(true);
  });

  it('removes control characters', () => {
    expect(sanitizeFilename('hello\u0000world\u001f')).toBe('hello-world.md');
  });
});
