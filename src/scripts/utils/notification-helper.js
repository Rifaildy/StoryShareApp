/**
 * Notification Helper
 * Handles push notification subscription and management
 */
class NotificationHelper {
  constructor() {
    this.vapidPublicKey =
      "BN7-r0Svv7CsTi18-OPYtJLVW0bfuZ1x1UtrygczKjNzap6l4UVVsGTF1rqaYhQCLGpAJKSZXfciBe_EsqYH8eE"; // VAPID public key from Dicoding API
    this.subscription = null;
  }

  /**
   * Check if notifications are supported
   */
  isSupported() {
    return (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus() {
    if (!this.isSupported()) {
      return "unsupported";
    }
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error("Notifications are not supported in this browser");
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission === "denied") {
      throw new Error("Notification permission has been denied");
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error("Notification permission was not granted");
    }

    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush() {
    try {
      await this.requestPermission();

      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
        });
      }

      this.subscription = subscription;

      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        this.subscription = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      throw error;
    }
  }

  /**
   * Check if user is currently subscribed
   */
  async isSubscribed() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Error getting subscription:", error);
      return null;
    }
  }

  /**
   * Send subscription to server
   */
  async sendSubscriptionToServer(subscription) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        "https://story-api.dicoding.dev/v1/push/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Subscription sent to server successfully:", result);
      return result;
    } catch (error) {
      console.error("Error sending subscription to server:", error);
      throw error;
    }
  }

  /**
   * Remove subscription from server
   */
  async removeSubscriptionFromServer(subscription) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        "https://story-api.dicoding.dev/v1/push/unsubscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Subscription removed from server successfully:", result);
      return result;
    } catch (error) {
      console.error("Error removing subscription from server:", error);
      throw error;
    }
  }

  /**
   * Show a local notification (for testing)
   */
  async showLocalNotification(title, options = {}) {
    try {
      await this.requestPermission();

      const defaultOptions = {
        body: "This is a test notification",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: "local-notification",
        requireInteraction: false,
      };

      const notificationOptions = { ...defaultOptions, ...options };

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        return registration.showNotification(title, notificationOptions);
      } else {
        return new Notification(title, notificationOptions);
      }
    } catch (error) {
      console.error("Error showing local notification:", error);
      throw error;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Initialize notification helper
   */
  async init() {
    if (!this.isSupported()) {
      console.warn("Push notifications are not supported in this browser");
      return false;
    }

    try {
      const isSubscribed = await this.isSubscribed();
      if (isSubscribed) {
        this.subscription = await this.getSubscription();
        console.log("User is already subscribed to push notifications");
      }
      return true;
    } catch (error) {
      console.error("Error initializing notification helper:", error);
      return false;
    }
  }
}

export default NotificationHelper;
