class LoginPage {
  constructor() {
    this._passwordToggleHandler = this._onTogglePassword.bind(this);
    this._formSubmitHandler = null;
  }

  getTemplate() {
    return `
      <article class="auth-section" aria-labelledby="login-heading">
        <div class="auth-container">
          <header class="auth-header">
            <i class="fa-solid fa-sign-in-alt auth-icon"></i>
            <h2 id="login-heading">Login to StoryShare</h2>
            <p>Welcome back! Please login to continue</p>
          </header>
          
          <form id="loginForm" class="auth-form">
            <div class="form-group">
              <label for="email"><i class="fa-solid fa-envelope"></i> Email</label>
              <input type="email" id="email" name="email" placeholder="Enter your email" required>
            </div>
            
            <div class="form-group">
              <label for="password"><i class="fa-solid fa-lock"></i> Password</label>
              <div class="password-input-container">
                <input type="password" id="password" name="password" placeholder="Enter your password" required>
                <button type="button" id="togglePassword" class="toggle-password" aria-label="Toggle password visibility">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <button type="submit" id="loginButton" class="auth-button">
                <i class="fa-solid fa-sign-in-alt"></i> Login
              </button>
            </div>
            
            <footer class="form-footer">
              <p>Don't have an account? <a href="#/register">Register here</a></p>
            </footer>
          </form>
        </div>
      </article>
    `;
  }

  setFormSubmitHandler(handler) {
    this._formSubmitHandler = (event) => {
      event.preventDefault();
      const loginData = this.getLoginData();
      handler(loginData);
    };

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", this._formSubmitHandler);
    }
  }

  initPasswordToggle() {
    const togglePasswordButton = document.getElementById("togglePassword");
    if (togglePasswordButton) {
      togglePasswordButton.addEventListener(
        "click",
        this._passwordToggleHandler
      );
    }
  }

  _onTogglePassword() {
    const passwordInput = document.getElementById("password");
    const togglePasswordButton = document.getElementById("togglePassword");

    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    togglePasswordButton.innerHTML =
      type === "password"
        ? '<i class="fa-solid fa-eye"></i>'
        : '<i class="fa-solid fa-eye-slash"></i>';
  }

  getLoginData() {
    return {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };
  }

  setLoginButtonLoading(isLoading) {
    const loginButton = document.getElementById("loginButton");
    if (isLoading) {
      loginButton.disabled = true;
      loginButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
    } else {
      loginButton.disabled = false;
      loginButton.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> Login';
    }
  }

  showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fa-solid ${
        type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
      }"></i>
      <p>${message}</p>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  redirectToHome() {
    window.location.hash = "#/home";
  }

  redirectToHomeWithDelay(delay) {
    setTimeout(() => {
      window.location.hash = "#/home";
    }, delay);
  }

  destroy() {
    const togglePasswordButton = document.getElementById("togglePassword");
    if (togglePasswordButton) {
      togglePasswordButton.removeEventListener(
        "click",
        this._passwordToggleHandler
      );
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm && this._formSubmitHandler) {
      loginForm.removeEventListener("submit", this._formSubmitHandler);
    }
  }


  initializeComponents() {
    this.initPasswordToggle();
  }

  handleAlreadyLoggedIn() {
    this.redirectToHome();
  }

  handleLoginSuccess() {
    this.showNotification("Login successful!", "success");
    this.redirectToHomeWithDelay(1000);
  }

  handleLoginError(errorMessage) {
    this.showNotification(`Login failed: ${errorMessage}`, "error");
    this.setLoginButtonLoading(false);
  }

  showValidationError(message) {
    this.showNotification(message, "error");
  }

  cleanup() {
    this.destroy();
  }
}

export default LoginPage;
