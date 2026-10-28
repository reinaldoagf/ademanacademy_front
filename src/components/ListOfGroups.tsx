// src/components/ListOfGroups.tsx
"use client";

import { useEffect, useState } from "react";
import { Group } from "@/types/group";
import { getGroupsByInstructor } from "@/app/actions/metric";

export function ListOfGroups() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [groupsByInstructor, setGroupsByInstructor] = useState<Group[]>([]);
    useEffect(() => {
        async function fetchGroupsByInstructor() {
            setIsLoading(true);
            try {
                // Ejecutamos ambas peticiones en paralelo de manera limpia
                const res = await getGroupsByInstructor()
                if (res.success && res.data) {
                    setGroupsByInstructor(res.data);
                }
            } catch (error) {
                console.error('Error al obtener métricas de ingresos por concepto:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchGroupsByInstructor();
    }, []);
    return (
        <div className="glass-card p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-anton mb-4">
                    Grupos Académicos Asignados (Relación Instructor)
                </h3>
            </div>
            <div className="overflow-x-auto">{isLoading ? (
                <div className="h-8 w-28 bg-white/20 rounded animate-pulse mt-2" />
            ) : (
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-gray-400 border-b border-purple-50">
                            <th className="pb-3 font-questrial font-semibold">Nombre del Grupo</th>
                            <th className="pb-3 font-questrial font-semibold">Categoría</th>
                            <th className="pb-3 font-questrial font-semibold">Cupos Totales</th>
                            <th className="pb-3 font-questrial font-semibold text-right">
                                Estudiantes Inscritos
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50/50">
                        {groupsByInstructor.length > 0 ? (
                            groupsByInstructor.map((group) => (
                                <tr key={group.id} className="text-gray-700">
                                    <td className="py-3.5 font-medium flex items-center gap-2 font-questrial">
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full bg-amber-400`}
                                        ></span>
                                        {group.name}
                                    </td>
                                    <td className="py-3.5 text-gray-500 font-questrial">
                                        {group.category?.name || 'N/A'}
                                    </td>
                                    <td className="py-3.5 font-questrial">
                                        {group.totalNumberOfSlots}
                                    </td>
                                    <td
                                        className={`py-3.5 text-right font-questrial`}
                                    >
                                        {group._count?.students || 0} alumnos
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="py-6 text-center text-gray-400 font-questrial text-xs"
                                >
                                    No hay grupos asignados registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>)}
            </div>
        </div>
    )
}