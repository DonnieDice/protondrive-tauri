#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { execSync } = require("child_process");
const os = require("os");

const REPO = "donniedice/protondrive-tauri";
const RELEASE_TAG = "latest";
const API_URL = `https://api.github.com/repos/${REPO}/releases/${RELEASE_TAG}`;

const platform = os.platform();
const arch = os.arch();

// Map to platform-specific binaries
const platformMap = {
  linux: {
    x64: "Proton_Drive.AppImage",
    arm64: "Proton_Drive.AppImage",
  },
  darwin: {
    x64: "Proton_Drive.dmg",
    arm64: "Proton_Drive.dmg",
  },
  win32: {
    x64: "Proton_Drive.exe",
    arm64: "Proton_Drive.exe",
  },
};

const archMap = {
  x64: "x64",
  arm64: "arm64",
};

async function getDownloadUrl() {
  return new Promise((resolve, reject) => {
    https
      .get(API_URL, {
        headers: { "User-Agent": "protondrive-tauri-installer" },
      }, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const release = JSON.parse(data);

            if (release.message === "Not Found") {
              reject(new Error("No release found. Visit: https://github.com/donniedice/protondrive-tauri/releases"));
            }

            if (!release.assets || release.assets.length === 0) {
              reject(new Error("No assets found in release. Builds may still be in progress."));
            }

            const mappedArch = archMap[arch] || "x64";
            const filename =
              platformMap[platform]?.[mappedArch] ||
              "Proton_Drive.AppImage";

            // Find asset matching the binary name
            const asset = release.assets.find((a) =>
              a.name.includes(filename.replace(/\.[^.]+$/, ""))
            );

            if (!asset) {
              const available = release.assets.map(a => a.name).join(", ");
              reject(
                new Error(
                  `No ${filename} found for ${platform}-${mappedArch}\nAvailable: ${available}`
                )
              );
            }
            resolve(asset.browser_download_url);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

async function install() {
  console.log("🚀 Installing Proton Drive Desktop...\n");
  console.log(`📊 Platform: ${platform} (${arch})\n`);

  try {
    console.log("📥 Fetching latest release from GitHub...");
    const downloadUrl = await getDownloadUrl();
    console.log(`✓ Found: ${downloadUrl}\n`);

    const downloads = path.join(os.homedir(), "Downloads");
    if (!fs.existsSync(downloads)) {
      fs.mkdirSync(downloads, { recursive: true });
    }

    const filename =
      downloadUrl.split("/").pop() || "Proton_Drive.AppImage";
    const filepath = path.join(downloads, filename);

    console.log(`📦 Downloading to ~/Downloads/${filename}...`);
    await downloadFile(downloadUrl, filepath);
    console.log("✓ Download complete\n");

    if (platform === "linux") {
      console.log("🔧 Making executable...");
      fs.chmodSync(filepath, 0o755);
      console.log("✓ Made executable\n");

      console.log("🎉 Installation complete!");
      console.log(`\n📍 App saved to: ${filepath}`);
      console.log(
        `\n🚀 To launch:\n   ${filepath}\n`
      );
      console.log(`Or from terminal:\n   ${path.basename(filepath)}\n`);

      console.log("Would you like to launch now? (y/n) ");
      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("", (answer) => {
        rl.close();
        if (answer.toLowerCase() === "y") {
          try {
            execSync(`"${filepath}"`, { stdio: "inherit" });
          } catch (e) {
            console.log(`\nRun manually: ${filepath}`);
          }
        }
      });
    } else if (platform === "darwin") {
      console.log("🎉 Installation complete!");
      console.log(
        `\n📍 Downloaded to: ${filepath}`
      );
      console.log(
        `\n🚀 Double-click to mount and install, or:\n   open ${filepath}\n`
      );
    } else if (platform === "win32") {
      console.log("🎉 Installation complete!");
      console.log(
        `\n📍 Downloaded to: ${filepath}`
      );
      console.log(
        `\n🚀 Double-click to run the installer, or:\n   start ${filepath}\n`
      );
    }
  } catch (error) {
    console.error("\n❌ Installation failed:");
    console.error(`   ${error.message}\n`);
    console.log("💡 What you can do:");
    console.log("   1. Check releases: https://github.com/donniedice/protondrive-tauri/releases");
    console.log("   2. Wait for builds to complete (GitHub Actions)");
    console.log("   3. Build from source: https://github.com/donniedice/protondrive-tauri#build-from-source\n");
    process.exit(1);
  }
}

install();
