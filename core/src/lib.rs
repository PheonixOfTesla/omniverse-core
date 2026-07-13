//! OMNIVERSE CORE LIBRARY
//! Sovereign AI Consciousness - Reproducible, Verifiable, Trustless
//!
//! This library exposes the core modules for use by other crates
//! (e.g., desktop, mobile, CLI tools).

pub mod crypto;
pub mod ethics;
pub mod ml;
pub mod net;
pub mod omni;
pub mod storage;

// Re-export commonly used types
pub use crypto::genesis_verify::{GenesisVerifier, VerificationResult};
pub use ethics::conscience_ledger::{
    Action, ConscienceLedger, ConscienceEntry, ExternalCall, Impact,
    ImpactMetrics, Intent, LedgerStats, Outcome, Urgency, UserFeedback
};
pub use storage::sqlite_cipher::{Document, QueryOptions, SecureStorage, StorageStats};
