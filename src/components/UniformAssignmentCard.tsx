import { useState } from "react";
import { UniformAssignment } from "@/types/uniform";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

export const UniformAssignmentCard: React.FC<{ item: UniformAssignment }> = ({
    item,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";
    // Procesamiento de URLs de imágenes
    const rawImages = Array.isArray(item.uniform?.images) ? item.uniform.images : (JSON.parse(item.uniform?.images || "[]") || []);

    const formattedImages = rawImages
        .map((img: string) => {
            if (!img) return null;
            return img.startsWith('http')
                ? img
                : `${backendUrl.replace(/\/$/, '')}/${img.replace(/^\//, '')}`;
        })
        .filter((img: string): img is string => img !== null);

    const hasImages = formattedImages.length > 0;
    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % formattedImages.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === 0 ? formattedImages.length - 1 : prev - 1
        );
    };
    return (
        <div
            className="glass-card bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between rounded-2xl"
        >
            <div>
                {/* Carrusel de imágenes con Badges Superpuestos */}
                <div className="relative w-full h-100 overflow-hidden rounded-t-xl bg-purple-50/30 flex items-center justify-center group/carousel">



                    {hasImages ? (
                        <>
                            <img
                                src={formattedImages[currentImageIndex]}
                                alt={`${item.uniform?.name} - ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover transition-all duration-300"
                            />

                            {/* Controles del Carrusel (si hay más de 1 imagen) */}
                            {formattedImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={prevImage}
                                        className="cursor-pointer absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
                                        aria-label="Imagen anterior"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={nextImage}
                                        className="cursor-pointer absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10"
                                        aria-label="Siguiente imagen"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>

                                    {/* Indicadores / Puntos */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full z-10">
                                        {formattedImages.map((_: any, index: number) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(index);
                                                }}
                                                className={`h-1.5 rounded-full transition-all ${currentImageIndex === index
                                                    ? 'w-3.5 bg-white'
                                                    : 'w-1.5 bg-white/50'
                                                    }`}
                                                aria-label={`Ir a imagen ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-purple-300 gap-1">
                            <ImageIcon className="w-10 h-10 stroke-[1.5]" />
                            <span className="text-xs font-questrial font-medium">Sin imagen</span>
                        </div>
                    )}
                </div>

            </div>
            {/* Cabecera de la tarjeta */}
            <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="font-questrial text-[9px] text-gray-400 block uppercase tracking-wider">
                            Estudiante: {item.client?.type == "student" ? `${item.client.firstName} ${item.client.lastName}` : "No especificado"}
                        </span>
                        <h3 className="font-anton text-gray-800 text-base tracking-wide mt-0.5">
                            {item.uniform?.name || "Uniforme sin nombre"}
                        </h3>
                    </div>
                    <div className="flex items-center">
                        {item.status && (
                            <span className={`font-questrial text-[10px] px-2.5 py-0.5 font-bold capitalize shrink-0 ${item.status === 'ASSIGNED' || item.status === 'DELIVERED'
                                ? 'bg-purple-100 text-[#5e0472]'
                                : item.status === 'RETURNED'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                {item.status}
                            </span>
                        )}
                    </div>
                </div>

                {/* Sub-métricas del uniforme */}
                <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-dashed border-gray-100">
                    <div className="bg-slate-50 p-2">
                        <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Talla Asignada
                        </p>
                        <p className="text-xs font-questrial font-bold text-gray-700">
                            {item.assignedSize || "Sin talla"}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-2">
                        <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Asignado El
                        </p>
                        <p className="text-xs font-questrial font-bold text-gray-700">
                            {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : 'Sin fecha'}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-2">
                        <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Devuelto El
                        </p>
                        <p className="text-xs font-questrial font-bold text-gray-700">
                            {item.returnedAt ? new Date(item.returnedAt).toLocaleDateString() : 'Pendiente'}
                        </p>
                    </div>

                    <div className="bg-slate-50 p-2 col-span-3">
                        <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                            Observaciones
                        </p>
                        <p className="text-xs font-questrial font-bold text-gray-700 truncate">
                            {item.observations || 'Sin observaciones'}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}