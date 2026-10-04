// src/components/home/EventsCarouselSection.tsx
"use client";

import { useState } from "react";
import {
    Calendar,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Ticket,
    Award,
    User,
    ExternalLink,
} from "lucide-react";

// Tipos adaptados al Schema de Prisma
export interface EventImageItem {
    id: string;
    url: string;
    altText?: string | null;
    type: "cover" | "banner" | "gallery";
    order: number;
}

export interface SponsorItem {
    id: string;
    name: string;
    logoUrl: string;
    tier: "main" | "gold" | "silver" | "bronze";
    websiteUrl?: string | null;
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
    } | null;
}

export interface HomeEventItem {
    id: string;
    name: string;
    type: string;
    startDate: string | Date;
    endDate: string | Date;
    isPresaleActive: boolean;
    presaleStartDate?: string | Date | null;
    presaleEndDate?: string | Date | null;
    description?: string | null;
    images: EventImageItem[];
    sponsors: SponsorItem[];
    seatingMap?: { location: string } | null;
}

interface EventsCarouselSectionProps {
    events: HomeEventItem[];
}

export default function EventsCarouselSection({ events }: EventsCarouselSectionProps) {
    const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";

    const [currentIndex, setCurrentIndex] = useState(0);

    if (!events || events.length === 0) {
        return null; // No muestra la sección si no hay eventos promocionados
    }

    const currentEvent = events[currentIndex];

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % events.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
    };

    // Buscar imagen de portada o banner, fallback a la primera disponible o placeholder
    const coverImage =
        currentEvent.images.find((img) => img.type === "cover" || img.type === "banner")?.url ||
        currentEvent.images[0]?.url ||
        "/img/default.png";
    // Formato de fechas
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <section id="eventos" className="py-20 md:py-32 bg-black text-white relative overflow-hidden">
            {/* Ambient Background Glow (Efecto de iluminación ambiental premium) */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-pink-600/10 blur-[140px] pointer-events-none rounded-full" />
            <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-purple-900/10 blur-[120px] pointer-events-none rounded-full" />

            <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 space-y-10 relative z-10">

                {/* ENCABEZADO DE SECCIÓN */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800/80 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                            <span className="text-pink-500 font-bold uppercase tracking-[0.25em] text-[11px]">
                                Próximas Funciones & Shows VIP
                            </span>
                        </div>
                        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-anton uppercase text-white tracking-wide">
                            Eventos <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">Destacados</span>
                        </h2>
                    </div>

                    {/* Botones de Navegación del Carrusel */}
                    {events.length > 1 && (
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono tracking-widest text-neutral-400 bg-neutral-900/80 border border-white/10 px-4 py-3 rounded-full">
                                <span className="text-pink-500 font-bold">0{currentIndex + 1}</span> / 0{events.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrev}
                                    aria-label="Evento anterior"
                                    className="w-12 h-12 rounded-full border border-white/15 bg-neutral-900/50 backdrop-blur-md flex items-center justify-center hover:border-pink-500 hover:bg-pink-500/10 hover:text-pink-400 transition-all duration-300 active:scale-95"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    aria-label="Siguiente evento"
                                    className="w-12 h-12 rounded-full border border-white/15 bg-neutral-900/50 backdrop-blur-md flex items-center justify-center hover:border-pink-500 hover:bg-pink-500/10 hover:text-pink-400 transition-all duration-300 active:scale-95"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTENEDOR PRINCIPAL DEL EVENTO (FULL-WIDTH CARD) */}
                <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">

                        {/* Columna Izquierda: Image & Poster Highlight */}
                        <div className="lg:col-span-5 relative min-h-[420px] lg:min-h-[580px] bg-black overflow-hidden group">
                            <img
                                src={coverImage}
                                alt={currentEvent.name}
                                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out"
                            />
                            {/* Overlay Degrada Gráfico */}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-neutral-950/40 lg:to-neutral-950" />

                            {/* Badges Flotantes sobre la Imagen */}
                            <div className="absolute top-6 left-6 flex flex-wrap gap-2.5 z-10">
                                {currentEvent.isPresaleActive && (
                                    <span className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg shadow-pink-600/30 backdrop-blur-md">
                                        Preventa Activa
                                    </span>
                                )}
                                <span className="bg-black/70 backdrop-blur-md text-neutral-200 border border-white/15 font-semibold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full">
                                    {currentEvent.type}
                                </span>
                            </div>
                        </div>

                        {/* Columna Derecha: Detalle e Información del Evento */}
                        <div className="lg:col-span-7 p-8 md:p-12 lg:p-14 flex flex-col justify-between space-y-8 relative">
                            <div className="space-y-6">

                                {/* Metadata: Fecha y Lugar */}
                                <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-300 font-medium border-b border-neutral-800/80 pb-5">
                                    <div className="flex items-center gap-2.5 bg-neutral-900/90 border border-white/10 px-3.5 py-2 rounded-lg">
                                        <Calendar className="w-4 h-4 text-pink-500" />
                                        <span>
                                            {formatDate(currentEvent.startDate)}
                                            {currentEvent.startDate !== currentEvent.endDate &&
                                                ` - ${formatDate(currentEvent.endDate)}`}
                                        </span>
                                    </div>
                                    {currentEvent.seatingMap?.location && (
                                        <div className="flex items-center gap-2.5 bg-neutral-900/90 border border-white/10 px-3.5 py-2 rounded-lg">
                                            <MapPin className="w-4 h-4 text-pink-500" />
                                            <span>{currentEvent.seatingMap.location}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Título y Descripción */}
                                <div className="space-y-4">
                                    <h3 className="font-anton text-4xl sm:text-5xl lg:text-6xl uppercase text-white tracking-wide leading-none">
                                        {currentEvent.name}
                                    </h3>
                                    {currentEvent.description && (
                                        <p className="text-neutral-300 text-sm md:text-base font-light line-clamp-3 leading-relaxed max-w-2xl">
                                            {currentEvent.description}
                                        </p>
                                    )}
                                </div>

                                {/* Galería Miniatura de Imágenes */}
                                {currentEvent.images && currentEvent.images.length > 1 && (
                                    <div className="space-y-3 pt-2">
                                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                                            Galería del Evento
                                        </span>
                                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                                            {currentEvent.images.map((img: any) => (
                                                <div
                                                    key={img.id}
                                                    className="w-20 h-20 shrink-0 rounded-xl border border-white/10 overflow-hidden bg-black group/thumb cursor-pointer transition-all hover:border-pink-500/80"
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt={img.altText || currentEvent.name}
                                                        className="w-full h-full object-cover opacity-60 group-hover/thumb:opacity-100 group-hover/thumb:scale-110 transition-all duration-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botón de Acción Principal */}
                            <div className="pt-6 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <a
                                    href={`/events/${currentEvent.id}`}
                                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-xl shadow-lg shadow-pink-600/25 transition-all duration-300 hover:scale-[1.02] active:scale-95 w-full sm:w-auto text-center"
                                >
                                    <Ticket className="w-4 h-4" /> Comprar Entradas
                                </a>
                                <span className="text-[11px] text-neutral-500 font-mono tracking-wider">
                                    Acceso Garantizado & Ticket Digital
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 🎯 SECCIÓN DE PATROCINADORES PREMIUM (MARQUESINA DESTACADA FULL-WIDTH) */}
                    {currentEvent.sponsors && currentEvent.sponsors.length > 0 && (
                        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900/90 to-neutral-950 border-t border-white/10 py-6 px-4 md:px-8 space-y-4">
                            <div className="flex items-center justify-between max-w-7xl mx-auto px-2">
                                <div className="flex items-center gap-2">
                                    <Award className="w-3.5 h-3.5 text-pink-500" />
                                    <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold">
                                        Patrocinadores Oficiales & Partners
                                    </span>
                                </div>
                            </div>

                            {/* Contenedor marquesina infinito con máscara para bordes difuminados */}
                            <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                                <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused] py-1">
                                    {[...currentEvent.sponsors, ...currentEvent.sponsors, ...currentEvent.sponsors].map((sponsor: any, idx: number) => (
                                        <div
                                            key={`${sponsor.id}-${idx}`}
                                            className="flex items-center gap-3 bg-black/50 border border-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl hover:border-pink-500/50 hover:bg-neutral-900/80 transition-all duration-300 shrink-0 group/sponsor"
                                        >
                                            <img
                                                src={sponsor.logoUrl}
                                                alt={sponsor.name}
                                                className="h-7 w-auto object-contain max-w-[90px] grayscale opacity-70 group-hover/sponsor:grayscale-0 group-hover/sponsor:opacity-100 transition-all duration-300"
                                            />
                                            <span className="text-xs font-semibold text-neutral-300 group-hover/sponsor:text-white transition-colors whitespace-nowrap">
                                                {sponsor.name}
                                            </span>

                                            {/* Links sociales */}
                                            <div className="flex items-center gap-1.5 ml-1 border-l border-neutral-800 pl-2">
                                                {sponsor.websiteUrl && (
                                                    <a
                                                        href={sponsor.websiteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-neutral-500 hover:text-pink-400 transition-colors p-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                                {sponsor.socialLinks?.instagram && (
                                                    <a
                                                        href={`https://instagram.com/${sponsor.socialLinks.instagram.replace("@", "")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-neutral-500 hover:text-pink-400 transition-colors p-1"
                                                    >
                                                        <User className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}