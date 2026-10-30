import type { ArticleMetadata } from '../types';

export interface MarkdownOptions {
  includeTitle: boolean;
  includeSource: boolean;
}

function escapeHeading(title: string): string {
  return title
    .replace(/([\\`*_[\]<>#])/g, '\\$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function composeMarkdown(
  body: string,
  metadata: Pick<ArticleMetadata, 'title' | 'url'>,
  options: MarkdownOptions,
): string {
  const sections: string[] = [];
  const title = escapeHeading(metadata.title);

  if (options.includeTitle && title) sections.push(`# ${title}`);
  if (options.includeSource && metadata.url) sections.push(`> Source: <${metadata.url}>`);
  if (body.trim()) sections.push(body.trim());

  return `${sections.join('\n\n')}\n`;
}
