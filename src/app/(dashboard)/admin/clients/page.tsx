// src/app/(dashboard)/admin/clients/page.tsx
"use client";
import { useState, useTransition, useEffect } from "react";
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    User as UserLucide,
    Calendar,
    Users,
    Users2,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import HeroSection from "@/components/layout/HeroSection";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import DatePipe from "@/components/pipes/DatePipe";
import { TextInput, TextArea, SelectInput, EmailInput, SearchInput, RadioGroup, PhoneInput, DateInput } from '@/components/ui/forms';
import Badge from "@/components/common/Badge";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { Client, CustomerFormData } from "@/types/client";
import { User } from "@/types/user";
import { formatDateForInput } from "@/helpers/dates";
import { APP_KEYS } from "@/consts/app";
import { getAllUsersAction } from "@/app/actions/user";
import { saveClientAction, getAllClientsAction, deleteClientAction } from "@/app/actions/client";
const initialFormState: CustomerFormData = {
    firstName: "",
    lastName: "",
    dni: "",
    email: "",
    countryCode: "+58",
    phone: "",
    address: "",
    birthDate: "",
    userId: null,
    type: "student",
    kinship: "son",
    medicalObservations: "",
    shirtSize: "",
    hasExperience: false, // Operador de coalescencia nula para booleanos
};
const countries = [
    { code: "+58", label: "VE" },
    { code: "+57", label: "CO" },
    { code: "+51", label: "PE" },
    { code: "+56", label: "CL" },
    { code: "+54", label: "AR" },
    { code: "+34", label: "ES" },
    { code: "+1", label: "US" },
];
export default function ClientsPage() {

    // --- ESTADOS PARA BÚSQUEDA DE grupos ---
    const [userSearch, setUserSearch] = useState("");
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CustomerFormData>(initialFormState);
    const [clients, setClients] = useState<Client[]>([]);
    const { isOpen, openModal, closeModal } = useModal();
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
    // ✅ CORRECT: Format the Date to "YYYY-MM-DD"
    /* const formatDateForInput = (date: Date) => date.toISOString().split('T')[0]; */

    const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // Acción definitiva que se ejecuta al pasar el filtro del Modal
    const handleConfirmAction = async () => {
        if (modalConfig?.id) {
            startTransition(async () => {
                if (modalConfig?.id) {
                    const res = await deleteClientAction(modalConfig.id);
                    if (res.success) {
                        toast.success("Operación exitosa");
                        setClients(clients.filter((item) => item.id !== modalConfig.id));
                        // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
                        window.dispatchEvent(new Event(APP_KEYS.REFRESH_CLIENTS_COUNT));
                        window.dispatchEvent(new Event(APP_KEYS.REFRESH_STUDENTS_COUNT));
                    }
                }
            });
        }
    };
    const handleEditModal = (client: Client) => { // Puedes usar la interfaz de tu Student de Prisma
        setUserSearch(client.user?.name || "");
        setFormData({
            firstName: client.firstName || "",
            lastName: client.lastName || "",
            dni: client.dni || "",
            email: client.user?.email || "",
            phone: client.phone || "",
            countryCode: client.countryCode || "+58",
            address: client.address || "",
            birthDate: formatDateForInput(client.birthDate),
            userId: client.userId || null,
            type: client.type || "student",
            kinship: client.student?.kinship || "son",
            medicalObservations: client.student?.medicalObservations || "",
            shirtSize: client.student?.shirtSize || "",
            hasExperience: client.student?.hasExperience || false,
        });
        setEditingId(client.id);
        setErrorMsg(null);
        openModal();
    };
    // --- MANEJADOR DE GUARDADO DE CLIENTES ---
    const handleSave = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg(null)

        // Validaciones preventivas en el cliente
        if (!formData.firstName.trim()) {
            setErrorMsg("El nombre del cliente es obligatorio.");
            return;
        }

        if (!formData.lastName.trim()) {
            setErrorMsg("El apellido del cliente es obligatorio.");
            return;
        }

        if (!formData.dni.trim()) {
            setErrorMsg("El DNI / documento de identidad es obligatorio.");
            return;
        }

        try {
            startTransition(async () => {
                // 🎯 Acción de servidor / API para guardar el cliente
                const res = await saveClientAction({
                    ...formData,
                    // Si no se seleccionó un usuario válido de la lista, envía null
                    userId: formData.userId?.trim() ? formData.userId : null,
                }, editingId);

                if (!res.success) {
                    setErrorMsg(res.error || "Ocurrió un error al guardar el cliente.");
                    return;
                }

                toast.success(
                    editingId
                        ? "Cliente actualizado correctamente"
                        : "Cliente registrado con éxito"
                );

                // Refrescar conteo o eventos
                if (!editingId) {
                    window.dispatchEvent(new Event(APP_KEYS.REFRESH_CLIENTS_COUNT));
                    window.dispatchEvent(new Event(APP_KEYS.REFRESH_STUDENTS_COUNT));
                }

                fetchData(currentPage, itemsPerPage);
                closeModal();
            });
        } catch (error: any) {
            console.error("Error detectado en handleSave:", error);
            setErrorMsg(
                error.message ||
                "Ocurrió un problema de red al intentar guardar el cliente."
            );
        }
    };
    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {
            const res = await getAllClientsAction({
                page: pageToFetch,
                limit: limitToFetch, // 🎯 Enviamos el límite dinámico
                search: searchTerm || undefined,
            });

            if (res.success && res.data) {
                setClients(res.data);
                setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
            }
        });
    };
    // 🎯 MANEJADORES DE LA TABLA
    // --- EFFECT PARA usuarios (Vía Server Action) ---
    useEffect(() => {
        // Evitamos re-consultar si el string coincide con el elemento ya seleccionado
        if (filteredUsers.find(c => c.id === formData.userId)?.name === userSearch) {
            return;
        }

        setIsLoadingUsers(true);

        const isSearchEmpty = !userSearch.trim();
        const delay = isSearchEmpty ? 0 : 400;

        const delayDebounce = setTimeout(async () => {
            try {
                // Construimos los parámetros requeridos por FetchUsersParams
                const params = isSearchEmpty
                    ? { limit: 5 }
                    : { search: userSearch.trim() };

                // Llamada directa al Server Action
                const result = await getAllUsersAction(params);

                if (result.success && result.data) {
                    // Axios mapea la respuesta en result.data. data.data suele ser el array
                    // Si tu backend anida los grupos en 'users', úsalo; de lo contrario asigna result.data
                    setFilteredUsers(result.data.users || result.data);
                } else {
                    console.error("Error en Server Action (usuarios):", result.error);
                    setFilteredUsers([]);
                }
            } catch (error) {
                console.error("Error crítico buscando usuarios:", error);
                setFilteredUsers([]);
            } finally {
                setIsLoadingUsers(false);
            }
        }, delay);

        return () => clearTimeout(delayDebounce);
    }, [isOpen, userSearch]);
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
                htmlTitle={`Control de <em class="text-[#5e0472]">Clientes</em>`}
                htmlSubTitle={`Clientes de la Academia.`}
                actions={[
                    {
                        label: "Registrar cliente →",
                        onClick: () => {
                            setFormData(initialFormState);
                            setErrorMsg(null);
                            setEditingId(null);
                            setUserSearch(``);
                            openModal();
                        },
                        icon: <Plus className="w-4 h-4" />,
                    },
                ]}
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
                        {/* <select
                            value={typeOfRoom}
                            onChange={(e: any) => setTypeOfRoom(e.target.value)}
                            className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                        >
                            <option value="all">Todos los clientes</option>
                            <option value="mirrors">Salones Espejos</option>
                            <option value="urban">Salones Urbano</option>
                            <option value="free">Salones Libre</option>
                            <option value="theories">Salones Teorias</option>
                        </select> */}
                    </div>
                </div>

                {/* LISTADO DE TARJETAS DE SALONES */}

                {clients.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client: Client) => {
                        // Formatear la fecha de nacimiento de forma legible
                        const formattedBirthDate = client.birthDate
                            ? new Date(client.birthDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })
                            : 'N/A';

                        return (
                            <div
                                key={client.id}
                                className="glass-card bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
                            >
                                {/* Cabecera de la tarjeta */}
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-sm font-questrial font-bold text-gray-800 hover:text-[#5e0472] transition cursor-pointer">
                                            {client.firstName} {client.lastName}
                                        </h3>

                                        {
                                            client.createdAt && (
                                                <div className="flex items-center gap-1 text-gray-400 text-[11px] font-questrial">
                                                    <Calendar className="w-3 h-3" />
                                                    <DatePipe value={client.createdAt} format="short" />
                                                </div>
                                            )
                                        }
                                    </div>

                                    {/* Sub-métricas vectoriales del plano */}
                                    <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-dashed border-gray-100">
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                DNI / Cedula
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {client.dni || 'No registrado'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Teléfono
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {client.phone || 'No registrado'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Nacimiento
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {formattedBirthDate}
                                            </p>
                                        </div>
                                    </div>



                                    {/* Relaciones opcionales (Estudiante, Usuario, Grupo) */}
                                    {client.group && (<div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-dashed border-gray-100">
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Grupo
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {client.group.name || client.groupId}
                                            </p>
                                        </div>
                                    </div>)}


                                    <div className="flex justify-between gap-2">


                                        <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
                                            <div className={`w-8 h-8 rounded-full  flex items-center justify-center  text-xs font-anton tracking-wider shrink-0 ${client.student
                                                ? "text-white bg-[#5e0472]"
                                                : "bg-slate-50"
                                                }`}

                                            >
                                                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                                            </div>
                                            {client.student ? (
                                                <div className="hidden md:flex flex-col text-left font-questrial">
                                                    <span className="text-xs font-bold text-gray-700 leading-tight">{client.firstName}</span>
                                                    <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{client.lastName}</span>
                                                </div>) : (
                                                <div className="hidden md:flex flex-col text-left font-questrial">
                                                    <span className="text-xs font-bold text-gray-700 leading-tight">Sin estudiante</span>
                                                </div>)}
                                        </div>

                                        <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">


                                            {client.user ? (
                                                <div className="hidden md:flex flex-col text-left font-questrial">
                                                    <span className="text-xs font-bold text-gray-700 leading-tight">{client.user.name}</span>
                                                    <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{client.user.email}</span>
                                                </div>) : (
                                                <div className="hidden md:flex flex-col text-left font-questrial">
                                                    <span className="text-xs font-bold text-gray-700 leading-tight">Sin usuario</span>
                                                </div>)}



                                            <div
                                                className={`w-8 h-8 rounded-full  flex items-center justify-center  text-xs font-anton tracking-wider shrink-0 ${client.user
                                                    ? "text-white bg-[#5e0472]"
                                                    : "bg-slate-50"
                                                    }`}>
                                                <UserLucide className="w-3.5 h-3.5 shrink-0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones y Footer de la tarjeta */}
                                <div className="px-5 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-end">
                                    <div className="flex items-center gap-1.5">

                                        <button
                                            onClick={() => {
                                                setModalConfig({
                                                    isOpen: true,
                                                    type: 'word',
                                                    title: 'Confirmar eliminación',
                                                    description: `¿Estás seguro de que deseas eliminar el registro de ${client.firstName} ${client.lastName}?`,
                                                    id: client.id,
                                                });
                                            }}
                                            className="p-1.5 transition border border-transparent cursor-pointer text-rose-600 bg-rose-50 hover:bg-rose-100"
                                            title="Eliminar registro"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => handleEditModal(client)}
                                            className="p-1.5 transition border border-transparent cursor-pointer text-green-600 bg-green-50 hover:bg-green-100"
                                            title="Editar Cliente"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>) : (
                    <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                        <Users className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                        <p className="font-questrial text-xs text-gray-400">
                            {isPending ? "Sincronizando..." : "No se encuentran clientes bajo la modalidad seleccionada.."}
                        </p>
                    </div>
                )}


                {/* Seccion de Paginación */}
                {meta.totalPages > 1 && (
                    <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
                        <div className="text-xs font-questrial text-gray-500">
                            Mostrando <span className="font-semibold text-gray-700">{clients.length}</span> de{" "}
                            <span className="font-semibold text-gray-700">{meta.totalItems}</span> clientes
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
            <MacDockModal
                isOpen={isOpen}
                onClose={closeModal}
                title={editingId ? "Actualizar Cliente" : "Registrar Nuevo Cliente"}
                size={"2xl"}
            >
                {/* --- FORMULARIO DE REGISTRO DE CLIENTES --- */}
                <form onSubmit={handleSave} className="space-y-4 font-questrial text-xs">
                    {errorMsg && (
                        <p className="text-red-500 bg-red-50 p-2 text-sm text-center mb-4 border border-red-100">
                            {errorMsg}
                        </p>
                    )}

                    {/* ✨ SECCIÓN SELECTOR DE USUARIO (OPCIONAL) */}
                    <SearchInput
                        label="Asignación de representante académico"
                        placeholder="Escribe para buscar o selecciona de la lista..."
                        value={userSearch}
                        isLoading={isLoadingUsers}
                        options={filteredUsers.map((user: any) => ({
                            id: user.id,
                            label: user.name,
                            subLabel: `Email: ${user.email}`,
                            data: user, // Guardamos el objeto completo si hace falta
                        }))}
                        emptyMessage="No se encontraron usuarios coincidentes"
                        onChangeText={(text) => {
                            setUserSearch(text);
                            setFormData({
                                ...formData,
                                userId: text as any,
                            });
                        }}
                        onSelectOption={(option) => {
                            setFormData({
                                ...formData,
                                userId: option.id as any,
                            });
                            setUserSearch(`${option.label} (${option.data?.email || 'Usuario'})`);
                        }}
                    />


                    {/* Fila 1: Nombres y Apellidos */}
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput
                            label="Nombres *"
                            required
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="Ej: Maria Paula"
                        />

                        <TextInput
                            label="Apellidos *"
                            required
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Ej: Gomez Pérez"
                        />

                    </div>

                    {/* Fila 2: DNI / Identificación y Fecha de Nacimiento */}
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput
                            label="DNI / Identificación *"
                            required
                            type="text"
                            value={formData.dni}
                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                            placeholder="Ej: 1098765432"
                        />
                        <DateInput
                            label="Fecha de Nacimiento"
                            value={formData.birthDate}
                            onChange={(val) => setFormData({ ...formData, birthDate: val })}
                        />
                    </div>

                    {/* Fila 3: Correo Electrónico y Teléfono */}
                    <div className="grid grid-cols-2 gap-3">
                        <EmailInput
                            label="Correo Electrónico"
                            placeholder="ejemplo@correo.com"
                            value={formData.email || ""}
                            onChange={(val) => setFormData({ ...formData, email: val })}
                        />
                        <PhoneInput
                            label="Teléfono de Contacto"
                            countryCode={formData.countryCode || "+58"}
                            onCountryCodeChange={(code) => setFormData({ ...formData, countryCode: code })}
                            countries={countries}
                            phoneNumber={formData.phone || ""}
                            onPhoneNumberChange={(phone) => setFormData({ ...formData, phone })}
                            phonePlaceholder="Ej: 412 123 4567"
                        />

                    </div>

                    {/* Fila 4: Dirección Residencia */}
                    <TextArea
                        label="Dirección"
                        placeholder="Ej. Calle Principal #123..."
                        required
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    {/* Opciones de Rol */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto font-questrial ">
                        <button
                            type="button"
                            onClick={() => { setFormData({ ...formData, type: "student" }) }}
                            className={`rounded cursor-pointer p-4 border text-left flex flex-row justify-between transition group relative ${formData.type === "student"
                                ? "border-purple-500 bg-purple-950/40 shadow-[0_0_15px_rgba(147,51,234,0.3)] text-white"
                                : "border-purple-100 bg-purple-50/40 hover:border-purple-400"
                                }`}
                        >
                            <UserLucide className={`w-6 h-6 ${formData.type === "student" ? "text-white" : "text-gray-400"}`} />
                            <div>
                                <h4 className="font-bold text-sm">Estudiante</h4>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setFormData({ ...formData, type: "representative" }) }}
                            className={`rounded cursor-pointer p-4 border text-left flex flex-row justify-between transition group relative ${formData.type === "representative"
                                ? "border-pink-500 bg-pink-950/40 shadow-[0_0_15px_rgba(219,39,119,0.3)] text-white"
                                : "border-purple-100 bg-purple-50/40 hover:border-pink-400"
                                }`}
                        > <div>
                                <Users2 className={`w-6 h-6 ${formData.type === "representative" ? "text-white" : "text-gray-400"}`} />
                            </div> <div>
                                <h4 className="font-bold text-sm">Representante</h4>
                            </div>
                        </button>
                    </div>
                    {/* Sección Estudiante (Acordeón Animado) */}
                    <div
                        className={`grid transition-all duration-300 ease-in-out ${formData.type === "student"
                            ? "grid-rows-[1fr] opacity-100 mt-4"
                            : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
                            }`}
                    >
                        {/* ÚNICO CONTENEDOR HIJO OBLIGATORIO PARA LA ANIMACIÓN */}
                        <div className="overflow-hidden">
                            <div className="flex flex-col gap-4 pb-1">

                                {/* Fila: Talla de Uniforme e Experiencia */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <SelectInput
                                        label="Talla de Franela"
                                        value={formData.shirtSize}
                                        onChange={(e) => setFormData({ ...formData, shirtSize: e.target.value as string })}
                                        options={[
                                            { label: "Selecciona una talla", value: "", disabled: true },
                                            { label: "Talla 2", value: "2" },
                                            { label: "Talla 4", value: "4" },
                                            { label: "Talla 6", value: "6" },
                                            { label: "Talla 8", value: "8" },
                                            { label: "Talla 10", value: "10" },
                                            { label: "Talla 12", value: "12" },
                                            { label: "Talla 14", value: "14" },
                                            { label: "Talla 16", value: "16" },
                                            { label: "Talla S", value: "S" },
                                            { label: "Talla M", value: "M" },
                                            { label: "Talla L", value: "L" },
                                        ]}
                                    />


                                    {/* Experiencia Previa */}
                                    <RadioGroup<boolean>
                                        label="¿Tiene experiencia previa en baile?"
                                        name="hasExperience"
                                        value={formData.hasExperience}
                                        onChange={(val) => setFormData({ ...formData, hasExperience: val })}
                                        options={[
                                            { label: "Sí, posee experiencia", value: true },
                                            { label: "No, es principiante", value: false },
                                        ]}
                                    />

                                </div>

                                {/* Fila: Observaciones Médicas */}
                                <TextArea
                                    label="Observaciones Médicas o Alergias"
                                    placeholder="Ej: Alérgico a la penicilina, asma, etc."
                                    rows={3}
                                    value={formData.medicalObservations}
                                    onChange={(e) => setFormData({ ...formData, medicalObservations: e.target.value })}
                                />


                            </div>
                        </div>
                    </div>
                    {/* Botones de Acción */}
                    <div className="pt-2 flex justify-between">
                        <button
                            type="button"
                            onClick={closeModal}
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
                                    ? "Actualizar Cliente →"
                                    : "Registrar Cliente →"}
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
        </>)
}