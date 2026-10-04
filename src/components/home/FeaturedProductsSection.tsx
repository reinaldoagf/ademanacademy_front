'use client';

import React, { useState } from 'react';
import {
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Tag,
    Check,
    AlertCircle,
    ArrowRight,
    Eye
} from 'lucide-react';

interface ProductImage {
    id: string;
    url: string;
    altText?: string | null;
    type: string;
    order: number;
}

interface ProductCategory {
    id: string;
    name: string;
}

export interface FeaturedProduct {
    id: string;
    name: string;
    description?: string | null;
    salePrice: number;
    currentStock: number;
    featured: boolean;
    isActive: boolean;
    category?: ProductCategory | null;
    images: ProductImage[];
}

interface FeaturedProductsSectionProps {
    products: FeaturedProduct[];
    onAddToCart?: (product: FeaturedProduct) => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
    products,
    onAddToCart
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!products || products.length === 0) return null;

    const currentProduct = products[currentIndex];

    // Lógica para carrusel
    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
        setSelectedImageIndex(0); // Reiniciar imagen activa
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
        setSelectedImageIndex(0); // Reiniciar imagen activa
    };

    // Selección de la imagen activa (por galería o por defecto la primera)
    const activeImage = currentProduct?.images?.[selectedImageIndex]?.url
        || currentProduct?.images?.[0]?.url
        || '/placeholder-product.jpg';

    // Formateador de moneda
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const hasStock = currentProduct.currentStock > 0;

    return (
        <section id="tienda-destacados" className="py-20 md:py-32 bg-black text-white relative overflow-hidden">
            {/* Ambient Background Glow (Luces Neón de Fondo) */}
            <div className="absolute top-1/3 right-10 w-[550px] h-[350px] bg-pink-600/10 blur-[150px] pointer-events-none rounded-full" />
            <div className="absolute bottom-10 left-10 w-[450px] h-[300px] bg-purple-900/15 blur-[130px] pointer-events-none rounded-full" />

            <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 space-y-10 relative z-10">

                {/* ENCABEZADO DE SECCIÓN */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800/80 pb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
                            <span className="text-pink-500 font-bold uppercase tracking-[0.25em] text-[11px]">
                                Exclusividades de la Tienda
                            </span>
                        </div>
                        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-anton uppercase text-white tracking-wide">
                            Productos <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">Destacados</span>
                        </h2>
                    </div>

                    {/* Botones de Navegación */}
                    {products.length > 1 && (
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono tracking-widest text-neutral-400 bg-neutral-900/80 border border-white/10 px-4 py-3 rounded-full">
                                <span className="text-pink-500 font-bold">
                                    {String(currentIndex + 1).padStart(2, '0')}
                                </span> / {String(products.length).padStart(2, '0')}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrev}
                                    aria-label="Producto anterior"
                                    className="w-12 h-12 rounded-full border border-white/15 bg-neutral-900/50 backdrop-blur-md flex items-center justify-center hover:border-pink-500 hover:bg-pink-500/10 hover:text-pink-400 transition-all duration-300 active:scale-95"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleNext}
                                    aria-label="Siguiente producto"
                                    className="w-12 h-12 rounded-full border border-white/15 bg-neutral-900/50 backdrop-blur-md flex items-center justify-center hover:border-pink-500 hover:bg-pink-500/10 hover:text-pink-400 transition-all duration-300 active:scale-95"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* CONTENEDOR PRINCIPAL DEL PRODUCTO (FULL-WIDTH CARD) */}
                <div className="bg-neutral-950/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">

                        {/* Columna Izquierda: Imagen Principal y Vista Previa */}
                        <div className="lg:col-span-6 relative min-h-[420px] lg:min-h-[580px] bg-neutral-900/50 overflow-hidden group flex items-center justify-center">
                            <img
                                src={activeImage}
                                alt={currentProduct.name}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                            />

                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-neutral-950/80" />

                            {/* Badges Flotantes */}
                            <div className="absolute top-6 left-6 flex flex-wrap gap-2.5 z-10">
                                <span className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-lg shadow-pink-600/30 backdrop-blur-md flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Destacado
                                </span>
                                {currentProduct.category && (
                                    <span className="bg-black/70 backdrop-blur-md text-neutral-200 border border-white/15 font-semibold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                                        <Tag className="w-3 h-3 text-pink-400" /> {currentProduct.category.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Columna Derecha: Detalles del Producto */}
                        <div className="lg:col-span-6 p-8 md:p-12 lg:p-14 flex flex-col justify-between space-y-8 relative">
                            <div className="space-y-6">

                                {/* Metadata: Estado del Stock y ID */}
                                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
                                    <div className="flex items-center gap-2">
                                        {hasStock ? (
                                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                                                <Check className="w-3.5 h-3.5" /> En Stock ({currentProduct.currentStock} disponibles)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold px-3 py-1 rounded-full">
                                                <AlertCircle className="w-3.5 h-3.5" /> Agotado
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-mono text-neutral-500">
                                        REF: {currentProduct.id.slice(-8).toUpperCase()}
                                    </span>
                                </div>

                                {/* Título y Precio */}
                                <div className="space-y-3">
                                    <h3 className="font-anton text-4xl sm:text-5xl lg:text-6xl uppercase text-white tracking-wide leading-none">
                                        {currentProduct.name}
                                    </h3>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-white">
                                            {formatCurrency(currentProduct.salePrice)}
                                        </span>
                                    </div>
                                </div>

                                {/* Descripción */}
                                {currentProduct.description && (
                                    <p className="text-neutral-300 text-sm md:text-base font-light line-clamp-4 leading-relaxed max-w-2xl">
                                        {currentProduct.description}
                                    </p>
                                )}

                                {/* Galería de Miniaturas interactiva */}
                                {currentProduct.images && currentProduct.images.length > 1 && (
                                    <div className="space-y-3 pt-2">
                                        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                                            Vistas disponibles
                                        </span>
                                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                                            {currentProduct.images.map((img, idx) => (
                                                <button
                                                    key={img.id || idx}
                                                    onClick={() => setSelectedImageIndex(idx)}
                                                    className={`w-20 h-20 shrink-0 rounded-xl border overflow-hidden bg-black transition-all duration-300 ${selectedImageIndex === idx
                                                            ? 'border-pink-500 ring-2 ring-pink-500/30 scale-105'
                                                            : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                                                        }`}
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt={img.altText || currentProduct.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botones de Acción */}
                            <div className="pt-6 border-t border-neutral-800/60 flex flex-col sm:flex-row items-center gap-4">
                                <button
                                    disabled={!hasStock}
                                    onClick={() => onAddToCart && onAddToCart(currentProduct)}
                                    className={`inline-flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-xl shadow-lg transition-all duration-300 w-full sm:w-auto flex-1 text-center ${hasStock
                                            ? 'bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-600/25 hover:scale-[1.02] active:scale-95'
                                            : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                                        }`}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    {hasStock ? 'Añadir al Carrito' : 'Sin Stock'}
                                </button>

                                <a
                                    href={`/shop/product/${currentProduct.id}`}
                                    className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-white/15 text-neutral-200 hover:text-white font-semibold text-xs uppercase tracking-wider px-6 py-4 rounded-xl transition-all duration-300 w-full sm:w-auto text-center hover:border-white/30"
                                >
                                    <Eye className="w-4 h-4 text-pink-400" /> Ver Detalle
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* 🎯 MARQUESINA INFERIOR CONTINUA (LISTADO DE TODOS LOS DESTACADOS) */}
                    <div className="bg-gradient-to-r from-neutral-950 via-neutral-900/90 to-neutral-950 border-t border-white/10 py-5 px-4 overflow-hidden">
                        <div className="relative w-full [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
                            <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused] items-center">
                                {[...products, ...products, ...products].map((item, idx) => (
                                    <button
                                        key={`${item.id}-${idx}`}
                                        onClick={() => {
                                            const originalIndex = products.findIndex(p => p.id === item.id);
                                            if (originalIndex !== -1) {
                                                setCurrentIndex(originalIndex);
                                                setSelectedImageIndex(0);
                                            }
                                        }}
                                        className={`flex items-center gap-3 bg-black/50 border px-4 py-2 rounded-xl transition-all duration-300 shrink-0 text-left ${item.id === currentProduct.id
                                                ? 'border-pink-500 bg-pink-500/10 text-white'
                                                : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-neutral-200'
                                            }`}
                                    >
                                        <img
                                            src={item.images?.[0]?.url || '/placeholder-product.jpg'}
                                            alt={item.name}
                                            className="h-8 w-8 rounded-lg object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold truncate max-w-[140px]">
                                                {item.name}
                                            </span>
                                            <span className="text-[10px] text-pink-400 font-mono font-semibold">
                                                {formatCurrency(item.salePrice)}
                                            </span>
                                        </div>
                                        <ArrowRight className="w-3 h-3 opacity-50" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};