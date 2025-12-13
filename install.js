#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");
const os = require("os");

const REPO = "donniedice/protondrive-tauri";
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;

const platform = os.platform();
const arch = os.arch();

const platformMap = {
  linux: { x64: "Proton_Drive", arm64: "Proton_Drive" },
  darwin: { x64: "Proton_Drive", arm64: "Proton_Drive" },
  win32: { x64: "Proton_Drive", arm64: "Proton_Drive" },
};

const extensionMap = {
  linux: { x64: ".AppImage", arm64: ".AppImage" },
  darwin: { x64: ".dmg", arm64: ".dmg" },
  win32: { x64: ".exe", arm64: ".exe" },
};

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
            reject(new Error("No releases found. Visit: https://github.com/donniedice/protondrive-tauri/releases"));
            return;
          }

          if (!release.assets || release.assets.length === 0) {
            reject(new Error("No assets in release. Builds may still be in progress."));
            return;
          }

          const ext = extensionMap[platform]?.[arch] || ".AppImage";
          const asset = release.assets.find((a) => a.name.includes(ext));

          if (!asset) {
            const available = release.assets.map(a => a.name).join(", ");
            reject(new Error(`No ${ext} binary found.\nAvailable: ${available}`));
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

function clearLine() {
  process.stdout.write("\r\x1B[K");
}

async function install() {
  process.stdout.write("🚀 Installing Proton Drive Desktop");

  try {
    process.stdout.write(".");
    const downloadUrl = await getDownloadUrl();
    const filename = downloadUrl.split("/").pop();
    process.stdout.write(".");

    const downloads = path.join(os.homedir(), "Downloads");
    if (!fs.existsSync(downloads)) {
      fs.mkdirSync(downloads, { recursive: true });
    }

    const filepath = path.join(downloads, filename);
    process.stdout.write(".");

    await downloadFile(downloadUrl, filepath);
    process.stdout.write(".");

    if (platform === "linux") {
      fs.chmodSync(filepath, 0o755);
    }
    process.stdout.write(".");

    clearLine();
    console.log(`✅ Installed to ~/Downloads/${filename}`);

    if (platform === "linux") {
      console.log(`   Run: chmod +x ~/Downloads/${filename} && ~/Downloads/${filename}`);
    } else if (platform === "darwin") {
      console.log(`   Run: open ~/Downloads/${filename}`);
    } else if (platform === "win32") {
      console.log(`   Run: start ~/Downloads/${filename}`);
    }

  } catch (error) {
    clearLine();
    console.log(`❌ Failed: ${error.message}`);
    console.log("   Visit: https://github.com/donniedice/protondrive-tauri/releases");
    process.exit(1);
  }
}

install();
