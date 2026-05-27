"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Bell, Search, ShieldCheck, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore"; // 💡 Importamos la tienda


interface HeaderProps {
  isSidebarOpen: boolean; // 2. Añadimos el estado actual del menú
  toggleSidebar: () => void;
}

export function Header({ isSidebarOpen, toggleSidebar }: HeaderProps) {// 💡 Extraemos al usuario de la tienda
  const pathname = usePathname();
  const router = useRouter();

  // 💡 Extraemos al usuario de la tienda
  const user = useAuthStore((state) => state.user);

  // Control de hidratación para evitar errores SSR con localStorage
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Si no se ha montado en el cliente, no renderizamos el botón aún
  if (!isClient) return null;
  return (
    <header className="w-full h-16 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="w-10 h-10 cursor-pointer hover:bg-purple-50 text-[#5e0472] flex items-center justify-center transition">
          {/* 3. Si está abierto muestra X, si está cerrado muestra Menu */}
          {isSidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        <div className="flex items-center gap-2.5">
          <Image
            className="h-8"
            src="/img/logo1.png"
            alt="Logo"
            width={100}
            height={20}
            priority />

        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1.5 text-purple-400 w-4 h-4" />
          <input type="text" placeholder="Buscar alumno..." className="font-questrial pl-9 pr-4 py-1.5 w-48 lg:w-64 bg-purple-50/50 border border-purple-100 text-xs focus:outline-none" />
        </div>
        <button className="w-9 h-9 bg-purple-50 flex items-center justify-center text-purple-600 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full"></span>
        </button>
        {/* 💡 CONTROL DE VISIBILIDAD DE ADMINISTRADOR CON ZUSTAND */}
        {user?.isAdmin && (
          <>
            {pathname.startsWith("/admin") ? (
              <button
                onClick={() => router.push("/client/dashboard")}
                title="Cambiar a Vista Cliente"
                className="w-9 h-9 bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => router.push("/admin/dashboard")}
                title="Cambiar a Vista Admin"
                className="w-9 h-9 bg-purple-50 flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}