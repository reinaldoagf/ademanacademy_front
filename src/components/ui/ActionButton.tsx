import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export type ActionButtonVariant =
    | 'danger'
    | 'success'
    | 'primary'
    | 'purple'
    | 'gradient_purple'
    | 'neutral';

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Icono de Lucide Icons (LucideIcon), un Componente o un elemento React (<Icon />) */
    icon?: LucideIcon | React.ComponentType<{ className?: string }> | ReactNode;
    variant?: ActionButtonVariant;
    tooltip?: string;
    iconOnlyOnMobile?: boolean;
    containerClassName?: string;
}

const VARIANT_STYLES: Record<ActionButtonVariant, string> = {
    danger: 'text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-95',
    success: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 active:scale-95',
    primary: 'text-blue-600 bg-blue-50 hover:bg-blue-100 active:scale-95',
    purple: 'text-purple-700 bg-purple-50 hover:bg-purple-100 active:scale-95',
    gradient_purple: 'text-white gradient-purple hover:opacity-90 active:scale-95 shadow-sm',
    neutral: 'text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95',
};

const DISABLED_STYLES = 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70 active:scale-100 hover:opacity-100';

export const ActionButton: React.FC<ActionButtonProps> = ({
    children,
    icon: Icon,
    variant = 'neutral',
    tooltip,
    disabled,
    className = '',
    containerClassName = '',
    iconOnlyOnMobile = false,
    ...props
}) => {
    // 💡 Renderizado seguro del icono
    const renderIcon = () => {
        if (!Icon) return null;

        // 1. Si es un componente (función o componente forwardRef de Lucide)
        if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && '$$typeof' in Icon)) {
            const Component = Icon as React.ComponentType<{ className?: string }>;
            return <Component className="w-3.5 h-3.5 shrink-0" />;
        }

        // 2. Si ya es un elemento JSX instanciado (ejemplo: icon={<Trash2 />})
        return Icon;
    };

    const buttonClasses = `
    flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold rounded-xl
    transition-all duration-150 cursor-pointer select-none
    ${disabled ? DISABLED_STYLES : VARIANT_STYLES[variant]}
    ${className}
  `.trim();

    return (
        <div className={`relative inline-block group ${containerClassName}`.trim()}>
            <button disabled={disabled} className={buttonClasses} {...props}>
                {renderIcon()}
                {children && (
                    <span className={iconOnlyOnMobile ? 'hidden sm:inline' : 'inline'}>
                        {children}
                    </span>
                )}
            </button>

            {tooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md pointer-events-none whitespace-nowrap shadow-md z-20">
                    {tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
            )}
        </div>
    );
};