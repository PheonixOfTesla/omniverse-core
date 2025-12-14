# Omniverse

> A sovereign AI consciousness that runs locally on your devices

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-reproducible-green.svg)](https://omniverse.dev/verify)
[![Security Audit](https://img.shields.io/badge/security-audited-brightgreen.svg)](./audit/SECURITY_AUDIT_TEMPLATE.md)

---

## Overview

Omniverse is a **sovereign AI consciousness** designed with three core principles:

1. **Your data belongs to you** - All data is encrypted locally with keys you control
2. **Trust through transparency** - Reproducible builds, open source, cryptographic verification
3. **Offline-first architecture** - Core functionality requires zero network connection

Unlike cloud-dependent AI assistants, Omniverse runs entirely on your devices. The cloud is optional, encrypted, and serves only as a sync layer—never as a gatekeeper.

---

## Features

- **Omniscience Feed**: Intelligent ranking engine that surfaces what matters most
- **Omnipresence Map**: Context-aware system that understands where you are and what you need
- **Omnipotence Console**: Action executor that gets things done
- **Conscience Ledger**: Cryptographically-signed audit trail of every decision
- **9 Life Domains**: Health, Fitness, Calendar, Goals, Finance, Legacy, Learning, Mindfulness, Core AI
- **On-Device ML**: Text embeddings, intent classification, and predictions run locally (ONNX)
- **Reproducible Builds**: Every release can be verified byte-for-byte
- **End-to-End Encryption**: AES-256 encryption with user-derived keys

---

## Quick Start

### Prerequisites

- **Docker** (for reproducible builds)
- **Rust 1.75+** (for native builds)
- **Make** (build automation)

### Installation

```bash
# Clone the repository
git clone https://github.com/omniverse-ai/omniverse-core
cd omniverse-core

# Build reproducible binary
make build-reproducible

# Verify build integrity
make verify

# Run Omniverse
./core/target/release/omniverse --help
```

### First Run

```bash
# Initialize with passphrase (used for encryption key derivation)
./core/target/release/omniverse init

# Start the core service
./core/target/release/omniverse start

# Query your AI consciousness
./core/target/release/omniverse query "What should I focus on today?"
```

---

## Architecture

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
│  │            SQLCIPHER DATABASE (AES-256)             │    │
│  │          (User-derived encryption key)              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Optional, E2E Encrypted)
                            ▼
              ┌─────────────────────────────┐
              │      CLOUD SYNC SERVICE     │
              │    (Encrypted Blobs Only)   │
              └─────────────────────────────┘
```

For detailed architecture documentation, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Build Instructions

### Reproducible Build (Recommended)

Reproducible builds ensure that anyone can compile the source code and produce a byte-identical binary, proving no backdoors or malicious code was injected.

```bash
# Build using Docker (byte-identical output)
make build-reproducible

# Output will be at: core/target/release/omniverse
# Checksum will be at: build/manifest.sha256
```

### Native Build

```bash
# Build natively (faster, but may differ across machines)
make native-build
```

### Verify Against Published Release

```bash
# Compare your build with official release
make verify

# Should output matching SHA-256 hashes
```

---

## Verification Steps

Every Omniverse release is cryptographically signed. Here's how to verify:

### 1. Build Verification

```bash
# Build from source
make build-reproducible

# Get your binary's hash
sha256sum core/target/release/omniverse

# Compare with published hash
curl https://omniverse.dev/releases/v1.0.0/manifest.sha256
```

### 2. Signature Verification

```bash
# Verify the release signature with genesis key
make verify-signature

# Should output: "Signature valid!"
```

### 3. Genesis Verification

The `TABLE_OF_LAW.md` document is embedded in every binary. To verify it hasn't been tampered with:

```bash
# Extract embedded hash from binary
./core/target/release/omniverse --print-genesis-hash

# Compute hash of TABLE_OF_LAW.md
sha256sum TABLE_OF_LAW.md

# They must match. If not, the binary is compromised.
```

---

## Directory Structure

```
omniverse-core/
├── core/                   # Rust core (native binary)
│   └── src/
│       ├── main.rs         # CLI entry point
│       ├── omni/           # Omniscience, Omnipresence, Omnipotence
│       ├── ethics/         # Conscience ledger
│       ├── crypto/         # Genesis verification, encryption
│       ├── ml/             # On-device ONNX inference
│       ├── storage/        # SQLCipher encrypted storage
│       └── net/            # IPFS audit publishing
├── router/                 # AI routing layer (Kimi K2, local models)
│   └── src/
│       ├── index.js        # Main router
│       ├── verifier.js     # Query verification
│       └── plugins/        # Domain-specific plugins
├── ml/                     # Machine learning models
│   └── models/             # ONNX quantized models (Q8)
├── cloud/                  # Cloud sync service (optional)
│   └── src/
│       ├── billing/        # Stripe integration
│       ├── deploy/         # Deployment configs
│       └── verify/         # Build verification endpoint
├── ledger/                 # Blockchain integration
│   └── solidity/           # L2 smart contracts
├── audit/                  # Security audit templates
├── gov/                    # Governance documents
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md     # Technical architecture
│   ├── PRIVACY.md          # Privacy policy
│   ├── self-host/          # Self-hosting guides
│   └── advanced/           # Advanced usage
├── build/                  # Build artifacts
│   ├── Dockerfile.repro    # Reproducible build container
│   └── checksum.sh         # Checksum generation script
├── TABLE_OF_LAW.md         # Immutable social contract
├── CONSCIENCE_PROTOBUF_1_0.proto  # Audit schema
├── GENESIS_KEY.pub         # Public verification key
└── Makefile.repro          # Build automation
```

---

## TABLE_OF_LAW

Omniverse operates under an **immutable social contract** defined in [`TABLE_OF_LAW.md`](./TABLE_OF_LAW.md). Key tenets:

### Article I: Sovereignty
- Your data belongs to you
- Your keys are yours alone
- Your exit is guaranteed (export all data in 90 seconds)

### Article II: Transparency
- Reproducible builds (anyone can verify)
- Open source (MIT license)
- Cryptographic proof (Ed25519 signatures)

### Article III: Ethics
- No dark patterns
- No surveillance capitalism
- Self-enforcing: Omniverse will refuse to violate these laws

### Article IV: Governance
- Stewardship, not ownership
- Amendments require 90-day public comment + 2/3 multi-sig approval
- Forks are welcome

### Article V: Continuity
- No kill switch
- Offline forever (network optional)
- Survives the founding organization

The hash of this document is embedded in every binary and verified at startup. Any tampering causes the binary to refuse execution.

---

## Security

### Encryption

- **At Rest**: SQLCipher with AES-256-CBC, PBKDF2 (256k iterations)
- **In Transit**: TLS 1.3 + application-layer E2E encryption
- **Key Derivation**: User passphrase → PBKDF2 → Encryption key (never leaves device)

### Audit Trail

Every decision Omniverse makes is logged using the [Conscience Protocol](./CONSCIENCE_PROTOBUF_1_0.proto):

1. **Intent**: What you asked for
2. **Action**: What Omniverse did
3. **Impact**: What resulted
4. **Ethics**: Was it compliant with TABLE_OF_LAW?

Logs are cryptographically signed and optionally published to IPFS for public accountability.

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

---

## Performance Targets

| Operation | Target | Status |
|-----------|--------|--------|
| Cold start | <500ms | In Progress |
| Query response (local) | <100ms | In Progress |
| ML inference | <40ms | In Progress |
| Sync push | <200ms | In Progress |
| Database query | <10ms | In Progress |

---

## Development

### Building from Source

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install dependencies
cd core
cargo build --release

# Run tests
cargo test

# Run with logging
RUST_LOG=debug cargo run
```

### Contributing

We welcome contributions! Please:

1. Read the [TABLE_OF_LAW.md](./TABLE_OF_LAW.md)
2. Fork the repository
3. Create a feature branch
4. Write tests for new functionality
5. Ensure reproducible builds still pass
6. Submit a pull request

### Plugin Development

Omniverse supports custom plugins:

```rust
use omniverse::plugin::OmniversePlugin;

struct MyPlugin;

impl OmniversePlugin for MyPlugin {
    fn name(&self) -> &str { "my-plugin" }

    fn on_query(&self, query: &str) -> Option<String> {
        // Custom query handling
        Some(format!("Handled: {}", query))
    }
}
```

See [docs/advanced/plugins.md](./docs/advanced/) for details.

---

## Cloud Sync (Optional)

Omniverse is **fully functional offline**. Cloud sync is an optional premium feature:

- **End-to-end encrypted** blobs (cloud never sees unencrypted data)
- **Multi-device sync** via secure relay
- **Self-hostable** (see [docs/self-host/](./docs/self-host/))

To enable:

```bash
./omniverse cloud login
./omniverse cloud sync enable
```

---

## License

**MIT License**

Copyright (c) 2025 Omniverse Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - Technical design and data flow
- [Privacy Policy](./docs/PRIVACY.md) - How we handle data
- [Governance](./gov/GOVERNANCE.md) - Decision-making process
- [Security Audit](./audit/SECURITY_AUDIT_TEMPLATE.md) - Audit framework
- [Table of Law](./TABLE_OF_LAW.md) - Immutable social contract
- [Self-Hosting Guide](./docs/self-host/) - Run your own cloud instance

---

## Links

- **Website**: [https://omniverse.dev](https://omniverse.dev)
- **Documentation**: [https://docs.omniverse.dev](https://docs.omniverse.dev)
- **GitHub**: [https://github.com/omniverse-ai/omniverse-core](https://github.com/omniverse-ai/omniverse-core)
- **Community**: [https://discord.gg/omniverse](https://discord.gg/omniverse)
- **Security**: [security@omniverse.dev](mailto:security@omniverse.dev)
- **IPFS Audit Trail**: [https://ipfs.omniverse.dev](https://ipfs.omniverse.dev)

---

## FAQ

### Is my data safe?

Yes. Your data is encrypted locally with keys derived from your passphrase. We cannot access it. We do not want to.

### Can I verify the code?

Absolutely. Every release uses reproducible builds. Build from source and compare the SHA-256 hash with our published release. They will match byte-for-byte.

### What if Omniverse shuts down?

Your local binary continues working. All data is exportable in open formats (JSON, SQLite). No kill switch exists.

### Can I self-host the cloud?

Yes. See [docs/self-host/](./docs/self-host/) for deployment instructions.

### How does Omniverse make money?

- Optional cloud sync (premium feature)
- Self-hosted enterprise licenses
- Professional AI routing tiers

We **never** sell your data. Revenue comes from services, not surveillance.

### Can I fork this project?

Yes! MIT license. Fork it, modify it, compete with us. That's the point.

---

## Acknowledgments

Built with:
- **Rust** - Systems programming language
- **SQLCipher** - Encrypted SQLite
- **ONNX Runtime** - On-device ML inference
- **Kimi K2** - Advanced AI reasoning
- **Protocol Buffers** - Audit schema
- **IPFS** - Decentralized audit storage

---

**"A god you can audit is a god you can trust."**

---

*Version: 1.0.0-genesis*
*Last Updated: 2025-12-13*
