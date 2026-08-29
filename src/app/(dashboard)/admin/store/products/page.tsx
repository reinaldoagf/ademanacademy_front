// src/app/(dashboard)/store/products/page.tsx
"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import HeroSection from "@/components/layout/HeroSection";
import { MacDockModal } from "@/components/ui/MacDockModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { ProductCard } from "@/components/ProductCard";
import {
  Search,
  ImagePlus,
  Plus,
  PackageCheck,
  AlertCircle,
  ShoppingCart,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { Product, SaveProductPayload } from "@/types/product";
import { ProductCategory } from "@/types/product-category";
import { useModal } from "@/hooks/useModal";
import {
  getAllProductCategoriesAction,
} from "@/app/actions/product-category";
import {
  saveProductAction,
  getProductMetrics,
  getAllProductsAction,
  deleteProductAction
} from "@/app/actions/product";


// Estado inicial limpio del formulario para Empleados
const initialFormState: SaveProductPayload = {
  name: "",
  description: "",
  salePrice: 0,
  cost: 0,
  currentStock: 1,
  minimumStockAlert: 1,
  categoryId: "",
  isActive: true,
  images: [],
  existingImages: [],
};
export default function ProductsPage() {
  const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";
  const productFormReference = useRef<HTMLFormElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("all");
  const { isOpen, openModal, closeModal } = useModal();
  const orderCreatedFlag = useCartStore((state) => state.orderCreatedFlag);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Definición del estado del formulario
  const [formData, setFormData] = useState<SaveProductPayload>(initialFormState);
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
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
  // Acción definitiva que se ejecuta al pasar el filtro del Modal
  const handleConfirmAction = async () => {

    if (modalConfig?.id) {
      startTransition(async () => {
        if (modalConfig?.id) {
          const res = await deleteProductAction(modalConfig.id);
          if (res.success) {
            toast.success("Operación exitosa");
            fetchData(currentPage, itemsPerPage);
            // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
            window.dispatchEvent(new Event('refresh-products-count'));
          }
        }
      });
    }
  };
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6,
    itemCount: 6,
  });
  const [metrics, setMetrics] = useState({
    inventoryValue: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isPending, startTransition] = useTransition();
  // Configuración de los botones superiores en nuestro HeroSection dinámico
  const actions = [
    {
      label: "Ingresar Producto →",
      onClick: () => {
        setFormData(initialFormState);
        setEditingId(null);
        setErrorMsg(null);
        openModal()
      },
      icon: <Plus className="w-4 h-4" />,
      variant: "primary" as const,
    },
  ];


  // 1. Definimos las funciones que recibirán el elemento capturado
  const handleEdit = (product: Product) => {
    openModal();
    setEditingId(product.id);

    // 1. Procesamos las imágenes primero
    let imagesParsed: any[] = [];
    let formattedImages: string[] = [];

    try {
      if (typeof product.images === 'string') {
        imagesParsed = JSON.parse(product.images);
      } else if (Array.isArray(product.images)) {
        imagesParsed = product.images;
      }

      const cleanBackendUrl = backendUrl.replace(/\/$/, '');

      formattedImages = imagesParsed
        .map((img: any) => {
          const path = typeof img === 'object' && img !== null ? img.url || img.path : img;

          if (!path || typeof path !== 'string') return null;

          if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
          }

          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          return `${cleanBackendUrl}${cleanPath}`;
        })
        .filter((url): url is string => Boolean(url));
    } catch (e) {
      console.error("Error al procesar las imágenes del producto:", e);
      formattedImages = [];
    }

    // 2. Asignamos TODO el formulario en un único setFormData
    setFormData({
      name: product.name ?? '',
      cost: Number(product.cost) || 0,
      salePrice: Number(product.salePrice) || 0,
      currentStock: Number(product.currentStock) || 0,
      minimumStockAlert: Number(product.minimumStockAlert) || 0,
      categoryId: product.categoryId ?? (typeof product.category === 'object' ? (product.category as any)?.id : product.category) ?? '',
      isActive: product.isActive ?? true,
      description: product.description ?? '',
      existingImages: formattedImages,
      images: [], // Resetea las nuevas imágenes de cargas anteriores
    });
  };
  const handleDelete = (product: Product) => {
    setModalConfig({
      isOpen: true,
      type: "word",
      title: "Confirmar operación",
      description: "¿Quieres eliminar el registro de tu vestuario?",
      id: product.id,
    });
  };
  // 📷 Manejador actualizado para cargar y convertir imágenes
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // 🌟 Validación estricta para garantizar que el tipo sea 'string'
        if (typeof reader.result === "string") {
          const base64String: string = reader.result;

          setFormData((prev) => ({
            ...prev,
            images: [
              ...(prev.images || []),
              {
                name: file.name,
                type: file.type,
                base64: base64String, // TypeScript reconoce que es un string estricto
              },
            ],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 🗑️ Eliminar imagen ya existente en el servidor
  const removeExistingImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: (prev.existingImages || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  // 🗑️ Eliminar nueva imagen seleccionada antes de subirla
  const removeNewImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, index) => index !== indexToRemove),
    }));
  };
  // Manejo de inserción de nuevo salón
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      const res = await saveProductAction(formData, editingId);
      if (!res.success) {
        setErrorMsg(res.error || "Ocurrió un error.");
        return;
      }
      toast.success("Operación exitosa");
      // Sincronizar estado local
      if (!editingId) {
        window.dispatchEvent(new Event('refresh-products-count'));
      }
      fetchData(currentPage, itemsPerPage);
      // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
      closeModal();
    });
  };
  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res1 = await getAllProductsAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
        ...(isActiveFilter !== "all" ? { isActive: isActiveFilter } : {}),
      });
      if (res1.success && res1.data) {
        setProducts(res1.data);
        setMeta(res1.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
      }
      const res2 = await getAllProductCategoriesAction({
        page: 1,
        limit: 100, // 🎯 Enviamos el límite dinámico
        search: undefined,
      });
      if (res2.success && res2.data) {
        setCategories(res2.data);
      }
      const res3 = await getProductMetrics()
      if (res3.success && res3.data) {
        setMetrics(res3.data);
      }
    });
  };
  useEffect(() => {
    if (orderCreatedFlag > 0) {

      // Aquí puedes volver a cargar la lista de pedidos de tu API o actualizar SWR/React Query
      fetchData(currentPage, itemsPerPage);
    }
  }, [orderCreatedFlag]);
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(currentPage, itemsPerPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, isActiveFilter, currentPage, itemsPerPage]);
  return (
    <>
      {/* HERO SECTION DE LA SECCIÓN */}
      <HeroSection
        htmlTitle={`<em class="text-[#5e0472]">Productos</em> de la tienda`}
        htmlSubTitle="Administra los productos en exhibición, calcula el valor de tus activos en almacén y registra ventas de uniforme rápido."
        actions={actions}
      />
      {/* Capa de Carga Asíncrona */}
      <div className="relative w-full">
        {isPending && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
          {/* METRICAS DE RENDIMIENTO DE LA TIENDA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Valor de Activos */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                  Capital en Almacén
                </p>
                <h4 className="text-xl font-anton text-gray-800">
                  ${metrics.inventoryValue || 0}
                </h4>
                <p className="font-questrial text-xs text-gray-500">
                  Costo total acumulado de los productos existentes.
                </p>
              </div>
            </div>

            {/* Alertas de Reabastecimiento */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 flex items-center justify-center text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                  Por Agotarse (Bajo Mínimo)
                </p>
                <h4 className="text-xl font-anton text-gray-800">
                  {metrics.lowStockProducts || 0} Artículos
                </h4>
                <p className="font-questrial text-xs text-gray-500">
                  Artículos activos por agotarse.
                </p>
              </div>
            </div>
            {/* Quiebres de Stock */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                  Agotados Totalmente
                </p>
                <h4 className="text-xl font-anton text-gray-800">
                  {metrics.outOfStockProducts || 0} Variantes
                </h4>
                <span className="text-[10px] bg-pink-50 text-pink-600 font-bold px-2 py-0.5 inline-flex items-center gap-0.5">
                  Quiebre de currentStock activo
                </span>
              </div>
            </div>

          </div>

          {/* FILTROS DE CATEGORÍAS */}

          <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código o descripción de producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 font-questrial border border-purple-100 text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={isActiveFilter}
                onChange={(e) => setIsActiveFilter(e.target.value)}
                className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
              >
                <option value="all">Todos los productos</option>
                <option value="true">Activos</option>
                <option value="false">No activos</option>
              </select>

            </div>
          </div>


          {/* GRILLA DE CATÁLOGO / PRODUCTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  backendUrl={backendUrl}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
                Ningún ítem coincide con los criterios de búsqueda comerciales.
              </div>
            )}
          </div>

          {/* Seccion de Paginación */}
          {meta.totalPages > 1 && (
            <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-purple-50/60 shadow-xs">
              <div className="text-xs font-questrial text-gray-500">
                Mostrando <span className="font-semibold text-gray-700">{products.length}</span> de{" "}
                <span className="font-semibold text-gray-700">{meta.totalItems}</span> salones
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
      </div>
      <MacDockModal
        isOpen={isOpen}
        onClose={closeModal}
        title={editingId ? "Actualizar Producto" : "Registrar Nuevo Producto"}
        size={"lg"}
      >
        <form
          ref={productFormReference}
          id="product-form"
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin pr-1"
        >
          {errorMsg && (
            <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4 border border-red-100">
              {errorMsg}
            </p>
          )}

          {/* Toggle de Activación / Visibilidad */}
          <div className="flex items-center justify-between p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
            <div className="flex flex-col">
              <span className="font-bold text-gray-700">Estado del Producto</span>
              <span className="text-gray-500 text-[11px]">
                {formData.isActive
                  ? "El producto está activo y visible en la tienda"
                  : "El producto está oculto / inactivado"}
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Nombre del Producto */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Zapatillas de Salsa Profesionales, Camiseta Academia..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
            />
          </div>

          {/* Categoría y Precios en Grid de 3 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Categoría */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Categoría
              </label>
              <select
                value={formData.categoryId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
              >
                <option value="">Seleccionar Categoría</option>
                {categories.map((category: ProductCategory) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio de Venta */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Precio de Venta ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.salePrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salePrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors font-bold text-purple-700"
              />
            </div>

            {/* Costo Base */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Costo Base ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={formData.cost || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cost: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors text-gray-600"
              />
            </div>
          </div>

          {/* Gestión de Inventario / Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50/80 rounded-lg border border-gray-100">
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Stock Actual
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentStock ?? 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentStock: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full p-2.5 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 rounded transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">
                Alerta de Stock Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={formData.minimumStockAlert ?? 1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumStockAlert: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full p-2.5 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 rounded transition-colors"
              />
            </div>
          </div>

          {/* Descripción del Producto */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">
              Descripción del Producto
            </label>
            <textarea
              placeholder="Detalles sobre material, tallas sugeridas, cuidados..."
              rows={3}
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2.5 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 rounded transition-colors"
            ></textarea>
          </div>

          {/* Sección: Galería de Imágenes */}
          <div className="border border-purple-100 bg-purple-50/10 p-3 sm:p-4 space-y-3 rounded-lg">
            <div>
              <label className="block text-gray-700 font-bold">Galería de Imágenes</label>
              <p className="text-[10px] text-gray-400">
                Sube hasta 10 fotos del producto en formato JPG, PNG o WEBP.
              </p>
            </div>

            {/* Grid adaptable de imágenes */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {/* Botón personalizado para seleccionar archivos */}
              <label className="h-20 sm:h-24 border border-dashed border-purple-200 bg-white hover:bg-purple-50/50 hover:border-purple-400 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer group rounded-lg">
                <ImagePlus className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium text-gray-500">Añadir foto</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* 1. RENDERIZADO DE IMÁGENES GUARDADAS EN EL SERVIDOR */}
              {(formData.existingImages || []).map((src, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative h-20 sm:h-24 border border-purple-100 bg-gray-50 group rounded-lg overflow-hidden"
                >
                  <img
                    src={src}
                    alt={`Guardada ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
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

              {/* 2. RENDERIZADO DE NUEVAS IMÁGENES SELECCIONADAS (BASE64) */}
              {(formData.images || []).map((img, index) => (
                <div
                  key={`new-${index}`}
                  className="relative h-20 sm:h-24 border border-purple-100 bg-gray-50 group rounded-lg overflow-hidden"
                >
                  <img
                    src={img.base64}
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

        {/* Botonera anclada al fondo */}
        <div className="pt-4 border-t border-purple-100 bg-purple-50/20 flex justify-between shrink-0">
          <button
            type="button"
            onClick={() => closeModal()}
            className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
          >
            {isSubmitting
              ? "Guardando..."
              : editingId
                ? "Actualizar Producto"
                : "Registrar Producto"}
          </button>
        </div>
      </MacDockModal>
      {/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeConfirmModal}
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
