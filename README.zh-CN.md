# Clip2MD · 网页转 Markdown 助手

**一键把当前网页保存为干净、可编辑、可长期保存的 Markdown，全程本地处理。**

[English](README.md) · [下载发布版](https://github.com/manwhatcanisay24/clip2md/releases) · [隐私政策](PRIVACY.md) · [贡献指南](CONTRIBUTING.md)

[![CI](https://github.com/manwhatcanisay24/clip2md/actions/workflows/ci.yml/badge.svg)](https://github.com/manwhatcanisay24/clip2md/actions/workflows/ci.yml)
[![版本](https://img.shields.io/badge/版本-v0.1.0-1c6b47)](https://github.com/manwhatcanisay24/clip2md/releases/tag/v0.1.0)
[![许可证](https://img.shields.io/badge/许可证-MIT-blue.svg)](LICENSE)

Clip2MD 是一款本地优先的 Chrome / Edge 浏览器扩展，适合使用 Obsidian、Logseq、Typora 或其他 Markdown 工作流管理资料的人。打开网页、点击扩展、检查内容，然后复制或下载 UTF-8 `.md` 文件即可。无需账号，不依赖云端数据库或外部内容处理服务。

![Clip2MD 中文弹窗，展示提取后的 Markdown](docs/screenshots/popup-zh-CN.png)

## v0.1.0 已实现功能

- **主动触发的正文提取**：基于 Mozilla Readability，只有打开扩展并请求剪藏时才读取页面。
- **元数据保留**：尽可能提取标题、原始 URL、站点、作者、发布时间和实际剪藏时间。
- **干净的 Markdown**：支持标题、段落、粗体、斜体、链接、图片、列表、引用、行内代码及带语言识别的围栏代码块。
- **预览与编辑**：复制或下载前可直接修改 Markdown 源文本。
- **安全下载**：使用 UTF-8 编码，自动清理文件名中的非法字符，支持中文标题。
- **基础设置**：可分别控制是否包含网页一级标题和原始链接。
- **中英双语界面**：默认跟随浏览器，也可在弹窗中手动切换。
- **失败兜底**：不支持或无正文的页面仍可编辑标题、保留来源链接并手动保存。
- **本地优先**：扩展不上传网页正文，不包含分析统计或广告。

## 安装方法

### 从 GitHub Release 安装

1. 打开 [v0.1.0 Release](https://github.com/manwhatcanisay24/clip2md/releases/tag/v0.1.0)，下载 `clip2md-0.1.0-chrome.zip`。
2. 将 ZIP 解压到一个固定目录。安装后请勿删除或移动该目录。
3. 在 Chrome 中打开 `chrome://extensions`，或在 Edge 中打开 `edge://extensions`。
4. 开启 **开发者模式**。
5. 点击 **加载已解压的扩展程序**，选择刚才解压的目录。
6. 建议将 **Clip2MD** 固定到浏览器工具栏。

当前版本以 Manifest V3 解压扩展形式发布，尚未上架 Chrome 网上应用店或 Edge 加载项商店。

## 使用说明

1. 打开一篇 `http` 或 `https` 网页文章。
2. 点击浏览器工具栏中的 **Clip2MD** 图标，等待正文提取。
3. 根据需要修改文档标题或 Markdown 内容。
4. 点击 **复制**，或点击 **下载 .md** 保存到本地。

点击弹窗右上角的 **设置** 可控制标题和原始链接；点击 **EN / 中** 可切换界面语言。设置仅保存在本机并会自动保留。

| 英文界面                                   | 中文设置                                         | 提取失败兜底                                                           |
| ------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------- |
| ![英文弹窗](docs/screenshots/popup-en.png) | ![中文设置](docs/screenshots/settings-zh-CN.png) | ![可编辑标题和来源链接的失败界面](docs/screenshots/fallback-zh-CN.png) |

## 权限与隐私

| 权限 / 访问范围       | 用途                                                 |
| --------------------- | ---------------------------------------------------- |
| `activeTab`           | 在你主动剪藏时识别当前页面并与其通信。               |
| `storage`             | 仅在本机保存语言、标题和来源链接的显示偏好。         |
| HTTP / HTTPS 页面访问 | 注册提取监听器；只有打开扩展并请求剪藏后才读取正文。 |

Clip2MD 没有分析统计、广告、远程 API、账号系统或云端历史。生成的 Markdown 仅存在于当前弹窗，直到你主动复制或下载。完整说明见[隐私政策](PRIVACY.md)。

## 支持范围与已知限制

v0.1.0 专注于“网页正文 → 预览编辑 → 复制 / 下载”的核心闭环，**尚未包含**选区剪藏、YAML Front Matter、文件名模板、本地历史、图片打包、表格专项优化或直接保存到 GitHub 仓库。后续范围以[版本规划](Clip2MD-版本规划.md)为准，不会把规划中的功能当作已完成功能宣传。

- 无法剪藏浏览器内部页面、扩展商店页面或非 HTTP(S) 地址。
- 高度动态或结构特殊的网页可能提取不完整，请在保存前检查预览。
- 图片默认保留远程绝对 URL，不会自动打包为离线图片。
- 复杂表格和特定网站的代码组件需要后续版本增加转换规则。
- 不绕过登录、付费墙、验证码或任何网站访问限制。

## 本地开发

环境要求：Node.js 20.19+ 和 npm。

```bash
git clone https://github.com/manwhatcanisay24/clip2md.git
cd clip2md
npm ci
npm run dev
```

WXT 会启动开发浏览器。也可运行 `npm run build`，然后在扩展管理页选择 `.output/chrome-mv3` 目录进行手动加载。

```bash
npm run typecheck    # TypeScript 严格类型检查
npm run lint         # ESLint
npm run format:check # Prettier 格式检查
npm run test         # Vitest 固定样本与转换测试
npm run build        # 构建生产扩展
npm run zip          # 生成 Release 压缩包
npm run check        # 执行上述标准检查（不含 zip）
npm run test:browser # 真实 Edge 端到端验收与截图
```

浏览器测试需要 Windows 上的 Microsoft Edge。测试会启动本地样本服务器、加载生产扩展，并实际验证提取、双语界面、设置、剪贴板、下载和失败兜底。截图写入 `docs/screenshots`，测试下载写入 `test-results/browser`。

项目结构与贡献流程见[贡献指南](CONTRIBUTING.md)。

## 版本路线

- **v0.2.0**：选区剪藏、Front Matter、文件名模板。
- **v0.3.0**：本地历史与可复用模板。
- **v0.4.0**：代码、表格、图片与站点适配优化。
- **v0.5.0**：可选的 GitHub 仓库保存。
- **v0.9.0 / v1.0.0**：兼容性、隐私、发布候选与正式版收尾。

详细范围和验收标准见[版本规划](Clip2MD-版本规划.md)，本版变化见[更新日志](CHANGELOG.md)。

## 开源许可证

[MIT](LICENSE) © 2026 Clip2MD contributors
