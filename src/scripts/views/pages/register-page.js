class RegisterPage {
  constructor() {
    this._passwordToggleHandler = this._onTogglePassword.bind(this);
    this._formSubmitHandler = null;
  }

  getTemplate() {
    return `
      <article class="auth-section" aria-labelledby="register-heading">
        <div class="auth-container">
          <header class="auth-header">
            <i class="fa-solid fa-user-plus auth-icon"></i>
            <h2 id="register-heading">Create an Account</h2>
            <p>Join StoryShare and start sharing your stories</p>
          </header>
          
          <form id="registerForm" class="auth-form">
            <div class="form-group">
              <label for="name"><i class="fa-solid fa-user"></i> Name</label>
              <input type="text" id="name" name="name" placeholder="Enter your name" required>
            </div>
            
            <div class="form-group">
              <label for="email"><i class="fa-solid fa-envelope"></i> Email</label>
              <input type="email" id="email" name="email" placeholder="Enter your email" required>
            </div>
            
            <div class="form-group">
              <label for="password"><i class="fa-solid fa-lock"></i> Password</label>
              <div class="password-input-container">
                <input type="password" id="password" name="password" placeholder="Enter your password" required minlength="6">
                <button type="button" id="togglePassword" class="toggle-password" aria-label="Toggle password visibility">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
              <small>Password must be at least 6 characters</small>
            </div>
            
            <div class="form-group">
              <button type="submit" id="registerButton" class="auth-button">
                <i class="fa-solid fa-user-plus"></i> Register
              </button>
            </div>
            
            <footer class="form-footer">
              <p>Already have an account? <a href="#/login">Login here</a></p>
            </footer>
          </form>
        </div>
      </article>
    `;
  }

  setFormSubmitHandler(handler) {
    this._formSubmitHandler = (event) => {
      event.preventDefault();
      const registerData = this.getRegisterData();
      handler(registerData);
    };

    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", this._formSubmitHandler);
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

  getRegisterData() {
    return {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };
  }

  setRegisterButtonLoading(isLoading) {
    const registerButton = document.getElementById("registerButton");
    if (isLoading) {
      registerButton.disabled = true;
      registerButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';
    } else {
      registerButton.disabled = false;
      registerButton.innerHTML =
        '<i class="fa-solid fa-user-plus"></i> Register';
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

  redirectToLoginWithDelay(delay) {
    setTimeout(() => {
      window.location.hash = "#/login";
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

    const registerForm = document.getElementById("registerForm");
    if (registerForm && this._formSubmitHandler) {
      registerForm.removeEventListener("submit", this._formSubmitHandler);
    }
  }


  initializeComponents() {
    this.initPasswordToggle();
  }

  handleAlreadyLoggedIn() {
    this.redirectToHome();
  }

  handleRegisterSuccess() {
    this.showNotification("Registration successful! Please login.", "success");
    this.redirectToLoginWithDelay(1500);
  }

  handleRegisterError(errorMessage) {
    this.showNotification(`Registration failed: ${errorMessage}`, "error");
    this.setRegisterButtonLoading(false);
  }

  showValidationError(message) {
    this.showNotification(message, "error");
  }

  cleanup() {
    this.destroy();
  }
}

export default RegisterPage;
