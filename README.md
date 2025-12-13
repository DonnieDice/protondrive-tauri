# Proton Drive Desktop

Fast, lightweight desktop client for Proton Drive with end-to-end encryption. Works on Linux, macOS, and Windows.

## One-Line Install (After First Release)

Once the first release is published:

```bash
npx protondrive-tauri
```

That's it! The installer will:
1. Detect your OS and architecture
2. Download the latest binary from GitHub Releases
3. Save to your Downloads folder
4. Make it executable (Linux)
5. Ask if you want to launch

**Status**: First release coming soon via GitHub Actions

---

## Current Install Methods

While builds are being prepared, use these methods:

### Linux

**AppImage** (works on all distributions):
```bash
curl -sL https://github.com/donniedice/protondrive-tauri/releases/download/latest/Proton_Drive.AppImage -o ~/Downloads/ProtonDrive.AppImage && chmod +x ~/Downloads/ProtonDrive.AppImage && ~/Downloads/ProtonDrive.AppImage
```

**Ubuntu/Debian**:
```bash
sudo apt install https://github.com/donniedice/protondrive-tauri/releases/download/latest/proton-drive.deb
```

**Fedora/RHEL**:
```bash
sudo dnf install https://github.com/donniedice/protondrive-tauri/releases/download/latest/proton-drive.rpm
```

### macOS

```bash
curl -sL https://github.com/donniedice/protondrive-tauri/releases/download/latest/Proton_Drive.dmg -o ~/Downloads/ProtonDrive.dmg && open ~/Downloads/ProtonDrive.dmg
```

### Windows

Download from [Releases](https://github.com/donniedice/protondrive-tauri/releases) and run the installer.

---

## Features

- **Lightweight**: ~50MB bundle size (vs ~200MB+ for Electron)
- **Fast**: Instant startup, minimal memory usage
- **Native Integration**: System tray, notifications, file dialogs
- **Secure**: End-to-end encryption, no data stored locally
- **Cross-Platform**: Linux, macOS, Windows

## Usage

1. Install (see above)
2. Launch the app
3. Sign in with your Proton Drive account
4. Files sync automatically

## For Developers

### Build from Source

Clone and build locally:

```bash
git clone --depth=1 --recurse-submodules https://github.com/donniedice/protondrive-tauri.git
cd protondrive-tauri
npm install
npm run build
```

Binaries are in `src-tauri/target/release/bundle/`.

### Development

```bash
npm install
npm run dev
```

This starts a dev server with hot-reload.

### Project Structure

```
src-tauri/          # Rust backend (Tauri)
├── src/main.rs     # IPC commands, system tray, menus
├── Cargo.toml      # Rust dependencies
└── tauri.conf.json # App configuration

WebClients/         # Proton Drive web app (git submodule)
└── applications/drive/
    └── src/        # React/TypeScript source

package.json        # Build scripts and dependencies
```

### Build Commands

```bash
npm run build           # Build all distributions
npm run build:appimage # AppImage only
npm run build:deb      # DEB only
npm run build:rpm      # RPM only
npm run dev            # Development with hot-reload
```

### IPC Commands (Rust ↔ React)

Available commands from the Rust backend:

```typescript
import { invoke } from "@tauri-apps/api/tauri";

// Show notification
await invoke("show_notification", {
  title: "Sync complete",
  body: "Files are up to date",
});

// File picker dialog
const folder = await invoke("open_file_dialog");

// Get app version
const version = await invoke("get_app_version");

// Check for updates
const hasUpdate = await invoke("check_for_updates");
```

### Release Process

1. Create a git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. GitHub Actions automatically:
   - Builds for Linux, macOS, Windows
   - Creates a GitHub Release
   - Uploads all binaries with checksums

## Updating WebClients (Proton Drive source)

The WebClients repo is included as a submodule. To update:

```bash
cd WebClients
git fetch origin
git checkout <tag-or-commit>
cd ..
git add WebClients
git commit -m "Update WebClients to <version>"
git push
```

## Troubleshooting

**AppImage won't run**: Make sure it's executable
```bash
chmod +x Proton_Drive.AppImage
```

**DEB install fails**: Check dependencies
```bash
sudo apt install libssl3 libwebkit2gtk-4.1 libgtk-3-0
```

**Build fails on Linux**: Install build tools
```bash
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

- [Tauri Docs](https://tauri.app/)
- [Proton Drive](https://github.com/ProtonMail/WebClients)
- [Releases](https://github.com/donniedice/protondrive-tauri/releases)
