class HomePresenter {
  constructor({ view, storyRepository, authRepository }) {
    this._view = view;
    this._storyRepository = storyRepository;
    this._authRepository = authRepository;
  }

  async showAllStories() {
    try {
      // Check authentication through model
      if (!this._authRepository.isLoggedIn()) {
        console.log("User not authenticated, redirecting to login");
        this._view.handleUnauthenticated();
        return;
      }

      // Show loading state through view
      this._view.showLoading();

      try {
        // Get data through model
        console.log("Fetching stories...");
        const stories = await this._storyRepository.getAllStories();

        if (stories && stories.length > 0) {
          console.log("Stories loaded successfully:", stories.length);
          // Send data to view for display
          this._view.displayStories(stories);
          this._view.displayStoriesOnMap(stories);
        } else {
          console.log("No stories found");
          this._view.displayStories([]);
          this._view.displayStoriesOnMap([]);
        }
      } catch (error) {
        console.error("Error fetching stories:", error);

        if (error.message === "Missing authentication") {
          this._view.handleUnauthenticated();
        } else if (error.message.includes("No cached data available")) {
          this._view.showError(
            "No stories available. Please check your internet connection and try again."
          );
        } else {
          this._view.showError(error.message);
        }
      }
    } catch (error) {
      console.error("Error in home presenter:", error);
      this._view.showError("Something went wrong. Please try again.");
    }
  }
}

export default HomePresenter;
