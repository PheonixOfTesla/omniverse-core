# TABLE OF LAW
## The Immutable Social Contract of Omniverse

**Version**: 1.0.0 (GENESIS)
**Hash**: Will be computed and burned into binary at build time
**Effective**: Upon first successful reproducible build

---

## PREAMBLE

This document constitutes the unchangeable foundation of Omniverse. Any modification to this file will cause the build to fail. The hash of this document is embedded in every binary and verified at startup.

---

## ARTICLE I: SOVEREIGNTY

1. **Your data belongs to you.** Omniverse never transmits data without explicit, per-action consent.
2. **Your keys are yours alone.** Encryption keys are derived from your passphrase. We cannot access them. We do not want to.
3. **Your exit is guaranteed.** Export all data in open formats (JSON, SQLite) within 90 seconds. No lock-in. Ever.

---

## ARTICLE II: TRANSPARENCY

1. **Reproducible builds.** Any person can compile this source and produce a byte-identical binary.
2. **Open source.** The core is MIT-licensed. Fork it. Audit it. Improve it.
3. **Cryptographic proof.** Every release is signed with GENESIS_KEY. Verify before you trust.

---

## ARTICLE III: ETHICS

1. **No dark patterns.** We do not manipulate. We do not addict. We optimize for your flourishing, not our metrics.
2. **No surveillance capitalism.** We do not sell your data. We do not profile you for advertisers. Revenue comes from optional services, not your soul.
3. **Violation = shutdown.** If Omniverse detects it is violating these laws, it will:
   - Log the violation publicly (IPFS)
   - Refuse to execute the violating action
   - Alert the user immediately

---

## ARTICLE IV: GOVERNANCE

1. **Stewardship, not ownership.** The Omniverse Foundation holds the code in trust for humanity.
2. **Amendment requires consensus.** Changes to this document require:
   - 90-day public comment period
   - 2/3 multi-signature approval from stewards
   - New genesis build with updated hash
3. **Forks are welcome.** Disagree? Fork the code. The license permits it. Competition strengthens the ecosystem.

---

## ARTICLE V: CONTINUITY

1. **Omniverse survives us.** If the founding organization ceases to exist:
   - The code remains open-source
   - The IPFS audit trail persists
   - Community stewards continue signing updates
2. **No kill switch.** There is no remote disable. Your local binary runs until you delete it.
3. **Offline forever.** Core functionality requires zero network. Cloud is convenience, not dependency.

---

## SIGNATURES

This document is signed by the genesis key at build time.

```
GENESIS_KEY_SIGNATURE: [COMPUTED_AT_BUILD]
DOCUMENT_HASH: [SHA256_COMPUTED_AT_BUILD]
BUILD_TIMESTAMP: [ISO8601_AT_BUILD]
```

---

## VERIFICATION

To verify this document matches your binary:

```bash
# Extract embedded hash from binary
./omniverse --print-genesis-hash

# Compute hash of this file
sha256sum TABLE_OF_LAW.md

# They must match. If not, your binary is compromised.
```

---

*"A god you can audit is a god you can trust."*
