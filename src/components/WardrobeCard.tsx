"use client";
import { useState, useEffect } from "react";
import {
    Tag,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Pencil
} from "lucide-react";
import Badge from "@/components/common/Badge";
// Props tipadas (puedes cambiar 'any' por tu interfaz si lo prefieres)
interface WardrobeCardProps {
    costume: any;
    onEdit?: (costume: any) => void;
    onDelete?: (costume: any) => void;
}
export function WardrobeCard({ costume, onEdit, onDelete }: WardrobeCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false); // Estado para pausar el Autoplay

    const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";

    // 🎯 Normalizar y sanitizar las URLs de las imágenes
    let images: string[] = [];
    try {
        let rawImages: any[] = [];

        if (typeof costume.images === "string") {
            rawImages = JSON.parse(costume.images);
        } else if (Array.isArray(costume.images)) {
            rawImages = costume.images;
        }

        if (rawImages && rawImages.length > 0) {
            images = rawImages.map((img: any) => {
                const path = typeof img === 'object' ? img.url || img.path : img;

                // Si la ruta ya es una URL absoluta (comienza con http o https), la dejamos intacta
                if (path.startsWith('http://') || path.startsWith('https://')) {
                    return path;
                }

                // Limpiamos barras duplicadas al concatenar: "http://localhost:3000" + "/uploads/img.jpg"
                const cleanBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
                const cleanPath = path.startsWith('/') ? path : `/${path}`;

                return `${cleanBackendUrl}${cleanPath}`;
            });
        } else {
            images = ["/img/default.png"];
        }
    } catch (e) {
        console.error("Error procesando imágenes de costume", e);
        images = ["/img/default.png"];
    }

    // Por si el procesamiento anterior devolvió un array vacío
    if (images.length === 0) {
        images = ["/img/default.png"];
    }

    // 🎯 EFECTO DE AUTOPLAY: Cambia de imagen cada 4 segundos si el usuario no tiene el mouse encima
    useEffect(() => {
        if (images.length <= 1 || isHovered) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 4000); // 4000ms = 4 segundos

        return () => clearInterval(interval); // Limpieza al desmontar el componente
    }, [images.length, isHovered]);

    const stockReal: number = costume.availableSizes?.reduce((acum: number, current: any) => acum + current.quantity, 0) ?? 0;
    const assigned: number = costume.assignments?.filter((e: any) => e.status == "assigned").length ?? 0;
    const percentageAssigned = assigned && stockReal ? Math.round((assigned / stockReal) * 100) : 0;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    // 🎯 Acciones para disparar eventos al componente padre
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onEdit) onEdit(costume);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onDelete) onDelete(costume);
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}   // Pausa el autoplay
            onMouseLeave={() => setIsHovered(false)} // Reanuda el autoplay
            className="group relative w-full h-[380px] overflow-hidden border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-500 bg-purple-950 rounded-none"
        >
            {/* 1. IMAGEN DE FONDO */}
            <div className="absolute inset-0 w-full h-full z-0">
                <img
                    src={images[currentImageIndex]}
                    alt={costume.name}
                    className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                        // Fallback por si la imagen física no existe en el servidor
                        (e.target as HTMLImageElement).src = "/img/default.png";
                    }}
                />
            </div>

            {/* 2. BOTONES DE NAVEGACIÓN INDEPENDIENTES */}
            {images.length > 1 && (
                <div className="absolute inset-x-0 bottom-1 -translate-y-1/2 flex justify-between px-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button
                        type="button"
                        onClick={prevImage}
                        className="bg-white/90 text-gray-800 p-1.5 rounded-full shadow-md hover:bg-white active:scale-95 transition cursor-pointer pointer-events-auto flex items-center justify-center"
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={nextImage}
                        className="bg-white/90 text-gray-800 p-1.5 rounded-full shadow-md hover:bg-white active:scale-95 transition cursor-pointer pointer-events-auto flex items-center justify-center"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* 3. GRADIENTES DE OSCURECIMIENTO */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-purple-950/10 group-hover:bg-purple-950/60 transition-colors duration-500 z-10 pointer-events-none" />

            {/* 4. BOTONES FLOTANTES DE ACCIÓN (EDITAR Y ELIMINAR) */}
            {/* Se posicionan de manera absoluta arriba a la derecha y solo aparecen al hacer Hover */}
            <div className="absolute top-5 right-4 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0">
                <button
                    type="button"
                    onClick={handleEdit}
                    className="bg-white/80 text-gray-800 p-2 shadow-md hover:bg-green-600/40 hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                    title="Editar diseño"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-white/80 text-red-600 p-2 shadow-md hover:bg-red-600/40 hover:text-white active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                    title="Eliminar diseño"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* 5. CAPA DE CONTENIDO TEXTUAL */}
            <div className="absolute inset-0 z-20 p-5 flex flex-col justify-between text-white pointer-events-none">

                {/* Cabecera Superior (Se añade pr-20 para evitar solapamiento visual con los botones de acción) */}
                <div className="flex flex-col gap-2 relative drop-shadow-md pointer-events-auto">
                    <div>
                        <Badge variant={costume.status} theme={'dark'} />
                    </div>
                    <div>
                        <Badge variant={costume.category} theme={'dark'} />
                    </div>
                </div>

                {/* Bloque Inferior Desplazable */}
                <div className="transform translate-y-[140px] group-hover:translate-y-0 transition-transform duration-500 ease-out space-y-4 pointer-events-auto">

                    {/* Título y Ritmo */}
                    <div className="drop-shadow-md">
                        <h3 className="font-anton text-lg uppercase tracking-wide leading-tight text-white group-hover:text-purple-200 transition-colors">
                            {costume.name}
                        </h3>
                        <p className="text-xs text-purple-300 font-questrial font-medium">
                            {costume.beat || "Sin ritmo asignado"}
                        </p>
                    </div>

                    {/* CONTENIDO OCULTO */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 pt-2 border-t border-white/10 space-y-4">

                        {/* Tallas */}
                        <div>
                            <p className="text-[9px] font-questrial font-bold text-purple-300 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                <Tag className="w-3 h-3" /> Tallas Disponibles
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {costume.availableSizes?.map((t: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`font-questrial border px-2 py-1 text-center min-w-[42px] transition-colors ${t.quantity > 0
                                            ? "bg-white/10 border-white/20"
                                            : "bg-black/40 border-red-500/30 opacity-40"
                                            }`}
                                    >
                                        <p className="text-[9px] text-purple-200 font-bold">{t.size}</p>
                                        <p className="text-xs font-black">{t.quantity}u</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Métricas */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-questrial text-gray-300">
                                <span>Total: <strong>{stockReal} uds.</strong></span>
                                <span>Asignados: <strong className="text-purple-300">{assigned} ({percentageAssigned}%)</strong></span>
                            </div>

                            <div className="w-full bg-white/10 h-1 overflow-hidden backdrop-blur-xs">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-500"
                                    style={{ width: `${percentageAssigned}%` }}
                                />
                            </div>

                            {stockReal === 0 && (
                                <p className="text-[10px] font-questrial font-semibold text-pink-400 flex items-center gap-1 pt-0.5 animate-pulse">
                                    <AlertTriangle className="w-3 h-3 flex-shrink-0" /> Diseño sin existencias en almacén.
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Dots dinámicos vinculados al autoplay */}
                    {images.length > 1 && (
                        <div className="flex justify-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {images.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-3 bg-white" : "w-1 bg-white/30"
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}