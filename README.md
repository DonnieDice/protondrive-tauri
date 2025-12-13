# Proton Drive Desktop

Fast, lightweight desktop client for Proton Drive with end-to-end encryption. Built with Tauri for Linux, macOS, and Windows.

## Installation

```bash
npx github:donniedice/protondrive-tauri
```

That's it! The installer automatically:
- Detects your OS and architecture
- Downloads the latest binary
- Installs to proper system location
- Adds to applications menu
- **No manual steps needed**

---

## Features

- ✅ Lightweight (~50MB vs 200MB+ for Electron)
- ✅ Fast startup and minimal memory usage
- ✅ Native system integration (tray, notifications, menus)
- ✅ End-to-end encrypted (all Proton Drive security features)
- ✅ Cross-platform (Linux, macOS, Windows)
- ✅ One-line install via npx

---

## For Developers

### Development Setup

```bash
git clone --depth=1 --recurse-submodules https://github.com/donniedice/protondrive-tauri.git
cd protondrive-tauri
npm install
npm run dev
```

Changes hot-reload automatically.

### Build Commands

```bash
npm run build           # Build all distributions
npm run build:appimage # Linux AppImage only
npm run build:deb      # Debian/Ubuntu DEB
npm run build:rpm      # Fedora/RHEL RPM
```

### Project Structure

```
src-tauri/          # Rust backend (Tauri)
├── src/main.rs     # IPC commands, system tray, menus
├── Cargo.toml      # Rust dependencies
└── tauri.conf.json # App configuration

WebClients/         # Proton Drive web app (git submodule)
└── applications/drive/
    └── src/        # React/TypeScript source

install.js          # NPX installer script
package.json        # Build scripts & dependencies
```

### Releasing

1. Commit changes and push
2. Create a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions automatically:
   - Builds for Linux, macOS, and Windows
   - Creates GitHub Release
   - Uploads all binaries
4. Users install with: `npx github:donniedice/protondrive-tauri`

### Available IPC Commands

From React/TypeScript frontend:

```typescript
import { invoke } from "@tauri-apps/api/tauri";

// Notifications
await invoke("show_notification", {
  title: "Upload complete",
  body: "Files synced"
});

// File dialogs
const folder = await invoke("open_file_dialog");

// App info
const version = await invoke("get_app_version");
const hasUpdate = await invoke("check_for_updates");
```

---

## Prerequisites for Development

- Node.js 18+
- Rust (https://rustup.rs/)
- Build tools:
  - **Linux**: `sudo apt install build-essential libssl-dev pkg-config`
  - **macOS**: `xcode-select --install`
  - **Windows**: Visual Studio Build Tools

---

## License

AGPL-3.0 - Same as Proton Drive

## Links

- [GitHub Repository](https://github.com/donniedice/protondrive-tauri)
- [GitHub Releases](https://github.com/donniedice/protondrive-tauri/releases)
- [Tauri Documentation](https://tauri.app/)
- [Proton Drive](https://github.com/ProtonMail/WebClients)
