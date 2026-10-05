"use client";
import { useState, useEffect } from "react";
import {
    ImageIcon,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Pencil,
    UserPlus
} from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";
// Props tipadas (puedes cambiar 'any' por tu interfaz si lo prefieres)
interface WardrobeCardProps {
    element: any;
    onEdit?: (element: any) => void;
    onDelete?: (element: any) => void;
    onAssign?: (element: any) => void;
}
export function WardrobeCard({ element, onEdit, onDelete, onAssign }: WardrobeCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = element.images;

    // 🎯 EFECTO DE AUTOPLAY: Cambia de imagen cada 4 segundos si el usuario no tiene el mouse encima
    useEffect(() => {
        if (images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }, 4000); // 4000ms = 4 segundos

        return () => clearInterval(interval); // Limpieza al desmontar el componente
    }, [images.length]);

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

                    {images.length > 0 ? (
                        <>
                            <img
                                src={images[currentImageIndex].url}
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
                                        {images.map((_: any, index: number) => (
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
            <div className="p-4 space-y-3 border-t border-purple-50/50 pt-3">
                {/* Botones de acción */}
                <div className="w-full flex flex-col xl:flex-row items-center justify-between gap-2 pt-2">

                    {/* Botón secundario/peligro (Eliminar) */}
                    <div className="w-full sm:w-auto">
                        <ActionButton
                            variant="danger"
                            icon={Trash2}
                            tooltip=""
                            onClick={handleDelete}
                            className="w-full sm:w-auto"
                        >
                            Eliminar
                        </ActionButton>
                    </div>

                    {/* Acciones principales (Editar y Asignar) */}
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
                        <ActionButton
                            variant="success"
                            icon={Pencil}
                            tooltip=""
                            onClick={handleEdit}
                            className="w-full sm:w-auto"
                        >
                            Editar
                        </ActionButton>

                        <ActionButton
                            variant="gradient_purple"
                            icon={UserPlus}
                            tooltip=""
                            onClick={() => onAssign?.(element)}
                            className="w-full sm:w-auto"
                        >
                            Asignar
                        </ActionButton>
                    </div>

                </div>
            </div>
        </div>
    );
}