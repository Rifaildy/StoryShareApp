/**
 * View Transition Helper
 * Provides utility functions for managing View Transition API
 */
const ViewTransitionHelper = {
  /**
   * Check if View Transition API is supported
   * @returns {boolean} - True if supported, false otherwise
   */
  isSupported() {
    return "startViewTransition" in document;
  },

  /**
   * Start a view transition with fallback
   * @param {Function} updateCallback - Function to update the DOM
   * @param {string} transitionType - Type of transition for CSS targeting
   * @returns {Promise} - Promise that resolves when transition completes
   */
  async startTransition(updateCallback, transitionType = "default") {
    if (this.isSupported()) {
      return this._startViewTransition(updateCallback, transitionType);
    } else {
      return this._startFallbackTransition(updateCallback, transitionType);
    }
  },

  /**
   * Start a view transition using the API
   * @private
   */
  async _startViewTransition(updateCallback, transitionType) {
    document.documentElement.setAttribute(
      "data-transition-type",
      transitionType
    );

    document.body.classList.add("view-transition-loading");

    try {
      const transition = document.startViewTransition(async () => {
        await updateCallback();
      });
      await transition.finished;

      return transition;
    } finally {
      document.documentElement.removeAttribute("data-transition-type");
      document.body.classList.remove("view-transition-loading");
    }
  },

  /**
   * Start a fallback transition for unsupported browsers
   * @private
   */
  async _startFallbackTransition(updateCallback, transitionType) {
    const content = document.querySelector("#mainContent");

    if (content) {
      content.style.transition = "opacity 200ms ease-out";
      content.style.opacity = "0";

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    await updateCallback();

    if (content) {
      content.style.opacity = "1";

      setTimeout(() => {
        content.style.transition = "";
      }, 200);
    }
  },

  /**
   * Set view transition name on an element
   * @param {HTMLElement} element - Element to set transition name on
   * @param {string} name - Transition name
   */
  setTransitionName(element, name) {
    if (element) {
      element.style.viewTransitionName = name;
    }
  },

  /**
   * Remove view transition name from an element
   * @param {HTMLElement} element - Element to remove transition name from
   */
  removeTransitionName(element) {
    if (element) {
      element.style.viewTransitionName = "none";
    }
  },

  /**
   * Create a smooth transition between two states
   * @param {Function} beforeUpdate - Function to run before update
   * @param {Function} updateCallback - Function to update the DOM
   * @param {Function} afterUpdate - Function to run after update
   * @param {string} transitionType - Type of transition
   */
  async createSmoothTransition(
    beforeUpdate,
    updateCallback,
    afterUpdate,
    transitionType = "default"
  ) {
    if (beforeUpdate) {
      await beforeUpdate();
    }

    await this.startTransition(updateCallback, transitionType);

    if (afterUpdate) {
      await afterUpdate();
    }
  },

  /**
   * Get transition type based on navigation pattern
   * @param {string} fromRoute - Previous route
   * @param {string} toRoute - New route
   * @returns {string} - Transition type
   */
  getTransitionType(fromRoute, toRoute) {
    if (toRoute.includes("/detail/")) {
      return "detail";
    }

    if (
      fromRoute.includes("/detail/") &&
      (toRoute === "/home" || toRoute === "/")
    ) {
      return "back-to-home";
    }

    if (toRoute === "/add") {
      return "add-story";
    }

    if (fromRoute === "/add" && (toRoute === "/home" || toRoute === "/")) {
      return "back-from-add";
    }

    if (toRoute === "/login" || toRoute === "/register") {
      return "auth";
    }

    if (
      (fromRoute === "/login" || fromRoute === "/register") &&
      (toRoute === "/home" || toRoute === "/")
    ) {
      return "from-auth";
    }

    return "default";
  },

  /**
   * Preload critical resources for smooth transitions
   * @param {Array} resources - Array of resource URLs to preload
   */
  preloadResources(resources) {
    resources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = resource;

      if (resource.endsWith(".css")) {
        link.as = "style";
      } else if (resource.endsWith(".js")) {
        link.as = "script";
      } else if (resource.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        link.as = "image";
      }

      document.head.appendChild(link);
    });
  },
};

export default ViewTransitionHelper;
