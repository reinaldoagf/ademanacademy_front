// /src/types/product.ts
import { LucideIcon } from "lucide-react";
import { S3Image } from "./s3-image";

// 📦 Categoria básica para relación desplegable o select
export interface ProductCategory {
    id: string;
    name: string;
    description?: string | null;
}

// 🛒 Interfaz Principal del Producto (Coincide con Prisma / Modelo Frontend)
export interface Product {
    id: string;
    name: string;
    description?: string | null;
    salePrice: number;
    cost: number;
    currentStock: number;
    minimumStockAlert: number;
    images?: S3Image[];
    isActive: boolean;
    featured: boolean;
    categoryId?: string | null;
    category?: ProductCategory | null;
    createdAt?: string;
    updatedAt?: string;
}

// 🔍 Parámetros para filtros de búsqueda y paginación
export interface FetchProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: string | boolean;
    stockStatus?: 'all' | 'in_stock' | 'out_of_stock';
}
// Interfaz para el estado del formulario
export interface ProductFormData {
    name: string;
    description?: string;
    salePrice: number;
    cost: number;
    currentStock?: number;
    minimumStockAlert?: number;
    categoryId?: string;
    featured: boolean;
    isActive: boolean;
    images: S3Image[];
    existingImages: S3Image[];
}
// 🎯 Payload serializable para Crear / Editar Producto
export interface SaveProductPayload {
    name: string;
    description?: string;
    salePrice: number;
    cost: number;
    currentStock?: number;
    minimumStockAlert?: number;
    categoryId?: string;
    featured: boolean;
    isActive: boolean;
    images: S3Image[];
}

// 📊 Respuesta Paginada del Servidor
export interface ProductsPaginatedResponse {
    data: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// 🎴 Configuración de Cards de Estado / Métricas para el Dashboard de la Tienda
export interface ProductStatusCardConfig {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    iconBgClass: string;
    iconTextClass: string;
    unitLabel: string;
}