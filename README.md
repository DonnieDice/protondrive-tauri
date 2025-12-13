# Proton Drive Tauri Desktop Client

A cross-platform desktop client for Proton Drive built with Tauri, wrapping the official Proton Drive web application.

## Features

- **Cross-Platform**: Runs on Linux, macOS, and Windows
- **Native Integration**: System tray, notifications, file dialogs
- **Lightweight**: Smaller bundle size than Electron
- **End-to-End Encrypted**: Inherits all security features from Proton Drive
- **Multiple Distributions**: AppImage, DEB, RPM packages for Linux

## Prerequisites

- **Node.js** 16+ and npm
- **Rust** (via rustup: https://rustup.rs/)
- **Build tools**:
  - **Linux**: `gcc`, `pkg-config`, `libssl-dev`
    ```bash
    # Ubuntu/Debian
    sudo apt-get install build-essential libssl-dev pkg-config

    # Fedora/RHEL
    sudo dnf install gcc pkg-config openssl-devel

    # Arch
    sudo pacman -S base-devel openssl
    ```
  - **macOS**: Xcode Command Line Tools
    ```bash
    xcode-select --install
    ```
  - **Windows**: Visual Studio Build Tools

## Project Structure

```
protondrive-tauri/
├── src-tauri/              # Rust backend (Tauri)
│   ├── src/main.rs        # Main Tauri application logic
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── WebClients/            # Git submodule (Proton Drive web app)
│   └── applications/drive/
├── package.json           # Node dependencies and scripts
└── README.md
```

## Setup

### 1. Clone the repository with submodules

```bash
git clone --recurse-submodules https://github.com/yourusername/protondrive-tauri.git
cd protondrive-tauri
```

**Note**: The WebClients submodule is large (~4GB+). If cloning stalls, you can update it separately:

```bash
git submodule init
git submodule update --depth=1
```

Or clone the WebClients repository manually to a specific branch/tag:

```bash
git clone --depth=1 https://github.com/ProtonMail/WebClients.git WebClients
cd WebClients && git fetch origin <branch-or-tag> && git checkout <branch-or-tag>
```

### 2. Install dependencies

```bash
npm install
```

This installs the Tauri CLI and Node dependencies.

## Development

### Start development server

```bash
npm run dev
```

This will:
1. Start a local dev server at `http://localhost:5173`
2. Launch the Tauri application window
3. Load the Proton Drive web app from the dev server

Changes to the React app will hot-reload in the window.

## Building

### Build for Linux

```bash
npm run build
```

This builds the web app and creates all Linux distributions (AppImage, DEB, RPM).

### Platform-specific builds

```bash
# AppImage only
npm run build:appimage

# DEB only (Debian/Ubuntu)
npm run build:deb

# RPM only (Fedora/RHEL)
npm run build:rpm
```

### Build outputs

After building, binaries are located in:
```
src-tauri/target/release/bundle/
```

Examples:
- `src-tauri/target/release/bundle/appimage/Proton\ Drive_*.AppImage`
- `src-tauri/target/release/bundle/deb/proton-drive_*.deb`
- `src-tauri/target/release/bundle/rpm/proton-drive-*.rpm`

## Distribution

### AppImage

The AppImage is a single executable that works across all Linux distributions:

```bash
./Proton\ Drive_1.0.0_x64.AppImage
```

You can also make it executable and add to PATH for convenience.

### DEB (Debian/Ubuntu)

```bash
sudo apt install ./proton-drive_1.0.0_amd64.deb
```

This will install to the applications menu and register associations.

### RPM (Fedora/RHEL)

```bash
sudo dnf install proton-drive-1.0.0-1.x86_64.rpm
```

## Configuration

### Tauri Configuration (`src-tauri/tauri.conf.json`)

Key settings:
- **Window**: Size, min/max dimensions, fullscreen options
- **Bundle**: Platforms to target, icons, metadata
- **Security**: CSP policy (currently null for maximum compatibility)

### Updating WebClients

The WebClients repository is included as a git submodule. To update to a newer version:

```bash
cd WebClients
git fetch origin
git checkout <commit-hash-or-tag>
cd ..
git add WebClients
git commit -m "Update WebClients to <version>"
```

## Rust Backend Commands

The Tauri backend exposes these commands to the frontend (via `tauri::invoke`):

- `show_notification(title, body)` - Show a desktop notification
- `open_file_dialog()` - Open file picker dialog
- `get_app_version()` - Get application version
- `check_for_updates()` - Check for app updates

### Example frontend usage (React/TypeScript)

```typescript
import { invoke } from "@tauri-apps/api/tauri";

// Show notification
await invoke("show_notification", {
  title: "Upload complete",
  body: "Your file has been synced",
});

// Open file dialog
const folder = await invoke("open_file_dialog");
```

## Troubleshooting

### Build fails on Linux

Ensure all build dependencies are installed:
```bash
# Ubuntu/Debian
sudo apt-get install build-essential libssl-dev pkg-config

# Check Rust installation
rustc --version
cargo --version
```

### WebClients submodule not initialized

```bash
git submodule update --init --recursive
```

### Port 5173 already in use

Either kill the process using that port or modify the dev server port in `tauri.conf.json`.

### AppImage won't run

Make it executable:
```bash
chmod +x Proton\ Drive_*.AppImage
```

## Development Workflow

1. **Web app changes**: Edit code in `WebClients/applications/drive/src/`
2. **Desktop features**: Edit Rust code in `src-tauri/src/`
3. **Testing**: Run `npm run dev` and test the app
4. **Building**: Run `npm run build` when ready to distribute

## Performance Notes

- The app runs in a WebView (not fully native), but performs similarly to the web version
- Initial bundle size is larger than the web version (~100-200MB unpacked) due to Chromium/WebView
- Startup time is typically 1-3 seconds
- RAM usage is similar to running the web app in a browser tab

## License

AGPL-3.0 - Same as Proton Drive

## Support

For issues with the Tauri wrapper, check:
- [Tauri Documentation](https://tauri.app/en/docs/)
- [Proton Drive GitHub](https://github.com/ProtonMail/WebClients)

For Proton Drive-specific issues, see the main Proton Drive repository.
