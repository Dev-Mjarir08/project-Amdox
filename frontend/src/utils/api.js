import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("amdox_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("amdox_token");
      // Check if not already on login page to prevent redirect loops
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export async function apiFetch(url, options = {}) {
  try {
    let data = options.body;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // use raw string
      }
    }

    const config = {
      url,
      method: options.method || "GET",
      headers: options.headers || {},
      data,
    };

    const res = await axiosInstance(config);
    return res.data;
  } catch (error) {
    const errMsg = error.response?.data?.error || error.message || "Request failed";
    throw new Error(errMsg);
  }
}

export default axiosInstance;
