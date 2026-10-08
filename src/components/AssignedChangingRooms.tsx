// src/components/AssignedChangingRooms.tsx
"use client";
import React, { useEffect, useState } from 'react';
import {
    Shirt,
} from "lucide-react";
import { getAdminDashboardMetrics } from '@/app/actions/metric';
import { DashboardMetricsResponse } from '@/types/metric';
export function AssignedChangingRooms() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
    useEffect(() => {
        async function loadDashboardData() {
            setIsLoading(true);
            try {
                // Ejecutamos ambas peticiones en paralelo de manera limpia
                const res = await getAdminDashboardMetrics()
                if (res.success && res.data) {
                    setMetrics(res.data);
                }
            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboardData();
    }, []);
    return (
        <div className="gradient-purple p-5 text-white shadow-lg shadow-pink-200 flex justify-between items-center relative overflow-hidden">
            <div className="z-10">
                <p className="text-purple-100 text-xs font-medium uppercase tracking-wider font-anton">
                    Vestuarios Asignados
                </p>
                {isLoading ? (
                    <div className="h-8 w-28 bg-white/20 rounded animate-pulse mt-2" />
                ) : (
                    <h3 className="text-3xl font-questrial font-bold mt-1">
                        {metrics?.borrowedCostumes ?? 0} Piezas
                    </h3>
                )}
            </div>
            <Shirt className="w-16 h-16 absolute -right-2 text-white opacity-20 transform rotate-12 pointer-events-none" />
        </div>
    )
}