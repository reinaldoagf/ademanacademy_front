// src/components/layout/OnboardingWizard.tsx
"use client";

import React, { useState, useTransition } from "react";
import { User, Users2, Plus, Trash2, Home, ShieldAlert } from "lucide-react";
import { completeOnboardingAction } from "@/app/actions/user";
import { saveClassroomAction } from "@/app/actions/classroom";
import { useAuthStore } from "@/store/authStore";

interface OnboardingWizardProps {
    userEmail: string;
    stepType?: "PROFILE" | "CLASSROOM"; // 🎯 Nuevo parámetro discriminador
    onSuccess?: () => void;            // 🎯 Callback para destrabar el Layout
}

export function OnboardingWizard({ userEmail, stepType = "PROFILE", onSuccess }: OnboardingWizardProps) {
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState(1);
    const [profileType, setProfileType] = useState<"student" | "representative" | null>(null);

    const [representativeOccupation, setRepresentativeOccupation] = useState("");
    const [error, setError] = useState<string | null>(null);

    const [students, setStudents] = useState<any[]>([]);
    const [newStudent, setNewStudent] = useState({
        firstName: "", lastName: "", dni: "", birthDate: "",
        kinship: "son", address: "", phone: "", shirtSize: "M",
        hasExperience: false, medicalObservations: ""
    });

    // 🎯 ESTADOS EXCLUSIVOS PARA EL FORMULARIO DE SALÓN (MODO INFRAESTRUCTURA)
    const [classroomData, setClassroomData] = useState({
        address: "",
        name: "",
        maxCapacity: 20,
        type: "mirrors",
        status: "active",
        description: "",
    });

    // --- ESTADOS PARA COBRO DE INSCRIPCIÓN ---
    const [paymentInfo, setPaymentInfo] = useState({
        reference: "",
        bankName: "",
        amount: 0,
    });
    const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);

    // Constante del costo fijo
    const REGISTRATION_FEE = 10;

    // Cálculo dinámico del total
    const calculatedTotal = profileType === "student"
        ? REGISTRATION_FEE
        : students.length * REGISTRATION_FEE;

    const handleAddStudent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudent.firstName || !newStudent.lastName || !newStudent.birthDate) {
            setError("Por favor completa todos los campos del estudiante.");
            return;
        }
        setStudents([...students, { ...newStudent, id: crypto.randomUUID() }]);
        setNewStudent({
            firstName: "", lastName: "", dni: "", birthDate: "",
            kinship: "son", address: "", phone: "", shirtSize: "M",
            hasExperience: false, medicalObservations: ""
        });
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

    const handleSubmit = (
        finalRole: "student" | "representative",
        finalStudents: any[],
        occupation?: string,
        paymentData?: { bankName: string; reference: string; amount: number },
        receiptFile?: File | null
    ) => {
        console.log({ finalRole, finalStudents, occupation, paymentData, receiptFile })
        if (finalRole === "representative") {
            if (finalStudents.length === 0) {
                setError("Como representante, debes registrar al menos a un estudiante.");
                return;
            }
            if (!occupation || occupation.trim() === "") {
                setError("Por favor, ingresa tu ocupación o profesión.");
                return;
            }

            if (!paymentData?.reference || !paymentData?.bankName || !receiptFile) {
                setError("Por favor, completa los datos de pago y adjunta el comprobante.");
                return;
            }
        }

        startTransition(async () => {
            setError(null);
            // ✨ Construimos un FormData para adjuntar el archivo binario
            const formData = new FormData();
            formData.append("profileType", finalRole);

            if (finalRole === "representative") {
                formData.append("representativeOccupation", occupation?.trim() || "");
                formData.append("representedStudents", JSON.stringify(finalStudents)); // Lo serializamos como string

                if (paymentData) {
                    formData.append("payment", JSON.stringify(paymentData));
                }
                console.log({ receiptFile })
                if (receiptFile) {
                    formData.append("receiptFile", receiptFile); // 📂 Adjunto del archivo original
                }
            } else {
                formData.append("payment", JSON.stringify({ amount: REGISTRATION_FEE }));
            }
            console.log('completeOnboardingAction')
            const res = await completeOnboardingAction(formData);

            if (res.success) {
                setUser({ ...user, ...res.data.user });
                window.location.reload();
            } else {
                setError(typeof res.error === "string" ? res.error : "Error crítico al procesar la solicitud.");
            }
        });
    };

    // 🎯 NUEVO CONTROLADOR: Envío del primer salón a la API del backend
    const handleClassroomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!classroomData.address || !classroomData.name || !classroomData.maxCapacity) {
            setError("Por favor ingresa el nombre y la capacidad máxima.");
            return;
        }

        startTransition(async () => {
            setError(null);
            const res = await saveClassroomAction(classroomData, null);
            if (!res.success) {
                setError(res.error || "Ocurrió un error.");
                return;
            }


            // Éxito: disparamos el callback para destrabar la UI del dashboard
            if (onSuccess) onSuccess();

        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-purple-900 via-[#400252] to-black text-white relative overflow-hidden">

            {/* Círculos decorativos de fondo tipo Blur */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>

            <div className="w-full max-w-2xl border border-white/10 bg-[#400252] p-8 md:p-12 shadow-2xl relative z-10">

                {/* 🎯 CONDICIONAL: FLUJO DE INFRAESTRUCTURA (CLASSROOM) */}
                {stepType === "CLASSROOM" ? (
                    <div className="space-y-6 text-left animate-fadeIn font-questrial text-xs">
                        <div className="text-center space-y-2 mb-4">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 px-3 py-1 bg-white/5 inline-flex items-center gap-1.5">
                                <ShieldAlert className="w-3 h-3" /> Configuración de Entorno Requerido
                            </span>
                            <h2 className="text-3xl md:text-4xl font-anton tracking-wide text-white uppercase">
                                Inicializar <span className="text-purple-400">Infraestructura</span>
                            </h2>
                            <p className="text-gray-300 text-xs max-w-md mx-auto">
                                Detectamos que la academia no posee ningún espacio físico mapeado. Registra tu primer salón de clases para poder habilitar las mallas horarias del sistema.
                            </p>
                        </div>

                        <form onSubmit={handleClassroomSubmit} className="bg-white/5 p-6 border border-white/10 space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nombre del Salón / Aula *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Salón de Espejos Principal (Planta Baja)"
                                    value={classroomData.name}
                                    onChange={(e) => setClassroomData({ ...classroomData, name: e.target.value })}
                                    className="p-2.5 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dirección *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Venezuela, Ciudad Guayana, Altos del Caroní"
                                    value={classroomData.address}
                                    onChange={(e) => setClassroomData({ ...classroomData, address: e.target.value })}
                                    className="p-2.5 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white w-full"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Especialidad de Área</label>
                                    <select
                                        value={classroomData.type}
                                        onChange={(e) => setClassroomData({ ...classroomData, type: e.target.value })}
                                        className="p-2.5 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white w-full"
                                    >
                                        <option value="mirrors">Área Espejos</option>
                                        <option value="urban">Área Urbano</option>
                                        <option value="free">Estudio Libre</option>
                                        <option value="teorias">Aula de Teorías</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aforo de Seguridad (Alumnos) *</label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={classroomData.maxCapacity}
                                        onChange={(e) => setClassroomData({ ...classroomData, maxCapacity: Number(e.target.value) })}
                                        className="p-2.5 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Detalles de Equipamiento (Opcional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe las características como tipo de piso, barras, aire acondicionado o sistemas de audio instalados..."
                                    value={classroomData.description}
                                    onChange={(e) => setClassroomData({ ...classroomData, description: e.target.value })}
                                    className="p-2.5 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white w-full resize-none"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-center text-red-400 font-semibold bg-red-500/10 py-2 border border-red-500/20">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="cursor-pointer w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 font-bold transition text-xs text-center uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-1.5"
                            >
                                <Home className="w-4 h-4" />
                                {isPending ? "Configurando Espacio..." : "Dar de Alta Locación e Ingresar ✓"}
                            </button>
                        </form>
                    </div>
                ) : (
                    /* 🎯 FLUJO ORIGINAL INTACTO (PROFILE) */
                    <div className="text-center">
                        {/* Paso 1: Bienvenida y Selección de Rol */}
                        {step === 1 && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="space-y-3">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400 font-questrial px-3 py-1 bg-white/5">
                                        Configuración Inicial obligatoria
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-anton tracking-wide text-white">
                                        ¡Te damos la bienvenida a la <span className="text-purple-400">Academia</span>!
                                    </h2>
                                    <p className="text-gray-300 font-questrial text-sm max-w-md mx-auto">
                                        Para brindarte una experience personalizada bajo tu cuenta <span className="text-purple-200 font-semibold">{userEmail}</span>, indícanos cuál será tu rol principal:
                                    </p>
                                </div>

                                {/* Opciones de Rol */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto font-questrial">
                                    <button
                                        type="button"
                                        onClick={() => { setProfileType("student"); setError(null); }}
                                        className={`cursor-pointer p-6 border text-left flex flex-col justify-between transition group relative ${profileType === "student"
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
                                        className={`cursor-pointer p-6 border text-left flex flex-col justify-between transition group relative ${profileType === "representative"
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
                                    className="cursor-pointer w-full max-w-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white font-questrial font-bold py-3 text-xs tracking-wider uppercase hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2 mx-auto"
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
                                                <p className="text-[10px] text-gray-400 font-mono">
                                                    DNI: {student.dni || "N/A"} | {student.kinship}
                                                </p>
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
                                            type="text" required placeholder="Ej: Sofía"
                                            value={newStudent.firstName}
                                            onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                                            className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-400">Apellido</label>
                                        <input
                                            type="text" required placeholder="Ej: Pérez"
                                            value={newStudent.lastName}
                                            onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                                            className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-400">DNI o Pasaporte (Opcional)</label>
                                        <input
                                            type="text" placeholder="Documento único (Si aplica)"
                                            value={newStudent.dni}
                                            onChange={(e) => setNewStudent({ ...newStudent, dni: e.target.value })}
                                            className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-400">Fecha de Nacimiento</label>
                                        <input
                                            type="date" required
                                            value={newStudent.birthDate}
                                            onChange={(e) => setNewStudent({ ...newStudent, birthDate: e.target.value })}
                                            className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-gray-300"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-400">Teléfono (Opcional)</label>
                                        <input
                                            type="type" placeholder="Ej: 0414-1234567"
                                            value={newStudent.phone || ""}
                                            onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                            className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-gray-400">Talla de Franela</label>
                                        <select
                                            value={newStudent.shirtSize || "M"}
                                            onChange={(e) => setNewStudent({ ...newStudent, shirtSize: e.target.value })}
                                            className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                        >
                                            <option value="2">Talla 2</option>
                                            <option value="4">Talla 4</option>
                                            <option value="6">Talla 6</option>
                                            <option value="8">Talla 8</option>
                                            <option value="10">Talla 10</option>
                                            <option value="12">Talla 12</option>
                                            <option value="S">S (Adulto)</option>
                                            <option value="M">M (Adulto)</option>
                                            <option value="L">L (Adulto)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 sm:col-span-2">
                                        <label className="text-[10px] text-gray-400">Parentesco / Vínculo</label>
                                        <select
                                            value={newStudent.kinship}
                                            onChange={(e) => setNewStudent({ ...newStudent, kinship: e.target.value })}
                                            className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                        >
                                            <option value="son">Hijo</option>
                                            <option value="daughter">Hija</option>
                                            <option value="nephew">Sobrino</option>
                                            <option value="niece">Sobrina</option>
                                            <option value="tutored">Tutorado</option>
                                            <option value="other">Otro</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 sm:col-span-2">
                                        <label className="text-[10px] text-gray-400">Dirección Completa de Habitación</label>
                                        <input
                                            type="text" required placeholder="Avenida, Urbanización, Nro de Casa/Apto"
                                            value={newStudent.address || ""}
                                            onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                                            className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1 sm:col-span-2">
                                        <label className="text-[10px] text-gray-400">Patología o Condición Especial</label>
                                        <input
                                            type="text" placeholder="Ej: Asma leve, alergia al polvo (o indicar 'Ninguna')"
                                            value={newStudent.medicalObservations || ""}
                                            onChange={(e) => setNewStudent({ ...newStudent, medicalObservations: e.target.value })}
                                            className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 sm:col-span-2 bg-black/20 p-2.5 border border-white/5 mt-1">
                                        <span className="text-[10px] text-gray-400 block">¿Ha tenido experiencia previa en el baile?</span>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 text-white cursor-pointer">
                                                <input
                                                    type="radio" name="danceExperience" value="true"
                                                    checked={newStudent.hasExperience === true}
                                                    onChange={() => setNewStudent({ ...newStudent, hasExperience: true })}
                                                    className="accent-pink-500 w-4 h-4"
                                                />
                                                Sí, posee experiencia
                                            </label>
                                            <label className="flex items-center gap-2 text-white cursor-pointer">
                                                <input
                                                    type="radio" name="danceExperience" value="false"
                                                    checked={newStudent.hasExperience === false}
                                                    onChange={() => setNewStudent({ ...newStudent, hasExperience: false })}
                                                    className="accent-pink-500 w-4 h-4"
                                                />
                                                No, nivel principiante
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="sm:col-span-2 bg-purple-600/30 border border-purple-500/40 text-purple-200 py-2 mt-2 font-semibold hover:bg-purple-600 hover:text-white transition cursor-pointer flex items-center justify-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Añadir Alumno a la Lista
                                    </button>
                                </form>

                                <div className="bg-black/30 border border-pink-500/20 p-4 space-y-3">
                                    <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wide">Datos del Representante Legal</h4>
                                    <div className="flex flex-col gap-1.5 font-questrial text-xs">
                                        <label className="text-[10px] text-gray-400">Ocupación / Profesión *</label>
                                        <input
                                            type="text" required placeholder="Ej: Ingeniero de Sistemas, Comerciante, Docente..."
                                            value={representativeOccupation || ""}
                                            onChange={(e) => setRepresentativeOccupation(e.target.value)}
                                            className="p-2.5 bg-black/40 border border-white/10 focus:border-pink-400 outline-none text-white w-full"
                                        />
                                    </div>
                                </div>

                                {/* ========================================================================= */}
                                {/* ✨ NUEVA SECCIÓN: CONTROL Y COBRO DE INSCRIPCIONES */}
                                {/* ========================================================================= */}
                                <div className="bg-gradient-to-b from-purple-950/20 to-black/50 border border-purple-500/30 p-4 space-y-4 font-questrial rounded-sm">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <div>
                                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wide">Pago de Inscripción</h4>
                                            <p className="text-[10px] text-gray-400">Costo: 10$ por alumno registrado.</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 block">Total a Reportar:</span>
                                            <span className="text-xl font-anton text-white tracking-wider">{calculatedTotal}$</span>
                                        </div>
                                    </div>

                                    {calculatedTotal > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-gray-400">Banco de Origen *</label>
                                                <input
                                                    type="text" required placeholder="Ej: Banesco, Mercantil, Zelle..."
                                                    value={paymentInfo.bankName}
                                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, bankName: e.target.value })}
                                                    className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[10px] text-gray-400">Número de Referencia *</label>
                                                <input
                                                    type="text" required placeholder="Últimos 4 o 6 dígitos"
                                                    value={paymentInfo.reference}
                                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, reference: e.target.value })}
                                                    className="p-2 bg-black/40 border border-white/10 focus:border-purple-400 outline-none text-white"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 sm:col-span-2">
                                                <label className="text-[10px] text-gray-400">Adjuntar Comprobante (Capture / PDF) *</label>
                                                <div className="relative border border-dashed border-white/20 hover:border-purple-400 transition bg-black/20 p-3 text-center cursor-pointer">
                                                    <input
                                                        type="file" required accept="image/*,application/pdf"
                                                        onChange={(e) => setPaymentReceipt(e.target.files ? e.target.files[0] : null)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    <p className="text-gray-400 text-[11px]">
                                                        {paymentReceipt ? `✅ ${paymentReceipt.name}` : "Haga click para arrastrar o subir archivo"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] text-yellow-400/80 italic text-center">Agrega al menos un alumno para habilitar la pasarela de pago.</p>
                                    )}
                                </div>

                                {error && <p className="text-xs text-center text-red-400 font-questrial font-semibold bg-red-500/10 py-2 border border-red-500/20">{error}</p>}

                                <div className="flex flex-col sm:flex-row gap-3 pt-2 font-questrial">
                                    <button
                                        type="button"
                                        onClick={() => { setStep(1); setError(null); }}
                                        className="cursor-pointer w-full py-3 border border-white/10 bg-white/5 hover:bg-white/10 transition text-xs font-semibold text-center uppercase tracking-wider"
                                    >
                                        ← Volver atrás
                                    </button>
                                    <button
                                        type="button"
                                        disabled={students.length === 0 || !representativeOccupation || !paymentInfo.reference || !paymentInfo.bankName || !paymentReceipt || isPending}
                                        onClick={() => {
                                            handleSubmit(
                                                "representative",
                                                students,
                                                representativeOccupation,
                                                { ...paymentInfo, amount: calculatedTotal },
                                                paymentReceipt
                                            );
                                        }}
                                        className="cursor-pointer w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 font-bold transition text-xs text-center uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                    >
                                        {isPending ? "Guardando datos..." : "Finalizar y Entrar al Sistema ✓"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}