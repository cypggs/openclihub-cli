<div align="center">

# OpenCLI Hub CLI

**Search, browse and install CLI tools from the terminal**

[English](#-usage) | [中文](#-使用方法)

[![npm](https://img.shields.io/npm/v/openclihub)](https://www.npmjs.com/package/openclihub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🌐 **Website**: [openclihub.com](https://openclihub.com)

</div>

---

## Install

```bash
npm install -g openclihub
```

Or run directly without installing:

```bash
npx openclihub list
```

## 📖 Usage

### List all tools

```bash
openclihub list
openclihub list --type official
openclihub list --category "Developer Tools"
openclihub list --json              # JSON output for AI agents
```

### Search tools

```bash
openclihub search browser
openclihub search database --json
```

### View tool details

```bash
openclihub info lark-cli
openclihub info supabase-cli --json
```

### Install a tool

```bash
openclihub install supabase-cli         # Human install (runs install_command)
openclihub install lark-cli --agent     # Agent install (outputs README URL)
openclihub install supabase-cli -y      # Skip confirmation
```

### Authenticate (QR code support)

For tools that require login (e.g. Lark CLI), the `auth` command helps AI agents in IM tools handle QR codes:

```bash
openclihub auth lark-cli                        # ASCII QR in terminal
openclihub auth lark-cli --qr-image /tmp/qr.png # Save QR as PNG (for IM bots)
openclihub auth lark-cli --json                  # JSON with auth URL + QR base64
```

### Other commands

```bash
openclihub categories       # List all categories
openclihub stats            # Show hub statistics
openclihub open lark-cli    # Open tool page in browser
openclihub open lark-cli --github   # Open GitHub repo
```

### Global options

```bash
openclihub --json           # All commands support JSON output
openclihub --api-url <url>  # Custom API URL
```

## 🤖 AI Agent Integration

Every command supports `--json` for structured output. AI agents can:

1. **Discover tools**: `openclihub search "browser automation" --json`
2. **Get install instructions**: `openclihub install browser-use-cli --agent`
3. **Handle QR auth**: `openclihub auth lark-cli --qr-image /tmp/qr.png` → send PNG to IM chat

## 📄 License

[MIT](LICENSE)

---

<div align="center">

## 📖 使用方法

### 列出所有工具

```bash
openclihub list
openclihub list --type official       # 筛选官方工具
openclihub list --category "Developer Tools"
openclihub list --json                # JSON 输出（AI Agent 友好）
```

### 搜索工具

```bash
openclihub search browser
openclihub search 数据库 --json
```

### 查看工具详情

```bash
openclihub info lark-cli
openclihub info supabase-cli --json
```

### 安装工具

```bash
openclihub install supabase-cli         # 人类安装（执行 install_command）
openclihub install lark-cli --agent     # Agent 安装（输出 README URL）
openclihub install supabase-cli -y      # 跳过确认
```

### 认证（QR 码支持）

对于需要登录的工具（如飞书 CLI），`auth` 命令帮助 AI Agent 在 IM 工具中处理扫码认证：

```bash
openclihub auth lark-cli                        # 终端 ASCII QR 码
openclihub auth lark-cli --qr-image /tmp/qr.png # 保存 QR 为 PNG（发到 IM 聊天）
openclihub auth lark-cli --json                  # JSON 输出认证 URL + QR base64
```

### 其他命令

```bash
openclihub categories       # 列出所有分类
openclihub stats            # 显示统计信息
openclihub open lark-cli    # 在浏览器中打开工具页面
openclihub open lark-cli --github   # 打开 GitHub 仓库
```

## 🤖 AI Agent 集成

所有命令都支持 `--json` 结构化输出。AI Agent 可以：

1. **发现工具**：`openclihub search "browser automation" --json`
2. **获取安装指令**：`openclihub install browser-use-cli --agent`
3. **处理扫码认证**：`openclihub auth lark-cli --qr-image /tmp/qr.png` → 将 PNG 发到 IM 聊天

## 📄 许可证

[MIT](LICENSE)

</div>
