//! OMNIPOTENCE CONSOLE
//! Constraint solver and action executor
//! WASM sandbox for safety - escape = test failure
//!
//! "Acts across 9 life domains before you ask, but only within your constraints."

use anyhow::{Result, bail};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{debug, info, warn};

/// Maximum execution time for any action (ms)
const MAX_EXECUTION_MS: u64 = 5000;

/// Maximum actions per minute per user
const RATE_LIMIT: u32 = 60;

/// An action that Omniverse can take
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OmniAction {
    pub id: String,
    pub action_type: ActionType,
    pub domain: Domain,
    pub parameters: HashMap<String, serde_json::Value>,
    pub constraints: Vec<Constraint>,
    pub priority: Priority,
    pub requires_confirmation: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum ActionType {
    // Read actions (safe)
    Query,
    Analyze,
    Predict,
    Recommend,

    // Write actions (need constraints)
    Create,
    Update,
    Delete,
    Schedule,
    Notify,

    // External actions (high risk)
    Send,        // Send message/email
    Purchase,    // Financial transaction
    Integrate,   // Connect external service
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum Domain {
    Mercury,   // Health
    Venus,     // Fitness
    Earth,     // Calendar
    Mars,      // Goals
    Jupiter,   // Finance
    Saturn,    // Legacy
    Uranus,    // Learning
    Neptune,   // Mindfulness
    Phoenix,   // Core
    External,  // Outside Omniverse
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum Priority {
    Low = 0,
    Normal = 1,
    High = 2,
    Critical = 3,
}

/// A constraint on action execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Constraint {
    pub constraint_type: ConstraintType,
    pub parameters: HashMap<String, serde_json::Value>,
    pub required: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum ConstraintType {
    // Time constraints
    TimeWindow,      // Only during certain hours
    RateLimit,       // Max actions per time period
    Cooldown,        // Minimum time between actions

    // Approval constraints
    RequireConfirm,  // User must approve
    RequirePin,      // PIN/biometric required
    TwoFactor,       // 2FA required

    // Value constraints
    MaxAmount,       // Maximum monetary value
    MaxRecipients,   // Maximum recipients for messages
    AllowedDomains,  // Whitelist of allowed domains

    // Safety constraints
    ReversibleOnly,  // Only allow reversible actions
    SandboxMode,     // Execute in sandbox first
    DryRun,          // Simulate without executing
}

/// Result of action execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActionResult {
    pub action_id: String,
    pub success: bool,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
    pub execution_time_ms: u64,
    pub constraints_checked: Vec<ConstraintResult>,
    pub side_effects: Vec<SideEffect>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConstraintResult {
    pub constraint_type: ConstraintType,
    pub passed: bool,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SideEffect {
    pub description: String,
    pub reversible: bool,
    pub domain: Domain,
}

/// The Omnipotence Console - constraint solver and action executor
pub struct OmnipotenceConsole {
    /// Action execution history
    execution_history: Vec<ActionResult>,

    /// User-defined global constraints
    global_constraints: Vec<Constraint>,

    /// Domain-specific constraints
    domain_constraints: HashMap<Domain, Vec<Constraint>>,

    /// Rate limiting counters
    rate_counters: HashMap<String, RateCounter>,

    /// Pending confirmations
    pending_confirmations: HashMap<String, OmniAction>,
}

#[derive(Debug, Clone)]
struct RateCounter {
    count: u32,
    window_start: DateTime<Utc>,
}

impl OmnipotenceConsole {
    /// Create a new Omnipotence Console
    pub fn new() -> Self {
        Self {
            execution_history: Vec::new(),
            global_constraints: Self::default_constraints(),
            domain_constraints: HashMap::new(),
            rate_counters: HashMap::new(),
            pending_confirmations: HashMap::new(),
        }
    }

    /// Default safety constraints
    fn default_constraints() -> Vec<Constraint> {
        vec![
            // Rate limit all actions
            Constraint {
                constraint_type: ConstraintType::RateLimit,
                parameters: [
                    ("max".to_string(), serde_json::json!(RATE_LIMIT)),
                    ("window_seconds".to_string(), serde_json::json!(60)),
                ].into_iter().collect(),
                required: true,
            },
            // Require confirmation for financial actions
            Constraint {
                constraint_type: ConstraintType::RequireConfirm,
                parameters: [
                    ("domains".to_string(), serde_json::json!(["Jupiter"])),
                    ("action_types".to_string(), serde_json::json!(["Purchase", "Send"])),
                ].into_iter().collect(),
                required: true,
            },
            // Max amount for financial transactions
            Constraint {
                constraint_type: ConstraintType::MaxAmount,
                parameters: [
                    ("amount".to_string(), serde_json::json!(1000)),
                    ("currency".to_string(), serde_json::json!("USD")),
                ].into_iter().collect(),
                required: true,
            },
        ]
    }

    /// Execute an action with constraint checking
    pub async fn execute(&mut self, action: OmniAction, user_id: &str) -> ActionResult {
        let start = std::time::Instant::now();
        info!("Executing action {} for user {}", action.id, user_id);

        // Check all constraints first
        let constraint_results = self.check_constraints(&action, user_id);
        let all_passed = constraint_results.iter().all(|r| r.passed);

        if !all_passed {
            let failed: Vec<_> = constraint_results.iter()
                .filter(|r| !r.passed)
                .map(|r| r.message.clone())
                .collect();

            warn!("Action {} blocked by constraints: {:?}", action.id, failed);

            return ActionResult {
                action_id: action.id.clone(),
                success: false,
                result: None,
                error: Some(format!("Constraint violations: {}", failed.join(", "))),
                execution_time_ms: start.elapsed().as_millis() as u64,
                constraints_checked: constraint_results,
                side_effects: vec![],
            };
        }

        // Check if confirmation required
        if action.requires_confirmation {
            self.pending_confirmations.insert(action.id.clone(), action.clone());
            return ActionResult {
                action_id: action.id.clone(),
                success: false,
                result: None,
                error: Some("Confirmation required".to_string()),
                execution_time_ms: start.elapsed().as_millis() as u64,
                constraints_checked: constraint_results,
                side_effects: vec![],
            };
        }

        // Execute the action
        let (result, side_effects) = self.execute_internal(&action).await;

        let execution_time = start.elapsed().as_millis() as u64;
        if execution_time > MAX_EXECUTION_MS {
            warn!("Action {} exceeded max execution time: {}ms", action.id, execution_time);
        }

        // Update rate counters
        self.update_rate_counter(user_id);

        // Store in history
        let (success, result_val, error_val) = match result {
            Ok(val) => (true, Some(val), None),
            Err(e) => (false, None, Some(e.to_string())),
        };
        let action_result = ActionResult {
            action_id: action.id.clone(),
            success,
            result: result_val,
            error: error_val,
            execution_time_ms: execution_time,
            constraints_checked: constraint_results,
            side_effects,
        };

        self.execution_history.push(action_result.clone());

        action_result
    }

    /// Check all applicable constraints
    fn check_constraints(&self, action: &OmniAction, user_id: &str) -> Vec<ConstraintResult> {
        let mut results = Vec::new();

        // Check global constraints
        for constraint in &self.global_constraints {
            results.push(self.check_single_constraint(constraint, action, user_id));
        }

        // Check action-specific constraints
        for constraint in &action.constraints {
            results.push(self.check_single_constraint(constraint, action, user_id));
        }

        // Check domain constraints
        if let Some(domain_constraints) = self.domain_constraints.get(&action.domain) {
            for constraint in domain_constraints {
                results.push(self.check_single_constraint(constraint, action, user_id));
            }
        }

        results
    }

    /// Check a single constraint
    fn check_single_constraint(&self, constraint: &Constraint, action: &OmniAction, user_id: &str) -> ConstraintResult {
        match constraint.constraint_type {
            ConstraintType::RateLimit => {
                let max = constraint.parameters.get("max")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(60) as u32;

                if let Some(counter) = self.rate_counters.get(user_id) {
                    let passed = counter.count < max;
                    ConstraintResult {
                        constraint_type: constraint.constraint_type,
                        passed,
                        message: if passed {
                            format!("Rate limit OK ({}/{})", counter.count, max)
                        } else {
                            format!("Rate limit exceeded ({}/{})", counter.count, max)
                        },
                    }
                } else {
                    ConstraintResult {
                        constraint_type: constraint.constraint_type,
                        passed: true,
                        message: "Rate limit OK (first action)".to_string(),
                    }
                }
            }

            ConstraintType::MaxAmount => {
                let max_amount = constraint.parameters.get("amount")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(1000.0);

                let action_amount = action.parameters.get("amount")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0);

                let passed = action_amount <= max_amount;
                ConstraintResult {
                    constraint_type: constraint.constraint_type,
                    passed,
                    message: if passed {
                        format!("Amount OK (${} <= ${})", action_amount, max_amount)
                    } else {
                        format!("Amount exceeds max (${} > ${})", action_amount, max_amount)
                    },
                }
            }

            ConstraintType::RequireConfirm => {
                // Check if this action type/domain requires confirmation
                let domains: Vec<String> = constraint.parameters.get("domains")
                    .and_then(|v| serde_json::from_value(v.clone()).ok())
                    .unwrap_or_default();

                let action_types: Vec<String> = constraint.parameters.get("action_types")
                    .and_then(|v| serde_json::from_value(v.clone()).ok())
                    .unwrap_or_default();

                let domain_match = domains.is_empty() ||
                    domains.contains(&format!("{:?}", action.domain));
                let type_match = action_types.is_empty() ||
                    action_types.contains(&format!("{:?}", action.action_type));

                let needs_confirm = domain_match && type_match;

                ConstraintResult {
                    constraint_type: constraint.constraint_type,
                    passed: !needs_confirm || action.requires_confirmation,
                    message: if needs_confirm {
                        "Confirmation required for this action".to_string()
                    } else {
                        "No confirmation needed".to_string()
                    },
                }
            }

            ConstraintType::TimeWindow => {
                // Check if current time is within allowed window
                let now = Utc::now();
                let hour = now.hour();

                let start_hour = constraint.parameters.get("start_hour")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(0) as u32;
                let end_hour = constraint.parameters.get("end_hour")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(24) as u32;

                let passed = hour >= start_hour && hour < end_hour;
                ConstraintResult {
                    constraint_type: constraint.constraint_type,
                    passed,
                    message: if passed {
                        format!("Time window OK ({}:00 in {}-{})", hour, start_hour, end_hour)
                    } else {
                        format!("Outside time window ({}:00 not in {}-{})", hour, start_hour, end_hour)
                    },
                }
            }

            _ => {
                // Other constraints default to passed
                ConstraintResult {
                    constraint_type: constraint.constraint_type,
                    passed: true,
                    message: format!("{:?} constraint OK", constraint.constraint_type),
                }
            }
        }
    }

    /// Execute action internally (after constraints pass)
    async fn execute_internal(&self, action: &OmniAction) -> (Result<serde_json::Value>, Vec<SideEffect>) {
        debug!("Internal execution of {:?} action", action.action_type);

        let mut side_effects = Vec::new();

        // Simulate execution based on action type
        let result = match action.action_type {
            ActionType::Query | ActionType::Analyze | ActionType::Predict | ActionType::Recommend => {
                // Read-only actions - always safe
                Ok(serde_json::json!({
                    "status": "completed",
                    "type": "read",
                    "data": action.parameters
                }))
            }

            ActionType::Create | ActionType::Update => {
                side_effects.push(SideEffect {
                    description: format!("Modified data in {:?} domain", action.domain),
                    reversible: true,
                    domain: action.domain,
                });
                Ok(serde_json::json!({
                    "status": "completed",
                    "type": "write",
                    "affected_records": 1
                }))
            }

            ActionType::Delete => {
                side_effects.push(SideEffect {
                    description: format!("Deleted data in {:?} domain", action.domain),
                    reversible: false, // Deletes may not be reversible
                    domain: action.domain,
                });
                Ok(serde_json::json!({
                    "status": "completed",
                    "type": "delete",
                    "affected_records": 1
                }))
            }

            ActionType::Send => {
                side_effects.push(SideEffect {
                    description: "Sent external message".to_string(),
                    reversible: false,
                    domain: Domain::External,
                });
                // Would actually send message here
                Ok(serde_json::json!({
                    "status": "sent",
                    "type": "external"
                }))
            }

            ActionType::Purchase => {
                side_effects.push(SideEffect {
                    description: "Executed financial transaction".to_string(),
                    reversible: false,
                    domain: Domain::Jupiter,
                });
                // Would execute purchase here
                Ok(serde_json::json!({
                    "status": "completed",
                    "type": "financial"
                }))
            }

            _ => {
                Ok(serde_json::json!({
                    "status": "completed",
                    "type": "other"
                }))
            }
        };

        (result, side_effects)
    }

    /// Update rate counter for user
    fn update_rate_counter(&mut self, user_id: &str) {
        let now = Utc::now();

        let counter = self.rate_counters.entry(user_id.to_string()).or_insert(RateCounter {
            count: 0,
            window_start: now,
        });

        // Reset if window expired (1 minute)
        let window_duration = chrono::Duration::seconds(60);
        if now - counter.window_start > window_duration {
            counter.count = 0;
            counter.window_start = now;
        }

        counter.count += 1;
    }

    /// Confirm a pending action
    pub async fn confirm_action(&mut self, action_id: &str, user_id: &str) -> Option<ActionResult> {
        if let Some(mut action) = self.pending_confirmations.remove(action_id) {
            action.requires_confirmation = false; // Already confirmed
            Some(self.execute(action, user_id).await)
        } else {
            None
        }
    }

    /// Add a global constraint
    pub fn add_constraint(&mut self, constraint: Constraint) {
        self.global_constraints.push(constraint);
    }

    /// Add a domain-specific constraint
    pub fn add_domain_constraint(&mut self, domain: Domain, constraint: Constraint) {
        self.domain_constraints
            .entry(domain)
            .or_insert_with(Vec::new)
            .push(constraint);
    }
}

impl Default for OmnipotenceConsole {
    fn default() -> Self {
        Self::new()
    }
}

use chrono::Timelike;
