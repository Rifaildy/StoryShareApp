import HomePage from "../views/pages/home-page";
import DetailPage from "../views/pages/detail-page";
import AddStoryPage from "../views/pages/add-story-page";
import LoginPage from "../views/pages/login-page";
import RegisterPage from "../views/pages/register-page";
import HomePresenter from "../presenters/home-presenter";
import DetailPresenter from "../presenters/detail-presenter";
import AddStoryPresenter from "../presenters/add-story-presenter";
import LoginPresenter from "../presenters/login-presenter";
import RegisterPresenter from "../presenters/register-presenter";
import StoryRepository from "../data/story-repository";
import AuthRepository from "../data/auth-repository";

const storyRepository = new StoryRepository();
const authRepository = new AuthRepository();

const routes = {
  "/": {
    view: new HomePage(),
    presenter: (view) =>
      new HomePresenter({
        view,
        storyRepository,
        authRepository,
      }),
    render: function () {
      return this.view.getTemplate();
    },
    afterRender: async function () {
      const presenter = this.presenter(this.view);
      await presenter.showAllStories();
    },
  },
  "/home": {
    view: new HomePage(),
    presenter: (view) =>
      new HomePresenter({
        view,
        storyRepository,
        authRepository,
      }),
    render: function () {
      return this.view.getTemplate();
    },
    afterRender: async function () {
      const presenter = this.presenter(this.view);
      await presenter.showAllStories();
    },
  },
  "/detail/:id": {
    view: new DetailPage(),
    presenter: (view, id) =>
      new DetailPresenter({
        view,
        storyRepository,
        authRepository,
        id,
      }),
    render: function () {
      return this.view.getTemplate();
    },
    afterRender: async function () {
      const url = window.location.hash.slice(1).toLowerCase();
      const splitedUrl = url.split("/");
      const id = splitedUrl[2];

      const presenter = this.presenter(this.view, id);
      await presenter.showStoryDetail();
    },
  },
  "/add": {
    view: new AddStoryPage(),
    presenter: (view) =>
      new AddStoryPresenter({
        view,
        storyRepository,
        authRepository,
      }),
    render: function () {
      return this.view.getTemplate();
    },
    afterRender: async function () {
      const presenter = this.presenter(this.view);
      await presenter.init();

      return () => {
        presenter.destroy();
      };
    },
  },
  "/login": {
    view: new LoginPage(),
    presenter: (view) =>
      new LoginPresenter({
        view,
        authRepository,
      }),
    render: function () {
      return this.view.getTemplate();
    },
    afterRender: function () {
      const presenter = this.presenter(this.view);
      presenter.init();

      return () => {
        presenter.destroy();
      };
    },
  },
  "/register": {
    view: new RegisterPage(),
    presenter: (view) =>
      new RegisterPresenter({
        view,
        authRepository,
      }),
    render: function () {
      return this.view.getTemplate();
    },
    afterRender: function () {
      const presenter = this.presenter(this.view);
      presenter.init();

      return () => {
        presenter.destroy();
      };
    },
  },
};

export default routes;
