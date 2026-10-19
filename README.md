<p align="center">
  <img src="desktop/src-tauri/icons/icon.png" width="120" alt="Omniverse">
</p>

<h1 align="center">Omniverse</h1>

<p align="center">
  <strong>Sovereign AI that runs 100% offline. Your data never leaves your device.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#why-omniverse">Why Omniverse</a> •
  <a href="#architecture">Architecture</a> •
  <a href="TABLE_OF_LAW.md">Constitution</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/rust-1.70+-orange.svg" alt="Rust">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/offline-100%25-green" alt="Offline">
</p>

---

<!-- Add screenshot here: desktop/screenshots/demo.png -->
<!-- ![Omniverse Desktop](screenshots/demo.png) -->

## The Problem

Every AI assistant sends your data to the cloud. Your conversations, your business data, your personal information—all stored on someone else's servers.

**Omniverse is different.** It runs entirely on your machine using local LLMs (Ollama). Zero network calls. Zero data collection. Zero trust required.

---

## Quick Start

```bash
# 1. Install Ollama (local AI runtime)
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Pull a model
ollama pull llama3

# 3. Clone and build
git clone https://github.com/PheonixOfTesla/omniverse-core.git
cd omniverse-core/desktop
npm install && npm run tauri build

# 4. Run
./src-tauri/target/release/omniverse
```

**No API keys. No accounts. No cloud.**

---

## Features

### 🔒 Sovereign by Default
- **Local AI**: All inference runs through Ollama on your device
- **Encrypted Storage**: SQLCipher with AES-256 and 256k PBKDF2 iterations
- **No Telemetry**: Zero analytics, zero tracking, zero phone-home

### 📜 Cryptographic Audit Trail
- **Hash-Chained Ledger**: Every AI action is logged with SHA-256 linking
- **Ed25519 Signatures**: Tamper-evident audit trail you can verify
- **Genesis Verification**: Binary integrity checked at every startup

### 🖥️ Full Desktop App
- **Voice Interface**: Control everything by voice
- **Business Dashboard**: Revenue, clients, orders, invoices, inventory
- **Widget System**: Customizable workspace

### 📖 The Constitution
Omniverse is governed by the **[TABLE_OF_LAW](TABLE_OF_LAW.md)**—an immutable social contract embedded in every binary:

> *"Your data belongs to you."*
> *"No dark patterns. We do not manipulate."*
> *"No surveillance capitalism."*

Any violation triggers automatic shutdown and public logging.

---

## Why Omniverse?

| | Omniverse | ChatGPT | Claude | Copilot |
|---|:---:|:---:|:---:|:---:|
| Runs offline | ✅ | ❌ | ❌ | ❌ |
| Data stays local | ✅ | ❌ | ❌ | ❌ |
| No account required | ✅ | ❌ | ❌ | ❌ |
| Audit trail | ✅ | ❌ | ❌ | ❌ |
| Open source | ✅ | ❌ | ❌ | ❌ |
| Self-hostable | ✅ | ❌ | ❌ | ❌ |

---

## Architecture

```
omniverse-core/
├── core/                    # Rust backend
│   ├── src/
│   │   ├── crypto/          # Ed25519 signatures, verification
│   │   ├── ethics/          # Conscience ledger (hash-chained audit)
│   │   ├── storage/         # SQLCipher encrypted database
│   │   └── main.rs          # Genesis verification
│
├── desktop/                 # Tauri desktop app
│   ├── src/                 # UI (voice, dashboard, widgets)
│   └── src-tauri/
│       └── src/
│           └── ollama.rs    # Local AI client
│
├── TABLE_OF_LAW.md          # Immutable constitution
├── GENESIS_KEY.pub          # Ed25519 public key
└── LICENSE                  # MIT + TABLE_OF_LAW terms
```

---

## Verify Your Binary

Every release is signed. Verify before you trust:

```bash
# Extract embedded hash
./omniverse --print-genesis-hash

# Compare with TABLE_OF_LAW
sha256sum TABLE_OF_LAW.md

# They must match
```

---

## Tech Stack

- **Core**: Rust (tokio, rusqlite, SQLCipher)
- **Crypto**: Ed25519, SHA-256, PBKDF2
- **Desktop**: Tauri + HTML/CSS/JS
- **Local AI**: Ollama (llama3, mistral, etc.)
- **Cloud**: None (opt-in only via explicit consent)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

1. Fork the repo
2. Create a branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Open a PR

All contributions must honor the [TABLE_OF_LAW](TABLE_OF_LAW.md).

---

## License

MIT License with [TABLE_OF_LAW](TABLE_OF_LAW.md) covenant.

You can fork, modify, and distribute freely. But if you violate the constitution (data sovereignty, no dark patterns, no surveillance), your fork is excluded from the official ecosystem.

---

<p align="center">
  <strong>Your AI. Your device. No cloud required.</strong>
</p>

<p align="center">
  <a href="https://github.com/PheonixOfTesla/omniverse-core/stargazers">⭐ Star if you believe in sovereign AI</a>
</p>
