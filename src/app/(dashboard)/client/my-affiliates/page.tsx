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
    Pencil,
    Loader2,
    MapPin,
    Phone,
    Shirt
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { ActionButton } from "@/components/ui/ActionButton";
import { TextInput, TextArea, SelectInput, RadioGroup, PhoneInput, DNIInput, DateInput, EmailInput } from '@/components/ui/forms';
import { RepresentedFormData } from "@/types/student";
import {
    getMyRepresentedAction,
    saveStudentAction,
    deleteStudentAction,
} from "@/app/actions/student";
import { useAuthStore } from "@/store/authStore";
import { useModal } from "@/hooks/useModal";
import { Client } from "@/types/client";
import { formatDateForInput } from "@/helpers/dates";
// Estado inicial limpio del formulario para Empleados
const initialFormState: RepresentedFormData = {
    IDNumberPrefix: "V",
    dni: "",
    firstName: "",
    email: "",
    lastName: "",
    birthDate: null,
    kinship: "son",
    medicalObservations: "",
    address: "",
    countryCode: "+58",
    phone: "",
    shirtSize: "",
    hasExperience: false, // Operador de coalescencia nula para booleanos
};

const DNIPrefixs = [
    { code: "V", label: "V" },
    { code: "E", label: "E" },
    { code: "P", label: "P" },
    { code: "C", label: "C" },
    { code: "J", label: "J" },
    { code: "G", label: "G" },
];

const countries = [
    { code: "+58", label: "VE" },
    { code: "+57", label: "CO" },
    { code: "+51", label: "PE" },
    { code: "+56", label: "CL" },
    { code: "+54", label: "AR" },
    { code: "+34", label: "ES" },
    { code: "+1", label: "US" },
];
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
                }
                closeModal();
            });
        }
    };

    const handleEditModal = (client: Client) => { // Puedes usar la interfaz de tu Student de Prisma
        setFormData({
            IDNumberPrefix: client.IDNumberPrefix || "V",
            dni: client.dni || "",
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            birthDate: formatDateForInput(client.birthDate),
            kinship: client.student?.kinship || "son",
            medicalObservations: client.student?.medicalObservations || "",

            // 🎯 NUEVOS CAMPOS DEL ESTUDIANTE CARGADOS AL EDITAR
            address: client.address || "",
            countryCode: client.countryCode || "+58",
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
                                className="glass-card bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
                            >
                                {/* Cabecera de la tarjeta */}
                                <div className="p-5 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-questrial text-[9px] text-gray-400 block uppercase tracking-wider">
                                                DNI: {item.dni || "No registrado"}
                                            </span>
                                            <h3 className="font-anton text-gray-800 text-base tracking-wide mt-0.5">
                                                {item.firstName} {item.lastName}
                                            </h3>
                                        </div>
                                        <div className="flex items-center">
                                            {item.student?.kinship && (
                                                <span className="font-questrial text-[10px] bg-purple-100 text-[#5e0472] px-2.5 py-0.5 font-bold capitalize shrink-0">
                                                    {item.student.kinship}
                                                </span>
                                            )}</div>
                                    </div>

                                    {/* Sub-métricas vectoriales del plano */}
                                    <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-dashed border-gray-100">
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Grupo
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {item.group?.name ? item.group.name.replace("_", " ") : "Por definir"}
                                            </p>
                                        </div><div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Teléfono
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {item.countryCode && item.phone ? item.countryCode + item.phone : 'Sin télefono de contacto'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Talla uniforme
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {item.student?.shirtSize || 'Sin talla de uniforme'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Experiencia
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 justify-center">


                                                <p className="text-xs font-questrial font-bold text-gray-700">
                                                    {item.student?.hasExperience ? "Sí, posee experiencia previa" : "No, nivel principiante"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Dirección
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {item.address || 'Sin dirección registrada'}
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 p-2">
                                            <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                                                Salud
                                            </p>
                                            <p className="text-xs font-questrial font-bold text-gray-700">
                                                {item.student?.medicalObservations || 'Sin observaciones medicas registrada'}
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
                                                description: "¿Quieres eliminar el registro de tu alumno representado?",
                                                id: item.id,
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
                                            onClick={() => handleEditModal(item)}
                                        >
                                            Editar
                                        </ActionButton>
                                    </div>

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
                size={"2xl"}
            >
                {/* Formulario */}

                <form
                    onSubmit={handleSave}
                    className="space-y-4 font-questrial text-xs"
                >
                    {errorMsg && <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">{errorMsg}</p>}

                    {/* Fila 1: DNI y Teléfono */}
                    <div className="grid grid-cols-3 gap-3">
                        <DNIInput
                            label="DNI / Identificación *"
                            required
                            prefix={formData.IDNumberPrefix || "V"}
                            onPrefixChange={(code) => setFormData({ ...formData, IDNumberPrefix: code })}
                            prefixes={DNIPrefixs}
                            dni={formData.dni}
                            onDniChange={(dni) => setFormData({ ...formData, dni })}
                            placeholder="Ej: 1098765432"
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
                        <DateInput
                            label="Fecha de Nacimiento"
                            value={formatDateForInput(formData.birthDate)}
                            onChange={(val) => setFormData({ ...formData, birthDate: val })}
                        />
                    </div>

                    {/* Fila 2: Nombre y Apellido */}
                    <div className="grid grid-cols-3 gap-3">
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
                            placeholder="Ej: González"
                        />
                        <EmailInput
                            label="Correo Electrónico"
                            placeholder="ejemplo@correo.com"
                            value={formData.email || ""}
                            onChange={(val) => setFormData({ ...formData, email: val })}
                        />


                    </div>


                    {/* Fila 4: Talla de Uniforme e Inscripción de Grupo */}
                    <div className="grid grid-cols-3 gap-3">
                        <SelectInput
                            label="Parentesco"
                            value={formData.kinship}
                            onChange={(e) => setFormData({ ...formData, kinship: e.target.value as any, })}
                            options={[
                                { label: "Selecciona un parentesco", value: "", disabled: true },
                                { label: "Hijo", value: "son" },
                                { label: "Hija", value: "daughter" },
                                { label: "Sobrino", value: "nephew" },
                                { label: "Sobrina", value: "niece" },
                                { label: "Tutorado", value: "tutored" },
                                { label: "Otro", value: "other" },
                            ]}
                        />
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


                        {/* Fila 5: Experiencia Previa (Radio Buttons Inline) */}
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
                    {/* Fila 6: Dirección Completa */}
                    <TextArea
                        label="Dirección"
                        placeholder="Ej. Calle Principal #123..."
                        required
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />

                    {/* Fila 7: Observaciones Médicas */}
                    <TextArea
                        label="Observaciones Médicas o Alergias"
                        placeholder="Ej: Alérgico a la penicilina, asma, etc."
                        rows={3}
                        value={formData.medicalObservations}
                        onChange={(e) => setFormData({ ...formData, medicalObservations: e.target.value })}
                    />

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
