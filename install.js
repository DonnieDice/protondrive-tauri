#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const os = require("os");
const { execSync } = require("child_process");

const REPO = "donniedice/protondrive-tauri";
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

const platform = os.platform();
const arch = os.arch();

const extensionMap = {
  linux: { x64: ".AppImage", arm64: ".AppImage" },
  darwin: { x64: ".dmg", arm64: ".dmg" },
  win32: { x64: ".exe", arm64: ".msi" },
};

const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function getDownloadUrl() {
  return new Promise((resolve, reject) => {
    https.get(API_URL, {
      headers: { "User-Agent": "protondrive-tauri-installer" },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const release = JSON.parse(data);

          if (release.message === "Not Found") {
            reject(new Error("No releases found"));
            return;
          }

          if (!release.assets || release.assets.length === 0) {
            reject(new Error("No binaries available yet"));
            return;
          }

          const ext = extensionMap[platform]?.[arch] || ".AppImage";
          const asset = release.assets.find((a) => a.name.includes(ext));

          if (!asset) {
            const available = release.assets.map(a => a.name).join(", ");
            reject(new Error(`No ${ext} found. Available: ${available}`));
            return;
          }

          resolve(asset.browser_download_url);
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function animateSpinner(promise, message) {
  let frame = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${spinnerFrames[frame % spinnerFrames.length]} ${message}`);
    frame++;
  }, 80);

  try {
    const result = await promise;
    clearInterval(interval);
    process.stdout.write("\r\x1B[K");
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write("\r\x1B[K");
    throw e;
  }
}

async function installLinux(downloadUrl, filename) {
  const tempFile = path.join("/tmp", filename);
  await animateSpinner(
    downloadFile(downloadUrl, tempFile),
    "Downloading binary..."
  );

  const installDir = path.join(process.env.HOME, ".local/bin");
  const installPath = path.join(installDir, "proton-drive");

  if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true });
  }

  fs.copyFileSync(tempFile, installPath);
  fs.chmodSync(installPath, 0o755);
  fs.unlinkSync(tempFile);

  const desktopFile = path.join(process.env.HOME, ".local/share/applications/protondrive.desktop");
  const desktopDir = path.dirname(desktopFile);
  if (!fs.existsSync(desktopDir)) {
    fs.mkdirSync(desktopDir, { recursive: true });
  }

  const desktopContent = `[Desktop Entry]
Version=1.0
Type=Application
Name=Proton Drive
Comment=Encrypted cloud storage
Exec=${installPath}
Icon=folder
Categories=Utility;
Terminal=false`;

  fs.writeFileSync(desktopFile, desktopContent);

  try {
    execSync("update-desktop-database ~/.local/share/applications 2>/dev/null", { stdio: "ignore" });
  } catch {}

  console.log(`✅ Installed to ~/.local/bin/proton-drive`);
  console.log(`   Launch: proton-drive`);
  console.log(`   Or find in Applications menu`);
}

async function installMacOS(downloadUrl, filename) {
  const tempFile = path.join("/tmp", filename);
  await animateSpinner(
    downloadFile(downloadUrl, tempFile),
    "Downloading binary..."
  );

  const appsDir = path.join(process.env.HOME, "Applications");
  if (!fs.existsSync(appsDir)) {
    fs.mkdirSync(appsDir, { recursive: true });
  }

  try {
    execSync(`hdiutil attach "${tempFile}" -quiet`, { stdio: "pipe" });
    const volumes = fs.readdirSync("/Volumes");
    const volume = volumes.find((v) => v.includes("Proton") || v.includes("Drive"));

    if (volume) {
      const srcApp = path.join(`/Volumes/${volume}`, "Proton Drive.app");
      const dstApp = path.join(appsDir, "Proton Drive.app");

      if (fs.existsSync(dstApp)) {
        execSync(`rm -rf "${dstApp}"`);
      }

      execSync(`cp -r "${srcApp}" "${dstApp}"`);
      execSync(`hdiutil detach "/Volumes/${volume}" -quiet`);

      console.log(`✅ Installed to ~/Applications/Proton Drive.app`);
      console.log(`   Available in Launchpad`);
    }
  } catch (e) {
    throw new Error("Failed to install DMG. Try manual install: open /tmp/" + filename);
  }

  fs.unlinkSync(tempFile);
}

async function installWindows(downloadUrl, filename) {
  const tempFile = path.join(process.env.TEMP, filename);
  await animateSpinner(
    downloadFile(downloadUrl, tempFile),
    "Downloading installer..."
  );

  console.log(`✅ Downloaded installer`);
  console.log(`   Running setup...`);

  try {
    execSync(`"${tempFile}"`, { stdio: "inherit" });
  } catch {
    console.log(`   If installer didn't start, run: "${tempFile}"`);
  }
}

async function install() {
  try {
    const downloadUrl = await animateSpinner(
      getDownloadUrl(),
      "Fetching latest release..."
    );

    const filename = downloadUrl.split("/").pop();

    if (platform === "linux") {
      await installLinux(downloadUrl, filename);
    } else if (platform === "darwin") {
      await installMacOS(downloadUrl, filename);
    } else if (platform === "win32") {
      await installWindows(downloadUrl, filename);
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

  } catch (error) {
    process.stdout.write("\r\x1B[K");
    console.log(`❌ ${error.message}`);
    console.log("");
    console.log("📋 To build and upload binaries:");
    console.log("   1. npm install");
    console.log("   2. npm run build");
    console.log("   3. Upload from src-tauri/target/release/bundle/ to GitHub Releases");
    console.log("");
    console.log("🔗 Release page: https://github.com/donniedice/protondrive-tauri/releases/tag/v1.0.0");
    process.exit(1);
  }
}

install();
