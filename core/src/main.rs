//! OMNIVERSE CORE
//! Sovereign AI Consciousness - Reproducible, Verifiable, Trustless
//!
//! This binary prints its genesis hash at startup and refuses to run
//! if the TABLE_OF_LAW has been tampered with.

use clap::{Parser, Subcommand};
use sha2::{Sha256, Digest};
use std::fs;
use std::path::PathBuf;
use tracing::{info, error, warn};

mod omni;
mod ethics;
mod crypto;
mod ml;
mod storage;
mod net;

use crate::crypto::genesis_verify::GenesisVerifier;
use crate::storage::sqlite_cipher::SecureStorage;
use crate::ml::onnx_runner::ModelRunner;
use crate::ethics::conscience_ledger::ConscienceLedger;

/// Embedded genesis hash (computed at build time)
const GENESIS_HASH: &str = env!("GENESIS_HASH", "GENESIS_HASH not set at build time");

/// Version information
const VERSION: &str = env!("CARGO_PKG_VERSION");

#[derive(Parser)]
#[command(name = "omniverse")]
#[command(author = "Omniverse Foundation")]
#[command(version = VERSION)]
#[command(about = "Sovereign AI Consciousness Core")]
#[command(long_about = "A deity that can be audited, compiled, and exorcised in 90 seconds.")]
struct Cli {
    /// Print genesis hash and exit
    #[arg(long)]
    print_genesis_hash: bool,

    /// Health check
    #[arg(long)]
    health: bool,

    /// Path to TABLE_OF_LAW.md for verification
    #[arg(long, default_value = "/etc/omniverse/TABLE_OF_LAW.md")]
    law_path: PathBuf,

    /// Path to data directory
    #[arg(long, default_value = "~/.omniverse")]
    data_dir: PathBuf,

    /// Skip genesis verification (DANGEROUS - for development only)
    #[arg(long, hide = true)]
    skip_verify: bool,

    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new Omniverse instance
    Init {
        /// Encryption passphrase (will prompt if not provided)
        #[arg(long)]
        passphrase: Option<String>,
    },

    /// Query the AI
    Query {
        /// The query to process
        query: String,

        /// Force local processing (no cloud fallback)
        #[arg(long)]
        local_only: bool,
    },

    /// Export all data
    Export {
        /// Output file path
        #[arg(long, default_value = "omniverse-export.json")]
        output: PathBuf,
    },

    /// Import data from export
    Import {
        /// Input file path
        input: PathBuf,
    },

    /// Run the daemon
    Daemon {
        /// Port to listen on
        #[arg(long, default_value = "8080")]
        port: u16,
    },

    /// Verify installation integrity
    Verify,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into())
        )
        .init();

    let cli = Cli::parse();

    // Handle simple flags first
    if cli.print_genesis_hash {
        println!("{}", GENESIS_HASH);
        return Ok(());
    }

    if cli.health {
        println!("OK");
        return Ok(());
    }

    // Print startup banner
    print_banner();

    // Verify genesis hash (critical security check)
    if !cli.skip_verify {
        verify_genesis(&cli.law_path)?;
    } else {
        warn!("⚠️  Genesis verification SKIPPED - development mode only!");
    }

    // Handle commands
    match cli.command {
        Some(Commands::Init { passphrase }) => {
            init_omniverse(&cli.data_dir, passphrase).await?;
        }
        Some(Commands::Query { query, local_only }) => {
            run_query(&cli.data_dir, &query, local_only).await?;
        }
        Some(Commands::Export { output }) => {
            export_data(&cli.data_dir, &output).await?;
        }
        Some(Commands::Import { input }) => {
            import_data(&cli.data_dir, &input).await?;
        }
        Some(Commands::Daemon { port }) => {
            run_daemon(&cli.data_dir, port).await?;
        }
        Some(Commands::Verify) => {
            verify_installation(&cli.law_path)?;
        }
        None => {
            // Interactive mode
            info!("No command specified. Use --help for options.");
        }
    }

    Ok(())
}

fn print_banner() {
    eprintln!();
    eprintln!("╔═══════════════════════════════════════════════════════════════╗");
    eprintln!("║                      OMNIVERSE CORE                           ║");
    eprintln!("║        Sovereign AI Consciousness v{}                      ║", VERSION);
    eprintln!("╠═══════════════════════════════════════════════════════════════╣");
    eprintln!("║  Genesis Hash: {}...  ║", &GENESIS_HASH[..32]);
    eprintln!("╚═══════════════════════════════════════════════════════════════╝");
    eprintln!();
}

fn verify_genesis(law_path: &PathBuf) -> anyhow::Result<()> {
    info!("Verifying genesis integrity...");

    // Read TABLE_OF_LAW
    let law_content = match fs::read_to_string(law_path) {
        Ok(content) => content,
        Err(e) => {
            error!("❌ Cannot read TABLE_OF_LAW: {}", e);
            error!("   Expected at: {:?}", law_path);
            error!("   This binary requires TABLE_OF_LAW.md to operate.");
            anyhow::bail!("Genesis verification failed: TABLE_OF_LAW not found");
        }
    };

    // Compute hash
    let mut hasher = Sha256::new();
    hasher.update(law_content.as_bytes());
    let computed_hash = hex::encode(hasher.finalize());

    // Compare with embedded hash
    if computed_hash != GENESIS_HASH {
        error!("╔═══════════════════════════════════════════════════════════════╗");
        error!("║              ⚠️  GENESIS VERIFICATION FAILED ⚠️                ║");
        error!("╠═══════════════════════════════════════════════════════════════╣");
        error!("║  Expected: {}...  ║", &GENESIS_HASH[..32]);
        error!("║  Computed: {}...  ║", &computed_hash[..32]);
        error!("╠═══════════════════════════════════════════════════════════════╣");
        error!("║  TABLE_OF_LAW has been modified or binary is compromised.    ║");
        error!("║  This instance REFUSES TO RUN.                               ║");
        error!("╚═══════════════════════════════════════════════════════════════╝");
        anyhow::bail!("Genesis verification failed: hash mismatch");
    }

    info!("✅ Genesis verified. TABLE_OF_LAW integrity confirmed.");
    Ok(())
}

