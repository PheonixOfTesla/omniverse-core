/**
 * SIRI SHORTCUTS INTEGRATION
 *
 * Allows Phoenix to register custom Siri voice commands
 * Users can say "Hey Siri, [Phoenix command]" without opening the app
 */

class SiriShortcuts {
  constructor() {
    this.isAvailable = this.checkAvailability();
    this.shortcuts = [];
  }

  /**
   * Check if Siri Shortcuts are available
   */
  checkAvailability() {
    // Check if running on iOS with Capacitor
    if (window.Capacitor && window.Capacitor.getPlatform() === 'ios') {
      // Check iOS version (Siri Shortcuts require iOS 12+)
      const match = navigator.userAgent.match(/iPhone OS (\d+)_/);
      if (match && parseInt(match[1]) >= 12) {
        console.log('✅ Siri Shortcuts available');
        return true;
      }
    }
    console.log('⚠️ Siri Shortcuts not available on this device');
    return false;
  }

  /**
   * Donate a shortcut to Siri (makes it discoverable)
   */
  async donateShortcut(shortcutId, parameters = {}) {
    if (!this.isAvailable) {
      console.warn('Siri Shortcuts not available');
      return false;
    }

    try {
      // Call Capacitor plugin to donate shortcut
      const { SiriShortcuts } = await import('@capacitor-community/siri-shortcuts');

      await SiriShortcuts.donate({
        persistentIdentifier: shortcutId,
        title: this.getShortcutTitle(shortcutId),
        suggestedInvocationPhrase: this.getSuggestedPhrase(shortcutId),
        userInfo: parameters,
        isEligibleForSearch: true,
        isEligibleForPrediction: true
      });

      console.log(`✅ Donated shortcut: ${shortcutId}`);
      return true;

    } catch (error) {
      console.error('Failed to donate shortcut:', error);
      return false;
    }
  }

  /**
   * Register all common Phoenix shortcuts
   */
  async registerCommonShortcuts() {
    const shortcuts = [
      'phoenix-book-ride',
      'phoenix-order-food',
      'phoenix-log-workout',
      'phoenix-make-reservation',
      'phoenix-daily-summary',
      'phoenix-check-recovery'
    ];

    for (const shortcutId of shortcuts) {
      await this.donateShortcut(shortcutId);
    }

    console.log('✅ All common shortcuts registered');
  }

  /**
   * Donate shortcut when user completes an action
   * This makes Siri learn user patterns
   */
  async donateAfterAction(action, params) {
    const shortcutMap = {
      'book-ride': 'phoenix-book-ride',
      'order-food': 'phoenix-order-food',
      'log-workout': 'phoenix-log-workout',
      'make-reservation': 'phoenix-make-reservation'
    };

    const shortcutId = shortcutMap[action];
    if (shortcutId) {
      await this.donateShortcut(shortcutId, params);
    }
  }

  /**
   * Get shortcut title
   */
  getShortcutTitle(shortcutId) {
    const titles = {
      'phoenix-book-ride': 'Book a Ride with Phoenix',
      'phoenix-order-food': 'Order Food with Phoenix',
      'phoenix-log-workout': 'Log Workout to Phoenix',
      'phoenix-make-reservation': 'Make Reservation via Phoenix',
      'phoenix-call-contact': 'Call Someone via Phoenix',
      'phoenix-send-message': 'Send Message via Phoenix',
      'phoenix-daily-summary': 'Get Daily Summary from Phoenix',
      'phoenix-optimize-schedule': 'Optimize My Schedule',
      'phoenix-check-recovery': 'Check My Recovery Status',
      'phoenix-emergency-butler': 'Emergency Butler Help'
    };

    return titles[shortcutId] || 'Phoenix Command';
  }

  /**
   * Get suggested Siri phrase
   */
  getSuggestedPhrase(shortcutId) {
    const phrases = {
      'phoenix-book-ride': 'Phoenix, book me a ride',
      'phoenix-order-food': 'Phoenix, order my usual',
      'phoenix-log-workout': 'Phoenix, I finished my workout',
      'phoenix-make-reservation': 'Phoenix, make a dinner reservation',
      'phoenix-call-contact': 'Phoenix, call',
      'phoenix-send-message': 'Phoenix, send a message',
      'phoenix-daily-summary': 'Phoenix, what's my day look like',
      'phoenix-optimize-schedule': 'Phoenix, optimize my schedule',
      'phoenix-check-recovery': 'Phoenix, how's my recovery',
      'phoenix-emergency-butler': 'Phoenix, help me'
    };

    return phrases[shortcutId] || 'Hey Phoenix';
  }

