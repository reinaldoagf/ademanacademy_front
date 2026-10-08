// src/app/(dashboard)/admin/wardrobe/costumes/page.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  Shirt,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Wrench, ArchiveX,
  AlertCircle,
  Info,
  Trash2,
  UserPlus
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import HeroSection from "@/components/layout/HeroSection";
import { WardrobeCard } from "@/components/WardrobeCard";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { ActionButton } from "@/components/ui/ActionButton";
import { TextInput, SelectInput, TextArea, ImageGalleryPicker, ToggleSwitch, SearchInput } from '@/components/ui/forms';
import { CostumeCategory, CostumeStatus, Costume, StatusCardConfig, LockerRoomStatus, CostumeFormData, SaveCostumePayload, ElementToBeAssigned } from "@/types/costume";
import {
  getAllCostumesAction,
  getCostumeCountByStatus,
  saveCostumeAction,
  deleteCostumeAction,
  assignCostumeAction
} from "@/app/actions/costume";
import { getSettingByKeyAction, saveSettingAction } from "@/app/actions/setting";
import { getAllStudentsAction } from "@/app/actions/student";
import { useSidebarStore } from "@/store/useSidebarStore";
import { deleteS3Image } from "@/app/actions/s3";
import { uploadFileToS3 } from "@/helpers/s3";
import { APP_KEYS } from "@/config/app-keys";
import { S3Image } from "@/types/s3-image";
import { Student } from "@/types/student";
import { Client } from "@/types/client";

