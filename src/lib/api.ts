import axios from "axios";
import { useAuthStore } from "../store/authStore";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// api.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().token;

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  console.log("🚀 Interceptor token:", token);
  console.log("🚀 Request URL:", config.url);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, role } = useAuthStore.getState();

      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("/api/auths/refreshToken", {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        useAuthStore.getState().setAuth({
          accessToken,
          refreshToken: newRefreshToken,
          roleName: role || "",
        });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
