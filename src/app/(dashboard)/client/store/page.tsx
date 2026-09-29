// src/app/(dashboard)/client/store/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import HeroSection from "@/components/layout/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import {
    Search,
    ShoppingBag,
    PackageCheck,
    AlertCircle,
    Layers,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/product";
import {
    getProductMetrics,
    getAllProductsAction,
} from "@/app/actions/product";

export default function StorePage() {
    const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const orderCreatedFlag = useCartStore((state) => state.orderCreatedFlag);
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
        itemCount: 6,
    });
    const [metrics, setMetrics] = useState({
        inventoryValue: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [isPending, startTransition] = useTransition();


    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res1 = await getAllProductsAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
                isActive: true,
                stockStatus: 'in_stock',
            });
            if (res1.success && res1.data) {
                setProducts(res1.data);
                setMeta(res1.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
            }
            const res2 = await getProductMetrics()
            if (res2.success && res2.data) {
                setMetrics(res2.data);
            }
        });
    };
    useEffect(() => {
        if (orderCreatedFlag > 0) {

            // Aquí puedes volver a cargar la lista de pedidos de tu API o actualizar SWR/React Query
            fetchData(currentPage, itemsPerPage);
        }
    }, [orderCreatedFlag]);
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, currentPage, itemsPerPage]);
    return (
        <>
            {/* HERO SECTION DE LA SECCIÓN */}
            <HeroSection
                htmlTitle={`<em class="text-[#5e0472]">Productos</em> de la tienda`}
                htmlSubTitle="Tienda de productos."
                actions={[]}
            />
            {/* Capa de Carga Asíncrona */}
            <div className="relative w-full">
                <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
                    {/* METRICAS DE RENDIMIENTO DE LA TIENDA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Valor de Activos */}
                        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                                    Capital en Almacén
                                </p>
                                <h4 className="text-xl font-anton text-gray-800">
                                    ${metrics.inventoryValue || 0}
                                </h4>
                                <p className="font-questrial text-xs text-gray-500">
                                    Costo total acumulado de los productos existentes.
                                </p>
                            </div>
                        </div>

                        {/* Alertas de Reabastecimiento */}
                        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-100 flex items-center justify-center text-amber-600">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                                    Por Agotarse (Bajo Mínimo)
                                </p>
                                <h4 className="text-xl font-anton text-gray-800">
                                    {metrics.lowStockProducts || 0} Artículos
                                </h4>
                                <p className="font-questrial text-xs text-gray-500">
                                    Artículos activos por agotarse.
                                </p>
                            </div>
                        </div>
                        {/* Quiebres de Stock */}
                        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
                                <PackageCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                                    Agotados Totalmente
                                </p>
                                <h4 className="text-xl font-anton text-gray-800">
                                    {metrics.outOfStockProducts || 0} Variantes
                                </h4>
                                <span className="text-[10px] bg-pink-50 text-pink-600 font-bold px-2 py-0.5 inline-flex items-center gap-0.5">
                                    Quiebre de currentStock activo
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* FILTROS DE CATEGORÍAS */}

                    <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full sm:w-80">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar por código o descripción de producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 font-questrial border border-purple-100 text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                            />
                        </div>


                    </div>


                    {/* GRILLA DE CATÁLOGO / PRODUCTOS */}

                    {products.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                backendUrl={backendUrl}
                            />
                        ))}
                    </div>) : (
                        <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                            <ShoppingBag className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                            <p className="font-questrial text-xs text-gray-400">
                                {isPending ? "Sincronizando..." : "Ningún ítem coincide con los criterios de búsqueda comerciales."}
                            </p>
                        </div>
                    )}


                    {/* Seccion de Paginación */}
                    {meta.totalPages > 1 && (
                        <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
                            <div className="text-xs font-questrial text-gray-500">
                                Mostrando <span className="font-semibold text-gray-700">{products.length}</span> de{" "}
                                <span className="font-semibold text-gray-700">{meta.totalItems}</span> salones
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Selector de Items por Página */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-questrial text-gray-400">Ver:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1); // Volver a la 1 tras cambiar el límite
                                        }}
                                        className="p-1 border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                {/* Controles de Navegación */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={meta.currentPage === 1 || isPending}
                                        className="p-1.5 border border-purple-50 bg-white text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer rounded-xs"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <span className="text-xs font-questrial px-3 py-1 bg-[#5e0472]/5 text-[#5e0472] font-semibold">
                                        Pág. {meta.currentPage} de {meta.totalPages}
                                    </span>

                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.totalPages))}
                                        disabled={meta.currentPage === meta.totalPages || isPending}
                                        className="p-1.5 border border-purple-50 bg-white text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer rounded-xs"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
}
