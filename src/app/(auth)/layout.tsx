// src/app/(auth)/layout.tsx
"use client";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

// --- DATOS DE LOS SLIDES ---
const ACADEMY_SLIDES = [
  {
    title: "Maestría en Espacios",
    description:
      "Aprende a diseñar experiencias inolvidables gestionando aforos y mapas de asientos de alta complejidad.",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop",
    tag: "Especialización",
  },
  {
    title: "Comunidad Global",
    description:
      "Únete a más de 5,000 estudiantes que ya están transformando la industria de eventos en todo el mundo.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
    tag: "Networking",
  },
  {
    title: "Certificación Elite",
    description:
      "Obtén credenciales respaldadas por las mejores productoras y locales del continente.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
    tag: "Carrera",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Lógica del slider automático intacta
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ACADEMY_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="min-h-screen w-full bg-[#fdf2f8] flex items-center justify-center overflow-hidden font-questrial">
        {/* --- FONDO DINÁMICO (LADO IZQUIERDO) --- */}
        <div className="absolute inset-0 w-full h-full md:w-[60%] overflow-hidden transition-all duration-1000">
          {ACADEMY_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-110 z-0 pointer-events-none"
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />

              {/* 💡 Reemplazado por <img> para evitar el fallo 500 de SSL en desarrollo local */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
              />

              {/* Contenido del Slide */}
              <div className="absolute bottom-20 left-12 md:left-24 z-20 max-w-lg space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                    {slide.tag}
                  </span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white leading-none animate-in fade-in slide-in-from-left-8 duration-700">
                  {slide.title}
                </h2>
                <p className="text-lg text-gray-300/80 leading-relaxed font-light animate-in fade-in slide-in-from-left-12 duration-1000">
                  {slide.description}
                </p>

                {/* Indicadores / Barras de progreso */}
                <div className="flex gap-3 pt-4">
                  {ACADEMY_SLIDES.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 w-12 bg-white/20 rounded-full overflow-hidden"
                    >
                      <div
                        className={`h-full bg-purple-500 transition-all duration-[6000ms] ease-linear ${i === currentSlide ? "w-full" : "w-0"
                          }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- CONTENEDOR DEL FORMULARIO (LADO DERECHO) --- */}
        <div className="relative w-full md:w-[40%] max-h-screen ml-auto flex items-center justify-center p-6 md:p-12 overflow-auto z-20">
          {children}
        </div>
      </div>
    </>
  );
}