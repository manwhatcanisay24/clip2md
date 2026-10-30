const REMOVED_SELECTOR = [
  'script',
  'style',
  'noscript',
  'template',
  'iframe',
  'nav',
  'aside',
  'form',
  'button',
  '[hidden]',
  '[aria-hidden="true"]',
  '.advertisement',
  '.advertisements',
  '.ads',
  '.social-share',
  '.related-posts',
].join(',');

export function removeNonContentNodes(root: ParentNode): void {
  root.querySelectorAll(REMOVED_SELECTOR).forEach((node) => node.remove());
}

export function cleanArticleHtml(container: HTMLElement, baseUrl: string): string {
  removeNonContentNodes(container);

  container.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href');
    if (!href) return;
    try {
      anchor.setAttribute('href', new URL(href, baseUrl).href);
    } catch {
      anchor.removeAttribute('href');
    }
  });

  container.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    const source = image.getAttribute('src') ?? image.getAttribute('data-src');
    if (source) {
      try {
        image.setAttribute('src', new URL(source, baseUrl).href);
      } catch {
        image.remove();
        return;
      }
    }
    image.removeAttribute('srcset');
    image.removeAttribute('loading');
    image.removeAttribute('data-src');
  });

  return container.innerHTML;
}
