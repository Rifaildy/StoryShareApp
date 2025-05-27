import CONFIG from "./config";

const API_ENDPOINT = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  LIST: `${CONFIG.BASE_URL}/stories`,
  DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  ADD: `${CONFIG.BASE_URL}/stories`,
};

export default API_ENDPOINT;
