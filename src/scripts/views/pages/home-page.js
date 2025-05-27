import { createStoryItemTemplate } from "../templates/template-creator";
import MapStyles from "../../utils/map-styles";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

class HomePage {
  constructor() {
    this._stories = [];
    this._map = null;
    this._markers = [];
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

  showStories(stories) {
    this._stories = stories;
    const storiesContainer = document.querySelector("#stories");

    if (stories.length > 0) {
      storiesContainer.innerHTML = "";
      stories.forEach((story) => {
        storiesContainer.innerHTML += createStoryItemTemplate(story);
      });
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

  showError(message) {
    document.querySelector("#stories").innerHTML = `
      <div class="error">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Error loading stories: ${message}</p>
      </div>
    `;
  }

  initMap(stories) {
    const storiesWithLocation = stories.filter(
      (story) => story.lat && story.lon
    );

    if (storiesWithLocation.length > 0) {
      const { map } = MapStyles.initMap(L, "map", [-2.548926, 118.0148634], 5);

      this._map = map;

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

      const markers = L.layerGroup();

      storiesWithLocation.forEach((story) => {
        const marker = L.marker([story.lat, story.lon], { icon: customIcon });

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

        markers.addTo(this._map);
        this._markers.push(marker);
        marker.addTo(markers);
      });

      const overlays = {
        "Story Locations": markers,
      };

      L.control
        .layers(MapStyles.getTileLayers(L), overlays, { position: "topright" })
        .addTo(this._map);

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

  displayStories(stories) {
    this.showStories(stories); 
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
