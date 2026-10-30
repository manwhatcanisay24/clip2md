import { describe, expect, it } from 'vitest';
import { extractArticle } from '../lib/extractor';
import { htmlToMarkdown } from '../lib/markdown/convert';
import { loadFixture } from './helpers';

const clippedAt = '2026-10-30T10:00:00.000Z';

function extractFixture(name: string, url = 'https://example.com/articles/post/') {
  const result = extractArticle(loadFixture(name), url, clippedAt);
  if (!result.ok) throw new Error(`Expected ${name} to be readable: ${result.error.message}`);
  return result.article;
}

describe('article extraction', () => {
  it('extracts an English article and its metadata', () => {
    const article = extractFixture('english-article.html');

    expect(article.title).toBe('Designing a Local-First Knowledge Base');
    expect(article.siteName).toBe('Plain Text Journal');
    expect(article.author).toBe('Ada Stone');
    expect(article.publishedAt).toBe('2026-10-20T08:30:00Z');
    expect(article.clippedAt).toBe(clippedAt);
    expect(article.textContent).toContain('A durable knowledge base');
    expect(article.content).not.toContain('premium webinar');
    expect(article.content).not.toContain('<nav');
  });

  it('preserves Chinese text without mangling its encoding', () => {
    const article = extractFixture('chinese-article.html', 'https://notes.example.cn/markdown');
    const markdown = htmlToMarkdown(article.content);

    expect(article.author).toBe('林晓');
    expect(markdown).toContain('## 从可靠的信息开始');
    expect(markdown).toContain('**清晰的结构**');
    expect(markdown).toContain('1. 提取真正需要的正文。');
  });

  it('turns relative links and lazy-loaded images into absolute references', () => {
    const article = extractFixture(
      'links-and-media.html',
      'https://example.com/library/guides/links-and-media.html',
    );
    const markdown = htmlToMarkdown(article.content);

    expect(markdown).toContain('https://example.com/docs/handbook.html');
    expect(markdown).toContain('https://example.org/community');
    expect(markdown).toContain(
      '![A diagram of the conversion pipeline](https://example.com/assets/diagram.svg)',
    );
  });

  it('allows missing author and publication date', () => {
    const article = extractFixture('minimal-article.html');

    expect(article.author).toBeUndefined();
    expect(article.publishedAt).toBeUndefined();
    expect(article.siteName).toBe('example.com');
    expect(article.textContent).toContain('deliberately leaves out');
  });

  it('returns a useful failure for an empty application shell', () => {
    const result = extractArticle(
      loadFixture('empty-page.html'),
      'https://example.com/app',
      clippedAt,
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('EMPTY_CONTENT');
    expect(result.metadata.title).toBe('Empty application shell');
    expect(result.metadata.url).toBe('https://example.com/app');
  });

  it('does not mutate the source document', () => {
    const document = loadFixture('english-article.html');
    const before = document.documentElement.innerHTML;
    extractArticle(document, 'https://example.com/post', clippedAt);
    expect(document.documentElement.innerHTML).toBe(before);
  });
});
