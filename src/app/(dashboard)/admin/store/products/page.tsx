// src/app/(dashboard)/store/products/page.tsx
"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import HeroSection from "@/components/layout/HeroSection";
import { MacDockModal } from "@/components/ui/MacDockModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { ProductCard } from "@/components/ProductCard";
import {
  Search,
  Plus,
  ShoppingBag,
  PackageCheck,
  AlertCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { Product, SaveProductPayload, ProductFormData } from "@/types/product";
import { ProductCategory } from "@/types/product-category";
import { S3Image } from "@/types/s3-image";
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
import { TextInput, TextArea, SelectInput, ImageGalleryPicker, ToggleSwitch } from '@/components/ui/forms';
import { useSidebarStore } from "@/store/useSidebarStore";
import { uploadFileToS3 } from "@/helpers/s3";
import { deleteS3Image } from "@/app/actions/s3";
import { APP_KEYS } from "@/config/app-keys";

// Estado inicial limpio del formulario para Empleados
const initialFormState: ProductFormData = {
  name: "",
  description: "",
  salePrice: 0,
  cost: 0,
  currentStock: 1,
  minimumStockAlert: 1,
  categoryId: "",
  isActive: true,
  featured: true,
  images: [],
  existingImages: [],
};
export default function ProductsPage() {
  const setBadge = useSidebarStore((state) => state.setBadge);
  const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";
  const productFormReference = useRef<HTMLFormElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const { isOpen, openModal, closeModal } = useModal();
  const orderCreatedFlag = useCartStore((state) => state.orderCreatedFlag);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Definición del estado del formulario
  const [formData, setFormData] = useState<ProductFormData>(initialFormState);
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
  const [newFiles, setNewFiles] = useState<File[]>([]);
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
        setNewFiles([]);
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
    setNewFiles([]);

    // 1. Procesamos las imágenes primero
    let imagesParsed: any[] = [];
    let formattedImages: S3Image[] = [];

    try {
      if (typeof product.images === 'string') {
        imagesParsed = JSON.parse(product.images);
      } else if (Array.isArray(product.images)) {
        imagesParsed = product.images;
      }

      const cleanBackendUrl = backendUrl.replace(/\/$/, '');

      // 1. Mapeamos y limpiamos las imágenes
      const mappedImages = imagesParsed
        .map((img: any): S3Image | null => {
          if (!img) return null;

          const path = typeof img === 'object' ? img.url || img.path : img;

          if (!path || typeof path !== 'string') return null;

          const fullUrl =
            path.startsWith('http://') || path.startsWith('https://')
              ? path
              : `${cleanBackendUrl}${path.startsWith('/') ? path : `/${path}`}`;

          return {
            url: fullUrl,
            key: typeof img === 'object' ? img.key || '' : '',
            altText: typeof img === 'object' ? img.altText || '' : '',
            type: typeof img === 'object' ? img.type || 'cover' : 'cover',
            order: typeof img === 'object' ? img.order ?? 0 : 0,
          };
        })
        .filter((img): img is S3Image => img !== null);

      // 2. DESDUPLICAR mediante un Set basándonos en la identificador único (url o key)
      const seen = new Set<string>();
      formattedImages = mappedImages.filter((img) => {
        const identifier = img.key ? img.key : img.url;
        if (seen.has(identifier)) {
          return false; // Es duplicada, la ignoramos
        }
        seen.add(identifier);
        return true;
      });

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
      featured: product.featured ?? true,
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
  const handleRemoveExisting = async (image: S3Image, index: number) => {
    const imageToRemove = formData.existingImages![index];
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages?.filter((_, i) => i !== index),
    }));
    // 2. Eliminar el archivo físico de S3 y DB
    const response = await deleteS3Image(imageToRemove.key);

    if (!response.success) {
      toast.error('Ocurrió un error al borrar la imagen en S3');
      // Revertir cambios en el estado si falló
      setFormData((prev) => ({
        ...prev,
        existingImages: [...prev.existingImages, imageToRemove],
      }));
    }
  };

  // Manejo de inserción de nuevo salón
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      try {
        // 1. Subir archivos nuevos a S3
        const newlyUploadedImages = await Promise.all(
          newFiles.map((file) => uploadFileToS3(file))
        );

        // 2. Unificar y DESDUPLICAR las imágenes finales
        const combinedImages: S3Image[] = [
          ...formData.existingImages,
          ...newlyUploadedImages,
        ];

        const seenUrlsOrKeys = new Set<string>();
        const finalImages = combinedImages.filter((img) => {
          // Usamos key como identificador prioritario, si no existe usamos url
          const identifier = img.key && img.key.trim() !== '' ? img.key : img.url;

          if (!identifier || seenUrlsOrKeys.has(identifier)) {
            return false;
          }
          seenUrlsOrKeys.add(identifier);
          return true;
        });
        const payload: SaveProductPayload = {
          name: formData.name,
          description: formData.description,
          salePrice: formData.salePrice,
          cost: formData.cost,
          currentStock: formData.currentStock,
          minimumStockAlert: formData.minimumStockAlert,
          categoryId: formData.categoryId,
          featured: formData.featured,
          isActive: formData.isActive,
          images: finalImages,
        };

        const res = await saveProductAction(payload, editingId);
        if (!res.success) {
          setErrorMsg(res.error || "Ocurrió un error.");
          return;
        }
        toast.success("Operación exitosa");
        fetchData(currentPage, itemsPerPage);
        // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
        closeModal();
      } catch (error) {
        setErrorMsg("Ocurrió un error al procesar las imágenes seleccionadas.");
        console.error(error);
      }
    });
  };
  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
    window.dispatchEvent(new Event(APP_KEYS.REFRESH_PRODUCTS_COUNT));
    startTransition(async () => {
      const res1 = await getAllProductsAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
        ...(isActiveFilter !== "all" ? { isActive: isActiveFilter } : {}),
        // 🎯 Enviamos el stockStatus solo si es distinto de "all"
        ...(stockFilter !== "all" ? { stockStatus: stockFilter } : {}),
      });
      if (res1.success && res1.data) {
        setProducts(res1.data);
        setMeta(res1.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
        if (res1.meta?.totalItems !== undefined) {
          setBadge(APP_KEYS.PRODUCTS, res1.meta.totalItems);
        }
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
  }, [searchTerm, isActiveFilter, stockFilter, currentPage, itemsPerPage]);
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

          {/* FILTROS DE PRODUCTOS */}
          <div className="glass-card p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">

            {/* Buscador */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código o descripción de producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 font-questrial border border-purple-100 text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-end">

              {/* 🎯 RADIO GROUP PARA STOCK */}
              <div className="flex items-center gap-1 bg-gray-50/80 p-1 border border-purple-100 rounded-md text-xs font-questrial">
                <span className="text-gray-500 font-medium px-2 text-[11px]">Stock:</span>

                <label className={`cursor-pointer px-2.5 py-1 rounded transition-colors select-none ${stockFilter === "all"
                  ? "gradient-purple text-white font-medium shadow-xs"
                  : "text-gray-600 hover:text-purple-700"
                  }`}>
                  <input
                    type="radio"
                    name="stockFilter"
                    value="all"
                    checked={stockFilter === "all"}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="sr-only"
                  />
                  Todos
                </label>

                <label className={`cursor-pointer px-2.5 py-1 rounded transition-colors select-none ${stockFilter === "in_stock"
                  ? "gradient-purple text-white font-medium shadow-xs"
                  : "text-gray-600 hover:text-purple-700"
                  }`}>
                  <input
                    type="radio"
                    name="stockFilter"
                    value="in_stock"
                    checked={stockFilter === "in_stock"}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="sr-only"
                  />
                  Con Stock
                </label>

                <label className={`cursor-pointer px-2.5 py-1 rounded transition-colors select-none ${stockFilter === "out_of_stock"
                  ? "gradient-purple text-white font-medium shadow-xs"
                  : "text-gray-600 hover:text-purple-700"
                  }`}>
                  <input
                    type="radio"
                    name="stockFilter"
                    value="out_of_stock"
                    checked={stockFilter === "out_of_stock"}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="sr-only"
                  />
                  Sin Stock
                </label>
              </div>

              {/* Filtro de Activo/Inactivo */}
              <div className="flex items-center gap-1 bg-gray-50/80 p-1 border border-purple-100 rounded-md text-xs font-questrial">
                <span className="text-gray-500 font-medium px-2 text-[11px]">Status:</span>

                <label className={`cursor-pointer px-2.5 py-1 rounded transition-colors select-none ${isActiveFilter === "all"
                  ? "gradient-purple text-white font-medium shadow-xs"
                  : "text-gray-600 hover:text-purple-700"
                  }`}>
                  <input
                    type="radio"
                    name="isActiveFilter"
                    value="all"
                    checked={isActiveFilter === "all"}
                    onChange={(e) => setIsActiveFilter(e.target.value as any)}
                    className="sr-only"
                  />
                  Todos
                </label>

                <label className={`cursor-pointer px-2.5 py-1 rounded transition-colors select-none ${isActiveFilter === "true"
                  ? "gradient-purple text-white font-medium shadow-xs"
                  : "text-gray-600 hover:text-purple-700"
                  }`}>
                  <input
                    type="radio"
                    name="isActiveFilter"
                    value="true"
                    checked={isActiveFilter === "true"}
                    onChange={(e) => setIsActiveFilter(e.target.value as any)}
                    className="sr-only"
                  />
                  Activos
                </label>

                <label className={`cursor-pointer px-2.5 py-1 rounded transition-colors select-none ${isActiveFilter === "false"
                  ? "gradient-purple text-white font-medium shadow-xs"
                  : "text-gray-600 hover:text-purple-700"
                  }`}>
                  <input
                    type="radio"
                    name="isActiveFilter"
                    value="false"
                    checked={isActiveFilter === "false"}
                    onChange={(e) => setIsActiveFilter(e.target.value as any)}
                    className="sr-only"
                  />
                  No Activos
                </label>
              </div>

            </div>
          </div>


          {/* GRILLA DE CATÁLOGO / PRODUCTOS */}

          {products.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                backendUrl={backendUrl}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>) : (
            <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
              <ShoppingBag className="w-10 h-10 text-purple-200 mx-auto mb-3" />
              <p className="font-questrial text-xs text-gray-400">
                {isPending ? "Sincronizando..." : "Ningún ítem coincide con los criterios de búsqueda comerciales."}
              </p>
            </div>
          )}


          {/* Seccion de Paginación */}
          {meta.totalPages > 1 && (
            <div className="glass-card p-4 flex flex-col sm:flex-row items-center justify-center gap-6 border border-purple-50/60 shadow-xs">
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
        size={"2xl"}
      >
        <form
          ref={productFormReference}
          id="product-form"
          onSubmit={handleSave}
          className="flex-1 overflow-y-auto space-y-4 font-questrial text-xs scrollbar-thin"
        >
          {errorMsg && (
            <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4 border border-red-100">
              {errorMsg}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Toggle de Activación / Visibilidad */}
            <ToggleSwitch
              label="Estado del Producto"
              description={formData.isActive
                ? "El producto está activo y visible en la tienda"
                : "El producto está oculto / inactivado"}
              checked={formData.isActive}
              onChange={(active) => setFormData({ ...formData, isActive: active })}
            />

            <ToggleSwitch
              label="Destacar producto"
              description={formData.featured
                ? "El producto está activo y visible en la tienda"
                : "El producto está oculto / inactivado"}
              checked={formData.featured}
              onChange={(active) => setFormData({ ...formData, featured: active })}
            />
          </div>
          {/* Nombre del Producto */}
          <TextInput
            label="Nombre del Producto *"
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Zapatillas de Salsa Profesionales, Camiseta Academia..."
          />


          {/* Categoría y Precios en Grid de 3 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Categoría */}
            <SelectInput
              label="Categoría"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value as string })}
              options={[
                { label: "Selecciona una Categoría", value: "", disabled: true },
                ...categories.map((c: ProductCategory) => ({
                  label: `${c.name}`,
                  value: c.id
                }))
              ]}
            />


            {/* Precio de Venta */}
            <TextInput
              label="Precio de Venta ($) *"
              type="number"
              step="0.01"
              required
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />


            {/* Costo Base */}
            <TextInput
              label="Costo Base ($) *"
              type="number"
              step="0.01"
              required
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />

          </div>

          {/* Gestión de Inventario / Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-50/80 rounded-lg border border-gray-100">
            <TextInput
              label="Stock Actual"
              type="number"
              min="0"
              value={formData.currentStock ?? 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentStock: parseInt(e.target.value, 10) || 0,
                })
              }
              placeholder="0.00"
            />


            <TextInput
              label="Alerta de Stock Mínimo"
              type="number"
              min="0"
              value={formData.minimumStockAlert ?? 1}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimumStockAlert: parseInt(e.target.value, 10) || 0,
                })
              }
              placeholder="0.00"
            />
          </div>

          {/* Descripción del Producto */}
          <TextArea
            label="Descripción del Producto"
            placeholder="Detalles sobre material, tallas sugeridas, cuidados..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />


          {/* Sección: Galería de Imágenes */}
          <div className="border border-purple-100 bg-purple-50/10 p-3 sm:p-4 space-y-3 rounded-lg">
            <div>
              <label className="block text-gray-700 font-bold">Galería de Imágenes</label>
              <p className="text-[10px] text-gray-400">
                Sube hasta 10 fotos del producto en formato JPG, PNG o WEBP.
              </p>
            </div>

            {/* Grid adaptable de imágenes */}
            <ImageGalleryPicker
              label="Fotografías del Producto"
              existingImages={formData.existingImages || []}
              onRemoveExistingImage={handleRemoveExisting}
              files={newFiles}
              onFilesChange={setNewFiles}
              buttonText="Añadir foto"
            />

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
            disabled={isPending}
            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
          >
            {isPending
              ? "Guardando..."
              : editingId
                ? "Actualizar Producto"
                : "Registrar Producto"}
          </button>
        </div>
      </MacDockModal >
      {/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
      < ConfirmationModal
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
