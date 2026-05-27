// src/components/layout/Header.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  X,
  Menu,
  Search,
  Bell,
  User,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Check
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { handleLogout } from "@/app/actions/auth";
import { useLoadingStore } from "@/store/useLoadingStore";

// Mock de usuario
const user = {
  name: "Carlos Mendoza",
  email: "carlos.mendoza@ademan.com",
  avatar: null,
  isAdmin: true
};

// Mock de notificaciones iniciales de la academia
const INITIAL_NOTIFICATIONS = [
  { id: 1, text: "Vestuario 'Lago de los Cisnes' listo para retirar.", time: "Hace 10 min", read: false },
  { id: 2, text: "Pago de mensualidad de Mayo aprobado con éxito.", time: "Hace 2 horas", read: false },
  { id: 3, text: "Cambio de horario en el ensayo general de la gala.", time: "Hace 1 día", read: true },
];

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Estados locales
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Referencias para cierres al hacer click fuera
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Zustand Actions
  const logoutStore = useAuthStore((state) => state.logout);
  const startLoading = useLoadingStore((state) => state.startLoading);
  const stopLoading = useLoadingStore((state) => state.stopLoading);

  // Determinar si hay alguna notificación sin leer
  const hasUnread = notifications.some(n => !n.read);

  const handleRoleTransition = (targetPath: string) => {
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
    startLoading();
    setTimeout(() => {
      router.push(targetPath);
      setTimeout(() => stopLoading(), 300);
    }, 1500);
  };

  const onLogout = async () => {
    setIsUserMenuOpen(false);
    setIsNotificationsOpen(false);
    startLoading();

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      logoutStore();
      await handleLogout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setTimeout(() => {
        stopLoading();
      }, 200);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Efecto para cerrar menús si se hace clic fuera de ellos
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Cierre del menú de usuario
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      // Cierre del menú de notificaciones
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-16 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">

      {/* SECCIÓN IZQUIERDA: MENÚ & LOGO */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="w-10 h-10 cursor-pointer hover:bg-purple-50 text-[#5e0472] flex items-center justify-center transition"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2.5">
          <Image
            className="h-8 w-auto"
            src="/img/logo1.png"
            alt="Logo"
            width={100}
            height={20}
            priority
          />
        </div>
      </div>

      {/* SECCIÓN DERECHA: ACCIONES Y MENÚS */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Buscador (Oculto en móviles) */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1.5 text-purple-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar alumno..."
            className="font-questrial pl-9 pr-4 py-1.5 w-48 lg:w-64 bg-purple-50/50 border border-purple-100 text-xs focus:outline-none"
          />
        </div>

        {/* CONTENEDOR DE NOTIFICACIONES */}
        <div className="relative" ref={notifRef}>
          <div className="group relative flex justify-center">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsUserMenuOpen(false); // Cierra el otro menú por UX
              }}
              className="w-9 h-9 bg-purple-50 flex items-center justify-center text-purple-600 relative hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {hasUnread && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {/* Tooltip posicionado abajo */}
            <span className="absolute top-full mt-2 hidden group-hover:block w-auto rounded bg-gray-800 px-2.5 py-1.5 text-[10px] font-questrial text-white shadow-lg whitespace-nowrap z-50">
              Ver notificaciones
            </span>
          </div>

          {/* Menú Desplegable de Notificaciones */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-purple-100 shadow-xl rounded-none py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-purple-50 flex items-center justify-between">
                <span className="text-xs font-anton text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Notificaciones
                </span>
                {hasUnread && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-purple-600 hover:text-purple-800 font-questrial font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Marcar leídas
                  </button>
                )}
              </div>

              {/* Lista */}
              <div className="max-h-64 overflow-y-auto divide-y divide-purple-50">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-left transition-colors ${notif.read ? 'bg-white' : 'bg-purple-50/40 font-medium'}`}
                    >
                      <p className="text-xs text-gray-700 font-questrial leading-normal">
                        {notif.text}
                      </p>
                      <span className="text-[9px] text-gray-400 font-questrial block mt-1">
                        {notif.time}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400 font-questrial">
                    No tienes notificaciones nuevas
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botón rápido de Cambio de Rol */}
        {user?.isAdmin && (
          <>
            {pathname.startsWith("/admin") ? (
              <div className="group relative flex justify-center">
                <button
                  onClick={() => handleRoleTransition("/client/dashboard")}
                  className="w-9 h-9 bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4" />
                </button>
                {/* Tooltip posicionado abajo */}
                <span className="absolute top-full mt-2 hidden group-hover:block w-auto rounded bg-gray-800 px-2.5 py-1.5 text-[10px] font-questrial text-white shadow-lg whitespace-nowrap z-50">
                  Cambiar a Vista Cliente
                </span>
              </div>
            ) : (
              <div className="group relative flex justify-center">
                <button
                  onClick={() => handleRoleTransition("/admin/dashboard")}
                  className="w-9 h-9 bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
                {/* Tooltip posicionado abajo */}
                <span className="absolute top-full mt-2 hidden group-hover:block w-auto rounded bg-gray-800 px-2.5 py-1.5 text-[10px] font-questrial text-white shadow-lg whitespace-nowrap z-50">
                  Cambiar a Vista Admin
                </span>
              </div>
            )}
          </>
        )}

        {/* DIVISOR VISUAL */}
        <div className="w-[1px] h-6 bg-purple-100 mx-1 hidden xs:block"></div>

        {/* DROPDOWN MENU DE USUARIO */}
        <div className="relative" ref={menuRef}>
          {/* Disparador del Menú */}
          <button
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsNotificationsOpen(false); // Cierra notificaciones por UX
            }}
            className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm"
          >
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-purple-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider">
                {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="hidden md:flex flex-col text-left font-questrial">
              <span className="text-xs font-bold text-gray-700 leading-tight">{user.name}</span>
              <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{user.email}</span>
            </div>

            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú Desplegable Flotante */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-purple-100 shadow-xl rounded-none py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

              <div className="p-3 border-b border-purple-50 md:hidden bg-purple-50/30">
                <p className="text-xs font-anton text-gray-800">{user.name}</p>
                <p className="text-[10px] font-questrial text-gray-400 truncate">{user.email}</p>
              </div>

              <div className="px-3 py-1.5 text-[9px] font-questrial font-bold text-gray-400 uppercase tracking-wider">
                Mi Cuenta
              </div>

              <button
                onClick={() => { setIsUserMenuOpen(false); router.push(user.isAdmin && pathname.startsWith("/admin") ? "/admin/profile" : "/client/profile"); }}
                className="cursor-pointer w-full px-3 py-2 text-left text-xs text-gray-600 font-questrial flex items-center gap-2.5 hover:bg-purple-50 transition-colors"
              >
                <User className="w-4 h-4 text-purple-500" />
                Mi Perfil
              </button>

              <button
                onClick={() => { setIsUserMenuOpen(false); router.push("/settings"); }}
                className="cursor-pointer w-full px-3 py-2 text-left text-xs text-gray-600 font-questrial flex items-center gap-2.5 hover:bg-purple-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-purple-500" />
                Configuración
              </button>

              <div className="border-t border-purple-50 my-1"></div>

              <button
                onClick={onLogout}
                className="cursor-pointer w-full px-3 py-2 text-left text-xs text-pink-600 font-questrial font-semibold flex items-center gap-2.5 hover:bg-pink-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-pink-500" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}