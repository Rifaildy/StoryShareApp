class DetailPresenter {
  constructor({ view, storyRepository, authRepository, id }) {
    this._view = view;
    this._storyRepository = storyRepository;
    this._authRepository = authRepository;
    this._id = id;
  }

  async showStoryDetail() {
    try {
      if (!this._authRepository.isLoggedIn()) {
        this._view.handleUnauthenticated();
        return;
      }

      this._view.showLoading();

      const story = await this._storyRepository.getStoryDetail(this._id);

      this._view.displayStory(story);
      this._view.displayStoryLocation(story);
    } catch (error) {
      console.error("Error in detail presenter:", error);

      if (error.message === "Missing authentication") {
        this._view.handleUnauthenticated();
      } else if (error.message.includes("not found")) {
        this._view.showNotFoundError(error.message);
      } else {
        this._view.showError(error.message);
      }
    }
  }
}

export default DetailPresenter;
