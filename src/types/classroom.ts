export interface Classroom {
    id: string;
    name: string;
    address: string;
    maxCapacity: number;
    type: string;
    status: string;
    description?: string;
}

export interface FetchClassroomsParams {
    page?: number;
    limit?: number;
    search?: string;
}