#!/bin/bash
# =============================================================================
# OMNIVERSE CHECKSUM GENERATOR
# Outputs deterministic SHA-256 of all build inputs and final artifact
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "OMNIVERSE REPRODUCIBLE BUILD CHECKSUM"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to compute and display hash
hash_file() {
    local file=$1
    local label=$2
    if [[ -f "$file" ]]; then
        local hash=$(sha256sum "$file" | cut -d' ' -f1)
        echo -e "${GREEN}[OK]${NC} $label"
        echo "     $hash"
        echo "$hash  $file" >> "$ROOT_DIR/build/checksums.txt"
    else
        echo -e "${RED}[MISSING]${NC} $label: $file"
        exit 1
    fi
}

# Clear previous checksums
rm -f "$ROOT_DIR/build/checksums.txt"

echo "--- ROOT TRUST ARTIFACTS ---"
hash_file "$ROOT_DIR/TABLE_OF_LAW.md" "TABLE_OF_LAW.md (Social Contract)"
hash_file "$ROOT_DIR/GENESIS_KEY.pub" "GENESIS_KEY.pub (Public Key)"
hash_file "$ROOT_DIR/CONSCIENCE_PROTOBUF_1_0.proto" "CONSCIENCE_PROTOBUF_1_0.proto (Schema)"

echo ""
echo "--- BUILD CONFIGURATION ---"
hash_file "$ROOT_DIR/build/Dockerfile.repro" "Dockerfile.repro"
hash_file "$ROOT_DIR/build/repro-manifest.json" "repro-manifest.json"
hash_file "$ROOT_DIR/core/Cargo.toml" "Cargo.toml"
hash_file "$ROOT_DIR/core/Cargo.lock" "Cargo.lock"

echo ""
echo "--- RUST SOURCE FILES ---"
for file in $(find "$ROOT_DIR/core/src" -name "*.rs" | sort); do
    hash_file "$file" "$(basename $file)"
done

echo ""
echo "--- ML MODEL CHECKSUMS ---"
if [[ -f "$ROOT_DIR/ml/checksums.sha256" ]]; then
    hash_file "$ROOT_DIR/ml/checksums.sha256" "ml/checksums.sha256"
else
    echo -e "${YELLOW}[WARN]${NC} ML checksums not yet generated"
fi

echo ""
echo "--- FINAL ARTIFACT ---"
BINARY_PATH="$ROOT_DIR/core/target/release/omniverse"
if [[ -f "$BINARY_PATH" ]]; then
    hash_file "$BINARY_PATH" "omniverse (Final Binary)"

    # Compute combined manifest hash
    MANIFEST_HASH=$(sha256sum "$ROOT_DIR/build/checksums.txt" | cut -d' ' -f1)
    echo ""
    echo "=============================================="
    echo -e "${GREEN}MANIFEST HASH (verify this against release):${NC}"
    echo "$MANIFEST_HASH"
    echo "=============================================="

    # Write manifest hash to file
    echo "$MANIFEST_HASH" > "$ROOT_DIR/build/manifest.sha256"

else
    echo -e "${YELLOW}[WARN]${NC} Binary not yet built. Run 'make build-reproducible' first."
fi

echo ""
echo "--- VERIFICATION INSTRUCTIONS ---"
echo "1. Build on your machine: make build-reproducible"
echo "2. Run this script: ./build/checksum.sh"
echo "3. Compare MANIFEST HASH with published value"
echo "4. If they match, binary is authentic"
echo ""

# Exit with success
exit 0
