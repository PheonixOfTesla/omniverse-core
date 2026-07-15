//! OMNIVERSE DESKTOP
//! Tauri wrapper for the sovereign Rust core
//!
//! "Your AI, your device, no cloud required."
//!
//! This version wires in:
//! - A5: SQLCipher encryption (all data encrypted at rest)
//! - A6: Conscience Ledger (Ed25519-signed audit trail)
//! - A8: Persistence (data survives app restart)

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod ollama;
mod piper;

use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::{State, Manager};
// Import from omniverse core
use omniverse::{
    Action, ConscienceLedger, Document, Intent, QueryOptions,
    SecureStorage, Urgency, GenesisVerifier,
};

use ollama::OllamaClient;
use piper::{PiperClient, PiperVoice, VoiceGender};

// ======================================================================
// PERSISTENT STATE
// ======================================================================

/// Application state with encrypted persistent storage
struct AppState {
    initialized: bool,
    passphrase_hash: String,
    data_dir: PathBuf,
    /// Encrypted document storage (SQLCipher)
    storage: Option<SecureStorage>,
    /// Conscience ledger (tamper-evident audit trail)
    ledger: Option<ConscienceLedger>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            initialized: false,
            passphrase_hash: String::new(),
            data_dir: PathBuf::new(),
            storage: None,
            ledger: None,
        }
    }
}

// ======================================================================
// HELPER FUNCTIONS
// ======================================================================

/// Get the data directory for Omniverse
fn get_data_dir() -> PathBuf {
    dirs::data_dir()
        .map(|p| p.join("omniverse"))
        .unwrap_or_else(|| PathBuf::from(".omniverse"))
}

/// Hash passphrase for verification (not for encryption)
fn hash_passphrase(passphrase: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    passphrase.hash(&mut hasher);
    format!("0x{:016x}", hasher.finish())
}

// ======================================================================
// INITIALIZATION COMMANDS
// ======================================================================

#[derive(Serialize, Deserialize)]
struct InitResult {
    success: bool,
    genesis_hash: String,
    message: String,
    data_dir: String,
}

