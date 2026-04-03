import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

// Automatically pick backend based on environment
const API_URL =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:9000'
        : 'https://zerra-backend-378c.onrender.com';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// === Request Interceptor for Auth ===
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('zerra_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// === Token Refresh Queue Handling ===
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// === Response Interceptor for Error Handling & Token Refresh ===
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            error.config.url !== '/auth/refresh-token'
        ) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${API_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true },
                );

                const newToken = data?.data?.accessToken || data?.accessToken;

                if (newToken) {
                    useAuthStore.getState().setToken(newToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;

                    processQueue(null, newToken);
                    return api(originalRequest);
                } else {
                    throw new Error('Refresh failed - no token returned');
                }
            } catch (err) {
                processQueue(err, null);
                console.warn('[API] Session expired or refresh failed.');
                if (typeof window !== 'undefined') {
                    useAuthStore.getState().logout();
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export default api;
