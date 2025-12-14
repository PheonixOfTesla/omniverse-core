//! CONSCIENCE LEDGER
//! Tamper-evident log of all AI decisions
//! Every intent maps to measured impact
//!
//! "A deity that can be audited."

use anyhow::{Result, bail};
use chrono::{DateTime, Utc};
use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};
use std::path::Path;
use tracing::{info, debug, warn};

/// A single conscience entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConscienceEntry {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub intent: Intent,
    pub action: Action,
    pub impact: Option<Impact>,
    pub ethics_score: f32,
    pub hash: String,
    pub previous_hash: String,
}

/// The intent behind an action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Intent {
    pub user_id: String,
    pub stated_goal: String,
    pub inferred_goal: Option<String>,
    pub domain: String,
    pub urgency: Urgency,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum Urgency {
    Low,
    Medium,
    High,
    Critical,
}

/// An action taken by the system
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    pub action_type: String,
    pub parameters: serde_json::Value,
    pub resources_used: Vec<String>,
    pub external_calls: Vec<ExternalCall>,
    pub reversible: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalCall {
    pub service: String,
    pub endpoint: String,
    pub data_shared: Vec<String>,
}

/// Measured impact of an action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Impact {
    pub outcome: Outcome,
    pub user_feedback: Option<UserFeedback>,
    pub measured_at: DateTime<Utc>,
    pub metrics: ImpactMetrics,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum Outcome {
    Positive,
    Neutral,
    Negative,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserFeedback {
    pub rating: i8,  // -2 to +2
    pub comment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImpactMetrics {
    pub time_saved_minutes: Option<f32>,
    pub money_saved_cents: Option<i64>,
    pub stress_delta: Option<f32>,  // -1.0 to +1.0
    pub goal_progress: Option<f32>, // 0.0 to 1.0
}

/// The Conscience Ledger - append-only ethical audit trail
pub struct ConscienceLedger {
    conn: Connection,
    last_hash: String,
}

impl ConscienceLedger {
    /// Create or open a conscience ledger
    pub fn new(path: &Path, passphrase: &str) -> Result<Self> {
        info!("Opening conscience ledger at {:?}", path);

        let conn = Connection::open(path)?;

        // Enable SQLCipher encryption
        conn.execute_batch(&format!(
            "PRAGMA key = '{}';
             PRAGMA cipher_page_size = 4096;
             PRAGMA kdf_iter = 256000;
             PRAGMA cipher_hmac_algorithm = HMAC_SHA512;
             PRAGMA cipher_kdf_algorithm = PBKDF2_HMAC_SHA512;",
            passphrase
        ))?;

        // Create tables if not exist
        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS conscience (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                intent_json TEXT NOT NULL,
                action_json TEXT NOT NULL,
                impact_json TEXT,
                ethics_score REAL NOT NULL,
                hash TEXT NOT NULL UNIQUE,
                previous_hash TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_conscience_timestamp ON conscience(timestamp);
            CREATE INDEX IF NOT EXISTS idx_conscience_user ON conscience(json_extract(intent_json, '$.user_id'));
            CREATE INDEX IF NOT EXISTS idx_conscience_hash ON conscience(hash);

            CREATE TABLE IF NOT EXISTS chain_state (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );"
        )?;

        // Get last hash (genesis if empty)
        let last_hash: String = conn
            .query_row(
                "SELECT hash FROM conscience ORDER BY timestamp DESC LIMIT 1",
                [],
                |row| row.get(0),
            )
            .unwrap_or_else(|_| "GENESIS".to_string());

        Ok(Self { conn, last_hash })
    }

    /// Log an intent (before action)
    pub fn log_intent(&mut self, intent: Intent, action: Action) -> Result<String> {
        let id = uuid::Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        // Compute ethics score
        let ethics_score = self.evaluate_ethics(&intent, &action);

        // Compute hash (chain link)
        let hash = self.compute_hash(&id, &timestamp, &intent, &action, &self.last_hash);

        let entry = ConscienceEntry {
            id: id.clone(),
            timestamp,
            intent: intent.clone(),
            action: action.clone(),
            impact: None,
            ethics_score,
            hash: hash.clone(),
            previous_hash: self.last_hash.clone(),
        };

        // Insert into ledger
        self.conn.execute(
            "INSERT INTO conscience (id, timestamp, intent_json, action_json, ethics_score, hash, previous_hash)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                entry.id,
                entry.timestamp.to_rfc3339(),
                serde_json::to_string(&entry.intent)?,
                serde_json::to_string(&entry.action)?,
                entry.ethics_score,
                entry.hash,
                entry.previous_hash,
            ],
        )?;

        // Update chain state
        self.last_hash = hash;
        debug!("Logged intent {} with ethics score {:.2}", id, ethics_score);

        Ok(id)
    }

    /// Record impact (after action completes)
    pub fn record_impact(&mut self, entry_id: &str, impact: Impact) -> Result<()> {
        self.conn.execute(
            "UPDATE conscience SET impact_json = ?1 WHERE id = ?2",
            params![serde_json::to_string(&impact)?, entry_id],
        )?;

        info!("Recorded impact for entry {}: {:?}", entry_id, impact.outcome);
        Ok(())
    }

    /// Evaluate ethical score for an action
    fn evaluate_ethics(&self, intent: &Intent, action: &Action) -> f32 {
        let mut score = 0.5; // Neutral baseline

        // Reversibility bonus
        if action.reversible {
            score += 0.1;
        }

        // External data sharing penalty
        for call in &action.external_calls {
            if !call.data_shared.is_empty() {
                score -= 0.05 * call.data_shared.len() as f32;
            }
        }

        // Urgency alignment
        match intent.urgency {
            Urgency::Critical => score += 0.1, // High urgency = justified action
            Urgency::Low => score += 0.05,     // Low urgency = thoughtful action
            _ => {}
        }

        // Clamp to valid range
        score.clamp(0.0, 1.0)
    }

    /// Compute hash for chain integrity
    fn compute_hash(
        &self,
        id: &str,
        timestamp: &DateTime<Utc>,
        intent: &Intent,
        action: &Action,
        previous_hash: &str,
    ) -> String {
        let mut hasher = Sha256::new();
        hasher.update(id.as_bytes());
        hasher.update(timestamp.to_rfc3339().as_bytes());
        hasher.update(serde_json::to_string(intent).unwrap_or_default().as_bytes());
        hasher.update(serde_json::to_string(action).unwrap_or_default().as_bytes());
        hasher.update(previous_hash.as_bytes());
        hex::encode(hasher.finalize())
    }

    /// Verify chain integrity
    pub fn verify_chain(&self) -> Result<bool> {
        info!("Verifying conscience ledger integrity...");

        let mut stmt = self.conn.prepare(
            "SELECT id, timestamp, intent_json, action_json, hash, previous_hash
             FROM conscience ORDER BY timestamp ASC"
        )?;

        let entries = stmt.query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
            ))
        })?;

        let mut expected_previous = "GENESIS".to_string();

        for entry in entries {
            let (id, timestamp, intent_json, action_json, stored_hash, previous_hash) = entry?;

            // Verify chain link
            if previous_hash != expected_previous {
                warn!("Chain break at {}: expected previous {}, got {}", id, expected_previous, previous_hash);
                return Ok(false);
            }

            // Verify hash
            let intent: Intent = serde_json::from_str(&intent_json)?;
            let action: Action = serde_json::from_str(&action_json)?;
            let timestamp: DateTime<Utc> = timestamp.parse()?;
            let computed_hash = self.compute_hash(&id, &timestamp, &intent, &action, &previous_hash);

            if computed_hash != stored_hash {
                warn!("Hash mismatch at {}: stored {}, computed {}", id, stored_hash, computed_hash);
                return Ok(false);
            }

            expected_previous = stored_hash;
        }

        info!("✅ Conscience ledger integrity verified");
        Ok(true)
    }

    /// Export ledger for external audit
    pub fn export_for_audit(&self) -> Result<String> {
        let mut stmt = self.conn.prepare(
            "SELECT id, timestamp, intent_json, action_json, impact_json, ethics_score, hash, previous_hash
             FROM conscience ORDER BY timestamp ASC"
        )?;

        let entries: Vec<ConscienceEntry> = stmt
            .query_map([], |row| {
                let impact_json: Option<String> = row.get(4)?;
                Ok(ConscienceEntry {
                    id: row.get(0)?,
                    timestamp: row.get::<_, String>(1)?.parse().unwrap_or_else(|_| Utc::now()),
                    intent: serde_json::from_str(&row.get::<_, String>(2)?).unwrap_or_else(|_| Intent {
                        user_id: "unknown".to_string(),
                        stated_goal: "unknown".to_string(),
                        inferred_goal: None,
                        domain: "unknown".to_string(),
                        urgency: Urgency::Medium,
                    }),
                    action: serde_json::from_str(&row.get::<_, String>(3)?).unwrap_or_else(|_| Action {
                        action_type: "unknown".to_string(),
                        parameters: serde_json::json!({}),
                        resources_used: vec![],
                        external_calls: vec![],
                        reversible: true,
                    }),
                    impact: impact_json.and_then(|j| serde_json::from_str(&j).ok()),
                    ethics_score: row.get(5)?,
                    hash: row.get(6)?,
                    previous_hash: row.get(7)?,
                })
            })?
            .filter_map(|r| r.ok())
            .collect();

        Ok(serde_json::to_string_pretty(&entries)?)
    }

    /// Get statistics
    pub fn get_stats(&self) -> Result<LedgerStats> {
        let total_entries: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM conscience",
            [],
            |row| row.get(0),
        )?;

        let avg_ethics: f64 = self.conn.query_row(
            "SELECT AVG(ethics_score) FROM conscience",
            [],
            |row| row.get(0),
        ).unwrap_or(0.0);

        let positive_outcomes: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM conscience WHERE json_extract(impact_json, '$.outcome') = 'Positive'",
            [],
            |row| row.get(0),
        ).unwrap_or(0);

        Ok(LedgerStats {
            total_entries,
            average_ethics_score: avg_ethics as f32,
            positive_outcome_rate: if total_entries > 0 {
                positive_outcomes as f32 / total_entries as f32
            } else {
                0.0
            },
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LedgerStats {
    pub total_entries: i64,
    pub average_ethics_score: f32,
    pub positive_outcome_rate: f32,
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_conscience_chain() {
        let dir = tempdir().unwrap();
        let db_path = dir.path().join("test_conscience.db");

        let mut ledger = ConscienceLedger::new(&db_path, "test_pass").unwrap();

        let intent = Intent {
            user_id: "test_user".to_string(),
            stated_goal: "Schedule workout".to_string(),
            inferred_goal: Some("Improve fitness".to_string()),
            domain: "Venus".to_string(),
            urgency: Urgency::Medium,
        };

        let action = Action {
            action_type: "create_event".to_string(),
            parameters: serde_json::json!({"time": "7:00 AM", "activity": "Run"}),
            resources_used: vec!["calendar".to_string()],
            external_calls: vec![],
            reversible: true,
        };

        let id = ledger.log_intent(intent, action).unwrap();
        assert!(!id.is_empty());

        // Verify chain integrity
        assert!(ledger.verify_chain().unwrap());
    }
}
