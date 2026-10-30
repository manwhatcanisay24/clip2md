# Security Policy / 安全政策

## Supported versions / 支持的版本

Only the latest release receives security fixes. / 仅最新发布版本接收安全修复。

| Version | Supported |
| ------- | --------- |
| v0.1.x  | Yes / 是  |
| Earlier | No / 否   |

## Reporting a vulnerability / 报告漏洞

Please do not open a public issue for a vulnerability that could expose page content, local data, or user credentials. Use **Private vulnerability reporting** on the repository's **Security** tab, or contact the maintainer through the private channel listed on their GitHub profile.

Include the affected version, browser, reproduction steps, potential impact, and a minimal proof of concept. Do not include real account tokens, private article content, or another person's data. We will acknowledge reports as soon as practical and coordinate a fix and disclosure timeline.

如发现可能泄露网页内容、本地数据或凭据的漏洞，请勿直接提交公开 Issue。请使用仓库 **Security** 页面中的 **Private vulnerability reporting**，或通过维护者 GitHub 主页列出的私密渠道联系。报告请包含版本、浏览器、复现步骤、影响和最小示例，不要提交真实 Token、私人文章或他人数据。

## Credential safety / 凭据安全

Clip2MD v0.1.0 does not request GitHub tokens or account credentials. Never place access tokens in fixtures, issues, screenshots, logs, or release archives.

v0.1.0 不请求 GitHub Token 或账号凭据。请勿在样本、Issue、截图、日志或发布包中放入访问令牌。
