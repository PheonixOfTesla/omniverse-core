/**
 * OMNIVERSE GENESIS VERIFIER (Cloud)
 *
 * Public endpoint for verifying release integrity
 * No authentication required - transparency is the point
 *
 * "Anyone can verify. Anytime."
 */

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
// KNOWN RELEASES
// ═══════════════════════════════════════════════════════════════

// In production, fetch from blockchain or signed manifest
const RELEASES = {
  '1.0.0': {
    version: '1.0.0',
    binaryHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sourceHash: 'a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a',
    lawHash: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
    ipfsCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    releaseDate: '2025-01-01',
    revoked: false,
    signature: 'base64-ed25519-signature-here'
  }
};

// Genesis public key (from GENESIS_KEY.pub)
const GENESIS_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY=
-----END PUBLIC KEY-----`;

// ═══════════════════════════════════════════════════════════════
// GENESIS VERIFIER
// ═══════════════════════════════════════════════════════════════

class GenesisVerifier {
  constructor() {
    this.releases = RELEASES;
    this.publicKey = GENESIS_PUBLIC_KEY;
  }

  isReady() {
    return true;
  }

  /**
   * Verify a release by hash
   * @param {string} hash - Binary hash to verify
   * @param {string} version - Optional: expected version
   */
  async verifyRelease(hash, version = null) {
    // Find release by hash
    let release = null;

    for (const [ver, rel] of Object.entries(this.releases)) {
      if (rel.binaryHash === hash) {
        release = { ...rel, version: ver };
        break;
      }
    }

    // If version specified, check that too
    if (version && this.releases[version]) {
      if (this.releases[version].binaryHash !== hash) {
        return {
          valid: false,
          error: 'Version mismatch',
          expectedHash: this.releases[version].binaryHash,
          providedHash: hash
        };
      }
      release = { ...this.releases[version], version };
    }

    if (!release) {
      return {
        valid: false,
        error: 'Unknown release',
        hash
      };
    }

    if (release.revoked) {
      return {
        valid: false,
        error: 'Release has been revoked',
        version: release.version,
        revokedAt: release.revokedAt,
        reason: release.revokeReason
      };
    }

    return {
      valid: true,
      version: release.version,
      releaseDate: release.releaseDate,
      lawHash: release.lawHash,
      ipfsCid: release.ipfsCid
    };
  }

  /**
   * Verify TABLE_OF_LAW hash
   * @param {string} hash - Hash of TABLE_OF_LAW.md content
   */
  async verifyLaw(hash) {
    // Get the current expected law hash
    const versions = Object.keys(this.releases).sort().reverse();
    const latestVersion = versions[0];
    const expectedHash = this.releases[latestVersion]?.lawHash;

    return {
      valid: hash === expectedHash,
      expectedHash,
      providedHash: hash,
      latestVersion
    };
  }

  /**
   * Get latest release info
   */
  async getLatestRelease() {
    const versions = Object.keys(this.releases).sort().reverse();
    const latestVersion = versions[0];

    if (!latestVersion) {
      return null;
    }

    return {
      version: latestVersion,
      ...this.releases[latestVersion]
    };
  }

  /**
   * Get all releases
   */
  async getAllReleases() {
    return Object.entries(this.releases).map(([version, release]) => ({
      version,
      ...release
    }));
  }

  /**
   * Verify signature (Ed25519)
   */
  async verifySignature(data, signature) {
    try {
      const verify = crypto.createVerify('ed25519');
      verify.update(data);
      const signatureBuffer = Buffer.from(signature, 'base64');
      return verify.verify(this.publicKey, signatureBuffer);
    } catch (error) {
      return false;
    }
  }

  /**
   * Hash content (SHA-256)
   */
  hashContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  GenesisVerifier,
  RELEASES
};
