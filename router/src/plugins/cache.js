/**
 * OMNIVERSE CACHE PLUGIN
 *
 * Intelligent caching for AI responses
 * Reduces costs by caching common queries
 *
 * "Same question twice? Free the second time."
 */

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
// CACHE PLUGIN
// ═══════════════════════════════════════════════════════════════

class CachePlugin {
  constructor(options = {}) {
    this.cache = new Map();
    this.maxSize = options.maxSize || 1000;
    this.ttlMs = options.ttlMs || 3600000; // 1 hour default
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Generate cache key from query
   */
  generateKey(query, options = {}) {
    const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
    const data = JSON.stringify({ query: normalized, tier: options.forceTier });
    return crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
  }

  /**
   * Pre-request hook - check cache
   */
  async preRequest(query, options) {
    if (options.skipCache) {
      return query;
    }

    const key = this.generateKey(query, options);
    const cached = this.cache.get(key);

    if (cached && Date.now() < cached.expiresAt) {
      this.hits++;
      // Attach cached response to options for router to use
      options._cachedResponse = {
        content: cached.content,
        cached: true,
        cacheKey: key,
        cachedAt: cached.cachedAt
      };
    } else {
      this.misses++;
      if (cached) {
        // Expired, remove it
        this.cache.delete(key);
      }
    }

    return query;
  }

  /**
   * Post-request hook - store in cache
   */
  async postRequest(content, response, query, options) {
    if (options?.skipCache || response.cached) {
      return content;
    }

    const key = this.generateKey(query || '', options);

    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      content,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.ttlMs,
      tier: response.tier,
      tokens: response.tokens
    });

    return content;
  }

  /**
   * Evict oldest entries
   */
  evictOldest() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);

    // Remove oldest 10%
    const toRemove = Math.max(1, Math.floor(this.maxSize * 0.1));
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      estimatedSavings: this.hits * 0.001 // Rough estimate based on avg cost
    };
  }

  /**
   * Get cached entry
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Check if key exists and is valid
   */
  has(key) {
    const cached = this.cache.get(key);
    return cached && Date.now() < cached.expiresAt;
  }

  /**
   * Invalidate specific key
   */
  invalidate(key) {
    return this.cache.delete(key);
  }

  /**
   * Invalidate by pattern
   */
  invalidatePattern(pattern) {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }
}

// ═══════════════════════════════════════════════════════════════
// SEMANTIC CACHE (Advanced)
// ═══════════════════════════════════════════════════════════════

class SemanticCachePlugin extends CachePlugin {
  constructor(options = {}) {
    super(options);
    this.similarityThreshold = options.similarityThreshold || 0.85;
    this.embeddings = new Map(); // Store query embeddings
  }

  /**
   * Generate semantic key using simple word overlap
   * (In production, would use actual embeddings)
   */
  generateSemanticKey(query) {
    const words = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .sort();

    return words.join('_').slice(0, 64);
  }

  /**
   * Calculate simple similarity score
   */
  calculateSimilarity(words1, words2) {
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Find similar cached query
   */
  findSimilar(query) {
    const queryWords = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

    let bestMatch = null;
    let bestScore = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (cached.words) {
        const score = this.calculateSimilarity(queryWords, cached.words);
        if (score > bestScore && score >= this.similarityThreshold) {
          bestScore = score;
          bestMatch = { key, cached, score };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Pre-request with semantic matching
   */
  async preRequest(query, options) {
    if (options.skipCache) {
      return query;
    }

    // Try exact match first
    const exactKey = this.generateKey(query, options);
    const exactCached = this.cache.get(exactKey);

    if (exactCached && Date.now() < exactCached.expiresAt) {
      this.hits++;
      options._cachedResponse = {
        content: exactCached.content,
        cached: true,
        cacheType: 'exact'
      };
      return query;
    }

    // Try semantic match
    const similar = this.findSimilar(query);
    if (similar && Date.now() < similar.cached.expiresAt) {
      this.hits++;
      options._cachedResponse = {
        content: similar.cached.content,
        cached: true,
        cacheType: 'semantic',
        similarity: similar.score
      };
      return query;
    }

    this.misses++;
    return query;
  }

  /**
   * Post-request with word storage
   */
  async postRequest(content, response, query, options) {
    if (options?.skipCache || response.cached) {
      return content;
    }

    const key = this.generateKey(query || '', options);

    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    const words = (query || '').toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

    this.cache.set(key, {
      content,
      words,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.ttlMs,
      tier: response.tier,
      tokens: response.tokens
    });

    return content;
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  CachePlugin,
  SemanticCachePlugin
};
