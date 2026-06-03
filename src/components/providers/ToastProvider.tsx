// src/components/providers/ToastProvider.tsx o en tu layout.tsx
"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                // 🎯 Estilos compartidos para TODOS los toasts
                className: "font-questrial text-xs border border-purple-100/20 bg-black/80 backdrop-blur-md text-white shadow-xl rounded-sm py-3 px-4.5",
                duration: 4000,

                // 🟢 Estilos específicos para casos de Éxito
                success: {
                    iconTheme: {
                        primary: '#a855f7', // Color morado de Tailwind (purple-500)
                        secondary: '#ffffff',
                    },
                    // Si deseas cambiar el fondo o borde solo para success, puedes usar style:
                    style: {
                        borderLeft: '4px solid #a855f7',
                    }
                },

                // 🔴 Estilos específicos para casos de Error
                error: {
                    iconTheme: {
                        primary: '#ef4444', // Rojo de Tailwind (red-500)
                        secondary: '#ffffff',
                    },
                    style: {
                        borderLeft: '4px solid #ef4444',
                    }
                },
            }}
        />
    );
}