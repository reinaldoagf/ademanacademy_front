// src/components/layout/LogoSpinner.tsx
"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react"; // Usando un icono como fallback o logo temporal

interface LogoSpinnerProps {
    size?: "sm" | "md" | "lg";
    withOverlay?: boolean; // Por si quieres bloquear toda la pantalla
}

export default function LogoSpinner({ size = "md", withOverlay = false }: LogoSpinnerProps) {
    // Dimensiones dinámicas según el tamaño requerido
    const sizeClasses = {
        sm: { container: "w-16 h-16", ring: "border-2", logo: "w-6 h-6" },
        md: { container: "w-24 h-24", ring: "border-3", logo: "w-10 h-10" },
        lg: { container: "w-32 h-32", ring: "border-4", logo: "w-14 h-14" },
    };

    const currentSize = sizeClasses[size];

    const SpinnerContent = () => (
        <div className={`relative flex items-center justify-center ${currentSize.container}`}>
            {/* ANILLO EXTERIOR DE CARGA (Gira) */}
            <div
                className={`absolute inset-0 rounded-full animate-spin border-t-[#5e0472] border-r-transparent border-b-[#5e0472] border-l-transparent ${currentSize.ring}`}
            />

            {/* CONTENEDOR DEL LOGO INTERIOR (Estático con pulso) */}
            <div className="absolute flex items-center justify-center bg-white rounded-full p-2 shadow-sm animate-pulse">
                {/* OPCIÓN A: Si usas una imagen (Descomenta cuando tengas el archivo) */}
                <Image
                    src="/img/isotipo1.png"
                    alt="App Logo"
                    width={40}
                    height={40}
                    className={currentSize.logo}
                />


                {/* OPCIÓN B: Usando un Icono de Lucide (Estilo actual de tu app) */}
                {/* <Sparkles className={`${currentSize.logo} text-[#5e0472]`} /> */}
            </div>
        </div>
    );

    // Si se pide con Overlay, centra el spinner cubriendo toda la pantalla trasera
    if (withOverlay) {
        return (
            <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
                <SpinnerContent />
            </div>
        );
    }

    return <SpinnerContent />;
}