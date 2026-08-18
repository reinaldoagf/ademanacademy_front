import React, { useState } from 'react';
import { TrendingUp, Pencil, Trash2, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
    backendUrl: string;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    backendUrl,
    onEdit,
    onDelete,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Conversión segura de valores numéricos
    const currentStock = Number(product.currentStock || 0);
    const minimumStockAlert = Number(product.minimumStockAlert || 0);
    const salePrice = Number(product.salePrice || 0);
    const cost = Number(product.cost || 0);

    // Estados de inventario
    const isOut = currentStock === 0;
    const isLow = !isOut && currentStock <= minimumStockAlert;

    // Margen de ganancia
    const margenGanancia =
        salePrice > 0 ? Math.round(((salePrice - cost) / salePrice) * 100) : 0;

    // Procesamiento de URLs de imágenes
    const formattedImages = (product.images || [])
        .map((img) => {
            if (!img) return null;
            return img.startsWith('http')
                ? img
                : `${backendUrl.replace(/\/$/, '')}/${img.replace(/^\//, '')}`;
        })
        .filter((img): img is string => img !== null);

    const hasImages = formattedImages.length > 0;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % formattedImages.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === 0 ? formattedImages.length - 1 : prev - 1
        );
    };

    return (
        <div className="glass-card p-5 shadow-sm border border-purple-50/60 flex flex-col justify-between hover:shadow-md transition bg-white group rounded-2xl">
            <div>
                {/* Categoría e ID */}
                <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium mb-2">
                    {/* Badge de Estado Activo/Inactivo */}
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 font-questrial font-bold rounded-full text-[9px] ${product.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                            }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'
                                }`}
                        />
                        {product.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 font-questrial font-semibold rounded-full">
                        {product.category?.name || 'Sin categoría'}
                    </span>
                </div>

                {/* Carrusel de imágenes */}
                <div className="relative w-full h-36 mb-3 overflow-hidden rounded-xl bg-purple-50/30 flex items-center justify-center group/carousel">
                    {hasImages ? (
                        <>
                            <img
                                src={formattedImages[currentImageIndex]}
                                alt={`${product.name} - ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover transition-all duration-300"
                            />

                            {/* Controles del Carrusel (si hay más de 1 imagen) */}
                            {formattedImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={prevImage}
                                        className="cursor-pointer absolute left-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                                        aria-label="Imagen anterior"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={nextImage}
                                        className="cursor-pointer absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity"
                                        aria-label="Siguiente imagen"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Indicadores / Puntos */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                        {formattedImages.map((_, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(index);
                                                }}
                                                className={`h-1.5 rounded-full transition-all ${currentImageIndex === index
                                                    ? 'w-3 bg-white'
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
                            <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                            <span className="text-[10px] font-questrial font-medium">Sin imagen</span>
                        </div>
                    )}
                </div>

                {/* Nombre y Margen */}
                <div className="space-y-1">
                    <h3 className="font-anton text-gray-800 text-base line-clamp-2 min-h-[40px] uppercase tracking-wide">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-questrial font-bold bg-emerald-50/50 px-2 py-0.5 w-fit rounded-md">
                        <TrendingUp className="w-3 h-3" /> Margen: {margenGanancia}%
                    </div>
                </div>

                {/* Precios Financieros Formateados */}
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl my-4 text-xs">
                    <div>
                        <p className="text-gray-400 text-[9px] font-questrial font-bold uppercase tracking-wider">
                            Costo Base
                        </p>
                        <p className="font-questrial font-semibold text-gray-600">
                            ${cost.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-purple-400 text-[9px] font-questrial font-bold uppercase tracking-wider">
                            Precio Venta
                        </p>
                        <p className="font-questrial font-extrabold text-purple-700 text-sm">
                            ${salePrice.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Status de Almacén e Indicador */}
            <div className="space-y-2 border-t border-purple-50/50 pt-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-questrial font-medium">
                        Existencia disponible
                    </span>
                    <span
                        className={`font-questrial font-bold ${isOut ? 'text-pink-600' : isLow ? 'text-amber-500' : 'text-gray-700'
                            }`}
                    >
                        {currentStock} Unidades
                    </span>
                </div>

                {/* Barra de progreso visual */}
                <div className="w-full bg-gray-100 h-1.5 overflow-hidden rounded-full">
                    <div
                        className={`h-full transition-all duration-300 ${isOut
                            ? 'w-0'
                            : isLow
                                ? 'bg-amber-400 w-1/4'
                                : 'gradient-purple w-full'
                            }`}
                    ></div>
                </div>

                {/* Alertas semánticas */}
                {isOut ? (
                    <p className="text-[10px] text-pink-600 font-questrial font-semibold flex items-center gap-1">
                        ⚠️ Agotado. Detener ventas en taquilla.
                    </p>
                ) : isLow ? (
                    <p className="text-[10px] text-amber-600 font-questrial font-semibold flex items-center gap-1">
                        ⚠️ Alerta. Reposición necesaria (mínimo: {minimumStockAlert}).
                    </p>
                ) : (
                    <p className="text-[10px] text-emerald-600 font-questrial font-semibold flex items-center gap-1">
                        ✓ Stock en rango seguro de distribución.
                    </p>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2 pt-3 border-t border-purple-50/50 mt-3">
                    <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors active:scale-95"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors active:scale-95"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};