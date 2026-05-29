"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation"; // 💡 Importación agregada
import Image from "next/image";
import Link from "next/link";
import {
    Mail,
    Lock,
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
    Globe,
    Star,
    IdCard,
    Camera,
    Eye,
    EyeOff,
} from "lucide-react";
import { handleRegister } from "@/app/actions/auth";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
    const setUser = useAuthStore((state) => state.setUser); // 💡 Obtenemos la acción
    const router = useRouter(); // 💡 Inicializamos el router del cliente
    // Manejo de Pasos: 1 o 2
    const [step, setStep] = useState<1 | 2>(1);

    // Estados del Formulario
    const [dni, setDni] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Estados de Validaciones y Visibilidad
    const [error, setError] = useState<string | null>(null);
    const [errorEmail, setErrorEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // 💡 NUEVO: Estado de carga para el Spinner
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Manejador para cargar la imagen del avatar
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Validar formato de correo electrónico
    const validarEmail = (valor: string) => {
        setEmail(valor);
        if (!valor) {
            setErrorEmail("El correo es requerido");
            return;
        }
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(valor)) {
            setErrorEmail("Formato de correo inválido");
        } else {
            setErrorEmail("");
        }
    };

    const nextStep = () => {
        if (step === 1 && dni.trim()) setStep(2);
    };

    const prevStep = () => {
        if (step === 2) setStep(1);
    };

    const onSubmit = async () => {
        setError(null);
        setIsLoading(true);

        const payload = new FormData();
        payload.append("dni", dni);
        payload.append("name", name);
        payload.append("email", email);
        payload.append("password", password);
        if (avatar) payload.append("avatar", avatar);

        // Ejecutamos la Server Action y esperamos la respuesta de la API
        const result = await handleRegister(payload);

        // 1. Manejo de respuesta errónea
        if (result?.error || !result?.success) {
            setError(result?.error || "Ocurrió un error inesperado");
            setIsLoading(false);
            return;
        }

        // 2. Manejo de respuesta satisfactoria en formato API
        if (result.success) {
            console.log(
                "Datos del usuario capturados con éxito en el Frontend:",
                result.user
            );
            // 💡 GUARDAR EN ZUSTAND (Se guarda en memoria y localStorage automáticamente)
            setUser({
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                isAdmin: result.user.isAdmin,
            });
            // En este punto las cookies ya se guardaron en el navegador automáticamente.
            // Aquí puedes guardar a 'result.user' en tu Contexto global, Zustand, o localStorage si lo requieres.

            // 3. Redirigimos de manera controlada desde el frontend una vez guardado el estado
            router.push(`/client/dashboard`); // Cambia por tu ruta protegida (ej: /dashboard, /profile, etc.)
        }
    };

    const handleGoogleRegister = () => {
        // AQUÍ: Integración de Registro Social (NextAuth, etc.)
        console.log("Registrando cuenta usando Google Social Login");
    };

    // Validación rápida para los botones de acción
    const isStep1Valid = dni.trim().length > 4;
    const isStep2Valid =
        !errorEmail &&
        email &&
        name &&
        password &&
        confirmPassword &&
        password === confirmPassword;

    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[380px]">
                <header className="relative z-10 text-center mb-4">
                    <div className="flex justify-center my-6">
                        <Image
                            src="/img/logo1.png"
                            alt="Logo"
                            width={256}
                            height={86}
                            priority
                            className="max-w-[180px] sm:max-w-[220px] md:max-w-full h-auto object-contain"
                        />
                    </div>

                    {/* 💡 CORRECCIÓN: Ajustamos tamaños de texto responsivos */}
                    <h3 className="text-2xl sm:text-3xl font-anton tracking-tight">
                        Crear Cuenta
                    </h3>
                    <p className="font-questrial text-gray-400 text-xs sm:text-sm mt-1">
                        Paso {step} de 2:{" "}
                        {step === 1 ? "Información Personal" : "Credenciales de Acceso"}
                    </p>

                </header>
                {/* INDICADOR VISUAL DE PASO */}
                <div className="w-full h-1 bg-white/10 rounded-full mb-6 sm:mb-8 overflow-hidden relative z-10">
                    <div
                        className="h-full bg-[#5e0472] transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
                        style={{ width: step === 1 ? "50%" : "100%" }}
                    />
                </div>

                {error && (
                    <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">
                        {error}
                    </p>
                )}


                {/* Formulario */}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                    className="space-y-5 relative z-10"
                >
                    {/* ================= PASO 1 ================= */}

                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                            {/* Carga del Avatar */}

                            <div className="flex flex-col items-center justify-center space-y-2 mb-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Foto de Perfil
                                </label>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 hover:border-[#5e0472] bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group"
                                >
                                    {avatarPreview ? (
                                        <Image
                                            src={avatarPreview}
                                            alt="Preview"
                                            fill
                                            sizes="(max-width: 768px) 96px, 96px"
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <Camera className="w-6 h-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                    )}

                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                                            Cambiar
                                        </span>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    name="avatar" // 💡 Agregado
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* Input: DNI */}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Documento de Identidad (DNI)
                                </label>

                                <div className="relative group">
                                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />

                                    <input
                                        type="text"
                                        name="dni" // 💡 Agregado
                                        required
                                        value={dni}
                                        onChange={(e) => setDni(e.target.value)}
                                        placeholder="Ej: 12345678"
                                        className={`w-full bg-white/5 border py-4 pl-12 pr-4 focus:outline-none focus:border-[#5e0472] focus:bg-white/10 transition-all placeholder:text-gray-600 text-[#5e0472]`}
                                    />
                                </div>
                            </div>

                            {/* Input: NAME */}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Nombre Completo
                                </label>

                                <div className="relative group">
                                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />

                                    <input
                                        type="text"
                                        name="name" // 💡 Agregado
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Valentina Birrot"
                                        className={`w-full bg-white/5 border py-4 pl-12 pr-4 focus:outline-none focus:border-[#5e0472] focus:bg-white/10 transition-all placeholder:text-gray-600 text-[#5e0472]`}
                                    />
                                </div>
                            </div>

                            {/* Botón Siguiente */}

                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={!isStep1Valid}
                                className="w-full cursor-pointer group font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
                            >
                                <span>Siguiente Paso</span>

                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {/* ================= PASO 2 ================= */}

                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Input: Email */}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Email Institucional
                                </label>

                                <div className="relative group">
                                    <Mail
                                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errorEmail
                                            ? "text-red-400"
                                            : "text-gray-500 group-focus-within:text-purple-400"
                                            }`}
                                    />

                                    <input
                                        type="email"
                                        name="email" // 💡 Agregado
                                        required
                                        value={email}
                                        onChange={(e) => validarEmail(e.target.value)}
                                        placeholder="ejemplo@ademan.com"
                                        className={`w-full bg-white/5 border py-4 pl-12 pr-4 focus:outline-none focus:border-[#5e0472] focus:bg-white/10 transition-all placeholder:text-gray-600 text-[#5e0472]`}

                                    />
                                </div>

                                {errorEmail && (
                                    <p className="text-red-400 text-xs pl-1 animate-in fade-in slide-in-from-top-1">
                                        {errorEmail}
                                    </p>
                                )}
                            </div>

                            {/* Input: Contraseña */}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Contraseña
                                </label>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password" // 💡 Agregado
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className={`w-full bg-white/5 border py-4 pl-12 pr-4 focus:outline-none focus:border-[#5e0472] focus:bg-white/10 transition-all placeholder:text-gray-600 text-[#5e0472]`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors focus:outline-none p-1 cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Input: Confirmar Contraseña */}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Confirmar Contraseña
                                </label>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />

                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className={`w-full bg-white/5 border py-4 pl-12 pr-4 focus:outline-none focus:border-[#5e0472] focus:bg-white/10 transition-all placeholder:text-gray-600 text-[#5e0472]`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors focus:outline-none p-1 cursor-pointer"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {password &&
                                    confirmPassword &&
                                    password !== confirmPassword && (
                                        <p className="text-red-400 text-xs pl-1 animate-in fade-in slide-in-from-top-1">
                                            Las contraseñas no coinciden
                                        </p>
                                    )}
                            </div>

                            {/* Botonera de Navegación del Paso 2 */}

                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    disabled={isLoading}
                                    onClick={prevStep}
                                    className="flex-1 px-4 py-2 border border-purple-100 text-gray-500 flex items-center justify-center gap-2 font-questrial hover:bg-gray-50 transition flex-1 sm:flex-none cursor-pointer text-xs uppercase tracking-wider"
                                >
                                    <ChevronLeft className="w-4 h-4" />

                                    <span>Atrás</span>
                                </button>

                                <button
                                    type="submit"
                                    disabled={!isStep2Valid || isLoading}
                                    className="flex-2 cursor-pointer group font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
                                >
                                    {/* 💡 Agregamos el Spinner SVG de carga condicional */}

                                    {isLoading ? (
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>

                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                    ) : null}

                                    <span>{isLoading ? "Procesando..." : "Registrarse"}</span>

                                    {!isLoading && (
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>


                {/* SEPARATOR & SOCIAL LOGIN */}

                <div className="mt-8 space-y-6 relative z-10">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-full border-t border-white/5"></div>

                        <span className="relative px-4 text-[10px] text-gray-500 uppercase tracking-widest">
                            O regístrate con
                        </span>
                    </div>

                    {/* Botón de Registro con Google */}

                    <button
                        type="button"
                        onClick={handleGoogleRegister}
                        className="w-full cursor-pointer flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-xs uppercase tracking-wider py-3.5 px-4 transition-all duration-300"
                    >
                        <svg
                            className="w-4 h-4 text-white fill-current"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />

                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />

                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                fill="#FBBC05"
                            />

                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                fill="#EA4335"
                            />
                        </svg>

                        <span>Registrarse con Google</span>
                    </button>
                </div>

                {/* REDIRECCIÓN A INICIO DE SESIÓN */}

                <div className="mt-8 text-center relative z-10 border-t border-white/5 pt-5">
                    <p className="text-xs text-gray-400">
                        ¿Ya tienes una cuenta?{" "}
                        <Link
                            href="/login"
                            className="font-bold text-[#5e0472] hover:text-purple-400 underline transition-colors ml-1"
                        >
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}