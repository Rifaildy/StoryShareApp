import "regenerator-runtime";
import "./styles/main.css";
import "./styles/responsive.css";
import App from "./scripts/app";
import swRegister from "./scripts/utils/sw-register";
import AuthRepository from "./scripts/data/auth-repository";

const authRepository = new AuthRepository();

const app = new App({
  button: document.querySelector("#hamburgerButton"),
  drawer: document.querySelector("#navigationDrawer"),
  content: document.querySelector("#mainContent"),
});

window.addEventListener("hashchange", async () => {
  if (document.startViewTransition) {
    await document.startViewTransition(async () => {
      app.renderPage();
      updateAuthMenu();
    }).finished;
  } else {
    app.renderPage();
    updateAuthMenu();
  }
});

window.addEventListener("load", async () => {
  updateAuthMenu();

  if (document.startViewTransition) {
    await document.startViewTransition(async () => {
      app.renderPage();
    }).finished;
  } else {
    app.renderPage();
  }

  await swRegister();
});

const updateAuthMenu = () => {
  const authMenu = document.getElementById("authMenu");

  if (authRepository.isLoggedIn()) {
    const name = authRepository.getName();
    authMenu.innerHTML = `
      <div class="user-menu">
        <span class="user-name"><i class="fa-solid fa-user"></i> ${name}</span>
        <button id="logoutButton" class="logout-button"><i class="fa-solid fa-sign-out-alt"></i> Logout</button>
      </div>
    `;

    document.getElementById("logoutButton").addEventListener("click", () => {
      authRepository.logout();
      updateAuthMenu();
      window.location.hash = "#/login";
    });
  } else {
    authMenu.innerHTML = `<a href="#/login"><i class="fa-solid fa-sign-in-alt"></i> Login</a>`;
  }
};
