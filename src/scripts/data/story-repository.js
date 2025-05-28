import API_ENDPOINT from "../globals/api-endpoint";
import AuthApi from "./auth-api";
import IDBHelper from "../utils/idb-helper";

class StoryRepository {
  constructor() {
    this.idbHelper = new IDBHelper();
  }

  async getAllStories() {
    try {
      if (!AuthApi.isLoggedIn()) {
        throw new Error("Missing authentication");
      }

      const token = AuthApi.getToken();

      try {
        const response = await fetch(API_ENDPOINT.LIST, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseJson = await response.json();

        if (responseJson.error) {
          throw new Error(responseJson.message);
        }

        await this.idbHelper.saveStories(responseJson.listStory);
        return responseJson.listStory;
      } catch (networkError) {
        console.log("Network failed, loading from cache...");
        const cachedStories = await this.idbHelper.getStories();

        if (cachedStories.length > 0) {
          return cachedStories;
        }

        throw new Error(
          "No cached data available. Please check your internet connection."
        );
      }
    } catch (error) {
      console.error("Error getting stories:", error);
      throw error;
    }
  }

  async getStoryDetail(id) {
    try {
      if (!AuthApi.isLoggedIn()) {
        throw new Error("Missing authentication");
      }

      const token = AuthApi.getToken();

      try {
        const response = await fetch(API_ENDPOINT.DETAIL(id), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseJson = await response.json();

        if (responseJson.error) {
          if (response.status === 404) {
            throw new Error("Story not found");
          }
          throw new Error(responseJson.message);
        }

        await this.idbHelper.saveStoryDetail(responseJson.story);
        return responseJson.story;
      } catch (networkError) {
        console.log("Network failed, loading from cache...");
        const cachedStory = await this.idbHelper.getStoryDetail(id);

        if (cachedStory) {
          return cachedStory;
        }

        throw new Error("Story not available offline");
      }
    } catch (error) {
      console.error("Error getting story detail:", error);
      throw error;
    }
  }

  async addNewStory(formData) {
    try {
      if (!AuthApi.isLoggedIn()) {
        throw new Error("Missing authentication");
      }

      const token = AuthApi.getToken();

      if (!navigator.onLine) {
        const offlineManager = window.StoryShareApp?.offlineManager;
        if (offlineManager) {
          await offlineManager.addStoryOffline(formData);
          throw new Error(
            "Story saved offline. It will be uploaded when you're back online."
          );
        }
        throw new Error(
          "You are offline. Please check your internet connection."
        );
      }

      const response = await fetch(API_ENDPOINT.ADD, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error("Error adding new story:", error);
      throw error;
    }
  }
}

export default StoryRepository;
