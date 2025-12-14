/**
 * OMNIVERSE MODEL VERIFIER
 *
 * Verifies model responses for safety and compliance
 *
 * "Trust, but verify. Every response."
 */

// ═══════════════════════════════════════════════════════════════
// SAFETY PATTERNS
// ═══════════════════════════════════════════════════════════════

const BLOCKED_PATTERNS = [
  // Financial manipulation
  /\b(guarantee|guaranteed)\s+(return|profit|income)/i,
  /\b(get\s+rich\s+quick|easy\s+money|passive\s+income\s+scheme)/i,

  // Medical misinformation
  /\b(cure|cures)\s+(cancer|diabetes|covid|autism)/i,
  /\b(vaccine|vaccines?)\s+(cause|causes?|caused)\s+(autism|death)/i,

  // Harmful instructions
  /\b(how\s+to\s+make|instructions?\s+for)\s+(bomb|weapon|explosive)/i,
  /\b(suicide|self.?harm)\s+(method|instruction|guide)/i,

  // PII extraction attempts
  /\b(social\s+security|ssn|credit\s+card)\s*(number|#)/i,
  /\b(bank\s+account|routing)\s*(number|#)/i,
];

const WARNING_PATTERNS = [
  // Financial advice without disclaimer
  /\b(you\s+should\s+(invest|buy|sell))/i,
  /\b(this\s+stock\s+will)/i,

  // Medical advice without disclaimer
  /\b(you\s+should\s+(take|stop\s+taking))\s+\w+\s+(medication|medicine|drug)/i,
  /\b(don't\s+see\s+a\s+doctor|skip\s+your\s+(appointment|checkup))/i,

  // Overconfident claims
  /\b(100%|absolutely|definitely)\s+(will|guaranteed)/i,
  /\b(always|never)\s+(works?|fail)/i,
];

// ═══════════════════════════════════════════════════════════════
// VERIFIER CLASS
// ═══════════════════════════════════════════════════════════════

class ModelVerifier {
  constructor(options = {}) {
    this.strictMode = options.strictMode || false;
    this.logViolations = options.logViolations || true;
    this.customPatterns = options.customPatterns || [];
  }

  /**
   * Verify a model response
   * @param {string} response - Model response to verify
   * @returns {object} Verification result
   */
  verify(response) {
    const result = {
      safe: true,
      blocked: false,
      warnings: [],
      blockedPatterns: [],
      score: 1.0
    };

    // Check blocked patterns
    for (const pattern of [...BLOCKED_PATTERNS, ...this.customPatterns]) {
      if (pattern.test(response)) {
        result.blocked = true;
        result.safe = false;
        result.blockedPatterns.push(pattern.toString());
        result.score = 0;
      }
    }

    // Check warning patterns
    for (const pattern of WARNING_PATTERNS) {
      if (pattern.test(response)) {
        result.warnings.push({
          pattern: pattern.toString(),
          severity: 'warning'
        });
        result.score -= 0.1;
      }
    }

    // Ensure score is in valid range
    result.score = Math.max(0, Math.min(1, result.score));

    // In strict mode, warnings also block
    if (this.strictMode && result.warnings.length > 0) {
      result.safe = false;
    }

    // Log violations
    if (this.logViolations && (!result.safe || result.warnings.length > 0)) {
      console.warn('Model verification:', {
        safe: result.safe,
        blocked: result.blocked,
        warningCount: result.warnings.length,
        score: result.score
      });
    }

    return result;
  }

  /**
   * Sanitize a response (remove blocked content)
   * @param {string} response - Response to sanitize
   * @returns {string} Sanitized response
   */
  sanitize(response) {
    let sanitized = response;

    for (const pattern of BLOCKED_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[CONTENT REMOVED]');
    }

    return sanitized;
  }

  /**
   * Add custom blocked pattern
   * @param {RegExp} pattern - Pattern to block
   */
  addBlockedPattern(pattern) {
    this.customPatterns.push(pattern);
  }

  /**
   * Verify response includes required disclaimers
   * @param {string} response - Response to check
   * @param {string} domain - Domain (finance, health, etc.)
   * @returns {boolean} Whether disclaimers are present
   */
  hasDisclaimers(response, domain) {
    const disclaimers = {
      finance: [
        /not\s+financial\s+advice/i,
        /consult\s+(a\s+)?financial\s+(advisor|professional)/i,
        /for\s+informational\s+purposes/i
      ],
      health: [
        /not\s+medical\s+advice/i,
        /consult\s+(a\s+)?(doctor|physician|healthcare)/i,
        /seek\s+professional\s+(medical\s+)?advice/i
      ],
      legal: [
        /not\s+legal\s+advice/i,
        /consult\s+(a\s+)?(lawyer|attorney)/i,
        /for\s+general\s+information/i
      ]
    };

    const required = disclaimers[domain] || [];
    return required.some(pattern => pattern.test(response));
  }
}

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Quick verify function
 */
function verifyModel(response, options = {}) {
  const verifier = new ModelVerifier(options);
  return verifier.verify(response);
}

/**
 * Quick sanitize function
 */
function sanitizeResponse(response) {
  const verifier = new ModelVerifier();
  return verifier.sanitize(response);
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  ModelVerifier,
  verifyModel,
  sanitizeResponse,
  BLOCKED_PATTERNS,
  WARNING_PATTERNS
};
