import {
    UsersIcon, ChartPie, Calendar, PersonStanding, HeartPulse, House,
    CalendarDays, UserPlus2, ReceiptText, Package, Wallet, Banknote,
    Contact, Shirt, ShoppingBag, Armchair, Star, Users2
} from 'lucide-react';
import { APP_KEYS } from './app-keys'; // Ajusta tu ruta

export interface MenuItem {
    key: string;
    name: string;
    href: string;
    icon?: any;
    children?: MenuItem[];
}

export const ADMIN_SYSTEM_MENU: MenuItem[] = [
    { key: APP_KEYS.USERS, name: 'Usuarios', href: '/admin/users', icon: UsersIcon },
];

export const ADMIN_ACADEMIC_MENU: MenuItem[] = [
    { key: APP_KEYS.DASHBOARD, name: 'Dashboard', href: '/admin/dashboard', icon: ChartPie },
    { key: APP_KEYS.SCHEDULE, name: 'Horario de Clases', href: '/admin/schedule', icon: Calendar },
    { key: APP_KEYS.CLIENTS, name: 'Clientes', href: '/admin/clients', icon: PersonStanding },
    { key: APP_KEYS.STUDENTS, name: 'Alumnos y Progreso', href: '/admin/students', icon: HeartPulse },
    { key: APP_KEYS.CLASSROOMS, name: 'Salones de Clases', href: '/admin/classrooms', icon: House },
    {
        key: APP_KEYS.GROUPS, name: 'Grupos de Clases', href: '/admin/groups', icon: CalendarDays,
        children: [
            { key: APP_KEYS.GROUPS_CATEGORIES, name: 'Categorías', href: '/admin/groups/categories' },
            { key: APP_KEYS.GROUPS_LIST, name: 'Lista de Grupos', href: '/admin/groups/list' },
        ]
    },
    { key: APP_KEYS.REGISTRATIONS, name: 'Inscripciones', href: '/admin/registrations', icon: UserPlus2 },
];

export const ADMIN_OPERATIONAL_MENU: MenuItem[] = [
    { key: APP_KEYS.ORDERS, name: 'Pedidos', href: '/admin/orders', icon: ReceiptText },
    { key: APP_KEYS.PAYMENT_ORDERS, name: 'Órdenes de Pago', href: '/admin/payment-orders', icon: Package },
    { key: APP_KEYS.PAYMENTS, name: 'Caja y Pagos', href: '/admin/payments', icon: Wallet },
    { key: APP_KEYS.ACCOUNTS_PAYABLE, name: 'Cuentas por Pagar', href: '/admin/accounts-payable', icon: Banknote },
    { key: APP_KEYS.EMPLOYEES, name: 'Empleados y Nómina', href: '/admin/employees', icon: Contact },
    {
        key: APP_KEYS.WARDROBE, name: 'Vestuarios y Uniformes', href: '/admin/costumes', icon: Shirt,
        children: [
            { key: APP_KEYS.WARDROBE_COSTUMES, name: 'Vestuarios', href: '/admin/wardrobe/costumes' },
            { key: APP_KEYS.WARDROBE_UNIFORMS, name: 'Uniformes', href: '/admin/wardrobe/uniforms' },
        ]
    },
    {
        key: APP_KEYS.STORE, name: 'Tienda e Inventario', href: '/admin/store', icon: ShoppingBag,
        children: [
            { key: APP_KEYS.STORE_CATEGORIES, name: 'Categorías', href: '/admin/store/categories' },
            { key: APP_KEYS.STORE_PRODUCTS, name: 'Productos', href: '/admin/store/products' },
        ]
    },
];

export const ADMIN_MARKETING_MENU: MenuItem[] = [
    { key: APP_KEYS.SEATING_CHARTS, name: 'Mapas de asientos', href: '/admin/seating-charts', icon: Armchair },
    { key: APP_KEYS.EVENTS, name: 'Eventos Especiales', href: '/admin/events', icon: Star },
];

export const CLIENT_PERSONAL_MENU: MenuItem[] = [
    { key: APP_KEYS.DASHBOARD, name: 'Dashboard', href: '/client/dashboard', icon: ChartPie },
    { key: APP_KEYS.MY_AFFILIATES, name: 'Mis Afiliaciones', href: '/client/my-affiliates', icon: Users2 },
    { key: APP_KEYS.CLASSES, name: 'Mis Clases', href: '/client/classes', icon: CalendarDays },
    { key: APP_KEYS.MY_PAYMENTS, name: 'Mis Pagos', href: '/client/payments', icon: Wallet },
    { key: APP_KEYS.MY_PAYMENT_ORDERS, name: 'Mis Órdenes de Pago', href: '/client/payment-orders', icon: Package },
    { key: APP_KEYS.MY_UNIFORMS, name: 'Mis Uniformes', href: '/client/uniforms', icon: Shirt },
    { key: APP_KEYS.EVENTS, name: 'Mis Eventos', href: '/client/events', icon: Star },
    { key: APP_KEYS.STORE, name: 'Mi Tienda', href: '/client/store', icon: ShoppingBag },
];