import React, { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';
import { SelectOption } from './SelectInput';

export interface InputGroupProps extends Omit<FieldLayoutProps, 'children'> {
    selectValue: string | number;
    onSelectChange: (val: string) => void;
    selectOptions: SelectOption[];
    inputValue: string | number;
    onInputChange: (val: string) => void;
    inputType?: string;
    inputPlaceholder?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
    label,
    labelColor,
    containerClassName,
    selectValue,
    onSelectChange,
    selectOptions,
    inputValue,
    onInputChange,
    inputType = "text",
    inputPlaceholder = "",
}) => {
    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className="flex relative group">
                <select
                    value={selectValue}
                    onChange={(e) => onSelectChange(e.target.value)}
                    className="bg-purple-50/50 text-purple-900 p-2 border-y border-l border-purple-100 focus:outline-none focus:border-purple-400 rounded-l transition-all text-xs font-sans appearance-none border-r-0 cursor-pointer"
                >
                    {selectOptions.map((opt, i) => (
                        <option key={i} value={opt.value} disabled={opt.disabled} className="bg-white text-gray-800">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <input
                    type={inputType}
                    placeholder={inputPlaceholder}
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                    className="w-full p-2 border-y border-r border-l border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 transition-colors text-sm text-gray-800 placeholder-gray-400 rounded-r rounded-l-none"
                />
            </div>
        </FieldLayout>
    );
};