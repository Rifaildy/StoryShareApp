class AppShell {
  constructor() {
    this.isInitialized = false;
  }

  getShellTemplate() {
    return `
        <div class="app-shell">
          <header class="app-bar" id="appBar">
            <a href="#mainContent" class="skip-link">Skip to content</a>
            
            <div class="app-bar__menu">
              <button id="hamburgerButton" aria-label="Toggle navigation menu">
                <i class="fa-solid fa-bars"></i>
              </button>
            </div>
            
            <div class="app-bar__brand">
              <h1><i class="fa-solid fa-book-open"></i> Rifaildy's StoryShare</h1>
            </div>
            
            <nav id="navigationDrawer" class="app-bar__navigation" aria-label="Main navigation">
              <ul>
                <li><a href="#/home"><i class="fa-solid fa-house"></i> Home</a></li>
                <li><a href="#/favorites"><i class="fa-solid fa-heart"></i> Favorites</a></li>
                <li><a href="#/add"><i class="fa-solid fa-plus"></i> Add Story</a></li>
                <li><a href="#/notifications"><i class="fa-solid fa-bell"></i> Notifications</a></li>
                <li id="authMenu"></li>
              </ul>
            </nav>
          </header>
  
          <main id="mainContent" class="main-content" tabindex="-1">
            <div class="content-loader" id="contentLoader">
              <div class="loader-spinner">
                <i class="fa-solid fa-spinner fa-spin"></i>
              </div>
              <p>Loading...</p>
            </div>
          </main>
  
          <footer class="app-footer" id="appFooter">
            <div class="footer-content">
              <p class="copyright">Rifaildy Nurhuda Assalam - 2025 - Dicoding Intermediate Web Project</p>
            </div>
          </footer>
        </div>
      `;
  }

  init() {
    if (this.isInitialized) return;

    document.body.innerHTML = this.getShellTemplate();
    this.isInitialized = true;
    document.body.classList.add("app-shell-loaded");
    console.log("Application Shell initialized");
  }

  showLoader() {
    const loader = document.getElementById("contentLoader");
    if (loader) {
      loader.style.display = "flex";
    }
  }

  hideLoader() {
    const loader = document.getElementById("contentLoader");
    if (loader) {
      loader.style.display = "none";
    }
  }

  updateContent(content) {
    const mainContent = document.getElementById("mainContent");
    const loader = document.getElementById("contentLoader");

    if (mainContent) {
      if (loader) {
        loader.style.display = "none";
      }
      mainContent.innerHTML = content + (loader ? loader.outerHTML : "");
    }
  }

  setLoadingState(isLoading) {
    if (isLoading) {
      this.showLoader();
    } else {
      this.hideLoader();
    }
  }

  updateNavigation(activeRoute) {
    const navLinks = document.querySelectorAll(".app-bar__navigation a");
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${activeRoute}`) {
        link.classList.add("active");
      }
    });
  }

  showOfflineIndicator() {
    const existingIndicator = document.querySelector(".offline-indicator");
    if (existingIndicator) return;

    const indicator = document.createElement("div");
    indicator.className = "offline-indicator";
    indicator.innerHTML = `
        <i class="fa-solid fa-wifi-slash"></i>
        <span>You are offline</span>
      `;

    const appBar = document.getElementById("appBar");
    if (appBar) {
      appBar.appendChild(indicator);
    }
  }

  hideOfflineIndicator() {
    const indicator = document.querySelector(".offline-indicator");
    if (indicator) {
      indicator.remove();
    }
  }
}

export default AppShell;
