class NotificationHelper {
  constructor() {
    this.vapidPublicKey =
      "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
    this.subscription = null;
  }

  isSupported() {
    return (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  }

  getPermissionStatus() {
    if (!this.isSupported()) {
      return "unsupported";
    }
    return Notification.permission;
  }

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

  async getSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Error getting subscription:", error);
      return null;
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const subscriptionJson = subscription.toJSON();

      const response = await fetch(
        "https://story-api.dicoding.dev/v1/notifications/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            endpoint: subscriptionJson.endpoint,
            keys: {
              p256dh: subscriptionJson.keys.p256dh,
              auth: subscriptionJson.keys.auth,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Subscription sent to server successfully:", result);
      return result;
    } catch (error) {
      console.error("Error sending subscription to server:", error);
      throw error;
    }
  }

  async removeSubscriptionFromServer(subscription) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        "https://story-api.dicoding.dev/v1/notifications/subscribe",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Subscription removed from server successfully:", result);
      return result;
    } catch (error) {
      console.error("Error removing subscription from server:", error);
      throw error;
    }
  }

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
