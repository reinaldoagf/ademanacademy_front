// src/app/(dashboard)/admin/wardrobe/uniforms/page.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import HeroSection from "@/components/layout/HeroSection";
import { UniformCard } from "@/components/UniformCard";
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    ImagePlus,
    X
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import { Uniform, UniformCategory, UniformStatus, SizeStock } from "@/types/uniform";
import { getAllUniformsAction, saveUniformAction } from "@/app/actions/uniform";
import { MacDockModal } from "@/components/ui/MacDockModal";

export default function UniformsPage() {
    const uniformFormReference = useRef<HTMLFormElement>(null);
    const [uniforms, setUniforms] = useState<Uniform[]>([]);
    const {
        isOpen: isModalFormOpen,
        openModal: openModalForm,
        closeModal: closeModalForm
    } = useModal();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [meta, setMeta] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 8,
        itemCount: 8,
    });
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const DEFAULT_SIZES = [
        { size: 'XS', quantity: 0 },
        { size: 'S', quantity: 0 },
        { size: 'M', quantity: 0 },
        { size: 'L', quantity: 0 },
        { size: 'XL', quantity: 0 }
    ];
    // 1. Estado del formulario interno del modal
    const [uniformFormData, setUniformFormData] = useState({
        name: '',
        price: 0, // 👈 Nuevo campo de precio
        beat: '',
        category: 'childrens' as UniformCategory, // O el valor que prefieras por defecto
        status: 'payment_pending' as UniformStatus,
        availableSizes: [...DEFAULT_SIZES] as SizeStock[]
    });
    // Estados locales exclusivos para la gestión de archivos
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    // 1. Definimos las funciones que recibirán el elemento capturado
    const handleEdit = (uniform: any) => {
        console.log('handleEdit')
    };
    const handleDelete = (uniform: any) => {
        console.log('handleDelete')
    };

    // 2. Manejador de selección de imágenes
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            // Acumulamos los nuevos archivos
            setSelectedFiles((prev) => [...prev, ...filesArray]);

            // Generamos URLs locales temporales para ver la miniatura antes de subir
            const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
            setPreviews((prev) => [...prev, ...newPreviews]);
        }
    };
    // Manejo de inserción de nuevo salón
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file); // Lee el archivo como Data URL (contiene base64)
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    {/* Función auxiliar para remover una imagen ya existente del servidor */ }
    const removeExistingImage = (indexToRemove: number) => {
        setExistingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    {/* Tu función actual para remover nuevos archivos locales */ }
    const removeNewImage = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        setPreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };
    // 4. Adaptación del envío del formulario
    const storeUniform = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        try {
            // 1. Procesar los archivos nuevos cargados localmente a Base64
            const imagesPromises = selectedFiles.map(async (file) => {
                const base64String = await fileToBase64(file);
                return {
                    name: file.name,
                    type: file.type, // 'image/png', 'image/jpeg', etc.
                    base64: base64String,
                };
            });

            const newImagesPayload = await Promise.all(imagesPromises);

            // 2. Construir el payload definitivo
            const payload = {
                name: uniformFormData.name,
                beat: uniformFormData.beat || '',
                category: uniformFormData.category,
                status: uniformFormData.status || '',
                price: uniformFormData.price || 0,
                availableSizes: uniformFormData.availableSizes || [],
                images: newImagesPayload, // Nuevas imágenes Base64
                // Enviar las imágenes existentes que el usuario no ha eliminado durante la edición
                existingImages: editingId ? existingImages : [],
            };

            // saveUniformAction debe recibir el payload y el editingId (si existe)
            const result = await saveUniformAction(payload, editingId);

            if (result.success) {
                fetchData(currentPage, itemsPerPage);
                toast.success(editingId ? "Vestuario actualizado correctamente." : "Vestuario guardado correctamente.");

                // Limpieza de estados tras el guardado exitoso
                setSelectedFiles([]);
                setPreviews([]);
                setExistingImages([]);
                setEditingId(null); // Reset del ID de edición

                // Solo si es una creación limpiamos el formulario para que quede vacío la próxima vez
                if (!editingId) {
                    window.dispatchEvent(new Event('refresh-uniforms-count'));
                    setUniformFormData({
                        name: '',
                        price: 0,
                        beat: '',
                        category: 'childrens' as UniformCategory,
                        status: 'payment_pending' as UniformStatus,
                        availableSizes: [...DEFAULT_SIZES]
                    });
                }

                closeModalForm();
            } else {
                toast.error(result.error);
                setErrorMsg(result.error);
                scrollToTopForm();
            }
        } catch (error) {
            setErrorMsg("Ocurrió un error al procesar las imágenes seleccionadas.");
            console.error(error);
        }
    };
    const scrollToTopForm = () => {
        if (uniformFormReference.current) {
            uniformFormReference.current.scrollTo({
                top: 0,
                behavior: 'smooth' // 'smooth' para animación suave, o 'auto' para instantáneo
            });
        }
    };
    // 4. Carga e integración de datos
    const fetchData = (pageToFetch: number, limitToFetch: number) => {
        startTransition(async () => {

            // Petición de la lista paginada
            const res1 = await getAllUniformsAction({
                page: pageToFetch,
                limit: limitToFetch,
                ...(searchTerm ? { search: searchTerm } : {}),
                ...(statusFilter !== "all" ? { status: statusFilter } : {}),
                ...(categoryFilter !== "all" ? { category: categoryFilter } : {}),
            });

            console.log({ res1 })

            if (res1?.success && res1.data) {
                setUniforms(res1.data);
                setMeta(res1.meta);
            }
        });
    };
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData(currentPage, itemsPerPage);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm, statusFilter, categoryFilter, currentPage, itemsPerPage]);
    return (
        <>
            {/* HERO SECTION COMPONENTE REFACTORIZADO */}
            <HeroSection
                htmlTitle={`Inventario y Control de <em class="text-[#5e0472]">Uniformes</em>`}
                htmlSubTitle="Asigna prendas de baile, gestiona tallas por alumno y controla el estatus del taller de costura."
                actions={[
                    {
                        label: "Agregar Uniforme →",
                        onClick: () => {
                            setUniformFormData({
                                name: '',
                                price: 0,
                                beat: '',
                                category: 'childrens' as UniformCategory, // O el valor que prefieras por defecto
                                status: 'payment_pending' as UniformStatus,
                                availableSizes: [...DEFAULT_SIZES] as SizeStock[]
                            });
                            setEditingId(null);
                            setErrorMsg(null);
                            setSelectedFiles([]);
                            setPreviews([]);
                            setExistingImages([]);
                            openModalForm()
                        },
                        icon: <Plus className="w-4 h-4" />,
                        variant: "primary" as const,
                    },
                ]}
            />
            <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">{/* LISTADO DE STOCK CON DESGLOSE DE TALLAS */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {uniforms.length > 0 ? (
                        uniforms.map((uniform) => {
                            return <UniformCard
                                key={uniform.id}
                                uniform={uniform}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        })
                    ) : (
                        <div className="col-span-full text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
                            No se encontraron registros de uniformes en base a los filtros.
                        </div>
                    )}
                </div>

                {/* Seccion de Paginación */}
                {meta.totalPages > 1 && (
                    <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-50/60 shadow-xs">
                        <div className="text-xs font-questrial text-gray-500">
                            Mostrando <span className="font-semibold text-gray-700">{uniforms.length}</span> de{" "}
                            <span className="font-semibold text-gray-700">{meta.totalItems}</span> trajes
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Selector de Items por Página */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-questrial text-gray-400">Ver:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1); // Volver a la 1 tras cambiar el límite
                                    }}
                                    className="p-1 border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            {/* Controles de Navegación */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={meta.currentPage === 1 || isPending}
                                    className="p-1.5 border border-purple-50 bg-white text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer rounded-xs"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <span className="text-xs font-questrial px-3 py-1 bg-[#5e0472]/5 text-[#5e0472] font-semibold">
                                    Pág. {meta.currentPage} de {meta.totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, meta.totalPages))}
                                    disabled={meta.currentPage === meta.totalPages || isPending}
                                    className="p-1.5 border border-purple-50 bg-white text-gray-600 hover:bg-purple-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer rounded-xs"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL: APERTURA / REGISTRO DE VESTUARIO */}

            <MacDockModal
                isOpen={isModalFormOpen}
                onClose={closeModalForm}
                title={editingId ? "Actualizar Uniforme" : "Registrar Nuevo Uniforme"}
                size={"lg"}
            >

                {/* Formulario (Con scroll interno independiente si el contenido excede el espacio de pantalla) */}
                <form
                    ref={uniformFormReference}
                    id="uniform-form" // <-- Añadimos este ID
                    onSubmit={storeUniform}
                    className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin"
                >
                    {errorMsg && (
                        <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">
                            {errorMsg}
                        </p>
                    )}

                    {/* Nombre y Beat - Se vuelve un grid de 1 columna en celulares y 2 en pantallas más anchas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-500 font-bold mb-1">
                                Nombre del Uniforme *
                            </label>
                            <input
                                type="text"
                                placeholder="Ej. Set urbano..."
                                required
                                value={uniformFormData.name}
                                onChange={(e) => setUniformFormData({ ...uniformFormData, name: e.target.value })}
                                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-500 font-bold mb-1">
                                Ritmo / Coreografía (Beat)
                            </label>
                            <input
                                type="text"
                                value={uniformFormData.beat}
                                onChange={(e) => setUniformFormData({ ...uniformFormData, beat: e.target.value })}
                                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                                placeholder="Ej. Salsa, Urbana..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-500 font-bold mb-1">
                            Precio / Tarifa ($)
                        </label>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="0.00"
                            value={uniformFormData.price || ''}
                            onChange={(e) => setUniformFormData({ ...uniformFormData, price: parseFloat(e.target.value) || 0 })}
                            className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                        />
                    </div>

                    {/* Categoría y Estado - Grid responsivo */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-500 font-bold mb-1">
                                Categoría *
                            </label>
                            <select
                                value={uniformFormData.category}
                                onChange={(e) => setUniformFormData({ ...uniformFormData, category: e.target.value as UniformCategory })}
                                className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                            >
                                <option value="baby">Baby</option>
                                <option value="childrens">Infantil</option>
                                <option value="youth">Juvenil</option>
                                <option value="adult">Adulto</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-500 font-bold mb-1">
                                Estado Inicial *
                            </label>
                            <select
                                value={uniformFormData.status}
                                onChange={(e) => setUniformFormData({ ...uniformFormData, status: e.target.value as UniformStatus })}
                                className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                            >
                                <option value="payment_pending">Pendiente por pago</option>
                                <option value="making">Confeccionando</option>
                                <option value="available">Disponible</option>
                                <option value="retired">Retirado</option>
                            </select>
                        </div>
                    </div>

                    {/* Sección Dinámica: Control de Stock por Tallas */}
                    <div className="border border-purple-100 bg-purple-50/10 p-3 sm:p-4 space-y-3">
                        <div>
                            <label className="block text-gray-700 font-bold">Inventario disponible por Talla</label>
                            <p className="text-[10px] text-gray-400">Ajusta el stock usando los controles laterales o escribiendo el número directo.</p>
                        </div>

                        <div className="border border-purple-100/60 overflow-hidden bg-white shadow-xs">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-purple-50/50 border-b border-purple-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="px-4 py-2 font-anton">Talla</th>
                                        <th className="px-4 py-2 text-right font-anton">Cantidad / Unidades</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-50">
                                    {uniformFormData.availableSizes.map((item, idx) => {
                                        const handleUpdateQuantity = (newVal: number) => {
                                            const safeVal = Math.max(0, newVal);
                                            const updatedSizes = [...uniformFormData.availableSizes];
                                            updatedSizes[idx] = { ...updatedSizes[idx], quantity: safeVal };
                                            setUniformFormData({ ...uniformFormData, availableSizes: updatedSizes });
                                        };

                                        return (
                                            <tr key={item.size} className="hover:bg-purple-50/20 transition-colors">
                                                <td className="px-4 py-1.5 font-mono font-bold text-purple-700 text-sm">
                                                    {item.size}
                                                </td>

                                                <td className="px-4 py-1.5 flex justify-end">
                                                    <div className="flex items-center border border-purple-100 bg-purple-50/10 overflow-hidden max-w-[130px]">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item.quantity - 1)}
                                                            disabled={item.quantity <= 0}
                                                            className="px-2.5 py-1 text-gray-500 hover:bg-purple-50 active:bg-purple-100 transition-colors cursor-pointer select-none font-bold border-r border-purple-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                                                        >
                                                            –
                                                        </button>

                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={item.quantity}
                                                            onChange={(e) => handleUpdateQuantity(Number(e.target.value))}
                                                            className="w-12 text-center py-0.5 bg-transparent focus:outline-none font-mono text-xs text-gray-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item.quantity + 1)}
                                                            className="px-2.5 py-1 text-gray-500 hover:bg-purple-50 active:bg-purple-100 transition-colors cursor-pointer select-none font-bold border-r border-purple-100 text-sm"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Sección: Galería de Imágenes */}
                    <div className="border border-purple-100 bg-purple-50/10 p-3 sm:p-4 space-y-3">
                        <div>
                            <label className="block text-gray-700 font-bold">Galería de Imágenes</label>
                            <p className="text-[10px] text-gray-400">Sube hasta 10 fotos del diseño en formato JPG, PNG o WEBP.</p>
                        </div>

                        {/* Grid adaptable de imágenes (de 3 columnas en móviles a 4 en pantallas medianas) */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            <label className="h-20 sm:h-24 border border-dashed border-purple-200 bg-white hover:bg-purple-50/50 hover:border-purple-400 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer group">
                                <ImagePlus className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-medium text-gray-500">Añadir foto</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            {/* 1. RENDERIZADO DE IMÁGENES QUE YA EXISTEN EN EL SERVIDOR */}
                            {existingImages.map((src, index) => (
                                <div key={`existing-${index}`} className="relative h-20 sm:h-24 border border-purple-100 bg-gray-50 group">
                                    <img
                                        src={src}
                                        alt={`Guardada ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Etiqueta sutil que indica que está guardada */}
                                    <span className="absolute bottom-1 left-1 bg-purple-900/80 text-white text-[8px] px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                                        Guardada
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {previews.map((src, index) => (
                                <div key={index} className="relative h-20 sm:h-24 border border-purple-100 bg-gray-50 group">
                                    <img
                                        src={src}
                                        alt={`Vista previa ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
                {/* Botonera (Anclada al fondo y con sombra sutil divisoria) */}
                <div className="pt-5 border-t border-purple-100 bg-purple-50/20 flex justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => closeModalForm()}
                        className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        form="uniform-form" // <-- Apunta al ID del formulario
                        onClick={(e) => { }}
                        className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
                    >
                        {editingId
                            ? "Actualizar"
                            : "Registrar"}
                    </button>
                </div>
            </MacDockModal>
        </>
    );
}