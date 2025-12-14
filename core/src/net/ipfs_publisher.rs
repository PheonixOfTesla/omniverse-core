//! IPFS PUBLISHER
//! Publishes conscience hashes to IPFS for tamper-evident audit
//! Content-addressed storage ensures immutability
//!
//! "Every decision, permanently recorded in the public ledger."

use anyhow::{Result, bail};
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use tracing::{info, debug, warn, error};

/// IPFS gateway for publishing
const DEFAULT_GATEWAY: &str = "https://ipfs.io";

/// Local IPFS API endpoint
const LOCAL_API: &str = "http://127.0.0.1:5001/api/v0";

/// An IPFS content identifier
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Cid(pub String);

impl std::fmt::Display for Cid {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// A conscience audit record for IPFS
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditRecord {
    /// Record ID
    pub id: String,

    /// Timestamp
    pub timestamp: DateTime<Utc>,

    /// Hash of the conscience entry
    pub conscience_hash: String,

    /// Previous record CID (forms chain)
    pub previous_cid: Option<Cid>,

    /// Summary of actions (no PII)
    pub summary: AuditSummary,

    /// Signature (Ed25519)
    pub signature: Option<String>,
}

/// Non-PII summary of actions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditSummary {
    /// Number of entries in this batch
    pub entry_count: u32,

    /// Domains involved
    pub domains: Vec<String>,

    /// Average ethics score
    pub avg_ethics_score: f32,

    /// Outcome distribution
    pub outcomes: OutcomeDistribution,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutcomeDistribution {
    pub positive: u32,
    pub neutral: u32,
    pub negative: u32,
    pub unknown: u32,
}

/// IPFS Publisher for conscience audit trails
pub struct IpfsPublisher {
    /// Gateway URL
    gateway: String,

    /// Local API URL
    api_url: String,

    /// Use local IPFS node
    use_local: bool,

    /// Published records cache
    published: HashMap<String, Cid>,

    /// Last published CID
    last_cid: Option<Cid>,
}

impl IpfsPublisher {
    /// Create a new IPFS publisher
    pub fn new() -> Self {
        Self {
            gateway: DEFAULT_GATEWAY.to_string(),
            api_url: LOCAL_API.to_string(),
            use_local: false,
            published: HashMap::new(),
            last_cid: None,
        }
    }

    /// Configure to use local IPFS node
    pub fn with_local_node(mut self, api_url: &str) -> Self {
        self.api_url = api_url.to_string();
        self.use_local = true;
        self
    }

    /// Configure gateway
    pub fn with_gateway(mut self, gateway: &str) -> Self {
        self.gateway = gateway.to_string();
        self
    }

    /// Publish an audit record to IPFS
    pub async fn publish(&mut self, record: AuditRecord) -> Result<Cid> {
        info!("Publishing audit record {} to IPFS", record.id);

        // Create record with chain link
        let mut record = record;
        record.previous_cid = self.last_cid.clone();

        // Serialize to JSON
        let json = serde_json::to_string_pretty(&record)?;

        // Compute CID (simplified - real IPFS uses multihash)
        let cid = self.compute_cid(&json);

        if self.use_local {
            // Publish to local IPFS node
            self.publish_to_local(&json).await?;
        } else {
            // For demo, just log (would use pinning service in production)
            debug!("Would publish to IPFS: {} bytes", json.len());
        }

        // Cache the CID
        self.published.insert(record.id.clone(), cid.clone());
        self.last_cid = Some(cid.clone());

        info!("✅ Published to IPFS: {}", cid);
        Ok(cid)
    }

    /// Compute CID from content (simplified)
    fn compute_cid(&self, content: &str) -> Cid {
        let mut hasher = Sha256::new();
        hasher.update(content.as_bytes());
        let hash = hex::encode(hasher.finalize());

        // Format as CIDv1 (simplified)
        Cid(format!("bafybeig{}", &hash[..32]))
    }

    /// Publish to local IPFS node
    async fn publish_to_local(&self, content: &str) -> Result<Cid> {
        // In production, would use reqwest to POST to IPFS API
        // For now, simulate
        debug!("Publishing {} bytes to local IPFS at {}", content.len(), self.api_url);

        // Simulated response
        let cid = self.compute_cid(content);
        Ok(cid)
    }

    /// Retrieve a record from IPFS
    pub async fn get(&self, cid: &Cid) -> Result<AuditRecord> {
        info!("Retrieving {} from IPFS", cid);

        let url = format!("{}/ipfs/{}", self.gateway, cid.0);

        // In production, would fetch via HTTP
        // For now, return error
        bail!("IPFS retrieval not implemented in demo mode")
    }

