/**
 * IndexedDB Helper
 * Provides offline data storage using IndexedDB
 */
class IDBHelper {
  constructor() {
    this.dbName = "storyshare-db";
    this.dbVersion = 1;
    this.storiesStore = "stories";
    this.storyDetailsStore = "story-details";
    this.offlineQueueStore = "offline-queue";
    this.dbPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(this.storiesStore)) {
          const storiesStore = db.createObjectStore(this.storiesStore, {
            keyPath: "id",
          });
          storiesStore.createIndex("createdAt", "createdAt");
        }

        if (!db.objectStoreNames.contains(this.storyDetailsStore)) {
          db.createObjectStore(this.storyDetailsStore, {
            keyPath: "id",
          });
        }

        if (!db.objectStoreNames.contains(this.offlineQueueStore)) {
          const queueStore = db.createObjectStore(this.offlineQueueStore, {
            keyPath: "id",
            autoIncrement: true,
          });
          queueStore.createIndex("timestamp", "timestamp");
          queueStore.createIndex("type", "type");
        }
      };
    });
  }

  async saveStories(stories) {
    const db = await this.dbPromise;
    const transaction = db.transaction([this.storiesStore], "readwrite");
    const store = transaction.objectStore(this.storiesStore);

    await this.clearStore(store);

    for (const story of stories) {
      await this.putData(store, {
        ...story,
        cachedAt: Date.now(),
      });
    }

    return this.completeTransaction(transaction);
  }

  async getStories() {
    const db = await this.dbPromise;
    const transaction = db.transaction([this.storiesStore], "readonly");
    const store = transaction.objectStore(this.storiesStore);
    return this.getAllData(store);
  }

  async saveStoryDetail(story) {
    const db = await this.dbPromise;
    const transaction = db.transaction([this.storyDetailsStore], "readwrite");
    const store = transaction.objectStore(this.storyDetailsStore);

    await this.putData(store, {
      ...story,
      cachedAt: Date.now(),
    });

    return this.completeTransaction(transaction);
  }

  async getStoryDetail(id) {
    const db = await this.dbPromise;
    const transaction = db.transaction([this.storyDetailsStore], "readonly");
    const store = transaction.objectStore(this.storyDetailsStore);
    return this.getData(store, id);
  }

  async addToOfflineQueue(operation) {
    const db = await this.dbPromise;
    const transaction = db.transaction([this.offlineQueueStore], "readwrite");
    const store = transaction.objectStore(this.offlineQueueStore);

    await this.addData(store, {
      ...operation,
      timestamp: Date.now(),
    });

    return this.completeTransaction(transaction);
  }

  async getOfflineQueue() {
    const db = await this.dbPromise;
    const transaction = db.transaction([this.offlineQueueStore], "readonly");
    const store = transaction.objectStore(this.offlineQueueStore);
    return this.getAllData(store);
  }

  async removeFromOfflineQueue(id) {
    const db = await this.dbPromise;
    const transaction = db.transaction([this.offlineQueueStore], "readwrite");
    const store = transaction.objectStore(this.offlineQueueStore);

    await this.deleteData(store, id);
    return this.completeTransaction(transaction);
  }

  async clearOfflineQueue() {
    const db = await this.dbPromise;
    const transaction = db.transaction([this.offlineQueueStore], "readwrite");
    const store = transaction.objectStore(this.offlineQueueStore);
    await this.clearStore(store);
    return this.completeTransaction(transaction);
  }

  async isDataStale(storeName, maxAge = 5 * 60 * 1000) {
    const db = await this.dbPromise;
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const data = await this.getAllData(store);

    if (data.length === 0) return true;

    const latestData = data[0];
    return !latestData.cachedAt || Date.now() - latestData.cachedAt > maxAge;
  }

  async clearAllData() {
    const db = await this.dbPromise;
    const transaction = db.transaction(
      [this.storiesStore, this.storyDetailsStore, this.offlineQueueStore],
      "readwrite"
    );

    await this.clearStore(transaction.objectStore(this.storiesStore));
    await this.clearStore(transaction.objectStore(this.storyDetailsStore));
    await this.clearStore(transaction.objectStore(this.offlineQueueStore));

    return this.completeTransaction(transaction);
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
  