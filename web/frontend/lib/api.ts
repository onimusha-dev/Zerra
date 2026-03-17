import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor for Auth
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('zerra_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

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

// Response Interceptor for Error Handling
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
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    '/api/auth/refresh-token',
                    {},
                    { withCredentials: true },
                );

                if (data?.data?.accessToken) {
                    useAuthStore.getState().setToken(data.data.accessToken);
                    api.defaults.headers.common['Authorization'] =
                        `Bearer ${data.data.accessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;

                    processQueue(null, data.data.accessToken);
                    return api(originalRequest);
                } else {
                    throw new Error('No token returned');
                }
            } catch (err) {
                processQueue(err, null);
                console.warn('[API] Session expired. Please log in again.');
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
