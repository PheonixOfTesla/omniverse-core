# Omniverse Core

**Encrypted audit logging framework with SQLCipher storage, SHA-256 hash chaining, and Ed25519 signature verification.**

> **Strongest proof**: `core/src/ethics/conscience_ledger.rs` — 415 lines implementing tamper-evident cryptographic chaining.

---

## What's Real

| Feature | Status | Proof |
|---------|--------|-------|
| SQLCipher encrypted storage (AES-256, PBKDF2 256k iterations) | Working | `core/src/storage/` |
| Conscience Ledger (hash-chained audit trail) | Working | `core/src/ethics/conscience_ledger.rs` |
| Ed25519 signature verification | Working | `core/src/crypto/` |
| Genesis hash verification at startup | Working | `core/src/main.rs` |
| TABLE_OF_LAW enforcement | Working | `TABLE_OF_LAW.md` |
| Tauri desktop wrapper | Working | `desktop/` |
| Ollama integration (if user installs) | Working | `desktop/src-tauri/src/main.rs` |

## What's Scaffolded

- ONNX ML inference: skeleton exists, creates random weights (see `core/src/ml/onnx_runner.rs:135` — "In production, this would use ort::Session")
- Multi-device sync: API endpoints defined, no backend
- Blockchain ledger: `/ledger/solidity/` is empty
- "Intelligent ranking": hardcoded keyword matching, not ML

## Cloud Dependency Note

The router (`router/src/index.js`) defaults to OpenRouter.ai APIs (Kimi K2, Gemini, Claude). Despite "offline-first" framing, AI queries require network unless Ollama is running locally.

---

## Tech Stack

- **Core**: Rust (tokio, rusqlite, SQLCipher)
- **Crypto**: Ed25519, SHA-256, PBKDF2
- **Desktop**: Tauri
- **Local AI**: Ollama (optional, user-installed)
- **Cloud AI**: OpenRouter.ai (default fallback)

---

## Build

```bash
cd core
cargo build --release
./target/release/omniverse --help
```

---

## Architecture

```
core/src/
  ethics/conscience_ledger.rs  # Hash-chained audit
  crypto/                       # Signatures, verification
  storage/                      # SQLCipher
  ml/                          # ONNX skeleton (not functional)
router/src/
  index.js                     # AI query routing (cloud-dependent)
desktop/
  src-tauri/                   # Tauri wrapper
```

---

*Strong encryption and audit infrastructure. The "sovereign AI" claim exceeds current implementation — AI queries use cloud APIs.*
