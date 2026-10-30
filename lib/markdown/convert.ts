import TurndownService from 'turndown';

function languageOf(code: HTMLElement, pre: HTMLElement): string {
  const candidates = [code.className, pre.className, code.dataset.language, pre.dataset.language];
  for (const candidate of candidates) {
    const match = candidate?.match(/(?:language-|lang-)([\w+-]+)/i);
    if (match?.[1]) return match[1].toLowerCase();
  }
  return '';
}

export function htmlToMarkdown(html: string): string {
  const service = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  });

  service.remove(['script', 'style', 'noscript', 'iframe', 'button']);
  service.addRule('compactListItems', {
    filter: 'li',
    replacement: (content, node, options) => {
      const item = node as HTMLElement;
      const parent = item.parentElement;
      let prefix = `${options.bulletListMarker} `;
      if (parent?.nodeName === 'OL') {
        const start = Number(parent.getAttribute('start') ?? 1);
        const index = Array.from(parent.children).indexOf(item);
        prefix = `${start + index}. `;
      }
      const value = content.replace(/^\n+/, '').replace(/\n+$/, '').replace(/\n/g, '\n    ');
      return `${prefix}${value}${item.nextSibling && !/\n$/.test(value) ? '\n' : ''}`;
    },
  });
  service.addRule('fencedCode', {
    filter: (node) => node.nodeName === 'PRE',
    replacement: (_content, node) => {
      const pre = node as HTMLElement;
      const code = pre.querySelector('code') ?? pre;
      const language = languageOf(code, pre);
      const value = code.textContent?.replace(/^\n+|\n+$/g, '') ?? '';
      const fence = value.includes('```') ? '````' : '```';
      return `\n\n${fence}${language}\n${value}\n${fence}\n\n`;
    },
  });

  return service
    .turndown(html)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
