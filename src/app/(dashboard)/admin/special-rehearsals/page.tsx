// src/app/(dashboard)/admin/special-rehearsals/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Plus,
    Search,
    CreditCard,
    History,
    ChevronRight,
    Calendar,
    Trash2,
    Pencil,
    CalendarArrowUp,
    ChevronLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import DatePipe from "@/components/pipes/DatePipe";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { ActionButton } from '@/components/ui/ActionButton';
import { TextInput, DateInput, SearchInput, SelectInput } from "@/components/ui/forms";
import TimeRangeSlider from "@/components/common/TimeRangeSlider";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { SpecialRehearsal, SpecialRehearsalFormData } from "@/types/special-rehearsal";
import { Client } from "@/types/client";
import { getAllClassroomsAction, } from "@/app/actions/classroom";
import { getAllStudentsAction } from "@/app/actions/student";
import { saveSpecialRehearsalAction, getAllSpecialRehearsalAction, deleteSpecialRehearsalAction } from "@/app/actions/special-rehearsal";
import { useModal } from "@/hooks/useModal";
import { useSidebarStore } from "@/store/useSidebarStore";
import { APP_KEYS } from "@/config/app-keys";
import { formatDateForInput } from "@/helpers/dates";
// 2. Estado inicial limpio del formulario
const initialFormState: SpecialRehearsalFormData = {
    title: "",
    description: "",
    date: "",
    startTime: "08:00",
    endTime: "09:30",
    classroomId: null,
    location: "",
    studentIds: []
};
export default function SpecialRehearsalsPage() {
    const setBadge = useSidebarStore((state) => state.setBadge);
    // Estados para Modales
    const {
        isOpen: isFormOpen,
        openModal: openFormModal,
        closeModal: closeFormModal
    } = useModal();
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [selectedElement, setSelectedElement] = useState<SpecialRehearsal | null>(null);
    const [specialRehearsals, setSpecialRehearsals] = useState<SpecialRehearsal[]>([]);
    const [formData, setFormData] = useState<SpecialRehearsalFormData>(initialFormState);
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 6,
        itemCount: 6,
    });
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
    // --- ESTADOS PARA BÚSQUEDA DE SALONES ---
    const [classroomSearch, setClassroomSearch] = useState("");
    const [filteredClassrooms, setFilteredClassrooms] = useState<any[]>([]);
    const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
    const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
    // --- ESTADOS PARA BÚSQUEDA DE ESTUDIANTES ---
    const [studentSearch, setStudentSearch] = useState("");
    const [filteredStudents, setFilteredStudents] = useState<Client[]>([]);
    const [showStudentDropdown, setShowStudentDropdown] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // Acción definitiva que se ejecuta al pasar el filtro del Modal
    const handleConfirmAction = async () => {
        if (modalConfig?.id) {
            startTransition(async () => {
                if (modalConfig?.id) {
                    const res = await deleteSpecialRehearsalAction(modalConfig.id);
                    if (res.success) {
                        toast.success("Operación exitosa");
                        fetchData(currentPage, itemsPerPage);
                    }
                }
            });
        }
    };
    const handleEdit = (rehearsal: SpecialRehearsal) => { // Puedes usar la interfaz de tu Student de Prisma

        setFormData({
            title: rehearsal.title || "",
            description: rehearsal.description || "",
            location: rehearsal.location || "",
            date: formatDateForInput(rehearsal.date) || "",
            startTime: rehearsal.startTime || "",
            endTime: rehearsal.endTime || "",
            classroomId: rehearsal.classroomId || "",
            studentIds: rehearsal.students.map(student => student.id) || [],
        });
        setSelectedElement(rehearsal);
        setErrorMsg(null);
        openFormModal();
    };
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        try {
            // Construcción del payload acorde al DTO del backend
            const payload = {
                title: formData.title,
                description: formData.description || undefined,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                classroomId: formData.classroomId || undefined,
                location: formData.location || undefined,
                studentIds: formData.studentIds && formData.studentIds.length > 0 ? formData.studentIds : [],
            };

            startTransition(async () => {
                // Simulación o llamada real a tu Server Action o API Service
                const res = await saveSpecialRehearsalAction(payload, selectedElement?.id || null);
                if (res.success) {
                    toast.success("✨ Ensayo especial registrado exitosamente.");
                    closeFormModal();
                    fetchData(currentPage, itemsPerPage);
                } else {
                    setErrorMsg(res.error || "Error inesperado en el servidor.");
                }
            });
        } catch (error: any) {
            setErrorMsg(error.message || "Error inesperado en el servidor.");
        }
    };
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
                const res = await getAllClassroomsAction(params);
                if (res.success && res.data) {
                    // Axios mapea la respuesta en result.data. data.data suele ser el array
                    // Si tu backend anida los salones en 'classrooms', úsalo; de lo contrario asigna result.data
                    setFilteredClassrooms(res.data.classrooms || res.data);
                } else {
                    console.error("Error en Server Action (Salones):", res.error);
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
    }, [isFormOpen, classroomSearch]);
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
                const res = await getAllStudentsAction(params);

                if (res.success && res.data) {
                    // Axios mapea la respuesta en result.data. data.data suele ser el array
                    // Si tu backend anida los estudiantes en 'estudiantes', úsalo; de lo contrario asigna result.data
                    setFilteredStudents(res.data.students || res.data);
                } else {
                    console.error("Error en Server Action (estudiantes):", res.error);
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
    }, [isFormOpen, studentSearch]);
    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllSpecialRehearsalAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
            });

            if (res.success && res.data) {
                setSpecialRehearsals(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta// 🎯 Cero peticiones extras: actualizamos el badge con el meta.totalItems recibido
                if (res.meta?.totalItems !== undefined) {
                    setBadge(APP_KEYS.SPECIAL_REHEARSALS, res.meta.totalItems);
                }
            }
        });
    };
    // 🎯 MANEJADORES DE LA TABLA
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, currentPage, itemsPerPage]);
    return (
        <>
            {/* SUB-TOPBAR (Saludos y Acción rápida) */}
            <HeroSection
                htmlTitle={`Ensayos de <em class="text-[#5e0472]">Presentación</em>`}
                htmlSubTitle={`Administra los ensayos de presentación.`}
                actions={[{
                    label: "Registrar Ensayo de Presentación →",
                    onClick: () => {
                        setErrorMsg(null);
                        setSelectedElement(null);
                        setFormData(initialFormState);
                        openFormModal();
                    },
                    icon: <Plus className="w-4 h-4" />,
                },]}
            />
            <div className="p-4 md:p-8 w-full space-y-6">

                {/* FILTROS POR CATEGORÍA DE SALÓN */}
                <div className="glass-card p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Buscador e Infraestructura */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center justify-end">
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, descripción, y/o dirección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                {/* LISTADO DE TARJETAS DE SALONES */}

                {specialRehearsals.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {specialRehearsals.map((rehearsal) => (
                        <div
                            key={rehearsal.id}
                            className="glass-card bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
                        >
                            {/* Cabecera de la tarjeta */}
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-questrial font-bold text-gray-800 hover:text-[#5e0472] transition cursor-pointer">
                                        {rehearsal.title}
                                    </h3>

                                    {
                                        rehearsal.date && (
                                            <div className="flex items-center gap-1 text-gray-400 text-[11px] font-questrial">
                                                <Calendar className="w-3 h-3" />
                                                <DatePipe value={rehearsal.date} format="short" />
                                            </div>
                                        )
                                    }
                                </div>

                                {/* Sub-métricas vectoriales del plano */}
                                <div className="grid grid-cols-1 gap-2 pt-3 text-center border-t border-dashed border-gray-100">
                                    <div className="bg-slate-50 p-2">
                                        <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                            Ubicación
                                        </p>
                                        <p className="text-xs font-questrial font-bold text-gray-700">
                                            {rehearsal.location || 'No registrado'}
                                        </p>
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
                                            type: "word",
                                            title: "Confirmar operación",
                                            description: `¿Quieres eliminar el registro del ensayo "${rehearsal.title}"?`,
                                            id: rehearsal.id,
                                        });
                                    }}
                                >
                                    Eliminar
                                </ActionButton>
                                <ActionButton
                                    variant="success"
                                    icon={Pencil}
                                    tooltip="Editar"
                                    onClick={() => handleEdit(rehearsal)}
                                >
                                    Editar
                                </ActionButton>
                            </div>
                        </div>

                    ))}
                </div>) : (
                    <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                        <CalendarArrowUp className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                        <p className="font-questrial text-xs text-gray-400">
                            {isPending ? "Sincronizando..." : "No se encuentran salones configurados bajo la modalidad seleccionada."}
                        </p>
                    </div>
                )}


                {/* Seccion de Paginación */}
                {meta.totalPages > 1 && (
                    <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
                        <div className="text-xs font-questrial text-gray-500">
                            Mostrando <span className="font-semibold text-gray-700">{specialRehearsals.length}</span> de{" "}
                            <span className="font-semibold text-gray-700">{meta.totalItems}</span> ensayos
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

            {/* MODAL DE CREACIÓN/EDICIÓN DE EMPLEADO */}
            <MacDockModal
                isOpen={isFormOpen}
                onClose={closeFormModal}
                title={"Registrar Ensayo de Presentación"}
                size={"lg"}
            >
                <form
                    onSubmit={handleSave}
                    className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin pr-1"
                >
                    {errorMsg && (
                        <p className="text-red-500 bg-red-50 p-2 text-sm text-center border border-red-100 rounded-md">
                            {errorMsg}
                        </p>
                    )}

                    {/* 1. Título del Ensayo */}
                    <TextInput
                        label="Título del Ensayo *"
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Ensayo General para Gala de Navidad"
                    />

                    {/* 2. Descripción */}
                    <TextInput
                        label="Descripción / Observaciones"
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Ej: Traer vestuario completo y zapatos de carácter"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 3. Fecha del Ensayo */}
                        <DateInput
                            label="Fecha del Ensayo *"
                            value={formData.date}
                            onChange={(val) => setFormData({ ...formData, date: val })}
                        />

                        {/* 4. Ubicación Externa (Opcional si usa salón de academia) */}
                        <TextInput
                            label="Ubicación Externa (Fuera de academia)"
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Ej: Teatro Principal de la Ciudad"
                        />
                    </div>

                    {/* 5. Salón Interno (Opcional si es externo) */}
                    <SearchInput
                        label="Salón de Clases Asignado"
                        placeholder="Escribe para buscar o selecciona de la lista..."
                        value={classroomSearch}
                        isLoading={isLoadingClassrooms}
                        options={filteredClassrooms.map((classroom: any) => ({
                            id: classroom.id,
                            label: classroom.name,
                            subLabel: `Dirección: ${classroom.address}, Capacidad: ${classroom.maxCapacity}`,
                            data: classroom,
                        }))}
                        emptyMessage="No se encontraron salones coincidentes"
                        onChangeText={(text) => {
                            setClassroomSearch(text);
                            setFormData({
                                ...formData,
                                classroomId: text as any,
                            });
                        }}
                        onSelectOption={(option) => {
                            setFormData({
                                ...formData,
                                classroomId: option.id as any,
                            });
                            setClassroomSearch(`${option.data?.name} (${option.data?.type || 'Aula'})`);
                        }}
                    />

                    {/* 6. Selector Múltiple de Estudiantes */}
                    <SearchInput
                        label="Estudiantes Participantes (Selección Múltiple)"
                        placeholder="Escribe el nombre o DNI para filtrar..."
                        multiple={true}
                        selectedIds={formData.studentIds}
                        // 🌟 Mapeamos siempre sobre la lista completa 'students' (no sobre filteredStudents)
                        // así no se perderán los datos de las etiquetas seleccionadas previamente al filtrar
                        selectedOptions={selectedElement ? selectedElement.students.map((student: any) => ({
                            id: student.id,
                            label: `${student.firstName || student.clients[0]?.firstName} ${student.lastName || student.clients[0]?.lastName}`,
                        })) : filteredStudents
                            .filter((client: Client) => client.student?.id && formData.studentIds.includes(client.student.id)) // 🌟 Agregamos check 's.id &&'
                            .map((client: Client) => ({
                                id: client.student?.id!, // 🌟 El '!' le asegura a TypeScript que id ya no es undefined
                                label: `${client.firstName} ${client.lastName}`,
                            }))}

                        value={studentSearch}
                        isLoading={isLoadingStudents}
                        options={filteredStudents.map((client: Client) => ({
                            id: client.student?.id as any,
                            label: `${client.firstName} ${client.lastName}`,
                            subLabel: `Email: ${client.email || 'N/A'}`,
                            data: client,
                        }))}
                        emptyMessage="No se encontraron estudiantes"
                        onChangeText={(text) => setStudentSearch(text)}
                        onSelectOption={(option) => {
                            const studentIdStr = String(option.id);
                            const exists = formData.studentIds.includes(studentIdStr);

                            const updatedStudentIds = exists
                                ? formData.studentIds.filter((id) => id !== studentIdStr)
                                : [...formData.studentIds, studentIdStr];

                            setFormData({
                                ...formData,
                                studentIds: updatedStudentIds,
                            });
                        }}
                        onRemoveOption={(optionId) => {
                            setFormData({
                                ...formData,
                                studentIds: formData.studentIds.filter((id) => id !== String(optionId)),
                            });
                        }}
                    />
                    {/* 7. Selector de Rango Horario (Valida automáticamente solapamientos con clases regulares en backend) */}
                    <div className="space-y-2">
                        <div className="mb-1">
                            <label className="text-gray-700 font-bold text-xs">Horario del Ensayo *</label>
                        </div>
                        <TimeRangeSlider
                            startTime={formData.startTime}
                            endTime={formData.endTime}
                            onChange={({ startTime, endTime }) =>
                                setFormData({ ...formData, startTime, endTime })
                            }
                        />
                    </div>


                    {/* Botonera de Acción */}
                    <div className="pt-4 border-t border-purple-100 bg-purple-50/25 flex justify-between shrink-0 px-2 pb-2">
                        <button
                            type="button"
                            onClick={closeFormModal}
                            className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
                        >
                            {isPending ? "Guardando..." : "Registrar Ensayo Especial →"}
                        </button>
                    </div>
                </form>
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