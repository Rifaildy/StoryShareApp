import NotificationHelper from "../../utils/notification-helper.js";

class NotificationSettingsPage {
  constructor() {
    this.notificationHelper = new NotificationHelper();
    this.isSubscribed = false;
  }

  getTemplate() {
    return `
      <article class="notification-settings-section" aria-labelledby="notification-heading">
        <h2 id="notification-heading" class="content__heading">
          <i class="fa-solid fa-bell"></i> Notification Settings
        </h2>
        
        <div class="settings-container">
          <div class="notification-status" id="notificationStatus">
            <div class="loading">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <p>Checking notification status...</p>
            </div>
          </div>

          <div class="notification-controls" id="notificationControls" style="display: none;">
            <div class="control-group">
              <h3 class="control-heading">
                <i class="fa-solid fa-toggle-on"></i> Push Notifications
              </h3>
              <p class="control-description">
                Get notified about new stories and updates even when the app is closed.
              </p>
              
              <div class="control-actions">
                <button id="enableNotifications" class="button notification-button" style="display: none;">
                  <i class="fa-solid fa-bell"></i> Enable Notifications
                </button>
                <button id="disableNotifications" class="button notification-button danger" style="display: none;">
                  <i class="fa-solid fa-bell-slash"></i> Disable Notifications
                </button>
                <button id="testNotification" class="button notification-button secondary" style="display: none;">
                  <i class="fa-solid fa-vial"></i> Test Notification
                </button>
              </div>
            </div>

            <div class="control-group">
              <h3 class="control-heading">
                <i class="fa-solid fa-info-circle"></i> About Notifications
              </h3>
              <div class="info-content">
                <p>Push notifications help you stay updated with:</p>
                <ul>
                  <li><i class="fa-solid fa-book"></i> New stories from other users</li>
                  <li><i class="fa-solid fa-heart"></i> Interactions with your stories</li>
                  <li><i class="fa-solid fa-bullhorn"></i> Important app updates</li>
                </ul>
                
                <div class="browser-support" id="browserSupport">
                  <h4><i class="fa-solid fa-browser"></i> Browser Support</h4>
                  <p id="supportStatus">Checking browser compatibility...</p>
                </div>
              </div>
            </div>
          </div>

          <div class="back-navigation">
            <a href="#/home" class="back-link">
              <i class="fa-solid fa-arrow-left"></i> Back to Home
            </a>
          </div>
        </div>
      </article>
    `;
  }

  async afterRender() {
    await this.initializeNotificationSettings();
    this.setupEventListeners();
  }

  async initializeNotificationSettings() {
    try {
      const isSupported = await this.notificationHelper.init();

      if (!isSupported) {
        this.showUnsupportedMessage();
        return;
      }

      this.isSubscribed = await this.notificationHelper.isSubscribed();

      this.updateNotificationStatus();
      this.updateBrowserSupport();

      document.getElementById("notificationControls").style.display = "block";
      document.getElementById("notificationStatus").style.display = "none";
    } catch (error) {
      console.error("Error initializing notification settings:", error);
      this.showErrorMessage(error.message);
    }
  }

  updateNotificationStatus() {
    const enableButton = document.getElementById("enableNotifications");
    const disableButton = document.getElementById("disableNotifications");
    const testButton = document.getElementById("testNotification");

    if (this.isSubscribed) {
      enableButton.style.display = "none";
      disableButton.style.display = "inline-block";
      testButton.style.display = "inline-block";
    } else {
      enableButton.style.display = "inline-block";
      disableButton.style.display = "none";
      testButton.style.display = "none";
    }
  }

  updateBrowserSupport() {
    const supportStatus = document.getElementById("supportStatus");
    const permission = this.notificationHelper.getPermissionStatus();

    let statusText = "";
    let statusClass = "";

    switch (permission) {
      case "granted":
        statusText =
          '<i class="fa-solid fa-check-circle"></i> Notifications are enabled and working';
        statusClass = "support-granted";
        break;
      case "denied":
        statusText =
          '<i class="fa-solid fa-times-circle"></i> Notifications are blocked. Please enable them in browser settings.';
        statusClass = "support-denied";
        break;
      case "default":
        statusText =
          '<i class="fa-solid fa-question-circle"></i> Notification permission not yet requested';
        statusClass = "support-default";
        break;
      case "unsupported":
        statusText =
          '<i class="fa-solid fa-exclamation-triangle"></i> Push notifications are not supported in this browser';
        statusClass = "support-unsupported";
        break;
    }

    supportStatus.innerHTML = statusText;
    supportStatus.className = `support-status ${statusClass}`;
  }

