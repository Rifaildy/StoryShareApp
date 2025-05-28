class IDBHelper {
  constructor() {
    this.dbName = "storyshare-db";
    this.dbVersion = 2; // Increment version to trigger upgrade
    this.storiesStore = "stories";
    this.storyDetailsStore = "story-details";
    this.offlineQueueStore = "offline-queue";
    this.favoritesStore = "favorites";
    this.dbPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      // Delete existing database to ensure clean state
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);

      deleteRequest.onsuccess = () => {
        console.log("Old database deleted successfully");
        this.createDatabase(resolve, reject);
      };

      deleteRequest.onerror = () => {
        console.log("No existing database to delete, creating new one");
        this.createDatabase(resolve, reject);
      };
    });
  }

  createDatabase(resolve, reject) {
    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log("IndexedDB opened successfully");
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      console.log("IndexedDB upgrade needed");
      const db = event.target.result;

      // Create stories store
      if (!db.objectStoreNames.contains(this.storiesStore)) {
        const storiesStore = db.createObjectStore(this.storiesStore, {
          keyPath: "id",
        });
        storiesStore.createIndex("createdAt", "createdAt");
        console.log("Created stories store");
      }

      // Create story details store
      if (!db.objectStoreNames.contains(this.storyDetailsStore)) {
        db.createObjectStore(this.storyDetailsStore, {
          keyPath: "id",
        });
        console.log("Created story details store");
      }

      // Create offline queue store
      if (!db.objectStoreNames.contains(this.offlineQueueStore)) {
        const queueStore = db.createObjectStore(this.offlineQueueStore, {
          keyPath: "id",
          autoIncrement: true,
        });
        queueStore.createIndex("timestamp", "timestamp");
        queueStore.createIndex("type", "type");
        console.log("Created offline queue store");
      }

      // Create favorites store
      if (!db.objectStoreNames.contains(this.favoritesStore)) {
        const favoritesStore = db.createObjectStore(this.favoritesStore, {
          keyPath: "id",
        });
        favoritesStore.createIndex("addedAt", "addedAt");
        console.log("Created favorites store");
      }
    };
  }

  async saveStories(stories) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storiesStore], "readwrite");
      const store = transaction.objectStore(this.storiesStore);

      // Clear existing stories
      await this.clearStore(store);

      // Add new stories
      for (const story of stories) {
        await this.putData(store, {
          ...story,
          cachedAt: Date.now(),
        });
      }

      await this.completeTransaction(transaction);
      console.log("Stories saved to IndexedDB:", stories.length);
      return true;
    } catch (error) {
      console.error("Error saving stories:", error);
      throw error;
    }
  }

  async getStories() {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storiesStore], "readonly");
      const store = transaction.objectStore(this.storiesStore);
      const stories = await this.getAllData(store);
      console.log("Retrieved stories from IndexedDB:", stories.length);
      return stories;
    } catch (error) {
      console.error("Error getting stories:", error);
      return [];
    }
  }

  async saveStoryDetail(story) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storyDetailsStore], "readwrite");
      const store = transaction.objectStore(this.storyDetailsStore);

      await this.putData(store, {
        ...story,
        cachedAt: Date.now(),
      });

      await this.completeTransaction(transaction);
      console.log("Story detail saved to IndexedDB:", story.id);
      return true;
    } catch (error) {
      console.error("Error saving story detail:", error);
      throw error;
    }
  }

  async getStoryDetail(id) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.storyDetailsStore], "readonly");
      const store = transaction.objectStore(this.storyDetailsStore);
      const story = await this.getData(store, id);
      console.log("Retrieved story detail from IndexedDB:", id);
      return story;
    } catch (error) {
      console.error("Error getting story detail:", error);
      return null;
    }
  }

  async addToOfflineQueue(operation) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.offlineQueueStore], "readwrite");
      const store = transaction.objectStore(this.offlineQueueStore);

      await this.addData(store, {
        ...operation,
        timestamp: Date.now(),
      });

      await this.completeTransaction(transaction);
      console.log("Added to offline queue:", operation.type);
      return true;
    } catch (error) {
      console.error("Error adding to offline queue:", error);
      throw error;
    }
  }

  async getOfflineQueue() {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.offlineQueueStore], "readonly");
      const store = transaction.objectStore(this.offlineQueueStore);
      const queue = await this.getAllData(store);
      console.log("Retrieved offline queue from IndexedDB:", queue.length);
      return queue;
    } catch (error) {
      console.error("Error getting offline queue:", error);
      return [];
    }
  }

  async removeFromOfflineQueue(id) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.offlineQueueStore], "readwrite");
      const store = transaction.objectStore(this.offlineQueueStore);

      await this.deleteData(store, id);
      await this.completeTransaction(transaction);
      console.log("Removed from offline queue:", id);
      return true;
    } catch (error) {
      console.error("Error removing from offline queue:", error);
      throw error;
    }
  }

  async clearOfflineQueue() {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.offlineQueueStore], "readwrite");
      const store = transaction.objectStore(this.offlineQueueStore);
      await this.clearStore(store);
      await this.completeTransaction(transaction);
      console.log("Cleared offline queue");
      return true;
    } catch (error) {
      console.error("Error clearing offline queue:", error);
      throw error;
    }
  }

  // Favorites operations
  async addToFavorites(story) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.favoritesStore], "readwrite");
      const store = transaction.objectStore(this.favoritesStore);

      await this.putData(store, {
        ...story,
        addedAt: Date.now(),
        isFavorite: true,
      });

      await this.completeTransaction(transaction);
      console.log("Added to favorites:", story.id);
      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  }

  async removeFromFavorites(id) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.favoritesStore], "readwrite");
      const store = transaction.objectStore(this.favoritesStore);

      await this.deleteData(store, id);
      await this.completeTransaction(transaction);
      console.log("Removed from favorites:", id);
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  }

  async getFavorites() {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.favoritesStore], "readonly");
      const store = transaction.objectStore(this.favoritesStore);
      const favorites = await this.getAllData(store);
      console.log("Retrieved favorites from IndexedDB:", favorites.length);
      return favorites;
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  }

  async isFavorite(id) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.favoritesStore], "readonly");
      const store = transaction.objectStore(this.favoritesStore);
      const favorite = await this.getData(store, id);
      return !!favorite;
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return false;
    }
  }

  async clearAllFavorites() {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([this.favoritesStore], "readwrite");
      const store = transaction.objectStore(this.favoritesStore);
      await this.clearStore(store);
      await this.completeTransaction(transaction);
      console.log("Cleared all favorites");
      return true;
    } catch (error) {
      console.error("Error clearing favorites:", error);
      throw error;
    }
  }

  async isDataStale(storeName, maxAge = 5 * 60 * 1000) {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const data = await this.getAllData(store);

      if (data.length === 0) return true;

      const latestData = data[0];
      return !latestData.cachedAt || Date.now() - latestData.cachedAt > maxAge;
    } catch (error) {
      console.error("Error checking data staleness:", error);
      return true;
    }
  }

  async clearAllData() {
    try {
      const db = await this.dbPromise;
      const transaction = db.transaction(
        [
          this.storiesStore,
          this.storyDetailsStore,
          this.offlineQueueStore,
          this.favoritesStore,
        ],
        "readwrite"
      );

      await this.clearStore(transaction.objectStore(this.storiesStore));
      await this.clearStore(transaction.objectStore(this.storyDetailsStore));
      await this.clearStore(transaction.objectStore(this.offlineQueueStore));
      await this.clearStore(transaction.objectStore(this.favoritesStore));

      await this.completeTransaction(transaction);
      console.log("Cleared all data");
      return true;
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }

  getData(store, key) {
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  getAllData(store) {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  addData(store, data) {
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  putData(store, data) {
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  deleteData(store, key) {
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  clearStore(store) {
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  completeTransaction(transaction) {
    return new Promise((resolve, reject) => {
      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }
}

export default IDBHelper;
