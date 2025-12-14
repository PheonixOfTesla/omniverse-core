//! OLLAMA CLIENT
//! Local LLM inference via Ollama
//!
//! Provides streaming text generation without any cloud dependencies

use serde::{Deserialize, Serialize};
use std::process::Command;

// ═══════════════════════════════════════════════════════════════
// CLIENT
// ═══════════════════════════════════════════════════════════════

pub struct OllamaClient {
    base_url: String,
}

impl Default for OllamaClient {
    fn default() -> Self {
        Self {
            base_url: "http://localhost:11434".to_string(),
        }
    }
}

impl OllamaClient {
    pub fn new() -> Self {
        Self::default()
    }

    /// Check if Ollama binary is installed
    pub fn is_installed() -> bool {
        // Try to find ollama in PATH
        Command::new("which")
            .arg("ollama")
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }

    /// Check if Ollama server is running
    pub async fn is_running(&self) -> bool {
        let url = format!("{}/api/tags", self.base_url);

        match reqwest::get(&url).await {
            Ok(response) => response.status().is_success(),
            Err(_) => false,
        }
    }

    /// List available models
    pub async fn list_models(&self) -> Result<Vec<String>, String> {
        let url = format!("{}/api/tags", self.base_url);

        let response = reqwest::get(&url)
            .await
            .map_err(|e| format!("Failed to connect to Ollama: {}", e))?;

        if !response.status().is_success() {
            return Err("Ollama API returned error".to_string());
        }

        let data: TagsResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        Ok(data.models.iter().map(|m| m.name.clone()).collect())
    }

    /// Generate text with streaming
    pub async fn generate(
        &self,
        model: &str,
        prompt: &str,
    ) -> Result<Vec<String>, String> {
        let url = format!("{}/api/generate", self.base_url);

        let payload = GenerateRequest {
            model: model.to_string(),
            prompt: prompt.to_string(),
            stream: true,
        };

        let client = reqwest::Client::new();
        let response = client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .map_err(|e| format!("Failed to send request: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Ollama returned status: {}", response.status()));
        }

        // Collect all tokens
        let text = response
            .text()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        // Parse NDJSON (newline-delimited JSON)
        let mut tokens = Vec::new();
        for line in text.lines() {
            if line.trim().is_empty() {
                continue;
            }

            match serde_json::from_str::<GenerateResponse>(line) {
                Ok(gen_response) => {
                    tokens.push(gen_response.response);
                    if gen_response.done {
                        break;
                    }
                }
                Err(e) => {
                    eprintln!("Failed to parse line: {} - Error: {}", line, e);
                }
            }
        }

        Ok(tokens)
    }

    /// Generate text and return full response
    #[allow(dead_code)]
    pub async fn generate_complete(
        &self,
        model: &str,
        prompt: &str,
    ) -> Result<String, String> {
        let tokens = self.generate(model, prompt).await?;
        Ok(tokens.join(""))
    }
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

#[derive(Debug, Serialize, Deserialize)]
struct GenerateRequest {
    model: String,
    prompt: String,
    stream: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct GenerateResponse {
    model: String,
    response: String,
    done: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct TagsResponse {
    models: Vec<Model>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Model {
    name: String,
    modified_at: String,
    size: i64,
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

/// Get installation instructions based on OS
pub fn get_install_instructions() -> String {
    let os = std::env::consts::OS;

    match os {
        "macos" => {
            "Ollama not found. Install it:\n\n\
            1. Visit https://ollama.ai/download\n\
            2. Or run: brew install ollama\n\
            3. Then run: ollama pull llama2\n\
            4. Start server: ollama serve"
        }
        "linux" => {
            "Ollama not found. Install it:\n\n\
            1. Run: curl https://ollama.ai/install.sh | sh\n\
            2. Then run: ollama pull llama2\n\
            3. Start server: ollama serve"
        }
        "windows" => {
            "Ollama not found. Install it:\n\n\
            1. Visit https://ollama.ai/download\n\
            2. Download Windows installer\n\
            3. Then run: ollama pull llama2\n\
            4. Server starts automatically"
        }
        _ => {
            "Ollama not found. Visit https://ollama.ai/download for installation instructions."
        }
    }.to_string()
}
