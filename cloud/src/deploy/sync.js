/**
 * OMNIVERSE SYNC SERVICE
 *
 * End-to-end encrypted sync between devices
 * All data encrypted client-side before transmission
 *
 * "We never see your data. Ever."
 */

// ═══════════════════════════════════════════════════════════════
// SYNC SERVICE
// ═══════════════════════════════════════════════════════════════

class SyncService {
  constructor() {
    // In-memory storage for demo
    // Production would use Redis/PostgreSQL
    this.syncData = new Map();
    this.deviceStates = new Map();
  }

  isReady() {
    return true;
  }

  /**
   * Push changes from a device
   * @param {string} userId - User ID
   * @param {string} deviceId - Device ID
   * @param {Array} changes - Encrypted change records
   * @param {number} lastSyncTimestamp - Client's last sync timestamp
   */
  async push(userId, deviceId, changes, lastSyncTimestamp) {
    const userKey = `user:${userId}`;
    const deviceKey = `${userKey}:device:${deviceId}`;

    // Get or create user's sync state
    let userSync = this.syncData.get(userKey);
    if (!userSync) {
      userSync = {
        changes: [],
        lastUpdated: 0
      };
      this.syncData.set(userKey, userSync);
    }

    // Check for conflicts
    const conflicts = [];
    const serverChanges = userSync.changes.filter(c => c.timestamp > lastSyncTimestamp);

    for (const clientChange of changes) {
      // Check if same record was modified on server
      const conflict = serverChanges.find(sc =>
        sc.collection === clientChange.collection &&
        sc.documentId === clientChange.documentId
      );

      if (conflict) {
        conflicts.push({
          clientChange,
          serverChange: conflict,
          resolution: 'server_wins' // Default strategy
        });
      } else {
        // Add change to server state
        userSync.changes.push({
          ...clientChange,
          deviceId,
          serverTimestamp: Date.now()
        });
      }
    }

    // Update timestamps
    userSync.lastUpdated = Date.now();

    // Update device state
    this.deviceStates.set(deviceKey, {
      lastPush: Date.now(),
      changeCount: changes.length
    });

    // Prune old changes (keep last 1000)
    if (userSync.changes.length > 1000) {
      userSync.changes = userSync.changes.slice(-1000);
    }

    return {
      accepted: changes.length - conflicts.length,
      conflicts,
      serverTimestamp: userSync.lastUpdated
    };
  }

  /**
   * Pull changes for a device
   * @param {string} userId - User ID
   * @param {string} deviceId - Device ID
   * @param {number} lastSyncTimestamp - Client's last sync timestamp
   */
  async pull(userId, deviceId, lastSyncTimestamp) {
    const userKey = `user:${userId}`;
    const userSync = this.syncData.get(userKey);

    if (!userSync) {
      return [];
    }

    // Get changes since last sync, excluding this device's changes
    const changes = userSync.changes.filter(c =>
      c.serverTimestamp > lastSyncTimestamp &&
      c.deviceId !== deviceId
    );

    // Update device state
    const deviceKey = `${userKey}:device:${deviceId}`;
    this.deviceStates.set(deviceKey, {
      ...this.deviceStates.get(deviceKey),
      lastPull: Date.now()
    });

    return changes;
  }

  /**
   * Get sync status for a user
   */
  async getStatus(userId) {
    const userKey = `user:${userId}`;
    const userSync = this.syncData.get(userKey);

    // Get all devices for this user
    const devices = [];
    for (const [key, state] of this.deviceStates.entries()) {
      if (key.startsWith(userKey)) {
        const deviceId = key.split(':device:')[1];
        devices.push({
          deviceId,
          ...state
        });
      }
    }

    return {
      totalChanges: userSync?.changes.length || 0,
      lastUpdated: userSync?.lastUpdated || null,
      devices,
      storageUsed: this.calculateStorageUsed(userId)
    };
  }

  /**
   * Calculate storage used by user
   */
  calculateStorageUsed(userId) {
    const userKey = `user:${userId}`;
    const userSync = this.syncData.get(userKey);

    if (!userSync) return 0;

    // Rough estimate: JSON stringify and count bytes
    const json = JSON.stringify(userSync.changes);
    return json.length;
  }

  /**
   * Clear sync data for a user (for deletion requests)
   */
  async clearUserData(userId) {
    const userKey = `user:${userId}`;
    this.syncData.delete(userKey);

    // Clear device states
    for (const key of this.deviceStates.keys()) {
      if (key.startsWith(userKey)) {
        this.deviceStates.delete(key);
      }
    }
  }

  /**
   * Get global statistics
   */
  getStats() {
    return {
      totalUsers: this.syncData.size,
      totalDevices: this.deviceStates.size,
      totalChanges: Array.from(this.syncData.values())
        .reduce((sum, u) => sum + u.changes.length, 0)
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// CHANGE RECORD FORMAT
// ═══════════════════════════════════════════════════════════════

/**
 * Change record structure (encrypted client-side):
 * {
 *   collection: string,    // e.g., "health", "goals"
 *   documentId: string,    // Unique document ID
 *   operation: "create" | "update" | "delete",
 *   data: string,          // Encrypted JSON
 *   timestamp: number,     // Client timestamp
 *   checksum: string       // SHA-256 of decrypted data
 * }
 *
 * We NEVER decrypt the data. Client handles all encryption.
 * We're just a dumb pipe with conflict detection.
 */

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  SyncService
};
