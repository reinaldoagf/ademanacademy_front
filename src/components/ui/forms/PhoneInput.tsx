import React, { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { SelectOption } from './SelectInput';

export interface PhoneCountryOption {
    code: string;  // ej. "+58"
    label: string; // ej. "VE" o "Venezuela"
}

export interface PhoneInputProps
    extends Omit<FieldLayoutProps, 'children'> {
    // Props para el Select (Código de país)
    countryCode: string;
    onCountryCodeChange: (code: string) => void;
    countries: PhoneCountryOption[];
    selectProps?: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>;

    // Props para el Input (Número de teléfono)
    phoneNumber: string;
    onPhoneNumberChange: (phone: string) => void;
    phonePlaceholder?: string;
    inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'placeholder'>;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    label,
    labelColor,
    containerClassName,
    countryCode,
    onCountryCodeChange,
    countries = [],
    selectProps,
    phoneNumber,
    onPhoneNumberChange,
    phonePlaceholder = "Ej: 412 123 4567",
    inputProps,
}) => {
    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className="flex relative group">
                {/* Select de Código de País */}
                <select
                    value={countryCode}
                    onChange={(e) => onCountryCodeChange(e.target.value)}
                    className="bg-purple-50/50 text-purple-900 p-2 border-y border-l border-purple-100 focus:outline-none focus:border-purple-400 rounded-l transition-all text-xs font-sans appearance-none border-r-0 cursor-pointer max-w-[110px]"
                    {...selectProps}
                >
                    {countries.map((c) => (
                        <option
                            key={c.code}
                            value={c.code}
                            className="bg-white text-gray-800"
                        >
                            {c.label} ({c.code})
                        </option>
                    ))}
                </select>

                {/* Input para el Número Telefónico */}
                <input
                    type="tel"
                    placeholder={phonePlaceholder}
                    value={phoneNumber}
                    onChange={(e) => onPhoneNumberChange(e.target.value)}
                    className="w-full p-2 border-y border-r border-l border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 transition-colors text-sm text-gray-800 placeholder-gray-400 rounded-r rounded-l-none"
                    {...inputProps}
                />
            </div>
        </FieldLayout>
    );
};