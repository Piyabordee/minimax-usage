# VSCode MiniMax Usage

<div align="center">

![Status bar example](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)

Display your [MiniMax Token Plan](https://platform.minimax.io/docs/token-plan/faq) usage directly in the VS Code status bar.

</div>

## Features

- Shows token usage percentage for MiniMax models in the status bar
- Displays remaining time until quota resets
- Automatically refreshes at a configurable interval
- Secure API key storage via VS Code Secret Storage

**Status bar examples:**

| Situation | Display |
| --- | --- |
| Usage available | `⚡ MiniMax 0% (10h)` |
| High usage | `⚡ MiniMax 85% (30m)` |
| API key not set | `🔑 MiniMax: Set API Key` |
| Error / fetch failed | `⚠️ MiniMax: Error` |

## Installation

1. Download the [latest `.vsix` file](https://github.com/Piyabordee/minimax-usage/releases/latest)
2. In VS Code: **Extensions** → **...** (three dots) → **Install from VSIX...**
3. Select the downloaded `.vsix` file
4. **Reload Window** when prompted

**Or via command line:**
```bash
code --install-extension minimax-usage-1.0.0.vsix
```

## Setup

1. Get your Token Plan Key from [MiniMax Platform](https://platform.minimax.io/docs/token-plan/faq)
2. Click the status bar item `🔑 MiniMax: Set API Key` (bottom-right)
3. Paste your Token Plan Key
4. The status bar will update automatically

## Commands

| Command | Description |
| --- | --- |
| `MiniMax Usage: Set API Key` | Enter your MiniMax Token Plan Key |
| `MiniMax Usage: Refresh` | Manually refresh usage data |
| `MiniMax Usage: Show Details` | View detailed usage breakdown |

## Settings

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `minimaxUsage.refreshIntervalMinutes` | `number` | `5` | Auto-refresh interval in minutes (1-60) |

## API

This extension uses the MiniMax Token Plan API:
- **Endpoint:** `GET https://www.minimax.io/v1/token_plan/remains`
- **Auth:** `Authorization: Bearer <Token Plan Key>`

## Requirements

- VS Code 1.85.0 or higher
- A valid MiniMax Token Plan Key

## License

[MIT](LICENSE)

## Credits

Inspired by [vscode-zai-usage](https://github.com/j4rviscmd/vscode-zai-usage) by j4rviscmd