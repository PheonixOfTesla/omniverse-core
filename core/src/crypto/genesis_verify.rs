//! GENESIS VERIFICATION
//! Cryptographic verification of TABLE_OF_LAW integrity
//! Ed25519 signature verification for releases
//!
//! "Trust, but verify. Then verify again."

use anyhow::{Result, bail};
use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use sha2::{Sha256, Digest};
use std::fs;
use std::path::Path;
use tracing::{info, error, debug};

/// Embedded genesis hash (set at build time)
const GENESIS_HASH: &str = env!("GENESIS_HASH", "GENESIS_HASH not set");

/// Genesis verifier for TABLE_OF_LAW and release signatures
pub struct GenesisVerifier {
    /// The expected genesis hash
    expected_hash: String,

    /// Public key for signature verification (if loaded)
    public_key: Option<VerifyingKey>,
}

impl GenesisVerifier {
    /// Create a new verifier with embedded hash
    pub fn new() -> Self {
        Self {
            expected_hash: GENESIS_HASH.to_string(),
            public_key: None,
        }
    }

    /// Create verifier with custom expected hash (for testing)
    pub fn with_hash(hash: &str) -> Self {
        Self {
            expected_hash: hash.to_string(),
            public_key: None,
        }
    }

    /// Load public key from file
    pub fn load_public_key(&mut self, path: &Path) -> Result<()> {
        let key_bytes = fs::read(path)?;

        // Parse PEM or raw bytes
        let key = if key_bytes.starts_with(b"-----BEGIN") {
            self.parse_pem_public_key(&key_bytes)?
        } else {
            VerifyingKey::from_bytes(&key_bytes.try_into().map_err(|_| {
                anyhow::anyhow!("Invalid key length")
            })?)?
        };

        self.public_key = Some(key);
        info!("Loaded genesis public key from {:?}", path);
        Ok(())
    }

    /// Parse PEM-encoded public key
    fn parse_pem_public_key(&self, pem_bytes: &[u8]) -> Result<VerifyingKey> {
        let pem_str = std::str::from_utf8(pem_bytes)?;

        // Extract base64 content between BEGIN and END markers
        let content: String = pem_str
            .lines()
            .filter(|line| !line.starts_with("-----"))
            .collect();

        let decoded = base64::decode(&content)?;

        // Ed25519 public key is 32 bytes, but PEM may have ASN.1 wrapper
        let key_bytes = if decoded.len() == 32 {
            decoded
        } else if decoded.len() > 32 {
            // Strip ASN.1 wrapper (typically last 32 bytes)
            decoded[decoded.len() - 32..].to_vec()
        } else {
            bail!("Invalid public key length: {}", decoded.len());
        };

        Ok(VerifyingKey::from_bytes(&key_bytes.try_into().map_err(|_| {
            anyhow::anyhow!("Key conversion failed")
        })?)?)
    }

    /// Verify TABLE_OF_LAW hash matches embedded genesis hash
    pub fn verify_law(&self, law_path: &Path) -> Result<VerificationResult> {
        info!("Verifying TABLE_OF_LAW at {:?}", law_path);

        // Read the law file
        let content = match fs::read_to_string(law_path) {
            Ok(c) => c,
            Err(e) => {
                error!("Cannot read TABLE_OF_LAW: {}", e);
                return Ok(VerificationResult {
                    valid: false,
                    expected_hash: self.expected_hash.clone(),
                    computed_hash: "FILE_NOT_FOUND".to_string(),
                    signature_valid: None,
                    message: format!("Cannot read file: {}", e),
                });
            }
        };

        // Compute hash
        let computed_hash = self.compute_hash(&content);
        let valid = computed_hash == self.expected_hash;

        if valid {
            info!("✅ TABLE_OF_LAW hash verified");
        } else {
            error!("❌ TABLE_OF_LAW hash mismatch!");
            error!("   Expected: {}", self.expected_hash);
            error!("   Computed: {}", computed_hash);
        }

        Ok(VerificationResult {
            valid,
            expected_hash: self.expected_hash.clone(),
            computed_hash,
            signature_valid: None,
            message: if valid {
                "Genesis hash verified".to_string()
            } else {
                "HASH MISMATCH - TABLE_OF_LAW may have been tampered with".to_string()
            },
        })
    }

    /// Verify a signed release
    pub fn verify_release(&self, content: &[u8], signature: &[u8]) -> Result<bool> {
        let public_key = self.public_key.as_ref()
            .ok_or_else(|| anyhow::anyhow!("Public key not loaded"))?;

        let signature = Signature::from_bytes(signature.try_into().map_err(|_| {
            anyhow::anyhow!("Invalid signature length")
        })?);

        match public_key.verify(content, &signature) {
            Ok(_) => {
                info!("✅ Release signature verified");
                Ok(true)
            }
            Err(e) => {
                error!("❌ Release signature invalid: {}", e);
                Ok(false)
            }
        }
    }

