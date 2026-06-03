"use client";

import React, { useState, useTransition } from "react";
import { User, Users2, Plus, Trash2, CheckCircle2, ArrowRight } from "lucide-react";
import { completeOnboardingAction } from "@/app/actions/user";
import { useAuthStore } from "@/store/authStore";

interface OnboardingWizardProps {
    userEmail: string;
}

export function OnboardingWizard({ userEmail }: OnboardingWizardProps) {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser); // 💡 Obtenemos la acción
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState(1); // 1: Bienvenida/Rol, 2: Datos Representados (si aplica)
    const [profileType, setProfileType] = useState<"student" | "representative" | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Formulario para añadir un estudiante representado
    const [students, setStudents] = useState<any[]>([]);
    const [newStudent, setNewStudent] = useState({
        firstName: "",
        lastName: "",
        dni: "",
        birthDate: "",
        kinship: "Hijo",
    });

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudent.firstName || !newStudent.lastName || !newStudent.dni || !newStudent.birthDate) {
            setError("Por favor completa todos los campos del estudiante.");
            return;
        }
        setStudents([...students, { ...newStudent, id: crypto.randomUUID() }]);
        setNewStudent({ firstName: "", lastName: "", dni: "", birthDate: "", kinship: "Hijo" });
        setError(null);
    };

    const handleRemoveStudent = (id: string) => {
        setStudents(students.filter((s) => s.id !== id));
    };

    const handleNextStep = () => {
        if (!profileType) {
            setError("Debes seleccionar una opción para continuar.");
            return;
        }
        setError(null);
        if (profileType === "student") {
            handleSubmit("student", []);
        } else {
            setStep(2);
        }
    };

    const handleSubmit = (finalRole: "student" | "representative", finalStudents: any[]) => {
        if (finalRole === "representative" && finalStudents.length === 0) {
            setError("Como representante, debes registrar al menos a un estudiante.");
            return;
        }

        startTransition(async () => {
            setError(null);
            const res = await completeOnboardingAction({
                profileType: finalRole,
                representedStudents: finalRole === "representative" ? finalStudents : undefined,
            });


            if (res.success) {
                setUser({ ...user, ...res.data.user })
                // Recargamos la ventana para reactivar el layout con el nuevo estado del perfil
                window.location.reload();
            } else {
                setError(typeof res.error === "string" ? res.error : "Error crítico al procesar la solicitud.");
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-purple-900 via-[#400252] to-black text-white relative overflow-hidden">

            {/* Círculos decorativos de fondo tipo Blur */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>

            <div className="w-full max-w-2xl glass-card border border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl relative text-center z-10">

                {/* Paso 1: Bienvenida y Selección de Rol */}
                {step === 1 && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="space-y-3">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400 font-questrial px-3 py-1 bg-white/5 rounded-full">
                                Configuración Inicial obligatoria
                            </span>
                            <h2 className="text-3xl md:text-4xl font-anton tracking-wide text-white">
                                ¡Te damos la bienvenida a la <span className="text-purple-400">Academia</span>!
                            </h2>
                            <p className="text-gray-300 font-questrial text-sm max-w-md mx-auto">
                                Para brindarte una experiencia personalizada bajo tu cuenta <span className="text-purple-200 font-semibold">{userEmail}</span>, indícanos cuál será tu rol principal:
                            </p>
                        </div>

                        {/* Opciones de Rol */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto font-questrial">
                            <button
                                type="button"
                                onClick={() => { setProfileType("student"); setError(null); }}
                                className={`p-6 border text-left flex flex-col justify-between transition group relative ${profileType === "student"
                                    ? "border-purple-500 bg-purple-950/40 shadow-[0_0_15px_rgba(147,51,234,0.3)] text-white"
                                    : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-400 hover:text-white"
                                    }`}
                            >
                                <User className={`w-8 h-8 mb-4 ${profileType === "student" ? "text-purple-400" : "text-gray-400"}`} />
                                <div>
                                    <h4 className="font-bold text-sm text-white">Soy Estudiante solo</h4>
                                    <p className="text-[11px] text-gray-400 mt-1 leading-normal">Asistiré a clases de baile yo mismo y controlaré mi propio progreso técnico.</p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => { setProfileType("representative"); setError(null); }}
                                className={`p-6 border text-left flex flex-col justify-between transition group relative ${profileType === "representative"
                                    ? "border-pink-500 bg-pink-950/40 shadow-[0_0_15px_rgba(219,39,119,0.3)] text-white"
                                    : "border-white/10 bg-white/5 text-gray-400 hover:border-pink-400 hover:text-white"
                                    }`}
                            >
                                <Users2 className={`w-8 h-8 mb-4 ${profileType === "representative" ? "text-pink-400" : "text-gray-400"}`} />
                                <div>
                                    <h4 className="font-bold text-sm text-white">Soy Representante</h4>
                                    <p className="text-[11px] text-gray-400 mt-1 leading-normal">Vengo a inscribir y gestionar las mensualidades, vestuarios y eventos de mis representados.</p>
                                </div>
                            </button>
                        </div>

                        {error && <p className="text-xs text-red-400 font-questrial font-semibold bg-red-500/10 py-2 border border-red-500/20">{error}</p>}

                        <button
                            onClick={handleNextStep}
                            disabled={isPending}
                            className="w-full max-w-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white font-questrial font-bold py-3 text-xs tracking-wider uppercase hover:opacity-90 transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 mx-auto"
                        >
                            {profileType === "student" ? "Completar registro ✓" : "Continuar paso siguiente →"}
                        </button>
                    </div>
                )}

                {/* Paso 2: Representante obligatoriamente registra un Alumno */}
                {step === 2 && profileType === "representative" && (
                    <div className="space-y-6 text-left animate-fadeIn">
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-anton tracking-wide text-white">Registro de Representados</h3>
                            <p className="text-gray-300 font-questrial text-xs">Por normativas de la academia, debes vincular al menos un alumno a tu tutela.</p>
                        </div>

                        {/* Listado de agregados */}
                        <div className="space-y-2 font-questrial max-h-40 overflow-y-auto">
                            {students.map((student) => (
                                <div key={student.id} className="flex items-center justify-between bg-white/5 border border-white/10 p-3 text-xs">
                                    <div>
                                        <p className="font-bold text-purple-300">{student.firstName} {student.lastName}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">DNI: {student.dni} | {student.kinship}</p>
                                    </div>
                                    <button onClick={() => handleRemoveStudent(student.id)} className="text-gray-400 hover:text-red-400 p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Formulario de Adición inline */}
                        <form onSubmit={handleAddStudent} className="bg-white/5 p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 font-questrial text-xs">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-400">Nombre del Alumno</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Sofía"
                                    value={newStudent.firstName}
                                    onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                                    className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-400">Apellido</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Pérez"
                                    value={newStudent.lastName}
                                    onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                                    className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-400">DNI o Pasaporte</label>
                                <input
                                    type="text"
                                    placeholder="Documento único"
                                    value={newStudent.dni}
                                    onChange={(e) => setNewStudent({ ...newStudent, dni: e.target.value })}
                                    className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-400">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    value={newStudent.birthDate}
                                    onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                                    className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-gray-300"
                                />
                            </div>
                            <div className="flex flex-col gap-1 sm:col-span-2">
                                <label className="text-[10px] text-gray-400">Parentesco / Vínculo</label>
                                <select
                                    value={newStudent.kinship}
                                    onChange={(e) => setNewStudent({ ...newStudent, kinship: e.target.value })}
                                    className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                >
                                    <option value="Hijo">Hijo</option>
                                    <option value="Hija">Hija</option>
                                    <option value="Sobrino">Sobrino</option>
                                    <option value="Sobrina">Sobrina</option>
                                    <option value="Tutorado">Tutorado</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="sm:col-span-2 bg-purple-600/30 border border-purple-500/40 text-purple-200 py-2 mt-2 font-semibold hover:bg-purple-600 hover:text-white transition cursor-pointer flex items-center justify-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Añadir Alumno a la Lista
                            </button>
                        </form>

                        {error && <p className="text-xs text-center text-red-400 font-questrial font-semibold bg-red-500/10 py-2 border border-red-500/20">{error}</p>}

                        {/* Controles del bloque */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 font-questrial">
                            <button
                                type="button"
                                onClick={() => { setStep(1); setError(null); }}
                                className="w-full py-3 border border-white/10 bg-white/5 hover:bg-white/10 transition text-xs font-semibold text-center uppercase tracking-wider"
                            >
                                ← Volver atrás
                            </button>
                            <button
                                type="button"
                                disabled={students.length === 0 || isPending}
                                onClick={() => handleSubmit("representative", students)}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 font-bold transition text-xs text-center uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                                {isPending ? "Guardando datos..." : "Finalizar y Entrar al Sistema ✓"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}