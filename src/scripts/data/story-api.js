import API_ENDPOINT from "../globals/api-endpoint";
import AuthApi from "./auth-api";

class StoryApi {
  static async getAllStories() {
    try {
      if (!AuthApi.isLoggedIn()) {
        throw new Error("Missing authentication");
      }

      const token = AuthApi.getToken();
      const response = await fetch(API_ENDPOINT.LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson.listStory;
    } catch (error) {
      console.error("Error getting stories:", error);
      throw error;
    }
  }

  static async getStoryDetail(id) {
    try {
      if (!AuthApi.isLoggedIn()) {
        throw new Error("Missing authentication");
      }

      const token = AuthApi.getToken();
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

      return responseJson.story;
    } catch (error) {
      console.error("Error getting story detail:", error);
      throw error;
    }
  }

  static async addNewStory(formData) {
    try {
      if (!AuthApi.isLoggedIn()) {
        throw new Error("Missing authentication");
      }

      const token = AuthApi.getToken();
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

export default StoryApi;
