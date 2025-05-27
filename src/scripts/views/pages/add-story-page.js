import L from "leaflet";
import "leaflet/dist/leaflet.css";

class AddStoryPage {
  constructor() {
    this._map = null;
    this._marker = null;
    this._stream = null;
    this._selectedFile = null;
    this._formSubmitHandler = null;
  }

  getTemplate() {
    return `
      <article class="add-story-section" aria-labelledby="add-story-heading">
        <h2 id="add-story-heading" class="content__heading"><i class="fa-solid fa-plus"></i> Add New Story</h2>
        <div class="form-container">
          <form id="addStoryForm">
            <section class="form-section" aria-labelledby="description-heading">
              <h3 id="description-heading" class="form-section-heading">Story Content</h3>
              <div class="form-group">
                <label for="description"><i class="fa-solid fa-pen"></i> Story Description</label>
                <textarea id="description" name="description" rows="5" placeholder="Share your story..." required></textarea>
              </div>
            </section>
            
            <section class="form-section" aria-labelledby="photo-heading">
              <h3 id="photo-heading" class="form-section-heading">Photo</h3>
              <div class="form-group">
                <div class="photo-options">
                  <div class="photo-option">
                    <input type="file" id="fileInput" accept="image/*" class="file-input" />
                    <label for="fileInput" class="file-input-label">
                      <i class="fa-solid fa-upload"></i> Choose from Gallery
                    </label>
                  </div>
                  <div class="photo-option">
                    <button type="button" id="startCamera" class="button camera-button">
                      <i class="fa-solid fa-camera"></i> Open Camera
                    </button>
                  </div>
                </div>
                
                <div class="camera-container">
                  <video id="cameraPreview" class="camera-preview" autoplay playsinline style="display: none;"></video>
                  <canvas id="photoCanvas" class="photo-canvas" style="display: none;"></canvas>
                  <img id="capturedPhoto" class="captured-photo" alt="Photo preview" style="display: none;">
                  <div class="camera-placeholder" id="cameraPlaceholder">
                    <i class="fa-solid fa-image"></i>
                    <p>Upload a photo or use camera</p>
                  </div>
                </div>
                
                <div class="camera-controls" style="display: none;">
                  <button type="button" id="capturePhoto" class="button camera-button">
                    <i class="fa-solid fa-camera"></i> Capture Photo
                  </button>
                  <button type="button" id="cancelCamera" class="button camera-button">
                    <i class="fa-solid fa-times"></i> Cancel
                  </button>
                </div>
              </div>
            </section>
            
            <section class="form-section" aria-labelledby="location-heading">
              <h3 id="location-heading" class="form-section-heading">Location</h3>
              <div class="form-group">
                <div class="map-controls">
                  <button type="button" id="getCurrentLocation" class="location-button">
                    <i class="fa-solid fa-location-crosshairs"></i> Use My Location
                  </button>
                </div>
                <div id="locationMap" class="location-map"></div>
                <p id="selectedLocation" class="selected-location">
                  <i class="fa-solid fa-map-pin"></i> Click on the map to select a location
                </p>
                <input type="hidden" id="latitude" name="latitude">
                <input type="hidden" id="longitude" name="longitude">
              </div>
            </section>
            
            <div class="form-group">
              <button type="submit" id="submitStory" class="button submit-button">
                <i class="fa-solid fa-paper-plane"></i> Submit Story
              </button>
            </div>
          </form>
        </div>
      </article>
    `;
  }

  initLocationMap() {
    this._map = L.map("locationMap").setView([-2.548926, 118.0148634], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this._map);

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

    L.control.scale().addTo(this._map);

    this._map.on("click", (e) => {
      const { lat, lng } = e.latlng;

      document.getElementById("latitude").value = lat;
      document.getElementById("longitude").value = lng;

      document.getElementById("selectedLocation").innerHTML = `
        <i class="fa-solid fa-map-pin"></i> Your location: ${lat.toFixed(
          6
        )}, ${lng.toFixed(6)}
      `;

      if (this._marker) {
        this._marker.setLatLng([lat, lng]);
      } else {
        this._marker = L.marker([lat, lng], { icon: customIcon }).addTo(
          this._map
        );
      }
    });

    document
      .getElementById("getCurrentLocation")
      .addEventListener("click", () => {
        this._getUserLocation();
      });

    this._getUserLocation();
  }

  _getUserLocation() {
    if (navigator.geolocation) {
      document.getElementById("selectedLocation").innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i> Getting your current location...
      `;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          this._map.setView([latitude, longitude], 15);

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

          if (this._marker) {
            this._marker.setLatLng([latitude, longitude]);
          } else {
            this._marker = L.marker([latitude, longitude], {
              icon: customIcon,
            }).addTo(this._map);
          }

          document.getElementById("latitude").value = latitude;
          document.getElementById("longitude").value = longitude;

          document.getElementById("selectedLocation").innerHTML = `
            <i class="fa-solid fa-map-pin"></i> Your location: ${latitude.toFixed(
              6
            )}, ${longitude.toFixed(6)}
          `;
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Unable to get your location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location permission denied. Please allow location access or select manually.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information is unavailable. Please select manually.";
              break;
            case error.TIMEOUT:
              errorMessage =
                "Location request timed out. Please select manually.";
              break;
          }

          document.getElementById("selectedLocation").innerHTML = `
            <i class="fa-solid fa-triangle-exclamation"></i> ${errorMessage}
          `;
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      document.getElementById("selectedLocation").innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i> Geolocation is not supported by your browser. Please select location manually.
      `;
    }
  }

