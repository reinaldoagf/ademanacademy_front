// src/components/ui/forms/SelectInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { BASE_INPUT_STYLES } from '@/consts/formStyles';

export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface SelectInputProps
    extends Omit<FieldLayoutProps, 'children'> {
    required?: boolean;
    className?: string;
    options: SelectOption[];
    multiple?: boolean;
    value: string | string[] | number | number[];
    onChange: (value: any) => void;
    placeholder?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
    label,
    labelColor,
    containerClassName,
    className = "",
    options,
    multiple = false,
    value = [],
    onChange,
    placeholder = "Selecciona una opción..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Normalizamos el valor a un arreglo para facilitar la manipulación en modo múltiple
    const selectedValues = Array.isArray(value) ? value : (value !== "" && value !== undefined ? [value] : []);

    // Cerrar el dropdown al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleOption = (optValue: string | number) => {
        if (!multiple) {
            onChange(optValue);
            setIsOpen(false);
            return;
        }

        if (selectedValues.includes(optValue)) {
            // Si ya está seleccionado, lo removemos
            onChange(selectedValues.filter(v => v !== optValue));
        } else {
            // Si no está, lo agregamos
            onChange([...selectedValues, optValue]);
        }
    };

    // Obtener las etiquetas de los elementos seleccionados para mostrar en el botón
    const getDisplayText = () => {
        if (selectedValues.length === 0) return placeholder;

        if (multiple) {
            const selectedLabels = options
                .filter(opt => selectedValues.includes(opt.value))
                .map(opt => opt.label);
            return selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder;
        }

        const selectedOpt = options.find(opt => opt.value === selectedValues[0]);
        return selectedOpt ? selectedOpt.label : placeholder;
    };

    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className="relative" ref={dropdownRef}>
                {/* Botón principal estilo select */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full text-left flex items-center justify-between cursor-pointer ${BASE_INPUT_STYLES} ${className}`.trim()}
                >
                    <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                        {getDisplayText()}
                    </span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Menú desplegable con checkboxes */}
                {isOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-purple-200 shadow-xl rounded-md py-1 z-50 max-h-60 overflow-y-auto scrollbar-thin">
                        {options.length === 0 ? (
                            <div className="px-3 py-2 text-gray-400 text-xs italic">No hay opciones disponibles</div>
                        ) : (
                            options.map((opt, index) => {
                                const isSelected = selectedValues.includes(opt.value);
                                return (
                                    <div
                                        key={index}
                                        onClick={() => !opt.disabled && handleToggleOption(opt.value)}
                                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-questrial cursor-pointer transition-colors ${opt.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-purple-50/60 text-gray-700'
                                            }`}
                                    >
                                        {multiple && (
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => { }}
                                                disabled={opt.disabled}
                                                className="w-3.5 h-3.5 text-purple-600 bg-purple-50/30 border-purple-300 rounded focus:ring-purple-400 cursor-pointer"
                                            />
                                        )}
                                        <span className={`${isSelected && !multiple ? 'font-bold text-purple-700' : ''}`}>
                                            {opt.label}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </FieldLayout>
    );
};