# Omniverse Desktop

Native desktop application for Omniverse using Tauri.

## Platforms

| Platform | Output | Size |
|----------|--------|------|
| macOS | `.dmg`, `.app` | ~8 MB |
| Windows | `.msi`, `.exe` | ~6 MB |
| Linux | `.AppImage`, `.deb` | ~7 MB |

## Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node.js (18+)
# https://nodejs.org/

# Install Tauri CLI
cargo install tauri-cli

# macOS: Install Xcode Command Line Tools
xcode-select --install

# Linux: Install dependencies
sudo apt install libwebkit2gtk-4.0-dev build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

## Development

```bash
cd desktop

# Install dependencies
npm install

# Run in development mode
npm run dev

# Check Rust code
npm run check
```

## Building

### All Platforms

```bash
npm run build:all
```

### Individual Platforms

```bash
# macOS (Universal binary - Intel + Apple Silicon)
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

### Output Locations

```
desktop/src-tauri/target/release/bundle/
├── macos/
│   ├── Omniverse.app
│   └── Omniverse.dmg
├── msi/
│   └── Omniverse_1.0.0_x64.msi
├── deb/
│   └── omniverse_1.0.0_amd64.deb
└── appimage/
    └── Omniverse_1.0.0_amd64.AppImage
```

## Distribution

### macOS

1. Build: `npm run build:mac`
2. Sign with Developer ID (optional but recommended)
3. Notarize with Apple (required for Gatekeeper)
4. Distribute `.dmg`

```bash
# Sign
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: YOUR NAME" \
  src-tauri/target/release/bundle/macos/Omniverse.app

# Notarize
xcrun notarytool submit Omniverse.dmg \
  --apple-id YOUR_APPLE_ID \
  --password YOUR_APP_SPECIFIC_PASSWORD \
  --team-id YOUR_TEAM_ID
```

### Windows

1. Build: `npm run build:win`
2. Sign with code signing certificate (optional)
3. Distribute `.msi` or `.exe`

### Linux

1. Build: `npm run build:linux`
2. Distribute `.AppImage` (universal) or `.deb` (Debian/Ubuntu)

## Verification

Users can verify their download:

```bash
# Get hash of downloaded binary
sha256sum Omniverse.dmg

# Compare with published hash
curl https://releases.omniverse.ai/v1.0.0/checksums.sha256

# Should match!
```

## Architecture

```
desktop/
├── package.json           # Node.js config
├── src/
│   └── index.html         # Frontend UI
├── src-tauri/
│   ├── Cargo.toml         # Rust dependencies
│   ├── tauri.conf.json    # Tauri configuration
│   ├── build.rs           # Build script
│   └── src/
│       └── main.rs        # Tauri + Omniverse core
└── icons/                 # App icons
```

## Features

- **Offline-First**: Works without internet
- **Encrypted Storage**: All data encrypted with user passphrase
- **Small Binary**: < 10 MB (vs Electron's 150+ MB)
- **Native Performance**: Rust core, no JavaScript overhead
- **Cross-Platform**: Single codebase for all platforms
- **Auto-Update Ready**: Tauri updater can be enabled

## Security

- CSP enforced (no external scripts)
- File access scoped to app directories
- All data encrypted at rest
- Genesis hash verified at startup
