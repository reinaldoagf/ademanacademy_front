"use client";

import { useEffect, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/layout/HeroSection";
import {
  Armchair,
  Search,
  Plus,
  Calendar,
  Layers,
  Maximize2,
  ChevronRight,
  Trash2,
  Copy,
  Eye,
  ChevronLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { SeatingMap } from "@/types/seating-map";
import { getAllSeatingMapsAction, deleteSeatingMapAction, saveSeatingMapAction } from "@/app/actions/seating-map";
import DatePipe from "@/components/pipes/DatePipe";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function SeatingMapListPage() {
  const router = useRouter();
  const [seatingsMaps, setSeatingsMaps] = useState<SeatingMap[]>([]);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6,
    itemCount: 6,
  });

  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Acciones para la barra del Hero (Redirección al creador)
  const actions = [
    {
      label: "Nuevo Plano →",
      onClick: () => {
        router.push("/admin/seating-charts/editor");
      }, // Ajusta tu ruta aquí
      icon: <Plus className="w-4 h-4" />,
      variant: "primary" as const,
    },
  ];
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "simple" | "word" | "email";
    title: string;
    description: string;
    requiredWord?: string;
    userEmail?: string;
    id?: string;
  }>({
    isOpen: false,
    type: "word",
    title: "",
    description: "",
  });
  const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
  // Acción definitiva que se ejecuta al pasar el filtro del Modal
  const handleConfirmAction = async () => {
    if (modalConfig?.id) {
      startTransition(async () => {
        if (modalConfig?.id) {
          const res = await deleteSeatingMapAction(modalConfig.id);
          if (res.success) {
            toast.success("Operación exitosa");
            fetchData(currentPage, itemsPerPage);
            // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
            window.dispatchEvent(new Event('refresh-seating-charts-count'));
          }
        }
      });
    }
  };

  const duplicateMap = (map: SeatingMap) => {
    startTransition(async () => {
      const res = await saveSeatingMapAction({
        location: `${map.location}`,
        totalHeight: map.totalHeight,
        totalWidth: map.totalWidth,
        elements: map.elements
      }, null);
      if (!res.success) {
        console.log(res.error || "Ocurrió un error.");
        return;
      }
      toast.success("Operación exitosa");
      fetchData(currentPage, itemsPerPage);
    });
  };

  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res = await getAllSeatingMapsAction({
        page: pageToFetch,
        limit: limitToFetch,
        search: searchTerm || undefined,
      });
      if (res.success && res.data) {
        setSeatingsMaps(res.data);
        setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
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
      <HeroSection
        htmlTitle={`Listado de <em class="text-[#5e0472]">Mapas de Asientos</em>`}
        htmlSubTitle="Gestión, duplicación y control métrico de distribuciones vectoriales registradas."
        actions={actions}
      />

      <div className="p-4 md:p-8 mx-auto w-full space-y-6">
        {/* --- CONTENEDOR DE INDICADORES / KPIs --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Planos Registrados
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                1 Mapas Activos
              </h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10  bg-indigo-50  flex items-center justify-center text-indigo-600">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Aforos Totales
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                1 Asientos Diseñados
              </h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10  bg-pink-50  flex items-center justify-center text-pink-600">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Área Total Techada
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {1} m² Diseñables
              </h4>
            </div>
          </div>
        </div>

        {/* --- BARRA DE FILTROS Y BÚSQUEDA --- */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar mapa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 font-questrial border border-purple-100 text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* --- REJILLA DE PLANOS REGISTRADOS --- */}
        {seatingsMaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seatingsMaps.map((seatingMap: SeatingMap) => (
              <div
                key={seatingMap.id}
                className="glass-card bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Cabecera de la tarjeta */}
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-anton tracking-wider px-2 py-0.5 bg-purple-50 border border-purple-100 text-[#6e0372]">
                      test
                    </span>
                    {
                      seatingMap.createdAt && (
                        <div className="flex items-center gap-1 text-gray-400 text-[11px] font-questrial">
                          <Calendar className="w-3 h-3" />
                          <DatePipe value={seatingMap.createdAt} format="long" />
                        </div>
                      )
                    }
                  </div>
                  <div>
                    <h3 className="text-sm font-questrial font-bold text-gray-800 hover:text-[#5e0472] transition cursor-pointer">
                      {seatingMap.location}
                    </h3>
                    <p className="text-xs font-questrial text-gray-400 italic">
                      Evento: test
                    </p>
                  </div>

                  {/* Sub-métricas vectoriales del plano */}
                  <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-dashed border-gray-100">
                    <div className="bg-slate-50 p-2">
                      <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                        Dimensión
                      </p>
                      <p className="text-xs font-questrial font-bold text-gray-700">
                        {seatingMap.totalWidth}x{seatingMap.totalHeight}m
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2">
                      <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                        Asientos
                      </p>
                      <p className="text-xs font-questrial font-bold text-gray-700">
                        {seatingMap.elements.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones y Footer de la tarjeta */}
                <div className="px-5 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        (window.location.href = `/admin/seating-charts/${seatingMap.id}`)
                      } // Redirección con query param
                      className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition border border-transparent hover:border-purple-200"
                      title="Editar plano vector"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateMap(seatingMap)}
                      className="p-1.5 transition border border-transparent cursor-pointer text-blue-600 bg-blue-50 hover:bg-blue-100"
                      title="Duplicar distribución"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setModalConfig({
                          isOpen: true,
                          type: "word",
                          title: "Confirmar operación",
                          description: "¿Quieres eliminar el registro del mapa?",
                          id: seatingMap.id,
                        });
                      }}
                      className="p-1.5 transition border border-transparent cursor-pointer text-rose-600 bg-rose-50 hover:bg-rose-100"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      (window.location.href = `/admin/seating-charts/${seatingMap.id}`)
                    }
                    className="flex items-center gap-1 text-[11px] font-questrial font-bold text-[#5e0472] hover:text-[#4a024d] transition"
                  >
                    Abrir Editor <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- ESTADO SIN RESULTADOS --- */
          <div className="bg-white border border-purple-100 p-12 text-center shadow-sm">
            <Armchair className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-questrial text-gray-400 italic">
              No se encontraron mapas de asientos que coincidan con los
              criterios de búsqueda.
            </p>
          </div>
        )}


        {/* Seccion de Paginación */}
        {meta.totalPages > 1 && (
          <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
            <div className="text-xs font-questrial text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{seatingsMaps.length}</span> de{" "}
              <span className="font-semibold text-gray-700">{meta.totalItems}</span> mapas
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
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        type={modalConfig.type}
        title={modalConfig.title}
        description={modalConfig.description}
        requiredWord={modalConfig.requiredWord}
        userEmail={modalConfig.userEmail}
        variant={modalConfig.type === "word" ? "danger" : modalConfig.type === "email" ? "warning" : "primary"}
        confirmButtonText={modalConfig.type === "word" ? "Eliminar de Por Vida" : "Confirmar Acción"}
      />
    </>
  );
}