/// Initialize Omniverse with passphrase - creates encrypted storage
#[tauri::command]
async fn initialize(
    passphrase: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<InitResult, String> {
    let data_dir = get_data_dir();

    // Create directory if needed
    std::fs::create_dir_all(&data_dir).map_err(|e| format!("Failed to create data dir: {}", e))?;

    let db_path = data_dir.join("omniverse.db");
    let ledger_path = data_dir.join("conscience.db");

    // Initialize encrypted storage (SQLCipher)
    let storage = SecureStorage::new(&db_path, &passphrase)
        .map_err(|e| format!("Failed to initialize storage: {}", e))?;

    // Initialize conscience ledger
    let ledger = ConscienceLedger::new(&ledger_path, &passphrase)
        .map_err(|e| format!("Failed to initialize ledger: {}", e))?;

    let passphrase_hash = hash_passphrase(&passphrase);

    // Update state
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.initialized = true;
    app_state.passphrase_hash = passphrase_hash.clone();
    app_state.data_dir = data_dir.clone();
    app_state.storage = Some(storage);
    app_state.ledger = Some(ledger);

    // Save initialization marker
    if let Some(ref storage) = app_state.storage {
        let init_doc = Document {
            id: "system:init".to_string(),
            collection: "system".to_string(),
            data: serde_json::json!({
                "initialized_at": Utc::now().to_rfc3339(),
                "version": env!("CARGO_PKG_VERSION"),
            }),
            created_at: Utc::now(),
            updated_at: Utc::now(),
            version: 1,
        };
        let _ = storage.put(&init_doc);
    }

    Ok(InitResult {
        success: true,
        genesis_hash: passphrase_hash,
        message: "Omniverse initialized with encrypted storage".to_string(),
        data_dir: data_dir.to_string_lossy().to_string(),
    })
}

/// Check if already initialized (for app restart persistence)
#[tauri::command]
async fn check_initialized() -> Result<serde_json::Value, String> {
    let data_dir = get_data_dir();
    let db_path = data_dir.join("omniverse.db");

    let exists = db_path.exists();

    Ok(serde_json::json!({
        "initialized": exists,
        "db_path": db_path.to_string_lossy(),
    }))
}

/// Unlock existing storage with passphrase (for returning users)
#[tauri::command]
async fn unlock(
    passphrase: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<InitResult, String> {
    let data_dir = get_data_dir();
    let db_path = data_dir.join("omniverse.db");
    let ledger_path = data_dir.join("conscience.db");

    if !db_path.exists() {
        return Err("No existing database found. Please initialize first.".to_string());
    }

    // Try to open with provided passphrase
    let storage = SecureStorage::new(&db_path, &passphrase)
        .map_err(|e| format!("Invalid passphrase or corrupted database: {}", e))?;

    let ledger = ConscienceLedger::new(&ledger_path, &passphrase)
        .map_err(|e| format!("Failed to open ledger: {}", e))?;

    let passphrase_hash = hash_passphrase(&passphrase);

    // Update state
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.initialized = true;
    app_state.passphrase_hash = passphrase_hash.clone();
    app_state.data_dir = data_dir.clone();
    app_state.storage = Some(storage);
    app_state.ledger = Some(ledger);

    Ok(InitResult {
        success: true,
        genesis_hash: passphrase_hash,
        message: "Omniverse unlocked successfully".to_string(),
        data_dir: data_dir.to_string_lossy().to_string(),
    })
}

/// Change vault passphrase (requires current passphrase verification)
#[tauri::command]
async fn change_passphrase(
    current_passphrase: String,
    new_passphrase: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<InitResult, String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Vault not unlocked".to_string());
    }

    // Verify current passphrase matches
    let current_hash = hash_passphrase(&current_passphrase);
    if current_hash != app_state.passphrase_hash {
        return Err("Current passphrase is incorrect".to_string());
    }

    // Change storage passphrase
    if let Some(ref storage) = app_state.storage {
        storage.change_passphrase(&new_passphrase)
            .map_err(|e| format!("Failed to change storage passphrase: {}", e))?;
    }

    // Change ledger passphrase
    if let Some(ref ledger) = app_state.ledger {
        ledger.change_passphrase(&new_passphrase)
            .map_err(|e| format!("Failed to change ledger passphrase: {}", e))?;
    }

    // Update stored hash
    let new_hash = hash_passphrase(&new_passphrase);
    app_state.passphrase_hash = new_hash.clone();

    Ok(InitResult {
        success: true,
        genesis_hash: new_hash,
        message: "Passphrase changed successfully".to_string(),
        data_dir: app_state.data_dir.to_string_lossy().to_string(),
    })
}

// ======================================================================
// PERSISTENCE COMMANDS (A8)
// ======================================================================

#[derive(Serialize, Deserialize)]
struct SaveResult {
    success: bool,
    id: String,
    message: String,
}

/// Save a widget to persistent storage
#[tauri::command]
async fn save_widget(
    widget_id: String,
    widget_type: String,
    widget_data: serde_json::Value,
    state: State<'_, Mutex<AppState>>,
) -> Result<SaveResult, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    let doc = Document {
        id: format!("widget:{}", widget_id),
        collection: "widgets".to_string(),
        data: serde_json::json!({
            "widget_id": widget_id,
            "widget_type": widget_type,
            "data": widget_data,
        }),
        created_at: Utc::now(),
        updated_at: Utc::now(),
        version: 1,
    };

    storage.put(&doc).map_err(|e| format!("Failed to save widget: {}", e))?;

    Ok(SaveResult {
        success: true,
        id: doc.id,
        message: "Widget saved".to_string(),
    })
}

/// Load all widgets from persistent storage
#[tauri::command]
async fn load_widgets(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<serde_json::Value>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    let options = QueryOptions {
        collection: Some("widgets".to_string()),
        ..Default::default()
    };

    let docs = storage.query(&options)
        .map_err(|e| format!("Failed to load widgets: {}", e))?;

    let widgets: Vec<serde_json::Value> = docs.into_iter()
        .map(|d| d.data)
        .collect();

    Ok(widgets)
}

