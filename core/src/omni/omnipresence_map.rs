//! OMNIPRESENCE MAP
//! Local-only presence and context awareness
//! 50m-resolution spatial awareness without cloud dependency
//!
//! "Lives on every device you own, respects every boundary you set."

use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{debug, info};

/// Geohash precision for ~50m resolution
const GEOHASH_PRECISION: usize = 7;

/// Maximum presence history entries per device
const MAX_HISTORY: usize = 1000;

/// Presence state for a single moment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresenceState {
    pub device_id: String,
    pub timestamp: DateTime<Utc>,
    pub location: Option<Location>,
    pub context: ContextState,
    pub activity: ActivityState,
}

/// Location with privacy-preserving geohash
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    /// Geohash (50m precision) - not exact coordinates
    pub geohash: String,

    /// Named place (home, work, gym, etc.)
    pub place_name: Option<String>,

    /// Place type
    pub place_type: PlaceType,

    /// Confidence (0-1)
    pub confidence: f32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum PlaceType {
    Home,
    Work,
    Gym,
    Restaurant,
    Store,
    Transit,
    Outdoor,
    Social,
    Medical,
    Unknown,
}

/// Current context state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextState {
    /// Time context
    pub time_of_day: TimeOfDay,
    pub day_type: DayType,

    /// Device context
    pub device_type: DeviceType,
    pub battery_level: Option<f32>,
    pub network_type: NetworkType,

    /// Inferred state
    pub likely_interruptible: bool,
    pub likely_active: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum TimeOfDay {
    EarlyMorning,  // 5-8
    Morning,       // 8-12
    Afternoon,     // 12-17
    Evening,       // 17-21
    Night,         // 21-24
    LateNight,     // 0-5
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum DayType {
    Weekday,
    Weekend,
    Holiday,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum DeviceType {
    Phone,
    Tablet,
    Desktop,
    Laptop,
    Watch,
    Other,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum NetworkType {
    None,      // Offline
    Cellular,
    Wifi,
    Ethernet,
}

/// Activity state inference
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityState {
    pub primary: Activity,
    pub confidence: f32,
    pub duration_minutes: u32,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum Activity {
    Sleeping,
    Working,
    Exercising,
    Commuting,
    Eating,
    Socializing,
    Relaxing,
    Focused,
    Unknown,
}

/// The Omnipresence Map - local context engine
pub struct OmnipresenceMap {
    /// Current presence per device
    current_presence: HashMap<String, PresenceState>,

    /// Presence history (RAM-only, encrypted swap)
    history: Vec<PresenceState>,

    /// Known places (user-defined)
    known_places: HashMap<String, KnownPlace>,

    /// Activity patterns learned from history
    activity_patterns: ActivityPatterns,
}

/// A user-defined known place
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnownPlace {
    pub name: String,
    pub geohash: String,
    pub place_type: PlaceType,
    pub typical_activities: Vec<Activity>,
    pub typical_times: Vec<TimeOfDay>,
}

/// Learned activity patterns
#[derive(Debug, Clone, Default)]
struct ActivityPatterns {
    /// Time -> Activity probabilities
    time_activity: HashMap<TimeOfDay, HashMap<Activity, f32>>,

    /// Place -> Activity probabilities
    place_activity: HashMap<PlaceType, HashMap<Activity, f32>>,
}

impl OmnipresenceMap {
    /// Create a new Omnipresence Map
    pub fn new() -> Self {
        Self {
            current_presence: HashMap::new(),
            history: Vec::new(),
            known_places: HashMap::new(),
            activity_patterns: ActivityPatterns::default(),
        }
    }

    /// Update presence for a device
    pub fn update_presence(&mut self, state: PresenceState) {
        debug!("Updating presence for device {}", state.device_id);

        // Store current
        self.current_presence.insert(state.device_id.clone(), state.clone());

        // Add to history
        self.history.push(state);

        // Trim history if needed
        if self.history.len() > MAX_HISTORY {
            self.history.remove(0);
        }

        // Update patterns
        self.update_patterns();
    }

    /// Get current presence across all devices
    pub fn get_current_presence(&self) -> Vec<&PresenceState> {
        self.current_presence.values().collect()
    }

    /// Get presence for a specific device
    pub fn get_device_presence(&self, device_id: &str) -> Option<&PresenceState> {
        self.current_presence.get(device_id)
    }

    /// Infer current activity based on context
    pub fn infer_activity(&self, context: &ContextState, location: Option<&Location>) -> ActivityState {
        let mut activity_scores: HashMap<Activity, f32> = HashMap::new();

        // Time-based inference
        if let Some(time_probs) = self.activity_patterns.time_activity.get(&context.time_of_day) {
            for (activity, prob) in time_probs {
                *activity_scores.entry(*activity).or_insert(0.0) += prob * 0.4;
            }
        } else {
            // Default time-based inference
            let default_activity = match context.time_of_day {
                TimeOfDay::EarlyMorning => Activity::Sleeping,
                TimeOfDay::Morning => Activity::Working,
                TimeOfDay::Afternoon => Activity::Working,
                TimeOfDay::Evening => Activity::Relaxing,
                TimeOfDay::Night => Activity::Relaxing,
                TimeOfDay::LateNight => Activity::Sleeping,
            };
            *activity_scores.entry(default_activity).or_insert(0.0) += 0.4;
        }

        // Location-based inference
        if let Some(loc) = location {
            if let Some(place_probs) = self.activity_patterns.place_activity.get(&loc.place_type) {
                for (activity, prob) in place_probs {
                    *activity_scores.entry(*activity).or_insert(0.0) += prob * 0.4;
                }
            } else {
                // Default place-based inference
                let default_activity = match loc.place_type {
                    PlaceType::Home => Activity::Relaxing,
                    PlaceType::Work => Activity::Working,
                    PlaceType::Gym => Activity::Exercising,
                    PlaceType::Restaurant => Activity::Eating,
                    PlaceType::Transit => Activity::Commuting,
                    PlaceType::Social => Activity::Socializing,
                    _ => Activity::Unknown,
                };
                *activity_scores.entry(default_activity).or_insert(0.0) += 0.4;
            }
        }

        // Device-based inference
        let device_activity = match context.device_type {
            DeviceType::Desktop | DeviceType::Laptop => Activity::Working,
            DeviceType::Phone => Activity::Unknown,
            DeviceType::Watch => Activity::Exercising,
            _ => Activity::Unknown,
        };
        *activity_scores.entry(device_activity).or_insert(0.0) += 0.2;

        // Find highest scoring activity
        let (primary, confidence) = activity_scores
            .into_iter()
            .max_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal))
            .unwrap_or((Activity::Unknown, 0.5));

        ActivityState {
            primary,
            confidence,
            duration_minutes: 0, // Would need history analysis
        }
    }

    /// Add a known place
    pub fn add_known_place(&mut self, place: KnownPlace) {
        info!("Adding known place: {}", place.name);
        self.known_places.insert(place.geohash.clone(), place);
    }

    /// Find known place by geohash
    pub fn find_known_place(&self, geohash: &str) -> Option<&KnownPlace> {
        // Try exact match first
        if let Some(place) = self.known_places.get(geohash) {
            return Some(place);
        }

        // Try prefix match (nearby places)
        for precision in (4..GEOHASH_PRECISION).rev() {
            let prefix = &geohash[..precision.min(geohash.len())];
            for (key, place) in &self.known_places {
                if key.starts_with(prefix) {
                    return Some(place);
                }
            }
        }

        None
    }

    /// Check if user is likely interruptible
    pub fn is_interruptible(&self, device_id: &str) -> bool {
        if let Some(presence) = self.current_presence.get(device_id) {
            // Not interruptible during focused work, sleep, or exercise
            let non_interruptible = matches!(
                presence.activity.primary,
                Activity::Sleeping | Activity::Focused | Activity::Exercising
            );

            !non_interruptible && presence.context.likely_interruptible
        } else {
            true // Default to interruptible if unknown
        }
    }

    /// Update learned patterns from history
    fn update_patterns(&mut self) {
        // This would analyze history and update activity_patterns
        // Simplified for now
        debug!("Updating activity patterns from {} history entries", self.history.len());
    }

    /// Export presence data (for backup/migration)
    pub fn export(&self) -> Result<String> {
        let export_data = serde_json::json!({
            "current_presence": self.current_presence,
            "known_places": self.known_places,
            "history_count": self.history.len(),
        });
        Ok(serde_json::to_string_pretty(&export_data)?)
    }
}

impl Default for OmnipresenceMap {
    fn default() -> Self {
        Self::new()
    }
}

/// Convert latitude/longitude to geohash
pub fn encode_geohash(lat: f64, lon: f64) -> String {
    // Simplified geohash encoding
    // In production, use a proper geohash library
    let lat_idx = ((lat + 90.0) / 180.0 * 1000000.0) as u32;
    let lon_idx = ((lon + 180.0) / 360.0 * 1000000.0) as u32;
    format!("{:06x}{:06x}", lat_idx, lon_idx)[..GEOHASH_PRECISION].to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_activity_inference() {
        let map = OmnipresenceMap::new();

        let context = ContextState {
            time_of_day: TimeOfDay::Morning,
            day_type: DayType::Weekday,
            device_type: DeviceType::Laptop,
            battery_level: Some(0.8),
            network_type: NetworkType::Wifi,
            likely_interruptible: true,
            likely_active: true,
        };

        let location = Location {
            geohash: "abc1234".to_string(),
            place_name: Some("Office".to_string()),
            place_type: PlaceType::Work,
            confidence: 0.9,
        };

        let activity = map.infer_activity(&context, Some(&location));
        assert_eq!(activity.primary, Activity::Working);
    }
}
