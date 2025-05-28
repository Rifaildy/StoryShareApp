import "regenerator-runtime";
import "./styles/main.css";
import "./styles/responsive.css";
import App from "./scripts/app";
import swRegister from "./scripts/utils/sw-register";
import AuthRepository from "./scripts/data/auth-repository";
import NotificationHelper from "./scripts/utils/notification-helper";
import AppShell from "./scripts/views/components/app-shell";
import OfflineManager from "./scripts/utils/offline-manager";

const appShell = new AppShell();
const authRepository = new AuthRepository();
const notificationHelper = new NotificationHelper();
const offlineManager = new OfflineManager();

appShell.init();

const app = new App({
  button: document.querySelector("#hamburgerButton"),
  drawer: document.querySelector("#navigationDrawer"),
  content: document.querySelector("#mainContent"),
  appShell: appShell,
  offlineManager: offlineManager,
});

let deferredPrompt;
const installButton = document.createElement("button");
installButton.className = "install-button";
installButton.innerHTML = '<i class="fa-solid fa-download"></i> Install App';
installButton.style.display = "none";

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("PWA install prompt available");
  e.preventDefault();
  deferredPrompt = e;

  installButton.style.display = "block";
  document.body.appendChild(installButton);
});

installButton.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);

    if (outcome === "accepted") {
      installButton.style.display = "none";
    }

    deferredPrompt = null;
  }
});

window.addEventListener("appinstalled", () => {
  console.log("PWA was installed");
  installButton.style.display = "none";

  if ("serviceWorker" in navigator && "Notification" in window) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification("Welcome to Rifaildy's StoryShare!", {
        body: "App installed successfully. You can now use Rifaildy's StoryShare offline!",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: "app-installed",
      });
    });
  }
});

window.addEventListener("hashchange", async () => {
  appShell.setLoadingState(true);

  try {
    if (document.startViewTransition) {
      await document.startViewTransition(async () => {
        await app.renderPage();
        updateAuthMenu();
      }).finished;
    } else {
      await app.renderPage();
      updateAuthMenu();
    }
  } finally {
    appShell.setLoadingState(false);
  }
});

window.addEventListener("load", async () => {
  appShell.setLoadingState(true);

  try {
    updateAuthMenu();

    if (document.startViewTransition) {
      await document.startViewTransition(async () => {
        await app.renderPage();
      }).finished;
    } else {
      await app.renderPage();
    }

    await swRegister();

    if (authRepository.isLoggedIn()) {
      try {
        await notificationHelper.init();
        console.log("Notification helper initialized");
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    }

    checkForUpdates();
  } catch (error) {
    console.error("Error during app initialization:", error);
  } finally {
    appShell.setLoadingState(false);
  }
});

const updateAuthMenu = () => {
  const authMenu = document.getElementById("authMenu");
  if (!authMenu) return;

  if (authRepository.isLoggedIn()) {
    const name = authRepository.getName();
    authMenu.innerHTML = `
      <div class="user-menu">
        <span class="user-name"><i class="fa-solid fa-user"></i> ${name}</span>
        <button id="logoutButton" class="logout-button"><i class="fa-solid fa-sign-out-alt"></i> Logout</button>
      </div>
    `;

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        authRepository.logout();
        updateAuthMenu();
        window.location.hash = "#/login";
      });
    }
  } else {
    authMenu.innerHTML = `<a href="#/login"><i class="fa-solid fa-sign-in-alt"></i> Login</a>`;
  }
};

async function checkForUpdates() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

      setInterval(() => {
        if (!document.hidden) {
          registration.update();
        }
      }, 30000);

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            showUpdateNotification();
          }
        });
      });
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  }
}

function showUpdateNotification() {
  const notification = document.createElement("div");
  notification.className = "update-notification";
  notification.innerHTML = `
    <div class="update-content">
      <i class="fa-solid fa-download"></i>
      <span>A new version is available!</span>
      <button id="updateButton" class="update-button">Update</button>
      <button id="dismissUpdate" class="dismiss-button">Later</button>
    </div>
  `;

  document.body.appendChild(notification);

  document.getElementById("updateButton").addEventListener("click", () => {
    window.location.reload();
  });

  document.getElementById("dismissUpdate").addEventListener("click", () => {
    notification.remove();
  });

  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 10000);
}

window.addEventListener("online", () => {
  appShell.hideOfflineIndicator();
});

window.addEventListener("offline", () => {
  appShell.showOfflineIndicator();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && navigator.onLine) {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if ("sync" in registration) {
          registration.sync.register("background-sync");
        }
      });
    }
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "BACKGROUND_SYNC") {
      console.log("Background sync completed");
      offlineManager.syncOfflineQueue();
    }
  });
}

if ("performance" in window) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType("navigation")[0];
      console.log(
        "App load time:",
        perfData.loadEventEnd - perfData.fetchStart,
        "ms"
      );
    }, 0);
  });
}

window.StoryShareApp = {
  appShell,
  authRepository,
  notificationHelper,
  offlineManager,
  app,
};
