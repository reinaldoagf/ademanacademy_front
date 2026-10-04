// src/app/(dashboard)/admin/events/page.tsx
"use client";

import { useState, useTransition, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Calendar,
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
  Star,
  UserCheck,
  Ticket,
  ListStart,
  Clock,
  ImageIcon
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { ActionButton } from "@/components/ui/ActionButton";
import { FeedbackAlert } from "@/components/ui/FeedbackAlert";
import { TextInput, TextArea, SelectInput, DateInput, SearchInput, ImageGalleryPicker } from '@/components/ui/forms';
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
import { EventData, EventFormData, SaveEventPayload } from "@/types/event";
import { SeatingMap, SeatingMapElement } from "@/types/seating-map";
import { Client } from "@/types/client";
import { S3Image } from "@/types/s3-image";
import { reserveOrBuySeatsAction } from "@/app/actions/event-seat";
import { getAllClientsAction } from "@/app/actions/client";
import { useSidebarStore } from "@/store/useSidebarStore";
import { uploadFileToS3 } from "@/helpers/s3";
import { APP_KEYS } from "@/config/app-keys";

// 2. Valores por defecto para crear un evento nuevo
const initialFormState: EventFormData = {
  name: "",
  type: "sample",
  productionStatus: "planning",
  startDate: "",
  endDate: "",
  description: "",
  seatingMapId: "",
  publishToHome: true,
  isPresaleActive: false,
  presaleStartDate: "",
  presaleEndDate: "",
  images: [],
  existingImages: [],
  sponsors: [],
};
export default function AdminEventsPage() {
  const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";
  const setBadge = useSidebarStore((state) => state.setBadge);
  const router = useRouter();
  // --- ESTADOS PARA BÚSQUEDA DE grupos ---
  const [clientSearch, setClientSearch] = useState("");
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
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
  const {
    isOpen: isFeedbackAlertOpen,
    openModal: openFeedbackAlertModal,
    closeModal: closeFeedbackAlertModal
  } = useModal();
  const [formData, setFormData] = useState<EventFormData>(initialFormState);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  // ESTADOS PARA LA TAQUILLA MAPA INTERACTIVO
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [clientSelected, setClientSelected] = useState<Client | null>(null);
  const [statusSelected, setStatusSelected] = useState<"reserved" | "sold">("reserved");
  const [reservationMinutes, setReservationMinutes] = useState<number>(10);
  const [showFeedbackAlert, setShowFeedbackAlert] = useState<{
    title: string;
    description: string;
    data: {
      paymentOrderId?: string | null;
    };
  } | false>(false);
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
          }
        }
      });
    }
  };
  //  Calcular el monto total sumando el precio real de cada asiento seleccionado
  const totalCashAmount = selectedChairs.reduce((total, chair) => total + (chair.price || 0), 0);
  const openTicketOfficeMap = (event: EventData) => {
    // console.log({ event })
    setSelectedEvent(event);
    setSelectedChairs([]);
    setClientSearch("");
    setClientSelected(null);
    setStatusSelected("reserved");
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
        setNewFiles([]);
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

  // Manejo de cambio de campos de texto/select
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Eliminar imagen seleccionada antes de guardar
  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages?.filter((_, i) => i !== index),
    }));
  };

  // 🎯 Gestión Dinámica de Patrocinadores
  const addSponsor = () => {
    setFormData((prev) => ({
      ...prev,
      sponsors: [
        ...prev.sponsors,
        { name: "", logoUrl: "", tier: "silver", websiteUrl: "", socialLinks: { instagram: "", twitter: "" } },
      ],
    }));
  };

  const updateSponsor = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updatedSponsors = [...prev.sponsors];
      if (field.startsWith("social.")) {
        const socialField = field.split(".")[1];
        updatedSponsors[index] = {
          ...updatedSponsors[index],
          socialLinks: {
            ...updatedSponsors[index].socialLinks,
            [socialField]: value,
          },
        };
      } else {
        updatedSponsors[index] = {
          ...updatedSponsors[index],
          [field]: value,
        };
      }
      return { ...prev, sponsors: updatedSponsors };
    });
  };

  const removeSponsor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sponsors: prev.sponsors.filter((_, i) => i !== index),
    }));
  };
  // 6. Cargar datos cuando entras en modo edición
  const openEditModal = (eventToEdit: EventData) => {
    if (!eventToEdit.id) return;
    setEditingId(eventToEdit.id);
    setNewFiles([]);
    setErrorMsg(null);

    let imagesParsed: any[] = [];
    let formattedImages: S3Image[] = [];

    try {
      if (typeof eventToEdit.images === 'string') {
        imagesParsed = JSON.parse(eventToEdit.images);
      } else if (Array.isArray(eventToEdit.images)) {
        imagesParsed = eventToEdit.images;
      }

      const cleanBackendUrl = backendUrl.replace(/\/$/, '');

      // 1. Mapeamos y limpiamos las imágenes
      const mappedImages = imagesParsed
        .map((img: any): S3Image | null => {
          if (!img) return null;

          const path = typeof img === 'object' ? img.url || img.path : img;

          if (!path || typeof path !== 'string') return null;

          const fullUrl =
            path.startsWith('http://') || path.startsWith('https://')
              ? path
              : `${cleanBackendUrl}${path.startsWith('/') ? path : `/${path}`}`;

          return {
            url: fullUrl,
            key: typeof img === 'object' ? img.key || '' : '',
            altText: typeof img === 'object' ? img.altText || '' : '',
            type: typeof img === 'object' ? img.type || 'cover' : 'cover',
            order: typeof img === 'object' ? img.order ?? 0 : 0,
          };
        })
        .filter((img): img is S3Image => img !== null);

      // 2. DESDUPLICAR mediante un Set basándonos en la identificador único (url o key)
      const seen = new Set<string>();
      formattedImages = mappedImages.filter((img) => {
        const identifier = img.key ? img.key : img.url;
        if (seen.has(identifier)) {
          return false; // Es duplicada, la ignoramos
        }
        seen.add(identifier);
        return true;
      });

    } catch (e) {
      console.error("Error al procesar las imágenes del producto:", e);
      formattedImages = [];
    }

    setFormData({
      name: eventToEdit.name || "",
      type: eventToEdit.type || "sample",
      startDate: eventToEdit.startDate
        ? new Date(eventToEdit.startDate).toISOString().split("T")[0]
        : "",
      endDate: eventToEdit.endDate
        ? new Date(eventToEdit.endDate).toISOString().split("T")[0]
        : "",
      productionStatus: eventToEdit.productionStatus || "planning",
      publishToHome: eventToEdit.publishToHome ?? true,
      description: eventToEdit.description || "",
      seatingMapId: eventToEdit.seatingMapId || "",
      isPresaleActive: eventToEdit.isPresaleActive || false,
      presaleStartDate: eventToEdit.presaleStartDate
        ? new Date(eventToEdit.presaleStartDate).toISOString().split("T")[0]
        : "",
      presaleEndDate: eventToEdit.presaleEndDate
        ? new Date(eventToEdit.presaleEndDate).toISOString().split("T")[0]
        : "",
      existingImages: formattedImages,
      images: [],
      sponsors: eventToEdit.sponsors || [],
    });

    openModalForm();
  };

  const isValidDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d instanceof Date && !isNaN(d.getTime());
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.name.trim()) return setErrorMsg("El nombre del evento es obligatorio.");
    if (!formData.startDate || !isValidDate(formData.startDate)) return setErrorMsg("Fecha de inicio no válida.");
    if (!formData.endDate || !isValidDate(formData.endDate)) return setErrorMsg("Fecha de fin no válida.");

    try {
      // 1. Subir archivos nuevos a S3
      const newlyUploadedImages = await Promise.all(
        newFiles.map((file) => uploadFileToS3(file))
      );

      // 2. Unificar y DESDUPLICAR las imágenes finales
      const combinedImages: S3Image[] = [
        ...formData.existingImages,
        ...newlyUploadedImages,
      ];

      const seenUrlsOrKeys = new Set<string>();
      const finalImages = combinedImages.filter((img) => {
        // Usamos key como identificador prioritario, si no existe usamos url
        const identifier = img.key && img.key.trim() !== '' ? img.key : img.url;

        if (!identifier || seenUrlsOrKeys.has(identifier)) {
          return false;
        }
        seenUrlsOrKeys.add(identifier);
        return true;
      });

      // 3. Crear el Payload
      const payload: SaveEventPayload = {
        name: formData.name,
        type: formData.type,
        productionStatus: formData.productionStatus,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        description: formData.description || "",
        seatingMapId: formData.seatingMapId || undefined,
        isPresaleActive: formData.isPresaleActive,
        presaleStartDate: formData.isPresaleActive && formData.presaleStartDate
          ? new Date(formData.presaleStartDate).toISOString()
          : undefined,
        presaleEndDate: formData.isPresaleActive && formData.presaleEndDate
          ? new Date(formData.presaleEndDate).toISOString()
          : undefined,
        sponsors: formData.sponsors?.map(e => ({
          name: e.name,
          logoUrl: e.logoUrl,
          tier: e.tier,
          websiteUrl: e.websiteUrl,
          socialLinks: e.socialLinks,
        })),
        images: finalImages,
      };

      const res = await saveEventAction(payload, editingId);

      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }

      toast.success(editingId ? "Evento actualizado" : "Evento creado");
      fetchData(currentPage, itemsPerPage);
      closeModalForm();
    } catch (error: any) {
      console.error("Error en handleSave:", error);
      setErrorMsg(error.message || "Error al procesar la solicitud.");
    }
  };
  const handleCopyPaymentOrderLink = async (paymentOrderId: string) => {
    const link = `${window.location.origin}/client/payment-orders/${paymentOrderId}`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Enlace de la orden copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
      toast.error("No se pudo copiar el enlace");
    }
  };
  const handleConfirmAssignment = async () => {
    try {
      startTransition(async () => {
        if (selectedChairs.length === 0 || !selectedEvent?.id || !clientSelected?.id) return;

        // Extraemos los IDs reales del mapa de elementos (Base de Datos)
        const elementIds: string[] = selectedChairs
          .map((s) => s.id)
          .filter((id): id is string => typeof id === "string");
        const res = await reserveOrBuySeatsAction({
          eventId: selectedEvent.id,
          seatingMapElementIds: elementIds,
          status: statusSelected, // Usar "SOLD" si es una asignación/venta directa del admin
          clientId: clientSelected.id,
          totalAmount: (totalCashAmount || 0),
          ...(statusSelected === "reserved" && {
            reservationDurationMinutes: reservationMinutes,
          }),
        });

        if (res.success) {
          fetchData(currentPage, itemsPerPage);
          openFeedbackAlertModal()
          setShowFeedbackAlert({
            title: '¡Operación Completada!',
            description: res.data?.message || 'Se ha generado la orden de pago y los boletos están listos para impresión.',
            data: { paymentOrderId: res.data.paymentOrderId || null }
          })
          //toast.success(res.data.message || "Asientos procesados correctamente");
          closeModalSeatingMap();
          fetchData(currentPage, itemsPerPage);
          // Opcional: Recargar o revalidar datos del mapa
        } else {
          toast.error(`Ocurrió un problema: ${res.message}`);
        }
      });
    } catch (error: any) {
      console.error("Error detectado en handleSave (Events):", error);
      setErrorMsg(
        error.message ||
        "Ocurrió un problema de red al intentar guardar el evento."
      );
    }
  };
  // 🎯 MANEJADORES DE LA TABLA
  // --- EFFECT PARA usuarios (Vía Server Action) ---
  useEffect(() => {


    setIsLoadingClients(true);

    const isSearchEmpty = !clientSearch.trim();
    const delay = isSearchEmpty ? 0 : 400;

    const delayDebounce = setTimeout(async () => {
      try {
        // Construimos los parámetros requeridos por FetchUsersParams
        const params = isSearchEmpty
          ? { limit: 5 }
          : { search: clientSearch.trim() };

        // Llamada directa al Server Action
        const result = await getAllClientsAction(params);

        if (result.success && result.data) {
          // Axios mapea la respuesta en result.data. data.data suele ser el array
          // Si tu backend anida los grupos en 'users', úsalo; de lo contrario asigna result.data
          setFilteredClients(result.data.users || result.data);
        } else {
          console.error("Error en Server Action (usuarios):", result.error);
          setFilteredClients([]);
        }
      } catch (error) {
        console.error("Error crítico buscando usuarios:", error);
        setFilteredClients([]);
      } finally {
        setIsLoadingClients(false);
      }
    }, delay);

    return () => clearTimeout(delayDebounce);
  }, [isOpenModalSeatingMap, clientSearch]);

  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
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
        // 🎯 Cero peticiones extras: actualizamos el badge con el meta.totalItems recibido
        if (res1.meta?.totalItems !== undefined) {
          setBadge(APP_KEYS.EVENTS, res1.meta.totalItems);
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
      {/* HERO SECTION DE EVENTOS */}
      <HeroSection
        htmlTitle={`Producción de <em class="text-[#5e0472]">Eventos y Taquilla</em>`}
        htmlSubTitle="Planifica los espectáculos de la academia, controla el aforo de los teatros y monitorea los ingresos por venta de entradas."
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
              <option value="all" className="cursor-pointer border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Todos los formatos</option>
              <option value="annual_gala" className="cursor-pointer border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Galas Anuales</option>
              <option value="competence" className="cursor-pointer border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Competencias</option>
              <option value="masterclass" className="cursor-pointer border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Masterclasses / Talleres</option>
              <option value="sample" className="cursor-pointer border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Muestras de Aula</option>
              <option value="other" className="cursor-pointer border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Otro</option>

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
                      <ActionButton
                        variant="danger"
                        icon={Trash2}
                        tooltip="Eliminar"
                        onClick={() => {
                          setModalConfig({
                            isOpen: true,
                            type: 'word',
                            title: 'Confirmar operación',
                            description: '¿Quieres eliminar el registro del evento?',
                            id: event.id,
                          });
                        }}
                      >
                        Eliminar
                      </ActionButton>
                      <div className="flex w-full justify-end gap-1.5">
                        <ActionButton
                          variant="success"
                          icon={Pencil}
                          tooltip="Editar"
                          onClick={() => openEditModal(event)}
                        >
                          Editar
                        </ActionButton>
                        <ActionButton
                          variant="gradient_purple"
                          icon={DollarSign}
                          disabled={event.productionStatus === "Sold Out" || !event.seatingMap}
                          tooltip={event.productionStatus === "Sold Out" ? "Sold Out" : "Vender Boleto"}
                          onClick={() => openTicketOfficeMap(event)}
                        >
                          {event.productionStatus === "Sold Out" ? "Sold Out" : "Vender Boleto"}
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
      </div >
      {/* MODAL DETALLE DE SILLAS CON CANVAS */}
      < MacDockModal
        isOpen={isOpenModalSeatingMap}
        onClose={closeModalSeatingMap}
        title={"Taquilla en Vivo con Mapa Dinámico"}
        size={"5xl"}
      > <>
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

                  {/* TARJETA DE BÚSQUEDA Y ASIGNACIÓN DE CLIENTE */}
                  <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <span>Asignación de Cliente</span>
                    </div>

                    <SearchInput
                      label=""
                      placeholder="Buscar cliente..."
                      value={clientSearch}
                      isLoading={isLoadingClients}
                      options={filteredClients.map((client: Client) => ({
                        id: client.id,
                        label: `${client.firstName} ${client.lastName}`,
                        subLabel: `DNI: ${client.dni || 'N/A'} • Usuario: ${client.user?.email || 'Sin email'}`,
                        data: client,
                      }))}
                      emptyMessage="No se encontraron clientes coincidentes"
                      onChangeText={(text) => {
                        setClientSelected(null);
                        setClientSearch(text);
                      }}
                      onSelectOption={(option) => {
                        setClientSelected(option.data || null);
                        setClientSearch(`${option.label} (${option.data?.email || 'Usuario'})`);
                      }}
                    />
                  </div>

                  {/* TARJETA DE ESTADO DE OPERACIÓN Y TIEMPO DE RESERVA */}
                  <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <ListStart className="w-4 h-4 text-purple-600" />
                      <span>Estado de operación</span>
                    </div>

                    <SelectInput
                      label=""
                      value={statusSelected}
                      onChange={(e) => setStatusSelected(e.target.value as ("reserved" | "sold"))}
                      options={[
                        { label: "Selecciona un status", value: "", disabled: true },
                        { label: "Reservado", value: "reserved" },
                        { label: "Pagado", value: "sold" },
                      ]}
                    />

                    {/* ⏱️ CONDICIONAL: Mostrar tiempo de reserva solo si el status es "reserved" */}
                    {statusSelected === "reserved" && (
                      <div className="pt-2 space-y-1.5 border-t border-gray-100 animate-fadeIn">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>Tiempo de reserva</span>
                        </div>

                        <SelectInput
                          label=""
                          value={reservationMinutes.toString()}
                          onChange={(e) => setReservationMinutes(Number(e.target.value))}
                          options={[
                            { label: "5 minutos", value: "5" },
                            { label: "10 minutos", value: "10" },
                            { label: "15 minutos", value: "15" },
                            { label: "30 minutos", value: "30" },
                            { label: "1 hora", value: "60" },
                            { label: "2 horas", value: "120" },
                            { label: "24 horas", value: "1440" },
                          ]}
                        />
                      </div>
                    )}
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
              disabled={selectedChairs.length === 0 || !clientSelected || isPending}
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
      </MacDockModal >
      {/* MODAL DETALLE DE SILLAS CON CANVAS */}
      < MacDockModal
        isOpen={isOpenModalForm}
        onClose={closeModalForm}
        title={editingId ? "Actualizar Evento" : "Registrar Evento"}
        size={"xl"}
      > <>
          {/* Formulario */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin">
            {errorMsg && (
              <p className="text-red-500 bg-red-50 p-2 text-sm text-center mb-4 border border-red-100 rounded">
                {errorMsg}
              </p>
            )}

            {/* Fila 1: Código (Opcional) y Nombre (Requerido) */}

            <TextInput
              label="Nombre del Evento *"
              name="name" // 👈 Necesario si handleInputChange usa e.target.name
              required
              type="text"
              value={formData.name || ""}
              placeholder="Ej: Muestra Anual de Danza"
              onChange={handleInputChange}
            />

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
                  { label: "Planificación", value: "planning", },
                  { label: "Ensayos Generales", value: "essays", },
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

            {/* 🎯 SECCIÓN: PREVENTA DE ENTRADAS */}
            <div className="bg-purple-50/50 p-3 rounded-md border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-purple-900 cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPresaleActive"
                    checked={formData.isPresaleActive}
                    onChange={handleInputChange}
                    className="accent-purple-700 w-4 h-4 rounded cursor-pointer"
                  />
                  Habilitar Preventa de Entradas
                </label>
              </div>

              {formData.isPresaleActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <DateInput
                    label="Inicio de Preventa *"
                    name="presaleStartDate"
                    value={formData.presaleStartDate || ""}
                    onChange={(val) => setFormData({ ...formData, presaleStartDate: val })}
                  />
                  <DateInput
                    label="Fin de Preventa *"
                    name="presaleEndDate"
                    value={formData.presaleEndDate || ""}
                    onChange={(val) => setFormData({ ...formData, presaleEndDate: val })}
                  />
                </div>
              )}
            </div>
            {/* 🎯 SECCIÓN: IMÁGENES DEL EVENTO */}
            <ImageGalleryPicker
              label="Imágenes del Evento (Flyers, Banners, Galería)"
              existingImages={formData.existingImages.map((e: S3Image) => e.url) || []}
              onRemoveExistingImage={removeImage}
              files={newFiles}
              onFilesChange={setNewFiles}
              buttonText="Añadir foto"
            />


            {/* 🎯 SECCIÓN: MARCAS PATROCINANTES */}
            <div className="space-y-3 border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-gray-800">Marcas Patrocinantes (Opcional)</label>
                <button
                  type="button"
                  onClick={addSponsor}
                  className="flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-medium"
                >
                  <Plus size={14} /> Agregar Patrocinador
                </button>
              </div>

              {formData.sponsors.map((sponsor, index) => (
                <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeSponsor(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <TextInput
                      label="Nombre Patrocinador"
                      value={sponsor.name}
                      onChange={(e) => updateSponsor(index, "name", e.target.value)}
                      placeholder="Ej: Banco Nacional"
                    />
                    <TextInput
                      label="URL del Logo"
                      value={sponsor.logoUrl}
                      onChange={(e) => updateSponsor(index, "logoUrl", e.target.value)}
                      placeholder="https://..."
                    />
                    <SelectInput
                      label="Nivel (Tier)"
                      value={sponsor.tier}
                      onChange={(e) => updateSponsor(index, "tier", e.target.value)}
                      options={[
                        { label: "Principal (Main)", value: "main" },
                        { label: "Oro (Gold)", value: "gold" },
                        { label: "Plata (Silver)", value: "silver" },
                        { label: "Bronce (Bronze)", value: "bronze" },
                      ]}
                    />
                  </div>

                  {/* Redes Sociales del Patrocinador */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    <TextInput
                      label="Sitio Web"
                      value={sponsor.websiteUrl || ""}
                      onChange={(e) => updateSponsor(index, "websiteUrl", e.target.value)}
                      placeholder="https://marca.com"
                    />
                    <TextInput
                      label="Instagram"
                      value={sponsor.socialLinks?.instagram || ""}
                      onChange={(e) => updateSponsor(index, "social.instagram", e.target.value)}
                      placeholder="@marca"
                    />
                  </div>
                </div>
              ))}
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
                disabled={isPending}
                className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
              >
                {isPending
                  ? "Guardando..."
                  : editingId
                    ? "Actualizar Evento →"
                    : "Registrar Evento →"}
              </button>
            </div>
          </form>
        </>
      </MacDockModal >
      {/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
      < ConfirmationModal
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
      {/* MODAL DETALLE DE SILLAS CON CANVAS */}
      < MacDockModal
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
              // Accion 1: Copiar Enlace
              {
                label: "Compartir a Cliente",
                variant: "success",
                onClick: () => {
                  if (showFeedbackAlert.data?.paymentOrderId) {
                    handleCopyPaymentOrderLink(showFeedbackAlert.data.paymentOrderId);
                  }
                },
              },
              // Acción 2: Ir a la Orden
              {
                label: "Ver Orden",
                variant: "primary",
                onClick: () => {
                  if (showFeedbackAlert.data?.paymentOrderId) {
                    router.push(`/admin/payment-orders/${showFeedbackAlert.data.paymentOrderId}`);
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
        )
        }
      </MacDockModal >
    </>
  );
}