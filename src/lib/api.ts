// src/lib/api.ts (Configuración de Axios única)
import axios from "axios";
import { cookies } from "next/headers";

const api = axios.create({
    baseURL: process.env.NEST_BACKEND_URL || "http://localhost:3000",
});

// Interceptor en el servidor de Next.js
api.interceptors.request.use(async (config) => {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;