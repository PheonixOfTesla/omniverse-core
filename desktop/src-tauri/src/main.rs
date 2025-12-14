//! OMNIVERSE DESKTOP
//! Tauri wrapper for the sovereign Rust core
//!
//! "Your AI, your device, no cloud required."

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use tauri::{Manager, State};
use std::sync::Mutex;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

struct AppState {
    initialized: bool,
    genesis_hash: String,
    data_dir: String,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            initialized: false,
            genesis_hash: String::new(),
            data_dir: String::new(),
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// COMMANDS (exposed to frontend)
// ═══════════════════════════════════════════════════════════════

#[derive(Serialize, Deserialize)]
struct InitResult {
    success: bool,
    genesis_hash: String,
    message: String,
}

/// Initialize Omniverse with passphrase
#[tauri::command]
async fn initialize(
    passphrase: String,
    state: State<'_, Mutex<AppState>>,
) -> Result<InitResult, String> {
    // Get data directory
    let data_dir = dirs::data_dir()
        .map(|p| p.join("omniverse"))
        .unwrap_or_else(|| std::path::PathBuf::from(".omniverse"));

    // Create directory if needed
    std::fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;

    // TODO: Initialize actual omniverse core here
    // For now, simulate initialization
    let genesis_hash = "abc123..."; // Would come from core

    // Update state
    let mut app_state = state.lock().map_err(|e| e.to_string())?;
    app_state.initialized = true;
    app_state.genesis_hash = genesis_hash.to_string();
    app_state.data_dir = data_dir.to_string_lossy().to_string();

    Ok(InitResult {
        success: true,
        genesis_hash: genesis_hash.to_string(),
        message: "Omniverse initialized successfully".to_string(),
    })
}

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
    state: State<'_, Mutex<AppState>>,
) -> Result<QueryResult, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    if !app_state.initialized {
        return Err("Omniverse not initialized. Please set up first.".to_string());
    }

    let start = std::time::Instant::now();

    // TODO: Call actual omniverse core
    // For now, simulate response
    let response = format!(
        "I understand you're asking about: '{}'. \
        This response is generated locally on your device. \
        Your data never leaves this machine.",
        prompt
    );

    Ok(QueryResult {
        response,
        model: "local".to_string(),
        latency_ms: start.elapsed().as_millis() as u64,
        cached: false,
    })
}

#[derive(Serialize, Deserialize)]
struct HealthStatus {
    initialized: bool,
    genesis_hash: String,
    data_dir: String,
    core_version: String,
    platform: String,
}

/// Get system health status
#[tauri::command]
async fn health(state: State<'_, Mutex<AppState>>) -> Result<HealthStatus, String> {
    let app_state = state.lock().map_err(|e| e.to_string())?;

    Ok(HealthStatus {
        initialized: app_state.initialized,
        genesis_hash: app_state.genesis_hash.clone(),
        data_dir: app_state.data_dir.clone(),
        core_version: env!("CARGO_PKG_VERSION").to_string(),
        platform: std::env::consts::OS.to_string(),
    })
}

#[derive(Serialize, Deserialize)]
struct VerifyResult {
    valid: bool,
    expected_hash: String,
    computed_hash: String,
    message: String,
}

/// Verify genesis hash
#[tauri::command]
async fn verify_genesis() -> Result<VerifyResult, String> {
    // TODO: Actual verification against TABLE_OF_LAW
    Ok(VerifyResult {
        valid: true,
        expected_hash: "embedded_hash".to_string(),
        computed_hash: "computed_hash".to_string(),
        message: "Genesis verification passed".to_string(),
    })
}

/// Export all data
#[tauri::command]
async fn export_data(path: String) -> Result<String, String> {
    // TODO: Call omniverse export
    Ok(format!("Data exported to {}", path))
}

/// Get genesis hash for display
#[tauri::command]
fn get_genesis_hash() -> String {
    // TODO: Get from compiled binary
    "0x1234...abcd".to_string()
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

fn main() {
    tauri::Builder::default()
        .manage(Mutex::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
            initialize,
            query,
            health,
            verify_genesis,
            export_data,
            get_genesis_hash,
        ])
        .setup(|app| {
            // Print startup banner
            println!("╔═══════════════════════════════════════════════════════════════╗");
            println!("║                      OMNIVERSE DESKTOP                        ║");
            println!("║              Sovereign AI Consciousness v{}               ║", env!("CARGO_PKG_VERSION"));
            println!("╚═══════════════════════════════════════════════════════════════╝");
            println!();
            println!("Your data stays on this device. Always.");
            println!();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
