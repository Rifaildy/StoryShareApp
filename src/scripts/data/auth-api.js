import API_ENDPOINT from "../globals/api-endpoint";

class AuthApi {
  static async register(userData) {
    try {
      const response = await fetch(API_ENDPOINT.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  }

  static async login(credentials) {
    try {
      const response = await fetch(API_ENDPOINT.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      localStorage.setItem("token", responseJson.loginResult.token);
      localStorage.setItem("userId", responseJson.loginResult.userId);
      localStorage.setItem("name", responseJson.loginResult.name);

      return responseJson.loginResult;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    window.location.hash = "#/login";
  }

  static isLoggedIn() {
    return !!localStorage.getItem("token");
  }

  static getToken() {
    return localStorage.getItem("token");
  }

  static getName() {
    return localStorage.getItem("name");
  }
}

export default AuthApi;
