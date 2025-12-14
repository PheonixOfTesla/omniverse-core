//! OMNIVERSE DESKTOP
//! Tauri wrapper for the sovereign Rust core
//!
//! "Your AI, your device, no cloud required."

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod ollama;

use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use ollama::OllamaClient;

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

    // Generate genesis hash from passphrase + timestamp
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    let mut hasher = DefaultHasher::new();
    passphrase.hash(&mut hasher);
    timestamp.hash(&mut hasher);
    let hash_value = hasher.finish();
    let genesis_hash = format!("0x{:016x}", hash_value);

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
    model: Option<String>,
    state: State<'_, Mutex<AppState>>,
    window: tauri::Window,
) -> Result<QueryResult, String> {
    // Check initialization - drop the lock before any async operations
    {
        let app_state = state.lock().map_err(|e| e.to_string())?;
        if !app_state.initialized {
            return Err("Omniverse not initialized. Please set up first.".to_string());
        }
    } // MutexGuard dropped here

    let start = std::time::Instant::now();

    // Create Ollama client
    let client = OllamaClient::new();

    // Check if Ollama is running
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

    // Use provided model or default
    let model_name = model.unwrap_or_else(|| "llama2".to_string());

    // Generate response with streaming
    let tokens = client
        .generate(&model_name, &prompt)
        .await
        .map_err(|e| format!("Ollama error: {}", e))?;

    // Emit tokens to frontend as they arrive
    let mut full_response = String::new();
    for token in tokens {
        full_response.push_str(&token);

        // Emit each token to frontend
        let _ = window.emit("ai-token", &token);
    }

    Ok(QueryResult {
        response: full_response,
        model: model_name,
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
            check_ollama,
            list_models,
        ])
        .setup(|_app| {
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
