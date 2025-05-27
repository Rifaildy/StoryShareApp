/**
 * Map Styles Utility
 * Provides different tile layers for maps
 */
const MapStyles = {
  /**
   * Get all available map styles as tile layers
   * @param {Object} L - Leaflet library
   * @returns {Object} - Object containing all tile layers
   */
  getTileLayers(L) {
    return {
      OpenStreetMap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ),

      OpenTopoMap: L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
          maxZoom: 17,
        }
      ),

      "Stamen Watercolor": L.tileLayer(
        "https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}",
        {
          attribution:
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: "abcd",
          minZoom: 1,
          maxZoom: 16,
          ext: "jpg",
        }
      ),

      "Carto DB Light": L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ),

      "Carto DB Dark": L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ),
    };
  },

  /**
   * Get the default tile layer
   * @param {Object} L - Leaflet library
   * @returns {Object} - Default tile layer
   */
  getDefaultTileLayer(L) {
    return this.getTileLayers(L)["OpenStreetMap"];
  },

  /**
   * Add layer control to map
   * @param {Object} L - Leaflet library
   * @param {Object} map - Leaflet map instance
   * @param {Object} baseLayers - Base layers to add to control
   * @param {Object} overlays - Overlay layers to add to control (optional)
   */
  addLayerControl(L, map, baseLayers, overlays = {}) {
    L.control
      .layers(baseLayers, overlays, {
        collapsed: true,
        position: "topright",
      })
      .addTo(map);
  },

  /**
   * Initialize map with multiple styles and layer control
   * @param {Object} L - Leaflet library
   * @param {String} elementId - ID of the HTML element to contain the map
   * @param {Array} center - Initial center coordinates [lat, lng]
   * @param {Number} zoom - Initial zoom level
   * @param {Function} clickHandler - Optional click handler function
   * @returns {Object} - Object containing map and layers
   */
  initMap(L, elementId, center, zoom, clickHandler = null) {
    const tileLayers = this.getTileLayers(L);

    const map = L.map(elementId, {
      layers: [tileLayers["OpenStreetMap"]],
    }).setView(center, zoom);

    this.addLayerControl(L, map, tileLayers);

    if (clickHandler) {
      map.on("click", clickHandler);
    }

    return { map, tileLayers };
  },
};

export default MapStyles;
