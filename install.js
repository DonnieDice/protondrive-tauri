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

const extensionMap = {
  linux: { x64: ".AppImage", arm64: ".AppImage" },
  darwin: { x64: ".dmg", arm64: ".dmg" },
  win32: { x64: ".exe", arm64: ".exe" },
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
            reject(new Error("No assets in release"));
            return;
          }

          const ext = extensionMap[platform]?.[arch] || ".AppImage";
          const asset = release.assets.find((a) => a.name.includes(ext));

          if (!asset) {
            reject(new Error(`No ${ext} binary found`));
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
    process.stdout.write("\r");
    return result;
  } catch (e) {
    clearInterval(interval);
    process.stdout.write("\r");
    throw e;
  }
}

async function install() {
  try {
    const downloadUrl = await animateSpinner(
      getDownloadUrl(),
      "Fetching latest release..."
    );

    const filename = downloadUrl.split("/").pop();
    const downloads = path.join(os.homedir(), "Downloads");
    if (!fs.existsSync(downloads)) {
      fs.mkdirSync(downloads, { recursive: true });
    }
    const filepath = path.join(downloads, filename);

    await animateSpinner(
      downloadFile(downloadUrl, filepath),
      "Downloading binary..."
    );

    if (platform === "linux") {
      await animateSpinner(
        Promise.resolve(fs.chmodSync(filepath, 0o755)),
        "Setting permissions..."
      );
    }

    console.log(`✅ Installed to ~/Downloads/${filename}`);

    if (platform === "linux") {
      console.log(`   ${filepath}`);
    } else if (platform === "darwin") {
      console.log(`   open ~/Downloads/${filename}`);
    } else if (platform === "win32") {
      console.log(`   start ~/Downloads/${filename}`);
    }

  } catch (error) {
    process.stdout.write("\r");
    console.log(`❌ ${error.message}`);
    process.exit(1);
  }
}

install();