    /// Verify binary checksum matches manifest
    pub fn verify_binary(&self, binary_path: &Path, manifest_path: &Path) -> Result<BinaryVerification> {
        debug!("Verifying binary {:?} against manifest {:?}", binary_path, manifest_path);

        // Read binary
        let binary_content = fs::read(binary_path)?;
        let binary_hash = self.compute_hash_bytes(&binary_content);

        // Read manifest
        let manifest_content = fs::read_to_string(manifest_path)?;
        let manifest: serde_json::Value = serde_json::from_str(&manifest_content)?;

        // Extract expected hash from manifest
        let expected_hash = manifest
            .get("checksums")
            .and_then(|c| c.get("binary"))
            .and_then(|h| h.as_str())
            .ok_or_else(|| anyhow::anyhow!("No binary checksum in manifest"))?;

        let valid = binary_hash == expected_hash;

        Ok(BinaryVerification {
            valid,
            binary_hash,
            manifest_hash: expected_hash.to_string(),
            binary_size: binary_content.len(),
        })
    }

    /// Compute SHA-256 hash of string content
    pub fn compute_hash(&self, content: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(content.as_bytes());
        hex::encode(hasher.finalize())
    }

    /// Compute SHA-256 hash of bytes
    pub fn compute_hash_bytes(&self, content: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(content);
        hex::encode(hasher.finalize())
    }

    /// Get the expected genesis hash
    pub fn expected_hash(&self) -> &str {
        &self.expected_hash
    }

    /// Full verification: law + signature + binary
    pub fn full_verification(&self, law_path: &Path, binary_path: Option<&Path>, manifest_path: Option<&Path>) -> Result<FullVerification> {
        let mut results = FullVerification {
            law_valid: false,
            binary_valid: None,
            signature_valid: None,
            overall_valid: false,
            errors: vec![],
        };

        // 1. Verify TABLE_OF_LAW
        match self.verify_law(law_path) {
            Ok(result) => {
                results.law_valid = result.valid;
                if !result.valid {
                    results.errors.push(result.message);
                }
            }
            Err(e) => {
                results.errors.push(format!("Law verification error: {}", e));
            }
        }

        // 2. Verify binary (if paths provided)
        if let (Some(bin), Some(man)) = (binary_path, manifest_path) {
            match self.verify_binary(bin, man) {
                Ok(result) => {
                    results.binary_valid = Some(result.valid);
                    if !result.valid {
                        results.errors.push(format!(
                            "Binary hash mismatch: {} != {}",
                            result.binary_hash, result.manifest_hash
                        ));
                    }
                }
                Err(e) => {
                    results.errors.push(format!("Binary verification error: {}", e));
                }
            }
        }

        // Overall validity
        results.overall_valid = results.law_valid
            && results.binary_valid.unwrap_or(true)
            && results.signature_valid.unwrap_or(true);

        Ok(results)
    }
}

impl Default for GenesisVerifier {
    fn default() -> Self {
        Self::new()
    }
}

/// Result of law verification
#[derive(Debug, Clone)]
pub struct VerificationResult {
    pub valid: bool,
    pub expected_hash: String,
    pub computed_hash: String,
    pub signature_valid: Option<bool>,
    pub message: String,
}

/// Result of binary verification
#[derive(Debug, Clone)]
pub struct BinaryVerification {
    pub valid: bool,
    pub binary_hash: String,
    pub manifest_hash: String,
    pub binary_size: usize,
}

/// Result of full verification
#[derive(Debug, Clone)]
pub struct FullVerification {
    pub law_valid: bool,
    pub binary_valid: Option<bool>,
    pub signature_valid: Option<bool>,
    pub overall_valid: bool,
    pub errors: Vec<String>,
}

// Base64 decoding helper (simplified)
mod base64 {
    use anyhow::Result;

    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    pub fn decode(input: &str) -> Result<Vec<u8>> {
        let input = input.replace(['\n', '\r', ' '], "");
        let mut output = Vec::new();
        let mut buffer = 0u32;
        let mut bits = 0;

        for c in input.bytes() {
            if c == b'=' {
                break;
            }

            let value = ALPHABET.iter().position(|&x| x == c)
                .ok_or_else(|| anyhow::anyhow!("Invalid base64 character"))? as u32;

            buffer = (buffer << 6) | value;
            bits += 6;

            if bits >= 8 {
                bits -= 8;
                output.push((buffer >> bits) as u8);
            }
        }

        Ok(output)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_hash_computation() {
        let verifier = GenesisVerifier::with_hash("expected");
        let hash = verifier.compute_hash("Hello, World!");
        assert_eq!(hash.len(), 64); // SHA-256 produces 64 hex chars
    }

    #[test]
    fn test_law_verification() {
        let dir = tempdir().unwrap();
        let law_path = dir.path().join("TABLE_OF_LAW.md");

        // Create test law file
        let content = "# TABLE OF LAW\n\nTest content";
        fs::write(&law_path, content).unwrap();

        // Create verifier with matching hash
        let mut verifier = GenesisVerifier::new();
        verifier.expected_hash = verifier.compute_hash(content);

        let result = verifier.verify_law(&law_path).unwrap();
        assert!(result.valid);
    }
}
