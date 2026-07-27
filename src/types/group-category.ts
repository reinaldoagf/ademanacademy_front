export interface GroupCategory {
    id: string;
    name: string;
    minimumAge: number;
    maximumAge: number;
}

export interface FetchGroupCategoriesParams {
    page?: number;
    limit?: number;
    search?: string;
}

// 🎯 Definimos una interfaz limpia para los datos serializables
export interface SaveGroupCategoryPayload {
    name: string;
    minimumAge: number;
    maximumAge: number;
}