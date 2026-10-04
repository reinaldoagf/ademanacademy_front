// src/components/home/EventsCarouselSection.tsx
"use client";

import { useState } from "react";
import {
    Calendar,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Ticket,
    Globe,
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
    // Helper para construir la URL de la imagen (S3 o estática local)
    const getImageUrl = (url?: string | null) => {
        if (!url) return "/img/default.png";
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url; // Es una URL completa de S3 o externa
        }
        return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`; // Es una ruta relativa del backend
    };
    // Formato de fechas
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <section id="eventos" className="py-24 bg-neutral-900 text-white px-6 md:px-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* ENCABEZADO DE SECCIÓN */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <span className="text-pink-500 font-bold uppercase tracking-widest text-xs">
                            Próximas Funciones & Shows
                        </span>
                        <h2 className="text-4xl md:text-6xl font-anton uppercase text-white tracking-wide">
                            Eventos Destacados
                        </h2>
                    </div>

                    {/* Botones de Navegación del Carrusel */}
                    {events.length > 1 && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrev}
                                aria-label="Evento anterior"
                                className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-pink-500 hover:text-pink-400 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-mono text-neutral-400 px-2">
                                0{currentIndex + 1} / 0{events.length}
                            </span>
                            <button
                                onClick={handleNext}
                                aria-label="Siguiente evento"
                                className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-pink-500 hover:text-pink-400 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* TARJETA PRINCIPAL DEL EVENTO (SLIDE) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-neutral-950 border border-neutral-800">

                    {/* Columna Izquierda: Flyer / Imagen */}
                    <div className="lg:col-span-5 relative min-h-[380px] lg:min-h-[500px] bg-black overflow-hidden group">
                        <img src={coverImage}
                            alt={currentEvent.name}
                            className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        {/* Badges en la Imagen */}
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                            {currentEvent.isPresaleActive && (
                                <span className="bg-pink-600 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1">
                                    Preventa Activa
                                </span>
                            )}
                            <span className="bg-neutral-900/90 text-neutral-300 border border-white/10 font-medium text-[10px] uppercase tracking-wider px-3 py-1">
                                {currentEvent.type}
                            </span>
                        </div>
                    </div>

                    {/* Columna Derecha: Detalle e Información */}
                    <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between space-y-8">
                        <div className="space-y-6">

                            {/* Fechas y Lugar */}
                            <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-400 font-light border-b border-neutral-800 pb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-pink-500" />
                                    <span>
                                        {formatDate(currentEvent.startDate)}
                                        {currentEvent.startDate !== currentEvent.endDate &&
                                            ` - ${formatDate(currentEvent.endDate)}`}
                                    </span>
                                </div>
                                {currentEvent.seatingMap?.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-pink-500" />
                                        <span>{currentEvent.seatingMap.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Título y Descripción */}
                            <div className="space-y-3">
                                <h3 className="font-anton text-3xl md:text-5xl uppercase text-white tracking-wide leading-tight">
                                    {currentEvent.name}
                                </h3>
                                {currentEvent.description && (
                                    <p className="text-neutral-400 text-sm font-light line-clamp-3 leading-relaxed">
                                        {currentEvent.description}
                                    </p>
                                )}
                            </div>

                            {/* Galería Miniatura de Imágenes adicionales */}
                            {currentEvent.images.length > 1 && (
                                <div className="space-y-2 pt-2">
                                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">
                                        Galería del Evento
                                    </span>
                                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                                        {currentEvent.images.map((img) => (
                                            <div
                                                key={img.id}
                                                className="w-16 h-16 shrink-0 border border-neutral-800 overflow-hidden bg-black"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.altText || currentEvent.name}
                                                    className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 🎯 SECCIÓN DE PATROCINADORES / MARCAS - CARRUSEL AUTOMÁTICO */}
                            {currentEvent.sponsors && currentEvent.sponsors.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-neutral-800">
                                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold block">
                                        Patrocinadores Oficiales
                                    </span>

                                    {/* Contenedor principal con máscara para desvanecer bordes (Efecto elegante) */}
                                    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">

                                        {/* Track del carrusel deslizante */}
                                        <div className="flex w-max animate-marquee gap-4 hover:[animation-play-state:paused]">
                                            {/* Duplicamos la lista para lograr el bucle infinito imperceptible */}
                                            {[...currentEvent.sponsors, ...currentEvent.sponsors].map((sponsor, idx) => (
                                                <div
                                                    key={`${sponsor.id}-${idx}`}
                                                    className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 hover:border-neutral-700 transition-colors shrink-0"
                                                >
                                                    <img
                                                        src={sponsor.logoUrl}
                                                        alt={sponsor.name}
                                                        className="h-6 w-auto object-contain max-w-[80px] grayscale hover:grayscale-0 transition-all"
                                                    />
                                                    <span className="text-[11px] font-medium text-neutral-300 whitespace-nowrap">
                                                        {sponsor.name}
                                                    </span>

                                                    {/* Redes o Web del sponsor */}
                                                    {sponsor.websiteUrl && (
                                                        <a
                                                            href={sponsor.websiteUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-neutral-500 hover:text-pink-400 ml-1"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                    {sponsor.socialLinks?.instagram && (
                                                        <a
                                                            href={`https://instagram.com/${sponsor.socialLinks.instagram.replace("@", "")}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-neutral-500 hover:text-pink-400"
                                                        >
                                                            <User className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Acción de Reserva / Comprar Boletos */}
                        <div className="pt-6">
                            <a
                                href={`/events/${currentEvent.id}`}
                                className="inline-flex items-center justify-center gap-3 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 transition-all w-full sm:w-auto text-center"
                            >
                                <Ticket className="w-4 h-4" /> Comprar Entradas
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}