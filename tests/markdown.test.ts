import { describe, expect, it } from 'vitest';
import { composeMarkdown } from '../lib/markdown/compose';
import { htmlToMarkdown } from '../lib/markdown/convert';
import { loadFixture } from './helpers';
import { extractArticle } from '../lib/extractor';

describe('HTML to Markdown conversion', () => {
  it('supports common article formatting', () => {
    const markdown = htmlToMarkdown(`
      <h1>Heading one</h1><h2>Heading two</h2>
      <p><strong>bold</strong> and <em>italic</em> with <a href="https://example.com">a link</a>.</p>
      <ul><li>First</li><li>Second</li></ul>
      <blockquote>A useful quote.</blockquote>
      <img src="https://example.com/image.png" alt="Example" />
    `);

    expect(markdown).toContain('# Heading one');
    expect(markdown).toContain('## Heading two');
    expect(markdown).toContain('**bold** and *italic*');
    expect(markdown).toContain('[a link](https://example.com)');
    expect(markdown).toContain('- First');
    expect(markdown).toContain('> A useful quote.');
    expect(markdown).toContain('![Example](https://example.com/image.png)');
  });

  it('preserves fenced code language, text, and line breaks', () => {
    const result = extractArticle(
      loadFixture('technical-article.html'),
      'https://example.com/testing',
      '2026-10-30T10:00:00.000Z',
    );
    if (!result.ok) throw new Error('Expected technical article');
    const markdown = htmlToMarkdown(result.article.content);

    expect(markdown).toContain('```typescript\nexport function cleanTitle');
    expect(markdown).toContain("return title || 'Untitled';\n}");
    expect(markdown).toContain("console.log(cleanTitle('  Clip2MD  '));\n```");
    expect(markdown).toContain('`npm run build`');
  });

  it('uses a longer fence when code contains triple backticks', () => {
    const markdown = htmlToMarkdown('<pre><code>```js\nconst ok = true;\n```</code></pre>');
    expect(markdown).toContain('````\n```js');
    expect(markdown).toContain('```\n````');
  });

  it('removes unsafe or interactive elements', () => {
    const markdown = htmlToMarkdown(
      '<p>Keep this</p><script>alert("no")</script><style>p{color:red}</style><button>Copy</button>',
    );
    expect(markdown).toBe('Keep this');
  });
});

describe('Markdown composition', () => {
  const metadata = { title: 'A useful article', url: 'https://example.com/post' };

  it('includes title and source by default', () => {
    expect(
      composeMarkdown('Body text.', metadata, { includeTitle: true, includeSource: true }),
    ).toBe('# A useful article\n\n> Source: <https://example.com/post>\n\nBody text.\n');
  });

  it('can omit both optional sections', () => {
    expect(
      composeMarkdown('Body text.', metadata, { includeTitle: false, includeSource: false }),
    ).toBe('Body text.\n');
  });

  it('still provides a source-only fallback when extraction fails', () => {
    expect(
      composeMarkdown(
        '',
        { title: '', url: metadata.url },
        { includeTitle: true, includeSource: true },
      ),
    ).toBe('> Source: <https://example.com/post>\n');
  });
});
