import CONFIG from "../scripts/globals/config.js";

const CACHE_NAME = CONFIG.CACHE_NAME;
const urlsToCache = [
  "/",
  "/index.html",
  "/app.bundle.js",
  "/manifest.json",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching files");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("Service Worker: Installed successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error);
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activated successfully");
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (!event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request)
          .then((fetchResponse) => {
            if (
              !fetchResponse ||
              fetchResponse.status !== 200 ||
              fetchResponse.type !== "basic"
            ) {
              return fetchResponse;
            }

            const responseToCache = fetchResponse.clone();

            if (
              event.request.url.includes(".css") ||
              event.request.url.includes(".js") ||
              event.request.url.includes(".png") ||
              event.request.url.includes(".jpg") ||
              event.request.url.includes(".jpeg") ||
              event.request.url.includes(".gif") ||
              event.request.url.includes(".svg")
            ) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }

            return fetchResponse;
          })
          .catch(() => {
            if (event.request.mode === "navigate") {
              return caches.match("/index.html");
            }
          })
      );
    })
  );
});

self.addEventListener("push", (event) => {
  console.log("Service Worker: Push event received", event);

  let notificationData = {
    title: "StoryShare",
    body: "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "storyshare-notification",
    data: {
      url: "/",
    },
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
      };
    } catch (error) {
      console.error("Error parsing push data:", error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: [
        {
          action: "open",
          title: "Open App",
          icon: "/icons/icon-72x72.png",
        },
        {
          action: "close",
          title: "Close",
          icon: "/icons/icon-72x72.png",
        },
      ],
      requireInteraction: false,
      silent: false,
    }
  );

  event.waitUntil(promiseChain);
});

self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true,
    })
    .then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    });

  event.waitUntil(promiseChain);
});

self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event);

  if (event.tag === "background-sync") {
    event.waitUntil(
      Promise.resolve()
    );
  }
});

self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  event.ports[0].postMessage({
    type: "SW_RESPONSE",
    message: "Message received by service worker",
  });
});
