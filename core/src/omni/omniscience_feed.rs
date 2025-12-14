//! OMNISCIENCE FEED
//! On-device ranking and recommendation engine
//! Target: < 40ms inference latency
//!
//! "Knows everything you allow it to know, processes locally, learns privately."

use anyhow::Result;
use ndarray::{Array1, Array2};
use std::collections::HashMap;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tracing::{info, debug};

/// Maximum items to rank in a single pass
const MAX_RANK_ITEMS: usize = 100;

/// Confidence threshold for recommendations
const CONFIDENCE_THRESHOLD: f32 = 0.7;

/// A single item that can be ranked
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RankableItem {
    pub id: String,
    pub item_type: ItemType,
    pub features: HashMap<String, f32>,
    pub timestamp: DateTime<Utc>,
    pub domain: Domain,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum ItemType {
    Action,       // Something to do
    Insight,      // Something to know
    Warning,      // Something to avoid
    Opportunity,  // Something to consider
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
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
}

/// Ranked result with score and explanation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RankedResult {
    pub item: RankableItem,
    pub score: f32,
    pub confidence: f32,
    pub reasoning: String,
}

/// The Omniscience Feed - local ranking engine
pub struct OmniscienceFeed {
    /// User preference weights (learned over time)
    preference_weights: HashMap<String, f32>,

    /// Domain importance weights
    domain_weights: HashMap<Domain, f32>,

    /// Time decay factor (how much recency matters)
    time_decay: f32,

    /// Model embeddings (if ML model loaded)
    embeddings: Option<Array2<f32>>,
}

impl OmniscienceFeed {
    /// Create a new Omniscience Feed with default weights
    pub fn new() -> Self {
        let mut domain_weights = HashMap::new();
        domain_weights.insert(Domain::Mercury, 1.0);
        domain_weights.insert(Domain::Venus, 1.0);
        domain_weights.insert(Domain::Earth, 1.0);
        domain_weights.insert(Domain::Mars, 1.0);
        domain_weights.insert(Domain::Jupiter, 1.0);
        domain_weights.insert(Domain::Saturn, 0.8);
        domain_weights.insert(Domain::Uranus, 0.9);
        domain_weights.insert(Domain::Neptune, 0.9);
        domain_weights.insert(Domain::Phoenix, 1.0);

        Self {
            preference_weights: HashMap::new(),
            domain_weights,
            time_decay: 0.95,
            embeddings: None,
        }
    }

    /// Load ML model embeddings from ONNX file
    pub fn load_model(&mut self, model_path: &str) -> Result<()> {
        info!("Loading omniscience model from {}", model_path);
        // In production, load actual ONNX model
        // For now, initialize with random embeddings
        self.embeddings = Some(Array2::zeros((128, 64)));
        Ok(())
    }

