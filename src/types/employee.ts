// employee.ts

// 🏷️ Enums según schema.prisma
export type TypeOfContract = 'Fijo' | 'Por_Hora' | 'Por_Proyecto' | string; // Ajusta los valores a tu enum de Prisma
export type TypeOfEmployee = 'Administrativo' | 'Profesor' | 'Soporte' | 'Otro' | string; // Ajusta los valores a tu enum de Prisma
export type PayrollStatus = 'Pendiente' | 'Pagado' | string; // Ajusta los valores a tu enum de Prisma

// 👔 Interfaz Principal del Empleado (Employee)
export interface Employee {
    id: string;
    IDNumberPrefix?: string | null;
    dni?: string | null;
    firstName: string;
    lastName: string;
    birthDate: Date | string | null,
    typeOfContract: TypeOfContract;
    typeOfEmployee: TypeOfEmployee;
    medicalObservations?: string | null;
    address: string;
    countryCode?: string | null;
    phone?: string | null;
    baseSalary?: number | null;
    hoursTaughtMonth: number;
    hourlyRate: number;
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
    IDNumberPrefix: string;
    dni: string;
    countryCode: string;
    phone: string;
    typeOfContract: TypeOfContract;
    typeOfEmployee: TypeOfEmployee;
    hourlyRate: number;
    hoursTaughtMonth: number;
    baseSalary: number;
    birthDate: Date | string | null,
    address: string;
    userId?: string | null;
}
// 🔍 Parámetros de Búsqueda y Paginación
export interface FetchEmployeesParams {
    page?: number;
    limit?: number;
    search?: string;
    payrollStatus?: PayrollStatus;
    typeOfContract?: TypeOfContract;
}