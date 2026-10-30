import { extractArticle } from '../lib/extractor';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    browser.runtime.onMessage.addListener((message: unknown) => {
      if (
        typeof message === 'object' &&
        message !== null &&
        'type' in message &&
        message.type === 'CLIP2MD_EXTRACT'
      ) {
        return Promise.resolve(extractArticle(document, window.location.href));
      }
      return undefined;
    });
  },
});
