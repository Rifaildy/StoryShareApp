import DrawerInitiator from "./utils/drawer-initiator";
import UrlParser from "./routes/url-parser";
import routes from "./routes/routes";
import AnimationHelper from "./utils/animation-helper";

class App {
  constructor({ button, drawer, content }) {
    this._button = button;
    this._drawer = drawer;
    this._content = content;
    this._cleanupFunction = null;
    this._currentPage = null;
    this._previousUrl = null;

    this._initialAppShell();
  }

  _initialAppShell() {
    DrawerInitiator.init({
      button: this._button,
      drawer: this._drawer,
      content: this._content,
    });
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const previousUrl = this._previousUrl || url;
    this._previousUrl = url;

    if (this._cleanupFunction) {
      this._cleanupFunction();
      this._cleanupFunction = null;
    }

    const page = routes[url];

    try {
      if (document.startViewTransition) {
        await this._renderWithViewTransition(page, previousUrl, url);
      } else {
        await this._renderWithFallbackAnimation(page, previousUrl, url);
      }

      const skipLinkElem = document.querySelector(".skip-link");
      skipLinkElem.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector("#mainContent").focus();
      });
    } catch (error) {
      console.error("Error rendering page:", error);
      this._content.innerHTML = `
      <div class="error">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Error loading page: ${error.message}</p>
      </div>
    `;
    }
  }

  async _renderWithViewTransition(page, previousUrl, url) {
    const transitionType = this._getTransitionType(previousUrl, url);

    this._content.style.viewTransitionName = "main-content";

    document.documentElement.setAttribute(
      "data-transition-type",
      transitionType
    );

    const transition = document.startViewTransition(async () => {
      const newContent = await page.render();
      this._content.innerHTML = newContent;

      const cleanup = await page.afterRender();
      if (typeof cleanup === "function") {
        this._cleanupFunction = cleanup;
      }
    });

    await transition.finished;

    document.documentElement.removeAttribute("data-transition-type");
  }

  async _renderWithFallbackAnimation(page, previousUrl, url) {
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "page-content";
    contentWrapper.style.opacity = "0"; 
    contentWrapper.innerHTML = await page.render();

    const animationType = AnimationHelper.determineAnimationType(
      previousUrl,
      url
    );

    if (this._currentPage) {
      const fadeOutAnimation = AnimationHelper.fadeOut(this._currentPage);

      await new Promise((resolve) => {
        fadeOutAnimation.onfinish = () => {
          if (this._currentPage && this._currentPage.parentNode) {
            this._content.removeChild(this._currentPage);
          }
          resolve();
        };
      });
    }

    this._content.appendChild(contentWrapper);
    this._currentPage = contentWrapper;

    AnimationHelper.applyAnimation(contentWrapper, animationType);

    const cleanup = await page.afterRender();

    if (typeof cleanup === "function") {
      this._cleanupFunction = cleanup;
    }
  }

  _getTransitionType(fromRoute, toRoute) {
    if (toRoute.includes("/detail/")) {
      return "detail";
    } else if (fromRoute.includes("/detail/") && toRoute === "/home") {
      return "back-to-home";
    } else if (toRoute === "/add") {
      return "add-story";
    } else if (fromRoute === "/add" && toRoute === "/home") {
      return "back-from-add";
    } else if (toRoute === "/login" || toRoute === "/register") {
      return "auth";
    } else if (fromRoute === "/login" || fromRoute === "/register") {
      return "from-auth";
    }
    return "default";
  }
}

export default App;
