import React, { InputHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { BASE_INPUT_STYLES } from '@/consts/formStyles';

export interface EmailInputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'>,
    Omit<FieldLayoutProps, 'children'> {
    value: string;
    onChange: (value: string) => void;
    showIcon?: boolean;
}

export const EmailInput: React.FC<EmailInputProps> = ({
    label,
    labelColor,
    containerClassName,
    value,
    onChange,
    showIcon = true,
    placeholder = "ejemplo@correo.com",
    disabled = false,
    className = "",
    ...props
}) => {
    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className="relative flex items-center">
                {/* Icono de Correo / Arroba */}
                {showIcon && (
                    <div className="absolute left-2.5 text-purple-400 pointer-events-none select-none">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 12a4 4 0 11-8 0 4 4 0 018 0 authorization-card--icon"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}

                {/* Input de Correo */}
                <input
                    {...props}
                    type="email"
                    disabled={disabled}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`${BASE_INPUT_STYLES} ${showIcon ? 'pl-9' : ''} ${className}`.trim()}
                />
            </div>
        </FieldLayout>
    );
};