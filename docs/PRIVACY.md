# Omniverse Privacy Policy

**Effective Date**: January 1, 2025
**Version**: 1.0.0

---

## Our Privacy Promise

**We never see your data.**

Omniverse is designed from the ground up to protect your privacy. Your data stays on your devices, encrypted with keys only you control.

---

## Data Collection

### What We Collect: Nothing (by default)

The core Omniverse application:
- Runs entirely on your device
- Stores all data locally with encryption
- Does not phone home
- Does not have analytics
- Does not track you

### Optional Cloud Sync ($9.99/mo)

If you choose to enable cloud sync:

| Data | Purpose | Encryption |
|------|---------|------------|
| Encrypted blobs | Multi-device sync | E2E (we can't read it) |
| Device metadata | Sync coordination | TLS |
| Subscription status | Billing | Standard |

**We never see the contents of your synced data.**

### AI Queries

When you send a query to external AI (Kimi K2, etc.):

| Data | Purpose | Sent To |
|------|---------|---------|
| Query text | AI response | AI provider (OpenRouter) |
| No user ID | Anonymity | - |
| No history | Privacy | - |

You can disable external AI and use local models only.

---

## Data Storage

### On Your Device

```
~/.omniverse/
├── omniverse.db     # Encrypted with your passphrase
├── conscience.db    # Encrypted audit log
└── models/          # ML models (not personal data)
```

**Encryption**: AES-256-CBC with PBKDF2 key derivation (256,000 iterations)

### On Our Servers (sync only)

- Encrypted blobs (we cannot read them)
- Sync timestamps
- Subscription status
- **Never**: Decrypted content, personal information

---

## Your Rights

### Export Your Data

```bash
omniverse export --all --output my-data.json
```

You can export everything, anytime.

### Delete Your Data

```bash
omniverse delete --all --confirm
```

Local data is deleted immediately. Sync data is deleted within 24 hours.

### Offline Mode

You can run Omniverse completely offline forever. No account needed.

---

## Third-Party Services

### AI Providers

We use OpenRouter to route AI queries:
- **Kimi K2** (primary): No data retention
- **Gemini Flash** (fallback): Google's privacy policy
- **Claude** (premium): Anthropic's privacy policy

You control which AI providers are enabled.

### Payment Processing

Stripe processes payments for sync subscriptions:
- We never see your full card number
- Stripe's privacy policy applies

### IPFS (optional)

Audit logs can be published to IPFS:
- Only anonymized metadata
- No personal information
- You control what is published

---

## Security Measures

### Technical Safeguards

- [ ] End-to-end encryption
- [ ] Zero-knowledge architecture
- [ ] No server-side decryption capability
- [ ] Regular security audits
- [ ] Reproducible builds
- [ ] Open source code

### Organizational Safeguards

- [ ] No employee can access user data
- [ ] No law enforcement backdoors
- [ ] Warrant canary: [canary.omniverse.ai]
- [ ] Annual transparency reports

---

## Children's Privacy

Omniverse is not designed for children under 13. We do not knowingly collect data from children.

---

## International Users

Omniverse operates globally:
- Data stays on your device (no jurisdiction issues)
- Sync servers in multiple regions
- You choose your sync region
- GDPR/CCPA compliant by design

---

## Changes to This Policy

We will notify users of material changes:
- 30 days advance notice
- Email notification (if subscribed)
- In-app notification
- Changelog published

---

## Contact

**Privacy Questions**: privacy@omniverse.ai
**Data Requests**: dpo@omniverse.ai
**Security Issues**: security@omniverse.ai (PGP: [KEY_ID])

---

## Summary

| Question | Answer |
|----------|--------|
| Do you sell my data? | No, never. |
| Can you read my data? | No, it's encrypted. |
| Do you track me? | No. |
| Can I use it offline? | Yes, forever. |
| Can I delete everything? | Yes, immediately. |
| Is the code open source? | Yes. |

---

*"Your data. Your device. Your sovereignty."*
