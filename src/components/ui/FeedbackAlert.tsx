import React, { ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';

export interface FeedbackAlertAction {
    label: string;
    onClick: () => void;
    variant?: 'purple' | 'neutral' | 'primary' | 'success';
}

export interface FeedbackAlertProps {
    /** Controla la visibilidad de la alerta */
    isOpen: boolean;
    /** Título principal de la alerta */
    title: string;
    /** Mensaje descriptivo opcional */
    description?: string;
    /** Callback al presionar el botón de cierre 'Ok' o la 'X' */
    onClose: () => void;
    /** Botones o acciones adicionales opcionales (ej: "Ver orden", "Ir al inicio") */
    extraActions?: FeedbackAlertAction[];
    /** Contenido extra personalizado (opcional) */
    children?: ReactNode;
}

export const FeedbackAlert: React.FC<FeedbackAlertProps> = ({
    isOpen,
    title,
    description,
    onClose,
    extraActions = [],
    children,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden font-questrial animate-scaleUp">

                {/* Decoración superior sutil */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-purple-600 to-indigo-600" />

                {/* Botón X de cierre rápido */}
                <button
                    onClick={onClose}
                    className="absolute top-3.5 right-3.5 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6 text-center space-y-4">

                    {/* 🌟 Viñeta Animada de Éxito */}
                    <div className="relative mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100">
                        {/* Oculta de pulsación de fondo */}
                        <div className="absolute inset-0 rounded-full bg-emerald-200/50 animate-ping opacity-40" />
                        <CheckCircle2 className="w-9 h-9 text-emerald-500 relative z-10 transition-transform duration-300 transform scale-100" />
                    </div>

                    {/* Textos Informativos */}
                    <div className="space-y-1.5">
                        <h3 className="text-lg font-bold text-gray-800 tracking-tight">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Contenido personalizado si se envía */}
                    {children && (
                        <div className="pt-2 text-xs text-gray-600 text-left bg-purple-50/40 p-3 rounded-xl border border-purple-100/60">
                            {children}
                        </div>
                    )}

                    {/* 🔘 Sección de Acciones y Navegación */}
                    <div className="pt-2 flex items-center gap-2 justify-center">
                        {/* Acciones adicionales opcionales */}
                        {extraActions.map((action, index) => (
                            <ActionButton
                                key={index}
                                variant={action.variant || 'neutral'}
                                onClick={action.onClick}
                            >
                                {action.label}
                            </ActionButton>
                        ))}

                        {/* Botón Principal de Confirmación */}
                        <ActionButton
                            variant="purple"
                            onClick={onClose}
                            className="min-w-[100px]"
                        >
                            Ok
                        </ActionButton>
                    </div>
                </div>
            </div>
        </div>
    );
};