# Clip2MD v0.1.0 — Core clipping loop / 核心剪藏闭环

## English

The first public release of Clip2MD turns ordinary web articles into clean, editable Markdown without uploading page content.

### Highlights

- On-demand article and metadata extraction with Mozilla Readability.
- Headings, emphasis, links, images, lists, quotes, and fenced code conversion.
- Editable preview, clipboard copy, and UTF-8 `.md` downloads.
- Safe filenames, persistent title/source settings, and English / Simplified Chinese UI.
- Manual title and source fallback for unsupported or unreadable pages.

### Install

1. Download **`clip2md-0.1.0-chrome.zip`** below and extract it.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**, choose **Load unpacked**, and select the extracted folder.
4. Open an article and click the Clip2MD toolbar icon.

[English guide](https://github.com/manwhatcanisay24/clip2md/blob/main/README.md) · [中文说明](https://github.com/manwhatcanisay24/clip2md/blob/main/README.zh-CN.md)

### Verification

- 24 Vitest tests passed across 4 test files.
- TypeScript, ESLint, Prettier, and production build passed.
- Real Microsoft Edge verification passed for 6 fixtures, bilingual UI, settings, clipboard, UTF-8 downloads, and extraction fallback.

Selection clipping, Front Matter, history, image archiving, advanced tables, and GitHub content saving are not included in v0.1.0; see the roadmap.

---

## 中文

Clip2MD 首个公开版本可将普通网页文章转换为干净、可编辑的 Markdown，全程不上传网页正文。

### 主要功能

- 基于 Mozilla Readability 的主动正文与元数据提取。
- 支持标题、粗斜体、链接、图片、列表、引用和围栏代码块。
- 可编辑预览、复制及 UTF-8 `.md` 下载。
- 安全文件名、持久化标题 / 来源设置，以及中英双语界面。
- 不支持或提取失败时仍可编辑标题并保留原始链接。

### 安装

1. 下载下方的 **`clip2md-0.1.0-chrome.zip`** 并解压。
2. 打开 `chrome://extensions` 或 `edge://extensions`。
3. 开启 **开发者模式**，点击 **加载已解压的扩展程序**，选择解压目录。
4. 打开网页文章，点击工具栏中的 Clip2MD 图标。

[中文使用说明](https://github.com/manwhatcanisay24/clip2md/blob/main/README.zh-CN.md) · [English guide](https://github.com/manwhatcanisay24/clip2md/blob/main/README.md)

### 验证结果

- 4 个测试文件、24 项 Vitest 测试全部通过。
- TypeScript、ESLint、Prettier 和生产构建通过。
- 已在真实 Microsoft Edge 中验证 6 个固定样本、双语界面、设置、剪贴板、UTF-8 下载及失败兜底。

v0.1.0 尚不包含选区剪藏、Front Matter、历史、图片归档、高级表格或 GitHub 内容保存；后续范围见版本规划。
