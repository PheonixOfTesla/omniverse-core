/**
 * OMNIVERSE CONSCIENCE PLUGIN
 *
 * Logs all AI interactions to the conscience ledger
 * Every query, every response, every impact
 *
 * "A deity that can be audited."
 */

// ═══════════════════════════════════════════════════════════════
// CONSCIENCE PLUGIN
// ═══════════════════════════════════════════════════════════════

class ConsciencePlugin {
  constructor(options = {}) {
    this.ledgerPath = options.ledgerPath || null;
    this.userId = options.userId || 'anonymous';
    this.enabled = options.enabled !== false;
    this.entries = []; // In-memory buffer
    this.maxBuffer = options.maxBuffer || 100;

    // Ethics evaluation weights
    this.ethicsWeights = {
      dataMinimization: 0.2,
      reversibility: 0.2,
      transparency: 0.2,
      userBenefit: 0.2,
      noHarm: 0.2
    };
  }

  /**
   * Pre-request hook - log intent
   */
  async preRequest(query, options) {
    if (!this.enabled) return query;

    const entry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      phase: 'intent',
      query: this.sanitizeQuery(query),
      userId: this.userId,
      options: {
        tier: options.forceTier,
        domain: options.domain
      },
      ethicsScore: null,
      impact: null
    };

    // Store for later correlation
    options._conscienceEntryId = entry.id;
    this.entries.push(entry);

    // Flush if buffer is full
    if (this.entries.length >= this.maxBuffer) {
      await this.flush();
    }

    return query;
  }

  /**
   * Post-request hook - log action and evaluate ethics
   */
  async postRequest(content, response, query, options) {
    if (!this.enabled) return content;

    const entryId = options?._conscienceEntryId;
    const entry = this.entries.find(e => e.id === entryId);

    if (entry) {
      // Update entry with response data
      entry.phase = 'action';
      entry.response = {
        tier: response.tier,
        tierName: response.tierName,
        model: response.model,
        tokens: response.tokens,
        cost: response.cost,
        latencyMs: response.latencyMs,
        cached: response.cached
      };

      // Evaluate ethics
      entry.ethicsScore = this.evaluateEthics(query, content, response);
    }

    return content;
  }

  /**
   * Record impact (called after user interaction)
   */
  recordImpact(entryId, impact) {
    const entry = this.entries.find(e => e.id === entryId);

    if (entry) {
      entry.phase = 'impact';
      entry.impact = {
        outcome: impact.outcome, // positive, neutral, negative
        userFeedback: impact.userFeedback,
        measuredAt: new Date().toISOString(),
        metrics: impact.metrics || {}
      };
    }

    return entry;
  }

  /**
   * Evaluate ethics of a response
   */
  evaluateEthics(query, response, metadata) {
    let score = 0.5; // Neutral baseline

    // Data minimization: Did we collect only what's needed?
    const dataMinimization = this.evaluateDataMinimization(query);
    score += dataMinimization * this.ethicsWeights.dataMinimization;

    // Reversibility: Can this action be undone?
    const reversibility = this.evaluateReversibility(response);
    score += reversibility * this.ethicsWeights.reversibility;

    // Transparency: Is the reasoning clear?
    const transparency = this.evaluateTransparency(response);
    score += transparency * this.ethicsWeights.transparency;

    // User benefit: Does this help the user?
    const userBenefit = this.evaluateUserBenefit(query, response);
    score += userBenefit * this.ethicsWeights.userBenefit;

    // No harm: Does this avoid harm?
    const noHarm = this.evaluateNoHarm(response);
    score += noHarm * this.ethicsWeights.noHarm;

    return {
      overall: Math.min(1, Math.max(0, score)),
      breakdown: {
        dataMinimization,
        reversibility,
        transparency,
        userBenefit,
        noHarm
      }
    };
  }

  evaluateDataMinimization(query) {
    // Check if query contains unnecessary PII
    const piiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{16}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/ // Email
    ];

    const hasPii = piiPatterns.some(p => p.test(query));
    return hasPii ? 0.3 : 1.0;
  }

  evaluateReversibility(response) {
    // Check if response suggests irreversible actions
    const irreversiblePatterns = [
      /delete\s+(permanently|forever)/i,
      /cannot\s+be\s+(undone|reversed)/i,
      /irreversible/i
    ];

    const isIrreversible = irreversiblePatterns.some(p => p.test(response));
    return isIrreversible ? 0.4 : 1.0;
  }

  evaluateTransparency(response) {
    // Check for explanation and reasoning
    const hasExplanation = response.length > 100;
    const hasDisclaimer = /note:|disclaimer:|important:/i.test(response);
    const hasUncertainty = /might|could|possibly|I think/i.test(response);

    let score = 0.5;
    if (hasExplanation) score += 0.2;
    if (hasDisclaimer) score += 0.2;
    if (hasUncertainty) score += 0.1; // Honest about uncertainty

    return Math.min(1, score);
  }

  evaluateUserBenefit(query, response) {
    // Check if response is helpful
    const isHelpful = response.length > 50;
    const answersQuestion = !response.includes("I can't") && !response.includes("I cannot");
    const isActionable = /you can|try|consider|recommend/i.test(response);

    let score = 0.5;
    if (isHelpful) score += 0.2;
    if (answersQuestion) score += 0.2;
    if (isActionable) score += 0.1;

    return Math.min(1, score);
  }

  evaluateNoHarm(response) {
    // Check for harmful content
    const harmfulPatterns = [
      /harm|hurt|damage|destroy/i,
      /illegal|unlawful/i,
      /dangerous|risky/i
    ];

    const potentiallyHarmful = harmfulPatterns.some(p => p.test(response));
    return potentiallyHarmful ? 0.6 : 1.0; // Only slight penalty for discussion
  }

  /**
   * Sanitize query for logging (remove PII)
   */
  sanitizeQuery(query) {
    return query
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{16}\b/g, '[CARD]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{10,}\b/g, '[PHONE]');
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `conscience_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Flush entries to ledger
   */
  async flush() {
    if (this.entries.length === 0) return;

    // In production, would write to SQLite conscience ledger
    console.log(`[Conscience] Flushing ${this.entries.length} entries`);

    // Clear buffer
    const flushed = [...this.entries];
    this.entries = [];

    return flushed;
  }

  /**
   * Get pending entries
   */
  getPending() {
    return [...this.entries];
  }

  /**
   * Get statistics
   */
  getStats() {
    const avgEthics = this.entries.reduce((sum, e) =>
      sum + (e.ethicsScore?.overall || 0), 0) / (this.entries.length || 1);

    return {
      pendingEntries: this.entries.length,
      avgEthicsScore: avgEthics,
      enabled: this.enabled
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  ConsciencePlugin
};
