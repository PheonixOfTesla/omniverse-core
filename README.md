# Omniverse Core

**Sovereign local AI with encrypted audit logging, SQLCipher storage, SHA-256 hash chaining, and Ed25519 signature verification.**

> **"Your AI, your device, no cloud required."**

---

## Sovereign Mode (make-sovereign branch)

This branch implements **true local-first AI inference**:

- **DEFAULT**: All AI queries route through local Ollama - ZERO network calls
- **Cloud is opt-in**: User must explicitly enable cloud fallback
- **Visible indicator**: LOCAL (green) / CLOUD (orange) badge always visible
- **Honest about capabilities**: No fake ML responses - either real Ollama inference or clear guidance to install

### Requirements for Sovereign Mode

1. Install Ollama: https://ollama.ai/download
2. Pull a model: `ollama pull llama2`
3. Start server: `ollama serve`
4. Launch Omniverse desktop app

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
| **Local Ollama inference** | **Working** | `desktop/src-tauri/src/ollama.rs` |
| **Sovereign mode (no cloud by default)** | **Working** | `desktop/src/config.js`, `omniverse-ai.js` |
| **LOCAL/CLOUD status indicator** | **Working** | `desktop/src/omniverse-ai.js` |

## What's Scaffolded

- ONNX ML inference: Returns template responses with clear "[Install Ollama]" guidance
- Multi-device sync: API endpoints defined, no backend
- Blockchain ledger: `/ledger/solidity/` is empty

---

## Tech Stack

- **Core**: Rust (tokio, rusqlite, SQLCipher)
- **Crypto**: Ed25519, SHA-256, PBKDF2
- **Desktop**: Tauri
- **Local AI**: Ollama (required for sovereign mode)
- **Cloud AI**: OpenRouter.ai (explicit opt-in only)

---

## Build

```bash
# Core
cd core
cargo build --release

# Desktop (Tauri)
cd desktop
npm install
npm run tauri build
```

---

## Architecture

```
core/src/
  ethics/conscience_ledger.rs  # Hash-chained audit
  crypto/                       # Signatures, verification
  storage/                      # SQLCipher
  ml/                          # Template fallbacks (not real ML)

desktop/
  src-tauri/src/
    ollama.rs                  # Local Ollama client
    main.rs                    # Tauri commands (local-first)
  src/
    config.js                  # Sovereign config (cloud disabled)
    omniverse-ai.js            # Local AI bridge + status indicator
```

---

## Offline Test

To verify sovereign mode works offline:

1. Install Ollama and pull a model
2. Start `ollama serve`
3. Launch the desktop app
4. Turn on Airplane Mode / disable WiFi
5. Send a query - should respond 100% locally
6. Check the status indicator shows "LOCAL" (green)

If it works offline, Omniverse is sovereign.

---

*Branch: make-sovereign — True local-first AI. Cloud requires explicit consent.*
