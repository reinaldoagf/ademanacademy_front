// employee.ts

// 🏷️ Enums según schema.prisma
export type TypeOfContract = 'fixed' | 'temporary' | 'indefinite' | string; // Ajusta los valores a tu enum de Prisma
export type PayrollStatus = 'pending' | 'paid' | string; // Ajusta los valores a tu enum de Prisma

// 👔 Interfaz Principal del Empleado (Employee)
export interface Employee {
    id: string;
    dni?: string | null;
    firstName: string;
    lastName: string;
    birthDate: Date | string;
    typeOfContract: TypeOfContract;
    medicalObservations?: string | null;
    address: string;
    phone?: string | null;
    hoursTaughtMonth: number;
    hourlyRate: number; // En TypeScript / Frontend suele manejar los campos Decimal de Prisma como number o string
    bonus: number;
    payrollStatus: PayrollStatus;
    userId?: string | null;

    // Relaciones (opcionales según lo que traigas en tus includes)
    user?: any | null; // Puedes reemplazar 'any' por tu interfaz 'User'
    groups?: any[];    // Puedes reemplazar 'any' por tu interfaz 'Group'

    createdAt?: Date | string;
    updatedAt?: Date | string;
}

// 📦 DTO / Tipo para crear un nuevo Empleado (sin IDs ni timestamps)
export type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'user' | 'groups'>;

// ✏️ DTO / Tipo para actualizar un Empleado
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>;
export interface EmployeeFormData {
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    typeOfContract: TypeOfContract;
    hourlyRate: number;
    hoursTaughtMonth: number;
    bonus: number;
    birthDate: Date | string;
    address: string;
}
// 🔍 Parámetros de Búsqueda y Paginación
export interface FetchEmployeesParams {
    page?: number;
    limit?: number;
    search?: string;
    payrollStatus?: PayrollStatus;
    typeOfContract?: TypeOfContract;
}