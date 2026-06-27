// src/app/(dashboard)/admin/registrations/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Search,
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import DataTable, { Column } from "@/components/common/DataTable";
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";
import { getAllRegistrationsAction } from "@/app/actions/registration";
import { Registration } from "@/types/registration";

export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        itemCount: 10,
    });
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const fetchTableData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllRegistrationsAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined
            });
            console.log({ res })
            if (res.success && res.data) {
                setRegistrations(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
            }
        });
    };
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchTableData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, currentPage, itemsPerPage]);

    // 3️⃣ 🎯 MANEJADOR DE CAMBIO DE PÁGINA
    const handlePageChange = (newPage: number) => {
        // Actualizamos el estado local. Al cambiar, disparará el useEffect superior de forma reactiva
        setCurrentPage(newPage);

        // 💡 Opcional y Recomendado: Scroll suave hacia arriba de la tabla para mejorar la UX al cambiar de página
        //window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 🎯 MANEJADOR DE CAMBIO DE LÍMITE (Filas por página)
    const handleLimitChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
        setCurrentPage(1); // 💡 Regla de oro: Si cambias el límite, vuelve siempre a la página 1
    };
    // 🎯 Configuración declarativa de las columnas
    const columns: Column<Registration>[] = [
        {
            header: "Fecha de Registro",
            render: (transaction) => (
                <p className="text-[11px] text-gray-400 mt-0.5">
                    <DatePipe value={transaction.createdAt} format="short" />
                </p>
            ),
        },
        {
            header: "Usuario",
            render: (transaction) => {
                const initials = transaction.user ? `${transaction.user.name[0] || ""}${transaction.user.name[1] || ""}`.toUpperCase() : "";
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        {initials && <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            {initials}
                        </div>}
                        <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">
                                {transaction.user?.name}
                            </span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{transaction.user?.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Alumno",
            render: (transaction) => {
                if (!transaction.student) {
                    return <p className="text-[11px] text-gray-400 mt-0.5">Sin alumno</p>;
                }
                const userInitials = transaction.student.firstName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                return (
                    <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                        <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
                            {userInitials}
                        </div>
                        <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">{transaction.student.firstName} {transaction.student.lastName}</span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{transaction.student.dni}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Status",
            render: (transaction) => (
                <Badge variant={transaction.status} />
            ),
        },
    ];
    return (
        <>
            {/* SUB-TOPBAR (Saludos y Acción rápida) */}
            <HeroSection
                htmlTitle={`Inscripciones <em class="text-[#5e0472]">Registradas</em>`}
                htmlSubTitle={`Administra las inscripciones de estudiantes en el sistema.`}
                actions={[]}
            />
            <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
                {/* BARRA DE FILTROS */}
                <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por bailarín o nro de recibo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                        />
                    </div>
                </div>

                {/* TABLA DE ALUMNOS */}
                <DataTable
                    data={registrations}
                    columns={columns}
                    meta={meta}
                    isLoading={isPending}
                    onPageChange={handlePageChange}
                    onLimitChange={handleLimitChange} // 👈 Pasamos el manejador del límite
                    rowKey={(registration) => registration.id}
                    emptyMessage="No se encontraron inscripciones registradas."
                />

            </div>
        </>
    );
}