  initPhotoUpload() {
    const fileInput = document.getElementById("fileInput");
    const capturedPhoto = document.getElementById("capturedPhoto");
    const cameraPlaceholder = document.getElementById("cameraPlaceholder");
    const photoCanvas = document.getElementById("photoCanvas");

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        this._stopCamera();

        const reader = new FileReader();
        reader.onload = (e) => {
          capturedPhoto.src = e.target.result;
          capturedPhoto.style.display = "block";
          cameraPlaceholder.style.display = "none";

          this._selectedFile = file;

          const context = photoCanvas.getContext("2d");
          context.clearRect(0, 0, photoCanvas.width, photoCanvas.height);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  initCameraControls() {
    const startCameraButton = document.getElementById("startCamera");
    const capturePhotoButton = document.getElementById("capturePhoto");
    const cancelCameraButton = document.getElementById("cancelCamera");
    const cameraPreview = document.getElementById("cameraPreview");
    const photoCanvas = document.getElementById("photoCanvas");
    const capturedPhoto = document.getElementById("capturedPhoto");
    const cameraPlaceholder = document.getElementById("cameraPlaceholder");
    const cameraControls = document.querySelector(".camera-controls");

    startCameraButton.addEventListener("click", async () => {
      try {
        document.getElementById("fileInput").value = "";
        this._selectedFile = null;

        this._stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        cameraPreview.srcObject = this._stream;

        cameraPreview.style.display = "block";
        capturedPhoto.style.display = "none";
        cameraPlaceholder.style.display = "none";
        cameraControls.style.display = "flex";
      } catch (error) {
        console.error("Error accessing camera:", error);
        this.showNotification(
          "Could not access camera. Please make sure you have granted camera permissions.",
          "error"
        );
      }
    });

    capturePhotoButton.addEventListener("click", () => {
      photoCanvas.width = cameraPreview.videoWidth;
      photoCanvas.height = cameraPreview.videoHeight;

      const context = photoCanvas.getContext("2d");
      context.drawImage(
        cameraPreview,
        0,
        0,
        photoCanvas.width,
        photoCanvas.height
      );

      const photoDataUrl = photoCanvas.toDataURL("image/jpeg");
      capturedPhoto.src = photoDataUrl;

      cameraPreview.style.display = "none";
      capturedPhoto.style.display = "block";
      cameraControls.style.display = "none";

      this._stopCamera();
    });

    cancelCameraButton.addEventListener("click", () => {
      cameraPreview.style.display = "none";
      cameraControls.style.display = "none";

      if (capturedPhoto.src) {
        capturedPhoto.style.display = "block";
      } else {
        cameraPlaceholder.style.display = "block";
      }

      this._stopCamera();
    });
  }

  _stopCamera() {
    if (this._stream) {
      this._stream.getTracks().forEach((track) => track.stop());
      this._stream = null;
    }
  }

  setFormSubmitHandler(handler) {
    this._formSubmitHandler = handler;
    const form = document.getElementById("addStoryForm");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!this.validateForm()) {
        return;
      }

      const formData = this.getFormData();

      await this._formSubmitHandler(formData);
    });
  }

  getFormData() {
    const description = document.getElementById("description").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;

    const formData = new FormData();
    formData.append("description", description);

    if (this._selectedFile) {
      formData.append("photo", this._selectedFile);
    } else {
      const photoCanvas = document.getElementById("photoCanvas");
      if (photoCanvas.width > 0) {
        const photoDataUrl = photoCanvas.toDataURL("image/jpeg");
        const photoBlob = this._dataURLtoBlob(photoDataUrl);
        formData.append("photo", photoBlob, "photo.jpg");
      }
    }

    if (latitude && longitude) {
      formData.append("lat", latitude);
      formData.append("lon", longitude);
    }

    return formData;
  }

  validateForm() {
    const photoCanvas = document.getElementById("photoCanvas");

    if (!this._selectedFile && photoCanvas.width === 0) {
      this.showNotification(
        "Please select or capture a photo before submitting",
        "error"
      );
      return false;
    }

    return true;
  }

  setSubmitButtonLoading(isLoading) {
    const submitButton = document.getElementById("submitStory");
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    } else {
      submitButton.disabled = false;
      submitButton.innerHTML =
        '<i class="fa-solid fa-paper-plane"></i> Submit Story';
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
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  _dataURLtoBlob(dataURL) {
    const byteString = atob(dataURL.split(",")[1]);

    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  redirectToLogin() {
    window.location.hash = "#/login";
  }

  redirectToHome() {
    window.location.hash = "#/home";
  }

  redirectToHomeWithDelay(delay) {
    setTimeout(() => {
      window.location.hash = "#/home";
    }, delay);
  }

  destroy() {
    if (this._stopCamera) {
      this._stopCamera();
    }

    const form = document.getElementById("addStoryForm");
    if (form && this._formSubmitHandler) {
      form.removeEventListener("submit", this._formSubmitHandler);
    }
  }

  initializeComponents() {
    this.initLocationMap();
    this.initPhotoUpload();
    this.initCameraControls();
  }

  handleUnauthenticated() {
    this.showNotification("You must be logged in to add a story", "error");
    this.redirectToLogin();
  }

  handleSubmitSuccess() {
    this.showNotification("Story added successfully!", "success");
    this.redirectToHomeWithDelay(1500);
  }

  handleSubmitError(errorMessage) {
    this.showNotification(`Failed to add story: ${errorMessage}`, "error");
    this.setSubmitButtonLoading(false);
  }

  showValidationError(message) {
    this.showNotification(message, "error");
  }

  cleanup() {
    this.destroy();
  }
}

export default AddStoryPage;
