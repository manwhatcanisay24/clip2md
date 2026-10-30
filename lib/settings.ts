import { browser } from 'wxt/browser';
import { DEFAULT_SETTINGS, type ClipSettings } from './types';

const STORAGE_KEY = 'clip2md-settings';

export async function loadSettings(): Promise<ClipSettings> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY] as Partial<ClipSettings> | undefined;
  return { ...DEFAULT_SETTINGS, ...value };
}

export async function saveSettings(settings: ClipSettings): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: settings });
}
