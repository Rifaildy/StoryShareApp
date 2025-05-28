import { createStoryItemTemplate } from "../templates/template-creator";
import MapStyles from "../../utils/map-styles";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import IDBHelper from "../../utils/idb-helper";

class HomePage {
  constructor() {
    this._stories = [];
    this._map = null;
    this._markers = [];
    this._idbHelper = new IDBHelper();
  }

  getTemplate() {
    return `
      <section class="hero" aria-labelledby="hero-heading">
        <div class="hero-content">
          <h2 id="hero-heading">Share Your Stories</h2>
          <p>Capture moments, share experiences, connect with others</p>
          <a href="#/add" class="hero-button"><i class="fa-solid fa-plus"></i> Add Your Story</a>
        </div>
      </section>
      
      <section class="stories-section" aria-labelledby="stories-heading">
        <h2 id="stories-heading" class="content__heading"><i class="fa-solid fa-book"></i> All Stories</h2>
        <div id="stories" class="stories">
          <div class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <p>Loading stories...</p>
          </div>
        </div>
      </section>
      
      <section class="map-section" aria-labelledby="map-heading">
        <h2 id="map-heading" class="content__heading"><i class="fa-solid fa-map-location-dot"></i> Story Locations</h2>
        <div id="map" class="map"></div>
      </section>
    `;
  }

  async showStories(stories) {
    this._stories = stories;
    const storiesContainer = document.querySelector("#stories");

    if (stories.length > 0) {
      storiesContainer.innerHTML = "";

      // Check which stories are favorites
      for (const story of stories) {
        const isFavorite = await this._idbHelper.isFavorite(story.id);
        storiesContainer.innerHTML += createStoryItemTemplate(
          story,
          isFavorite
        );
      }

      // Add event listeners to favorite buttons
      this.initFavoriteButtons();
    } else {
      storiesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-face-sad-tear"></i>
          <p>No stories found</p>
          <a href="#/add" class="button">Add Your First Story</a>
        </div>
      `;
    }
  }

  initFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll(".favorite-button");
    favoriteButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        const storyId = button.dataset.id;
        const isActive = button.classList.contains("active");

        try {
          if (isActive) {
            await this._idbHelper.removeFromFavorites(storyId);
            button.classList.remove("active");
            button.innerHTML = '<i class="fa-regular fa-heart"></i>';
            this.showNotification("Removed from favorites", "success");
          } else {
            const story = this._stories.find((s) => s.id === storyId);
            if (story) {
              await this._idbHelper.addToFavorites(story);
              button.classList.add("active");
              button.innerHTML = '<i class="fa-solid fa-heart"></i>';
              this.showNotification("Added to favorites", "success");
            }
          }
        } catch (error) {
          console.error("Error updating favorites:", error);
          this.showNotification("Failed to update favorites", "error");
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

  showError(message) {
    document.querySelector("#stories").innerHTML = `
      <div class="error">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Error loading stories: ${message}</p>
      </div>
    `;
  }

  initMap(stories) {
    // Filter stories with location data
    const storiesWithLocation = stories.filter(
      (story) => story.lat && story.lon
    );

    if (storiesWithLocation.length > 0) {
      // Initialize map with multiple styles and layer control
      const { map } = MapStyles.initMap(L, "map", [-2.548926, 118.0148634], 5);

      this._map = map;

      // Custom marker icon
      const customIcon = L.icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Create a marker cluster group
      const markers = L.layerGroup();

      // Add markers for each story with location
      storiesWithLocation.forEach((story) => {
        const marker = L.marker([story.lat, story.lon], { icon: customIcon });

        // Add popup with story info
        marker.bindPopup(`
          <div class="popup-content">
            <h3>${story.name}</h3>
            <img src="${story.photoUrl}" alt="Story image from ${
          story.name
        }" style="width: 100%; max-width: 200px;">
            <p>${story.description.substring(0, 100)}...</p>
            <a href="#/detail/${
              story.id
            }" class="popup-link"><i class="fa-solid fa-eye"></i> View Details</a>
          </div>
        `);

        // Add marker to layer group
        markers.addTo(this._map);
        this._markers.push(marker);
        marker.addTo(markers);
      });

      // Add markers as an overlay
      const overlays = {
        "Story Locations": markers,
      };

      // Add overlay to layer control
      L.control
        .layers(MapStyles.getTileLayers(L), overlays, { position: "topright" })
        .addTo(this._map);

      // Add scale control
      L.control.scale().addTo(this._map);
    } else {
      document.querySelector("#map").innerHTML = `
        <div class="map-placeholder">
          <i class="fa-solid fa-map-pin"></i>
          <p>No stories with location data available</p>
        </div>
      `;
    }
  }

  redirectToLogin() {
    window.location.hash = "#/login";
  }

  showLoading() {
    const storiesContainer = document.querySelector("#stories");
    storiesContainer.innerHTML = `
      <div class="loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <p>Loading stories...</p>
      </div>
    `;
  }

  async displayStories(stories) {
    await this.showStories(stories);
  }

  displayStoriesOnMap(stories) {
    this.initMap(stories);
  }

  handleUnauthenticated() {
    this.redirectToLogin();
  }

  showNotFoundError(message) {
    this.showError(message);
  }
}

export default HomePage;
