# OMNIVERSE DESKTOP BUILD
# ═══════════════════════════════════════════════════════════════

.PHONY: all dev build build-mac build-win build-linux clean install verify

# Default: build all platforms
all: build

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	cd src-tauri && cargo fetch

# Development mode (hot reload)
dev:
	@echo "Starting development server..."
	npm run dev

# Build for current platform
build:
	@echo "Building for current platform..."
	npm run build
	@echo ""
	@echo "✅ Build complete!"
	@echo "Output: src-tauri/target/release/bundle/"

# Build for macOS (Universal - Intel + Apple Silicon)
build-mac:
	@echo "Building for macOS (Universal)..."
	npm run build:mac
	@echo ""
	@echo "✅ macOS build complete!"
	@echo "Output:"
	@echo "  - src-tauri/target/release/bundle/macos/Omniverse.app"
	@echo "  - src-tauri/target/release/bundle/dmg/Omniverse.dmg"

# Build for Windows
build-win:
	@echo "Building for Windows..."
	npm run build:win
	@echo ""
	@echo "✅ Windows build complete!"
	@echo "Output:"
	@echo "  - src-tauri/target/release/bundle/msi/Omniverse_*.msi"

# Build for Linux
build-linux:
	@echo "Building for Linux..."
	npm run build:linux
	@echo ""
	@echo "✅ Linux build complete!"
	@echo "Output:"
	@echo "  - src-tauri/target/release/bundle/appimage/Omniverse_*.AppImage"
	@echo "  - src-tauri/target/release/bundle/deb/omniverse_*.deb"

# Build all platforms (run on each platform or use cross-compilation)
build-all: build-mac build-win build-linux

# Clean build artifacts
clean:
	@echo "Cleaning..."
	rm -rf src-tauri/target
	rm -rf node_modules
	@echo "✅ Clean complete"

# Verify build hash
verify:
	@echo "Verifying build..."
	@if [ -f "src-tauri/target/release/bundle/macos/Omniverse.app/Contents/MacOS/Omniverse" ]; then \
		echo "macOS binary hash:"; \
		shasum -a 256 src-tauri/target/release/bundle/macos/Omniverse.app/Contents/MacOS/Omniverse; \
	fi
	@if [ -f "src-tauri/target/release/omniverse-desktop.exe" ]; then \
		echo "Windows binary hash:"; \
		shasum -a 256 src-tauri/target/release/omniverse-desktop.exe; \
	fi
	@if [ -f "src-tauri/target/release/omniverse-desktop" ]; then \
		echo "Linux binary hash:"; \
		shasum -a 256 src-tauri/target/release/omniverse-desktop; \
	fi

# Sign macOS build (requires Developer ID)
sign-mac:
	@echo "Signing macOS build..."
	codesign --deep --force --verify --verbose \
		--sign "Developer ID Application: Omniverse Foundation" \
		src-tauri/target/release/bundle/macos/Omniverse.app
	@echo "✅ Signed"

# Notarize macOS build (requires Apple Developer account)
notarize-mac:
	@echo "Notarizing macOS build..."
	@echo "Note: Set APPLE_ID, APP_PASSWORD, and TEAM_ID environment variables"
	xcrun notarytool submit \
		src-tauri/target/release/bundle/dmg/Omniverse.dmg \
		--apple-id "$(APPLE_ID)" \
		--password "$(APP_PASSWORD)" \
		--team-id "$(TEAM_ID)" \
		--wait
	@echo "✅ Notarized"

# Create release package
release: build-all verify
	@echo "Creating release package..."
	mkdir -p dist
	cp src-tauri/target/release/bundle/dmg/*.dmg dist/ 2>/dev/null || true
	cp src-tauri/target/release/bundle/msi/*.msi dist/ 2>/dev/null || true
	cp src-tauri/target/release/bundle/appimage/*.AppImage dist/ 2>/dev/null || true
	cp src-tauri/target/release/bundle/deb/*.deb dist/ 2>/dev/null || true
	@echo ""
	@echo "Generating checksums..."
	cd dist && shasum -a 256 * > checksums.sha256
	@echo ""
	@echo "✅ Release package ready in dist/"
	@ls -la dist/

# Help
help:
	@echo "Omniverse Desktop Build System"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install      Install dependencies"
	@echo "  dev          Run in development mode"
	@echo "  build        Build for current platform"
	@echo "  build-mac    Build for macOS (Universal)"
	@echo "  build-win    Build for Windows"
	@echo "  build-linux  Build for Linux"
	@echo "  build-all    Build for all platforms"
	@echo "  clean        Remove build artifacts"
	@echo "  verify       Show build hashes"
	@echo "  sign-mac     Sign macOS build"
	@echo "  notarize-mac Notarize macOS build"
	@echo "  release      Create release package"
	@echo "  help         Show this help"
