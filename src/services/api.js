import { BACKEND_URL } from "./config.js";
import { getToken, logout } from "../utils/storage.js";

async function request(path, options = {}) {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not set in app.json");
  }

  // Get token for authenticated requests
  const token = await getToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      headers,
      ...options,
    });

    if (response.status === 401) {
      // Token expired or invalid
      await logout();
      throw new Error("Authentication failed. Please login again.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

export const Api = {
  // Auth endpoints
  login(credentials) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register(userData) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  getProfile() {
    return request("/api/auth/profile");
  },

  // Sensor data endpoints
  getSensorReadings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return request(`/api/readings?${queryString}`);
  },
   getSensorReadingsWithPagination(page = 1, limit = 10) {
    return request(`/api/readings?page=${page}&limit=${limit}`);
  },

  createReading(payload) {
    return request("/api/readings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getDifferences() {
    return request("/api/differences");
  },

  getThresholds() {
    return request("/api/thresholds");
  },

  createThreshold(payload) {
    return request("/api/thresholds", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};