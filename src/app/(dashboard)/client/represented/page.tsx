// src/app/(dashboard)/client/represented/page.tsx
"use client";

import { useState } from "react";
import HeroSection from "@/components/layout/HeroSection";
import {
    Plus,
    Users,
    UserPlus,
    Heart,
    Calendar,
    Sparkles,
    Trash2,
    Edit2,
    X
} from "lucide-react";

interface Representado {
    id: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    parentesco: "Hijo" | "Hija" | "Sobrino" | "Sobrina" | "Tutorado";
    observations?: string;
}

const INITIAL_REPRESENTADOS: Representado[] = [
    { id: "REP-001", nombre: "Sofía Valentina", apellido: "Mendoza", fechaNacimiento: "2014-08-12", parentesco: "Hija", observacionesMedicas: "Ninguna" },
    { id: "REP-002", nombre: "Lucas Mateo", apellido: "Mendoza", fechaNacimiento: "2021-03-05", parentesco: "Hijo", observacionesMedicas: "Alergia al polvo" },
];

export default function RepresentedPage() {
    const [list, setList] = useState<Represented[]>(INITIAL_REPRESENTADOS);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        dni: "",
        nombre: "",
        apellido: "",
        fechaNacimiento: "",
        parentesco: "Hijo" as const,
        observacionesMedicas: ""
    });

    // Calcular la edad dinámicamente basándonos en el año actual (2026)
    const calcularEdad = (fecha: string) => {
        const nacimiento = new Date(fecha);
        const hoy = new Date("2026-05-27"); // Fecha actual del sistema
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
        return edad;
    };

    const handleOpenModal = () => {
        setFormData({ dni: "", nombre: "", apellido: "", fechaNacimiento: "", parentesco: "Hijo", observacionesMedicas: "" });
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const nuevo: Representado = {
            id: `REP-00${list.length + 1}`,
            ...formData
        };
        setList([...list, nuevo]);
        setIsOpen(false);
    };

    const eliminarRepresentado = (id: string) => {
        setList(list.filter(item => item.id !== id));
    };

    return (
        <>
            <HeroSection
                htmlTitle={`Mis <em class="text-[#5e0472]">Representados</em>`}
                htmlSubTitle="Gestiona el perfil de tus hijos o familiares que entrenan en la academia para sus asignaciones y registros grupales."
                actions={[
                    {
                        label: "Registrar Alumno",
                        onClick: handleOpenModal,
                        icon: <UserPlus className="w-4 h-4" />,
                        variant: "primary",
                    },
                ]}
            />

            <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">

                {/* LISTADO EN CONTENEDOR GRID RESPONSIVO */}
                {list.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {list.map((rep) => (
                            <div
                                key={rep.id}
                                className="glass-card p-5 border border-purple-50 shadow-sm flex flex-col justify-between hover:shadow-md transition group"
                            >
                                <div>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 text-[#5e0472] flex items-center justify-center font-anton">
                                                {rep.nombre[0]}{rep.apellido[0]}
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-mono text-gray-400 block">{rep.id}</span>
                                                <h3 className="font-anton text-gray-800 text-base leading-tight">
                                                    {rep.nombre} {rep.apellido}
                                                </h3>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-questrial font-bold bg-purple-100 text-[#5e0472] px-2.5 py-0.5 rounded-full">
                                            {rep.parentesco}
                                        </span>
                                    </div>

                                    {/* Datos del niño */}
                                    <div className="mt-4 space-y-2 text-xs font-questrial text-gray-600">
                                        <p className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                                            <span>{rep.fechaNacimiento} ({calcularEdad(rep.fechaNacimiento)} años)</span>
                                        </p>
                                        {rep.observacionesMedicas && (
                                            <p className="flex items-start gap-1.5 bg-pink-50/50 p-2 text-pink-700 border border-pink-50">
                                                <Heart className="w-3.5 h-3.5 text-pink-500 shrink-0 mt-0.5" />
                                                <span><strong className="font-bold">Salud:</strong> {rep.observacionesMedicas}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones de Tarjeta */}
                                <div className="mt-5 pt-3 border-t border-purple-50/60 flex justify-end gap-2">
                                    <button className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors cursor-pointer">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => eliminarRepresentado(rep.id)}
                                        className="p-1.5 text-gray-400 hover:text-pink-600 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border border-dashed border-purple-100 rounded-3xl bg-white/40">
                        <Users className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                        <p className="text-xs font-questrial text-gray-400">No tienes representados registrados en tu cuenta familiar.</p>
                        <button
                            onClick={handleOpenModal}
                            className="mt-4 text-xs font-anton text-[#5e0472] bg-purple-50 px-4 py-2 hover:bg-purple-100 transition-colors cursor-pointer"
                        >
                            + Agregar el primero
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL MODERNO DE REGISTRO */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">

                        {/* Cabecera del Modal */}
                        <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" /> Nuevo Alumno / Representado
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-questrial text-xs">
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">DNI</label>
                                    <input type="text" value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Nombre</label>
                                    <input required type="text" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400" />
                                </div>
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Apellido</label>
                                    <input required type="text" value={formData.apellido} onChange={e => setFormData({ ...formData, apellido: e.target.value })} className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">F. de Nacimiento</label>
                                    <input required type="date" value={formData.fechaNacimiento} onChange={e => setFormData({ ...formData, fechaNacimiento: e.target.value })} className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400" />
                                </div>
                                <div>
                                    <label className="block text-gray-500 font-bold mb-1">Parentesco</label>
                                    <select value={formData.parentesco} onChange={e => setFormData({ ...formData, parentesco: e.target.value as any })} className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400">
                                        <option value="Hijo">Hijo</option>
                                        <option value="Hija">Hija</option>
                                        <option value="Sobrino">Sobrino</option>
                                        <option value="Sobrina">Sobrina</option>
                                        <option value="Tutorado">Tutorado</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-500 font-bold mb-1">Observaciones Médicas o Alergias</label>
                                <textarea rows={2} value={formData.observacionesMedicas} onChange={e => setFormData({ ...formData, observacionesMedicas: e.target.value })} placeholder="Ej: Alérgico a la penicilina, asma, etc." className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 resize-none"></textarea>
                            </div>

                            {/* Botonera */}
                            <div className="pt-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 cursor-pointer">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2 font-anton uppercase tracking-wider gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 cursor-pointer">
                                    Guardar Alumno
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}