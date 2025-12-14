/**
 * OMNIVERSE CLOUD WRAPPER
 *
 * Optional sync service for multi-device coordination
 * Core is FREE forever - this is the $9.99/mo premium tier
 *
 * "Sovereignty first. Sync second."
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

const { BillingService } = require('./billing/stripe');
const { SyncService } = require('./deploy/sync');
const { GenesisVerifier } = require('./verify/genesis');

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

// ═══════════════════════════════════════════════════════════════
// APP SETUP
// ═══════════════════════════════════════════════════════════════

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Services
const billing = new BillingService(STRIPE_KEY);
const sync = new SyncService();
const verifier = new GenesisVerifier();

// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireSubscription = async (req, res, next) => {
  const { userId } = req.user;

  const hasSubscription = await billing.checkSubscription(userId);
  if (!hasSubscription) {
    return res.status(402).json({
      error: 'Subscription required',
      upgradeUrl: '/api/billing/subscribe'
    });
  }

  next();
};

// ═══════════════════════════════════════════════════════════════
// ROUTES - PUBLIC
// ═══════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    services: {
      billing: billing.isConfigured(),
      sync: sync.isReady(),
      verify: verifier.isReady()
    }
  });
});

// Genesis verification
app.post('/api/verify/genesis', async (req, res) => {
  const { hash, version } = req.body;

  try {
    const result = await verifier.verifyRelease(hash, version);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - AUTH REQUIRED
// ═══════════════════════════════════════════════════════════════

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, deviceId, signature } = req.body;

  // Verify device signature (Ed25519)
  // In production, verify against registered device keys

  const token = jwt.sign(
    { userId: email, deviceId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, expiresIn: '7d' });
});

// Register device
app.post('/api/auth/register-device', authenticate, async (req, res) => {
  const { deviceId, publicKey, deviceType } = req.body;
  const { userId } = req.user;

  // Store device public key for future verification
  // In production, store in database

  res.json({
    deviceId,
    registered: true,
    userId
  });
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - SUBSCRIPTION REQUIRED
// ═══════════════════════════════════════════════════════════════

// Sync - Push changes
app.post('/api/sync/push', authenticate, requireSubscription, async (req, res) => {
  const { userId, deviceId } = req.user;
  const { changes, lastSyncTimestamp } = req.body;

  try {
    const result = await sync.push(userId, deviceId, changes, lastSyncTimestamp);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync - Pull changes
app.post('/api/sync/pull', authenticate, requireSubscription, async (req, res) => {
  const { userId, deviceId } = req.user;
  const { lastSyncTimestamp } = req.body;

  try {
    const changes = await sync.pull(userId, deviceId, lastSyncTimestamp);
    res.json({ changes, timestamp: Date.now() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sync status
app.get('/api/sync/status', authenticate, requireSubscription, async (req, res) => {
  const { userId } = req.user;

  const status = await sync.getStatus(userId);
  res.json(status);
});

// ═══════════════════════════════════════════════════════════════
// ROUTES - BILLING
// ═══════════════════════════════════════════════════════════════

// Create checkout session
app.post('/api/billing/subscribe', authenticate, async (req, res) => {
  const { userId } = req.user;
  const { plan } = req.body; // 'monthly' or 'yearly'

  try {
    const session = await billing.createCheckoutSession(userId, plan);
    res.json({ checkoutUrl: session.url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Webhook for Stripe events
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    await billing.handleWebhook(req.body, sig);
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get subscription status
app.get('/api/billing/status', authenticate, async (req, res) => {
  const { userId } = req.user;

  const status = await billing.getSubscriptionStatus(userId);
  res.json(status);
});

// Cancel subscription
app.post('/api/billing/cancel', authenticate, async (req, res) => {
  const { userId } = req.user;

  try {
    await billing.cancelSubscription(userId);
    res.json({ cancelled: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    OMNIVERSE CLOUD                            ║
║           Optional Sync Service v1.0.0                        ║
╠═══════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                                   ║
║  Billing: ${billing.isConfigured() ? 'Configured' : 'Not configured'}                                    ║
║  Sync: Ready                                                  ║
╚═══════════════════════════════════════════════════════════════╝

Core is FREE forever. This is the optional $9.99/mo sync tier.
  `);
});

module.exports = app;
