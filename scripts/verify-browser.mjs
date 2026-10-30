import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const extensionPath = resolve(root, '.output/chrome-mv3');
const outputPath = resolve(root, 'docs/screenshots');
const testOutputPath = resolve(root, 'test-results/browser');
const contentTypes = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml' };

const server = createServer(async (request, response) => {
  try {
    const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
    const filePath = resolve(root, `.${pathname}`);
    if (!filePath.startsWith(`${root}${sep}`)) throw new Error('Invalid path');
    const body = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] ?? 'text/plain' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});
await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

await mkdir(outputPath, { recursive: true });
await mkdir(testOutputPath, { recursive: true });
const context = await chromium.launchPersistentContext('', {
  channel: 'msedge',
  headless: false,
  acceptDownloads: true,
  viewport: { width: 1100, height: 760 },
  args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
});

try {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent('serviceworker', { timeout: 15000 }));
  const extensionId = new URL(worker.url()).host;
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;
  const article = await context.newPage();

  async function openPopupFor(page) {
    await page.bringToFront();
    const popupEvent = context.waitForEvent('page', { timeout: 10000 });
    const target = await worker.evaluate(async (url) => {
      const [articleTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!articleTab?.id) throw new Error('Article tab not found');
      const popupTab = await chrome.tabs.create({
        url,
        windowId: articleTab.windowId,
        active: true,
      });
      await chrome.tabs.update(articleTab.id, { active: true });
      await chrome.windows.update(articleTab.windowId, { focused: true });
      return popupTab.id;
    }, popupUrl);
    if (!target) throw new Error('Popup tab could not be created');
    const popup = await popupEvent;
    await popup.waitForLoadState('load');
    if (await popup.locator('#retry-button').isVisible()) {
      await popup.locator('#retry-button').dispatchEvent('click');
    }
    return popup;
  }

  async function extractFixture(name, expectSuccess = true) {
    await article.goto(`${baseUrl}/tests/fixtures/${name}`);
    const popup = await openPopupFor(article);
    try {
      if (expectSuccess) {
        await popup.locator('.status--success').waitFor({ timeout: 15000 });
      } else {
        await popup.locator('#error-banner').waitFor({ state: 'visible', timeout: 15000 });
      }
    } catch (error) {
      await popup.screenshot({ path: resolve(testOutputPath, 'browser-failure.png') });
      const status = await popup.locator('#status-text').textContent();
      const message = await popup.locator('#error-message').textContent();
      throw new Error(`Fixture ${name} failed with status "${status}": ${message}`, {
        cause: error,
      });
    }
    return popup;
  }

  let popup = await extractFixture('english-article.html');
  await popup.setViewportSize({ width: 420, height: 650 });
  if ((await popup.locator('#language-button').textContent()) === '中') {
    await popup.locator('#language-button').click();
    await popup.locator('#copy-label').filter({ hasText: 'Copy' }).waitFor();
  }
  const initialMarkdown = await popup.locator('#markdown-editor').inputValue();
  assert.match(initialMarkdown, /# Designing a Local-First Knowledge Base/);
  assert.match(initialMarkdown, /https?:\/\/127\.0\.0\.1:\d+\/guides\/source-notes/);
  assert.doesNotMatch(initialMarkdown, /premium webinar/);
  assert.equal(await popup.locator('#retry-button').isHidden(), true);
  assert.equal(await popup.locator('#status-text').textContent(), 'Markdown ready');
  await popup.screenshot({ path: resolve(outputPath, 'popup-en.png') });

  await popup.locator('#language-button').click();
  await popup.locator('#copy-label').filter({ hasText: '复制' }).waitFor();
  assert.equal(await popup.locator('#status-text').textContent(), 'Markdown 已生成');
  await popup.screenshot({ path: resolve(outputPath, 'popup-zh-CN.png') });
  await popup.locator('#settings-button').click();
  await popup.locator('#settings-panel').waitFor({ state: 'visible' });
  await popup.screenshot({ path: resolve(outputPath, 'settings-zh-CN.png'), fullPage: true });
  await popup.locator('#include-title').uncheck();
  assert.doesNotMatch(await popup.locator('#markdown-editor').inputValue(), /^# /);
  await popup.locator('#include-title').check();
  await popup.locator('#settings-button').click();

  await popup.bringToFront();
  await popup.locator('#copy-button').click();
  const clipboard = await popup.evaluate(() => navigator.clipboard.readText());
  assert.equal(clipboard.replace(/\r\n/g, '\n'), initialMarkdown.replace(/\r\n/g, '\n'));

  const editedMarkdown = '# Edited by Clip2MD\n\n中文复制与下载测试。\n';
  await popup.locator('#markdown-editor').fill(editedMarkdown);
  const downloadEvent = popup.waitForEvent('download');
  await popup.locator('#download-button').click();
  const download = await downloadEvent;
  const downloadedPath = resolve(testOutputPath, 'edited-中文.md');
  await download.saveAs(downloadedPath);
  assert.equal((await readFile(downloadedPath, 'utf8')).replace(/\r\n/g, '\n'), editedMarkdown);
  await popup.close();

  popup = await extractFixture('chinese-article.html');
  assert.match(await popup.locator('#markdown-editor').inputValue(), /## 从可靠的信息开始/);
  assert.equal(await popup.locator('#include-title').isChecked(), true);
  assert.equal(await popup.locator('#copy-label').textContent(), '复制');
  const chineseDownloadEvent = popup.waitForEvent('download');
  await popup.locator('#download-button').click();
  const chineseDownload = await chineseDownloadEvent;
  const chinesePath = resolve(testOutputPath, 'chinese.md');
  await chineseDownload.saveAs(chinesePath);
  assert.match(await readFile(chinesePath, 'utf8'), /用 Markdown 建立可持续的数字笔记/);
  await popup.close();

  for (const name of ['technical-article.html', 'minimal-article.html', 'links-and-media.html']) {
    popup = await extractFixture(name);
    assert.ok((await popup.locator('#markdown-editor').inputValue()).length > 100);
    if (name === 'technical-article.html') {
      assert.match(await popup.locator('#markdown-editor').inputValue(), /```typescript/);
    }
    await popup.close();
  }

  popup = await extractFixture('empty-page.html', false);
  assert.match(
    await popup.locator('#markdown-editor').inputValue(),
    /> Source: <http:\/\/127\.0\.0\.1:/,
  );
  assert.equal(await popup.locator('#page-title').inputValue(), 'Empty application shell');
  await popup.setViewportSize({ width: 420, height: 650 });
  await popup.screenshot({ path: resolve(outputPath, 'fallback-zh-CN.png') });
  await popup.close();

  console.log(
    'Browser verification passed: 6 fixtures, bilingual UI, settings, clipboard, downloads, and fallback.',
  );
} finally {
  await context.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