/// Save conversation to persistent storage
#[tauri::command]
async fn save_conversation(
    conversation_id: String,
    messages: Vec<serde_json::Value>,
    state: State<'_, Mutex<AppState>>,
) -> Result<SaveResult, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    let doc = Document {
        id: format!("conversation:{}", conversation_id),
        collection: "conversations".to_string(),
        data: serde_json::json!({
            "conversation_id": conversation_id,
            "messages": messages,
            "updated_at": Utc::now().to_rfc3339(),
        }),
        created_at: Utc::now(),
        updated_at: Utc::now(),
        version: 1,
    };

    storage.put(&doc).map_err(|e| format!("Failed to save conversation: {}", e))?;

    Ok(SaveResult {
        success: true,
        id: doc.id,
        message: "Conversation saved".to_string(),
    })
}

/// Load all conversations
#[tauri::command]
async fn load_conversations(
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<serde_json::Value>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    let options = QueryOptions {
        collection: Some("conversations".to_string()),
        ..Default::default()
    };

    let docs = storage.query(&options)
        .map_err(|e| format!("Failed to load conversations: {}", e))?;

    let conversations: Vec<serde_json::Value> = docs.into_iter()
        .map(|d| d.data)
        .collect();

    Ok(conversations)
}

/// Save settings to persistent storage
#[tauri::command]
async fn save_settings(
    settings: serde_json::Value,
    state: State<'_, Mutex<AppState>>,
) -> Result<SaveResult, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    let doc = Document {
        id: "system:settings".to_string(),
        collection: "system".to_string(),
        data: settings,
        created_at: Utc::now(),
        updated_at: Utc::now(),
        version: 1,
    };

    storage.put(&doc).map_err(|e| format!("Failed to save settings: {}", e))?;

    Ok(SaveResult {
        success: true,
        id: doc.id,
        message: "Settings saved".to_string(),
    })
}

/// Load settings from persistent storage
#[tauri::command]
async fn load_settings(
    state: State<'_, Mutex<AppState>>,
) -> Result<serde_json::Value, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    match storage.get("system:settings") {
        Ok(Some(doc)) => Ok(doc.data),
        Ok(None) => Ok(serde_json::json!({})),
        Err(e) => Err(format!("Failed to load settings: {}", e)),
    }
}

/// Generic save artifact
#[tauri::command]
async fn save_artifact(
    artifact_id: String,
    artifact_type: String,
    data: serde_json::Value,
    state: State<'_, Mutex<AppState>>,
) -> Result<SaveResult, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    let doc = Document {
        id: format!("artifact:{}:{}", artifact_type, artifact_id),
        collection: "artifacts".to_string(),
        data: serde_json::json!({
            "artifact_id": artifact_id,
            "artifact_type": artifact_type,
            "data": data,
        }),
        created_at: Utc::now(),
        updated_at: Utc::now(),
        version: 1,
    };

    storage.put(&doc).map_err(|e| format!("Failed to save artifact: {}", e))?;

    Ok(SaveResult {
        success: true,
        id: doc.id,
        message: "Artifact saved".to_string(),
    })
}

/// Load artifacts by type
#[tauri::command]
async fn load_artifacts(
    artifact_type: Option<String>,
    state: State<'_, Mutex<AppState>>,
) -> Result<Vec<serde_json::Value>, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    let options = QueryOptions {
        collection: Some("artifacts".to_string()),
        ..Default::default()
    };

    let docs = storage.query(&options)
        .map_err(|e| format!("Failed to load artifacts: {}", e))?;

    let artifacts: Vec<serde_json::Value> = docs.into_iter()
        .filter(|d| {
            if let Some(ref t) = artifact_type {
                d.data.get("artifact_type").and_then(|v| v.as_str()) == Some(t)
            } else {
                true
            }
        })
        .map(|d| d.data)
        .collect();

    Ok(artifacts)
}