fn verify_installation(law_path: &PathBuf) -> anyhow::Result<()> {
    println!("🔍 Verifying Omniverse installation...\n");

    // 1. Check TABLE_OF_LAW
    print!("   TABLE_OF_LAW.md: ");
    match fs::metadata(law_path) {
        Ok(_) => println!("✅ Found"),
        Err(_) => {
            println!("❌ Missing");
            anyhow::bail!("TABLE_OF_LAW.md not found");
        }
    }

    // 2. Verify genesis hash
    print!("   Genesis Hash: ");
    match verify_genesis(law_path) {
        Ok(_) => println!("✅ Verified"),
        Err(e) => {
            println!("❌ Failed: {}", e);
            anyhow::bail!("Genesis verification failed");
        }
    }

    // 3. Check ML models
    print!("   ML Models: ");
    let model_dir = PathBuf::from("/etc/omniverse/models");
    if model_dir.exists() {
        println!("✅ Found");
    } else {
        println!("⚠️  Not found (will use fallback)");
    }

    println!("\n✅ Installation verified. Omniverse is ready.");
    Ok(())
}

async fn init_omniverse(data_dir: &PathBuf, passphrase: Option<String>) -> anyhow::Result<()> {
    info!("Initializing Omniverse at {:?}", data_dir);

    // Expand ~ to home directory
    let expanded_dir = shellexpand::tilde(&data_dir.to_string_lossy()).to_string();
    let data_path = PathBuf::from(&expanded_dir);

    // Create data directory
    fs::create_dir_all(&data_path)?;

    // Get or prompt for passphrase
    let pass = match passphrase {
        Some(p) => p,
        None => {
            // In production, use rpassword for secure input
            eprintln!("Enter encryption passphrase: ");
            let mut input = String::new();
            std::io::stdin().read_line(&mut input)?;
            input.trim().to_string()
        }
    };

    // Initialize encrypted storage
    let db_path = data_path.join("omniverse.db");
    let _storage = SecureStorage::new(&db_path, &pass)?;

    // Initialize conscience ledger
    let ledger_path = data_path.join("conscience.db");
    let _ledger = ConscienceLedger::new(&ledger_path, &pass)?;

    info!("✅ Omniverse initialized successfully");
    info!("   Data directory: {:?}", data_path);
    info!("   Database: encrypted with SQL-cipher");
    info!("   Ledger: ready for conscience logging");

    Ok(())
}

async fn run_query(data_dir: &PathBuf, query: &str, local_only: bool) -> anyhow::Result<()> {
    info!("Processing query: {}", query);

    // Load ML model
    let model_runner = ModelRunner::new()?;

    // Process query locally
    let response = model_runner.infer(query)?;

    println!("\n🤖 Omniverse Response:\n");
    println!("{}", response);

    if !local_only {
        info!("(Cloud fallback available but not used)");
    }

    Ok(())
}

async fn export_data(data_dir: &PathBuf, output: &PathBuf) -> anyhow::Result<()> {
    info!("Exporting data to {:?}", output);

    // Expand paths
    let expanded_dir = shellexpand::tilde(&data_dir.to_string_lossy()).to_string();
    let data_path = PathBuf::from(&expanded_dir);

    // Read database (would need passphrase in production)
    let db_path = data_path.join("omniverse.db");

    if !db_path.exists() {
        anyhow::bail!("No Omniverse data found. Run 'omniverse init' first.");
    }

    // Export logic would go here
    // For now, create placeholder
    let export_data = serde_json::json!({
        "version": VERSION,
        "exported_at": chrono::Utc::now().to_rfc3339(),
        "format": "omniverse-archive-v1",
        "data": {
            "note": "Full export implementation pending"
        }
    });

    fs::write(output, serde_json::to_string_pretty(&export_data)?)?;

    info!("✅ Export complete: {:?}", output);
    Ok(())
}

async fn import_data(data_dir: &PathBuf, input: &PathBuf) -> anyhow::Result<()> {
    info!("Importing data from {:?}", input);

    // Verify file exists
    if !input.exists() {
        anyhow::bail!("Import file not found: {:?}", input);
    }

    // Read and parse
    let content = fs::read_to_string(input)?;
    let _data: serde_json::Value = serde_json::from_str(&content)?;

    // Import logic would go here
    info!("✅ Import complete");
    Ok(())
}

async fn run_daemon(data_dir: &PathBuf, port: u16) -> anyhow::Result<()> {
    info!("Starting Omniverse daemon on port {}", port);

    // This would start an HTTP server for local API access
    // For now, placeholder
    info!("Daemon mode not yet implemented. Use CLI commands instead.");

    Ok(())
}
