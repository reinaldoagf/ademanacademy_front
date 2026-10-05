// src/app/(dashboard)/client/events/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ListStart,
  Calendar,
  Ticket,
  Search,
  Music,
  History,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { ActionButton } from "@/components/ui/ActionButton";
import { TextInput, SelectInput } from "@/components/ui/forms";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { EventData } from "@/types/event";
import { getAllEventsAction } from "@/app/actions/event";
import { clientPurchaseSeatsAction } from "@/app/actions/event-seat";
import DatePipe from "@/components/pipes/DatePipe";
import { SeatingMapElement } from "@/types/seating-map";
import { useModal } from "@/hooks/useModal";
import { useSidebarStore } from "@/store/useSidebarStore";
import { APP_KEYS } from "@/config/app-keys";

// Importar el mapa asegurando que solo se cargue en el cliente para evitar problemas de hidratación
const CanvasSeatingMap = dynamic(
  () => import("@/components/CanvasSeatingMap").then((mod) => mod.CanvasSeatingMap),
  { ssr: false }
);
const initialFormState = {
  referenceNumber: "",
  bankName: "",
};
export default function ClientEventsPage() {
  const setBadge = useSidebarStore((state) => state.setBadge);
  const router = useRouter();
  const {
    isOpen: isOpenModalSeatingMap,
    openModal: openModalSeatingMap,
    closeModal: closeModalSeatingMap,
  } = useModal();

  const {
    isOpen: isFeedbackAlertOpen,
    openModal: openFeedbackAlertModal,
    closeModal: closeFeedbackAlertModal
  } = useModal();
  const [showFeedbackAlert, setShowFeedbackAlert] = useState<{
    title: string;
    description: string;
    data: {
      paymentOrderId?: string | null;
    };
  } | false>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [selectedChairs, setSelectedChairs] = useState<SeatingMapElement[]>([]);
  // --- ESTADOS PARA COBRO DE INSCRIPCIÓN ---
  const [formData, setFormData] = useState(initialFormState);
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
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
  const [typeFilter, setTypeFilter] = useState("all");

  // Acciones informativas del HeroSection exclusivas para el alumno
  const actions = [
    {
      label: "Mis Entradas Compradas",
      onClick: () => console.log("Redirigiendo a historial de tickets..."),
      icon: <History className="w-4 h-4" />,
      variant: "secondary" as const
    }
  ];

  // Métricas financieras y logísticas globales (Basadas exclusivamente en las ventas actuales)
  const totalRecaudadoTickets = 0;
  const totalBailarinesEnEscena = 0;
  const eventosProximos = 0;
  //  Calcular el monto total sumando el precio real de cada asiento seleccionado
  const totalCashAmount = selectedChairs.reduce((total, chair) => total + (chair.price || 0), 0);
  const openTicketOfficeMap = (event: EventData) => {
    // console.log({ event })
    setSelectedEvent(event);
    setSelectedChairs([]);
    openModalSeatingMap();
  };
  const handleConfirmAssignment = async () => {
    try {
      startTransition(async () => {
        if (selectedChairs.length === 0 || !selectedEvent?.id) return;

        if (!formData.bankName || !formData.referenceNumber || !paymentReceipt) {
          toast.error("Por favor completa los datos del pago y adjunta el comprobante.");
          return;
        }

        const elementIds = selectedChairs
          .map((s) => s.id)
          .filter((id): id is string => typeof id === "string");

        // Creamos la estructura multipart/form-data
        const bodyFormData = new FormData();
        bodyFormData.append("eventId", selectedEvent.id);
        bodyFormData.append("seatingMapElementIds", JSON.stringify(elementIds));
        bodyFormData.append("totalAmount", (totalCashAmount || 0).toString());
        bodyFormData.append("bankName", formData.bankName);
        bodyFormData.append("referenceNumber", formData.referenceNumber);
        bodyFormData.append("receiptFile", paymentReceipt); // 👈 Nombre coincidente con FileInterceptor('receiptFile')

        // Consumo de tu Server Action o API client
        const res = await clientPurchaseSeatsAction(bodyFormData);

        if (res.success) {
          openFeedbackAlertModal();
          setShowFeedbackAlert({
            title: "¡Solicitud Registrada!",
            description:
              res.data?.message ||
              "Tu comprobante ha sido enviado. Los asientos están reservados en espera de revisión del pago.",
            data: { paymentOrderId: res.data.paymentOrderId || null },
          });

          closeModalSeatingMap();
          fetchData(currentPage, itemsPerPage);
        } else {
          toast.error(`Ocurrió un problema: ${res.message}`);
        }
      });
    } catch (error: any) {
      console.error("Error al procesar la compra del cliente:", error);
      setErrorMsg(error.message || "Ocurrió un problema al procesar la solicitud.");
    }
  };
  // 5. Limpiar o resetear el formulario al cerrar el modal o al terminar de guardar
  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    window.dispatchEvent(new Event(APP_KEYS.REFRESH_PAYMENT_ORDERS_COUNT));
    startTransition(async () => {
      const res0 = await getAllEventsAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
        type: typeFilter == 'all' ? undefined : typeFilter
      });

      if (res0.success && res0.data) {
        setEvents(res0.data);
        setMeta(res0.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
        if (res0.meta?.totalItems !== undefined) {
          setBadge(APP_KEYS.EVENTS, res0.meta.totalItems);
        }
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
      {/* HERO SECTION ORIENTADO AL CLIENTE */}
      <HeroSection
        htmlTitle={`Cartelera de <em class="text-[#5e0472]">Eventos y Espectáculos</em>`}
        htmlSubTitle="Asegura tus entradas para las galas anuales, competencias internacionales y masterclasses de la academia eligiendo tus asientos en tiempo real."
        actions={actions}
      />

      {/* Capa de Carga Asíncrona */}
      <div className="relative w-full">
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
              <option value="all" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Todos los formatos</option>
              <option value="annual_gala" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Galas Anuales</option>
              <option value="competence" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Competencias</option>
              <option value="masterclass" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Masterclasses / Talleres</option>
              <option value="sample" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Muestras de Aula</option>
              <option value="other" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Otro</option>

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
                    <div className="px-5 py-3 bg-slate-50 border-t border-gray-100 w-full flex items-center justify-between gap-1.5">

                      <div className="flex w-full justify-end gap-1.5">

                        <ActionButton
                          variant="gradient_purple"
                          icon={DollarSign}
                          disabled={event.productionStatus === "Sold Out" || !event.seatingMap}
                          tooltip={event.productionStatus === "Sold Out" ? "Sold Out" : "Comprar Boletos"}
                          onClick={() => openTicketOfficeMap(event)}
                        >
                          {event.productionStatus === "Sold Out" ? "Sold Out" : "Comprar Boletos"}
                        </ActionButton>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>) : (
              <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                <Star className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                <p className="font-questrial text-xs text-gray-400">
                  {isPending ? "Sincronizando..." : " No se encontraron eventos activos o planificados que coincidan con los filtros establecidos."}
                </p>
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-start">
              {/* COLUMNA IZQUIERDA: MAPA DE ASIENTOS (~80% del ancho en pantallas md/lg) */}
              <div className="md:col-span-9 bg-white p-4 rounded-md border border-gray-100 shadow-sm overflow-hidden">
                <CanvasSeatingMap
                  eventData={selectedEvent}
                  seatingMap={selectedEvent.seatingMap}
                  seatsOccupied={selectedEvent.eventSeats?.filter(e => e.status == "reserved" || e.status == "sold").map(e => e.seatingMapElementId) || []}
                  onSeleccionChange={(chairs) => {
                    setSelectedChairs(chairs);
                  }}
                />
              </div>

              {/* COLUMNA DERECHA: PANEL DE CONTROL Y RESUMEN (~20% del ancho) */}
              <div className="md:col-span-3">
                <div className="font-questrial space-y-4">


                  {/* TARJETA DE ESTADO DE OPERACIÓN Y TIEMPO DE RESERVA */}
                  <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <ListStart className="w-4 h-4 text-purple-600" />
                      <span>Registro de Pago</span>
                    </div>
                    <SelectInput
                      label="Banco/Plataforma de Origen *"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value as string })}
                      options={[
                        { label: "Selecciona una Plataforma", value: "", disabled: true },
                        { label: "Banesco", value: "Banesco" },
                        { label: "Banco de Venezuela", value: "Banco de Venezuela" },
                        { label: "Bancaribe", value: "Bancaribe" },
                        { label: "Banco Mercantil", value: "Banco Mercantil" },
                        { label: "Zelle", value: "Zelle" },
                        { label: "Binance", value: "Binance" },
                        { label: "Otro", value: "Otro" },
                      ]}
                    />
                    <TextInput
                      label="Referencia de la Transacción *"
                      type="text"
                      required
                      value={formData.referenceNumber}
                      onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                      placeholder="Referencia"
                    />
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="block font-bold mb-1 text-gray-700">Adjuntar Comprobante (Capture / PDF) *</label>
                      <div className="relative border border-dashed border-white/20 hover:border-purple-400 transition bg-black/10 p-3 text-center cursor-pointer">
                        <input
                          type="file" accept="image/*,application/pdf"
                          onChange={(e) => setPaymentReceipt(e.target.files ? e.target.files[0] : null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <p className="text-gray-400 text-[11px]">
                          {paymentReceipt ? `✅ ${paymentReceipt.name}` : "Haga click para arrastrar o subir archivo"}
                        </p>
                      </div>
                    </div>
                  </div>


                  {/* TARJETA DE RESUMEN DE COMPRA / MONTO TOTAL */}
                  <div className="bg-gradient-to-br from-purple-900 to-[#5e0472] text-white p-5 rounded-md shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-center gap-2 text-purple-200 text-xs font-medium mb-1 uppercase tracking-wider">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span>Monto a Liquidar</span>
                    </div>

                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-3xl font-black tracking-tight">
                        ${totalCashAmount.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs font-semibold text-purple-200">USD</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-purple-100">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Ticket className="w-3.5 h-3.5 text-purple-300" />
                        Asientos elegidos:
                      </span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold text-white">
                        {selectedChairs?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}




          {/* Cierre de Compra */}
          <div className="pt-4 border-t border-purple-100 bg-purple-50/20 flex justify-between shrink-0">

            <button
              onClick={() => closeModalSeatingMap()}
              className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
            >
              Cancelar
            </button>
            {selectedEvent?.id && (<button
              disabled={selectedChairs.length === 0 || isPending}
              onClick={handleConfirmAssignment}
              className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (<div className="flex items-center justify-center gap-2">
                Confirmar Asignación <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold text-white">
                  {selectedChairs?.length || 0}
                </span>
              </div>)}
            </button>)}

          </div>
        </>
      </MacDockModal>
      {/* MODAL DETALLE DE SILLAS CON CANVAS */}
      <MacDockModal
        isOpen={isFeedbackAlertOpen}
        onClose={closeFeedbackAlertModal}
        title={"¡Operación Completada!"}
        size={"md"}
      >
        {showFeedbackAlert && (
          <FeedbackAlert
            title={showFeedbackAlert.title}
            description={showFeedbackAlert.description}
            onClose={() => {
              closeFeedbackAlertModal(); setShowFeedbackAlert(false)
            }}
            extraActions={[
              // Acción 2: Ir a la Orden
              {
                label: "Ver Orden",
                variant: "primary",
                onClick: () => {
                  if (showFeedbackAlert.data?.paymentOrderId) {
                    router.push(`/client/payment-orders/${showFeedbackAlert.data.paymentOrderId}`);
                    closeFeedbackAlertModal();
                    setShowFeedbackAlert(false);
                  }
                },
              },
            ]}
          >
            {/* Contenido dinámico si existe la orden de pago */}
            {showFeedbackAlert.data?.paymentOrderId && (
              <div className="space-y-1">
                <p>
                  <strong>Orden ID:</strong> #{showFeedbackAlert.data.paymentOrderId}
                </p>
              </div>
            )}
          </FeedbackAlert>
        )}
      </MacDockModal>
    </>
  );
}