/**
 * Offline Manager
 * Handles offline functionality and background sync
 */
import IDBHelper from "./idb-helper.js";
import StoryApi from "../data/story-api.js";

class OfflineManager {
  constructor() {
    this.idbHelper = new IDBHelper();
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.handleOffline();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineQueue();
      }
    });
  }

  async handleOnline() {
    console.log("App is back online");
    this.showConnectionStatus("online");
    await this.syncOfflineQueue();
  }

  handleOffline() {
    console.log("App is offline");
    this.showConnectionStatus("offline");
  }

  showConnectionStatus(status) {
    const existingIndicator = document.querySelector(".connection-status");
    if (existingIndicator) {
      existingIndicator.remove();
    }

    const indicator = document.createElement("div");
    indicator.className = `connection-status ${status}`;
    indicator.innerHTML =
      status === "online"
        ? '<i class="fa-solid fa-wifi"></i> Back online - Syncing data...'
        : '<i class="fa-solid fa-wifi-slash"></i> You are offline';

    document.body.appendChild(indicator);

    if (status === "online") {
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.remove();
        }
      }, 3000);
    }
  }

  async syncOfflineQueue() {
    try {
      const queue = await this.idbHelper.getOfflineQueue();

      if (queue.length === 0) return;

      console.log(`Syncing ${queue.length} offline operations...`);

      for (const operation of queue) {
        try {
          await this.processOfflineOperation(operation);
          await this.idbHelper.removeFromOfflineQueue(operation.id);
          console.log("Synced operation:", operation.type);
        } catch (error) {
          console.error("Failed to sync operation:", operation, error);
        }
      }

      if (queue.length > 0) {
        this.showSyncNotification("Offline data synced successfully!");
      }
    } catch (error) {
      console.error("Error syncing offline queue:", error);
    }
  }

  async processOfflineOperation(operation) {
    switch (operation.type) {
      case "ADD_STORY":
        return await StoryApi.addNewStory(operation.data);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  async addStoryOffline(formData) {
    const storyData = {
      description: formData.get("description"),
      photo: await this.formDataToBase64(formData.get("photo")),
      lat: formData.get("lat"),
      lon: formData.get("lon"),
    };

    await this.idbHelper.addToOfflineQueue({
      type: "ADD_STORY",
      data: formData,
      preview: storyData,
      timestamp: Date.now(),
    });
  }

  async formDataToBase64(file) {
    if (!file) return null;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  showSyncNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification success";
    notification.innerHTML = `
      <i class="fa-solid fa-check-circle"></i>
      <p>${message}</p>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://")
    );
  }

  getNetworkStatus() {
    return {
      online: this.isOnline,
      connection:
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection,
    };
  }
}

export default OfflineManager;
