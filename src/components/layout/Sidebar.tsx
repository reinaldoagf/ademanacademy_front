// src/components/layout/Sidebar.tsx
"use client";

import { useEffect, useState, ForwardRefExoticComponent, RefAttributes } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  LucideProps,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useBadgeStore } from '@/store/useBadgeStore';
import {
  ADMIN_SYSTEM_MENU,
  ADMIN_ACADEMIC_MENU,
  ADMIN_OPERATIONAL_MENU,
  ADMIN_MARKETING_MENU,
  CLIENT_PERSONAL_MENU,
  MenuItem
} from "@/config/sidebar-menu";
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

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  // Determinamos qué paneles mostrar basándonos en la ruta actual
  const isAdminView = pathname.startsWith('/admin') && user?.isAdmin;
  const isClientView = pathname.startsWith('/client');
  const orderCreatedFlag = useCartStore((state) => state.orderCreatedFlag);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const { badges, fetchBadges } = useBadgeStore();
  // Función recursiva o helper para renderizar un item e inyectar su badge
  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isSubmenuOpen = openSubmenus[item.key];

    // Cálculo dinámico de Badges mediante Zustand
    const childBadgeSum = item.children?.reduce((acc, child) => acc + (badges[child.key] || 0), 0) || 0;
    const badgeCount = badges[item.key] ?? (hasChildren ? childBadgeSum : 0);

    // Verificación de estado activo (Link actual o uno de sus hijos activos)
    const isChildActive = hasChildren && item.children?.some((child) => pathname === child.href);
    const isActive = pathname === item.href || isChildActive;

    // 1. Ítem con submenú desplegable
    if (hasChildren) {
      return (
        <div key={item.key} className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleSubmenu(item.key)}
            className={`font-questrial flex items-center justify-between cursor-pointer px-4 py-2.5 text-sm font-medium transition group relative w-full ${isActive
              ? 'border-l-4 border-l-[#5e0472] bg-purple-50 text-[#5e0472]'
              : 'text-gray-400 hover:bg-purple-50 hover:text-[#5e0472]'
              } ${!isOpen ? 'md:justify-center md:px-0 md:h-11' : ''}`}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-5 h-5 shrink-0" />}
              <span className={`transition-all duration-200 ${!isOpen ? 'md:hidden' : ''}`}>
                {item.name}
              </span>
            </div>

            <div className={`flex items-center gap-1 ${!isOpen ? 'md:hidden' : ''}`}>
              {/* Badge acumulado de los hijos */}
              {badgeCount > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 shrink-0 rounded-full ${isActive ? 'bg-purple-200 text-purple-800' : 'bg-purple-200 text-[#6e0372]'
                    }`}
                >
                  {badgeCount}
                </span>
              )}

              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180 text-[#5e0472]' : 'text-gray-400'
                  }`}
              />
            </div>

            {/* Tooltip cuando el sidebar está colapsado en MD */}
            {!isOpen && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden md:block z-50 whitespace-nowrap rounded shadow-md">
                {item.name}
              </div>
            )}
          </button>

          {/* Submenú desplegable */}
          {isSubmenuOpen && (
            <div className={`flex flex-col pl-9 pr-2 space-y-1 my-1 ${!isOpen ? 'md:hidden' : ''}`}>
              {item.children?.map((child) => {
                const isSubActive = pathname === child.href;
                const childBadge = badges[child.key] || 0;

                return (
                  <Link
                    key={child.key}
                    href={child.href}
                    className={`font-questrial text-xs font-medium py-1.5 px-3 transition flex items-center justify-between rounded ${isSubActive
                      ? 'bg-[#5e0472] text-white font-semibold'
                      : 'text-gray-500 hover:bg-purple-100 hover:text-[#5e0472]'
                      }`}
                  >
                    <span>{child.name}</span>

                    {childBadge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 shrink-0 rounded-full ${isSubActive ? 'bg-white text-[#5e0472]' : 'bg-purple-200 text-[#6e0372]'
                          }`}
                      >
                        {childBadge}
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

    // 2. Ítem simple (sin submenú)
    return (
      <Link
        key={item.key}
        href={item.href || '#'}
        className={`font-questrial flex items-center justify-between px-4 py-2.5 text-sm font-medium transition group relative ${isActive
          ? 'border-l-4 border-l-[#5e0472] bg-purple-100 text-[#5e0472]'
          : 'text-gray-400 hover:bg-purple-50 hover:text-[#5e0472]'
          } ${!isOpen ? 'md:justify-center md:px-0 md:h-11' : ''}`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 shrink-0" />}
          <span className={`transition-all duration-200 ${!isOpen ? 'md:hidden' : ''}`}>
            {item.name}
          </span>
        </div>

        {/* Badge con posicionamiento absoluto si el sidebar está colapsado */}
        {badgeCount > 0 && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 shrink-0 rounded-full ${isActive ? 'bg-purple-200 text-purple-800' : 'bg-purple-200 text-[#6e0372]'
              } ${!isOpen
                ? 'md:absolute md:top-1.5 md:right-1.5 md:px-1 md:min-w-[15px] md:h-4 md:flex md:items-center md:justify-center md:text-[9px]'
                : ''
              }`}
          >
            {badgeCount}
          </span>
        )}

        {/* Tooltip cuando el sidebar está colapsado en MD */}
        {!isOpen && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden md:block z-50 whitespace-nowrap rounded shadow-md">
            {item.name}
          </div>
        )}
      </Link>
    );
  };

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  // 🚀 Se ejecuta una única vez cuando el Sidebar se monta en el DOM
  useEffect(() => {
    fetchBadges();
  }, [fetchBadges, orderCreatedFlag]);
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
              {ADMIN_ACADEMIC_MENU.map(renderMenuItem)}
            </div>
            {/* BLOQUE 2: SISTEMA */}
            <div className="space-y-1">
              <p className={`text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-widest px-4 mb-2 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden'}`}>
                Sistema
              </p>
              {ADMIN_SYSTEM_MENU.map(renderMenuItem)}
            </div>

            {/* BLOQUE 3: OPERACIONES */}
            <div className="space-y-1">
              <p className={`text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-widest px-4 mb-2 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden'}`}>
                Finanzas y Logística
              </p>
              {ADMIN_OPERATIONAL_MENU.map(renderMenuItem)}
            </div>

            {/* BLOQUE 4: CRECIMIENTO */}
            <div className="space-y-1">
              <p className={`text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-widest px-4 mb-2 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden'}`}>
                Eventos y Leads
              </p>
              {ADMIN_MARKETING_MENU.map(renderMenuItem)}
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
            {CLIENT_PERSONAL_MENU.map(renderMenuItem)}
          </div>
        )}

      </div>

    </aside>
  );
}