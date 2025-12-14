/**
 * iOS NATIVE BRIDGE
 *
 * This module bridges iOS Capacitor plugins with the Phoenix backend
 * It automatically syncs native iOS data to the backend for AI processing
 *
 * Features:
 * - HealthKit → Backend recovery analysis
 * - Calendar → Context for scheduling
 * - Geolocation → Location-aware responses
 * - Contacts → Voice command contact resolution
 * - Device info → Battery, network context
 */

// Only import Capacitor plugins when running in native app
let HealthKit, Geolocation, Device, Contacts;
const isNative = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();

if (isNative) {
  // Dynamic imports for Capacitor - only in native environment
  Promise.all([
    import('capacitor-healthkit').then(m => HealthKit = m.HealthKit).catch(() => {}),
    import('@capacitor/geolocation').then(m => Geolocation = m.Geolocation).catch(() => {}),
    import('@capacitor/device').then(m => Device = m.Device).catch(() => {}),
    import('@capacitor-community/contacts').then(m => Contacts = m.Contacts).catch(() => {})
  ]).then(() => {
    console.log('[iOS Bridge] Capacitor plugins loaded');
  }).catch(err => {
    console.warn('[iOS Bridge] Some plugins failed to load:', err);
  });
} else {
  console.log('[iOS Bridge] Running in browser - native features disabled');
}

class iOSNativeBridge {
  constructor() {
    this.API_BASE_URL = window.PhoenixConfig?.API_BASE_URL || 'https://pal-backend-production.up.railway.app/api';
    this.healthKitSyncInterval = 15 * 60 * 1000; // Sync every 15 minutes
    this.locationUpdateInterval = 5 * 60 * 1000; // Update location every 5 minutes
    this.isInitialized = false;
    this.cachedContacts = null;
  }

  /**
   * INITIALIZE - Set up all iOS native integrations
   */
  async initialize() {
    if (this.isInitialized) return;

    // Skip initialization in browser - only run in native Capacitor app
    if (!isNative) {
      console.log('[iOS Bridge] Skipping - not running in native app');
      this.isInitialized = true;
      return;
    }

    console.log('[iOS Bridge] Initializing native integrations...');

    try {
      // Request all necessary permissions
      await this.requestPermissions();

      // Start periodic syncs
      this.startHealthKitSync();
      this.startLocationTracking();

      // Load contacts once
      await this.loadContacts();

      this.isInitialized = true;
      console.log('[iOS Bridge] ✅ All native integrations initialized');
    } catch (error) {
      console.error('[iOS Bridge] Initialization error:', error);
    }
  }

  /**
   * REQUEST PERMISSIONS - Request all iOS permissions upfront
   */
  async requestPermissions() {
    try {
      // Request HealthKit permissions
      try {
        await HealthKit.requestAuthorization({
          read: ['HKQuantityTypeIdentifierHeartRate', 'HKQuantityTypeIdentifierHeartRateVariability',
                 'HKCategoryTypeIdentifierSleepAnalysis', 'HKQuantityTypeIdentifierStepCount',
                 'HKQuantityTypeIdentifierActiveEnergyBurned', 'HKQuantityTypeIdentifierRestingEnergy'],
          write: ['HKQuantityTypeIdentifierStepCount', 'HKCategoryTypeIdentifierSleepAnalysis']
        });
        console.log('[iOS Bridge] ✅ HealthKit permissions granted');
      } catch (error) {
        console.warn('[iOS Bridge] HealthKit permissions denied:', error);
      }

      // Request Location permissions
      try {
        await Geolocation.requestPermissions();
        console.log('[iOS Bridge] ✅ Location permissions granted');
      } catch (error) {
        console.warn('[iOS Bridge] Location permissions denied:', error);
      }

      // Request Contacts permissions
      try {
        await Contacts.requestPermissions();
        console.log('[iOS Bridge] ✅ Contacts permissions granted');
      } catch (error) {
        console.warn('[iOS Bridge] Contacts permissions denied:', error);
      }

    } catch (error) {
      console.error('[iOS Bridge] Permission request error:', error);
    }
  }

