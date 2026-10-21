// src/components/ui/forms/SearchInput.tsx
import React, { useState, useRef, ReactNode } from 'react';
import { CheckCheck, X } from "lucide-react";
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export interface SearchInputOption<T = any> {
    id: string | number;
    label: string;
    subLabel?: string;
    data?: T;
}

export interface SearchInputProps<T = any>
    extends Omit<FieldLayoutProps, 'children'> {
    value: string;
    onChangeText: (text: string) => void;
    onSelectOption: (option: SearchInputOption<T>) => void;
    onRemoveOption?: (optionId: string | number) => void;
    options: SearchInputOption<T>[];
    isLoading?: boolean;
    placeholder?: string;
    disabled?: boolean;
    emptyMessage?: string;
    loadingMessage?: string;
    renderOption?: (option: SearchInputOption<T>) => ReactNode;
    multiple?: boolean;
    selectedIds?: (string | number)[];
    selectedOptions?: SearchInputOption<T>[];
}

export function SearchInput<T = any>({
    label,
    labelColor,
    validSelection = false,
    containerClassName,
    value,
    onChangeText,
    onSelectOption,
    onRemoveOption,
    options = [],
    isLoading = false,
    placeholder = "Escribe para buscar...",
    disabled = false,
    emptyMessage = "No se encontraron resultados",
    loadingMessage = "Cargando opciones...",
    renderOption,
    multiple = false,
    selectedIds = [],
    selectedOptions = [],
}: SearchInputProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 🌟 Caché persistente con useRef (No causa re-renders ni bucles infinitos)
    const cacheRef = useRef<Map<string | number, SearchInputOption<T>>>(new Map());

    // Actualizamos el caché silenciosamente con las opciones que pasan las props
    selectedOptions.forEach((opt) => {
        if (opt && opt.id !== undefined) {
            cacheRef.current.set(opt.id, opt);
        }
    });

    options.forEach((opt) => {
        if (opt && opt.id !== undefined && selectedIds.includes(opt.id)) {
            cacheRef.current.set(opt.id, opt);
        }
    });

    useOnClickOutside(wrapperRef, () => setIsOpen(false));

    const handleSelect = (option: SearchInputOption<T>) => {
        // Guardamos en el caché al seleccionar
        cacheRef.current.set(option.id, option);
        onSelectOption(option);

        if (!multiple) {
            setIsOpen(false);
        } else {
            onChangeText("");
            inputRef.current?.focus();
        }
    };

    // Obtenemos los tags activos basándonos estrictamente en los IDs seleccionados y el caché
    const activeTags = multiple
        ? selectedIds.map((id) => cacheRef.current.get(id)).filter(Boolean) as SearchInputOption<T>[]
        : [];

    const showDropdown = isOpen && (options.length > 0 || isLoading || value.trim().length > 0);

    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
                {/* Contenedor tipo Input de Tags / Búsqueda */}
                <div
                    onClick={() => inputRef.current?.focus()}
                    className={`w-full p-1.5 border bg-purple-50/30 focus-within:border-purple-400 rounded transition-colors flex flex-wrap items-center gap-1.5 cursor-text ${!!validSelection && !multiple ? 'border-green-400' : 'border-purple-100'
                        }`}
                >
                    {/* Renderizar tags seleccionados */}
                    {multiple && activeTags.map((opt) => (
                        <span
                            key={opt.id}
                            className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-md font-medium"
                        >
                            <span className="max-w-[150px] truncate">{opt.label}</span>
                            {onRemoveOption && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveOption(opt.id);
                                    }}
                                    className="text-purple-600 hover:text-red-600 transition-colors cursor-pointer"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </span>
                    ))}

                    {/* Input de texto real para escribir y filtrar */}
                    <div className="relative flex-1 min-w-[120px]">
                        <input
                            ref={inputRef}
                            type="text"
                            disabled={disabled}
                            placeholder={multiple && activeTags.length > 0 ? "" : placeholder}
                            value={value}
                            onFocus={() => setIsOpen(true)}
                            onChange={(e) => {
                                onChangeText(e.target.value);
                                setIsOpen(true);
                            }}
                            className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 pr-6 font-questrial"
                        />

                        {isLoading && (
                            <div className="absolute right-1 top-1 w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        )}
                        {!isLoading && !!validSelection && !multiple && (
                            <div className="absolute right-1 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shrink-0">
                                <CheckCheck className="text-green-400 shrink-0" size={16} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Desplegable de Resultados */}
                {showDropdown && (
                    <ul className="absolute z-[9999] left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg font-questrial text-xs rounded-none divide-y divide-gray-50">
                        {isLoading ? (
                            <li className="p-2 text-gray-400 italic">{loadingMessage}</li>
                        ) : options.length === 0 ? (
                            <li className="p-2 text-red-400 bg-red-50/30">{emptyMessage}</li>
                        ) : (
                            options.map((option) => {
                                const isSelected = multiple && selectedIds.includes(option.id);
                                return (
                                    <li
                                        key={option.id}
                                        onClick={() => handleSelect(option)}
                                        className={`p-2 cursor-pointer transition-colors flex justify-between items-center ${isSelected ? 'bg-purple-50/80 font-medium text-purple-900' : 'hover:bg-purple-50 text-gray-700'
                                            }`}
                                    >
                                        {renderOption ? (
                                            renderOption(option)
                                        ) : (
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-2">
                                                    {multiple && (
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => { }}
                                                            className="w-3.5 h-3.5 text-purple-600 border-purple-300 rounded focus:ring-purple-400 cursor-pointer"
                                                        />
                                                    )}
                                                    <span className="font-medium text-gray-700">{option.label}</span>
                                                </div>
                                                {option.subLabel && (
                                                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">
                                                        {option.subLabel}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                );
                            })
                        )}
                    </ul>
                )}
            </div>
        </FieldLayout>
    );
}