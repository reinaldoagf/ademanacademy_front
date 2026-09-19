import React from 'react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';

export interface RangeSliderInputProps extends Omit<FieldLayoutProps, 'children'> {
    minValue: number;
    maxValue: number;
    minLimit?: number;
    maxLimit?: number;
    step?: number;
    unitLabel?: string;
    onRangeChange: (min: number, max: number) => void;
}

export const RangeSliderInput: React.FC<RangeSliderInputProps> = ({
    label,
    labelColor,
    containerClassName,
    minValue,
    maxValue,
    minLimit = 1,
    maxLimit = 30,
    step = 1,
    unitLabel = "años",
    onRangeChange,
}) => {
    // Aseguramos valores por defecto dentro de los límites
    const minVal = minValue ?? minLimit;
    const maxVal = maxValue ?? maxLimit;

    // Cálculo del porcentaje dinámico para la barra activa
    const rangeSpan = maxLimit - minLimit;
    const leftPercent = rangeSpan > 0 ? ((minVal - minLimit) / rangeSpan) * 100 : 0;
    const widthPercent = rangeSpan > 0 ? ((maxVal - minVal) / rangeSpan) * 100 : 0;

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(e.target.value), maxVal - step);
        onRangeChange(value, maxVal);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(e.target.value), minVal + step);
        onRangeChange(minVal, value);
    };

    const midLimit = Math.round((minLimit + maxLimit) / 2);

    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className="space-y-2">
                {/* Encabezado con badge del valor actual */}
                <div className="flex justify-end -mt-7 mb-2">
                    <span className="font-bold text-[#5e0472] bg-purple-100 px-2.5 py-0.5 text-[11px] rounded-full">
                        {minVal} - {maxVal} {unitLabel}
                    </span>
                </div>

                <div className="bg-purple-50/30 p-4 border border-purple-100 rounded-lg">
                    {/* Contenedor de la barra de rango doble */}
                    <div className="relative w-full h-8 flex items-center">
                        {/* Fondo neutro de la barra */}
                        <div className="absolute w-full h-2 bg-purple-100 rounded-full" />

                        {/* Relleno coloreado activo */}
                        <div
                            className="absolute h-2 bg-gradient-to-r from-purple-500 to-[#5e0472] rounded-full pointer-events-none"
                            style={{
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                            }}
                        />

                        {/* Input para Mínimo */}
                        <input
                            type="range"
                            min={minLimit}
                            max={maxLimit}
                            step={step}
                            value={minVal}
                            onChange={handleMinChange}
                            className="range-thumb absolute w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer z-20 focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5e0472] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#5e0472] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                        />

                        {/* Input para Máximo */}
                        <input
                            type="range"
                            min={minLimit}
                            max={maxLimit}
                            step={step}
                            value={maxVal}
                            onChange={handleMaxChange}
                            className="range-thumb absolute w-full h-2 appearance-none bg-transparent pointer-events-none cursor-pointer z-30 focus:outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#5e0472] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#5e0472] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                        />
                    </div>

                    {/* Guías inferiores de escala */}
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 select-none">
                        <span>{minLimit} {unitLabel}</span>
                        <span>{midLimit} {unitLabel}</span>
                        <span>{maxLimit} {unitLabel}</span>
                    </div>
                </div>
            </div>
        </FieldLayout>
    );
};