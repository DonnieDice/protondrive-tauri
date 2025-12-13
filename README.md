# Proton Drive Desktop

Fast, lightweight desktop client for Proton Drive with end-to-end encryption. Built with Tauri for Linux, macOS, and Windows.

## Installation

### One-Line Install

```bash
npx github:donniedice/protondrive-tauri
```

The installer will automatically:
- Detect your OS and architecture
- Download the latest binary
- Install to proper system location (not Downloads)
- Add to applications menu / PATH
- No manual setup needed

**What it does per platform:**

- **Linux**: Installs to `~/.local/bin/proton-drive` and adds to applications menu
- **macOS**: Installs to `~/Applications/` and adds to Launchpad
- **Windows**: Runs native installer to Program Files

## Building from Source

### Prerequisites

- Node.js 18+
- Rust (install from https://rustup.rs/)
- Build tools:
  - **Linux**: `sudo apt install build-essential libssl-dev pkg-config`
  - **macOS**: `xcode-select --install`
  - **Windows**: Visual Studio Build Tools

### Build Steps

```bash
git clone --depth=1 --recurse-submodules https://github.com/donniedice/protondrive-tauri.git
cd protondrive-tauri
npm install
npm run build
```

Binaries are created in `src-tauri/target/release/bundle/`

### Releasing

1. Build binaries (see above)
2. Go to [GitHub Releases](https://github.com/donniedice/protondrive-tauri/releases)
3. Edit the release and upload files from `src-tauri/target/release/bundle/`
4. Users can then install with: `npx github:donniedice/protondrive-tauri`

## Project Structure

```
src-tauri/          # Rust backend
├── src/main.rs     # IPC commands, system tray, menus
├── Cargo.toml      # Rust dependencies
└── tauri.conf.json # Configuration

WebClients/         # Proton Drive web app (git submodule)
└── applications/drive/
    └── src/        # React/TypeScript source

install.js          # NPX installer script
package.json        # Build scripts
```

## Development

```bash
npm install
npm run dev
```

Hot-reload enabled - changes reflect instantly.

## Available Commands

```bash
npm run dev             # Development mode
npm run build           # Build all distributions
npm run build:appimage  # Linux AppImage only
npm run build:deb       # Debian/Ubuntu package
npm run build:rpm       # Fedora/RHEL package
```

## Rust Backend Commands

Available IPC commands from the frontend:

```typescript
import { invoke } from "@tauri-apps/api/tauri";

// Show notification
await invoke("show_notification", {
  title: "Upload complete",
  body: "Files synced"
});

// File dialog
const folder = await invoke("open_file_dialog");

// Get version
const version = await invoke("get_app_version");

// Check updates
const hasUpdate = await invoke("check_for_updates");
```

## Features

- ✅ Lightweight (~50MB vs 200MB+ for Electron)
- ✅ Fast startup and low memory usage
- ✅ Native system integration (tray, notifications, menus)
- ✅ End-to-end encrypted (all Proton Drive security)
- ✅ Cross-platform (Linux, macOS, Windows)
- ✅ One-line install via npx

## License

AGPL-3.0 - Same as Proton Drive

## Links

- [GitHub Repository](https://github.com/donniedice/protondrive-tauri)
- [GitHub Releases](https://github.com/donniedice/protondrive-tauri/releases)
- [Tauri Documentation](https://tauri.app/)
- [Proton Drive](https://github.com/ProtonMail/WebClients)
