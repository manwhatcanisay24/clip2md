import type { ArticleMetadata } from '../types';

function contentOf(document: Document, selectors: string[]): string | undefined {
  for (const selector of selectors) {
    const value = document.querySelector(selector)?.getAttribute('content')?.trim();
    if (value) return value;
  }
  return undefined;
}

export function extractMetadata(
  document: Document,
  url: string,
  clippedAt = new Date().toISOString(),
): ArticleMetadata {
  const title =
    contentOf(document, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ??
    document.querySelector('title')?.textContent?.trim() ??
    '';
  const siteName =
    contentOf(document, ['meta[property="og:site_name"]', 'meta[name="application-name"]']) ??
    new URL(url).hostname;
  const author = contentOf(document, [
    'meta[name="author"]',
    'meta[property="article:author"]',
    'meta[name="twitter:creator"]',
  ]);
  const publishedAt =
    contentOf(document, [
      'meta[property="article:published_time"]',
      'meta[name="publishdate"]',
      'meta[name="date"]',
      'meta[itemprop="datePublished"]',
    ]) ?? document.querySelector('time[datetime]')?.getAttribute('datetime')?.trim();

  return {
    title,
    url,
    siteName,
    author: author || undefined,
    publishedAt: publishedAt || undefined,
    clippedAt,
  };
}
