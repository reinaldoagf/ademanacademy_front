// src/app/(dashboard)/events/page.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Calendar,
  MapPin,
  Search,
  Plus,
  Music,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Trash2,
  Pencil,
  Loader2,
  Star
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { TextInput, TextArea, SelectInput, DateInput } from '@/components/ui/forms';
import DatePipe from "@/components/pipes/DatePipe";
import ConfirmationModal from "@/components/common/ConfirmationModal";
// Importar el mapa asegurando que solo se cargue en el cliente
const CanvasSeatingMap = dynamic(
  () => import("@/components/CanvasSeatingMap").then((mod) => mod.CanvasSeatingMap),
  { ssr: false } // 👈 Adiós problemas de hidratación
);

import { useModal } from "@/hooks/useModal";
import { saveEventAction, getAllEventsAction, deleteEventAction } from "@/app/actions/event";
import { getAllSeatingMapsAction } from "@/app/actions/seating-map";
import { EventData, EventFormData } from "@/types/event";
import { SeatingMap, SeatingMapElement } from "@/types/seating-map";
import { reserveOrBuySeatsAction } from "@/app/actions/event-seat";
import { APP_KEYS } from "@/consts/app";

// 2. Valores por defecto para crear un evento nuevo
const initialFormState: EventFormData = {
  code: "",
  name: "",
  type: "sample", // Coincide con EventType.sample en tu Schema Prisma
  startDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  endDate: new Date().toISOString().split("T")[0],   // YYYY-MM-DD
  productionStatus: "planning", // Coincide con ProductionStatus.planning
  description: "",
  seatingMapId: "",
};
export default function AdminEventsPage() {
  const {
    isOpen: isOpenModalSeatingMap,
    openModal: openModalSeatingMap,
    closeModal: closeModalSeatingMap,
  } = useModal();
  const {
    isOpen: isOpenModalForm,
    openModal: openModalForm,
    closeModal: closeModalForm,
  } = useModal();
  const [formData, setFormData] = useState<EventFormData>(initialFormState);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  // ESTADOS PARA LA TAQUILLA MAPA INTERACTIVO
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  // 1. Cambia tu estado inicial en el componente padre para aceptar objetos SeatingMapElement
  const [seatingMaps, setSeatingMaps] = useState<SeatingMap[]>([]);
  const [selectedChairs, setSelectedChairs] = useState<SeatingMapElement[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
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
          const res = await deleteEventAction(modalConfig.id);
          if (res.success) {
            toast.success("Operación exitosa");
            fetchData(currentPage, itemsPerPage);
            // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
            window.dispatchEvent(new Event(APP_KEYS.REFRESH_EVENTS_COUNT));
          }
        }
      });
    }
  };
  // 3. Simulación de los IDs ya vendidos que vienen de la base de datos
  const seatsOccupiedBD = ["silla-1779563256195-1-2", "silla-1779563256195-2-0"];

  const selectedStudentId = undefined; // Asignar UUID si la venta es a un alumno específico
  // 4. Calcular el monto total sumando el precio real de cada asiento seleccionado
  const totalCashAmount = selectedChairs.reduce((total, chair) => total + (chair.price || 0), 0);
  const openTicketOfficeMap = (event: EventData) => {
    // console.log({ event })
    setSelectedEvent(event);
    setSelectedChairs([]);
    openModalSeatingMap();
  };
  // Configuración de acciones del HeroSection
  const actions = [
    {
      label: "Registrar Evento →",
      onClick: () => {
        setFormData(initialFormState);
        setEditingId(null);
        setErrorMsg(null);
        openModalForm()
      },
      icon: <Plus className="w-4 h-4" />,
      variant: "primary" as const
    },
  ];


  // Métricas financieras y logísticas globales (Basadas exclusivamente en las ventas actuales)
  const totalRecaudadoTickets = 0;
  const totalBailarinesEnEscena = 0;
  const eventosProximos = 0;
  // 5. Limpiar o resetear el formulario al cerrar el modal o al terminar de guardar
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  // 6. Cargar datos cuando entras en modo edición
  const openEditModal = (eventToEdit: EventFormData & { id: string }) => {
    setEditingId(eventToEdit.id);
    setFormData({
      code: eventToEdit.code || "",
      name: eventToEdit.name || "",
      type: eventToEdit.type || "sample",
      startDate: eventToEdit.startDate
        ? new Date(eventToEdit.startDate).toISOString().split("T")[0]
        : "",
      endDate: eventToEdit.endDate
        ? new Date(eventToEdit.endDate).toISOString().split("T")[0]
        : "",
      productionStatus: eventToEdit.productionStatus || "planning",
      description: eventToEdit.description || "",
      seatingMapId: eventToEdit.seatingMapId || "",
    });
    openModalForm();
  };
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    // 1. Validaciones preventivas en el cliente para Eventos
    if (!formData.name.trim()) {
      setErrorMsg("El nombre del evento es obligatorio.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.seatingMapId.trim()) {
      setErrorMsg("El mapa de asientos es obligatorio.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.startDate) {
      setErrorMsg("La fecha de inicio es obligatoria.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.endDate) {
      setErrorMsg("La fecha de fin es obligatoria.");
      setIsSubmitting(false);
      return;
    }

    // Validación de orden de fechas
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setErrorMsg("La fecha de fin no puede ser anterior a la fecha de inicio.");
      setIsSubmitting(false);
      return;
    }




    try {
      startTransition(async () => {
        // 🎯 Acción de servidor / API para guardar el evento (crear o actualizar)
        const res = await saveEventAction(formData, editingId);

        if (!res.success) {
          setErrorMsg(res.error || "Ocurrió un error al guardar el evento.");
          return;
        }

        toast.success(
          editingId
            ? "Evento actualizado correctamente"
            : "Evento registrado con éxito"
        );

        // Reactividad: refrescar listado, conteos o métricas si aplica
        if (!editingId) {
          window.dispatchEvent(new Event(APP_KEYS.REFRESH_EVENTS_COUNT));
        }

        fetchData(currentPage, itemsPerPage);
        closeModalForm();
      });
    } catch (error: any) {
      console.error("Error detectado en handleSave (Events):", error);
      setErrorMsg(
        error.message ||
        "Ocurrió un problema de red al intentar guardar el evento."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };
  const handleConfirmAssignment = async () => {
    if (selectedChairs.length === 0 || !selectedEvent?.id) return;

    setIsSubmitting(true);

    // Extraemos los IDs reales del mapa de elementos (Base de Datos)
    const elementIds: string[] = selectedChairs
      .map((s) => s.id)
      .filter((id): id is string => typeof id === "string");

    const result = await reserveOrBuySeatsAction({
      eventId: selectedEvent?.id,
      seatingMapElementIds: elementIds,
      status: "reserved", // Usar "SOLD" si es una asignación/venta directa del admin
      studentId: selectedStudentId,
    });

    setIsSubmitting(false);

    if (result.success) {
      fetchData(currentPage, itemsPerPage);
      toast.success(result.data.message || "Asientos procesados correctamente");
      closeModalSeatingMap();
      // Opcional: Recargar o revalidar datos del mapa
    } else {
      toast.error(`Ocurrió un problema: ${result.message}`);
    }
  };
  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res0 = await getAllSeatingMapsAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: undefined,
      });

      if (res0.success && res0.data) {
        setSeatingMaps(res0.data || [])
      }
      const res1 = await getAllEventsAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
        type: typeFilter == 'all' ? undefined : typeFilter
      });

      if (res1.success && res1.data) {
        setEvents(res1.data);
        setMeta(res1.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
      }
    });
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(currentPage, itemsPerPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, currentPage, itemsPerPage, typeFilter]);
  return (
    <>
      {/* HERO SECTION DE EVENTOS */}
      <HeroSection
        htmlTitle={`Producción de <em class="text-[#5e0472]">Eventos y Taquilla</em>`}
        htmlSubTitle="Planifica los espectáculos de la academia, controla el aforo de los teatros y monitorea los ingresos por venta de entradas."
        actions={actions}
      />

      {/* Capa de Carga Asíncrona */}
      <div className="relative w-full">
        {isPending && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
          {/* REPORTE DE PRODUCCIÓN EXPRESS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Recaudación de Taquilla */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                  Taquilla Proyectada
                </p>
                <h4 className="text-xl font-anton text-gray-800">
                  ${totalRecaudadoTickets.toLocaleString("en-US")}
                </h4>
                <p className="font-questrial text-xs text-gray-500">
                  Ingresos brutos por boletas vendidas.
                </p>
              </div>
            </div>

            {/* Artistas en escena */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                  Bailarines Convocados
                </p>
                <h4 className="text-xl font-anton text-gray-800">
                  {totalBailarinesEnEscena} Alumnos
                </h4>
                <p className="font-questrial text-xs text-gray-500">
                  Participantes activos en coreografías.
                </p>
              </div>
            </div>


            {/* Producciones Activas */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                  Fechas en Agenda
                </p>
                <h4 className="text-xl font-anton text-gray-800">
                  {eventosProximos} Activos
                </h4>
                <p className="font-questrial text-xs text-gray-500">
                  Espectáculos y talleres en desarrollo.
                </p>
              </div>
            </div>
          </div>

          {/* FILTROS DE AGENDA */}
          <div className="glass-card shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre de gala o teatro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 font-questrial border border-purple-100 text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 w-full sm:w-auto font-questrial border border-purple-100 text-xs bg-white/50 text-gray-700 focus:outline-none"
            >
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="all">Todos los formatos</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="annual_gala">Galas Anuales</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="competence">Competencias</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="masterclass">Masterclasses / Talleres</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="sample">Muestras de Aula</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="other">Otro</option>

            </select>
          </div>

          {/* LISTADO DE EVENTOS */}
          <div className="space-y-4">
            {events.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const getProductionStatusBadge = (status: string) => {
                  switch (status?.toLowerCase()) {
                    case 'draft':
                    case 'borrador':
                      return {
                        label: 'Borrador',
                        bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
                        dot: 'bg-amber-500',
                      };
                    case 'in_production':
                    case 'en_produccion':
                      return {
                        label: 'En Producción',
                        bg: 'bg-purple-50 text-[#5e0472] border-purple-200/80',
                        dot: 'bg-purple-600',
                      };
                    case 'published':
                    case 'publicado':
                      return {
                        label: 'Publicado',
                        bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
                        dot: 'bg-blue-500',
                      };
                    case 'completed':
                    case 'finalizado':
                      return {
                        label: 'Finalizado',
                        bg: 'bg-slate-100 text-slate-700 border-slate-200',
                        dot: 'bg-slate-500',
                      };
                    case 'cancelled':
                    case 'cancelado':
                      return {
                        label: 'Cancelado',
                        bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
                        dot: 'bg-rose-500',
                      };
                    default:
                      return {
                        label: status || 'Sin Estado',
                        bg: 'bg-gray-50 text-gray-700 border-gray-200',
                        dot: 'bg-gray-400',
                      };
                  }
                };
                const prodStatus = getProductionStatusBadge(event.productionStatus);
                return (
                  <div
                    key={`event-${event.id}`}
                    className="glass-card bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Cabecera de la tarjeta */}
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-questrial font-bold text-gray-800 hover:text-[#5e0472] transition cursor-pointer">
                          {event.name}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-400 text-[11px] font-questrial">
                          {
                            event.startDate && (
                              <div className="flex items-center gap-1 text-green-500 text-[11px] font-questrial">
                                <Calendar className="w-3 h-3" />
                                <DatePipe value={event.startDate} format="short" />
                              </div>
                            )
                          }
                          {
                            event.endDate && event.endDate !== event.startDate && (
                              <div className="flex items-center gap-1 text-red-500 text-[11px] font-questrial">
                                - <DatePipe value={event.endDate} format="short" />
                                <Calendar className="w-3 h-3" />
                              </div>
                            )
                          }</div>
                      </div>

                      {/* Sub-métricas vectoriales del plano */}
                      <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-dashed border-gray-100">
                        <div className="bg-slate-50 p-2">
                          <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Código
                          </p>
                          <p className="text-xs font-questrial font-bold text-gray-700">
                            {event.code || 'Sin código'}
                          </p>
                        </div><div className="bg-slate-50 p-2">
                          <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Ubicación
                          </p>
                          <p className="text-xs font-questrial font-bold text-gray-700">
                            {event.seatingMap?.location || 'Sin mapa de asientos'}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-2">
                          <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Descripción
                          </p>
                          <p className="text-xs font-questrial font-bold text-gray-700">
                            {event.description || 'Sin descripción'}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-2">
                          <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Tipo
                          </p>
                          <div className="flex flex-wrap items-center gap-2 justify-center">

                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-questrial font-bold tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm backdrop-blur-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              <span className="capitalize">{event.type}</span>
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2">
                          <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Status de Producción
                          </p>
                          <div className="flex flex-wrap items-center gap-2 justify-center">

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-questrial font-bold tracking-wide border shadow-sm transition-all backdrop-blur-md ${prodStatus.bg}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${prodStatus.dot}`} />
                              {prodStatus.label}
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2">
                          <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Status
                          </p>
                          <div className="flex flex-wrap items-center gap-2 justify-center">

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-questrial font-bold tracking-wide border shadow-sm transition-all backdrop-blur-md ${event.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                }`}
                            >
                              <span className="relative flex h-2 w-2">
                                {event.isActive && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                )}
                                <span
                                  className={`relative inline-flex rounded-full h-2 w-2 ${event.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                />
                              </span>
                              {event.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acciones y Footer de la tarjeta */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-end">
                      <div className="flex w-full justify-between gap-1.5">
                        <div><div className="relative inline-block group">
                          <button onClick={() => {
                            setModalConfig({
                              isOpen: true,
                              type: "word",
                              title: "Confirmar operación",
                              description: "¿Quieres eliminar el registro del evento?",
                              id: event.id,
                            });
                          }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold  rounded-xl transition-colors active:scale-95 cursor-pointer text-rose-600 bg-rose-50 hover:bg-rose-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Eliminar
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 pointer-events-none">
                            Eliminar
                          </div>
                        </div></div>
                        <div className="flex w-full justify-end gap-1.5">
                          <div className="relative inline-block group">
                            <button onClick={() => openEditModal(event as EventFormData & { id: string })} className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors active:scale-95">
                              <Pencil className="w-3.5 h-3.5" /> Editar
                            </button><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 pointer-events-none">
                              Editar
                            </div>
                          </div>
                          <div className="relative inline-block group">
                            <button
                              onClick={() => openTicketOfficeMap(event)}
                              disabled={event.productionStatus === "Sold Out" || !event.seatingMap}
                              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl text-xs px-4 py-2 font-questrial hover:opacity-90 transition shadow-sm ${event.productionStatus === "Sold Out" || !event.seatingMap ? "bg-gray-200 text-gray-400" :
                                "cursor-pointer text-white gradient-purple"
                                }`}
                            >
                              <DollarSign className="w-3.5 h-3.5" /> {event.productionStatus === "Sold Out" ? "Sold Out" : "Vender e Imprimir Boleto"}
                            </button><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 pointer-events-none">
                              {event.productionStatus === "Sold Out" ? "Sold Out" : "Vender e Imprimir Boleto"}
                            </div>
                          </div></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>) : ((
              <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                <Star className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                <p className="font-questrial text-xs text-gray-400">
                  {isPending ? "Sincronizando..." : " No se encontraron eventos activos o planificados que coincidan con los filtros establecidos."}
                </p>
              </div>
            )
            )}
          </div>
          {/* Seccion de Paginación */}
          {meta.totalPages > 1 && (
            <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
              <div className="text-xs font-questrial text-gray-500">
                Mostrando <span className="font-semibold text-gray-700">{events.length}</span> de{" "}
                <span className="font-semibold text-gray-700">{meta.totalItems}</span> eventos
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
                    <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value={5}>5</option>
                    <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value={10}>10</option>
                    <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value={20}>20</option>
                    <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value={50}>50</option>
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
      {/* MODAL DETALLE DE SILLAS CON CANVAS */}
      <MacDockModal
        isOpen={isOpenModalSeatingMap}
        onClose={closeModalSeatingMap}
        title={"Taquilla en Vivo con Mapa Dinámico"}
        size={"5xl"}
      ><>
          {/* Inyección del mapa interactivo con la data del Payload JSON */}
          {selectedEvent?.seatingMap && (
            <CanvasSeatingMap
              eventData={selectedEvent}
              seatingMap={selectedEvent.seatingMap}
              seatsOccupied={selectedEvent.eventSeats?.filter(e => e.status == "reserved" || e.status == "sold").map(e => e.seatingMapElementId) || []}
              onSeleccionChange={(chairs) => {
                setSelectedChairs(chairs)
              }}
            />
          )}

          {/* Cierre de Compra */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-purple-50">
            <div className="text-center sm:text-left font-questrial">
              <p className="text-xs text-gray-400 font-medium">Monto Total Liquidado en Caja</p>

              <h4 className="text-2xl font-black text-gray-800">
                {/* 2. CLAVAMOS UN LOCALE FIJO (US) PARA QUE SERVIDOR Y CLIENTE COINCIDAN EN LA COMA ',' */}
                ${totalCashAmount.toLocaleString("en-US", { minimumFractionDigits: 0 })}{" "}
                <span className="text-xs text-gray-400 font-normal">USD</span>
              </h4>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => closeModalSeatingMap()}
                className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
              >
                Cancelar
              </button>
              {selectedEvent?.id && (<button
                disabled={selectedChairs.length === 0 || isSubmitting}
                onClick={handleConfirmAssignment}
                className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  `Confirmar Asignación (${selectedChairs.length})`
                )}
              </button>)}

            </div>
          </div>
        </>
      </MacDockModal>
      {/* MODAL DETALLE DE SILLAS CON CANVAS */}
      <MacDockModal
        isOpen={isOpenModalForm}
        onClose={closeModalForm}
        title={"Registrar Evento"}
        size={"lg"}
      ><>
          {/* Formulario */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin">
            {errorMsg && (
              <p className="text-red-500 bg-red-50 p-2 text-sm text-center mb-4 border border-red-100 rounded">
                {errorMsg}
              </p>
            )}

            {/* Fila 1: Código (Opcional) y Nombre (Requerido) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInput
                label="Código (Opcional)"
                name="code" // 👈 Necesario si handleInputChange usa e.target.name
                required
                type="text"
                value={formData.code || ""}
                placeholder="Ej: Maria Paula"
                onChange={handleInputChange}
              />
              <div className="md:col-span-2">
                <TextInput
                  label="Nombre del Evento *"
                  name="name" // 👈 Necesario si handleInputChange usa e.target.name
                  required
                  type="text"
                  value={formData.name || ""}
                  placeholder="Ej: Muestra Anual de Danza"
                  onChange={handleInputChange}
                />

              </div>
            </div>
            <SelectInput
              label="Mapa de Asiento"
              name="seatingMapId"
              value={formData.seatingMapId}
              onChange={handleInputChange}
              options={[
                { label: "Selecciona el Mapa de asiento", value: "", disabled: true },
                ...seatingMaps.map((c: SeatingMap) => ({
                  label: `${c.location}`,
                  value: `${c.id}`
                }))
              ]}
            />

            {/* Fila 2: Tipo de Evento y Estado de Producción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectInput
                label="Tipo de Evento"
                name="type"
                value={formData.type || "sample"}
                onChange={handleInputChange}
                options={[
                  { label: "Selecciona el Tipo de Evento", value: "", disabled: true },
                  { label: "Gala Anual", value: "annual_gala", },
                  { label: "Masterclass", value: "masterclass", },
                  { label: "Competencia", value: "competence", },
                  { label: "Muestra", value: "sample", },
                  { label: "Otro", value: "other", },
                ]}
              />
              <SelectInput
                label="Estado de Producción"
                name="productionStatus"
                value={formData.productionStatus || "planning"}
                onChange={handleInputChange}
                options={[
                  { label: "Selecciona el Estado de Producción", value: "", disabled: true },
                  { label: "Ensayos Generales", value: "essays", },
                  { label: "En Producción", value: "in_production", },
                  { label: "Agotado", value: "sold_out", },
                  { label: "Completado", value: "completed", },
                  { label: "Cancelado", value: "cancelled", },
                ]}
              />
            </div>

            {/* Fila 3: Fecha Inicio y Fecha Fin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateInput
                label="Fecha de Inicio *"
                name="startDate"
                value={formData.startDate || ""}
                onChange={(val) => setFormData({ ...formData, startDate: val })}

              />
              <DateInput
                label="Fecha de Fin *"
                name="endDate"
                value={formData.endDate || ""}
                onChange={(val) => setFormData({ ...formData, endDate: val })}

              />


            </div>


            {/* Fila 4: Descripción */}
            <TextArea
              label="Descripción (Opcional)"
              placeholder="Detalles adicionales sobre el evento..."
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
            />


            {/* Botonera de Acción */}
            <div className="pt-2 flex justify-between items-center border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={closeModalForm}
                className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
              >
                {isSubmitting
                  ? "Guardando..."
                  : editingId
                    ? "Actualizar Evento →"
                    : "Registrar Evento →"}
              </button>
            </div>
          </form>
        </>
      </MacDockModal>
      {/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
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