    /// Rank a set of items for the current context
    ///
    /// # Arguments
    /// * `items` - Items to rank
    /// * `context` - Current user context (time, location, state)
    ///
    /// # Returns
    /// Ranked results sorted by score descending
    pub fn rank(&self, items: Vec<RankableItem>, context: &RankContext) -> Vec<RankedResult> {
        debug!("Ranking {} items", items.len());
        let start = std::time::Instant::now();

        // Limit items for performance
        let items: Vec<_> = items.into_iter().take(MAX_RANK_ITEMS).collect();

        let mut results: Vec<RankedResult> = items
            .into_iter()
            .map(|item| self.score_item(&item, context))
            .filter(|r| r.confidence >= CONFIDENCE_THRESHOLD)
            .collect();

        // Sort by score descending
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));

        let elapsed = start.elapsed();
        debug!("Ranking complete in {:?}", elapsed);

        if elapsed.as_millis() > 40 {
            info!("⚠️  Ranking exceeded 40ms target: {:?}", elapsed);
        }

        results
    }

    /// Score a single item
    fn score_item(&self, item: &RankableItem, context: &RankContext) -> RankedResult {
        let mut score = 0.0;
        let mut factors = Vec::new();

        // 1. Domain relevance
        let domain_weight = self.domain_weights.get(&item.domain).unwrap_or(&1.0);
        score += domain_weight * 0.3;
        factors.push(format!("domain_relevance={:.2}", domain_weight));

        // 2. Time decay (recent items score higher)
        let age_hours = (Utc::now() - item.timestamp).num_hours() as f32;
        let time_score = self.time_decay.powf(age_hours / 24.0);
        score += time_score * 0.2;
        factors.push(format!("recency={:.2}", time_score));

        // 3. Context match (time of day, day of week, etc.)
        let context_score = self.compute_context_score(item, context);
        score += context_score * 0.25;
        factors.push(format!("context_match={:.2}", context_score));

        // 4. User preference match
        let pref_score = self.compute_preference_score(item);
        score += pref_score * 0.25;
        factors.push(format!("preference_match={:.2}", pref_score));

        // 5. Item type boost
        let type_boost = match item.item_type {
            ItemType::Warning => 1.2,      // Warnings get priority
            ItemType::Action => 1.1,       // Actions next
            ItemType::Opportunity => 1.0,  // Opportunities
            ItemType::Insight => 0.9,      // Insights lowest
        };
        score *= type_boost;

        // Compute confidence based on available data
        let confidence = self.compute_confidence(item, context);

        RankedResult {
            item: item.clone(),
            score,
            confidence,
            reasoning: factors.join(", "),
        }
    }

    /// Compute context match score
    fn compute_context_score(&self, item: &RankableItem, context: &RankContext) -> f32 {
        let mut score = 0.5; // Base score

        // Time of day match
        if let Some(preferred_time) = item.features.get("preferred_hour") {
            let hour_diff = (context.hour as f32 - preferred_time).abs();
            score += 0.3 * (1.0 - hour_diff / 12.0).max(0.0);
        }

        // Energy level match
        if let Some(required_energy) = item.features.get("required_energy") {
            let energy_match = 1.0 - (context.energy_level - required_energy).abs();
            score += 0.2 * energy_match.max(0.0);
        }

        score.min(1.0)
    }

    /// Compute preference match score
    fn compute_preference_score(&self, item: &RankableItem) -> f32 {
        if self.preference_weights.is_empty() {
            return 0.5; // No preferences learned yet
        }

        let mut score = 0.0;
        let mut count = 0;

        for (key, value) in &item.features {
            if let Some(weight) = self.preference_weights.get(key) {
                score += weight * value;
                count += 1;
            }
        }

        if count > 0 {
            (score / count as f32).clamp(0.0, 1.0)
        } else {
            0.5
        }
    }

    /// Compute confidence based on data quality
    fn compute_confidence(&self, item: &RankableItem, _context: &RankContext) -> f32 {
        let mut confidence = 0.7; // Base confidence

        // More features = higher confidence
        confidence += 0.1 * (item.features.len() as f32 / 10.0).min(1.0);

        // Recent items have higher confidence
        let age_days = (Utc::now() - item.timestamp).num_days();
        if age_days < 1 {
            confidence += 0.1;
        } else if age_days > 30 {
            confidence -= 0.1;
        }

        // ML model increases confidence
        if self.embeddings.is_some() {
            confidence += 0.1;
        }

        confidence.clamp(0.0, 1.0)
    }

    /// Update preferences based on user feedback
    pub fn learn_from_feedback(&mut self, item: &RankableItem, feedback: Feedback) {
        let adjustment = match feedback {
            Feedback::Positive => 0.1,
            Feedback::Negative => -0.1,
            Feedback::Neutral => 0.0,
        };

        for (key, value) in &item.features {
            let current = self.preference_weights.get(key).unwrap_or(&0.5);
            let new_weight = (current + adjustment * value).clamp(0.0, 1.0);
            self.preference_weights.insert(key.clone(), new_weight);
        }

        debug!("Preferences updated from feedback");
    }
}

/// Context for ranking decisions
#[derive(Debug, Clone)]
pub struct RankContext {
    pub hour: u8,
    pub day_of_week: u8,
    pub energy_level: f32,
    pub focus_level: f32,
    pub location: Option<String>,
}

impl Default for RankContext {
    fn default() -> Self {
        let now = Utc::now();
        Self {
            hour: now.hour() as u8,
            day_of_week: now.weekday().num_days_from_monday() as u8,
            energy_level: 0.7,
            focus_level: 0.7,
            location: None,
        }
    }
}

/// User feedback types
#[derive(Debug, Clone, Copy)]
pub enum Feedback {
    Positive,
    Negative,
    Neutral,
}

impl Default for OmniscienceFeed {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ranking_performance() {
        let feed = OmniscienceFeed::new();
        let context = RankContext::default();

        // Create test items
        let items: Vec<RankableItem> = (0..100)
            .map(|i| RankableItem {
                id: format!("item_{}", i),
                item_type: ItemType::Action,
                features: HashMap::new(),
                timestamp: Utc::now(),
                domain: Domain::Phoenix,
            })
            .collect();

        let start = std::time::Instant::now();
        let _results = feed.rank(items, &context);
        let elapsed = start.elapsed();

        assert!(elapsed.as_millis() < 40, "Ranking exceeded 40ms: {:?}", elapsed);
    }
}

use chrono::Timelike;
