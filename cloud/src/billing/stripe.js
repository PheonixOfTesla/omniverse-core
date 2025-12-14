/**
 * OMNIVERSE BILLING SERVICE
 *
 * Stripe integration for premium sync tier
 * $9.99/month or $99/year
 *
 * "Core is free. Sync is premium."
 */

// ═══════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════

const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
    amount: 999, // $9.99
    interval: 'month',
    name: 'Omniverse Sync - Monthly'
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID,
    amount: 9900, // $99.00 (2 months free)
    interval: 'year',
    name: 'Omniverse Sync - Yearly'
  }
};

// ═══════════════════════════════════════════════════════════════
// BILLING SERVICE
// ═══════════════════════════════════════════════════════════════

class BillingService {
  constructor(stripeKey) {
    this.stripe = stripeKey ? require('stripe')(stripeKey) : null;
    this.subscriptions = new Map(); // In-memory for demo
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  isConfigured() {
    return !!this.stripe;
  }

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(userId, plan = 'monthly') {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    const planConfig = PLANS[plan];
    if (!planConfig) {
      throw new Error('Invalid plan');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/billing/cancel`,
      metadata: {
        userId,
        plan
      },
      subscription_data: {
        metadata: {
          userId,
          plan
        }
      }
    });

    return session;
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload, signature) {
    if (!this.stripe || !this.webhookSecret) {
      throw new Error('Stripe webhook not configured');
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { userId, plan } = session.metadata;
        await this.activateSubscription(userId, session.subscription, plan);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const { userId } = subscription.metadata;
        await this.updateSubscription(userId, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { userId } = subscription.metadata;
        await this.deactivateSubscription(userId);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        // Handle failed payment
        console.warn('Payment failed for invoice:', invoice.id);
        break;
      }
    }
  }

  /**
   * Activate subscription
   */
  async activateSubscription(userId, subscriptionId, plan) {
    this.subscriptions.set(userId, {
      subscriptionId,
      plan,
      status: 'active',
      activatedAt: new Date().toISOString(),
      expiresAt: null
    });

    console.log(`Subscription activated for ${userId}: ${plan}`);
  }

  /**
   * Update subscription status
   */
  async updateSubscription(userId, subscription) {
    const existing = this.subscriptions.get(userId);
    if (existing) {
      existing.status = subscription.status;
      existing.expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
    }
  }

  /**
   * Deactivate subscription
   */
  async deactivateSubscription(userId) {
    const existing = this.subscriptions.get(userId);
    if (existing) {
      existing.status = 'cancelled';
    }
    console.log(`Subscription deactivated for ${userId}`);
  }

  /**
   * Check if user has active subscription
   */
  async checkSubscription(userId) {
    const sub = this.subscriptions.get(userId);
    return sub && sub.status === 'active';
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(userId) {
    const sub = this.subscriptions.get(userId);

    if (!sub) {
      return {
        hasSubscription: false,
        plan: null,
        status: 'none'
      };
    }

    return {
      hasSubscription: sub.status === 'active',
      plan: sub.plan,
      status: sub.status,
      activatedAt: sub.activatedAt,
      expiresAt: sub.expiresAt
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId) {
    const sub = this.subscriptions.get(userId);

    if (!sub || !this.stripe) {
      throw new Error('No active subscription');
    }

    await this.stripe.subscriptions.update(sub.subscriptionId, {
      cancel_at_period_end: true
    });

    sub.status = 'cancelling';
    console.log(`Subscription cancellation scheduled for ${userId}`);
  }

  /**
   * Get revenue metrics
   */
  async getMetrics() {
    const active = Array.from(this.subscriptions.values())
      .filter(s => s.status === 'active');

    const monthly = active.filter(s => s.plan === 'monthly').length;
    const yearly = active.filter(s => s.plan === 'yearly').length;

    return {
      totalActive: active.length,
      monthlySubscribers: monthly,
      yearlySubscribers: yearly,
      mrr: (monthly * 9.99) + (yearly * 99 / 12),
      arr: (monthly * 9.99 * 12) + (yearly * 99)
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  BillingService,
  PLANS
};
