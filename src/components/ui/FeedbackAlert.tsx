import React, { ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';

export interface FeedbackAlertAction {
    label: string;
    onClick: () => void;
    variant?: 'purple' | 'neutral' | 'primary' | 'success';
}

export interface FeedbackAlertProps {
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
    title,
    description,
    onClose,
    extraActions = [],
    children,
}) => {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md bg-white shadow-2xl overflow-hidden font-questrial animate-scaleUp">
 {/* Encabezado del Modal */}
              <div className="bg-gradient-to-tr from-purple-900 to-[#400252] p-4 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-questrial font-bold text-lg">{title}</h3>
                  {description && (
                            <p className="text-xs text-purple-200 font-medium">
                                {description}
                            </p>
                        )}
                </div>
                <button
                  onClick={onClose}
                  className="text-purple-200 hover:text-white cursor-pointer bg-white/10 hover:bg-white/20 p-1.5 rounded transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
                

                <div className="p-6 text-center space-y-4">

                    {/* 🌟 Viñeta Animada de Éxito */}
                    <div className="relative mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100">
                        {/* Oculta de pulsación de fondo */}
                        <div className="absolute inset-0 rounded-full bg-emerald-200/50 animate-ping opacity-40" />
                        <CheckCircle2 className="w-9 h-9 text-emerald-500 relative z-10 transition-transform duration-300 transform scale-100" />
                    </div>

                    {/* Contenido personalizado si se envía */}
                    {children && (
                        <div className="pt-2 text-xs text-gray-600 text-left bg-purple-50/40 p-3 rounded-xl border border-purple-100/60">
                            {children}
                        </div>
                    )}

                </div>
                {/* Botonera de Acción */}
              <div className="border-t border-purple-100 bg-gray-50 px-6 py-3 flex justify-between shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                     className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
            >
                  Cerrar
                </button>
                
              <div className="flex gap-2">
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
              </div>
              </div>
            </div>
        </div>
    );
};