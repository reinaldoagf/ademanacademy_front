import React, { useEffect, useState } from 'react';
import {
    CheckCircle2,
    Users,
} from "lucide-react";
import { getGroupSlotsData } from '@/app/actions/group';
import { SlotsData } from '@/types/group';
export function GroupCapacityModule() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [onlyActive, setOnlyActive] = useState(true);
    const [groupSlotsData, setGroupSlotsData] = useState<SlotsData | null>(null);
    const overallOccupancy = groupSlotsData?.overallOccupancyPercentage ?? 0;
    const groups = groupSlotsData?.groups ?? [];// Carga los datos de cupos cada vez que cambia el estado `onlyActive`
    useEffect(() => {
        async function fetchGroupSlots() {
            setIsLoading(true);
            try {
                const res = await getGroupSlotsData({ onlyActive });
                if (res.success && res.data) {
                    setGroupSlotsData(res.data);
                }
            } catch (error) {
                console.error('Error al cargar cupos:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchGroupSlots();
    }, [onlyActive]);
    return (
        <div className="space-y-6">
            {/* Módulo de Capacidad de Grupos */}
            <div className="glass-card p-6 shadow-sm text-center flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-lg font-anton text-left">Cupos de la Academia</h3>

                    {/* Toggle / Pill Buttons para filtrar */}
                    <div className="flex items-center bg-purple-50/80 p-0.5 rounded-lg border border-purple-100 text-[11px] font-questrial font-medium">
                        <button
                            type="button"
                            onClick={() => setOnlyActive(true)}
                            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${onlyActive
                                ? 'bg-white text-[#5e0472] shadow-sm font-bold'
                                : 'cursor-pointer text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Activos
                        </button>
                        <button
                            type="button"
                            onClick={() => setOnlyActive(false)}
                            className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${!onlyActive
                                ? 'bg-white text-[#5e0472] shadow-sm font-bold'
                                : 'cursor-pointer text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            <Users className="w-3 h-3 text-purple-500" />
                            Todos
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    /* Estado de Carga (Skeleton Loader) */
                    <div className="animate-pulse space-y-4 my-2">
                        <div className="w-32 h-32 rounded-full bg-purple-100/60 mx-auto flex items-center justify-center">
                            <div className="w-24 h-24 bg-white rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="h-12 bg-purple-100/50 rounded-xl" />
                            <div className="h-12 bg-purple-100/50 rounded-xl" />
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Gráfico Circular Dinámico con conic-gradient */}
                        <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center">
                            <div
                                className="w-full h-full rounded-full flex items-center justify-center transition-all duration-500"
                                style={{
                                    background: `conic-gradient(#5e0472 ${overallOccupancy}%, #f3e8ff ${overallOccupancy}% 100%)`,
                                }}
                            >
                                {/* Círculo central (Efecto Dona) */}
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                                    <span className="text-2xl font-questrial font-black text-[#5e0472]">
                                        {overallOccupancy}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Listado de Grupos con Scroll */}
                        <div className="grid grid-cols-2 gap-2 text-left text-xs max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-200">
                            {groups.map((group) => (
                                <div
                                    key={group.id}
                                    className="p-2 bg-white/50 rounded-xl border border-purple-50 flex flex-col justify-center"
                                >
                                    <p
                                        className="text-gray-400 font-questrial font-medium truncate"
                                        title={group.name}
                                    >
                                        {group.name}
                                    </p>
                                    <p className="font-questrial font-bold text-[#5e0472]">
                                        {group.occupiedSlots}/{group.totalSlots} Cupos{' '}
                                        {group.isFull && (
                                            <span className="text-red-400 text-[10px] ml-0.5">(Full)</span>
                                        )}
                                    </p>
                                </div>
                            ))}

                            {groups.length === 0 && (
                                <p className="col-span-2 text-center text-gray-400 py-4">
                                    No hay grupos registrados
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}