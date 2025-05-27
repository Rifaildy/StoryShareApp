class HomePresenter {
  constructor({ view, storyRepository, authRepository }) {
    this._view = view;
    this._storyRepository = storyRepository;
    this._authRepository = authRepository;
  }

  async showAllStories() {
    try {
      if (!this._authRepository.isLoggedIn()) {
        this._view.handleUnauthenticated();
        return;
      }

      this._view.showLoading();

      const stories = await this._storyRepository.getAllStories();

      this._view.displayStories(stories);
      this._view.displayStoriesOnMap(stories);
    } catch (error) {
      console.error("Error in home presenter:", error);

      if (error.message === "Missing authentication") {
        this._view.handleUnauthenticated();
      } else {
        this._view.showError(error.message);
      }
    }
  }
}

export default HomePresenter;