  setupEventListeners() {
    const enableButton = document.getElementById("enableNotifications");
    const disableButton = document.getElementById("disableNotifications");
    const testButton = document.getElementById("testNotification");

    enableButton.addEventListener("click", () => this.enableNotifications());
    disableButton.addEventListener("click", () => this.disableNotifications());
    testButton.addEventListener("click", () => this.testNotification());
  }

  async enableNotifications() {
    const enableButton = document.getElementById("enableNotifications");

    try {
      enableButton.disabled = true;
      enableButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Enabling...';

      await this.notificationHelper.subscribeToPush();

      this.isSubscribed = true;
      this.updateNotificationStatus();
      this.updateBrowserSupport();

      this.showNotification("Notifications enabled successfully!", "success");

      setTimeout(() => {
        this.notificationHelper.showLocalNotification(
          "Welcome to StoryShare!",
          {
            body: "You will now receive notifications about new stories and updates.",
            icon: "/icons/icon-192x192.png",
          }
        );
      }, 1000);
    } catch (error) {
      console.error("Error enabling notifications:", error);
      this.showNotification(
        `Failed to enable notifications: ${error.message}`,
        "error"
      );
    } finally {
      enableButton.disabled = false;
      enableButton.innerHTML =
        '<i class="fa-solid fa-bell"></i> Enable Notifications';
    }
  }

  async disableNotifications() {
    const disableButton = document.getElementById("disableNotifications");

    try {
      disableButton.disabled = true;
      disableButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Disabling...';

      await this.notificationHelper.unsubscribeFromPush();

      this.isSubscribed = false;
      this.updateNotificationStatus();
      this.updateBrowserSupport();

      this.showNotification("Notifications disabled successfully!", "success");
    } catch (error) {
      console.error("Error disabling notifications:", error);
      this.showNotification(
        `Failed to disable notifications: ${error.message}`,
        "error"
      );
    } finally {
      disableButton.disabled = false;
      disableButton.innerHTML =
        '<i class="fa-solid fa-bell-slash"></i> Disable Notifications';
    }
  }

  async testNotification() {
    const testButton = document.getElementById("testNotification");

    try {
      testButton.disabled = true;
      testButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

      await this.notificationHelper.showLocalNotification("Test Notification", {
        body: "This is a test notification from StoryShare. If you can see this, notifications are working correctly!",
        icon: "/icons/icon-192x192.png",
        tag: "test-notification",
      });

      this.showNotification("Test notification sent!", "success");
    } catch (error) {
      console.error("Error sending test notification:", error);
      this.showNotification(
        `Failed to send test notification: ${error.message}`,
        "error"
      );
    } finally {
      testButton.disabled = false;
      testButton.innerHTML =
        '<i class="fa-solid fa-vial"></i> Test Notification';
    }
  }

  showUnsupportedMessage() {
    document.getElementById("notificationStatus").innerHTML = `
      <div class="error-container">
        <div class="error-icon"><i class="fa-solid fa-exclamation-triangle"></i></div>
        <h3>Notifications Not Supported</h3>
        <p>Your browser doesn't support push notifications. Please try using a modern browser like Chrome, Firefox, or Safari.</p>
      </div>
    `;
  }

  showErrorMessage(message) {
    document.getElementById("notificationStatus").innerHTML = `
      <div class="error-container">
        <div class="error-icon"><i class="fa-solid fa-times-circle"></i></div>
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="location.reload()" class="button">
          <i class="fa-solid fa-refresh"></i> Retry
        </button>
      </div>
    `;
  }

  showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fa-solid ${
        type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
      }"></i>
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
}

export default NotificationSettingsPage;
