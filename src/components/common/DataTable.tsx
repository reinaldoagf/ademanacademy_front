"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
    header: string;
    className?: string;
    render: (item: T) => React.ReactNode;
}

interface MetaData {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage: number; // 💡 Agregamos esta propiedad obligatoria
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    meta?: MetaData;
    isLoading?: boolean;
    onPageChange?: (page: number) => void;
    onLimitChange?: (limit: number) => void; // 💡 Nueva prop para cambiar tamaño de página
    emptyMessage?: string;
    rowKey: (item: T) => string | number;
}

export default function DataTable<T>({
    data,
    columns,
    meta,
    isLoading = false,
    onPageChange,
    onLimitChange,
    emptyMessage = "No se encontraron registros en el servidor.",
    rowKey,
}: DataTableProps<T>) {

    // 🎯 Lógica para calcular qué números de página mostrar (Máximo 5)
    const getPageNumbers = () => {
        if (!meta) return [];
        const { currentPage, totalPages } = meta;
        const maxVisible = 5;

        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = start + maxVisible - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxVisible + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="glass-card p-6 shadow-sm relative">
            {/* Capa de Carga Asíncrona */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Tabla Desplazable */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-gray-400 border-b border-purple-50 font-questrial">
                            {columns.map((column, idx) => (
                                <th key={idx} className={`pb-3 font-semibold ${column.className || ""}`}>
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50/50">
                        {data.length > 0 ? (
                            data.map((item) => (
                                <tr key={rowKey(item)} className="text-gray-700 hover:bg-purple-50/20 transition font-questrial">
                                    {columns.map((column, idx) => (
                                        <td key={idx} className={`py-3.5 ${column.className || ""}`}>
                                            {column.render(item)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-8 text-center text-xs text-gray-400 font-questrial">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Controles Avanzados de Paginación */}
            {meta && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-purple-50 pt-4 mt-4 font-questrial text-xs text-gray-500 gap-4">

                    {/* Selector de Items por Página */}
                    <div className="flex items-center gap-2">
                        <span>Mostrar</span>
                        {onLimitChange ? (
                            <select
                                value={meta.itemsPerPage}
                                onChange={(e) => onLimitChange(Number(e.target.value))}
                                disabled={isLoading}
                                className="p-1 border border-purple-100 bg-white text-gray-700 outline-none focus:border-purple-400"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        ) : (
                            <span className="font-bold">{meta.itemsPerPage}</span>
                        )}
                        <span>registros por página</span>
                    </div>

                    {/* Estado de Registros */}
                    <p className="text-center sm:text-left">
                        Mostrando página <b>{meta.currentPage}</b> de <b>{meta.totalPages}</b>
                        {meta.totalItems !== undefined && <> ({meta.totalItems} totales)</>}
                    </p>

                    {/* Navegación por números y flechas */}
                    {meta.totalPages > 1 && onPageChange && (
                        <div className="flex items-center gap-1">
                            {/* Flecha Izquierda */}
                            <button
                                disabled={meta.currentPage === 1 || isLoading}
                                onClick={() => onPageChange(meta.currentPage - 1)}
                                className="cursor-pointer p-1.5 border border-purple-100 bg-white hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-600"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Números Dinámicos (Máximo 5) */}
                            {pageNumbers.map((page) => (
                                <button
                                    key={page}
                                    disabled={isLoading}
                                    onClick={() => onPageChange(page)}
                                    className={`cursor-pointer px-2.5 py-1 text-xs font-semibold transition border ${meta.currentPage === page
                                        ? "bg-[#5e0472] text-white border-[#5e0472]"
                                        : "bg-white text-gray-600 border-purple-100 hover:bg-purple-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Flecha Derecha */}
                            <button
                                disabled={meta.currentPage === meta.totalPages || isLoading}
                                onClick={() => onPageChange(meta.currentPage + 1)}
                                className="cursor-pointer p-1.5 border border-purple-100 bg-white hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-600"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}