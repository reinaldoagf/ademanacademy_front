import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Client } from "@/types/client";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    countryCode: string;
    phone: string;
    IDNumberPrefix: string;
    dni: string;
    birthDate: string;
    email: string;
    isAdmin: boolean;
    isEmployee: boolean;
    profileType: "Representante" | "Estudiante";
    profileOnboarding: boolean;
    client?: Client;
    clients?: Client[];
}

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            logout: () => set({ user: null }),
        }),
        {
            name: "auth-session", // Nombre de la clave en localStorage
        }
    )
);