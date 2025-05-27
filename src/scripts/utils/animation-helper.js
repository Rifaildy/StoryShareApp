/**
 * Animation Helper
 * Provides utility functions for page transitions using Web Animations API
 */
const AnimationHelper = {
  /**
   * Fade out animation for the current page
   * @param {HTMLElement} element - The element to animate
   * @returns {Animation} - The animation object
   */
  fadeOut(element) {
    return element.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-20px)" },
      ],
      {
        duration: 300,
        easing: "ease-out",
        fill: "forwards",
      }
    );
  },

  /**
   * Fade in animation for the new page
   * @param {HTMLElement} element - The element to animate
   * @returns {Animation} - The animation object
   */
  fadeIn(element) {
    return element.animate(
      [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 300,
        easing: "ease-out",
        fill: "forwards",
      }
    );
  },

  /**
   * Slide left animation (for forward navigation)
   * @param {HTMLElement} element - The element to animate
   * @returns {Animation} - The animation object
   */
  slideLeft(element) {
    return element.animate(
      [
        { opacity: 0, transform: "translateX(100px)" },
        { opacity: 1, transform: "translateX(0)" },
      ],
      {
        duration: 400,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        fill: "forwards",
      }
    );
  },

  /**
   * Slide right animation (for backward navigation)
   * @param {HTMLElement} element - The element to animate
   * @returns {Animation} - The animation object
   */
  slideRight(element) {
    return element.animate(
      [
        { opacity: 0, transform: "translateX(-100px)" },
        { opacity: 1, transform: "translateX(0)" },
      ],
      {
        duration: 400,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        fill: "forwards",
      }
    );
  },

  /**
   * Zoom in animation (for detail pages)
   * @param {HTMLElement} element - The element to animate
   * @returns {Animation} - The animation object
   */
  zoomIn(element) {
    return element.animate(
      [
        { opacity: 0, transform: "scale(0.95)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      {
        duration: 400,
        easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        fill: "forwards",
      }
    );
  },

  /**
   * Determine the appropriate animation based on the route
   * @param {string} fromRoute - The previous route
   * @param {string} toRoute - The new route
   * @returns {string} - The animation type to use
   */
  determineAnimationType(fromRoute, toRoute) {
    let animationType = "fade";

    if (toRoute.includes("/detail/")) {
      animationType = "zoom";
    }
    else if (fromRoute.includes("/detail/") && toRoute === "/home") {
      animationType = "slideRight";
    }
    else if (toRoute === "/add") {
      animationType = "slideLeft";
    }
    else if (fromRoute === "/add" && toRoute === "/home") {
      animationType = "slideRight";
    }
    else if (toRoute === "/login" || toRoute === "/register") {
      animationType = "fade";
    }

    return animationType;
  },

  /**
   * Apply the appropriate animation to the content element
   * @param {HTMLElement} contentElement - The content element to animate
   * @param {string} animationType - The type of animation to apply
   */
  applyAnimation(contentElement, animationType) {
    switch (animationType) {
      case "zoom":
        this.zoomIn(contentElement);
        break;
      case "slideLeft":
        this.slideLeft(contentElement);
        break;
      case "slideRight":
        this.slideRight(contentElement);
        break;
      case "fade":
      default:
        this.fadeIn(contentElement);
        break;
    }
  },
};

export default AnimationHelper;
