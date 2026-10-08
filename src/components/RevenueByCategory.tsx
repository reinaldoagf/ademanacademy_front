// src/components/RevenueByCategory.tsx
"use client";
import React, { useEffect, useState } from 'react';
import {
    Calendar,
    Shirt,
    Ticket,
    TrendingUp,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { getRevenueByCategoryMetrics } from '@/app/actions/metric';
import { RevenueByCategoryResponse } from '@/types/metric';
export function RevenueByCategory() {
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [revenueByCategory, setRevenueByCategory] = useState<RevenueByCategoryResponse>({
        lockerRoom: 0,
        storeSales: 0,
        tuition: 0,
        monthlyPayments: 0,
        customClasses: 0,
        specialEvents: 0,
    });
    // Lista estructurada de ítems
    const concepts = [
        {
            label: 'Vestuario',
            icon: <Shirt className="w-4 h-4 text-purple-500" />,
            value: revenueByCategory.lockerRoom ?? 0,
        },
        {
            label: 'Tienda',
            icon: <ShoppingBag className="w-4 h-4 text-purple-500" />,
            value: revenueByCategory.storeSales ?? 0,
        },
        {
            label: 'Inscripciones',
            icon: <Calendar className="w-4 h-4 text-purple-500" />,
            value: revenueByCategory.tuition ?? 0,
        },
        {
            label: 'Mensualidades',
            icon: <Calendar className="w-4 h-4 text-purple-500" />,
            value: revenueByCategory.monthlyPayments ?? 0,
        },
        {
            label: 'Clases Personalizadas',
            icon: <TrendingUp className="w-4 h-4 text-pink-500" />,
            value: revenueByCategory.customClasses ?? 0,
        },
        {
            label: 'Eventos Especiales',
            icon: <Ticket className="w-4 h-4 text-indigo-500" />,
            value: revenueByCategory.specialEvents ?? 0,
        },
    ];

    const itemsPerPage = 3;
    const totalPages = Math.ceil(concepts.length / itemsPerPage);
    const currentItems = concepts.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    useEffect(() => {
        async function fetchRevenueByCategoryMetrics() {
            setIsLoading(true);
            try {
                // Ejecutamos ambas peticiones en paralelo de manera limpia
                const res = await getRevenueByCategoryMetrics()
                if (res.success && res.data) {
                    setRevenueByCategory(res.data);
                }
            } catch (error) {
                console.error('Error al obtener métricas de ingresos por concepto:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRevenueByCategoryMetrics();
    }, []);
    return (
        <div className="glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-anton">Ingresos por Concepto</h3>

                {/* Botones de control de paginación */}
                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                            disabled={currentPage === 0}
                            className={(currentPage === 0) ? "cursor-not-allowed" : "cursor-pointer p-1 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"}
                        >
                            <ChevronLeft className="w-4 h-4 text-purple-700" />
                        </button>
                        <span className="text-xs font-questrial font-medium text-gray-500 px-1">
                            {currentPage + 1}/{totalPages}
                        </span>
                        <button
                            className={(currentPage === totalPages - 1) ? "cursor-not-allowed" : "cursor-pointer p-1 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                            disabled={currentPage === totalPages - 1}
                        >
                            <ChevronRight className="w-4 h-4 text-purple-700" />
                        </button>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-purple-100/50 rounded-xl" />
                    <div className="h-10 bg-purple-100/50 rounded-xl" />
                    <div className="h-10 bg-purple-100/50 rounded-xl" />
                </div>
            ) : (
                <div key={currentPage} className="space-y-3 animate-fadeIn" >
                    {currentItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/40"
                        >
                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                {item.icon} {item.label}
                            </span>
                            <span className="text-sm font-anton text-gray-800">
                                {formatCurrency(item.value)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}