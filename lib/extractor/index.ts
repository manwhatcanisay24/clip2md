import { Readability } from '@mozilla/readability';
import type { ExtractionResult } from '../types';
import { cleanArticleHtml, removeNonContentNodes } from './clean';
import { extractMetadata } from './metadata';

export function extractArticle(
  sourceDocument: Document,
  url: string,
  clippedAt = new Date().toISOString(),
): ExtractionResult {
  const metadata = extractMetadata(sourceDocument, url, clippedAt);

  try {
    const clone = sourceDocument.cloneNode(true) as Document;
    removeNonContentNodes(clone);
    clone.querySelectorAll('base').forEach((base) => base.remove());
    const base = clone.createElement('base');
    base.href = url;
    clone.head?.prepend(base);
    clone.querySelectorAll<HTMLElement>('pre > code[class]').forEach((code) => {
      const language = code.className.match(/(?:language-|lang-)([\w+-]+)/i)?.[0];
      if (language) code.parentElement?.setAttribute('data-language', language);
    });
    const article = new Readability(clone, { charThreshold: 80 }).parse();
    const textContent = article?.textContent?.trim() ?? '';

    if (!article?.content || textContent.length < 40) {
      return {
        ok: false,
        error: {
          code: 'EMPTY_CONTENT',
          message: 'No readable article content was found on this page.',
        },
        metadata: { ...metadata, title: metadata.title || article?.title || '' },
      };
    }

    const container = sourceDocument.createElement('div');
    container.innerHTML = article.content;
    const content = cleanArticleHtml(container, url);

    return {
      ok: true,
      article: {
        ...metadata,
        title: article.title?.trim() || metadata.title || textContent.slice(0, 80),
        content,
        textContent,
        excerpt: article.excerpt || undefined,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'PARSE_ERROR',
        message: error instanceof Error ? error.message : 'The article could not be parsed.',
      },
      metadata,
    };
  }
}
