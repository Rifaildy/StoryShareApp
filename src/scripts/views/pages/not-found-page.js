class NotFoundPage {
  constructor() {
    // No initialization needed
  }

  getTemplate() {
    return `
        <article class="not-found-section" aria-labelledby="not-found-heading">
          <div class="not-found-container">
            <div class="not-found-content">
              <div class="not-found-icon">
                <i class="fa-solid fa-face-sad-tear"></i>
              </div>
              
              <h1 id="not-found-heading" class="not-found-title">404 - Page Not Found</h1>
              
              <p class="not-found-message">
                Oops! The page you're looking for doesn't exist or may have been moved.
              </p>
              
              <div class="not-found-suggestions">
                <h3>What you can do:</h3>
                <ul>
                  <li><i class="fa-solid fa-home"></i> Go back to the <a href="#/home">homepage</a></li>
                  <li><i class="fa-solid fa-plus"></i> <a href="#/add">Add a new story</a></li>
                  <li><i class="fa-solid fa-heart"></i> Check your <a href="#/favorites">favorite stories</a></li>
                  <li><i class="fa-solid fa-search"></i> Browse all available stories</li>
                </ul>
              </div>
              
              <div class="not-found-actions">
                <a href="#/home" class="button primary-button">
                  <i class="fa-solid fa-home"></i> Back to Home
                </a>
                <a href="#/add" class="button secondary-button">
                  <i class="fa-solid fa-plus"></i> Add Story
                </a>
              </div>
              
              <div class="not-found-help">
                <p class="help-text">
                  If you think this is an error, please check the URL or try refreshing the page.
                </p>
                <button id="refreshButton" class="refresh-button">
                  <i class="fa-solid fa-refresh"></i> Refresh Page
                </button>
              </div>
            </div>
            
            <div class="not-found-illustration">
              <div class="floating-elements">
                <div class="floating-element">📚</div>
                <div class="floating-element">📖</div>
                <div class="floating-element">✨</div>
                <div class="floating-element">🔍</div>
              </div>
            </div>
          </div>
        </article>
      `;
  }

  async afterRender() {
    this.initEventListeners();
    this.startFloatingAnimation();
  }

  initEventListeners() {
    const refreshButton = document.getElementById("refreshButton");
    if (refreshButton) {
      refreshButton.addEventListener("click", () => {
        window.location.reload();
      });
    }

    const links = document.querySelectorAll(".not-found-section a");
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        console.log("404 page navigation:", event.target.href);
      });
    });
  }

  startFloatingAnimation() {
    const elements = document.querySelectorAll(".floating-element");
    elements.forEach((element, index) => {
      const delay = Math.random() * 2;
      const duration = 3 + Math.random() * 2;

      element.style.animationDelay = `${delay}s`;
      element.style.animationDuration = `${duration}s`;
    });
  }
}

export default NotFoundPage;