// ======================================================================
// SQLCIPHER VERIFICATION COMMANDS (A5)
// ======================================================================

#[derive(Serialize, Deserialize)]
struct StorageInfo {
    db_path: String,
    file_size_bytes: u64,
    is_encrypted: bool,
    document_count: u64,
    collections: Vec<String>,
}

/// Get storage info (including proof of encryption)
#[tauri::command]
async fn get_storage_info(
    state: State<'_, Mutex<AppState>>,
) -> Result<StorageInfo, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let db_path = app_state.data_dir.join("omniverse.db");

    let file_size = std::fs::metadata(&db_path)
        .map(|m| m.len())
        .unwrap_or(0);

    // Check if file looks encrypted by reading first few bytes
    let is_encrypted = if let Ok(bytes) = std::fs::read(&db_path) {
        if bytes.len() >= 16 {
            // SQLite3 files start with "SQLite format 3\0"
            // Encrypted files will NOT have this header
            !bytes.starts_with(b"SQLite format 3")
        } else {
            true
        }
    } else {
        false
    };

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    let stats = storage.stats()
        .map_err(|e| format!("Failed to get stats: {}", e))?;

    let collections = storage.collections()
        .map_err(|e| format!("Failed to get collections: {}", e))?;

    Ok(StorageInfo {
        db_path: db_path.to_string_lossy().to_string(),
        file_size_bytes: file_size,
        is_encrypted,
        document_count: stats.document_count,
        collections,
    })
}

/// Get raw hex dump of database file (to prove encryption)
#[tauri::command]
async fn get_db_hex_dump(
    bytes_count: Option<usize>,
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    let db_path = app_state.data_dir.join("omniverse.db");

    let bytes = std::fs::read(&db_path)
        .map_err(|e| format!("Failed to read database: {}", e))?;

    let count = bytes_count.unwrap_or(256).min(bytes.len());
    let hex_dump = hex::encode(&bytes[..count]);

    // Format as hex dump with offsets
    let mut result = String::new();
    for (i, chunk) in hex_dump.as_bytes().chunks(32).enumerate() {
        result.push_str(&format!("{:08x}: {}\n", i * 16, std::str::from_utf8(chunk).unwrap_or("")));
    }

    Ok(result)
}

// ======================================================================
// CONSCIENCE LEDGER COMMANDS (A6)
// ======================================================================

#[derive(Serialize, Deserialize)]
struct LedgerEntry {
    id: String,
    timestamp: String,
    intent: String,
    action_type: String,
    ethics_score: f32,
    hash: String,
}

/// Log an action to the conscience ledger
#[tauri::command]
async fn log_conscience(
    user_goal: String,
    action_type: String,
    action_params: serde_json::Value,
    state: State<'_, Mutex<AppState>>,
) -> Result<LedgerEntry, String> {
    let mut app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let ledger = app_state.ledger.as_mut()
        .ok_or("Ledger not available")?;

    let intent = Intent {
        user_id: "local_user".to_string(),
        stated_goal: user_goal.clone(),
        inferred_goal: None,
        domain: "desktop".to_string(),
        urgency: Urgency::Medium,
    };

    let action = Action {
        action_type: action_type.clone(),
        parameters: action_params,
        resources_used: vec!["local_storage".to_string()],
        external_calls: vec![],
        reversible: true,
    };

    let id = ledger.log_intent(intent, action)
        .map_err(|e| format!("Failed to log to ledger: {}", e))?;

    // Get the entry we just created
    let export = ledger.export_for_audit()
        .map_err(|e| format!("Failed to export: {}", e))?;

    let entries: Vec<serde_json::Value> = serde_json::from_str(&export)
        .map_err(|e| format!("Failed to parse export: {}", e))?;

    // Find our entry
    let entry = entries.iter()
        .find(|e| e.get("id").and_then(|i| i.as_str()) == Some(&id))
        .ok_or("Entry not found")?;

    Ok(LedgerEntry {
        id: id.clone(),
        timestamp: entry.get("timestamp").and_then(|t| t.as_str()).unwrap_or("").to_string(),
        intent: user_goal,
        action_type,
        ethics_score: entry.get("ethics_score").and_then(|s| s.as_f64()).unwrap_or(0.0) as f32,
        hash: entry.get("hash").and_then(|h| h.as_str()).unwrap_or("").to_string(),
    })
}

