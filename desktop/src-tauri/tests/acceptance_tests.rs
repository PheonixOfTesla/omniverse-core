//! ACCEPTANCE TESTS FOR CRYPTO WIRING
//! Tests for A5 (SQLCipher), A6 (Conscience Ledger), A8 (Persistence)
//!
//! Run with: cargo test --release

use std::fs;
use tempfile::tempdir;

// Import from omniverse core
use omniverse::{
    Action, ConscienceLedger, Document, Intent,
    SecureStorage, Urgency,
};
use chrono::Utc;

/// Test A8: Data persistence survives app restart
#[test]
fn test_a8_persistence() {
    println!("\n=== A8 PERSISTENCE TEST ===\n");

    let dir = tempdir().unwrap();
    let db_path = dir.path().join("test_persistence.db");
    let passphrase = "test_passphrase_123";

    // Step 1: Create data
    println!("Step 1: Creating initial storage and data...");
    {
        let storage = SecureStorage::new(&db_path, passphrase).unwrap();

        // Save a widget
        let widget_doc = Document {
            id: "widget:test_widget_1".to_string(),
            collection: "widgets".to_string(),
            data: serde_json::json!({
                "widget_id": "test_widget_1",
                "widget_type": "calendar",
                "data": {"events": ["meeting", "lunch"]}
            }),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            version: 1,
        };
        storage.put(&widget_doc).unwrap();

        // Save settings
        let settings_doc = Document {
            id: "system:settings".to_string(),
            collection: "system".to_string(),
            data: serde_json::json!({
                "theme": "dark",
                "voice": "female"
            }),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            version: 1,
        };
        storage.put(&settings_doc).unwrap();

        println!("  - Created widget: test_widget_1");
        println!("  - Created settings: theme=dark, voice=female");
    }
    // Storage dropped here (simulates app quit)

    println!("\nStep 2: Simulating app quit and restart...");

    // Step 3: Reopen and verify data persists
    println!("\nStep 3: Reopening storage and verifying data...");
    {
        let storage = SecureStorage::new(&db_path, passphrase).unwrap();

        // Load widget
        let widget = storage.get("widget:test_widget_1").unwrap();
        assert!(widget.is_some(), "Widget should persist after restart!");
        let widget = widget.unwrap();
        assert_eq!(widget.data["widget_type"], "calendar");
        println!("  - Widget loaded: {:?}", widget.data["widget_type"]);

        // Load settings
        let settings = storage.get("system:settings").unwrap();
        assert!(settings.is_some(), "Settings should persist after restart!");
        let settings = settings.unwrap();
        assert_eq!(settings.data["theme"], "dark");
        println!("  - Settings loaded: theme={}", settings.data["theme"]);
    }

    println!("\n=== A8 PERSISTENCE TEST: PASSED ===\n");
}

