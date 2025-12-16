#!/bin/bash
set -euo pipefail

WEBCLIENTS_BUILD_TEMP_DIR="/home/joey/.gemini/tmp/webclients_build_temp"

# Clean up previous temporary build directory if it exists
rm -rf "$WEBCLIENTS_BUILD_TEMP_DIR"

# Implement retry logic for git clone due to network issues
MAX_CLONE_RETRIES=3
CLONE_RETRY_DELAY=15 # seconds

for i in $(seq 1 $MAX_CLONE_RETRIES); do
    echo "Attempt $i/$MAX_CLONE_RETRIES: Cloning WebClients monorepo into temporary directory..."
    if git clone --depth=1 https://github.com/ProtonMail/WebClients.git "$WEBCLIENTS_BUILD_TEMP_DIR"; then
        echo "Git clone successful!"
        break
    else
        echo "Git clone failed. Retrying in $CLONE_RETRY_DELAY seconds..."
        sleep $CLONE_RETRY_DELAY
    fi
done

# Check if git clone was ultimately successful
if [ ! -d "$WEBCLIENTS_BUILD_TEMP_DIR" ]; then
    echo "Git clone failed after $MAX_CLONE_RETRIES attempts. Aborting build."
    exit 1
fi

cd "$WEBCLIENTS_BUILD_TEMP_DIR"

# Python script to fix dependencies (removing 'rowsncolumns' related entries)
cat > fix_deps.py << 'EOF'
import json
from pathlib import Path

for pkg in Path('.').rglob('package.json'):
    if 'node_modules' in str(pkg) or '.yarn' in str(pkg):
        continue
    try:
        data = json.loads(pkg.read_text())
        modified = False
        for section in ('dependencies','devDependencies','peerDependencies','optionalDependencies'):
            if section in data:
                for k in list(data[section].keys()):
                    if 'rowsncolumns' in k.lower():
                        del data[section][k]
                        modified = True
        if modified:
            pkg.write_text(json.dumps(data, indent=2) + '\n')
    except Exception:
        # Ignore errors during parsing, some package.json might be malformed or non-standard
        pass
EOF

python3 fix_deps.py
rm -f fix_deps.py # Clean up the python script

# Remove yarn.lock (the empty one we just created, or any other that might have been there)
# and clear yarn cache for good measure, then let yarn install create a new one.
rm -f yarn.lock
rm -rf .yarn/cache

# Implement retry logic for yarn install due to network issues
MAX_INSTALL_RETRIES=5
INSTALL_RETRY_DELAY=10 # seconds

for i in $(seq 1 $MAX_INSTALL_RETRIES); do
    echo "Attempt $i/$MAX_INSTALL_RETRIES: Running yarn install..."
    if node .yarn/releases/yarn-4.12.0.cjs install; then
        echo "yarn install successful!"
        break
    else
        echo "yarn install failed. Retrying in $INSTALL_RETRY_DELAY seconds..."
        sleep $INSTALL_RETRY_DELAY
    fi
done

# Check if yarn install was ultimately successful
if [ $i -gt $MAX_INSTALL_RETRIES ]; then
    echo "yarn install failed after $MAX_INSTALL_RETRIES attempts. Aborting build."
    exit 1
fi

# Run build for the proton-drive workspace using the project's specific Yarn binary
node .yarn/releases/yarn-4.12.0.cjs workspace proton-drive build

# The built assets are now in "$WEBCLIENTS_BUILD_TEMP_DIR/applications/drive/build"
# Copy these to the location expected by tauri.conf.json
# First, ensure the target directory in the main project exists and is clean
cd - # Go back to the main project root
rm -rf WebClients/applications/drive/build
mkdir -p WebClients/applications/drive/build
cp -r "$WEBCLIENTS_BUILD_TEMP_DIR/applications/drive/build/." WebClients/applications/drive/build/

# Clean up the temporary build directory
echo "Cleaning up temporary build directory..."
rm -rf "$WEBCLIENTS_BUILD_TEMP_DIR"
