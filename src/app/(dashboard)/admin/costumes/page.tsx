// src/app/(dashboard)/admin/costumes/page.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Scissors,
  Shirt,
  Search,
  UserCheck2,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ImagePlus, X
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import { WardrobeCard } from "@/components/WardrobeCard";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { CostumeCategory, CostumeStatus, SizeStock, Costume } from "@/types/costume";
import { getAllCostumesAction, saveCostumeAction, deleteCostumeAction } from "@/app/actions/costume";

export default function CostumesPage() {
  const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";

  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "simple" | "word" | "email";
    title: string;
    description: string;
    requiredWord?: string;
    userEmail?: string;
    id?: string;
  }>({
    isOpen: false,
    type: "word",
    title: "",
    description: "",
  });
  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
  // Acción definitiva que se ejecuta al pasar el filtro del Modal
  const handleConfirmAction = async () => {
    if (modalConfig?.id) {
      startTransition(async () => {
        if (modalConfig?.id) {
          const res = await deleteCostumeAction(modalConfig.id);
          if (res.success) {
            toast.success("Operación exitosa");
            fetchData(currentPage, itemsPerPage);
            // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
            window.dispatchEvent(new Event('refresh-costumes-count'));
          }
        }
      });
    }
  };
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
  const [formData, setFormData] = useState({
    name: '',
    beat: '',
    category: 'childrens' as CostumeCategory, // O el valor que prefieras por defecto
    status: 'pending_preparation' as CostumeStatus,
    availableSizes: [...DEFAULT_SIZES] as SizeStock[]
  });
  // Estados locales exclusivos para la gestión de archivos
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // Almacena el ID del vestuario que se está editando (null si es una creación)

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



  // Métricas de inventario text-analíticas
  const totalTrajes = 2; /* DEMO_VESTUARIOS.reduce(
    (acc, curr) => acc + curr.totalUnidades,
    0,
  ); */
  const trajesAsignados = 1; /* DEMO_VESTUARIOS.reduce(
    (acc, curr) => acc + curr.asignados,
    0,
  ); */
  const enTaller = 6
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
  // 1. Definimos las funciones que recibirán el elemento capturado
  const handleEdit = (costume: any) => {
    setEditingId(costume.id);
    setIsModalOpen(true);
    setFormData({
      name: costume.name ?? '',
      beat: costume.beat ?? '',
      category: costume.category as CostumeCategory, // O el valor que prefieras por defecto
      status: costume.status as CostumeStatus,
      availableSizes: costume.availableSizes as SizeStock[]
    })
    // 🎯 Procesamos las imágenes existentes para mostrarlas en la previsualización del formulario
    let imagesParsed: string[] = [];
    try {
      if (typeof costume.images === "string") {
        imagesParsed = JSON.parse(costume.images);
      } else if (Array.isArray(costume.images)) {
        imagesParsed = costume.images;
      }

      const formattedImages = imagesParsed.map((img: any) => {
        const path = typeof img === 'object' ? img.url || img.path : img;
        if (path.startsWith('http://') || path.startsWith('https://')) {
          return path;
        }
        const cleanBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanBackendUrl}${cleanPath}`;
      });

      // Guardamos estas imágenes en nuestro estado de previsualizaciones existentes
      setExistingImages(formattedImages);
    } catch (e) {
      console.error("Error al procesar imágenes existentes para edición", e);
      setExistingImages([]);
    }

    // Limpiamos los archivos nuevos que estuviesen cargados de antes
    setSelectedFiles([]);
    setPreviews([]);
  };

  const handleDelete = (costume: any) => {
    setModalConfig({
      isOpen: true,
      type: "word",
      title: "Confirmar operación",
      description: "¿Quieres eliminar el registro de tu vestuario?",
      id: costume.id,
    });

  };
  // 4. Adaptación del envío del formulario
  const handleSave = async (e: React.FormEvent) => {
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
        name: formData.name,
        beat: formData.beat || '',
        category: formData.category,
        status: formData.status,
        availableSizes: formData.availableSizes || [],
        images: newImagesPayload, // Nuevas imágenes Base64
        // Enviar las imágenes existentes que el usuario no ha eliminado durante la edición
        existingImages: editingId ? existingImages : [],
      };

      // saveCostumeAction debe recibir el payload y el editingId (si existe)
      const result = await saveCostumeAction(payload, editingId);

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
          window.dispatchEvent(new Event('refresh-costumes-count'));
          setFormData({
            name: '',
            beat: '',
            category: 'childrens' as CostumeCategory,
            status: 'pending_preparation' as CostumeStatus,
            availableSizes: [...DEFAULT_SIZES]
          });
        }

        setIsModalOpen(false);
      } else {
        setErrorMsg(result.error);
      }
    } catch (error) {
      setErrorMsg("Ocurrió un error al procesar las imágenes seleccionadas.");
      console.error(error);
    }
  };
  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res = await getAllCostumesAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
        status: statusFilter == 'all' ? undefined : statusFilter,
        category: categoryFilter == 'all' ? undefined : categoryFilter,
      });

      if (res.success && res.data) {
        setCostumes(res.data);
        setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
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
        htmlTitle={`Inventario y Control de <em class="text-[#5e0472]">Vestuarios</em>`}
        htmlSubTitle="Asigna prendas de baile, gestiona tallas por alumno y controla el estatus del taller de costura."
        actions={[
          {
            label: "Control de Lavandería",
            onClick: () => console.log("Abriendo lavandería..."),
            icon: <RefreshCw className="w-4 h-4" />,
            variant: "secondary" as const,
          },
          {
            label: "Agregar Diseño / Traje →",
            onClick: () => {
              setFormData({
                name: '',
                beat: '',
                category: 'childrens' as CostumeCategory, // O el valor que prefieras por defecto
                status: 'pending_preparation' as CostumeStatus,
                availableSizes: [...DEFAULT_SIZES] as SizeStock[]
              });
              setEditingId(null);
              setErrorMsg(null);
              setIsModalOpen(true)
            },
            icon: <Plus className="w-4 h-4" />,
            variant: "primary" as const,
          },
        ]}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
        {/* TARJETAS DE INDICADORES RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Total Prendas en Stock
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {totalTrajes} Piezas
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Disponibles en el almacén de utilería.
              </p>
            </div>
          </div>
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
              <UserCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Trajes Alquilados / Asignados
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {trajesAsignados} en Uso
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Bailarines con trajes bajo su custodia.
              </p>
            </div>
          </div>
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                En Modista / Ajustes
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {enTaller} Modelos
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Prendas retenidas por ajustes de bastilla o cierres.
              </p>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar traje o género de danza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>


          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">Todas las categorías</option>
              <option value="baby">Baby</option>
              <option value="childrens">Infantil</option>
              <option value="youth">Juvenil</option>
              <option value="adult">Adulto</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="retired">Fuera de servicio</option>
              <option value="maintenance">En lavandería / Reparación</option>
              <option value="available">Listo para usar / En stock</option>
              <option value="pending_preparation">En confección / Preparación</option>
            </select>
          </div>

        </div>

        {/* LISTADO DE STOCK CON DESGLOSE DE TALLAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {costumes.length > 0 ? (
            costumes.map((costume) => {
              return <WardrobeCard
                key={costume.id}
                costume={costume}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            })
          ) : (
            <div className="col-span-full text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
              No se encontraron registros de vestuarios en base a los filtros.
            </div>
          )}
        </div>

        {/* Seccion de Paginación */}
        {meta.totalPages > 1 && (
          <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-50/60 shadow-xs">
            <div className="text-xs font-questrial text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{costumes.length}</span> de{" "}
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* 
      1. Agregado `max-h-[calc(100vh-2rem)]` para limitar la altura total del modal en pantallas pequeñas.
      2. Agregado `flex flex-col` para poder estructurar la cabecera y el formulario de forma desacoplada.
    */}
          <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">

            {/* Cabecera del Modal (Fija en la parte superior) */}
            <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center shrink-0">
              <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                {editingId ? 'Actualizar Vestuario' : 'Dar de alta Vestuario'}
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario (Con scroll interno independiente si el contenido excede el espacio de pantalla) */}
            <form
              id="costume-form" // <-- Añadimos este ID
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-5 space-y-4 font-questrial text-xs scrollbar-thin"
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
                    Nombre del Vestuario *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Set urbano..."
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Ritmo / Coreografía (Beat)
                  </label>
                  <input
                    type="text"
                    value={formData.beat}
                    onChange={(e) => setFormData({ ...formData, beat: e.target.value })}
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                    placeholder="Ej. Salsa, Urbana..."
                  />
                </div>
              </div>

              {/* Categoría y Estado - Grid responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CostumeCategory })}
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
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CostumeStatus })}
                    className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="pending_preparation">Pendiente Preparación</option>
                    <option value="available">Disponible</option>
                    <option value="maintenance">En Mantenimiento / Lavado</option>
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
                      {formData.availableSizes.map((item, idx) => {
                        const handleUpdateQuantity = (newVal: number) => {
                          const safeVal = Math.max(0, newVal);
                          const updatedSizes = [...formData.availableSizes];
                          updatedSizes[idx] = { ...updatedSizes[idx], quantity: safeVal };
                          setFormData({ ...formData, availableSizes: updatedSizes });
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
            <div className="px-5 py-4 border-t border-purple-100 bg-purple-50/20 flex justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                form="costume-form" // <-- Apunta al ID del formulario
                onClick={(e) => {
                  // Dado que el botón submit está fuera del área del formulario, forzamos
                  // el submit nativo del formulario asociando el id del form, o manteniéndolo
                  // de esta manera siempre que el botón esté dentro de la etiqueta <form>.
                }}
                className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
              >
                {editingId ? 'Actualizar' : 'Registrar'}
              </button>
            </div>

          </div>
        </div>
      )}
      {/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
        type={modalConfig.type}
        title={modalConfig.title}
        description={modalConfig.description}
        requiredWord={modalConfig.requiredWord}
        userEmail={modalConfig.userEmail}
        variant={modalConfig.type === "word" ? "danger" : modalConfig.type === "email" ? "warning" : "primary"}
        confirmButtonText={modalConfig.type === "word" ? "Eliminar de Por Vida" : "Confirmar Acción"}
      />
    </>
  );
}
