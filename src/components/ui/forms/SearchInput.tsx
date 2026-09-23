import React, { useState, useRef, ReactNode } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { BASE_INPUT_STYLES } from '@/consts/formStyles';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export interface SearchInputOption<T = any> {
    id: string | number;
    label: string; // El texto principal a mostrar y filtrar (ej. c.name)
    subLabel?: string; // Un texto secundario opcional (ej. c.email)
    data?: T; // La entidad completa por si necesitas acceder a otras propiedades
}

export interface SearchInputProps<T = any>
    extends Omit<FieldLayoutProps, 'children'> {
    value: string; // El texto que se ve en el input
    onChangeText: (text: string) => void; // Cuando el usuario escribe libremente
    onSelectOption: (option: SearchInputOption<T>) => void; // Cuando selecciona una opción de la lista
    options: SearchInputOption<T>[]; // Opciones a mostrar/filtrar
    isLoading?: boolean;
    placeholder?: string;
    disabled?: boolean;
    emptyMessage?: string;
    loadingMessage?: string;
    renderOption?: (option: SearchInputOption<T>) => ReactNode; // Render personalizado opcional
}

export function SearchInput<T = any>({
    label,
    labelColor,
    containerClassName,
    value,
    onChangeText,
    onSelectOption,
    options = [],
    isLoading = false,
    placeholder = "Escribe para buscar...",
    disabled = false,
    emptyMessage = "No se encontraron resultados",
    loadingMessage = "Cargando opciones...",
    renderOption,
}: SearchInputProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Cerrar el desplegable cuando el usuario haga clic fuera
    useOnClickOutside(wrapperRef, () => setIsOpen(false));

    const handleSelect = (option: SearchInputOption<T>) => {
        onSelectOption(option);
        setIsOpen(false);
    };

    const showDropdown = isOpen && (options.length > 0 || isLoading || value.trim().length > 0);

    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
                {/* Input de Búsqueda */}
                <div className="relative">
                    <input
                        type="text"
                        disabled={disabled}
                        placeholder={placeholder}
                        value={value}
                        onFocus={() => setIsOpen(true)}
                        onChange={(e) => {
                            onChangeText(e.target.value);
                            setIsOpen(true);
                        }}
                        className={`${BASE_INPUT_STYLES} pr-8`}
                    />

                    {/* Spinner de Carga */}
                    {isLoading && (
                        <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    )}
                </div>

                {/* Desplegable de Resultados */}
                {showDropdown && (
                    <ul className="absolute z-[9999] left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg font-questrial text-xs rounded-none divide-y divide-gray-50">
                        {isLoading ? (
                            <li className="p-2 text-gray-400 italic">{loadingMessage}</li>
                        ) : options.length === 0 ? (
                            <li className="p-2 text-red-400 bg-red-50/30">{emptyMessage}</li>
                        ) : (
                            options.map((option) => (
                                <li
                                    key={option.id}
                                    onClick={() => handleSelect(option)}
                                    className="p-2 hover:bg-purple-50 cursor-pointer transition-colors flex justify-between items-center"
                                >
                                    {/* Si se pasa un render personalizado lo usa, de lo contrario renderiza la estructura por defecto */}
                                    {renderOption ? (
                                        renderOption(option)
                                    ) : (
                                        <>
                                            <span className="font-medium text-gray-700">{option.label}</span>
                                            {option.subLabel && (
                                                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">
                                                    {option.subLabel}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
        </FieldLayout>
    );
}