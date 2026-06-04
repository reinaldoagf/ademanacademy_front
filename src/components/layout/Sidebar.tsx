// src/components/layout/Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { handleLogout } from "@/app/actions/auth";
import {
  getMyRepresentedAction,
  getAllStudentsAction
} from "@/app/actions/student";
import {
  ChartPie, HeartPulse, Users, CheckSquare, CalendarDays,
  Wallet, Contact, Shirt, ShoppingBag, Armchair, Star, UserPlus, LogOut, Users2
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);

  // Cierre de sesión unificado (Limpia estado global + Cookies)
  const onLogout = async () => {
    logoutStore();
    await handleLogout();
  };

  // Secciones modulares del software (Administrador)
  const [academicManagement, setAcademicManagement] = useState([
    { key: '', name: 'Dashboard', href: '/admin/dashboard', icon: ChartPie },
    { key: 'students', name: 'Alumnos y Progreso', href: '/admin/students', icon: HeartPulse, badge: 0 },
    { key: '', name: 'Grupos y Cupos', href: '/admin/grupos', icon: Users, badge: 4 },
    { key: '', name: 'Control de Asistencias', href: '/admin/asistencias', icon: CheckSquare },
    { key: '', name: 'Ensayos y Clases', href: '/admin/ensayos', icon: CalendarDays, badge: 2 },
  ]);

  const gestionOperativa = [
    { key: '', name: 'Caja y Pagos', href: '/admin/payments', icon: Wallet, badge: 5 },
    { key: '', name: 'Profesores y Nómina', href: '/admin/profesores', icon: Contact },
    { key: '', name: 'Vestuarios', href: '/admin/vestuarios', icon: Shirt, badge: 12 },
    { key: '', name: 'Tienda e Inventario', href: '/admin/tienda', icon: ShoppingBag },
  ];

  const marketingEventos = [
    { key: '', name: 'Mapas de asientos', href: '/admin/mapas-de-asientos', icon: Armchair, badge: 3 },
    { key: '', name: 'Eventos Especiales', href: '/admin/eventos', icon: Star, badge: 4 },
    { key: '', name: 'Preinscripciones', href: '/admin/preinscripciones', icon: UserPlus, badge: 8 },
  ];

  const [personalManagement, setPersonalManagement] = useState([
    { key: '', name: 'Dashboard', href: '/client/dashboard', icon: ChartPie },
    { key: 'represented', name: 'Representados', href: '/client/represented', icon: Users2, badge: 0 }, // 👈 Inicializamos en 0
    { key: '', name: 'Mis Clases', href: '/client/classes', icon: CalendarDays },
    { key: '', name: 'Mis Pagos', href: '/client/payments', icon: Wallet },
    { key: '', name: 'Mis Vestuarios', href: '/client/clothing', icon: Shirt },
    { key: '', name: 'Eventos', href: '/client/events', icon: Star, badge: 4 }, // Tu otro badge estático
  ]);

  // Función auxiliar para renderizar los enlaces y reutilizar los estilos
  const renderLink = (item: any) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
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
            text-[10px] font-bold px-2 py-0.5 shrink-0 rounded
            ${isActive ? 'bg-purple-200 text-purple-800' : 'bg-purple-200 text-[#6e0372]'}
            ${!isOpen ? 'md:absolute md:top-1.5 md:right-1.5 md:px-1 md:min-w-[15px] md:h-4 md:flex md:items-center md:justify-center md:text-[9px]' : ''}
          `}>
            {item.badge}
          </span>
        )}

        {!isOpen && (
          <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden md:block z-50 whitespace-nowrap rounded">
            {item.name}
          </div>
        )}
      </Link>
    );
  };

  // Determinamos qué paneles mostrar basándonos en la ruta actual
  const isAdminView = pathname.startsWith('/admin') && user?.isAdmin;
  const isClientView = pathname.startsWith('/client');

  // 1️⃣ Aislamos la función de carga para poder reutilizarla
  const fetchStudentsBadgeCount = async () => {
    try {
      const res = await getAllStudentsAction({
        page: 1,
        limit: 1,
        search: undefined,
        kinship: undefined,
      });
      if (res.meta) {
        const totalStudents = res.meta.totalItems;
        setAcademicManagement((currentItems) =>
          currentItems.map((item) =>
            item.key === "students" ? { ...item, badge: totalStudents } : item
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar badge:", error);
    }
  };
  const fetchRepresentedBadgeCount = async () => {
    try {
      const res = await getMyRepresentedAction();
      if (res.success && res.data) {
        const totalRepresentados = res.data.length;
        setPersonalManagement((currentItems) =>
          currentItems.map((item) =>
            item.key === "represented" ? { ...item, badge: totalRepresentados } : item
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar badge:", error);
    }
  };
  // useEffect para cargar la data real al montar el Sidebar por primera vez
  useEffect(() => {
    if (isAdminView) {
      // Cargamos al inicio
      fetchStudentsBadgeCount();

      // 2️⃣ Escuchamos el evento global de actualización
      window.addEventListener('refresh-students-count', fetchStudentsBadgeCount);
    }

    // Limpieza al desmontar el componente para evitar fugas de memoria
    return () => {
      window.removeEventListener('refresh-students-count', fetchStudentsBadgeCount);
    };
  }, [isAdminView]);
  // useEffect para cargar la data real al montar el Sidebar por primera vez
  useEffect(() => {
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
  }, [isClientView]);
  return (
    <aside className={`
      bg-white/80 backdrop-blur-md flex flex-col justify-between border-r border-purple-100 
      fixed md:static inset-y-0 left-0 z-40 transition-all duration-300 h-vh overflow-y-auto
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

            {/* BLOQUE 2: OPERACIONES */}
            <div className="space-y-1">
              <p className={`text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-widest px-4 mb-2 transition-opacity duration-200 ${!isOpen && 'md:opacity-0 md:h-0 md:overflow-hidden'}`}>
                Finanzas y Logística
              </p>
              {gestionOperativa.map(renderLink)}
            </div>

            {/* BLOQUE 3: CRECIMIENTO */}
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

      {/* BOTÓN SALIR */}
      <div className="mt-6 pt-4 border-t border-purple-50">
        <button
          type="button"
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 text-sm transition cursor-pointer ${!isOpen && 'md:justify-center md:px-0'}`}>
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={!isOpen ? 'md:hidden' : ''}>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}