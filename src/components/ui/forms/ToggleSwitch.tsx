import React, { InputHTMLAttributes, ReactNode } from 'react';

export interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    /** Título principal del campo */
    label?: string;
    /** Descripción secundaria o dinámica */
    description?: ReactNode;
    /** Estado del switch (true / false) */
    checked: boolean;
    /** Callback al cambiar el estado */
    onChange: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Variante de color al estar activo */
    activeColor?: 'purple' | 'emerald' | 'blue' | 'rose';
    /** Clases CSS adicionales para el contenedor principal */
    containerClassName?: string;
}

const COLOR_VARIANTS = {
    purple: 'peer-checked:bg-purple-600',
    emerald: 'peer-checked:bg-emerald-600',
    blue: 'peer-checked:bg-blue-600',
    rose: 'peer-checked:bg-rose-600',
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    label,
    description,
    checked,
    onChange,
    disabled,
    activeColor = 'purple',
    containerClassName = '',
    className = '',
    id,
    ...props
}) => {
    const switchId = id || (label ? `toggle-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
        <div
            className={`flex items-center justify-between p-3 bg-purple-50/50 border border-purple-100 rounded-xl transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : ''
                } ${containerClassName}`.trim()}
        >
            {(label || description) && (
                <div className="flex flex-col pr-4 select-none">
                    {label && <span className="font-bold text-xs text-gray-700">{label}</span>}
                    {description && (
                        <span className="text-gray-500 text-[11px] leading-tight">
                            {description}
                        </span>
                    )}
                </div>
            )}

            <label
                htmlFor={switchId}
                className={`relative inline-flex items-center shrink-0 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
            >
                <input
                    id={switchId}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.checked, e)}
                    className="sr-only peer"
                    {...props}
                />
                <div
                    className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
            peer-checked:after:translate-x-full peer-checked:after:border-white 
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
            after:bg-white after:border-gray-300 after:border after:rounded-full 
            after:h-5 after:w-5 after:transition-all 
            ${COLOR_VARIANTS[activeColor]} ${className}`.trim()}
                />
            </label>
        </div>
    );
};