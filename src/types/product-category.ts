
import { Product } from "@/types/product";
export interface ProductCategory {
    id: string;
    name: string;
    products?: Product[];
    createdAt: string;
    updatedAt: string;
}


// DTOs para formularios y peticiones HTTP
export type CreateProductCategoryDto = Pick<ProductCategory, 'name'>;

export type UpdateProductCategoryDto = Partial<CreateProductCategoryDto>;

// 🔍 Parámetros para filtros de búsqueda y paginación
export interface FetchProductCategoriesParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean | string;
}

// 🎯 Payload serializable para Crear / Editar Categoria de Producto
export interface SaveProductCategoryPayload {
    name: string;
    description?: string;
    salePrice: number;
    cost: number;
    currentStock?: number;
    minimumStockAlert?: number;
    categoryId?: string;
    isActive?: boolean;
    images?: { name: string; type: string; base64: string }[];
    existingImages?: string[];
}
export interface ProductCategoryFormData {
    name: string;
}