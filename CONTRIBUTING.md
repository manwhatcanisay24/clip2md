# Contributing to Clip2MD / 贡献指南

Thank you for helping improve Clip2MD. / 感谢参与 Clip2MD。

## Development workflow / 开发流程

1. Fork and clone the repository. / Fork 并克隆仓库。
2. Use Node.js 20.19+ and run `npm ci`.
3. Create a focused branch from `main`. / 从 `main` 创建目标明确的分支。
4. Run `npm run dev` for development and keep changes within the current version scope.
5. Before submitting, run:

```bash
npm run check
npm run test:browser # Windows + Microsoft Edge / Windows 和 Edge 环境
npm run zip
```

Do not commit `.output`, `.wxt`, `node_modules`, test downloads, personal notes, tokens, or other credentials. / 请勿提交构建目录、依赖、测试下载、私人笔记或任何凭据。

## Project layout / 项目结构

```text
entrypoints/       Extension popup, content script, background / 扩展入口
lib/extractor/    Readability, metadata, cleanup / 正文与元数据提取
lib/markdown/     Conversion, composition, filenames / Markdown 转换与文件名
components/       Small UI helpers / 轻量界面组件
tests/fixtures/   Stable local HTML samples / 固定网页样本
scripts/          Real browser verification / 真实浏览器验收
docs/screenshots/ Release documentation images / 文档截图
```

## Changes and tests / 修改与测试

- Match the existing strict TypeScript and native CSS style.
- Add a regression test for each parsing bug and keep fixtures de-identified.
- Do not silently drop unsupported HTML; preserve it or document the limitation.
- Request only permissions needed by the feature and update the README and privacy policy if access changes.
- Update both README files for user-visible changes. / 用户可见变化需同步更新中英文 README。
- Keep v0.2+ features out of v0.1 patches unless the version plan is deliberately updated.

每个解析 Bug 应补充回归测试；样本不得包含个人数据。不得静默丢弃不支持的 HTML，不得随意扩大浏览器权限。

## Commits and pull requests / 提交与 PR

Use concise commit messages and describe the behavior change, verification performed, and any remaining limitations in the PR. Link the related issue and include before/after screenshots for UI changes. All CI checks must pass.

提交信息保持简洁。PR 请说明行为变化、实际验证和剩余限制，关联 Issue；界面变化请附前后截图，并确保 CI 通过。

## Code of conduct / 行为准则

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). / 参与项目请遵守行为准则。