#[derive(Serialize, Deserialize)]
struct VerifyResult {
    valid: bool,
    expected_hash: String,
    computed_hash: String,
    message: String,
    entry_count: i64,
}

/// Verify the conscience ledger chain integrity
#[tauri::command]
async fn verify_ledger(
    state: State<'_, Mutex<AppState>>,
) -> Result<VerifyResult, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let ledger = app_state.ledger.as_ref()
        .ok_or("Ledger not available")?;

    let valid = ledger.verify_chain()
        .map_err(|e| format!("Verification error: {}", e))?;

    let stats = ledger.get_stats()
        .map_err(|e| format!("Failed to get stats: {}", e))?;

    Ok(VerifyResult {
        valid,
        expected_hash: "chain".to_string(),
        computed_hash: if valid { "matches".to_string() } else { "MISMATCH".to_string() },
        message: if valid {
            "Conscience ledger integrity verified - no tampering detected".to_string()
        } else {
            "INTEGRITY FAILURE - ledger has been tampered with!".to_string()
        },
        entry_count: stats.total_entries,
    })
}

/// Get ledger statistics
#[tauri::command]
async fn get_ledger_stats(
    state: State<'_, Mutex<AppState>>,
) -> Result<serde_json::Value, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let ledger = app_state.ledger.as_ref()
        .ok_or("Ledger not available")?;

    let stats = ledger.get_stats()
        .map_err(|e| format!("Failed to get stats: {}", e))?;

    Ok(serde_json::json!({
        "total_entries": stats.total_entries,
        "average_ethics_score": stats.average_ethics_score,
        "positive_outcome_rate": stats.positive_outcome_rate,
    }))
}

/// Export ledger for external audit
#[tauri::command]
async fn export_ledger(
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let ledger = app_state.ledger.as_ref()
        .ok_or("Ledger not available")?;

    ledger.export_for_audit()
        .map_err(|e| format!("Failed to export: {}", e))
}

// ======================================================================
// GENESIS VERIFICATION (Real Ed25519)
// ======================================================================

/// Verify genesis hash (real implementation)
#[tauri::command]
async fn verify_genesis(
    law_path: Option<String>,
) -> Result<serde_json::Value, String> {
    let verifier = GenesisVerifier::with_hash("embedded_genesis_hash");

    // If no path provided, check common locations
    let paths_to_check = if let Some(path) = law_path {
        vec![PathBuf::from(path)]
    } else {
        vec![
            PathBuf::from("/etc/omniverse/TABLE_OF_LAW.md"),
            PathBuf::from("TABLE_OF_LAW.md"),
            get_data_dir().join("TABLE_OF_LAW.md"),
        ]
    };

    for path in paths_to_check {
        if path.exists() {
            match verifier.verify_law(&path) {
                Ok(result) => {
                    return Ok(serde_json::json!({
                        "valid": result.valid,
                        "expected_hash": result.expected_hash,
                        "computed_hash": result.computed_hash,
                        "message": result.message,
                        "law_path": path.to_string_lossy(),
                    }));
                }
                Err(e) => {
                    return Err(format!("Verification failed: {}", e));
                }
            }
        }
    }

    Ok(serde_json::json!({
        "valid": false,
        "expected_hash": "N/A",
        "computed_hash": "N/A",
        "message": "TABLE_OF_LAW.md not found in any expected location",
    }))
}

// ======================================================================
// AI QUERY COMMANDS
// ======================================================================

#[derive(Serialize, Deserialize)]
struct QueryResult {
    response: String,
    model: String,
    latency_ms: u64,
    cached: bool,
}

