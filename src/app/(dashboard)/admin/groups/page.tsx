// src/app/(dashboard)/admin/groups/page.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
  CalendarDays,
  User,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  BookmarkCheck,
  Flame,
  UserCheck2,
  Filter,
  Sparkles,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { getAllGroupsAction, saveGroupAction, deleteGroupAction } from "@/app/actions/group";
import { getAllClassroomsAction } from "@/app/actions/classroom";
import { getAllInstructorsAction } from "@/app/actions/instructor";
import { Group } from "@/types/group";
// 1. Tipado preciso para los datos que controla el formulario
type GroupFormData = Omit<Group, "id" | "classroom" | "instructor" | "schedules"> & {
  classroomId: string;
  instructorId: string;
};

// 2. Estado inicial limpio del formulario
const initialFormState: GroupFormData = {
  name: "",
  style: "",
  category: "baby",
  totalNumberOfSlots: 20,
  classroomId: "",
  instructorId: ""
};
export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estado del formulario tipado correctamente
  const [formData, setFormData] = useState<GroupFormData>(initialFormState);

  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
  // Acción definitiva que se ejecuta al pasar el filtro del Modal
  const handleConfirmAction = async () => {
    if (modalConfig?.id) {
      startTransition(async () => {
        if (modalConfig?.id) {
          const res = await deleteGroupAction(modalConfig.id);
          if (res.success) {
            toast.success("Operación exitosa");
            setGroups(groups.filter((item) => item.id !== modalConfig.id));
            // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
            window.dispatchEvent(new Event('refresh-groups-count'));
          }
        }
      });
    }
  };
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

  const [categoryFilter, setCategoryFilter] = useState("all");

  // --- ESTADOS PARA BÚSQUEDA DE SALONES ---
  const [classroomSearch, setClassroomSearch] = useState("");
  const [filteredClassrooms, setFilteredClassrooms] = useState<any[]>([]);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);

  // --- ESTADOS PARA BÚSQUEDA DE INSTRUCTORES ---
  const [instructorSearch, setInstructorSearch] = useState("");
  const [filteredInstructors, setFilteredInstructors] = useState<any[]>([]);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false);

  // Refs para cerrar los menús si el usuario hace click afuera
  const classroomRef = useRef<HTMLDivElement>(null);
  const instructorRef = useRef<HTMLDivElement>(null);

  // Clic afuera para cerrar dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (classroomRef.current && !classroomRef.current.contains(event.target as Node)) {
        setShowClassroomDropdown(false);
      }
      if (instructorRef.current && !instructorRef.current.contains(event.target as Node)) {
        setShowInstructorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce Effect para Salones
  // --- EFFECT PARA SALONES (Vía Server Action) ---
  useEffect(() => {
    // Evitamos re-consultar si el string coincide con el elemento ya seleccionado
    if (formData.classroomId && filteredClassrooms.find(c => c.id === formData.classroomId)?.name === classroomSearch) {
      return;
    }

    setIsLoadingClassrooms(true);

    const isSearchEmpty = !classroomSearch.trim();
    const delay = isSearchEmpty ? 0 : 400;

    const delayDebounce = setTimeout(async () => {
      try {
        // Construimos los parámetros requeridos por FetchClassroomsParams
        const params = isSearchEmpty
          ? { limit: 5 }
          : { search: classroomSearch.trim() };

        // Llamada directa al Server Action
        const result = await getAllClassroomsAction(params);

        if (result.success && result.data) {
          // Axios mapea la respuesta en result.data. data.data suele ser el array
          // Si tu backend anida los salones en 'classrooms', úsalo; de lo contrario asigna result.data
          setFilteredClassrooms(result.data.classrooms || result.data);
        } else {
          console.error("Error en Server Action (Salones):", result.error);
          setFilteredClassrooms([]);
        }
      } catch (error) {
        console.error("Error crítico buscando salones:", error);
        setFilteredClassrooms([]);
      } finally {
        setIsLoadingClassrooms(false);
      }
    }, delay);

    return () => clearTimeout(delayDebounce);
  }, [classroomSearch]);
  // --- EFFECT PARA INSTRUCTORES (Carga inicial 5 + Búsqueda Dinámica) ---
  useEffect(() => {
    // Evitamos re-consultar si el string coincide con el elemento ya seleccionado
    if (formData.instructorId && filteredInstructors.find(i => i.id === formData.instructorId)?.name === instructorSearch) {
      return;
    }

    setIsLoadingInstructors(true);

    const isSearchEmpty = !instructorSearch.trim();
    const delay = isSearchEmpty ? 0 : 400;

    const delayDebounce = setTimeout(async () => {
      try {
        // Construimos los parámetros requeridos por FetchInstructorParams
        const params = isSearchEmpty
          ? { limit: 5 }
          : { search: instructorSearch.trim() };

        // Llamada directa al Server Action
        const result = await getAllInstructorsAction(params);

        if (result.success && result.data) {
          // Axios mapea la respuesta en result.data. data.data suele ser el array
          // Si tu backend anida los instructor en 'instructors', úsalo; de lo contrario asigna result.data
          setFilteredInstructors(result.data.instructors || result.data);
        } else {
          console.error("Error en Server Action (Instructores):", result.error);
          setFilteredInstructors([]);
        }
      } catch (error) {
        console.error("Error crítico buscando instructores:", error);
        setFilteredInstructors([]);
      } finally {
        setIsLoadingInstructors(false);
      }
    }, delay);

    return () => clearTimeout(delayDebounce);
  }, [instructorSearch]);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    // Validaciones preventivas en el cliente
    if (!formData.name.trim()) {
      setErrorMsg("El nombre del grupo es obligatorio.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.classroomId) {
      setErrorMsg("Debes asignar un salón de clases.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.instructorId) {
      setErrorMsg("Debes asignar un instructor responsable.");
      setIsSubmitting(false);
      return;
    }

    try {
      startTransition(async () => {
        const res = await saveGroupAction(formData, null);
        if (!res.success) {
          setErrorMsg(res.error || "Ocurrió un error.");
          return;
        }
        toast.success("Operación exitosa");

        setGroups([res.data!, ...groups]);
        // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
        window.dispatchEvent(new Event('refresh-groups-count'));
        setIsModalOpen(false);
      });

      // Si todo sale bien, refrescamos y limpiamos estados
      setIsModalOpen(false);
      setFormData(initialFormState); // Resetea el formulario para el siguiente registro

    } catch (error: any) {
      console.error("Error detectado en handleSave:", error);
      setErrorMsg(error.message || "Ocurrió un problema de red al intentar crear el grupo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res = await getAllGroupsAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
        category: categoryFilter == 'all' ? undefined : categoryFilter
      });

      if (res.success && res.data) {
        setGroups(res.data);
        setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
      }
    });
  };
  // Resetear a la página 1 cuando cambien los filtros de búsqueda o categorías
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(currentPage, itemsPerPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, categoryFilter, currentPage, itemsPerPage]);
  return (
    <>

      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection
        htmlTitle={`Grupos de <em class="text-[#5e0472]">Clases</em>`}
        htmlSubTitle={`Monitorea el uso de los grupos de clases.`}

        actions={[{
          label: "Registrar Nuevo Grupo →",
          onClick: () => {
            setFormData(initialFormState);
            setErrorMsg(null);
            setIsModalOpen(true);
          },
          icon: <Plus className="w-4 h-4" />,
          variant: "primary",
        }]}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
        {/* METRICAS OPERATIVAS DEL DÍA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Resultado total</p>
              <h4 className="text-xl font-anton text-gray-800">{meta.totalItems || 0} Grupos</h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Recuento de artículos</p>
              <h4 className="text-xl font-anton text-gray-800">{meta.itemCount || 0} Grupos</h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Elementos por página</p>
              <h4 className="text-xl font-anton text-gray-800">{meta.itemsPerPage || 0} Alumnos</h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Páginas totales</p>
              <h4 className="text-xl font-anton  text-gray-800">{meta.totalPages || 0} Páginas</h4>
            </div>
          </div>
        </div>

        {/* TABS DE NAVEGACIÓN Y FILTROS BAR */}

        <div className="glass-card p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o estilo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>

          {/* selectores de filtros */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end font-questrial">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Filter className="w-3.5 h-3.5 text-purple-500" />
              <span className="">Categoría:</span>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">Todos los grupos</option>
              <option value="baby">Baby</option>
              <option value="childrens">Infantil</option>
              <option value="youth">Juvenil</option>
              <option value="adult">Adulto</option>
            </select>
          </div>
        </div>

        {/* FLUJO TIPO TIME-LINE / TARJETAS */}
        <div className="space-y-4">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group.id}
                className={`glass-card p-5 shadow-sm border transition flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-[#5e0472] bg-purple-50/10`}
              >
                {/* Información e Identificador */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:w-2/5">
                  {/* Iconografía por tipo */}
                  <div className={`w-11 h-11 flex items-center justify-center shrink-0 bg-pink-100 text-pink-700`}>
                    <BookmarkCheck className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap font-questrial">
                      <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold ${group.category === "baby" ? "bg-red-100 text-red-700" :
                        group.category === "childrens" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                        {group.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-questrial">
                        {group.classroom?.name}, {group.classroom?.address}
                      </span>
                    </div>
                    <h3 className="font-anton text-gray-800 text-base mt-1">{group.name}</h3>
                    <p className="text-xs text-gray-500 font-questrial font-medium">{group.style}</p>
                  </div>
                </div>

                {/* Logística de Salón y Profesor */}
                <div className="grid grid-cols-2 gap-3 text-xs md:w-2/5 text-gray-500 font-medium">

                  <div className="flex items-center gap-2 col-span-2">
                    <User className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-questrial">Capacidad máxina: <strong className="text-gray-700 font-semibold">{group.totalNumberOfSlots} alumnos</strong></span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <User className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span className="font-questrial">Capacidad ocupada: <strong className="text-gray-700 font-semibold">{group.students?.length || 0} alumnos</strong></span>
                  </div>
                </div>

                {/* Estado de Ejecución en Salón */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-purple-50/50 shrink-0 font-questrial">

                  <button onClick={() => {
                    setModalConfig({
                      isOpen: true,
                      type: "word",
                      title: "Confirmar operación",
                      description: "¿Quieres eliminar el registro del grupo?",
                      id: group.id,
                    });
                  }} className="text-xs bg-white border border-purple-100 text-[#5e0472] px-3 py-1.5 font-semibold hover:bg-[#5e0472] hover:text-white transition shadow-sm cursor-pointer">
                    Eliminar
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
              No hay grupos registrados para este filtro.
            </div>
          )}
        </div>

        {/* Seccion de Paginación */}
        {meta.totalPages > 1 && (
          <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-50/60 shadow-xs">
            <div className="text-xs font-questrial text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{groups.length}</span> de{" "}
              <span className="font-semibold text-gray-700">{meta.totalItems}</span> grupos
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">
            {/* Cabecera del Modal */}
            <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center">
              <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> Registrar Nuevo Grupo de Danza
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
              {errorMsg && (
                <p className="text-red-500 bg-red-50 p-2 text-sm text-center mb-4">
                  {errorMsg}
                </p>
              )}

              {/* Fila 1: Nombre del Grupo */}
              <div>
                <label className="block text-gray-500 font-bold mb-1">
                  Nombre del Grupo / Sección *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Hip Hop Juvenil - Sección A"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Fila 2: Estilo de Baile y Categoría (Edad) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Estilo de Baile
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Urban Dance, Salsa, Ballet"
                    value={formData.style || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, style: e.target.value })
                    }
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Categoría (Rango de Edad) *
                  </label>
                  <select
                    required
                    value={formData.category || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as any })
                    }
                    className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="" disabled>Selecciona la categoría</option>
                    <option value="baby">Baby (3-5 años)</option>
                    <option value="childrens">Infantil (6-11 años)</option>
                    <option value="youth">Juvenil (12-17 años)</option>
                    <option value="adult">Adulto (18+ años)</option>
                  </select>
                </div>
              </div>

              {/* Fila 3: Cupos de la sección */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Cupos Máximos (Capacidad) *
                  </label>
                  <input
                    required
                    type="number"
                    min={1}
                    placeholder="Ej: 20"
                    value={formData.totalNumberOfSlots || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, totalNumberOfSlots: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
              {/* Fila 4: Salón de Clases */}
              <div className="relative" ref={classroomRef}>
                <label className="block text-gray-500 font-bold mb-1">Salón de Clases Asignado *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="Escribe para buscar o selecciona de la lista..."
                    value={classroomSearch}
                    onFocus={() => setShowClassroomDropdown(true)} // Al hacer foco abre la lista inicial
                    onChange={(e) => {
                      setClassroomSearch(e.target.value);
                      setShowClassroomDropdown(true);
                      if (formData.classroomId) setFormData({ ...formData, classroomId: "" });
                    }}
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 pr-8"
                  />
                  {isLoadingClassrooms && (
                    <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                <input type="hidden" required value={formData.classroomId} name="classroomId" />

                {/* ✨ CAMBIO: Se muestra siempre que el dropdown esté activo y tengamos elementos cargados (o cargándose) */}
                {showClassroomDropdown && (filteredClassrooms.length > 0 || isLoadingClassrooms || classroomSearch.trim().length > 0) && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg font-questrial text-xs rounded-none divide-y divide-gray-50">
                    {isLoadingClassrooms ? (
                      <li className="p-2 text-gray-400 italic">Cargando opciones...</li>
                    ) : filteredClassrooms.length === 0 ? (
                      <li className="p-2 text-red-400 bg-red-50/30">No se encontraron salones coincidentes</li>
                    ) : (
                      filteredClassrooms.map((c: any) => (
                        <li
                          key={c.id}
                          onClick={() => {
                            setFormData({ ...formData, classroomId: c.id });
                            setClassroomSearch(`${c.name} (${c.type || 'Aula'})`);
                            setShowClassroomDropdown(false);
                          }}
                          className="p-2 hover:bg-purple-50 cursor-pointer transition-colors flex justify-between items-center"
                        >
                          <span className="font-medium text-gray-700">{c.name}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Cap: {c.maxCapacity || c.capacity}</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {/* Fila 5: Instructor */}
              <div className="relative" ref={instructorRef}>
                <label className="block text-gray-500 font-bold mb-1">Instructor / Coreógrafo Responsable *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="Escribe para buscar o selecciona de la lista..."
                    value={instructorSearch}
                    onFocus={() => setShowInstructorDropdown(true)} // Al hacer foco abre la lista inicial
                    onChange={(e) => {
                      setInstructorSearch(e.target.value);
                      setShowInstructorDropdown(true);
                      if (formData.instructorId) setFormData({ ...formData, instructorId: "" });
                    }}
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 pr-8"
                  />
                  {isLoadingInstructors && (
                    <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                <input type="hidden" required value={formData.instructorId} name="instructorId" />

                {/* ✨ CAMBIO: Se muestra siempre que el dropdown esté activo y tengamos elementos cargados (o cargándose) */}
                {showInstructorDropdown && (filteredInstructors.length > 0 || isLoadingInstructors || instructorSearch.trim().length > 0) && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg font-questrial text-xs rounded-none divide-y divide-gray-50">
                    {isLoadingInstructors ? (
                      <li className="p-2 text-gray-400 italic">Cargando opciones...</li>
                    ) : filteredInstructors.length === 0 ? (
                      <li className="p-2 text-red-400 bg-red-50/30">No se encontraron instructores</li>
                    ) : (
                      filteredInstructors.map((inst: any) => (
                        <li
                          key={inst.id}
                          onClick={() => {
                            setFormData({ ...formData, instructorId: inst.id });
                            setInstructorSearch(inst.name);
                            setShowInstructorDropdown(false);
                          }}
                          className="p-2 hover:bg-purple-50 cursor-pointer transition-colors flex flex-col gap-0.5"
                        >
                          <span className="font-medium text-gray-700">{inst.name}</span>
                          {inst.dni && <span className="text-[10px] text-gray-400">DNI: {inst.dni}</span>}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {/* Botonera de Acción */}
              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Grupo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
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