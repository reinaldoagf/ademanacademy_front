// DNIInput.tsx
import React, { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';

export interface DNIPrefixOption {
    code: string;  // ej. "V", "E", "J"
    label: string; // ej. "V", "E", "US"
}

export interface DNIInputProps
    extends Omit<FieldLayoutProps, 'children'> {
    // Props para el Prefijo / Código de País
    prefix: string;
    onPrefixChange: (code: string) => void;
    prefixes: DNIPrefixOption[];
    selectProps?: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>;

    // Props para el Identificador / Número de DNI
    dni: string; // Se mantiene phoneNumber para mantener la compatibilidad con el uso actual
    onDniChange: (dni: string) => void;
    placeholder?: string;
    required?: boolean;
    inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'placeholder' | 'required'>;
}

export const DNIInput: React.FC<DNIInputProps> = ({
    label,
    labelColor,
    containerClassName,
    prefix,
    onPrefixChange,
    prefixes = [],
    selectProps,
    dni,
    onDniChange,
    placeholder = "Ej: 1098765432",
    required = false,
    inputProps,
}) => {
    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className="flex relative group">
                {/* Select de Prefijo de DNI / Tipo de Documento */}
                <select
                    value={prefix}
                    onChange={(e) => onPrefixChange(e.target.value)}
                    className="bg-purple-50/50 text-purple-900 p-2 border-y border-l border-purple-100 focus:outline-none focus:border-purple-400 rounded-l transition-all text-xs font-sans appearance-none border-r-0 cursor-pointer min-w-[100px] max-w-[130px]"
                    {...selectProps}
                >
                    {prefixes.map((c) => (
                        <option
                            key={c.code}
                            value={c.code}
                            className="cursor-pointer border border-purple-100 bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans"
                        >
                            {c.label === c.code ? c.label : `${c.label} (${c.code})`}
                        </option>
                    ))}
                </select>

                {/* Input para el Número de Identificación (DNI) */}
                <input
                    type="text"
                    required={required}
                    placeholder={placeholder}
                    value={dni}
                    onChange={(e) => onDniChange(e.target.value)}
                    className="w-full p-2 border-y border-r border-l border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 transition-colors text-sm text-gray-800 placeholder-gray-400 rounded-r rounded-l-none"
                    {...inputProps}
                />
            </div>
        </FieldLayout>
    );
};