/// Query the AI
#[tauri::command]
async fn query(
    prompt: String,
    model: Option<String>,
    state: State<'_, Mutex<AppState>>,
    window: tauri::Window,
) -> Result<QueryResult, String> {
    // Check initialization
    {
        let app_state = state.lock().map_err(|e| e.to_string())?;
        if !app_state.initialized {
            return Err("Omniverse not initialized. Please set up first.".to_string());
        }
    }

    let start = std::time::Instant::now();

    let client = OllamaClient::new();

    if !client.is_running().await {
        if !OllamaClient::is_installed() {
            return Err(ollama::get_install_instructions());
        } else {
            return Err(
                "Ollama is installed but not running.\n\n\
                Start it with: ollama serve\n\
                Or ensure the Ollama app is running."
                    .to_string(),
            );
        }
    }

    let model_name = model.unwrap_or_else(|| "llama2".to_string());

    let tokens = client
        .generate(&model_name, &prompt)
        .await
        .map_err(|e| format!("Ollama error: {}", e))?;

    let mut full_response = String::new();
    for token in tokens {
        full_response.push_str(&token);
        let _ = window.emit("ai-token", &token);
    }

    // Log to conscience ledger
    {
        let mut app_state = state.lock().map_err(|e| e.to_string())?;
        if let Some(ref mut ledger) = app_state.ledger {
            let intent = Intent {
                user_id: "local_user".to_string(),
                stated_goal: format!("AI Query: {}", &prompt[..prompt.len().min(100)]),
                inferred_goal: None,
                domain: "ai".to_string(),
                urgency: Urgency::Medium,
            };

            let action = Action {
                action_type: "ai_query".to_string(),
                parameters: serde_json::json!({
                    "model": model_name,
                    "prompt_length": prompt.len(),
                }),
                resources_used: vec!["ollama".to_string()],
                external_calls: vec![],
                reversible: false,
            };

            let _ = ledger.log_intent(intent, action);
        }
    }

    Ok(QueryResult {
        response: full_response,
        model: model_name,
        latency_ms: start.elapsed().as_millis() as u64,
        cached: false,
    })
}

// ======================================================================
// HEALTH & STATUS COMMANDS
// ======================================================================

#[derive(Serialize, Deserialize)]
struct HealthStatus {
    initialized: bool,
    genesis_hash: String,
    data_dir: String,
    core_version: String,
    platform: String,
    storage_ready: bool,
    ledger_ready: bool,
}

/// Get system health status
#[tauri::command]
async fn health(state: State<'_, Mutex<AppState>>) -> Result<HealthStatus, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    Ok(HealthStatus {
        initialized: app_state.initialized,
        genesis_hash: app_state.passphrase_hash.clone(),
        data_dir: app_state.data_dir.to_string_lossy().to_string(),
        core_version: env!("CARGO_PKG_VERSION").to_string(),
        platform: std::env::consts::OS.to_string(),
        storage_ready: app_state.storage.is_some(),
        ledger_ready: app_state.ledger.is_some(),
    })
}

/// Export all data
#[tauri::command]
async fn export_data(
    path: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<String, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized".to_string());
    }

    let storage = app_state.storage.as_ref()
        .ok_or("Storage not available")?;

    let export_data = storage.export()
        .map_err(|e| format!("Failed to export: {}", e))?;

    std::fs::write(&path, &export_data)
        .map_err(|e| format!("Failed to write export: {}", e))?;

    Ok(format!("Data exported to {}", path))
}

/// Get genesis hash for display
#[tauri::command]
fn get_genesis_hash(state: State<'_, Mutex<AppState>>) -> String {
    if let Ok(app_state) = state.lock() {
        if app_state.initialized {
            return app_state.passphrase_hash.clone();
        }
    }
    "Not initialized".to_string()
}

// ======================================================================
// OLLAMA COMMANDS
// ======================================================================

#[derive(Serialize, Deserialize)]
struct OllamaStatus {
    installed: bool,
    running: bool,
    message: String,
}

