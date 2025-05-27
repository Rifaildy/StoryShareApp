class LoginPresenter {
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

  async _onFormSubmit(loginData) {
    try {
      if (!this._validateLoginData(loginData)) {
        return;
      }

      this._view.setLoginButtonLoading(true);

      await this._authRepository.login(loginData);

      this._view.handleLoginSuccess();
    } catch (error) {
      this._view.handleLoginError(error.message);
    }
  }

  _validateLoginData(loginData) {
    if (!loginData.email || !loginData.password) {
      this._view.showValidationError("Email and password are required");
      return false;
    }

    if (!this._isValidEmail(loginData.email)) {
      this._view.showValidationError("Please enter a valid email");
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

export default LoginPresenter;
