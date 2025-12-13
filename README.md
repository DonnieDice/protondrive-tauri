# Proton Drive Desktop

Fast, lightweight desktop client for Proton Drive with end-to-end encryption. Built with Tauri for Linux, macOS, and Windows.

## Installation

### One-Line Install

```bash
npx github:donniedice/protondrive-tauri
```

That's it! The installer will:
1. Detect your OS and architecture
2. Download the latest binary from GitHub
3. Save to your Downloads folder
4. Make it executable (Linux)
5. Show you where to run it

---

### Manual Download

Get the latest release from [GitHub Releases](https://github.com/donniedice/protondrive-tauri/releases):

**Linux:**
- **AppImage** - Works on all distributions
  ```bash
  chmod +x Proton_Drive.AppImage
  ./Proton_Drive.AppImage
  ```
- **Debian/Ubuntu (DEB)**
  ```bash
  sudo apt install ./proton-drive.deb
  ```
- **Fedora/RHEL (RPM)**
  ```bash
  sudo dnf install ./proton-drive.rpm
  ```

**macOS:**
- Download `.dmg` file
- Double-click to mount
- Drag app to Applications folder
- Launch from Applications or Launchpad

**Windows:**
- Download `.exe` or `.msi` installer
- Run the installer
- Launch from Start Menu

## Features

- **Lightweight**: ~50MB (vs 200MB+ for Electron)
- **Fast**: Instant startup, minimal memory
- **Native**: System tray, notifications, file dialogs
- **Secure**: End-to-end encrypted, no local storage
- **Cross-Platform**: Linux, macOS, Windows

## For Developers

### Build from Source

```bash
git clone --depth=1 --recurse-submodules https://github.com/donniedice/protondrive-tauri.git
cd protondrive-tauri
npm install
npm run build
```

Binaries appear in `src-tauri/target/release/bundle/`

### Development

```bash
npm install
npm run dev
```

Hot-reload enabled - changes reflect instantly in the app window.

### Project Structure

```
src-tauri/          Rust backend (Tauri)
├── src/main.rs     IPC, system tray, menus
├── Cargo.toml      Rust dependencies
└── tauri.conf.json Configuration

WebClients/         Proton Drive web app (git submodule)
├── applications/drive/
│   └── src/        React/TypeScript source

package.json        Build scripts & Node deps
```

### Build Commands

```bash
npm run build           # Build all distributions
npm run build:appimage # AppImage only
npm run build:deb      # DEB only
npm run build:rpm      # RPM only
npm run dev            # Development mode
make build             # Using Makefile
```

### Available IPC Commands

From React/TypeScript:

```typescript
import { invoke } from "@tauri-apps/api/tauri";

// Show notification
await invoke("show_notification", {
  title: "Sync complete",
  body: "Files are up to date",
});

// File dialog
const folder = await invoke("open_file_dialog");

// App version
const version = await invoke("get_app_version");

// Check updates
const hasUpdate = await invoke("check_for_updates");
```

## Releasing

1. **Update code** and commit

2. **Tag a release**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **GitHub Actions**:
   - Triggered by the tag
   - Creates a release on GitHub
   - Builds and uploads binaries (when CI/CD is configured)

4. **Users download** from [Releases](https://github.com/donniedice/protondrive-tauri/releases)

## Updating WebClients (Proton Drive Source)

```bash
cd WebClients
git fetch origin
git checkout <tag-or-commit>
cd ..
git add WebClients
git commit -m "Update WebClients"
git push
```

## Troubleshooting

**AppImage won't run:**
```bash
chmod +x Proton_Drive.AppImage
```

**DEB/RPM dependencies missing:**
```bash
# Linux dependencies
sudo apt install libssl3 libwebkit2gtk-4.1
```

**Build fails:**
```bash
# Install build tools
# Ubuntu/Debian
sudo apt install build-essential libssl-dev pkg-config

# Fedora/RHEL
sudo dnf install gcc pkg-config openssl-devel

# Arch
sudo pacman -S base-devel openssl
```

## License

AGPL-3.0 - Same as Proton Drive

## Links

- [GitHub](https://github.com/donniedice/protondrive-tauri)
- [Releases](https://github.com/donniedice/protondrive-tauri/releases)
- [Tauri](https://tauri.app/)
- [Proton Drive](https://github.com/ProtonMail/WebClients)