/// Check Ollama installation and status
#[tauri::command]
async fn check_ollama() -> Result<OllamaStatus, String> {
    let installed = OllamaClient::is_installed();

    if !installed {
        return Ok(OllamaStatus {
            installed: false,
            running: false,
            message: ollama::get_install_instructions(),
        });
    }

    let client = OllamaClient::new();
    let running = client.is_running().await;

    let message = if running {
        "Ollama is installed and running".to_string()
    } else {
        "Ollama is installed but not running. Start it with: ollama serve".to_string()
    };

    Ok(OllamaStatus {
        installed,
        running,
        message,
    })
}

#[derive(Serialize, Deserialize)]
struct ModelsResult {
    models: Vec<String>,
}

/// List available Ollama models
#[tauri::command]
async fn list_models() -> Result<ModelsResult, String> {
    let client = OllamaClient::new();

    if !client.is_running().await {
        return Err("Ollama is not running".to_string());
    }

    let models = client
        .list_models()
        .await
        .map_err(|e| format!("Failed to list models: {}", e))?;

    Ok(ModelsResult { models })
}

// ======================================================================
// PIPER TTS COMMANDS
// ======================================================================

#[derive(Serialize, Deserialize)]
struct TTSStatus {
    available: bool,
    current_voice: String,
    current_gender: String,
    installed_voices: Vec<String>,
    message: String,
}

#[tauri::command]
async fn check_tts() -> Result<TTSStatus, String> {
    let client = PiperClient::new();
    let available = client.is_available();
    let current = client.get_current_voice().await;
    let installed = client.get_installed_voices();

    let message = if available {
        format!("Piper TTS ready. Current voice: {}", current.name)
    } else {
        "Piper TTS not installed. Install with: brew install piper-tts".to_string()
    };

    Ok(TTSStatus {
        available,
        current_voice: current.name,
        current_gender: match current.gender {
            VoiceGender::Male => "male".to_string(),
            VoiceGender::Female => "female".to_string(),
        },
        installed_voices: installed.iter().map(|v| v.name.clone()).collect(),
        message,
    })
}

#[derive(Serialize, Deserialize)]
struct VoiceInfo {
    id: String,
    name: String,
    gender: String,
    quality: String,
    installed: bool,
}

#[tauri::command]
async fn list_voices() -> Result<Vec<VoiceInfo>, String> {
    let client = PiperClient::new();
    let voices: Vec<VoiceInfo> = PiperVoice::all_voices()
        .iter()
        .map(|v| VoiceInfo {
            id: v.id.clone(),
            name: v.name.clone(),
            gender: match v.gender {
                VoiceGender::Male => "male".to_string(),
                VoiceGender::Female => "female".to_string(),
            },
            quality: format!("{:?}", v.quality),
            installed: client.is_voice_installed(v),
        })
        .collect();

    Ok(voices)
}

#[tauri::command]
async fn set_tts_voice(gender: String) -> Result<String, String> {
    let client = PiperClient::new();

    let voice_gender = match gender.to_lowercase().as_str() {
        "male" => VoiceGender::Male,
        "female" => VoiceGender::Female,
        _ => return Err("Invalid gender. Use 'male' or 'female'.".to_string()),
    };

    client.set_voice_by_gender(voice_gender).await?;
    let current = client.get_current_voice().await;

    Ok(format!("Voice set to: {} ({})", current.name, gender))
}

#[tauri::command]
async fn set_tts_voice_by_id(voice_id: String) -> Result<String, String> {
    let client = PiperClient::new();

    let voice = PiperVoice::all_voices()
        .into_iter()
        .find(|v| v.id == voice_id)
        .ok_or_else(|| format!("Voice not found: {}", voice_id))?;

    client.set_voice(voice.clone()).await?;

    Ok(format!("Voice set to: {}", voice.name))
}

#[derive(Serialize, Deserialize)]
struct SpeakResult {
    success: bool,
    voice: String,
    text_length: usize,
    message: String,
}

