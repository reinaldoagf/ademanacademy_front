import React, { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { FieldLayout, FieldLayoutProps } from './FieldLayout';

export interface ImageGalleryPickerProps extends Omit<FieldLayoutProps, 'children'> {
    /** URLs de las imágenes ya almacenadas en el servidor */
    existingImages?: string[];
    /** Callback ejecutado al eliminar una imagen existente del servidor */
    onRemoveExistingImage?: (index: number, url: string) => void;

    /** Lista de nuevos archivos (File) seleccionados por el usuario */
    files: File[];
    /** Callback para actualizar la lista de nuevos archivos seleccionados */
    onFilesChange: (files: File[]) => void;

    /** Permite seleccionar múltiples archivos a la vez. Por defecto true */
    multiple?: boolean;
    /** Tipos de archivos aceptados (p. ej. "image/*", ".jpg,.png"). Por defecto "image/*" */
    accept?: string;
    /** Texto del botón para cargar imágenes. Por defecto "Añadir foto" */
    buttonText?: string;
}

export const ImageGalleryPicker: React.FC<ImageGalleryPickerProps> = ({
    label,
    labelColor,
    containerClassName,
    existingImages = [],
    onRemoveExistingImage,
    files,
    onFilesChange,
    multiple = true,
    accept = "image/*",
    buttonText = "Añadir foto",
}) => {
    // Estado local para URLs de vista previa de nuevos archivos seleccionados
    const [previews, setPreviews] = useState<string[]>([]);

    // Efecto para generar URLs de previsualización y liberarlas de memoria al desmontar/cambiar
    useEffect(() => {
        const objectUrls = files.map((file) => URL.createObjectURL(file));
        setPreviews(objectUrls);

        // Limpieza de memoria (revocar URLs creadas)
        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [files]);

    // Manejar el cambio del input tipo file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const newFilesArray = Array.from(e.target.files);

        if (multiple) {
            onFilesChange([...files, ...newFilesArray]);
        } else {
            onFilesChange(newFilesArray);
        }

        // Resetear valor para permitir seleccionar de nuevo el mismo archivo si se requiere
        e.target.value = '';
    };

    // Manejar eliminación de un nuevo archivo subido
    const handleRemoveNewImage = (indexToRemove: number) => {
        const updatedFiles = files.filter((_, index) => index !== indexToRemove);
        onFilesChange(updatedFiles);
    };

    // Manejar eliminación de una imagen ya existente en el servidor
    const handleRemoveExistingImage = (indexToRemove: number, url: string) => {
        if (onRemoveExistingImage) {
            onRemoveExistingImage(indexToRemove, url);
        }
    };

    return (
        <FieldLayout
            label={label}
            labelColor={labelColor}
            containerClassName={containerClassName}
        >
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {/* Botón para subir nuevas imágenes */}
                <label className="h-20 sm:h-24 border border-dashed border-purple-200 bg-white hover:bg-purple-50/50 hover:border-purple-400 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer group rounded-lg overflow-hidden">
                    <ImagePlus className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-medium text-gray-500">{buttonText}</span>
                    <input
                        type="file"
                        multiple={multiple}
                        accept={accept}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </label>

                {/* 1. RENDERIZADO DE IMÁGENES QUE YA EXISTEN EN EL SERVIDOR */}
                {existingImages.map((src, index) => (
                    <div
                        key={`existing-${index}-${src}`}
                        className="relative h-20 sm:h-24 border border-purple-100 bg-gray-50 group rounded-lg overflow-hidden"
                    >
                        <img
                            src={src}
                            alt={`Guardada ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {/* Badge indicador de imagen ya almacenada */}
                        <span className="absolute bottom-1 left-1 bg-purple-900/80 text-white text-[8px] px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                            Guardada
                        </span>
                        <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index, src)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Eliminar imagen"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* 2. RENDERIZADO DE VISTAS PREVIAS DE NUEVAS IMÁGENES SELECCIONADAS */}
                {previews.map((src, index) => (
                    <div
                        key={`preview-${index}-${src}`}
                        className="relative h-20 sm:h-24 border border-purple-100 bg-gray-50 group rounded-lg overflow-hidden"
                    >
                        <img
                            src={src}
                            alt={`Vista previa ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Eliminar imagen"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </FieldLayout>
    );
};