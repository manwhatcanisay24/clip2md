import { defineConfig } from 'wxt';

export default defineConfig({
  modules: [],
  manifest: {
    name: 'Clip2MD — Web to Markdown',
    description:
      'Save clean, editable Markdown from the current web page. Local-first and privacy-friendly.',
    version: '0.1.0',
    permissions: ['activeTab', 'storage'],
    action: {
      default_title: 'Clip this page as Markdown',
    },
    icons: {
      16: 'icons/16.png',
      32: 'icons/32.png',
      48: 'icons/48.png',
      128: 'icons/128.png',
    },
  },
  vite: () => ({
    build: {
      target: 'es2022',
    },
  }),
});
