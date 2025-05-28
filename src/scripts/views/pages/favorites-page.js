import {
  createStoryItemTemplate,
  createEmptyFavoritesTemplate,
} from "../templates/template-creator";
import IDBHelper from "../../utils/idb-helper";

class FavoritesPage {
  constructor() {
    this.idbHelper = new IDBHelper();
  }

  getTemplate() {
    return `
      <section class="favorites-section" aria-labelledby="favorites-heading">
        <h2 id="favorites-heading" class="content__heading"><i class="fa-solid fa-heart"></i> Favorite Stories</h2>
        <div class="favorites-actions">
          <button id="clearFavoritesBtn" class="button danger">
            <i class="fa-solid fa-trash"></i> Clear All Favorites
          </button>
        </div>
        <div id="favorites" class="stories">
          <div class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading favorite stories...</p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.showLoading();
    await this.displayFavorites();
    this.initEventListeners();
  }

  showLoading() {
    const favoritesContainer = document.querySelector("#favorites");
    favoritesContainer.innerHTML = `
      <div class="loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Loading favorite stories...</p>
      </div>
    `;
  }

  async displayFavorites() {
    const favoritesContainer = document.querySelector("#favorites");

    try {
      const favorites = await this.idbHelper.getFavorites();

      if (favorites.length > 0) {
        favoritesContainer.innerHTML = "";

        // Sort by added date (newest first)
        favorites.sort((a, b) => b.addedAt - a.addedAt);

        favorites.forEach((story) => {
          favoritesContainer.innerHTML += createStoryItemTemplate(story, true);
        });

        // Add event listeners to favorite buttons
        this.initFavoriteButtons();
      } else {
        favoritesContainer.innerHTML = createEmptyFavoritesTemplate();
      }
    } catch (error) {
      console.error("Error displaying favorites:", error);
      favoritesContainer.innerHTML = `
        <div class="error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>Error loading favorites: ${error.message}</p>
        </div>
      `;
    }
  }

  initEventListeners() {
    const clearButton = document.getElementById("clearFavoritesBtn");
    if (clearButton) {
      clearButton.addEventListener("click", async () => {
        if (confirm("Are you sure you want to clear all favorites?")) {
          await this.idbHelper.clearAllFavorites();
          this.showNotification("All favorites have been cleared", "success");
          await this.displayFavorites();
        }
      });
    }
  }

  initFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll(".favorite-button");
    favoriteButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        const storyId = button.dataset.id;

        try {
          await this.idbHelper.removeFromFavorites(storyId);
          this.showNotification("Removed from favorites", "success");
          await this.displayFavorites();
        } catch (error) {
          console.error("Error removing from favorites:", error);
          this.showNotification("Failed to remove from favorites", "error");
        }
      });
    });
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

export default FavoritesPage;