// 2. Configuración visual estática fuera del componente
const STATUS_CONFIG: Record<LockerRoomStatus, StatusCardConfig> = {
  making: {
    title: "Confeccionando",
    subtitle: "Listos para asignación e inventario activo.",
    icon: CheckCircle2,
    iconBgClass: "bg-emerald-100",
    iconTextClass: "text-emerald-600",
    unitLabel: "Piezas",
  },
  payment_pending: {
    title: "Pendiente por pago",
    subtitle: "Prendas en etapa de preparación o taller.",
    icon: Shirt,
    iconBgClass: "bg-purple-100",
    iconTextClass: "text-[#5e0472]",
    unitLabel: "Modelos",
  },
  available: {
    title: "Disponibles / En Stock",
    subtitle: "Retenidos para mantenimiento y ajustes.",
    icon: Wrench,
    iconBgClass: "bg-amber-100",
    iconTextClass: "text-amber-600",
    unitLabel: "Prendas",
  },
  retired: {
    title: "Retirado",
    subtitle: "Inactivos, dados de baja o en desecho.",
    icon: ArchiveX,
    iconBgClass: "bg-rose-100",
    iconTextClass: "text-rose-600",
    unitLabel: "Unidades",
  },
};
const initialCostumeFormState: CostumeFormData = {
  name: '',
  price: 0, // 👈 Nuevo campo de precio
  beat: '',
  category: 'childrens' as CostumeCategory, // O el valor que prefieras por defecto
  status: 'payment_pending' as CostumeStatus,
  images: [],
  existingImages: [],
};
const initialPolicyFormState = {
  id: '',
  key: 'usage_policies',
  value: '',
  active: false,
  price: 0,
};
export default function CostumesPage() {
  const setBadge = useSidebarStore((state) => state.setBadge);
  const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";
  const clothingFormReference = useRef<HTMLFormElement>(null);
  const policyFormReference = useRef<HTMLFormElement>(null);
  const assignmentFormReference = useRef<HTMLFormElement>(null);
  // 3. Estado enfocado puramente en los totales numéricos
  const [statusCounts, setStatusCounts] = useState<Record<LockerRoomStatus, number>>({
    payment_pending: 0,
    making: 0,
    available: 0,
    retired: 0,
  });
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const {
    isOpen: isModalFormOpen,
    openModal: openModalForm,
    closeModal: closeModalForm
  } = useModal();
  const {
    isOpen: isPoliciesModalOpen,
    openModal: openPoliciesModal,
    closeModal: closePoliciesModal,
  } = useModal();
  const {
    isOpen: isAssignmentModalOpen,
    openModal: openAssignmentModal,
    closeModal: closeAssignmentModal,
  } = useModal();
  const [selectedCostume, setSelectedCostume] = useState<Costume | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
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
          const res = await deleteCostumeAction(modalConfig.id);
          if (res.success) {
            toast.success("Operación exitosa");
            fetchData(currentPage, itemsPerPage);
          }
        }
      });
    }
  };
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
    itemCount: 8,
  });
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // --- ESTADOS PARA BÚSQUEDA DE grupos ---
  const [studentSearch, setStudentSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [costumeAssignmentForm, setCostumeAssignmentForm] = useState({
    costumeId: '',
    studentId: '',
    observations: '',
  });
  const [selectedStudentsList, setSelectedStudentsList] = useState<ElementToBeAssigned[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyFormData, setPolicyFormData] = useState(initialPolicyFormState);
  // 1. Estado del formulario interno del modal
  const [costumeFormData, setCostumeFormData] = useState(initialCostumeFormState);
  // Estados locales exclusivos para la gestión de archivos
  const [newFiles, setNewFiles] = useState<File[]>([]);
  // Almacena el ID del vestuario que se está editando (null si es una creación)
  const handleRemoveExisting = async (image: S3Image, index: number) => {
    const imageToRemove = costumeFormData.existingImages![index];
    setCostumeFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages?.filter((_, i) => i !== index),
    }));
    // 2. Eliminar el archivo físico de S3 y DB
    const response = await deleteS3Image(imageToRemove.key);

    if (!response.success) {
      toast.error('Ocurrió un error al borrar la imagen en S3');
      // Revertir cambios en el estado si falló
      setCostumeFormData((prev) => ({
        ...prev,
        existingImages: [...prev.existingImages, imageToRemove],
      }));
    }
  };
  const handleEdit = (costume: Costume) => {
    openModalForm();
    setErrorMsg('')
    setSelectedCostume(costume);
    // 1. Procesamos las imágenes primero
    let imagesParsed: any[] = [];
    let formattedImages: S3Image[] = [];

    try {
      if (typeof costume.images === 'string') {
        imagesParsed = JSON.parse(costume.images);
      } else if (Array.isArray(costume.images)) {
        imagesParsed = costume.images;
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
    setCostumeFormData({
      name: costume.name ?? '',
      price: Number(costume.price) || 0,
      beat: costume.beat ?? '',
      category: costume.category as CostumeCategory,
      status: costume.status as CostumeStatus,
      existingImages: formattedImages,
      images: [], // Resetea las nuevas imágenes de cargas anteriores
    })
  };

  const handleDelete = (costume: Costume) => {
    setModalConfig({
      isOpen: true,
      type: "word",
      title: "Confirmar operación",
      description: "¿Quieres eliminar el registro de tu vestuario?",
      id: costume.id,
    });
  };
  const handleAssign = (costume: Costume) => {
    setSelectedCostume(costume)
    setStudentSearch('')
    setCostumeAssignmentForm({
      costumeId: costume.id,
      studentId: '',
      observations: '',
    })
    setErrorMsg('')
    setSelectedStudentsList([])
    openAssignmentModal()
  };

  // Eliminar estudiante de la lista
  const handleRemoveStudentFromList = (studentId: string) => {
    setSelectedStudentsList((prev) => prev.filter((item) => item.studentId !== studentId));
  };
  // Modificar campo de un estudiante de la lista (ej. Talla u Observación)
  const handleUpdateStudentInList = (
    studentId: string,
    field: 'observations',
    value: string
  ) => {
    setSelectedStudentsList((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, [field]: value } : item
      )
    );
  };
  // Handler para agregar estudiante a la tabla
  const handleAddStudentToList = (option: any) => {
    const client: Client = option.data;
    if (!client.student) return;

    // Verificar duplicados en la lista
    if (selectedStudentsList.some((s) => s.studentId === client?.student?.id)) {
      toast.error('El estudiante ya está agregado a la lista.');
      setStudentSearch('');
      return;
    }

    const newItem: ElementToBeAssigned = {
      studentId: client.student.id,
      fullName: `${client.firstName} ${client.lastName}`,
      email: client.email || 'Sin correo',
      observations: '',
    };

    setSelectedStudentsList((prev) => [...prev, newItem]);
    setStudentSearch('');
    setErrorMsg(null);
  };
  // Submit del formulario
  const assignCostume = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCostume) return;

    if (selectedStudentsList.length === 0) {
      setErrorMsg('Debes agregar al menos un estudiante a la lista.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await assignCostumeAction({
      costumeId: selectedCostume.id,
      assignments: selectedStudentsList.map((item) => ({
        studentId: item.studentId,
        observations: item.observations,
      })),
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success('Uniformes asignados satisfactoriamente.');
      setSelectedStudentsList([]);
      closeAssignmentModal();
      fetchData(currentPage, itemsPerPage);
    } else {
      setErrorMsg(res.error || 'Ocurrió un error al asignar los uniformes.');
    }
  };
  const savePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      startTransition(async () => {
        // 2. Construir el payload definitivo
        const payload = {
          id: policyFormData.id,
          key: policyFormData.key,
          value: policyFormData.value,
          active: policyFormData.active,
        };
        // saveCostumeAction debe recibir el payload
        const result = await saveSettingAction(payload, payload.id);
        if (result.success) {
          toast.success("Los Términos y Condiciones se actualizado correctamente.");
          closePoliciesModal();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Adaptación del envío del formulario
  const wardrobeStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      // 1. Subir archivos nuevos a S3
      const newlyUploadedImages = await Promise.all(
        newFiles.map((file) => uploadFileToS3(file))
      );

      // 2. Unificar y DESDUPLICAR las imágenes finales
      const combinedImages: S3Image[] = [
        ...costumeFormData.existingImages,
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
      // 2. Construir el payload definitivo
      const payload: SaveCostumePayload = {
        name: costumeFormData.name,
        beat: costumeFormData.beat || '',
        category: costumeFormData.category,
        status: costumeFormData.status || '',
        price: costumeFormData.price || 0,
        images: finalImages,
      };

      // saveCostumeAction debe recibir el payload y el editingId (si existe)
      const result = await saveCostumeAction(payload, selectedCostume?.id || '');

      if (result.success) {
        fetchData(currentPage, itemsPerPage);
        toast.success(selectedCostume ? "Vestuario actualizado correctamente." : "Vestuario guardado correctamente.");

        // Limpieza de estados tras el guardado exitoso
        setCostumeFormData({ ...costumeFormData, existingImages: [] })
      }
      setSelectedCostume(null); // Reset del ID de edición

      // Solo si es una creación limpiamos el formulario para que quede vacío la próxima vez
      if (!selectedCostume?.id) {
        setCostumeFormData(initialCostumeFormState);
      }

      closeModalForm();

    } catch (error) {
      setErrorMsg("Ocurrió un error al procesar las imágenes seleccionadas.");
      console.error(error);
    }
  };
  // 4. Carga e integración de datos
  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {

      // Petición del resumen por estado
      const res1 = await getCostumeCountByStatus();
      if (res1.data?.byStatus) {
        setStatusCounts(res1.data.byStatus);
      }

      // Petición de la lista paginada
      const res2 = await getAllCostumesAction({
        page: pageToFetch,
        limit: limitToFetch,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(statusFilter !== "all" ? { status: statusFilter } : {}),
        ...(categoryFilter !== "all" ? { category: categoryFilter } : {}),
      });

      if (res2?.success && res2.data) {
        setCostumes(res2.data);
        setMeta(res2.meta);
        if (res2.meta?.totalItems !== undefined) {
          setBadge(APP_KEYS.WARDROBE_COSTUMES, res2.meta.totalItems);
        }
      }
    });
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(currentPage, itemsPerPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter, categoryFilter, currentPage, itemsPerPage]);
  // --- EFFECT PARA estudiantes (Vía Server Action) ---
  useEffect(() => {
    setIsLoadingStudents(true);

    const isSearchEmpty = !studentSearch.trim();
    const delay = isSearchEmpty ? 0 : 400;

    const delayDebounce = setTimeout(async () => {
      try {
        // Construimos los parámetros requeridos por FetchGroupsParams
        const params = isSearchEmpty
          ? { limit: 5 }
          : { search: studentSearch.trim() };

        // Llamada directa al Server Action
        const result = await getAllStudentsAction(params);

        if (result.success && result.data) {
          // Axios mapea la respuesta en result.data. data.data suele ser el array
          // Si tu backend anida los estudiantes en 'estudiantes', úsalo; de lo contrario asigna result.data
          setFilteredStudents(result.data.students || result.data);
        } else {
          console.error("Error en Server Action (estudiantes):", result.error);
          setFilteredStudents([]);
        }
      } catch (error) {
        console.error("Error crítico buscando estudiantes:", error);
        setFilteredStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    }, delay);

    return () => clearTimeout(delayDebounce);
  }, [isAssignmentModalOpen, studentSearch]);
  return (
    <>
      {/* HERO SECTION COMPONENTE REFACTORIZADO */}
      <HeroSection
        htmlTitle={`Inventario y Control de <em class="text-[#5e0472]">Vestuarios</em>`}
        htmlSubTitle="Asigna prendas de baile, gestiona tallas por alumno y controla el estatus del taller de costura."
        actions={[
          {
            label: "Políticas de Uso",
            onClick: async () => {
              startTransition(async () => {
                // Petición del resumen por estado
                const res0 = await getSettingByKeyAction("usage_policies");
                if (res0.data?.id && res0.data?.value) {
                  openPoliciesModal()
                  setPolicyFormData({
                    ...policyFormData,
                    id: res0.data?.id,
                    value: res0.data.value,
                    active: res0.data.active
                  })
                }
              })
            },
            icon: <AlertCircle className="w-4 h-4" />,
            variant: "secondary" as const,
          },
          {
            label: "Agregar Diseño / Traje →",
            onClick: () => {
              setCostumeFormData(initialCostumeFormState);
              setSelectedCostume(null);
              setErrorMsg(null);
              setNewFiles([]);
              openModalForm()
            },
            icon: <Plus className="w-4 h-4" />,
            variant: "primary" as const,
          },
        ]}
      />
      {/* Capa de Carga Asíncrona */}
      <div className="relative w-full">
        <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
          {/* TARJETAS DE INDICADORES RÁPIDOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(STATUS_CONFIG) as LockerRoomStatus[]).map((statusKey) => {
              const config = STATUS_CONFIG[statusKey];
              const count = statusCounts[statusKey] || 0;
              const Icon = config.icon;

              return (
                <div
                  key={statusKey}
                  className="glass-card shadow-sm p-4 flex items-center gap-4 border border-purple-50/50 bg-white/70"
                >
                  <div className={`w-10 h-10 shrink-0 flex items-center justify-center ${config.iconBgClass} ${config.iconTextClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider truncate">
                      {config.title}
                    </p>
                    <h4 className="text-xl font-anton text-gray-800">
                      {count} {config.unitLabel}
                    </h4>
                    <p className="font-questrial text-xs text-gray-500 line-clamp-1">
                      {config.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
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
                <option value="all" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Todas las categorías</option>
                <option value="baby" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Baby</option>
                <option value="childrens" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Infantil</option>
                <option value="youth" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Juvenil</option>
                <option value="adult" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Adulto</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
              >
                <option value="all" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Todos los estados</option>
                <option value="payment_pending" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Pendiente por pago</option>
                <option value="making" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Confeccionando</option>
                <option value="available" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Disponible</option>
                <option value="retired" className="border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Retirado</option>
              </select>
            </div>

          </div>

          {/* LISTADO DE STOCK CON DESGLOSE DE TALLAS */}

          {costumes.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {costumes.map((costume) => {
              return <WardrobeCard
                key={costume.id}
                element={costume}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAssign={handleAssign}
              />
            })}
          </div>) : (
            <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
              <Shirt className="w-10 h-10 text-purple-200 mx-auto mb-3" />
              <p className="font-questrial text-xs text-gray-400">
                {isPending ? "Sincronizando..." : "No se encuentran vestuarios bajo la modalidad seleccionada."}
              </p>
            </div>
          )}


          {/* Seccion de Paginación */}
          {meta.totalPages > 1 && (
            <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
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
      </div>
      {/* MODAL: APERTURA / REGISTRO DE VESTUARIO */}

      <MacDockModal
        isOpen={isModalFormOpen}
        onClose={closeModalForm}
        title={selectedCostume ? "Actualizar Vestuario" : "Registrar Nuevo Vestuario"}
        size={"lg"}
      >

        {/* Formulario (Con scroll interno independiente si el contenido excede el espacio de pantalla) */}
        <form
          ref={clothingFormReference}
          id="costume-form" // <-- Añadimos este ID
          onSubmit={wardrobeStorage}
          className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin"
        >
          {errorMsg && (
            <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">
              {errorMsg}
            </p>
          )}

          {/* Nombre y Beat - Se vuelve un grid de 1 columna en celulares y 2 en pantallas más anchas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              label="Nombre del Vestuario *"
              required
              type="text"
              value={costumeFormData.name}
              onChange={(e) => setCostumeFormData({ ...costumeFormData, name: e.target.value })}
              placeholder="Ej. Set urbano..."
            />

            <TextInput
              label="Ritmo / Coreografía (Beat)"
              required
              type="text"
              value={costumeFormData.beat}
              onChange={(e) => setCostumeFormData({ ...costumeFormData, beat: e.target.value })}
              placeholder="Ej. Salsa, Urbana..."
            />

          </div>
          <TextInput
            label="Precio / Tarifa ($)"
            type="number"
            step="0.01"
            required
            value={costumeFormData.price}
            onChange={(e) => setCostumeFormData({ ...costumeFormData, price: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />


          {/* Categoría y Estado - Grid responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectInput
              label="Categoría *"
              value={costumeFormData.category}
              onChange={(e) => setCostumeFormData({ ...costumeFormData, category: e.target.value as CostumeCategory })}
              options={[
                { label: "Selecciona una categoría", value: "", disabled: true },
                { label: "Baby", value: "baby" },
                { label: "Infantil", value: "childrens" },
                { label: "Juvenil", value: "youth" },
                { label: "Adulto", value: "adult" },
              ]}
            />
            <SelectInput
              label="Estado Inicial *"
              value={costumeFormData.status}
              onChange={(e) => setCostumeFormData({ ...costumeFormData, status: e.target.value as CostumeStatus })}
              options={[
                { label: "Selecciona el status", value: "", disabled: true },
                { label: "Pendiente por pago", value: "payment_pending" },
                { label: "Confeccionando", value: "making" },
                { label: "Disponible", value: "available" },
                { label: "Retirado", value: "retired" },
              ]}
            />
          </div>

          {/* Sección: Galería de Imágenes */}
          <div className="border border-purple-100 bg-purple-50/50 p-3 sm:p-4 space-y-3 rounded-lg">
            <div>
              <label className="block text-gray-700 font-bold">Galería de Imágenes</label>
              <p className="text-[10px] text-gray-400">Sube hasta 10 fotos del diseño en formato JPG, PNG o WEBP.</p>
            </div>

            {/* Grid adaptable de imágenes (de 3 columnas en móviles a 4 en pantallas medianas) */}
            <ImageGalleryPicker
              label="Fotografías del Vestuario"
              existingImages={costumeFormData.existingImages}
              onRemoveExistingImage={handleRemoveExisting}
              files={newFiles}
              onFilesChange={setNewFiles}
              buttonText="Añadir foto"
            />
          </div>
        </form>
        {/* Botonera (Anclada al fondo y con sombra sutil divisoria) */}
        <div className="pt-2 flex justify-between">
          <button
            type="button"
            onClick={() => closeModalForm()}
            className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="costume-form" // <-- Apunta al ID del formulario
            onClick={(e) => { }}
            disabled={isPending}
            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
          >
            {isPending
              ? "Guardando..."
              : selectedCostume
                ? "Actualizar Vestuario →"
                : "Registrar Vestuario →"}
          </button>
        </div>
      </MacDockModal>
      {/* MODAL: APERTURA / REGISTRO DE VESTUARIO */}
      <MacDockModal
        isOpen={isPoliciesModalOpen}
        onClose={closePoliciesModal}
        title={"Actualizar política de uso del vestuario"}
        size={"lg"}
      >
        <form
          ref={policyFormReference}
          id="policies-form" // <-- Añadimos este ID
          onSubmit={savePolicies}
          className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin"
        >
          {errorMsg && (
            <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">
              {errorMsg}
            </p>
          )}

          {/* Control de Activación (Toggle Switch) */}
          <ToggleSwitch
            label="Estado de la Política"
            description={
              policyFormData.active
                ? "La política está activa y visible"
                : "La política está desactivada"
            }
            checked={policyFormData.active}
            onChange={(active) => setPolicyFormData({ ...policyFormData, active })}
          />
          {/* Campo de Políticas de Uso */}
          <TextArea
            label="Políticas de Uso *"
            placeholder="Escribe las políticas de uso aquí..."
            required
            rows={3}
            value={policyFormData.value}
            onChange={(e) => setPolicyFormData({ ...policyFormData, value: e.target.value })}
          />

        </form>


        {/* Botonera (Anclada al fondo y con sombra sutil divisoria) */}
        <div className="pt-2 flex justify-between">
          <button
            type="button"
            onClick={() => closePoliciesModal()}
            className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="policies-form" // <-- Apunta al ID del formulario
            onClick={(e) => { }}
            disabled={isPending}
            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
          >
            {isPending
              ? "Guardando..."
              : "Actualizar →"}
          </button>
        </div>

      </MacDockModal>

      <MacDockModal
        isOpen={isAssignmentModalOpen}
        onClose={closeAssignmentModal}
        title={"Asignar Vestuario"}
        size={"4xl"}
      >
        {/* Formulario (Con scroll interno independiente si el contenido excede el espacio de pantalla) */}
        <form
          ref={assignmentFormReference}
          id="assign-form"
          onSubmit={assignCostume}
          className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin p-1"
        >
          {errorMsg && (
            <p className="text-red-500 bg-red-50 p-2.5 rounded text-xs text-center border border-red-200">
              {errorMsg}
            </p>
          )}

          {/* Info General del Uniforme */}
          {selectedCostume && (
            <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-purple-900">{selectedCostume.name}</span>
                <p className="text-gray-500 text-[11px]">
                  Precio unitario: ${selectedCostume.price ?? '0.00'}
                </p>
              </div>
            </div>
          )}

          {/* Selector/Buscador para agregar estudiantes */}
          <SearchInput
            label="Buscar Estudiante para Agregar"
            placeholder="Escribe el nombre o correo del estudiante..."
            validSelection={false}
            value={studentSearch}
            isLoading={isLoadingStudents}
            options={filteredStudents.map((student: any) => ({
              id: student.id,
              label: `${student.firstName} ${student.lastName}`,
              subLabel: `Email: ${student.email || 'N/A'}`,
              data: student,
            }))}
            emptyMessage="No se encontraron estudiantes"
            onChangeText={(text: string) => setStudentSearch(text)}
            onSelectOption={(option: any) => handleAddStudentToList(option)}
          />

          {/* Tabla con lista de asignación */}
          <div className="mt-4 border rounded-md overflow-hidden border-purple-100">
            <div className="bg-purple-50/80 px-3 py-2 font-semibold text-purple-900 flex justify-between items-center text-xs">
              <span>Estudiantes a Asignar <span className="text-[10px] font-bold p-1 px-1.5 shrink-0 rounded-full bg-purple-900 text-white">{selectedStudentsList.length}</span></span>
              {selectedStudentsList.length > 0 && (
                <span className="text-[11px] font-normal text-purple-700">
                  Total estimado: ${(selectedStudentsList.length * (selectedCostume?.price || 0)).toFixed(2)}
                </span>
              )}
            </div>

            {selectedStudentsList.length === 0 ? (
              <div className="p-6 text-center text-gray-400 flex flex-col items-center gap-1">
                <Info className="w-5 h-5 text-gray-300" />
                <p className="text-xs">No hay estudiantes seleccionados.</p>
                <p className="text-[11px]">Usa el buscador superior para agregar alumnos a la lista.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0">
                    <tr>
                      <th className="p-2.5">Estudiante</th>
                      <th className="p-2.5">Observación</th>
                      <th className="p-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedStudentsList.map((item) => (
                      <tr key={item.studentId} className="hover:bg-purple-50/20">
                        <td className="p-2.5">
                          <p className="font-semibold text-gray-800">{item.fullName}</p>
                          <p className="text-[10px] text-gray-400">{item.email}</p>
                        </td>
                        <td className="p-2.5">
                          <TextArea
                            label=""
                            placeholder="Opcional..."

                            rows={1}
                            value={item.observations || ''}
                            onChange={(e) =>
                              handleUpdateStudentInList(item.studentId, 'observations', e.target.value)
                            }
                          />

                        </td>

                        <td className="p-2.5 text-center">
                          <ActionButton
                            variant="danger"
                            icon={Trash2}
                            tooltip="Quitar"
                            onClick={() => handleRemoveStudentFromList(item.studentId)}
                          >
                            Quitar
                          </ActionButton>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </form>
        {/* Botonera inferior */}
        <div className="pt-4 border-t border-purple-100 bg-purple-50/20 flex justify-between items-center shrink-0 mt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedStudentsList([]);
              closeAssignmentModal();
            }}
            className="cursor-pointer font-questrial px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition rounded-md"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="assign-form"
            disabled={isPending || selectedStudentsList.length === 0}
            className={`group font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs rounded-md ${isPending || selectedStudentsList.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'cursor-pointer text-white gradient-purple shadow-md shadow-purple-200 hover:opacity-90'
              }`}
          >
            <UserPlus className="w-4 h-4" />
            {isPending
              ? 'Procesando...'
              : `Confirmar Asignación${selectedStudentsList.length > 1 ? 'es' : ''} →`}
          </button>
        </div>
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
