// src/app/(dashboard)/client/uniforms/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import HeroSection from "@/components/layout/HeroSection";
import {
  Shirt,
  Search,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { getMyUniformAssignmentsAction } from "@/app/actions/uniform";
import { StudentUniform } from "@/types/uniform";
import { useSidebarStore } from "@/store/useSidebarStore";
import { APP_KEYS } from "@/config/app-keys";
import { UniformAssignmentCard } from "@/components/UniformAssignmentCard";

export default function ClientClothingPage() {
  const setBadge = useSidebarStore((state) => state.setBadge);
  const [isPending, startTransition] = useTransition();
  const [myUniformAssignments, setMyUniformAssignments] = useState<StudentUniform[]>([]);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    itemCount: 10,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");


  // Métricas del grupo familiar
  const totalAsignados = 0;
  const listosParaShow = 0;
  const porRetirar = 0;


  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res = await getMyUniformAssignmentsAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
      });
      if (res.success && res.data) {
        setMyUniformAssignments(res.data);
        setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
        // 🎯 Cero peticiones extras: actualizamos el badge con el meta.totalItems recibido
        if (res.meta?.totalItems !== undefined) {
          setBadge(APP_KEYS.MY_UNIFORMS, res.meta.totalItems);
        }
      }
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(currentPage, itemsPerPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, currentPage, itemsPerPage]);

  return (
    <>
      {/* HERO SECTION ENFOCADO EN EL CLIENTE */}
      <HeroSection
        htmlTitle={`Control de <em class="text-[#5e0472]">Vestuarios e Indumentaria</em>`}
        htmlSubTitle="Consulta las piezas asignadas a tus representados, las tallas registradas en sistema y el estatus de entrega para las galas."
        actions={[]}
      />

      <div className="p-4 md:p-8 w-full space-y-6">

        {/* TARJETAS DE INDICADORES RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Trajes */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Trajes Asignados
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {totalAsignados} Piezas
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Total bajo custodia de tu grupo familiar.
              </p>
            </div>
          </div>

          {/* Listos para Escenario */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Listos para el Show
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {listosParaShow} Entregados
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Prendas revisadas y conformes para las galas.
              </p>
            </div>
          </div>

          {/* Accesorios o Pendientes */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Pendientes por Retirar
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {porRetirar} Diseños
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Pendientes de asignación física en el almacén.
              </p>
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS MULTIPLES */}
        <div className="glass-card p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por traje o ritmo de baile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>

        </div>

        {/* LISTADO DE UNIFORMES ASIGNADOS */}
        {myUniformAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myUniformAssignments.map((item: StudentUniform) => (
              <UniformAssignmentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
            <Shirt className="w-10 h-10 text-purple-200 mx-auto mb-3" />
            <p className="font-questrial text-xs text-gray-400">
              {isPending ? "Sincronizando..." : "Sin asignaciones de uniformes registradas."}
            </p>
          </div>
        )}
        {/* Seccion de Paginación */}
        {meta.totalPages > 1 && (
          <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
            <div className="text-xs font-questrial text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{myUniformAssignments.length}</span> de{" "}
              <span className="font-semibold text-gray-700">{meta.totalItems}</span> elementos
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
    </>
  );
}