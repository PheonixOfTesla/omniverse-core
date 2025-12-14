# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Do NOT open public issues for security vulnerabilities.**

### Contact

Email: **security@omniverse.ai**

PGP Key Fingerprint: `XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX`

### What to Include

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

### Response Timeline

| Action | Timeframe |
|--------|-----------|
| Acknowledgment | 24 hours |
| Initial assessment | 72 hours |
| Status update | Weekly |
| Fix release | Depends on severity |

### Severity Levels

| Level | Response | Examples |
|-------|----------|----------|
| **Critical** | 24-48h fix | RCE, key compromise, data exposure |
| **High** | 1 week | Auth bypass, privilege escalation |
| **Medium** | 2 weeks | DoS, information disclosure |
| **Low** | Next release | Minor issues, hardening |

## Security Measures

### Cryptography

- **Encryption**: AES-256-CBC with PBKDF2 (256k iterations)
- **Signing**: Ed25519
- **Hashing**: SHA-256

### Key Management

- Genesis private key destroyed after initial signing
- Multisig required for key rotation
- Hardware security modules for production

### Build Security

- Reproducible builds (identical binary from source)
- All dependencies pinned
- `cargo audit` in CI pipeline
- Supply chain verification

### Runtime Security

- Genesis hash verification at startup
- Sandboxed execution environment
- No dynamic code loading
- Memory-safe Rust core

## Verification

Users can verify any release:

```bash
# Download binary
wget https://releases.omniverse.ai/v1.0.0/omniverse-linux-x64

# Verify hash
sha256sum omniverse-linux-x64
# Compare with: https://ipfs.io/ipfs/Qm...

# Verify signature
openssl dgst -sha256 -verify GENESIS_KEY.pub \
  -signature omniverse-linux-x64.sig \
  omniverse-linux-x64
```

## Bug Bounty

We offer bounties for responsibly disclosed vulnerabilities:

| Severity | Bounty |
|----------|--------|
| Critical | $5,000 - $10,000 |
| High | $1,000 - $5,000 |
| Medium | $500 - $1,000 |
| Low | $100 - $500 |

### Eligibility

- First reporter of the vulnerability
- Responsible disclosure followed
- Not a current/recent employee
- Not already known to us

### Out of Scope

- Social engineering
- Physical attacks
- DoS attacks
- Third-party services

## Warrant Canary

As of the last update of this document, Omniverse has:

- NOT received any National Security Letters
- NOT received any gag orders
- NOT been required to insert backdoors
- NOT had any government access to user data

Last updated: December 13, 2025

If this section is removed or not updated for 90 days, assume compromise.

## Contact

- Security issues: security@omniverse.ai
- General questions: support@omniverse.ai
- PGP key: https://omniverse.ai/.well-known/pgp-key.txt
