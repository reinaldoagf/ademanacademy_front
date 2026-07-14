// src/app/(dashboard)/admin/costumes/page.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Scissors,
  Shirt,
  Search,
  UserCheck2,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import { WardrobeCard } from "@/components/WardrobeCard";
import { CostumeCategory, CostumeStatus, SizeStock, Costume } from "@/types/costume";
import { getAllCostumesAction, saveCustomeAction } from "@/app/actions/costume";

export default function CostumesPage() {
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
  const DEFAULT_SIZES = [
    { size: 'XS', quantity: 0 },
    { size: 'S', quantity: 0 },
    { size: 'M', quantity: 0 },
    { size: 'L', quantity: 0 },
    { size: 'XL', quantity: 0 }
  ];
  // Estado del formulario interno del modal
  const [formData, setFormData] = useState({
    name: '',
    beat: '',
    category: 'childrens' as CostumeCategory, // O el valor que prefieras por defecto
    status: 'pending_preparation' as CostumeStatus,
    availableSizes: [...DEFAULT_SIZES] as SizeStock[]
  });

  // Métricas de inventario text-analíticas
  const totalTrajes = 2; /* DEMO_VESTUARIOS.reduce(
    (acc, curr) => acc + curr.totalUnidades,
    0,
  ); */
  const trajesAsignados = 1; /* DEMO_VESTUARIOS.reduce(
    (acc, curr) => acc + curr.asignados,
    0,
  ); */
  const enTaller = 6
  // Manejo de inserción de nuevo salón
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      const res = await saveCustomeAction(formData, editingId);
      if (!res.success) {
        setErrorMsg(res.error || "Ocurrió un error.");
        return;
      }
      toast.success("Operación exitosa");
      // Sincronizar estado local
      if (!editingId) {
        window.dispatchEvent(new Event('refresh-costumes-count'));
      }
      fetchData(currentPage, itemsPerPage);
      // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
      setIsModalOpen(false);
    });
  };
  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res = await getAllCostumesAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
        status: statusFilter == 'all' ? undefined : statusFilter,
        category: categoryFilter == 'all' ? undefined : categoryFilter,
      });

      if (res.success && res.data) {
        setCostumes(res.data);
        setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
      }
    });
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(currentPage, itemsPerPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, categoryFilter, currentPage, itemsPerPage]);
  return (
    <>
      {/* HERO SECTION COMPONENTE REFACTORIZADO */}
      <HeroSection
        htmlTitle={`Inventario y Control de <em class="text-[#5e0472]">Vestuarios</em>`}
        htmlSubTitle="Asigna prendas de baile, gestiona tallas por alumno y controla el estatus del taller de costura."
        actions={[
          {
            label: "Control de Lavandería",
            onClick: () => console.log("Abriendo lavandería..."),
            icon: <RefreshCw className="w-4 h-4" />,
            variant: "secondary" as const,
          },
          {
            label: "Agregar Diseño / Traje →",
            onClick: () => {
              setFormData({
                name: '',
                beat: '',
                category: 'childrens' as CostumeCategory, // O el valor que prefieras por defecto
                status: 'pending_preparation' as CostumeStatus,
                availableSizes: [...DEFAULT_SIZES] as SizeStock[]
              });
              setEditingId(null);
              setErrorMsg(null);
              setIsModalOpen(true)
            },
            icon: <Plus className="w-4 h-4" />,
            variant: "primary" as const,
          },
        ]}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
        {/* TARJETAS DE INDICADORES RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Total Prendas en Stock
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {totalTrajes} Piezas
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Disponibles en el almacén de utilería.
              </p>
            </div>
          </div>
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
              <UserCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Trajes Alquilados / Asignados
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {trajesAsignados} en Uso
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Bailarines con trajes bajo su custodia.
              </p>
            </div>
          </div>
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                En Modista / Ajustes
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {enTaller} Modelos
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Prendas retenidas por ajustes de bastilla o cierres.
              </p>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar traje o género de danza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>


          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">Todas las categorías</option>
              <option value="baby">Baby</option>
              <option value="childrens">Infantil</option>
              <option value="youth">Juvenil</option>
              <option value="adult">Adulto</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="retired">Fuera de servicio</option>
              <option value="maintenance">En lavandería / Reparación</option>
              <option value="available">Listo para usar / En stock</option>
              <option value="pending_preparation">En confección / Preparación</option>
            </select>
          </div>

        </div>

        {/* LISTADO DE STOCK CON DESGLOSE DE TALLAS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {costumes.length > 0 ? (
            costumes.map((costume) => {
              return <WardrobeCard key={costume.id} costume={costume} />
            })
          ) : (
            <div className="col-span-full text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
              No se encontraron registros de vestuarios en base a los filtros.
            </div>
          )}
        </div>

        {/* Seccion de Paginación */}
        {meta.totalPages > 1 && (
          <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-50/60 shadow-xs">
            <div className="text-xs font-questrial text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{costumes.length}</span> de{" "}
              <span className="font-semibold text-gray-700">{meta.totalItems}</span> trajes
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
      {/* MODAL: APERTURA / REGISTRO DE VESTUARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">

            {/* Cabecera del Modal */}
            <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center">
              <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                {editingId ? 'Actualizar Vestuario' : 'Dar de alta Vestuario'}
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form
              onSubmit={handleSave}
              className="p-5 space-y-4 font-questrial text-xs"
            >
              {errorMsg && <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">{errorMsg}</p>}

              {/* Nombre y Beat (Ritmo/Proyecto) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Nombre del Vestuario *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Set urbano..."
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Ritmo / Coreografía (Beat)
                  </label>
                  <input
                    type="text"
                    value={formData.beat}
                    onChange={(e) => setFormData({ ...formData, beat: e.target.value })}
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                    placeholder="Ej. Salsa, Urbana..."
                  />
                </div>
              </div>

              {/* Categoría y Estado */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CostumeCategory })}
                    className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="baby">Baby</option>
                    <option value="childrens">Infantil</option>
                    <option value="youth">Juvenil</option>
                    <option value="adult">Adulto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Estado Inicial *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CostumeStatus })}
                    className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="pending_preparation">Pendiente Preparación</option>
                    <option value="available">Disponible</option>
                    <option value="maintenance">En Mantenimiento / Lavado</option>
                    <option value="retired">Retirado</option>
                  </select>
                </div>
              </div>

              {/* Sección Dinámica: Control de Stock por Tallas (Formato Tabla Moderna) */}
              <div className="border border-purple-100 bg-purple-50/10 p-4 space-y-3">
                <div>
                  <label className="block text-gray-700 font-bold">Inventario disponible por Talla</label>
                  <p className="text-[10px] text-gray-400">Ajusta el stock usando los controles laterales o escribiendo el número directo.</p>
                </div>

                <div className="border border-purple-100/60 overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-purple-50/50 border-b border-purple-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="px-4 py-2 font-anton">Talla</th>
                        <th className="px-4 py-2 text-right font-anton">Cantidad / Unidades</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {formData.availableSizes.map((item, idx) => {
                        // Helper para centralizar la mutación del estado de cantidades
                        const handleUpdateQuantity = (newVal: number) => {
                          const safeVal = Math.max(0, newVal); // Previene negativos
                          const updatedSizes = [...formData.availableSizes];
                          updatedSizes[idx] = { ...updatedSizes[idx], quantity: safeVal };
                          setFormData({ ...formData, availableSizes: updatedSizes });
                        };

                        return (
                          <tr key={item.size} className="hover:bg-purple-50/20 transition-colors">
                            {/* Columna Talla */}
                            <td className="px-4 py-2 font-mono font-bold text-purple-700 text-sm">
                              {item.size}
                            </td>

                            {/* Columna Control Numérico */}
                            <td className="px-4 py-2 flex justify-end">
                              <div className="flex items-center border border-purple-100 bg-purple-50/10 overflow-hidden max-w-[130px]">
                                {/* Botón Disminuir */}
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(item.quantity - 1)}
                                  disabled={item.quantity <= 0}
                                  className="px-2.5 py-1.5 text-gray-500 hover:bg-purple-50 active:bg-purple-100 transition-colors cursor-pointer select-none font-bold border-r border-purple-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                >
                                  –
                                </button>

                                {/* Input Centralizado */}
                                <input
                                  type="number"
                                  min={0}
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateQuantity(Number(e.target.value))}
                                  className="w-12 text-center py-1 bg-transparent focus:outline-none font-mono text-xs text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />

                                {/* Botón Aumentar */}
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuantity(item.quantity + 1)}
                                  className="px-2.5 py-1.5 text-gray-500 hover:bg-purple-50 active:bg-purple-100 transition-colors cursor-pointer select-none font-bold border-r border-purple-100 text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botonera */}
              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
                >
                  {editingId ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