  /**
   * HEALTHKIT SYNC - Sync health data to backend
   */
  async syncHealthKit() {
    try {
      console.log('[iOS Bridge] Syncing HealthKit data...');

      const token = localStorage.getItem('phoenixToken');
      if (!token) {
        console.warn('[iOS Bridge] No auth token, skipping HealthKit sync');
        return;
      }

      // Fetch latest health data from HealthKit
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get Heart Rate
      const heartRate = await HealthKit.querySampleType({
        sampleType: 'HKQuantityTypeIdentifierHeartRate',
        startDate: yesterday.toISOString(),
        endDate: now.toISOString(),
        limit: 1
      });

      // Get HRV
      const hrv = await HealthKit.querySampleType({
        sampleType: 'HKQuantityTypeIdentifierHeartRateVariability',
        startDate: yesterday.toISOString(),
        endDate: now.toISOString(),
        limit: 1
      });

      // Get Sleep
      const sleep = await HealthKit.querySampleType({
        sampleType: 'HKCategoryTypeIdentifierSleepAnalysis',
        startDate: yesterday.toISOString(),
        endDate: now.toISOString(),
        limit: 100
      });

      // Get Steps
      const steps = await HealthKit.querySampleType({
        sampleType: 'HKQuantityTypeIdentifierStepCount',
        startDate: yesterday.toISOString(),
        endDate: now.toISOString(),
        limit: 1
      });

      // Calculate sleep metrics
      const sleepAnalysis = this.processSleepData(sleep?.samples || []);

      // Build health data payload
      const healthData = {
        heartRate: {
          resting: heartRate?.samples?.[0]?.value || null
        },
        heartRateVariability: hrv?.samples?.[0]?.value || null,
        sleepAnalysis,
        steps: steps?.samples?.[0]?.value || 0,
        timestamp: new Date().toISOString()
      };

      // Send to backend
      const response = await fetch(`${this.API_BASE_URL}/ios/healthkit/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(healthData)
      });

      const result = await response.json();

      if (result.success) {
        console.log(`[iOS Bridge] ✅ HealthKit synced - Recovery: ${result.recoveryScore}%`);

        // Trigger haptic if low recovery
        if (result.shouldTriggerHaptic) {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          await Haptics.impact({ style: ImpactStyle.Heavy });
        }

        // Show notification if needed
        if (result.notificationText) {
          const { LocalNotifications } = await import('@capacitor/local-notifications');
          await LocalNotifications.schedule({
            notifications: [{
              title: 'Recovery Alert',
              body: result.notificationText,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) }
            }]
          });
        }

        return result;
      }
    } catch (error) {
      console.error('[iOS Bridge] HealthKit sync error:', error);
    }
  }

  /**
   * Process sleep data to get total sleep and deep sleep
   */
  processSleepData(samples) {
    let totalSleep = 0;
    let deepSleep = 0;

    samples.forEach(sample => {
      const duration = (new Date(sample.endDate) - new Date(sample.startDate)) / (1000 * 60 * 60); // hours

      if (sample.value === 'HKCategoryValueSleepAnalysisAsleep') {
        totalSleep += duration;
      } else if (sample.value === 'HKCategoryValueSleepAnalysisInBed') {
        deepSleep += duration;
      }
    });

    return {
      totalSleep: totalSleep.toFixed(2),
      deepSleep: deepSleep.toFixed(2)
    };
  }

  /**
   * START HEALTHKIT SYNC - Periodic background sync
   */
  startHealthKitSync() {
    // Sync immediately
    this.syncHealthKit();

    // Sync every 15 minutes
    setInterval(() => {
      this.syncHealthKit();
    }, this.healthKitSyncInterval);

    console.log('[iOS Bridge] HealthKit auto-sync started (every 15 min)');
  }

  /**
   * GET CURRENT LOCATION - Get user's current location
   */
  async getCurrentLocation() {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed
      };
    } catch (error) {
      console.error('[iOS Bridge] Location error:', error);
      return null;
    }
  }

  /**
   * SYNC LOCATION TO BACKEND
   */
  async syncLocation() {
    try {
      const token = localStorage.getItem('phoenixToken');
      if (!token) return;

      const location = await this.getCurrentLocation();
      if (!location) return;

      const response = await fetch(`${this.API_BASE_URL}/ios/location/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(location)
      });

      const result = await response.json();
      console.log('[iOS Bridge] Location synced:', result.context?.type || 'unknown');

      return result;
    } catch (error) {
      console.error('[iOS Bridge] Location sync error:', error);
    }
  }

  /**
   * START LOCATION TRACKING
   */
  startLocationTracking() {
    // Update immediately
    this.syncLocation();

    // Update every 5 minutes
    setInterval(() => {
      this.syncLocation();
    }, this.locationUpdateInterval);

    console.log('[iOS Bridge] Location tracking started (every 5 min)');
  }

  /**
   * LOAD CONTACTS - Cache all contacts for quick search
   */
  async loadContacts() {
    try {
      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true,
          emails: true
        }
      });

      this.cachedContacts = result.contacts;
      console.log(`[iOS Bridge] Loaded ${this.cachedContacts.length} contacts`);
    } catch (error) {
      console.error('[iOS Bridge] Failed to load contacts:', error);
    }
  }

  /**
   * SEARCH CONTACTS - Search for contact by name
   */
  async searchContact(query) {
    try {
      const token = localStorage.getItem('phoenixToken');
      if (!token || !this.cachedContacts) return null;

      const response = await fetch(`${this.API_BASE_URL}/ios/contacts/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          contacts: this.cachedContacts
        })
      });

      const result = await response.json();
      return result.exactMatch || result.matches[0] || null;
    } catch (error) {
      console.error('[iOS Bridge] Contact search error:', error);
      return null;
    }
  }

  /**
   * GET DEVICE INFO
   */
  async getDeviceInfo() {
    try {
      const info = await Device.getInfo();
      const battery = await Device.getBatteryInfo();

      return {
        platform: info.platform,
        model: info.model,
        osVersion: info.osVersion,
        manufacturer: info.manufacturer,
        batteryLevel: battery.batteryLevel,
        isCharging: battery.isCharging
      };
    } catch (error) {
      console.error('[iOS Bridge] Device info error:', error);
      return null;
    }
  }

  /**
   * BUILD UNIFIED CONTEXT - Collect all iOS native data for AI
   */
  async buildUnifiedContext() {
    try {
      const context = {};

      // Get location
      const location = await this.getCurrentLocation();
      if (location) context.location = location;

      // Get device info
      const device = await this.getDeviceInfo();
      if (device) context.device = device;

      // Note: HealthKit and Calendar are synced separately via periodic background tasks
      // This unified context is for real-time voice commands

      return context;
    } catch (error) {
      console.error('[iOS Bridge] Unified context error:', error);
      return {};
    }
  }

  /**
   * PROCESS VOICE COMMAND WITH iOS CONTEXT
   */
  async processVoiceCommand(command) {
    try {
      const token = localStorage.getItem('phoenixToken');
      if (!token) {
        console.error('[iOS Bridge] No auth token');
        return null;
      }

      // Build native context
      const nativeContext = await this.buildUnifiedContext();

      // Send to backend with native context
      const response = await fetch(`${this.API_BASE_URL}/ios/voice-command`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command,
          nativeContext
        })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('[iOS Bridge] Voice command error:', error);
      return null;
    }
  }
}

// Export singleton instance
const iosNativeBridge = new iOSNativeBridge();

// Auto-initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => iosNativeBridge.initialize());
} else {
  iosNativeBridge.initialize();
}

window.iosNativeBridge = iosNativeBridge;
export default iosNativeBridge;
