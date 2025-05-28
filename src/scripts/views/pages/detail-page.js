import { createStoryDetailTemplate } from "../templates/template-creator";
import MapStyles from "../../utils/map-styles";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import IDBHelper from "../../utils/idb-helper";

class DetailPage {
  constructor() {
    this._story = null;
    this._map = null;
    this._idbHelper = new IDBHelper();
  }

  getTemplate() {
    return `
      <article class="story-detail-section" aria-labelledby="detail-heading">
        <h2 id="detail-heading" class="content__heading"><i class="fa-solid fa-book-open"></i> Story Details</h2>
        <div id="story" class="story">
          <div class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading story details...</p>
          </div>
        </div>
        <section id="detailMapSection" class="detail-map-section" style="display: none;" aria-labelledby="location-heading">
          <h3 id="location-heading" class="map-section-heading">Story Location</h3>
          <div id="detailMap" class="map"></div>
        </section>
      </article>
    `;
  }

  async showStory(story) {
    this._story = story;
    const storyContainer = document.querySelector("#story");

    // Check if story is in favorites
    const isFavorite = await this._idbHelper.isFavorite(story.id);

    storyContainer.innerHTML = createStoryDetailTemplate(story, isFavorite);

    // Add event listener to favorite button
    this.initFavoriteButton();
  }

  initFavoriteButton() {
    const favoriteButton = document.querySelector(".detail-favorite");
    if (favoriteButton) {
      favoriteButton.addEventListener("click", async () => {
        const storyId = favoriteButton.dataset.id;
        const isActive = favoriteButton.classList.contains("active");

        try {
          if (isActive) {
            await this._idbHelper.removeFromFavorites(storyId);
            favoriteButton.classList.remove("active");
            favoriteButton.innerHTML =
              '<i class="fa-regular fa-heart"></i> Add to Favorites';
            this.showNotification("Removed from favorites", "success");
          } else {
            await this._idbHelper.addToFavorites(this._story);
            favoriteButton.classList.add("active");
            favoriteButton.innerHTML =
              '<i class="fa-solid fa-heart"></i> Remove from Favorites';
            this.showNotification("Added to favorites", "success");
          }
        } catch (error) {
          console.error("Error updating favorites:", error);
          this.showNotification("Failed to update favorites", "error");
        }
      });
    }
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

  showLoading() {
    const storyContainer = document.querySelector("#story");
    storyContainer.innerHTML = `
      <div class="loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Loading story details...</p>
      </div>
    `;
  }

  showError(message, isNotFound = false) {
    const storyContainer = document.querySelector("#story");

    if (isNotFound) {
      storyContainer.innerHTML = `
        <div class="error-container">
          <div class="error-icon"><i class="fa-solid fa-face-sad-tear"></i></div>
          <h3>Story Not Found</h3>
          <p>The story you're looking for doesn't exist or may have been removed.</p>
          <a href="#/home" class="button back-button"><i class="fa-solid fa-home"></i> Back to Home</a>
        </div>
      `;
    } else {
      storyContainer.innerHTML = `
        <div class="error-container">
          <div class="error-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <h3>Something Went Wrong</h3>
          <p>We couldn't load this story. Please try again later.</p>
          <p class="error-details">${message}</p>
          <a href="#/home" class="button back-button"><i class="fa-solid fa-home"></i> Back to Home</a>
        </div>
      `;
    }

    // Hide map container
    document.querySelector("#detailMapSection").style.display = "none";
  }

  initMap(story) {
    if (story.lat && story.lon) {
      document.querySelector("#detailMapSection").style.display = "block";

      // Initialize map with multiple styles and layer control
      const { map } = MapStyles.initMap(
        L,
        "detailMap",
        [story.lat, story.lon],
        13
      );

      this._map = map;

      // Custom marker icon
      const customIcon = L.icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Add marker for story location
      const marker = L.marker([story.lat, story.lon], {
        icon: customIcon,
      }).addTo(this._map);

      // Add popup with story info
      marker
        .bindPopup(
          `
          <div class="popup-content">
            <h4>${story.name}</h4>
            <p>${story.description.substring(0, 100)}${
            story.description.length > 100 ? "..." : ""
          }</p>
          </div>
        `
        )
        .openPopup();

      // Add scale control
      L.control.scale().addTo(this._map);
    } else {
      document.querySelector("#detailMapSection").innerHTML = `
        <h3 class="map-section-heading">Story Location</h3>
        <div class="map-placeholder">
          <i class="fa-solid fa-map-pin"></i>
          <p>No location data available for this story</p>
        </div>
      `;
      document.querySelector("#detailMapSection").style.display = "block";
    }
  }

  redirectToLogin() {
    window.location.hash = "#/login";
  }

  async displayStory(story) {
    await this.showStory(story);
  }

  displayStoryLocation(story) {
    this.initMap(story);
  }

  handleUnauthenticated() {
    this.redirectToLogin();
  }

  showNotFoundError(message) {
    this.showError(message, true);
  }
}

export default DetailPage;
