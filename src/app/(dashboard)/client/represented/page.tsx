// src/app/(dashboard)/client/represented/page.tsx
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
    X,
    Loader2,
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { Student } from "@/types/student";
import {
    getMyRepresentedAction,
    saveStudentAction,
    deleteStudentAction,
} from "@/app/actions/student";
import { useAuthStore } from "@/store/authStore";

export default function RepresentedPage() {
    const user = useAuthStore((state) => state.user);
    const [list, setList] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
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
    const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
    // Acción definitiva que se ejecuta al pasar el filtro del Modal
    const handleConfirmAction = async () => {
        if (modalConfig?.id) {
            startTransition(async () => {
                if (modalConfig?.id) {
                    const res = await deleteStudentAction(modalConfig.id);
                    if (res.success) {
                        setList(list.filter((item) => item.id !== modalConfig.id));
                        // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
                        window.dispatchEvent(new Event('refresh-represented-count'));
                    }
                }
            });
        }
    };
    // useTransition maneja de manera nativa el estado de carga (loading) de los Server Actions
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        dni: "",
        firstName: "",
        lastName: "",
        birthDate: "",
        kinship: "Hijo" as Student["kinship"],
        medicalObservations: "",
    });

    // 🔄 Carga reactiva mediante Server Action
    useEffect(() => {
        const load = () => {
            startTransition(async () => {
                const res = await getMyRepresentedAction(searchTerm);
                if (res.success && res.data) setList(res.data);
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
                const res = await saveStudentAction({ ...formData, userId: user.id }, editingId);
                if (!res.success) {
                    setErrorMsg(res.error || "Ocurrió un error.");
                    return;
                }

                // Sincronizar estado local
                if (editingId) {
                    setList(list.map((item) => (item.id === editingId ? res.data! : item)));
                } else {
                    setList([res.data!, ...list]);
                    // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
                    window.dispatchEvent(new Event('refresh-represented-count'));
                }
                setIsOpen(false);
            });
        }
    };

    const handleEditModal = (student: Student) => {
        setFormData({
            dni: student.dni,
            firstName: student.firstName,
            lastName: student.lastName,
            birthDate: student.birthDate ? student.birthDate.split("T")[0] : "",
            kinship: student.kinship || "Hijo",
            medicalObservations: student.medicalObservations || "",
        });
        setEditingId(student.id);
        setErrorMsg(null);
        setIsOpen(true);
    };

    return (
        <>
            <HeroSection
                htmlTitle={`Mis <em class="text-[#5e0472]">Representados</em>`}
                htmlSubTitle="Gestiona el perfil familiar en la academia."
                actions={[
                    {
                        label: "Registrar Alumno",
                        onClick: () => {
                            setFormData({
                                dni: "",
                                firstName: "",
                                lastName: "",
                                birthDate: "",
                                kinship: "Hijo",
                                medicalObservations: "",
                            });
                            setEditingId(null);
                            setErrorMsg(null);
                            setIsOpen(true);
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
                {list.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {list.map((rep) => (
                            <div
                                key={rep.id}
                                className="glass-card p-5 border border-purple-50 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-questrial text-[9px] text-gray-400 block">
                                                DNI: {rep.dni}
                                            </span>
                                            <h3 className="font-anton text-gray-800 text-base">
                                                {rep.firstName} {rep.lastName}
                                            </h3>
                                        </div>
                                        <span className="font-questrial text-[10px] bg-purple-100 text-[#5e0472] px-2.5 py-0.5 font-bold">
                                            {rep.kinship}
                                        </span>
                                    </div>
                                    <p className="mt-3 font-questrial text-xs text-gray-600 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                        <span>{rep.birthDate?.split("T")[0]}</span>
                                    </p>
                                    {rep.medicalObservations && (
                                        <p className="mt-2 font-questrial text-xs bg-pink-50/50 p-2 text-pink-700 flex items-center gap-1.5">
                                            <Heart className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                                            <span>
                                                <strong>Salud:</strong> {rep.medicalObservations}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <div className="mt-5 pt-3 border-t border-purple-50/60 flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEditModal(rep)}
                                        className="p-1.5 text-gray-400 hover:text-purple-600 cursor-pointer"
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
                                                id: rep.id,
                                            })
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-pink-600 cursor-pointer"
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
            {/* MODAL MODERNO DE REGISTRO */}

            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">
                        {/* Cabecera del Modal */}

                        <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" /> Nuevo Alumno /
                                Representado
                            </h3>

                            <button
                                onClick={() => setIsOpen(false)}
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
                            {errorMsg && <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">{errorMsg}</p>}

                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">
                                        DNI
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.dni}
                                        onChange={(e) =>
                                            setFormData({ ...formData, dni: e.target.value })
                                        }
                                        className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">
                                        Nombre
                                    </label>

                                    <input
                                        required
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, firstName: e.target.value })
                                        }
                                        className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">
                                        Apellido
                                    </label>

                                    <input
                                        required
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, lastName: e.target.value })
                                        }
                                        className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">
                                        F. de Nacimiento
                                    </label>

                                    <input
                                        required
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, birthDate: e.target.value })
                                        }
                                        className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">
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
                                        className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                                    >
                                        <option value="Hijo">Hijo</option>

                                        <option value="Hija">Hija</option>

                                        <option value="Sobrino">Sobrino</option>

                                        <option value="Sobrina">Sobrina</option>

                                        <option value="Tutorado">Tutorado</option>

                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-500 font-bold mb-1">
                                    Observaciones Médicas o Alergias
                                </label>

                                <textarea
                                    rows={2}
                                    value={formData.medicalObservations}
                                    onChange={(e) =>
                                        setFormData({ ...formData, medicalObservations: e.target.value })
                                    }
                                    placeholder="Ej: Alérgico a la penicilina, asma, etc."
                                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 resize-none"
                                ></textarea>
                            </div>

                            {/* Botonera */}

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 cursor-pointer"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="

                                        font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer

                                        gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90

                                    "
                                >
                                    Guardar Alumno
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
