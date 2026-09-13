// src/app/(dashboard)/client/my-affiliates/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Search,
    Users,
    UserPlus,
    Heart,
    Calendar,
    Sparkles,
    Trash2,
    Edit2,
    Loader2,
    MapPin,
    Phone,
    Shirt
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { RepresentedFormData } from "@/types/student";
import {
    getMyRepresentedAction,
    saveStudentAction,
    deleteStudentAction,
} from "@/app/actions/student";
import { useAuthStore } from "@/store/authStore";
import { useModal } from "@/hooks/useModal";
import { Client } from "@/types/client";
// Estado inicial limpio del formulario para Empleados
const initialFormState: RepresentedFormData = {
    dni: "",
    firstName: "",
    lastName: "",
    birthDate: null,
    kinship: "son",
    medicalObservations: "",
    address: "",
    phone: "",
    shirtSize: "",
    hasExperience: false, // Operador de coalescencia nula para booleanos
};
export default function MyAffiliatesPage() {
    const { isOpen, openModal, closeModal } = useModal();
    const user = useAuthStore((state) => state.user);
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
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
    // ✅ CORRECT: Format the Date to "YYYY-MM-DD"
    const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

    const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // Acción definitiva que se ejecuta al pasar el filtro del Modal
    const handleConfirmAction = async () => {
        if (modalConfig?.id) {
            startTransition(async () => {
                if (modalConfig?.id) {
                    const res = await deleteStudentAction(modalConfig.id);
                    if (res.success) {
                        toast.success("Operación exitosa");
                        setClients(clients.filter((item) => item.id !== modalConfig.id));
                        // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
                        window.dispatchEvent(new Event('refresh-my-affiliates-count'));
                    }
                }
            });
        }
    };
    // useTransition maneja de manera nativa el estado de carga (loading) de los Server Actions
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState(initialFormState);

    // 🔄 Carga reactiva mediante Server Action
    useEffect(() => {
        const load = () => {
            startTransition(async () => {
                const res = await getMyRepresentedAction(searchTerm);
                //console.log({ res })
                if (res.success && res.data) setClients(res.data);
            });
        };

        const debounce = setTimeout(load, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        if (user) {
            startTransition(async () => {
                const res = await saveStudentAction({
                    ...formData
                }, editingId);
                if (!res.success) {
                    setErrorMsg(res.error || "Ocurrió un error.");
                    return;
                }
                toast.success("Operación exitosa");
                // Sincronizar estado local
                if (editingId) {
                    setClients(clients.map((item) => (item.id === editingId ? res.data! : item)));
                } else {
                    setClients([res.data!, ...clients]);
                    // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
                    window.dispatchEvent(new Event('refresh-represented-count'));
                }
                closeModal();
            });
        }
    };

    const handleEditModal = (client: Client) => { // Puedes usar la interfaz de tu Student de Prisma
        setFormData({
            dni: client.dni || "",
            firstName: client.firstName,
            lastName: client.lastName,
            birthDate: client.birthDate ? client.birthDate.split("T")[0] : "",
            kinship: client.student?.kinship || "son",
            medicalObservations: client.student?.medicalObservations || "",

            // 🎯 NUEVOS CAMPOS DEL ESTUDIANTE CARGADOS AL EDITAR
            address: client.address || "",
            phone: client.phone || "",
            shirtSize: client.student?.shirtSize || "",
            hasExperience: client.student?.hasExperience ?? false, // Operador de coalescencia nula para booleanos
        });
        setEditingId(client.id);
        setErrorMsg(null);
        openModal();
    };

    return (
        <>
            <HeroSection
                htmlTitle={`Mis <em class="text-[#5e0472]">Afiliados</em>`}
                htmlSubTitle="Gestiona el perfil familiar en la academia."
                actions={[
                    {
                        label: "Registrar Alumno",
                        onClick: () => {
                            setFormData(initialFormState);
                            setEditingId(null);
                            setErrorMsg(null);
                            openModal();
                        },
                        icon: <UserPlus className="w-4 h-4" />,
                        variant: "primary",
                    },
                ]}
            />

            <div className="p-4 md:p-8 w-full space-y-6">
                {/* FILTROS BAR */}
                <div className="glass-card p-4 flex items-center justify-between">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar alumno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white focus:outline-none"
                        />
                    </div>
                    {isPending && (
                        <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                    )}
                </div>

                {/* LISTADO */}
                {clients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clients.map((item: Client) => (
                            <div
                                key={item.id}
                                className="glass-card p-5 border border-purple-50 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300"
                            >
                                <div>
                                    {/* Cabecera: Nombre, DNI y Parentesco */}
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <span className="font-questrial text-[9px] text-gray-400 block uppercase tracking-wider">
                                                DNI: {item.dni || "No registrado"}
                                            </span>
                                            <h3 className="font-anton text-gray-800 text-base tracking-wide mt-0.5">
                                                {item.firstName} {item.lastName}
                                            </h3>
                                        </div>
                                        {item.student?.kinship && (
                                            <span className="font-questrial text-[10px] bg-purple-100 text-[#5e0472] px-2.5 py-0.5 font-bold capitalize shrink-0">
                                                {item.student.kinship}
                                            </span>
                                        )}
                                    </div>

                                    {/* Bloque de Información del Alumno */}
                                    <div className="mt-4 space-y-2 font-questrial text-xs text-gray-600">
                                        {/* Grupo asignado */}
                                        <div className="flex items-center gap-1.5 bg-purple-50/50 px-2 py-1 border border-purple-100/50 text-[#5e0472] font-semibold rounded">
                                            <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                            <span className="capitalize">
                                                Grupo: {item.group?.name ? item.group.name.replace("_", " ") : "Por definir"}
                                            </span>
                                        </div>

                                        {/* Teléfono de contacto (si existe) */}
                                        {item.phone && (
                                            <p className="flex items-center gap-1.5 px-1">
                                                <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                <span><strong>Teléfono:</strong> {item.phone}</span>
                                            </p>
                                        )}

                                        {/* Talla de Franela */}
                                        {item.student?.shirtSize && (
                                            <p className="flex items-center gap-1.5 px-1">
                                                <Shirt className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                <span><strong>Talla uniforme:</strong> {item.student.shirtSize}</span>
                                            </p>
                                        )}


                                        {/* Experiencia en baile */}

                                        <p className="flex items-center gap-1.5 px-1">
                                            <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                            <span>
                                                <strong>Experiencia:</strong>{" "}
                                                {item.student?.hasExperience ? "Sí, posee experiencia previa" : "No, nivel principiante"}
                                            </span>
                                        </p>



                                        {/* Dirección de habitación */}
                                        <div className="flex items-start gap-1.5 px-1 pt-1 border-t border-gray-100 mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="text-[11px] text-gray-500 leading-normal">
                                                <strong>Dirección:</strong> {item.address}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Alertas médicas / Patologías */}
                                    {item.student?.medicalObservations && (
                                        <p className="mt-3 font-questrial text-xs bg-pink-50/50 p-2 text-pink-700 flex items-start gap-1.5 rounded border border-pink-100/30">
                                            <Heart className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                                            <span className="leading-normal">
                                                <strong>Salud:</strong> {item.student.medicalObservations}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Botones de acción */}
                                <div className="mt-5 pt-3 border-t border-purple-50/60 flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEditModal(item)}
                                        className="p-1.5 text-gray-400 hover:text-purple-600 cursor-pointer transition-colors"
                                        title="Editar datos del alumno"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setModalConfig({
                                                isOpen: true,
                                                type: "word",
                                                title: "Confirmar operación",
                                                description: "¿Quieres eliminar el registro de tu alumno representado?",
                                                id: item.id,
                                            });
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-pink-600 cursor-pointer transition-colors"
                                        title="Eliminar alumno"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                        <Users className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                        <p className="font-questrial text-xs text-gray-400">
                            {isPending ? "Sincronizando..." : "Sin alumnos registrados."}
                        </p>
                    </div>
                )}
            </div>

            {/* MODAL */}
            <MacDockModal
                isOpen={isOpen}
                onClose={closeModal}
                title={editingId ? "Actualizar información de Afiliado" : "Registrar información de Afiliado"}
                size={"lg"}
            >
                {/* Formulario */}

                <form
                    onSubmit={handleSave}
                    className="space-y-4 font-questrial text-xs"
                >
                    {errorMsg && <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">{errorMsg}</p>}

                    {/* Fila 1: DNI y Teléfono */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                DNI <span className="text-gray-400 font-normal">(Opcional)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.dni}
                                onChange={(e) =>
                                    setFormData({ ...formData, dni: e.target.value })
                                }
                                placeholder="DNI"
                                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                Teléfono del Alumno <span className="text-gray-400 font-normal">(Opcional)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                placeholder="Ej: +58 412..."
                                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            />
                        </div>
                    </div>

                    {/* Fila 2: Nombre y Apellido */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                Nombre
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({ ...formData, firstName: e.target.value })
                                }
                                placeholder="Nombre"
                                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                Apellido
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({ ...formData, lastName: e.target.value })
                                }
                                placeholder="Apellido"
                                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            />
                        </div>
                    </div>

                    {/* Fila 3: Fecha de Nacimiento y Parentesco */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                F. de Nacimiento
                            </label>
                            <input
                                required
                                type="date"
                                value={
                                    formData.birthDate
                                        ? formData.birthDate instanceof Date
                                            ? formatDateForInput(formData.birthDate)
                                            : formData.birthDate
                                        : ''
                                }
                                onChange={(e) =>
                                    setFormData({ ...formData, birthDate: e.target.value })
                                }
                                placeholder="F. de Nacimiento"
                                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                Parentesco
                            </label>
                            <select
                                value={formData.kinship}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        kinship: e.target.value as any,
                                    })
                                }
                                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            >
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="son">Hijo</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="daughter">Hija</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="nephew">Sobrino</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="niece">Sobrina</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="tutored">Tutorado</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="other">Otro</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila 4: Talla de Uniforme e Inscripción de Grupo */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">
                                Talla de Franela
                            </label>
                            <select
                                required
                                value={formData.shirtSize}
                                onChange={(e) =>
                                    setFormData({ ...formData, shirtSize: e.target.value })
                                }
                                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            >
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="" disabled>Selecciona una talla</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="2">Talla 2</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="4">Talla 4</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="6">Talla 6</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="8">Talla 8</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="10">Talla 10</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="12">Talla 12</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="14">Talla 14</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="16">Talla 16</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="S">S (Adulto)</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="M">M (Adulto)</option>
                                <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="L">L (Adulto)</option>
                            </select>
                        </div>
                    </div>

                    {/* Fila 5: Experiencia Previa (Radio Buttons Inline) */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-1">
                            ¿Tiene experiencia previa en baile?
                        </label>
                        <div className="flex gap-4 items-center mt-1.5 p-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name="hasExperience"
                                    checked={formData.hasExperience === true}
                                    onChange={() => setFormData({ ...formData, hasExperience: true })}
                                    className="accent-purple-600 w-3.5 h-3.5"
                                />
                                <span>Sí, posee experiencia</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name="hasExperience"
                                    checked={formData.hasExperience === false}
                                    onChange={() => setFormData({ ...formData, hasExperience: false })}
                                    className="accent-purple-600 w-3.5 h-3.5"
                                />
                                <span>No, es principiante</span>
                            </label>
                        </div>
                    </div>

                    {/* Fila 6: Dirección Completa */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-1">
                            Dirección de Habitación
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Calle, Avenida, Edificio / Casa..."
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                            }
                            className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                        />
                    </div>

                    {/* Fila 7: Observaciones Médicas */}
                    <div>
                        <label className="block text-gray-700 font-bold mb-1">
                            Observaciones Médicas o Alergias
                        </label>
                        <textarea
                            rows={2}
                            value={formData.medicalObservations}
                            onChange={(e) =>
                                setFormData({ ...formData, medicalObservations: e.target.value })
                            }
                            placeholder="Ej: Alérgico a la penicilina, asma, ninguna, etc."
                            className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
                        ></textarea>
                    </div>

                    {/* Botonera */}
                    <div className="pt-2 flex justify-between">
                        <button
                            type="button"
                            onClick={() => closeModal()}
                            className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
                        >
                            {editingId ? "Actualizar Afiliado" : "Registrar Afiliado"}

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