/// Test A5: SQLCipher encryption
#[test]
fn test_a5_sqlcipher_encryption() {
    println!("\n=== A5 SQLCIPHER ENCRYPTION TEST ===\n");

    let dir = tempdir().unwrap();
    let db_path = dir.path().join("test_encryption.db");
    let passphrase = "super_secret_passphrase";

    // Step 1: Create encrypted storage and write data
    println!("Step 1: Creating encrypted storage and writing data...");
    {
        let storage = SecureStorage::new(&db_path, passphrase).unwrap();

        let doc = Document {
            id: "secret:credentials".to_string(),
            collection: "secrets".to_string(),
            data: serde_json::json!({
                "api_key": "sk-1234567890abcdef",
                "password": "hunter2"
            }),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            version: 1,
        };
        storage.put(&doc).unwrap();
        println!("  - Wrote secret data: api_key, password");
    }

    // Step 2: Read raw file and verify it's encrypted
    println!("\nStep 2: Verifying file is encrypted (raw bytes)...");
    let raw_bytes = fs::read(&db_path).unwrap();

    // SQLite3 files start with "SQLite format 3\0"
    // Encrypted files will NOT have this header
    let has_sqlite_header = raw_bytes.starts_with(b"SQLite format 3");
    assert!(!has_sqlite_header, "Database should NOT have plain SQLite header (should be encrypted)!");
    println!("  - File does NOT have plain SQLite header: GOOD (encrypted)");

    // Check that secret data is NOT visible in raw bytes
    let raw_str = String::from_utf8_lossy(&raw_bytes);
    assert!(!raw_str.contains("sk-1234567890abcdef"), "API key should NOT be visible in raw file!");
    assert!(!raw_str.contains("hunter2"), "Password should NOT be visible in raw file!");
    println!("  - Secret data NOT visible in raw bytes: GOOD (encrypted)");

    // Show first 64 bytes as hex (should look random)
    let hex_sample: String = raw_bytes[..64.min(raw_bytes.len())]
        .iter()
        .map(|b| format!("{:02x}", b))
        .collect::<Vec<_>>()
        .join(" ");
    println!("  - First 64 bytes (hex): {}", hex_sample);

    // Step 3: Verify app can still read transparently
    println!("\nStep 3: Verifying app reads data transparently...");
    {
        let storage = SecureStorage::new(&db_path, passphrase).unwrap();
        let doc = storage.get("secret:credentials").unwrap().unwrap();
        assert_eq!(doc.data["api_key"], "sk-1234567890abcdef");
        assert_eq!(doc.data["password"], "hunter2");
        println!("  - App reads secret data correctly: api_key={}, password={}",
            doc.data["api_key"], doc.data["password"]);
    }

    // Step 4: Verify wrong passphrase fails
    println!("\nStep 4: Verifying wrong passphrase fails...");
    let wrong_result = SecureStorage::new(&db_path, "wrong_passphrase");
    assert!(wrong_result.is_err(), "Wrong passphrase should fail!");
    println!("  - Wrong passphrase rejected: GOOD");

    println!("\n=== A5 SQLCIPHER ENCRYPTION TEST: PASSED ===\n");
}

/// Test A6: Conscience ledger chain integrity
#[test]
fn test_a6_conscience_ledger() {
    println!("\n=== A6 CONSCIENCE LEDGER TEST ===\n");

    let dir = tempdir().unwrap();
    let db_path = dir.path().join("test_conscience.db");
    let passphrase = "conscience_passphrase";

    // Step 1: Create ledger and log entries
    println!("Step 1: Creating ledger and logging entries...");
    let entry_ids: Vec<String>;
    {
        let mut ledger = ConscienceLedger::new(&db_path, passphrase).unwrap();

        // Log first entry
        let intent1 = Intent {
            user_id: "test_user".to_string(),
            stated_goal: "Schedule workout".to_string(),
            inferred_goal: Some("Improve health".to_string()),
            domain: "Venus".to_string(),
            urgency: Urgency::Medium,
        };
        let action1 = Action {
            action_type: "create_event".to_string(),
            parameters: serde_json::json!({"time": "7:00 AM"}),
            resources_used: vec!["calendar".to_string()],
            external_calls: vec![],
            reversible: true,
        };
        let id1 = ledger.log_intent(intent1, action1).unwrap();
        println!("  - Logged entry 1: {}", &id1[..8]);

        // Log second entry
        let intent2 = Intent {
            user_id: "test_user".to_string(),
            stated_goal: "Send email".to_string(),
            inferred_goal: None,
            domain: "Mercury".to_string(),
            urgency: Urgency::High,
        };
        let action2 = Action {
            action_type: "send_email".to_string(),
            parameters: serde_json::json!({"to": "friend@example.com"}),
            resources_used: vec!["email".to_string()],
            external_calls: vec![],
            reversible: false,
        };
        let id2 = ledger.log_intent(intent2, action2).unwrap();
        println!("  - Logged entry 2: {}", &id2[..8]);

        entry_ids = vec![id1, id2];

        // Step 2: Verify chain integrity (should pass)
        println!("\nStep 2: Verifying chain integrity (should be VALID)...");
        let valid = ledger.verify_chain().unwrap();
        assert!(valid, "Clean chain should be valid!");
        println!("  - Chain integrity: VALID");

        // Get stats
        let stats = ledger.get_stats().unwrap();
        println!("  - Total entries: {}", stats.total_entries);
        println!("  - Average ethics score: {:.2}", stats.average_ethics_score);
    }

    // Step 3: Tamper with the database and verify detection
    println!("\nStep 3: Tampering with ledger entry...");

    // Open with raw SQLite to tamper
    use rusqlite::Connection;
    {
        let conn = Connection::open(&db_path).unwrap();
        // Apply the encryption key
        conn.execute_batch(&format!(
            "PRAGMA key = '{}';",
            passphrase
        )).unwrap();

        // Tamper with an entry's hash
        conn.execute(
            "UPDATE conscience SET hash = 'TAMPERED_HASH_12345' WHERE id = ?1",
            [&entry_ids[0]],
        ).unwrap();
        println!("  - Tampered entry {} hash to 'TAMPERED_HASH_12345'", &entry_ids[0][..8]);
    }

    // Step 4: Verify chain detects tampering
    println!("\nStep 4: Verifying chain detects tampering (should be INVALID)...");
    {
        let ledger = ConscienceLedger::new(&db_path, passphrase).unwrap();
        let valid = ledger.verify_chain().unwrap();
        assert!(!valid, "Tampered chain should be INVALID!");
        println!("  - Chain integrity: INVALID (tampering detected!)");
    }

    println!("\n=== A6 CONSCIENCE LEDGER TEST: PASSED ===\n");
}