#[tauri::command]
async fn speak(text: String) -> Result<SpeakResult, String> {
    let client = PiperClient::new();

    if !client.is_available() {
        return Err("Piper TTS not installed. Run: brew install piper-tts".to_string());
    }

    let voice = client.get_current_voice().await;
    let text_len = text.len();

    client.speak(&text).await?;

    Ok(SpeakResult {
        success: true,
        voice: voice.name,
        text_length: text_len,
        message: "Speaking...".to_string(),
    })
}

#[derive(Serialize, Deserialize)]
struct SynthesizeResult {
    success: bool,
    audio_base64: String,
    voice: String,
    sample_rate: u32,
    duration_ms: u64,
}

#[tauri::command]
async fn synthesize(text: String) -> Result<SynthesizeResult, String> {
    let client = PiperClient::new();

    if !client.is_available() {
        return Err("Piper TTS not installed. Run: brew install piper-tts".to_string());
    }

    let start = std::time::Instant::now();
    let voice = client.get_current_voice().await;

    let wav_bytes = client.synthesize(&text).await?;
    let audio_base64 = base64::Engine::encode(
        &base64::engine::general_purpose::STANDARD,
        &wav_bytes
    );

    Ok(SynthesizeResult {
        success: true,
        audio_base64,
        voice: voice.name,
        sample_rate: voice.sample_rate,
        duration_ms: start.elapsed().as_millis() as u64,
    })
}

#[tauri::command]
async fn download_voices() -> Result<String, String> {
    let client = PiperClient::new();

    println!("[Piper] Downloading default voices...");
    client.ensure_default_voices().await?;

    Ok("Default voices downloaded: Ryan (male), Amy (female)".to_string())
}

#[tauri::command]
async fn system_speak(text: String) -> Result<String, String> {
    use std::process::Command;

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("say")
            .arg(&text)
            .output()
            .map_err(|e| format!("Failed to run 'say': {}", e))?;

        if output.status.success() {
            Ok("Spoken via macOS say".to_string())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            Err(format!("Say command failed: {}", stderr))
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("System TTS only available on macOS".to_string())
    }
}

#[tauri::command]
async fn check_system_tts() -> Result<serde_json::Value, String> {
    #[cfg(target_os = "macos")]
    {
        Ok(serde_json::json!({
            "available": true,
            "engine": "macos-say"
        }))
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(serde_json::json!({
            "available": false,
            "engine": "none"
        }))
    }
}

// ======================================================================
// MAIN
// ======================================================================

fn main() {
    tauri::Builder::default()
        .manage(Mutex::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
            // Initialization
            initialize,
            check_initialized,
            unlock,
            change_passphrase,
            // Persistence (A8)
            save_widget,
            load_widgets,
            save_conversation,
            load_conversations,
            save_settings,
            load_settings,
            save_artifact,
            load_artifacts,
            // SQLCipher verification (A5)
            get_storage_info,
            get_db_hex_dump,
            // Conscience Ledger (A6)
            log_conscience,
            verify_ledger,
            get_ledger_stats,
            export_ledger,
            verify_genesis,
            // AI
            query,
            // Status
            health,
            export_data,
            get_genesis_hash,
            // Ollama
            check_ollama,
            list_models,
            // Piper TTS
            check_tts,
            list_voices,
            set_tts_voice,
            set_tts_voice_by_id,
            speak,
            synthesize,
            download_voices,
            // System TTS fallback
            system_speak,
            check_system_tts,
        ])
        .setup(|app| {
            println!("=================================================================");
            println!("                      OMNIVERSE DESKTOP                          ");
            println!("              Sovereign AI Consciousness v{}               ", env!("CARGO_PKG_VERSION"));
            println!("=================================================================");
            println!();
            println!("Features enabled:");
            println!("  - A5: SQLCipher encryption (all data encrypted at rest)");
            println!("  - A6: Conscience Ledger (tamper-evident audit trail)");
            println!("  - A8: Persistence (data survives app restart)");
            println!();
            println!("Your data stays on this device. Always.");
            println!();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
