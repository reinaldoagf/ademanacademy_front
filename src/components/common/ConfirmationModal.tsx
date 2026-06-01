"use client";

import React, { useState, useEffect } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data?: { email?: string }) => void | Promise<void>;
    title?: string;
    description?: string;
    confirmButtonText?: string;
    variant?: "danger" | "primary" | "warning";
    // Configuraciones de Tipo de Confirmación
    type: "simple" | "word" | "email";
    requiredWord?: string; // Palabra requerida (Ej: "ELIMINAR")
    userEmail?: string;     // Correo del usuario que debe confirmar para validación
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirmar operación",
    description = "¿Estás seguro de que deseas realizar esta acción? Esta operación podría ser irreversible.",
    confirmButtonText = "Confirmar",
    variant = "primary",
    type = "simple",
    requiredWord = "CONFIRMAR",
    userEmail = "",
}: ConfirmationModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Limpiar el estado cuando el modal se abre/cierra
    useEffect(() => {
        if (isOpen) {
            setInputValue("");
            setError("");
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Validación de la condición antes de habilitar el botón o procesar
    const isInputValid = () => {
        if (type === "word") {
            return inputValue.trim().toUpperCase() === requiredWord.toUpperCase();
        }
        if (type === "email") {
            return inputValue.trim().toLowerCase() === userEmail.toLowerCase();
        }
        return true; // Para confirmación simple
    };

    const handleConfirm = async () => {
        if (!isInputValid()) {
            setError(
                type === "word"
                    ? `La palabra introducida no coincide con "${requiredWord}"`
                    : "El correo electrónico introducido no es correcto."
            );
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            // Ejecutamos la acción (soporta funciones asíncronas como Server Actions)
            await onConfirm(type === "email" ? { email: inputValue } : undefined);
            onClose();
        } catch (err: any) {
            setError(err?.message || "Ocurrió un error al procesar la operación.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Colores dinámicos según la variante (Estilo Tailwind)
    const variantClasses = {
        danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
        warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 bg-opacity-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md transform overflow-hidden bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">

                {/* Título */}
                <h3 className="text-lg font-anton leading-6 text-gray-900 flex items-center gap-2">
                    {variant === "danger" && <span className="text-red-500">⚠️</span>}
                    {title}
                </h3>

                {/* Descripción */}
                <div className="mt-2">
                    <p className="font-questrial text-sm text-gray-500">{description}</p>
                </div>

                {/* Inputs Condicionales según el 'type' */}
                {(type === "word" || type === "email") && (
                    <div className="mt-4 bg-gray-50 p-3">
                        <label className="block text-xs font-questrial text-gray-700 uppercase tracking-wider mb-2">
                            {type === "word" ? (
                                <>Escribe la palabra <span className="text-gray-900 font-extrabold font-mono">"{requiredWord}"</span> para continuar:</>
                            ) : (
                                <>Escribe tu correo <span className="text-gray-900 font-extrabold">({userEmail})</span> para confirmar:</>
                            )}
                        </label>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 font-questrial text-sm border shadow-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                            placeholder={type === "word" ? requiredWord : "ejemplo@correo.com"}
                        />
                    </div>
                )}

                {/* Mensajes de Error */}
                {error && (
                    <div className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 font-medium">
                        {error}
                    </div>
                )}

                {/* Botones de Acción */}
                <div className="mt-6 flex justify-between">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={!isInputValid() || isSubmitting}
                        className={`cursor-pointer inline-flex justify-center items-center px-4 py-2 text-sm font-questrial text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed ${variantClasses[variant]}`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Procesando...
                            </>
                        ) : (
                            confirmButtonText
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}