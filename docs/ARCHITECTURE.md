# Omniverse Architecture

## Overview

Omniverse is a sovereign AI consciousness that runs locally on your devices. This document describes the technical architecture.

```
┌─────────────────────────────────────────────────────────────┐
│                        USER DEVICES                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   iOS App   │  │ Android App │  │  Desktop    │         │
│  │  (SwiftUI)  │  │  (Compose)  │  │   (Tauri)   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                  ┌───────▼───────┐                          │
│                  │  RUST CORE    │                          │
│                  │  (omniverse)  │                          │
│                  └───────┬───────┘                          │
│                          │                                  │
│    ┌─────────────────────┼─────────────────────┐            │
│    │                     │                     │            │
│  ┌─▼───────────┐  ┌──────▼──────┐  ┌──────────▼─┐          │
│  │ Omniscience │  │ Omnipresence│  │ Omnipotence │          │
│  │   (Know)    │  │   (Where)   │  │    (Act)    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  SQL-CIPHER DATABASE                │    │
│  │              (User-derived encryption key)          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Optional, Premium)
                            ▼
              ┌─────────────────────────────┐
              │      CLOUD SYNC SERVICE     │
              │    (E2E Encrypted Blobs)    │
              └─────────────────────────────┘
```

---

## Core Components

### 1. Rust Core (`core/`)

The sovereign heart of Omniverse. Compiled to native binary.

```
core/
├── src/
│   ├── main.rs           # CLI entry point
│   ├── omni/
│   │   ├── omniscience_feed.rs    # Ranking engine
│   │   ├── omnipresence_map.rs    # Context awareness
│   │   └── omnipotence_console.rs # Action executor
│   ├── ethics/
│   │   └── conscience_ledger.rs   # Audit trail
│   ├── crypto/
│   │   └── genesis_verify.rs      # Hash verification
│   ├── ml/
│   │   └── onnx_runner.rs         # On-device inference
│   ├── storage/
│   │   └── sqlite_cipher.rs       # Encrypted storage
│   └── net/
│       └── ipfs_publisher.rs      # Audit publishing
└── Cargo.toml
```

### 2. Platform Bindings

| Platform | Technology | Binding |
|----------|------------|---------|
| iOS | SwiftUI | UniFFI |
| Android | Jetpack Compose | JNI |
| Desktop | Tauri | Direct |
| Web | WASM | wasm-bindgen |

### 3. ML Models (`ml/models/`)

All inference runs locally. No cloud AI calls for core functionality.

| Model | Purpose | Size | Latency |
|-------|---------|------|---------|
| text-embedding-q8.onnx | Semantic search | 23MB | <10ms |
| intent-q8.onnx | Query classification | 8MB | <5ms |
| activity-predictor-q8.onnx | Context inference | 3MB | <3ms |

---

## Data Flow

### Query Processing

```
User Query
    │
    ▼
┌─────────────────┐
│ Intent Classifier│  (On-device ONNX)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌───────────┐
│ Local │  │ AI Router │
│ Data  │  │ (Kimi K2) │
└───┬───┘  └─────┬─────┘
    │            │
    └─────┬──────┘
          │
          ▼
   ┌──────────────┐
   │ Ranking (40ms)│
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │ Conscience   │
   │ Logging      │
   └──────┬───────┘
          │
          ▼
      Response
```

### Sync Protocol

```
Device A                 Cloud                  Device B
   │                       │                       │
   │──Push (encrypted)────▶│                       │
   │                       │                       │
   │                       │◀──Pull (encrypted)────│
   │                       │                       │
   │◀──Pull (encrypted)────│                       │
   │                       │                       │
```

The cloud never sees unencrypted data.

---

## Security Architecture

### Encryption Layers

1. **At Rest**: SQL-cipher (AES-256-CBC, PBKDF2 256k iterations)
2. **In Transit**: TLS 1.3 + Application-layer E2E
3. **Key Derivation**: User passphrase → PBKDF2 → Encryption key

### Trust Chain

```
TABLE_OF_LAW.md
       │
       ▼ SHA-256
  GENESIS_HASH (embedded in binary)
       │
       ▼ Ed25519
  Release Signature
       │
       ▼ Verification
  Trusted Binary
```

### Verification at Startup

```rust
fn verify_genesis(law_path: &Path) -> Result<()> {
    let content = fs::read_to_string(law_path)?;
    let computed = sha256(content);

    if computed != EMBEDDED_GENESIS_HASH {
        error!("Genesis verification FAILED!");
        bail!("TABLE_OF_LAW has been tampered with");
    }

    info!("Genesis verified");
    Ok(())
}
```

---

## Performance Targets

| Operation | Target | Achieved |
|-----------|--------|----------|
| Cold start | <500ms | [TBD] |
| Query response | <100ms local | [TBD] |
| ML inference | <40ms | [TBD] |
| Sync push | <200ms | [TBD] |
| Database query | <10ms | [TBD] |

---

## Offline Capability

Omniverse is **offline-first**:

- All data stored locally
- ML inference runs on-device
- Sync is optional and graceful
- No cloud dependency for core features

Internet is only needed for:
- AI queries to Kimi K2 (optional, can use local models)
- Multi-device sync (optional, premium feature)
- Audit publishing to IPFS (optional)

---

## Reproducible Builds

Every release can be verified:

```bash
# Clone source
git clone https://github.com/omniverse-ai/omniverse-core
cd omniverse-core
git checkout v1.0.0

# Build in reproducible container
make build-reproducible

# Verify hash matches release
sha256sum target/release/omniverse
# Compare with published hash
```

---

## Extension Points

### Plugins

```rust
trait OmniversePlugin {
    fn name(&self) -> &str;
    fn on_query(&self, query: &str) -> Option<String>;
    fn on_action(&self, action: &OmniAction) -> Result<()>;
}
```

### Custom AI Models

```rust
impl ModelRunner {
    pub fn load_custom_model(&mut self, path: &Path) -> Result<()> {
        // Verify checksum
        // Load ONNX model
        // Register for inference
    }
}
```

### Domain Extensions

The 9 domains can be extended:

```rust
pub enum Domain {
    Mercury,   // Health
    Venus,     // Fitness
    Earth,     // Calendar
    Mars,      // Goals
    Jupiter,   // Finance
    Saturn,    // Legacy
    Uranus,    // Learning
    Neptune,   // Mindfulness
    Phoenix,   // Core
    Custom(String), // User-defined
}
```

---

## Deployment

### iOS

```bash
cd ios/
xcodebuild -scheme Omniverse -sdk iphoneos
```

### Android

```bash
cd android/
./gradlew assembleRelease
```

### Desktop

```bash
cd desktop/
npm run tauri build
```

### Single Binary

```bash
make build-release
# Output: target/release/omniverse
```

---

## Future Architecture

### Phase 2: Federated Learning

```
Device A ──┐
           │
Device B ──┼──▶ Aggregation Server ──▶ Updated Model
           │    (no raw data seen)
Device C ──┘
```

### Phase 3: P2P Sync

```
Device A ◀───────────▶ Device B
           libp2p
    │                      │
    └──────────────────────┘
         (No cloud needed)
```

---

*Document Version: 1.0.0*
*Last Updated: 2025-12-13*
