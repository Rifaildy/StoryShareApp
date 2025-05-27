class RegisterPresenter {
  constructor({ view, authRepository }) {
    this._view = view;
    this._authRepository = authRepository;
  }

  init() {
    if (this._authRepository.isLoggedIn()) {
      this._view.handleAlreadyLoggedIn();
      return;
    }

    this._view.initializeComponents();
    this._view.setFormSubmitHandler(this._onFormSubmit.bind(this));
  }

  async _onFormSubmit(registerData) {
    try {
      if (!this._validateRegisterData(registerData)) {
        return;
      }

      this._view.setRegisterButtonLoading(true);

      await this._authRepository.register(registerData);

      this._view.handleRegisterSuccess();
    } catch (error) {
      this._view.handleRegisterError(error.message);
    }
  }

  _validateRegisterData(registerData) {
    if (!registerData.name || !registerData.email || !registerData.password) {
      this._view.showValidationError("All fields are required");
      return false;
    }

    if (!this._isValidEmail(registerData.email)) {
      this._view.showValidationError("Please enter a valid email");
      return false;
    }

    if (registerData.password.length < 6) {
      this._view.showValidationError("Password must be at least 6 characters");
      return false;
    }

    return true;
  }

  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  destroy() {
    this._view.cleanup();
  }
}

export default RegisterPresenter;