/// Combined integration test
#[test]
fn test_full_integration() {
    println!("\n=== FULL INTEGRATION TEST ===\n");
    println!("Testing A5, A6, A8 together...\n");

    let dir = tempdir().unwrap();
    let storage_path = dir.path().join("omniverse.db");
    let ledger_path = dir.path().join("conscience.db");
    let passphrase = "integration_test_passphrase";

    // Initialize both
    println!("Initializing encrypted storage and conscience ledger...");
    let storage = SecureStorage::new(&storage_path, passphrase).unwrap();
    let mut ledger = ConscienceLedger::new(&ledger_path, passphrase).unwrap();

    // Save a widget
    println!("Saving widget through encrypted storage...");
    let widget = Document {
        id: "widget:integration_test".to_string(),
        collection: "widgets".to_string(),
        data: serde_json::json!({"type": "clock", "timezone": "UTC"}),
        created_at: Utc::now(),
        updated_at: Utc::now(),
        version: 1,
    };
    storage.put(&widget).unwrap();

    // Log the action
    println!("Logging action to conscience ledger...");
    let intent = Intent {
        user_id: "test_user".to_string(),
        stated_goal: "Add clock widget".to_string(),
        inferred_goal: None,
        domain: "desktop".to_string(),
        urgency: Urgency::Low,
    };
    let action = Action {
        action_type: "save_widget".to_string(),
        parameters: serde_json::json!({"widget_id": "integration_test"}),
        resources_used: vec!["storage".to_string()],
        external_calls: vec![],
        reversible: true,
    };
    ledger.log_intent(intent, action).unwrap();

    // Verify encryption
    println!("Verifying storage encryption...");
    let raw_bytes = fs::read(&storage_path).unwrap();
    assert!(!raw_bytes.starts_with(b"SQLite format 3"));
    println!("  - Storage is encrypted");

    // Verify ledger integrity
    println!("Verifying ledger integrity...");
    assert!(ledger.verify_chain().unwrap());
    println!("  - Ledger chain is valid");

    // Verify stats
    let stats = ledger.get_stats().unwrap();
    println!("  - Ledger entries: {}", stats.total_entries);

    println!("\n=== FULL INTEGRATION TEST: PASSED ===\n");
}
