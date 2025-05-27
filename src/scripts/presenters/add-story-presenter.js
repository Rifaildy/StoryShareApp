class AddStoryPresenter {
  constructor({ view, storyRepository, authRepository }) {
    this._view = view;
    this._storyRepository = storyRepository;
    this._authRepository = authRepository;
  }

  async init() {
    if (!this._authRepository.isLoggedIn()) {
      this._view.handleUnauthenticated();
      return;
    }

    this._view.initializeComponents();

    this._view.setFormSubmitHandler(this._onFormSubmit.bind(this));
  }

  async _onFormSubmit(formData) {
    try {
      if (!this._validateFormData(formData)) {
        return;
      }

      this._view.setSubmitButtonLoading(true);

      await this._storyRepository.addNewStory(formData);

      this._view.handleSubmitSuccess();
    } catch (error) {
      console.error("Error submitting story:", error);

      this._view.handleSubmitError(error.message);
    }
  }

  _validateFormData(formData) {
    const description = formData.get("description");
    const photo = formData.get("photo");

    if (!description || description.trim().length === 0) {
      this._view.showValidationError("Description is required");
      return false;
    }

    if (!photo) {
      this._view.showValidationError("Photo is required");
      return false;
    }

    return true;
  }

  destroy() {
    this._view.cleanup();
  }
}

export default AddStoryPresenter;