  /**
   * Request Siri authorization
   */
  async requestAuthorization() {
    if (!this.isAvailable) {
      return false;
    }

    try {
      const { SiriShortcuts } = await import('@capacitor-community/siri-shortcuts');
      const result = await SiriShortcuts.requestAuthorization();

      if (result.status === 'granted') {
        console.log('✅ Siri Shortcuts authorized');
        return true;
      } else {
        console.warn('⚠️ Siri Shortcuts authorization denied');
        return false;
      }

    } catch (error) {
      console.error('Siri authorization error:', error);
      return false;
    }
  }

  /**
   * Present "Add to Siri" UI
   */
  async presentAddToSiri(shortcutId) {
    if (!this.isAvailable) {
      return;
    }

    try {
      const { SiriShortcuts } = await import('@capacitor-community/siri-shortcuts');

      await SiriShortcuts.present({
        persistentIdentifier: shortcutId,
        title: this.getShortcutTitle(shortcutId),
        suggestedInvocationPhrase: this.getSuggestedPhrase(shortcutId)
      });

    } catch (error) {
      console.error('Failed to present Add to Siri:', error);
    }
  }

  /**
   * Handle incoming Siri intent
   */
  handleIntent(intent) {
    console.log('🎤 Siri intent received:', intent);

    const { identifier, parameters } = intent;

    // Route to appropriate handler
    switch (identifier) {
      case 'phoenix-book-ride':
        return this.handleBookRide(parameters);

      case 'phoenix-order-food':
        return this.handleOrderFood(parameters);

      case 'phoenix-log-workout':
        return this.handleLogWorkout(parameters);

      case 'phoenix-make-reservation':
        return this.handleMakeReservation(parameters);

      case 'phoenix-call-contact':
        return this.handleCallContact(parameters);

      case 'phoenix-send-message':
        return this.handleSendMessage(parameters);

      case 'phoenix-daily-summary':
        return this.handleDailySummary();

      case 'phoenix-check-recovery':
        return this.handleCheckRecovery();

      default:
        console.warn('Unknown intent:', identifier);
    }
  }

  /**
   * Intent Handlers
   */
  async handleBookRide(params) {
    const { destination, provider } = params;
    console.log(`📱 Booking ride to ${destination} via ${provider}`);

    // Call Phoenix API
    const response = await fetch('https://pal-backend-production.up.railway.app/api/phoenix/butler/ride', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ destination, provider })
    });

    const data = await response.json();
    return data.message || 'Ride booked successfully!';
  }

  async handleOrderFood(params) {
    const { restaurant, reorder } = params;
    console.log(`🍕 Ordering food from ${restaurant || 'your favorite place'}`);

    const response = await fetch('https://pal-backend-production.up.railway.app/api/phoenix/butler/food/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ restaurant, reorder })
    });

    const data = await response.json();
    return data.message || 'Food ordered!';
  }

  async handleLogWorkout(params) {
    const { type, duration } = params;
    console.log(`💪 Logging ${type || 'general'} workout`);

    const response = await fetch('https://pal-backend-production.up.railway.app/api/venus/workouts/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ type, duration, source: 'siri' })
    });

    const data = await response.json();
    return 'Workout logged! Great job! 💪';
  }

  async handleMakeReservation(params) {
    const { restaurant, time, partySize } = params;

    const response = await fetch('https://pal-backend-production.up.railway.app/api/phoenix/butler/reservation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({ restaurant, time, partySize })
    });

    const data = await response.json();
    return `Reservation confirmed at ${restaurant}!`;
  }

  async handleDailySummary() {
    const response = await fetch('https://pal-backend-production.up.railway.app/api/phoenix/daily-summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    const data = await response.json();
    return data.summary || 'Your day is looking good!';
  }

  async handleCheckRecovery() {
    const response = await fetch('https://pal-backend-production.up.railway.app/api/mercury/recovery/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`
      }
    });

    const data = await response.json();
    return `Your HRV is ${data.hrv}. Recovery status: ${data.status}`;
  }

  /**
   * Get auth token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('phoenix-auth-token') || '';
  }
}

// Export singleton
const siriShortcuts = new SiriShortcuts();
window.siriShortcuts = siriShortcuts;

export default siriShortcuts;
