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
  Check,
  SlidersHorizontal,
  GraduationCap
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { handleLogout } from "@/app/actions/auth";
import { useLoadingStore } from "@/store/useLoadingStore";

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
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  const router = useRouter();

  // Estados locales
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // 💡 NUEVOS ESTADOS PARA EL BUSCADOR AVANZADO
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNivel, setFilterNivel] = useState("");
  const [filterEstatus, setFilterEstatus] = useState("");

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const logoutStore = useAuthStore((state) => state.logout);
  const startLoading = useLoadingStore((state) => state.startLoading);
  const stopLoading = useLoadingStore((state) => state.stopLoading);

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
      setTimeout(() => stopLoading(), 200);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Manejador para ejecutar la consulta avanzada
  const handleAdvancedSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchModalOpen(false);

    // Construcción dinámica de parámetros de búsqueda
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (filterNivel) params.append("nivel", filterNivel);
    if (filterEstatus) params.append("estatus", filterEstatus);

    router.push(`/admin/students?${params.toString()}`);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Bloquear scroll de fondo cuando el modal esté abierto
  useEffect(() => {
    if (isSearchModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isSearchModalOpen]);

  return (
    <>
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

          {/* 💡 REEMPLAZO: BOTÓN DE APERTURA PARA BUSCADOR AVANZADO */}
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-purple-50/50 border border-purple-100 hover:bg-purple-100/70 hover:border-purple-200 text-gray-400 hover:text-purple-700 transition cursor-pointer text-xs font-questrial text-left group"
          >
            <Search className="text-purple-400 group-hover:text-purple-600 w-4 h-4 transition-colors" />
            <span className="truncate">Búsqueda avanzada...</span>
          </button>

          {/* CONTENEDOR DE NOTIFICACIONES */}
          <div className="relative" ref={notifRef}>
            <div className="group relative flex justify-center">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsUserMenuOpen(false);
                }}
                className="w-9 h-9 bg-purple-50 flex items-center justify-center text-purple-600 relative hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {hasUnread && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                )}
              </button>
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
                  <span className="absolute top-full mt-2 hidden group-hover:block w-auto rounded bg-gray-800 px-2.5 py-1.5 text-[10px] font-questrial text-white shadow-lg whitespace-nowrap z-50">
                    Cambiar a Vista Admin
                  </span>
                </div>
              )}
            </>
          )}

          {/* DIVISOR VISUAL */}
          <div className="w-[1px] h-6 bg-purple-100 mx-1 hidden sm:block"></div>

          {/* DROPDOWN MENU DE USUARIO */}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider">
                  {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                </div>

                <div className="hidden md:flex flex-col text-left font-questrial">
                  <span className="text-xs font-bold text-gray-700 leading-tight">{user.name}</span>
                  <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{user.email}</span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

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
          )}
        </div>
      </header>

      {/* 💡 MODAL INTERACTIVO DE BÚSQUEDA AVANZADA */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-xl p-5 relative animate-in fade-in zoom-in-95 duration-200">

            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-purple-50">
              <h3 className="text-xs font-anton uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#5e0472]" /> Filtros de Búsqueda Avanzada
              </h3>
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="text-gray-400 hover:text-pink-600 transition cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario de Criterios */}
            <form onSubmit={handleAdvancedSearch} className="mt-4 space-y-4">

              {/* Input Principal - Query */}
              <div className="space-y-1">
                <label className="block text-[11px] font-questrial font-bold text-gray-400 uppercase tracking-wide">
                  Nombre o Cédula del Alumno
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-purple-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ej. María Alejandra Pérez..."
                    className="w-full font-questrial pl-9 pr-4 py-2 bg-slate-50 border border-purple-100 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 text-gray-700"
                    autoFocus
                  />
                </div>
              </div>

              {/* Grid de Selects Secundarios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Filtro por Nivel / Cátedra */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-questrial font-bold text-gray-400 uppercase tracking-wide">
                    Nivel / Grupo Académico
                  </label>
                  <select
                    value={filterNivel}
                    onChange={(e) => setFilterNivel(e.target.value)}
                    className="w-full font-questrial p-2 bg-slate-50 border border-purple-100 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 text-gray-700"
                  >
                    <option value="">Todos los niveles</option>
                    <option value="pre_ballet">Pre-Ballet</option>
                    <option value="basico_1">Básico I</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado / Elenco</option>
                  </select>
                </div>

                {/* Filtro por Estatus Administrativo */}
                <div className="space-y-1">
                  <label className="block text-[11px] font-questrial font-bold text-gray-400 uppercase tracking-wide">
                    Estatus de Matrícula
                  </label>
                  <select
                    value={filterEstatus}
                    onChange={(e) => setFilterEstatus(e.target.value)}
                    className="w-full font-questrial p-2 bg-slate-50 border border-purple-100 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 text-gray-700"
                  >
                    <option value="">Cualquier estatus</option>
                    <option value="solvente">Solvente</option>
                    <option value="atrasado">Mensualidad Pendiente</option>
                    <option value="suspendido">Inactivo / Retirado</option>
                  </select>
                </div>
              </div>

              {/* Acciones del Modal */}
              <div className="pt-3 border-t border-purple-50 flex items-center justify-end gap-2.5">
                {(searchQuery || filterNivel || filterEstatus) && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setFilterNivel(""); setFilterEstatus(""); }}
                    className="px-3 py-2 text-xs font-questrial text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  >
                    Limpiar Filtros
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(false)}
                  className="px-4 py-2 text-xs font-questrial bg-slate-100 hover:bg-slate-200 text-gray-600 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-questrial font-bold bg-[#5e0472] hover:bg-[#4a035b] text-white transition shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <GraduationCap className="w-4 h-4" /> Filtrar Registro
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}