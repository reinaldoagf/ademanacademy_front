"use client";
import { useState, useEffect } from "react";
import {
    ImageIcon,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Pencil
} from "lucide-react";
// Props tipadas (puedes cambiar 'any' por tu interfaz si lo prefieres)
interface WardrobeCardProps {
    element: any;
    onEdit?: (element: any) => void;
    onDelete?: (element: any) => void;
}
export function WardrobeCard({ element, onEdit, onDelete }: WardrobeCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false); // Estado para pausar el Autoplay

    const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";

    // 🎯 Normalizar y sanitizar las URLs de las imágenes
    let images: string[] = [];
    try {
        let rawImages: any[] = [];

        if (typeof element.images === "string") {
            rawImages = JSON.parse(element.images);
        } else if (Array.isArray(element.images)) {
            rawImages = element.images;
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
        console.error("Error procesando imágenes de element", e);
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

    const stockReal: number = element.availableSizes?.reduce((acum: number, current: any) => acum + current.quantity, 0) ?? 0;
    const assigned: number = element.assignments?.filter((e: any) => e.status == "assigned").length ?? 0;
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
        if (onEdit) onEdit(element);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (onDelete) onDelete(element);
    };

    return (
        <div className="glass-card shadow-sm border border-purple-50/60 flex flex-col justify-between hover:shadow-md transition bg-white group rounded-2xl">
            <div>
                {/* Carrusel de imágenes con Badges Superpuestos */}
                <div className="relative w-full h-100 overflow-hidden rounded-t-xl bg-purple-50/30 flex items-center justify-center group/carousel">

                    {/* 🎯 BADGES SUPERPUESTOS (Categoría y Estado) */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex justify-between items-center pointer-events-none">
                        {/* Badge de Estado Activo/Inactivo */}
                        <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 font-questrial font-bold rounded-full text-[9px] backdrop-blur-md shadow-sm transition-all bg-emerald-500/90 text-white`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`}
                            />
                            {element.status}
                        </span>

                        {/* Badge de Categoría */}
                        <span className="bg-white/90 backdrop-blur-md text-purple-900 px-2.5 py-1 font-questrial font-bold rounded-full text-[9px] shadow-sm">
                            {element.category || 'Sin categoría'}
                        </span>
                    </div>

                    {images.length > 1 ? (
                        <>
                            <img
                                src={images[currentImageIndex]}
                                alt={`${element.name} - ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover transition-all duration-300"
                            />

                            {/* Controles del Carrusel (si hay más de 1 imagen) */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={prevImage}
                                        className="cursor-pointer absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
                                        aria-label="Imagen anterior"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={nextImage}
                                        className="cursor-pointer absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
                                        aria-label="Siguiente imagen"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    {/* Indicadores / Puntos */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full z-10">
                                        {images.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(index);
                                                }}
                                                className={`h-1.5 rounded-full transition-all ${currentImageIndex === index
                                                    ? 'w-3.5 bg-white'
                                                    : 'w-1.5 bg-white/50'
                                                    }`}
                                                aria-label={`Ir a imagen ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-purple-300 gap-1">
                            <ImageIcon className="w-10 h-10 stroke-[1.5]" />
                            <span className="text-xs font-questrial font-medium">Sin imagen</span>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    {/* Nombre y Margen */}
                    <div className="space-y-1">
                        <h3 className="font-anton text-gray-800 text-base line-clamp-2 min-h-[40px] uppercase tracking-wide">
                            {element.name}
                        </h3>
                    </div>

                    {/* Precios Financieros Formateados */}
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl text-xs">
                        <div>
                            <p className="text-gray-400 text-[9px] font-questrial font-bold uppercase tracking-wider">
                                Costo Base
                            </p>
                            <p className="font-questrial font-semibold text-gray-600">
                                ${Number(element.price || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-purple-400 text-[9px] font-questrial font-bold uppercase tracking-wider">
                                Precio Venta
                            </p>
                            <p className="font-questrial font-extrabold text-purple-700 text-sm">
                                ${Number(element.price || 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Status de Almacén e Indicador */}
            <div className="p-4 space-y-2 border-t border-purple-50/50 pt-3">





                {/* Botones de acción */}
                <div className="flex gap-2 pt-3 border-t border-purple-50/50 mt-3">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors active:scale-95"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                    </button>
                    <button
                        type="button"
                        onClick={handleEdit}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors active:scale-95"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                    </button>

                    {/* <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold rounded-xl transition-all ${!isOutOfStock
                                    ? "cursor-pointer text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-95"
                                    : "cursor-not-allowed text-gray-400 bg-gray-100 opacity-70"
                                    }`}
                            >
                                <Plus className="w-3.5 h-3.5" /> Agregar
                            </button> */}
                </div>
            </div>
        </div>
    );
}