import type { ClipSettings } from './types';

const messages = {
  en: {
    tagline: 'The web, thoughtfully clipped.',
    ready: 'Ready to clip',
    loading: 'Reading this page…',
    success: 'Markdown ready',
    error: 'Could not extract this article',
    emptyError:
      'No readable article was found. You can still add a title and save the source link.',
    parseError: 'The page could not be parsed. You can still edit the Markdown manually.',
    unsupported: 'Browser pages and non-web URLs are not supported. Open an http or https page.',
    connectionError:
      'Clip2MD could not read this page. Reload the page and try again, or save the source link manually.',
    timeout: 'Reading took too long. Reload the page and try again, or edit the Markdown manually.',
    titleLabel: 'Document title',
    titlePlaceholder: 'Add a title',
    sourceLabel: 'Source',
    editorLabel: 'Markdown',
    characters: 'characters',
    copy: 'Copy',
    download: 'Download .md',
    copied: 'Markdown copied to clipboard',
    copyFailed: 'Could not access the clipboard. Select the text and copy it manually.',
    downloaded: 'Markdown download started',
    downloadFailed: 'The download could not be started.',
    settings: 'Settings',
    includeTitle: 'Include page title',
    includeTitleHint: 'Add an H1 heading at the top',
    includeSource: 'Include source link',
    includeSourceHint: 'Keep the original URL with your clip',
    language: 'Language',
    retry: 'Try again',
    close: 'Close settings',
    localOnly: 'Processed locally. Nothing is uploaded.',
  },
  'zh-CN': {
    tagline: '把网页，认真收进知识库。',
    ready: '准备剪藏',
    loading: '正在读取页面…',
    success: 'Markdown 已生成',
    error: '无法提取这篇文章',
    emptyError: '未找到可读取的正文。你仍可填写标题并保存原始链接。',
    parseError: '页面解析失败。你仍可手动编辑 Markdown。',
    unsupported: '不支持浏览器内部页面或非网页地址，请打开 http 或 https 页面。',
    connectionError: '无法读取当前页面。请刷新后重试，或手动保存原始链接。',
    timeout: '读取时间过长。请刷新页面后重试，或手动编辑 Markdown。',
    titleLabel: '文档标题',
    titlePlaceholder: '填写标题',
    sourceLabel: '来源',
    editorLabel: 'Markdown',
    characters: '个字符',
    copy: '复制',
    download: '下载 .md',
    copied: 'Markdown 已复制到剪贴板',
    copyFailed: '无法访问剪贴板，请选中文本后手动复制。',
    downloaded: '已开始下载 Markdown',
    downloadFailed: '无法开始下载。',
    settings: '设置',
    includeTitle: '包含网页标题',
    includeTitleHint: '在文档顶部添加一级标题',
    includeSource: '包含原始链接',
    includeSourceHint: '在剪藏中保留原文 URL',
    language: '语言',
    retry: '重试',
    close: '关闭设置',
    localOnly: '仅在本地处理，不上传网页内容。',
  },
} as const;

export type Locale = keyof typeof messages;
export type MessageKey = keyof (typeof messages)['en'];

export function resolveLocale(language: ClipSettings['language'], browserLanguage: string): Locale {
  if (language !== 'auto') return language;
  return browserLanguage.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

export function createTranslator(locale: Locale) {
  return (key: MessageKey): string => messages[locale][key];
}
