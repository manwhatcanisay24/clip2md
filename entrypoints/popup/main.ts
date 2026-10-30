import { browser } from 'wxt/browser';
import { showToast } from '../../components/toast';
import { createTranslator, resolveLocale, type MessageKey } from '../../lib/i18n';
import { composeMarkdown } from '../../lib/markdown/compose';
import { htmlToMarkdown } from '../../lib/markdown/convert';
import { sanitizeFilename } from '../../lib/markdown/filename';
import { loadSettings, saveSettings } from '../../lib/settings';
import {
  DEFAULT_SETTINGS,
  type ArticleMetadata,
  type ClipSettings,
  type ExtractionResult,
} from '../../lib/types';

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing element: ${id}`);
  return found as T;
}

const ui = {
  tagline: element('tagline'),
  language: element<HTMLButtonElement>('language-button'),
  settingsButton: element<HTMLButtonElement>('settings-button'),
  settingsPanel: element('settings-panel'),
  settingsTitle: element('settings-title'),
  includeTitle: element<HTMLInputElement>('include-title'),
  includeSource: element<HTMLInputElement>('include-source'),
  includeTitleLabel: element('include-title-label'),
  includeTitleHint: element('include-title-hint'),
  includeSourceLabel: element('include-source-label'),
  includeSourceHint: element('include-source-hint'),
  status: element('status'),
  statusText: element('status-text'),
  retry: element<HTMLButtonElement>('retry-button'),
  errorBanner: element('error-banner'),
  errorTitle: element('error-title'),
  errorMessage: element('error-message'),
  titleLabel: element('title-label'),
  title: element<HTMLInputElement>('page-title'),
  siteName: element('site-name'),
  articleMeta: element('article-meta'),
  editorLabel: element('editor-label'),
  characterCount: element('character-count'),
  editor: element<HTMLTextAreaElement>('markdown-editor'),
  copy: element<HTMLButtonElement>('copy-button'),
  copyLabel: element('copy-label'),
  download: element<HTMLButtonElement>('download-button'),
  downloadLabel: element('download-label'),
  localOnly: element('local-only'),
  toast: element('toast'),
};

let settings: ClipSettings = DEFAULT_SETTINGS;
let translate = createTranslator('en');
let body = '';
let metadata: ArticleMetadata = {
  title: '',
  url: '',
  siteName: '',
  clippedAt: new Date().toISOString(),
};
let requestId = 0;
let statusState: 'ready' | 'loading' | 'success' | 'error' = 'ready';
let errorMessageKey: MessageKey | undefined;

const textKeys = {
  tagline: 'tagline',
  settingsTitle: 'settings',
  includeTitleLabel: 'includeTitle',
  includeTitleHint: 'includeTitleHint',
  includeSourceLabel: 'includeSource',
  includeSourceHint: 'includeSourceHint',
  titleLabel: 'titleLabel',
  editorLabel: 'editorLabel',
  copyLabel: 'copy',
  downloadLabel: 'download',
  localOnly: 'localOnly',
  retry: 'retry',
  errorTitle: 'error',
} as const;

function applyLocale(): void {
  const locale = resolveLocale(settings.language, browser.i18n.getUILanguage());
  translate = createTranslator(locale);
  document.documentElement.lang = locale;
  Object.entries(textKeys).forEach(([key, messageKey]) => {
    ui[key as keyof typeof textKeys].textContent = translate(messageKey as MessageKey);
  });
  ui.title.placeholder = translate('titlePlaceholder');
  ui.settingsButton.setAttribute('aria-label', translate('settings'));
  ui.language.textContent = locale === 'zh-CN' ? '中' : 'EN';
  ui.language.setAttribute('aria-label', translate('language'));
  setStatus(statusState);
  if (errorMessageKey) ui.errorMessage.textContent = translate(errorMessageKey);
  updateCharacterCount();
}

function updateCharacterCount(): void {
  const count = new Intl.NumberFormat(
    resolveLocale(settings.language, browser.i18n.getUILanguage()),
  ).format(ui.editor.value.length);
  ui.characterCount.textContent = `${count} ${translate('characters')}`;
}

function setStatus(state: 'ready' | 'loading' | 'success' | 'error'): void {
  statusState = state;
  ui.status.className = `status status--${state}`;
  const key =
    state === 'ready'
      ? 'ready'
      : state === 'loading'
        ? 'loading'
        : state === 'success'
          ? 'success'
          : 'error';
  ui.statusText.textContent = translate(key);
}

function setBusy(busy: boolean): void {
  ui.copy.disabled = busy;
  ui.download.disabled = busy;
  ui.retry.hidden = busy || ui.errorBanner.hidden;
}

function showError(key: MessageKey): void {
  errorMessageKey = key;
  ui.errorTitle.textContent = translate('error');
  ui.errorMessage.textContent = translate(key);
  ui.errorBanner.hidden = false;
  ui.retry.hidden = false;
  setStatus('error');
}

function clearError(): void {
  errorMessageKey = undefined;
  ui.errorBanner.hidden = true;
  ui.retry.hidden = true;
}

function renderMetadata(): void {
  ui.siteName.textContent = metadata.siteName || metadata.url;
  ui.siteName.title = metadata.url;
  ui.articleMeta.textContent = [metadata.author, metadata.publishedAt].filter(Boolean).join(' · ');
}

function regenerateMarkdown(): void {
  metadata.title = ui.title.value.trim();
  ui.editor.value = composeMarkdown(body, metadata, settings);
  updateCharacterCount();
}

function supportedUrl(url: string | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

async function activeTab(): Promise<Browser.tabs.Tab> {
  const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab) throw new Error('No active tab');
  if (tab.url?.startsWith(browser.runtime.getURL('/popup.html'))) {
    const activeTabs = await browser.tabs.query({ active: true });
    const articleTab = activeTabs.find(
      (candidate) => candidate.id !== tab.id && (!candidate.url || supportedUrl(candidate.url)),
    );
    if (articleTab) return articleTab;
  }
  return tab;
}

async function extract(): Promise<void> {
  const currentRequest = ++requestId;
  setBusy(true);
  clearError();
  setStatus('loading');
  body = '';
  ui.editor.value = '';
  ui.articleMeta.textContent = '';

  try {
    const tab = await activeTab();
    metadata = {
      title: tab.title?.trim() ?? '',
      url: tab.url ?? '',
      siteName: '',
      clippedAt: new Date().toISOString(),
    };
    if (supportedUrl(metadata.url)) {
      try {
        metadata.siteName = new URL(metadata.url).hostname;
      } catch {
        metadata.siteName = '';
      }
    }
    ui.title.value = metadata.title;
    renderMetadata();

    if ((metadata.url && !supportedUrl(metadata.url)) || tab.id === undefined) {
      showError('unsupported');
      regenerateMarkdown();
      return;
    }

    const result = await Promise.race([
      browser.tabs.sendMessage(tab.id, { type: 'CLIP2MD_EXTRACT' }) as Promise<ExtractionResult>,
      new Promise<never>((_resolve, reject) => {
        window.setTimeout(() => reject(new Error('timeout')), 15000);
      }),
    ]);
    if (currentRequest !== requestId) return;

    metadata = result.ok ? result.article : result.metadata;
    ui.title.value = metadata.title;
    renderMetadata();

    if (!result.ok) {
      showError(result.error.code === 'EMPTY_CONTENT' ? 'emptyError' : 'parseError');
    } else {
      body = htmlToMarkdown(result.article.content);
      setStatus('success');
    }
    regenerateMarkdown();
  } catch (error) {
    if (currentRequest !== requestId) return;
    showError(
      error instanceof Error && error.message === 'timeout' ? 'timeout' : 'connectionError',
    );
    regenerateMarkdown();
  } finally {
    if (currentRequest === requestId) {
      setBusy(false);
      updateCharacterCount();
    }
  }
}

async function copyMarkdown(): Promise<void> {
  try {
    await navigator.clipboard.writeText(ui.editor.value);
    showToast(ui.toast, translate('copied'));
  } catch {
    ui.editor.focus();
    ui.editor.select();
    const copied = document.execCommand('copy');
    showToast(ui.toast, translate(copied ? 'copied' : 'copyFailed'), !copied);
  }
}

function downloadMarkdown(): void {
  try {
    const blob = new Blob([ui.editor.value], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = sanitizeFilename(ui.title.value);
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(ui.toast, translate('downloaded'));
  } catch {
    showToast(ui.toast, translate('downloadFailed'), true);
  }
}

function bindEvents(): void {
  ui.language.addEventListener('click', () => {
    const current = resolveLocale(settings.language, browser.i18n.getUILanguage());
    settings = { ...settings, language: current === 'zh-CN' ? 'en' : 'zh-CN' };
    applyLocale();
    void saveSettings(settings);
  });
  ui.settingsButton.addEventListener('click', () => {
    const opening = ui.settingsPanel.hidden;
    ui.settingsPanel.hidden = !opening;
    ui.settingsButton.setAttribute('aria-expanded', String(opening));
    ui.settingsButton.setAttribute('aria-label', translate(opening ? 'close' : 'settings'));
  });
  ui.includeTitle.addEventListener('change', () => {
    settings = { ...settings, includeTitle: ui.includeTitle.checked };
    regenerateMarkdown();
    void saveSettings(settings);
  });
  ui.includeSource.addEventListener('change', () => {
    settings = { ...settings, includeSource: ui.includeSource.checked };
    regenerateMarkdown();
    void saveSettings(settings);
  });
  ui.title.addEventListener('input', regenerateMarkdown);
  ui.editor.addEventListener('input', updateCharacterCount);
  ui.copy.addEventListener('click', () => void copyMarkdown());
  ui.download.addEventListener('click', downloadMarkdown);
  ui.retry.addEventListener('click', () => void extract());
}

async function init(): Promise<void> {
  try {
    settings = await loadSettings();
  } catch {
    settings = DEFAULT_SETTINGS;
  }
  ui.includeTitle.checked = settings.includeTitle;
  ui.includeSource.checked = settings.includeSource;
  applyLocale();
  bindEvents();
  setStatus('ready');
  await extract();
}

void init();
