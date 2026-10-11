
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

export function setApiCredentials(email, password) {
  api.defaults.auth = {
    username: email,
    password: password,
  };
}

export function clearApiCredentials() {
  delete api.defaults.auth;
}

export default api;
