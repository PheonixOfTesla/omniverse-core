//! PIPER ONNX TTS
//! Local text-to-speech using Piper neural voices
//!
//! Provides sovereign speech synthesis without cloud dependencies
//! Supports male and female voices with multiple qualities

use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{Cursor, Write};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Arc;
use tokio::sync::Mutex;

// ═══════════════════════════════════════════════════════════════
// VOICE DEFINITIONS
// ═══════════════════════════════════════════════════════════════

/// Available Piper voices with download URLs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PiperVoice {
    pub id: String,
    pub name: String,
    pub gender: VoiceGender,
    pub language: String,
    pub quality: VoiceQuality,
    pub model_url: String,
    pub config_url: String,
    pub sample_rate: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum VoiceGender {
    Male,
    Female,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VoiceQuality {
    Low,
    Medium,
    High,
}

impl PiperVoice {
    /// Get default male voice (Ryan - medium quality)
    pub fn default_male() -> Self {
        Self {
            id: "en_US-ryan-medium".to_string(),
            name: "Ryan".to_string(),
            gender: VoiceGender::Male,
            language: "en_US".to_string(),
            quality: VoiceQuality::Medium,
            model_url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx".to_string(),
            config_url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json".to_string(),
            sample_rate: 22050,
        }
    }

    /// Get default female voice (Amy - medium quality)
    pub fn default_female() -> Self {
        Self {
            id: "en_US-amy-medium".to_string(),
            name: "Amy".to_string(),
            gender: VoiceGender::Female,
            language: "en_US".to_string(),
            quality: VoiceQuality::Medium,
            model_url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx".to_string(),
            config_url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx.json".to_string(),
            sample_rate: 22050,
        }
    }

    /// Get high quality male voice (Ryan)
    pub fn high_quality_male() -> Self {
        Self {
            id: "en_US-ryan-high".to_string(),
            name: "Ryan HQ".to_string(),
            gender: VoiceGender::Male,
            language: "en_US".to_string(),
            quality: VoiceQuality::High,
            model_url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/high/en_US-ryan-high.onnx".to_string(),
            config_url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/high/en_US-ryan-high.onnx.json".to_string(),
            sample_rate: 22050,
        }
    }

    /// Get high quality female voice (Amy)
    pub fn high_quality_female() -> Self {
        Self {
            id: "en_US-amy-high".to_string(),
            name: "Amy HQ".to_string(),
            gender: VoiceGender::Female,
            language: "en_US".to_string(),
            quality: VoiceQuality::High,
            model_url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/high/en_US-amy-high.onnx".to_string(),
            config_url: "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/high/en_US-amy-high.onnx.json".to_string(),
            sample_rate: 22050,
        }
    }

    /// Get all available voices
    pub fn all_voices() -> Vec<Self> {
        vec![
            Self::default_male(),
            Self::default_female(),
            Self::high_quality_male(),
            Self::high_quality_female(),
        ]
    }

    /// Get model filename
    pub fn model_filename(&self) -> String {
        format!("{}.onnx", self.id)
    }

    /// Get config filename
    pub fn config_filename(&self) -> String {
        format!("{}.onnx.json", self.id)
    }
}

// ═══════════════════════════════════════════════════════════════
// PIPER CLIENT
// ═══════════════════════════════════════════════════════════════

pub struct PiperClient {
    voices_dir: PathBuf,
    cache_dir: PathBuf,
    current_voice: Arc<Mutex<PiperVoice>>,
}

impl PiperClient {
    /// Create new Piper client with data directory
    pub fn new() -> Self {
        let data_dir = dirs::data_dir()
            .map(|p| p.join("omniverse"))
            .unwrap_or_else(|| PathBuf::from(".omniverse"));

        let voices_dir = data_dir.join("voices");
        let cache_dir = data_dir.join("tts_cache");

        // Create directories
        let _ = fs::create_dir_all(&voices_dir);
        let _ = fs::create_dir_all(&cache_dir);

        Self {
            voices_dir,
            cache_dir,
            current_voice: Arc::new(Mutex::new(PiperVoice::default_female())),
        }
    }

    /// Check if a voice model is downloaded
    pub fn is_voice_installed(&self, voice: &PiperVoice) -> bool {
        let model_path = self.voices_dir.join(voice.model_filename());
        let config_path = self.voices_dir.join(voice.config_filename());
        model_path.exists() && config_path.exists()
    }

    /// Download a voice model
    pub async fn download_voice(&self, voice: &PiperVoice) -> Result<(), String> {
        let model_path = self.voices_dir.join(voice.model_filename());
        let config_path = self.voices_dir.join(voice.config_filename());

        // Download model if not exists
        if !model_path.exists() {
            println!("[Piper] Downloading voice model: {}", voice.name);
            self.download_file(&voice.model_url, &model_path).await?;
        }

        // Download config if not exists
        if !config_path.exists() {
            println!("[Piper] Downloading voice config: {}", voice.name);
            self.download_file(&voice.config_url, &config_path).await?;
        }

        println!("[Piper] Voice ready: {}", voice.name);
        Ok(())
    }

    /// Download a file from URL
    async fn download_file(&self, url: &str, path: &Path) -> Result<(), String> {
        let response = reqwest::get(url)
            .await
            .map_err(|e| format!("Download failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("Download failed with status: {}", response.status()));
        }

        let bytes = response
            .bytes()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;

        let mut file = File::create(path)
            .map_err(|e| format!("Failed to create file: {}", e))?;

        file.write_all(&bytes)
            .map_err(|e| format!("Failed to write file: {}", e))?;

        Ok(())
    }

    /// Set current voice
    pub async fn set_voice(&self, voice: PiperVoice) -> Result<(), String> {
        // Ensure voice is downloaded
        if !self.is_voice_installed(&voice) {
            self.download_voice(&voice).await?;
        }

        let mut current = self.current_voice.lock().await;
        *current = voice;
        Ok(())
    }

    /// Set voice by gender
    pub async fn set_voice_by_gender(&self, gender: VoiceGender) -> Result<(), String> {
        let voice = match gender {
            VoiceGender::Male => PiperVoice::default_male(),
            VoiceGender::Female => PiperVoice::default_female(),
        };
        self.set_voice(voice).await
    }

    /// Get current voice
    pub async fn get_current_voice(&self) -> PiperVoice {
        self.current_voice.lock().await.clone()
    }

    /// Synthesize text to speech and return WAV bytes
    pub async fn synthesize(&self, text: &str) -> Result<Vec<u8>, String> {
        let voice = self.current_voice.lock().await.clone();

        // Ensure voice is installed
        if !self.is_voice_installed(&voice) {
            self.download_voice(&voice).await?;
        }

        let model_path = self.voices_dir.join(voice.model_filename());
        let config_path = self.voices_dir.join(voice.config_filename());

        // Generate unique output filename
        let output_path = self.cache_dir.join(format!(
            "tts_{}.wav",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis()
        ));

        // Check for piper binary
        let piper_path = self.get_piper_binary_path();

        if piper_path.is_none() {
            return Err(self.get_piper_install_instructions());
        }

        let piper_bin = piper_path.unwrap();

        // Run piper
        let output = Command::new(&piper_bin)
            .arg("--model")
            .arg(&model_path)
            .arg("--config")
            .arg(&config_path)
            .arg("--output_file")
            .arg(&output_path)
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .and_then(|mut child| {
                // Write text to stdin
                if let Some(mut stdin) = child.stdin.take() {
                    stdin.write_all(text.as_bytes())?;
                }
                child.wait_with_output()
            })
            .map_err(|e| format!("Piper execution failed: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("Piper error: {}", stderr));
        }

        // Read the generated WAV file
        let wav_bytes = fs::read(&output_path)
            .map_err(|e| format!("Failed to read WAV file: {}", e))?;

        // Clean up temp file
        let _ = fs::remove_file(&output_path);

        Ok(wav_bytes)
    }

    /// Synthesize and play audio
    pub async fn speak(&self, text: &str) -> Result<(), String> {
        let wav_bytes = self.synthesize(text).await?;

        // Play audio using rodio
        std::thread::spawn(move || {
            if let Err(e) = play_wav_bytes(&wav_bytes) {
                eprintln!("[Piper] Playback error: {}", e);
            }
        });

        Ok(())
    }

    /// Get piper binary path if installed
    fn get_piper_binary_path(&self) -> Option<PathBuf> {
        // Check in data directory first
        let local_piper = self.voices_dir.parent()?.join("bin").join("piper");
        if local_piper.exists() {
            return Some(local_piper);
        }

        // Check in PATH
        if Command::new("which")
            .arg("piper")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false)
        {
            return Some(PathBuf::from("piper"));
        }

        // Check common locations
        let common_paths = [
            "/usr/local/bin/piper",
            "/opt/homebrew/bin/piper",
            "/usr/bin/piper",
        ];

        for path in common_paths {
            if Path::new(path).exists() {
                return Some(PathBuf::from(path));
            }
        }

        None
    }

    /// Get installation instructions for piper
    fn get_piper_install_instructions(&self) -> String {
        let os = std::env::consts::OS;

        match os {
            "macos" => {
                "Piper TTS not found.\n\n\
                Install with Homebrew:\n\
                  brew install piper-tts\n\n\
                Or download from:\n\
                  https://github.com/rhasspy/piper/releases\n\n\
                After installing, voices will download automatically."
            }
            "linux" => {
                "Piper TTS not found.\n\n\
                Install from releases:\n\
                  https://github.com/rhasspy/piper/releases\n\n\
                Or build from source:\n\
                  git clone https://github.com/rhasspy/piper\n\
                  cd piper && make\n\n\
                After installing, voices will download automatically."
            }
            "windows" => {
                "Piper TTS not found.\n\n\
                Download from:\n\
                  https://github.com/rhasspy/piper/releases\n\n\
                Extract and add to PATH.\n\
                After installing, voices will download automatically."
            }
            _ => {
                "Piper TTS not found.\n\n\
                Download from: https://github.com/rhasspy/piper/releases"
            }
        }.to_string()
    }

    /// Check if Piper is available
    pub fn is_available(&self) -> bool {
        self.get_piper_binary_path().is_some()
    }

    /// Get list of installed voices
    pub fn get_installed_voices(&self) -> Vec<PiperVoice> {
        PiperVoice::all_voices()
            .into_iter()
            .filter(|v| self.is_voice_installed(v))
            .collect()
    }

    /// Ensure default voices are downloaded
    pub async fn ensure_default_voices(&self) -> Result<(), String> {
        let male = PiperVoice::default_male();
        let female = PiperVoice::default_female();

        if !self.is_voice_installed(&male) {
            self.download_voice(&male).await?;
        }

        if !self.is_voice_installed(&female) {
            self.download_voice(&female).await?;
        }

        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════
// AUDIO PLAYBACK
// ═══════════════════════════════════════════════════════════════

/// Play WAV bytes using rodio
fn play_wav_bytes(wav_bytes: &[u8]) -> Result<(), String> {
    use rodio::{Decoder, OutputStream, Sink};

    let (_stream, stream_handle) = OutputStream::try_default()
        .map_err(|e| format!("Failed to get audio output: {}", e))?;

    let sink = Sink::try_new(&stream_handle)
        .map_err(|e| format!("Failed to create audio sink: {}", e))?;

    let cursor = Cursor::new(wav_bytes.to_vec());
    let source = Decoder::new(cursor)
        .map_err(|e| format!("Failed to decode WAV: {}", e))?;

    sink.append(source);
    sink.sleep_until_end();

    Ok(())
}

// ═══════════════════════════════════════════════════════════════
// TYPES FOR TAURI (defined in main.rs - kept here for reference)
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════

lazy_static::lazy_static! {
    pub static ref PIPER: PiperClient = PiperClient::new();
}

// Note: Add lazy_static to Cargo.toml if not present
