// src/components/layout/Sidebar.tsx
"use client";

import { useEffect, useState, useCallback, ForwardRefExoticComponent, RefAttributes } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import {
  getAllUsersAction,
} from "@/app/actions/user";
import {
  getAllClassroomsAction,
} from "@/app/actions/classroom";
import {
  getMyRepresentedAction,
  getAllStudentsAction
} from "@/app/actions/student";
import {
  getAllGroupsAction,
} from "@/app/actions/group";
import { getAllTransactionsAction } from "@/app/actions/transaction";
import { getAllPaymentOrdersAction } from "@/app/actions/payment-order";
import { getAllCostumesAction } from "@/app/actions/costume";
import { getAllEmployeesAction } from "@/app/actions/employee";
import { getAllUniformsAction } from "@/app/actions/uniform";
import {
  getAllProductCategoriesAction,
} from "@/app/actions/product-category";
import {
  getAllProductsAction,
} from "@/app/actions/product";

import {
  ChartPie,
  HeartPulse,
  ChevronDown,
  CalendarDays,
  ReceiptText,
  Package,
  Banknote,
  Wallet,
  Contact,
  Shirt,
  ShoppingBag,
  Armchair,
  Star,
  UserPlus,
  Users2,
  UsersIcon,
  Calendar,
  House,
  UserPlus2,
  LucideProps
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

// 1. Definición explícita de la estructura de ítems del Sidebar
export interface SidebarMenuItem {
  key: string;
  name: string;
  href: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  badge?: number;
  children?: SidebarMenuItem[];
}
const updateBadgeInItems = (
  items: SidebarMenuItem[],
  targetKey: string,
  badgeValue: number,
  parentKey?: string
): SidebarMenuItem[] => {
  return items.map((item) => {
    // Si buscamos actualizar un item raíz
    if (!parentKey && item.key === targetKey) {
      return { ...item, badge: badgeValue };
    }

    // Si buscamos actualizar un hijo dentro de un padre específico
    if (parentKey && item.key === parentKey) {
      const updatedChildren = item.children?.map((child) =>
        child.key === targetKey ? { ...child, badge: badgeValue } : child
      );

      // Recalcular el badge del padre sumando los de sus hijos
      const totalParentBadge = updatedChildren?.reduce(
        (acc, curr) => acc + (Number(curr.badge) || 0),
        0
      );

      return {
        ...item,
        badge: totalParentBadge ?? badgeValue,
        children: updatedChildren,
      };
    }

    return item;
  });
};
export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  // Secciones modulares del software (Administrador)
  const [systemAdministration, setSystemAdministration] = useState<SidebarMenuItem[]>([
    { key: 'users', name: 'Usuarios', href: '/admin/users', icon: UsersIcon, badge: 0 },
  ]);

  const [academicManagement, setAcademicManagement] = useState<SidebarMenuItem[]>([
    { key: 'dashboard', name: 'Dashboard', href: '/admin/dashboard', icon: ChartPie },
    { key: 'schedule', name: 'Horario de Clases', href: '/admin/schedule', icon: Calendar },
    { key: 'students', name: 'Alumnos y Progreso', href: '/admin/students', icon: HeartPulse, badge: 0 },
    { key: 'classrooms', name: 'Salones de Clases', href: '/admin/classrooms', icon: House, badge: 0 },
    {
      key: 'groups', name: 'Grupos de Clases', href: '/admin/groups', icon: CalendarDays,
      // 🎯 Submenú añadido
      children: [
        { key: 'groups-categories', name: 'Categorías', href: '/admin/groups/categories' },
        { key: 'groups-list', name: 'Lista de Grupos', href: '/admin/groups/list', badge: 0 },
      ]
    },
    { key: 'registrations', name: 'Inscripciones', href: '/admin/registrations', icon: UserPlus2 },
  ]);

  const [operationalManagement, setOperationalManagement] = useState<SidebarMenuItem[]>([
    { key: 'orders', name: 'Pedidos', href: '/admin/orders', icon: ReceiptText, badge: 0 },
    { key: 'payment-orders', name: 'Órdenes de Pago', href: '/admin/payment-orders', icon: Package, badge: 0 },
    { key: 'accounts-payable', name: 'Cuentas por Pagar', href: '/admin/accounts-payable', icon: Banknote },
    { key: 'payments', name: 'Caja y Pagos', href: '/admin/payments', icon: Wallet, badge: 0 },
    { key: 'employees', name: 'Empleados y Nómina', href: '/admin/employees', icon: Contact, badge: 0 },
    {
      key: 'wardrobe', name: 'Vestuarios y Uniformes', href: '/admin/costumes', icon: Shirt,
      // 🎯 Submenú añadido
      children: [
        { key: 'wardrobe-costumes', name: 'Vestuarios', href: '/admin/wardrobe/costumes', badge: 0 },
        { key: 'wardrobe-uniforms', name: 'Uniformes', href: '/admin/wardrobe/uniforms', badge: 0 },
      ]
    },
    {
      key: 'store', name: 'Tienda e Inventario', href: '/admin/store', icon: ShoppingBag,
      // 🎯 Submenú añadido
      children: [
        { key: 'store-categories', name: 'Categorías', href: '/admin/store/categories', badge: 0 },
        { key: 'store-products', name: 'Productos', href: '/admin/store/products', badge: 0 },
      ]
    },
  ]);

  const marketingEventos = [
    { key: '', name: 'Mapas de asientos', href: '/admin/mapas-de-asientos', icon: Armchair, badge: 3 },
    { key: '', name: 'Eventos Especiales', href: '/admin/eventos', icon: Star, badge: 4 },
    { key: '', name: 'Preinscripciones', href: '/admin/preinscripciones', icon: UserPlus, badge: 8 },
  ];

  const [personalManagement, setPersonalManagement] = useState([
    { key: '', name: 'Dashboard', href: '/client/dashboard', icon: ChartPie },
    { key: 'represented', name: 'Representados', href: '/client/represented', icon: Users2, badge: 0 }, // 👈 Inicializamos en 0
    { key: '', name: 'Mis Clases', href: '/client/classes', icon: CalendarDays },
    { key: 'payments', name: 'Mis Pagos', href: '/client/payments', icon: Wallet },
    { key: '', name: 'Mis Vestuarios', href: '/client/clothing', icon: Shirt },
    { key: '', name: 'Eventos', href: '/client/events', icon: Star, badge: 4 }, // Tu otro badge estático
  ]);

  const fetchBadge = useCallback(
    async (
      actionFn: (params: any) => Promise<any>,
      targetKey: string,
      parentKey?: string
    ) => {
      try {
        const res = await actionFn({ page: 1, limit: 1 });
        console.log({
          targetKey,
          res
        })
        if (res?.success && res?.meta?.totalItems !== undefined) {
          const total = res.meta.totalItems;
          setSystemAdministration((prev: any) =>
            updateBadgeInItems(prev, targetKey, total, parentKey)
          );
          setAcademicManagement((prev: any) =>
            updateBadgeInItems(prev, targetKey, total, parentKey)
          );
          setOperationalManagement((prev: any) =>
            updateBadgeInItems(prev, targetKey, total, parentKey)
          );
        }
      } catch (error) {
        console.error(`Error al actualizar badge para [${targetKey}]:`, error);
      }
    },
    []
  );

  // 3. Configuración centralizada de badges y sus eventos
  const badgeConfigs = [
    { event: "refresh-users-count", action: getAllUsersAction, key: "users" },
    { event: "refresh-students-count", action: getAllStudentsAction, key: "students" },
    { event: "refresh-classrooms-count", action: getAllClassroomsAction, key: "classrooms" },
    { event: "refresh-payments-count", action: getAllTransactionsAction, key: "payments" },
    { event: "refresh-employees-count", action: getAllEmployeesAction, key: "employees" },
    { event: "refresh-payment-orders-count", action: getAllPaymentOrdersAction, key: "payment-orders" },
    // Submódulos (hijos)
    { event: "refresh-groups-count", action: getAllGroupsAction, key: "groups-list", parentKey: "groups" },
    { event: "refresh-costumes-count", action: getAllCostumesAction, key: "wardrobe-costumes", parentKey: "wardrobe" },
    { event: "refresh-uniforms-count", action: getAllUniformsAction, key: "wardrobe-uniforms", parentKey: "wardrobe" },
    { event: "refresh-products-count", action: getAllProductsAction, key: "store-products", parentKey: "store" },
    { event: "refresh-product-categories-count", action: getAllProductCategoriesAction, key: "store-categories", parentKey: "store" },
  ];

  // Función auxiliar para renderizar los enlaces y reutilizar los estilos
  // Función auxiliar para renderizar enlaces simples o padres con submenús
  const renderLink = (item: any) => {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isSubmenuOpen = openSubmenus[item.key];

    // Un elemento hijo está activo si su href coincide exactamente
    const isChildActive = hasChildren && item.children.some((child: any) => pathname === child.href);
    const isActive = pathname === item.href || isChildActive;

    // Si tiene hijos, renderizamos el botón desplegable con la lista de subrutas
    if (hasChildren) {
      return (
        <div key={item.key} className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleSubmenu(item.key)}
            className={`font-questrial flex items-center justify-between px-4 py-2.5 text-sm font-medium transition group relative w-full ${isActive
              ? 'border-l-4 border-l-[#5e0472] bg-purple-50 text-[#5e0472]'
              : 'text-gray-400 hover:bg-purple-50 hover:text-[#5e0472]'
              } ${!isOpen && 'md:justify-center md:px-0 md:h-11'}`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 shrink-0" />
              <span className={`transition-all duration-200 ${!isOpen ? 'md:hidden' : ''}`}>
                {item.name}
              </span>
            </div>

            <div className={`flex items-center gap-1 ${!isOpen ? 'md:hidden' : ''}`}>
              {!hasChildren && item.badge !== undefined && (
                <span className={`text-[10px] font-bold px-2 py-0.5 shrink-0 ${isActive ? 'bg-purple-200 text-purple-800' : 'bg-purple-200 text-[#6e0372]'
                  }`}>
                  {item.badge}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180 text-[#5e0472]' : 'text-gray-400'
                  }`}
              />
            </div>

            {!isOpen && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden md:block z-50 whitespace-nowrap">
                {item.name}
              </div>
            )}
          </button>

          {/* Submenú desplegable (se oculta cuando el sidebar se colapsa en vista md) */}
          {isSubmenuOpen && (
            <div className={`flex flex-col pl-9 pr-2 space-y-1 my-1 ${!isOpen ? 'md:hidden' : ''}`}>
              {item.children.map((child: any) => {
                const isSubActive = pathname === child.href;
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`font-questrial text-xs font-medium py-1.5 px-3 transition flex items-center justify-between ${isSubActive
                      ? 'bg-[#5e0472] text-white font-semibold'
                      : 'text-gray-500 hover:bg-purple-100 hover:text-[#5e0472]'
                      }`}
                  >

                    <div className="flex items-center gap-3">
                      {child.name}
                    </div>
                    {child.badge !== undefined && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 shrink-0 ${isActive ? 'bg-purple-200 text-purple-800' : 'bg-purple-200 text-[#6e0372]'
                        }`}>
                        {child.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Renderizado estándar para ítems sin submenú
    return (
      <Link
        key={item.href || item.key}
        href={item.href || '#'}
        className={`font-questrial flex items-center justify-between px-4 py-2.5 text-sm font-medium transition group relative ${isActive
          ? 'border-l-4 border-l-[#5e0472] bg-purple-100 text-[#5e0472]'
          : 'text-gray-400 hover:bg-purple-50 hover:text-[#5e0472]'
          } ${!isOpen && 'md:justify-center md:px-0 md:h-11'}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 shrink-0" />
          <span className={`transition-all duration-200 ${!isOpen ? 'md:hidden' : ''}`}>
            {item.name}
          </span>
        </div>

        {item.badge !== undefined && (
          <span className={`
            text-[10px] font-bold px-2 py-0.5 shrink-0
            ${isActive ? 'bg-purple-200 text-purple-800' : 'bg-purple-200 text-[#6e0372]'}
            ${!isOpen ? 'md:absolute md:top-1.5 md:right-1.5 md:px-1 md:min-w-[15px] md:h-4 md:flex md:items-center md:justify-center md:text-[9px]' : ''}
          `}>
            {item.badge}
          </span>
        )}

        {!isOpen && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden md:block z-50 whitespace-nowrap">
            {item.name}
          </div>
        )}
      </Link>
    );
  };

  // Determinamos qué paneles mostrar basándonos en la ruta actual
  const isAdminView = pathname.startsWith('/admin') && user?.isAdmin;
  const isClientView = pathname.startsWith('/client');

  useEffect(() => {
    if (!isAdminView) return;

    // A. Función para refrescar todos los badges en paralelo al inicio
    const fetchAllBadges = () => {
      Promise.all(
        badgeConfigs.map((cfg) => fetchBadge(cfg.action, cfg.key, cfg.parentKey))
      );
    };

    fetchAllBadges();

    // B. Mapeo dinámico de Listeners para Custom Events
    const handlers = badgeConfigs.map((cfg) => {
      const handler = () => fetchBadge(cfg.action, cfg.key, cfg.parentKey);
      window.addEventListener(cfg.event, handler);
      return { event: cfg.event, handler };
    });

    // C. Limpieza automática y libre de bugs
    return () => {
      handlers.forEach(({ event, handler }) => {
        window.removeEventListener(event, handler);
      });
    };
  }, [isAdminView, fetchBadge]);

  // useEffect para cargar la data real al montar el Sidebar por primera vez
  /* useEffect(() => {
    if (isClientView) {
      // Cargamos al inicio
      fetchRepresentedBadgeCount();

      // 2️⃣ Escuchamos el evento global de actualización
      window.addEventListener('refresh-represented-count', fetchRepresentedBadgeCount);
    }

    // Limpieza al desmontar el componente para evitar fugas de memoria
    return () => {
      window.removeEventListener('refresh-represented-count', fetchRepresentedBadgeCount);
    };
  }, [isClientView]); */
  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  // Abrir automáticamente el submenú si la ruta actual coincide con alguna de sus subrutas
  useEffect(() => {
    if (pathname.startsWith('/admin/groups')) {
      setOpenSubmenus((prev) => ({ ...prev, groups: true }));
    }
  }, [pathname]);
  return (
    <aside className={`
      bg-white/80 backdrop-blur-md flex flex-col justify-between border-r border-purple-100 
      fixed md:static inset-y-0 left-0 z-40 transition-all duration-300 h-vh overflow-y-none
      ${isOpen
        ? 'w-64 translate-x-0'
        : '-translate-x-full md:translate-x-0 md:w-16'
      }
    `}>
      <div className="space-y-6">

        {/* 1️⃣ VISTA DE ADMINISTRADOR */}
        {isAdminView && (
          <>
            {/* BLOQUE 1: ACADÉMICO */}
            <div className="space-y-1">
              <div className="px-4 pt-4">
                <p className={`text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-widest transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden'}`}>
                  Academia
                </p>
              </div>
              {academicManagement.map(renderLink)}
            </div>
            {/* BLOQUE 2: SISTEMA */}
            <div className="space-y-1">
              <p className={`text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-widest px-4 mb-2 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden'}`}>
                Sistema
              </p>
              {systemAdministration.map(renderLink)}
            </div>

            {/* BLOQUE 3: OPERACIONES */}
            <div className="space-y-1">
              <p className={`text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-widest px-4 mb-2 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden'}`}>
                Finanzas y Logística
              </p>
              {operationalManagement.map(renderLink)}
            </div>

            {/* BLOQUE 4: CRECIMIENTO */}
            <div className="space-y-1">
              <p className={`text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-widest px-4 mb-2 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden'}`}>
                Eventos y Leads
              </p>
              {marketingEventos.map(renderLink)}
            </div>
          </>
        )}

        {/* 2️⃣ VISTA DE CLIENTE / ALUMNO */}
        {isClientView && (
          <div className="space-y-1">
            <div className="px-4 pt-4">
              <p className={`text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-widest transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden'}`}>
                Mi Cuenta
              </p>
            </div>
            {personalManagement.map(renderLink)}
          </div>
        )}

      </div>

    </aside>
  );
}