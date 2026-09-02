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
  Pencil
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import { MacDockModal } from "@/components/ui/MacDockModal";
import DatePipe from "@/components/pipes/DatePipe";
import ConfirmationModal from "@/components/common/ConfirmationModal";
// Importar el mapa asegurando que solo se cargue en el cliente
const CanvasSeatingMap = dynamic(
  () => import("@/components/CanvasSeatingMap").then((mod) => mod.CanvasSeatingMap),
  { ssr: false } // 👈 Adiós problemas de hidratación
);

import { useModal } from "@/hooks/useModal";
import { saveEventAction, getAllEventsAction, deleteEventAction } from "@/app/actions/event";
import { EventData, EventFormData } from "@/types/event";
import { SeatingMap, SeatingMapElement } from "@/types/seating-map";

// 2. Valores por defecto para crear un evento nuevo
const initialFormState: EventFormData = {
  code: "",
  name: "",
  type: "sample", // Coincide con EventType.sample en tu Schema Prisma
  startDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  endDate: new Date().toISOString().split("T")[0],   // YYYY-MM-DD
  location: "",
  ticketsSold: 0,
  totalTickets: 0,
  ticketPrice: 0,
  productionStatus: "planning", // Coincide con ProductionStatus.planning
  description: "",
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
  const eventRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  // ESTADOS PARA LA TAQUILLA MAPA INTERACTIVO
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  // 1. Cambia tu estado inicial en el componente padre para aceptar objetos SeatingMapElement
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
            window.dispatchEvent(new Event('refresh-events-count'));
          }
        }
      });
    }
  };
  // 2. Simulación de los datos del plano que vienen de tu backend
  const configuredPlan = {

    "totalWidth": 30,

    "totalHigh": 20,

    "elements": [

      {

        "itemID": "stage-1",

        "type": "tarima_pista",

        "name": "Pista Principal",

        "rotation": 0,

        "groupRotation": 0,

        "price": 0,

        "xMeters": 5.944763054633262,

        "yMeters": 1.2677331723513432,

        "widthMeters": 18.110473890733473,

        "tallMeters": 5.070932689405373,

      },

      {

        "itemID": "silla-1779563256195-0-0",

        "type": "silla_vip",

        "name": "Asiento A-1",

        "chairNumber": "A-1",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 12.375,

        "yMeters": 7.393371566555994,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-0-1",

        "type": "silla_vip",

        "name": "Asiento A-2",

        "chairNumber": "A-2",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 13.475,

        "yMeters": 7.393371566555994,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-0-2",

        "type": "silla_vip",

        "name": "Asiento A-3",

        "chairNumber": "A-3",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 14.575,

        "yMeters": 7.393371566555994,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-0-3",

        "type": "silla_vip",

        "name": "Asiento A-4",

        "chairNumber": "A-4",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 15.674999999999999,

        "yMeters": 7.393371566555994,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-0-4",

        "type": "silla_vip",

        "name": "Asiento A-5",

        "chairNumber": "A-5",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 16.775,

        "yMeters": 7.393371566555994,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-1-0",

        "type": "silla_vip",

        "name": "Asiento A-6",

        "chairNumber": "A-6",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 12.375,

        "yMeters": 8.493371566555991,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-1-1",

        "type": "silla_vip",

        "name": "Asiento A-7",

        "chairNumber": "A-7",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 13.475,

        "yMeters": 8.493371566555991,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-1-2",

        "type": "silla_vip",

        "name": "Asiento A-8",

        "chairNumber": "A-8",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 14.575,

        "yMeters": 8.493371566555991,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-1-3",

        "type": "silla_vip",

        "name": "Asiento A-9",

        "chairNumber": "A-9",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 15.674999999999999,

        "yMeters": 8.493371566555991,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-1-4",

        "type": "silla_vip",

        "name": "Asiento A-10",

        "chairNumber": "A-10",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 16.775,

        "yMeters": 8.493371566555991,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-2-0",

        "type": "silla_vip",

        "name": "Asiento A-11",

        "chairNumber": "A-11",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 12.375,

        "yMeters": 9.59337156655599,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-2-1",

        "type": "silla_vip",

        "name": "Asiento A-12",

        "chairNumber": "A-12",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 13.475,

        "yMeters": 9.59337156655599,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-2-2",

        "type": "silla_vip",

        "name": "Asiento A-13",

        "chairNumber": "A-13",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 14.575,

        "yMeters": 9.59337156655599,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-2-3",

        "type": "silla_vip",

        "name": "Asiento A-14",

        "chairNumber": "A-14",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 15.674999999999999,

        "yMeters": 9.59337156655599,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      },

      {

        "itemID": "silla-1779563256195-2-4",

        "type": "silla_vip",

        "name": "Asiento A-15",

        "chairNumber": "A-15",

        "groupId": "grupo-1779563256195",

        "rotation": 0,

        "groupRotation": 0,

        "price": 10,

        "xMeters": 16.775,

        "yMeters": 9.59337156655599,

        "widthMeters": 0.85,

        "tallMeters": 0.85,

      }

    ]



  }; // Aquí pasas el objeto JSON del editor

  // 3. Simulación de los IDs ya vendidos que vienen de la base de datos
  const seatsOccupiedBD = ["silla-1779563256195-1-2", "silla-1779563256195-2-0"];

  // 4. Calcular el monto total sumando el precio real de cada asiento seleccionado
  const totalCashAmount = selectedChairs.reduce((total, silla) => total + silla.price, 0);
  const openTicketOfficeMap = (event: EventData) => {
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
      location: eventToEdit.location || "",
      ticketsSold: eventToEdit.ticketsSold ?? 0,
      totalTickets: eventToEdit.totalTickets ?? 0,
      ticketPrice: Number(eventToEdit.ticketPrice) || 0,
      productionStatus: eventToEdit.productionStatus || "planning",
      description: eventToEdit.description || "",
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

    if (!formData.location.trim()) {
      setErrorMsg("La ubicación / lugar del evento es obligatoria.");
      setIsSubmitting(false);
      return;
    }

    if (formData.ticketPrice === undefined || formData.ticketPrice < 0) {
      setErrorMsg("El precio de la entrada debe ser mayor o igual a 0.");
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
          window.dispatchEvent(new Event("refresh-events-count"));
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
  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res = await getAllEventsAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
        type: typeFilter == 'all' ? undefined : typeFilter
      });

      if (res.success && res.data) {
        setEvents(res.data);
        setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
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
              <option value="all">Todos los formatos</option>
              <option value="annual_gala">Galas Anuales</option>
              <option value="competence">Competencias</option>
              <option value="masterclass">Masterclasses / Talleres</option>
              <option value="sample">Muestras de Aula</option>
              <option value="other">Otro</option>

            </select>
          </div>

          {/* LISTADO DE EVENTOS */}
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => {
                const porcentajeVendido = Math.round((event.ticketsSold / event.totalTickets) * 100);
                const recaudacionIndividual = event.ticketsSold * event.ticketPrice;
                const isSoldOut = event.ticketsSold === event.totalTickets;

                return (
                  <div key={event.id} className="glass-card p-5 shadow-sm border border-purple-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition bg-white">

                    {/* Detalles del Evento */}
                    <div className="flex items-start gap-4 lg:w-1/4">
                      <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${event.type === "annual_gala" ? "bg-purple-100 text-purple-700" :
                        event.type === "Masterclass" ? "bg-pink-100 text-pink-700" :
                          "bg-indigo-100 text-indigo-700"
                        }`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-questrial font-bold tracking-wider text-gray-400 font-mono">{event.code}</span>
                        <h3 className="font-anton text-gray-800 text-base leading-tight mt-0.5">{event.name}</h3>
                        <span className="text-[10px] bg-purple-50 text-purple-700 font-questrial font-semibold px-2 py-0.5 mt-1 inline-block">
                          {event.type}
                        </span>
                      </div>
                    </div>

                    {/* Logística Física y Fecha */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 lg:w-1/4 font-medium">
                      <div className="flex items-center gap-2 font-questrial">
                        <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                        <DatePipe value={event.startDate} format="short" />
                      </div>
                      <div className="flex items-center gap-2 font-questrial">
                        <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>

                    {/* Control de Aforo y Taquilla */}
                    <div className="space-y-1.5 flex-1 lg:max-w-md">
                      <div className="flex justify-between text-xs font-questrial font-semibold">
                        <span className="text-gray-400">Entradas vendidas</span>
                        <span className={isSoldOut ? "text-pink-600 font-black animate-pulse" : "text-purple-700"}>
                          {event.ticketsSold} / {event.totalTickets} ({porcentajeVendido}%)
                        </span>
                      </div>

                      {/* Barra de Progreso de Aforo */}
                      <div className="w-full bg-gray-100 h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${isSoldOut ? "bg-pink-500" : "gradient-purple"
                            }`}
                          style={{ width: `${porcentajeVendido}%` }}
                        ></div>
                      </div>

                      <p className="font-questrial text-[10px] text-gray-400">
                        Recaudado: <strong className="text-gray-700">${recaudacionIndividual.toLocaleString("en-US")}</strong> (${event.ticketPrice} c/u)
                      </p>
                    </div>

                    {/* Estatus y Botón Acciones */}
                    <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-purple-50/50 shrink-0">
                      <span className={`text-[10px] font-questrial font-semibold uppercase tracking-wider px-3 py-1 ${event.productionStatus === "Sold Out" ? "bg-pink-100 text-pink-700" :
                        event.productionStatus === "essays" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                        {event.productionStatus}
                      </span>

                      <div className="flex gap-2 justify-end">
                        <div className="relative inline-block group">
                          <button
                            onClick={() => openTicketOfficeMap(event)}
                            disabled={event.productionStatus === "Sold Out"}
                            className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-xl text-xs px-4 py-2 font-questrial font-semibold hover:opacity-90 transition shadow-sm   ${event.productionStatus === "Sold Out" ? "bg-gray-200 text-gray-400" :
                              "cursor-pointer text-white gradient-purple"
                              }`}
                          >
                            <DollarSign className="w-3.5 h-3.5" /> {event.productionStatus === "Sold Out" ? "Sold Out" : "Vender e Imprimir Boleto"}
                          </button><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 pointer-events-none">
                            {event.productionStatus === "Sold Out" ? "Sold Out" : "Vender e Imprimir Boleto"}
                          </div>
                        </div>
                        <div className="relative inline-block group">
                          <button onClick={() => openEditModal(event as EventFormData & { id: string })} className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors active:scale-95">
                            <Pencil className="w-3.5 h-3.5" /> Editar
                          </button><div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-1.5 pointer-events-none">
                            Editar
                          </div>
                        </div>
                        <div className="relative inline-block group">
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
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
                No se encontraron eventos activos o planificados que coincidan con los filtros establecidos.
              </div>
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
      </div>
      {/* MODAL DETALLE DE SILLAS CON CANVAS */}
      <MacDockModal
        isOpen={isOpenModalSeatingMap}
        onClose={closeModalSeatingMap}
        title={"Taquilla en Vivo con Mapa Dinámico"}
        size={"5xl"}
      ><>
          {/* Inyección del mapa interactivo con la data del Payload JSON */}
          {configuredPlan && (
            <CanvasSeatingMap
              mapaConfig={configuredPlan}
              seatsOccupied={seatsOccupiedBD}
              onSeleccionChange={(chairs) => setSelectedChairs(chairs)}
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
              <button
                disabled={selectedChairs.length === 0}
                onClick={() => {
                  const nombresAsientos = selectedChairs.map(s => s.chairNumber).join(", ");
                  alert(`Venta registrada. IDs reservados: ${selectedChairs.map(s => s.itemID).join(", ")}`);
                  closeModalSeatingMap();
                }}
                className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
              >
                Confirmar Asignación ({selectedChairs.length})
              </button>
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
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Código <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="Ej: EVE-2026-01"
                  value={formData.code || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-bold mb-1">
                  Nombre del Evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej: Muestra Anual de Danza"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                />
              </div>
            </div>

            {/* Fila 2: Tipo de Evento y Estado de Producción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Tipo de Evento
                </label>
                <select
                  name="type"
                  value={formData.type || "sample"}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                >
                  <option value="annual_gala">Gala Anual</option>
                  <option value="masterclass">Masterclass</option>
                  <option value="competence">Competencia</option>
                  <option value="sample">Muestra</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Estado de Producción
                </label>
                <select
                  name="productionStatus"
                  value={formData.productionStatus || "planning"}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                >
                  <option value="planning">Planificación</option>
                  <option value="in_production">En Producción</option>
                  <option value="ready">Listo</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Fila 3: Fecha Inicio y Fecha Fin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Fecha de Fin <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                />
              </div>
            </div>

            {/* Fila 4: Ubicación */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Ubicación / Lugar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                required
                placeholder="Ej: Teatro Municipal, Sala Principal"
                value={formData.location || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
              />
            </div>

            {/* Fila 5: Entradas Totales, Vendidas y Precio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50/80 rounded-lg border border-gray-100">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Aforo / Total Entradas
                </label>
                <input
                  type="number"
                  name="totalTickets"
                  min="0"
                  placeholder="0"
                  value={formData.totalTickets ?? 0}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 rounded transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Entradas Vendidas
                </label>
                <input
                  type="number"
                  name="ticketsSold"
                  min="0"
                  placeholder="0"
                  value={formData.ticketsSold ?? 0}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 rounded transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Precio Entradas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="ticketPrice"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formData.ticketPrice ?? 0}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 rounded transition-colors"
                />
              </div>
            </div>

            {/* Fila 6: Descripción */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Descripción <span className="text-gray-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Detalles adicionales sobre el evento..."
                value={formData.description || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
              />
            </div>

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
                    ? "Actualizar Evento"
                    : "Registrar Evento"}
              </button>
            </div>
          </form>
        </>
      </MacDockModal>{/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
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