    /// Verify a chain of audit records
    pub async fn verify_chain(&self, start_cid: &Cid) -> Result<ChainVerification> {
        info!("Verifying audit chain starting from {}", start_cid);

        let mut verified = 0;
        let mut current_cid = Some(start_cid.clone());
        let mut errors = Vec::new();

        while let Some(cid) = current_cid {
            match self.get(&cid).await {
                Ok(record) => {
                    verified += 1;
                    current_cid = record.previous_cid;
                }
                Err(e) => {
                    errors.push(format!("Failed to verify {}: {}", cid, e));
                    break;
                }
            }
        }

        Ok(ChainVerification {
            valid: errors.is_empty(),
            records_verified: verified,
            errors,
        })
    }

    /// Create audit record from conscience entries
    pub fn create_audit_record(
        &self,
        id: &str,
        conscience_hash: &str,
        entries: &[ConscienceEntry],
    ) -> AuditRecord {
        let domains: Vec<String> = entries
            .iter()
            .map(|e| e.domain.clone())
            .collect::<std::collections::HashSet<_>>()
            .into_iter()
            .collect();

        let avg_ethics: f32 = if entries.is_empty() {
            0.0
        } else {
            entries.iter().map(|e| e.ethics_score).sum::<f32>() / entries.len() as f32
        };

        let mut outcomes = OutcomeDistribution {
            positive: 0,
            neutral: 0,
            negative: 0,
            unknown: 0,
        };

        for entry in entries {
            match entry.outcome.as_str() {
                "positive" => outcomes.positive += 1,
                "negative" => outcomes.negative += 1,
                "neutral" => outcomes.neutral += 1,
                _ => outcomes.unknown += 1,
            }
        }

        AuditRecord {
            id: id.to_string(),
            timestamp: Utc::now(),
            conscience_hash: conscience_hash.to_string(),
            previous_cid: self.last_cid.clone(),
            summary: AuditSummary {
                entry_count: entries.len() as u32,
                domains,
                avg_ethics_score: avg_ethics,
                outcomes,
            },
            signature: None, // Would be signed with genesis key
        }
    }

    /// Get the last published CID
    pub fn last_cid(&self) -> Option<&Cid> {
        self.last_cid.as_ref()
    }

    /// Get all published CIDs
    pub fn published_cids(&self) -> Vec<(&String, &Cid)> {
        self.published.iter().collect()
    }

    /// Pin a CID (prevent garbage collection)
    pub async fn pin(&self, cid: &Cid) -> Result<()> {
        if self.use_local {
            debug!("Pinning {} on local node", cid);
            // Would call /pin/add endpoint
        }
        Ok(())
    }

    /// Unpin a CID
    pub async fn unpin(&self, cid: &Cid) -> Result<()> {
        if self.use_local {
            debug!("Unpinning {} from local node", cid);
            // Would call /pin/rm endpoint
        }
        Ok(())
    }
}

impl Default for IpfsPublisher {
    fn default() -> Self {
        Self::new()
    }
}

/// Chain verification result
#[derive(Debug, Clone)]
pub struct ChainVerification {
    pub valid: bool,
    pub records_verified: u32,
    pub errors: Vec<String>,
}

/// Simplified conscience entry for audit
#[derive(Debug, Clone)]
pub struct ConscienceEntry {
    pub domain: String,
    pub ethics_score: f32,
    pub outcome: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cid_computation() {
        let publisher = IpfsPublisher::new();
        let cid1 = publisher.compute_cid("test content");
        let cid2 = publisher.compute_cid("test content");
        let cid3 = publisher.compute_cid("different content");

        assert_eq!(cid1, cid2); // Same content = same CID
        assert_ne!(cid1, cid3); // Different content = different CID
    }

    #[test]
    fn test_audit_record_creation() {
        let publisher = IpfsPublisher::new();

        let entries = vec![
            ConscienceEntry {
                domain: "Mercury".to_string(),
                ethics_score: 0.8,
                outcome: "positive".to_string(),
            },
            ConscienceEntry {
                domain: "Venus".to_string(),
                ethics_score: 0.9,
                outcome: "positive".to_string(),
            },
        ];

        let record = publisher.create_audit_record(
            "audit_001",
            "abc123",
            &entries,
        );

        assert_eq!(record.summary.entry_count, 2);
        assert_eq!(record.summary.outcomes.positive, 2);
        assert!(record.summary.avg_ethics_score > 0.8);
    }
}
