/**
 * OMNIVERSE SMART ROUTER
 *
 * Routes AI queries to the optimal model:
 * - TIER 0: Kimi K2 (FREE via OpenRouter) - DEFAULT
 * - TIER 1: Gemini Flash (fallback)
 * - TIER 2: Claude Haiku (complex reasoning)
 * - TIER 3: Claude Sonnet (deep analysis)
 * - TIER 4: GPT-5 (mission critical)
 *
 * "Intelligence routing that respects your wallet."
 */

const { verifyModel } = require('./verifier');

// ═══════════════════════════════════════════════════════════════
// TIER DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const TIERS = {
  0: {
    name: 'kimi',
    model: 'moonshotai/kimi-k2',
    provider: 'openrouter',
    costPer1M: 0.00,
    latencyMs: 500,
    description: 'Kimi K2 - FREE tier, handles 95%+ of queries'
  },
  1: {
    name: 'gemini',
    model: 'google/gemini-2.0-flash-exp:free',
    provider: 'openrouter',
    costPer1M: 0.00,
    latencyMs: 800,
    description: 'Gemini Flash - FREE fallback'
  },
  2: {
    name: 'haiku',
    model: 'anthropic/claude-3-5-haiku',
    provider: 'openrouter',
    costPer1M: 1.00,
    latencyMs: 2000,
    description: 'Claude Haiku - complex reasoning'
  },
  3: {
    name: 'sonnet',
    model: 'anthropic/claude-sonnet-4-20250514',
    provider: 'openrouter',
    costPer1M: 3.00,
    latencyMs: 4000,
    description: 'Claude Sonnet - deep analysis'
  },
  4: {
    name: 'opus',
    model: 'anthropic/claude-opus-4',
    provider: 'openrouter',
    costPer1M: 15.00,
    latencyMs: 8000,
    description: 'Claude Opus - mission critical'
  }
};

// ═══════════════════════════════════════════════════════════════
// ROUTER CLASS
// ═══════════════════════════════════════════════════════════════

class OmniverseRouter {
  constructor(config = {}) {
    this.openrouterKey = config.openrouterKey || process.env.OPENROUTER_API_KEY;
    this.defaultTier = config.defaultTier || 0; // Kimi K2 by default
    this.maxRetries = config.maxRetries || 2;
    this.timeout = config.timeout || 30000;

    // Statistics
    this.stats = {
      totalRequests: 0,
      tierUsage: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
      totalCost: 0,
      avgLatency: 0,
      errors: 0
    };

    // Plugin system
    this.plugins = [];
  }

  /**
   * Route a query to the optimal model
   * @param {string} query - User query
   * @param {object} options - Routing options
   * @returns {Promise<object>} Response with content and metadata
   */
  async route(query, options = {}) {
    const startTime = Date.now();
    this.stats.totalRequests++;

    // Determine tier based on query complexity
    const tier = options.forceTier ?? this.determineTier(query, options);
    const tierConfig = TIERS[tier];

    this.stats.tierUsage[tier]++;

    try {
      // Run pre-request plugins
      for (const plugin of this.plugins) {
        if (plugin.preRequest) {
          query = await plugin.preRequest(query, options);
        }
      }

      // Make the request
      const response = await this.callModel(tierConfig, query, options);

      // Calculate cost
      const tokens = response.usage?.total_tokens || 0;
      const cost = (tokens / 1000000) * tierConfig.costPer1M;
      this.stats.totalCost += cost;

      // Update latency
      const latency = Date.now() - startTime;
      this.stats.avgLatency = (this.stats.avgLatency + latency) / 2;

      // Run post-request plugins
      let content = response.content;
      for (const plugin of this.plugins) {
        if (plugin.postRequest) {
          content = await plugin.postRequest(content, response);
        }
      }

      return {
        content,
        tier,
        tierName: tierConfig.name,
        model: tierConfig.model,
        tokens,
        cost,
        latencyMs: latency,
        cached: response.cached || false
      };

    } catch (error) {
      this.stats.errors++;

      // Fallback to next tier if available
      if (tier < 4 && options.allowFallback !== false) {
        console.warn(`Tier ${tier} failed, falling back to tier ${tier + 1}`);
        return this.route(query, { ...options, forceTier: tier + 1 });
      }

      throw error;
    }
  }

  /**
   * Determine optimal tier for a query
   */
  determineTier(query, options) {
    // Check user preference
    if (options.preferredTier !== undefined) {
      return options.preferredTier;
    }

    const queryLength = query.length;
    const hasCode = /```|function|class|const|let|var|import|export/i.test(query);
    const isComplex = /analyze|compare|design|architect|strategy/i.test(query);
    const isCritical = /critical|urgent|important|financial|legal/i.test(query);

    // Tier selection logic
    if (isCritical) return 4; // Opus for critical
    if (isComplex && hasCode) return 3; // Sonnet for complex code
    if (isComplex) return 2; // Haiku for complex reasoning
    if (queryLength > 5000) return 1; // Gemini for long context
    return 0; // Kimi K2 for everything else (95%+)
  }

  /**
   * Call the model via OpenRouter
   */
  async callModel(tierConfig, query, options) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://omniverse.ai',
        'X-Title': 'Omniverse'
      },
      body: JSON.stringify({
        model: tierConfig.model,
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: query }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096
      }),
      signal: AbortSignal.timeout(this.timeout)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Model call failed: ${response.status} ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
      model: data.model,
      cached: data.cached || false
    };
  }

  /**
   * Register a plugin
   */
  use(plugin) {
    this.plugins.push(plugin);
    return this;
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      ...this.stats,
      costBreakdown: Object.entries(this.stats.tierUsage).map(([tier, count]) => ({
        tier: parseInt(tier),
        name: TIERS[tier].name,
        requests: count,
        estimatedCost: (count * 1000 / 1000000) * TIERS[tier].costPer1M // Assume 1000 tokens avg
      }))
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      tierUsage: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
      totalCost: 0,
      avgLatency: 0,
      errors: 0
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  OmniverseRouter,
  TIERS,
  verifyModel
};
