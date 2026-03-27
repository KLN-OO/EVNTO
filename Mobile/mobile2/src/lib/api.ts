import axios from 'axios';
import { getToken, removeToken } from './storage';

// Adaptez ici l'adresse IPv4 de ton PC (TP2) pour examen mobile
const API_BASE_URL = 'http://172.20.10.5:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await removeToken();
        }
        return Promise.reject(error);
    }
);

export default api;
