"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { OnboardingWizard } from "@/components/layout/OnboardingWizard";
import { useAuthStore } from "@/store/authStore";
import { getAllClassroomsAction } from "@/app/actions/classroom";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 🎯 ESTADOS PARA LA INTERCEPCIÓN DE SALONES
  const [hasCheckedClassrooms, setHasCheckedClassrooms] = useState(false);
  const [needsClassroomOnboarding, setNeedsClassroomOnboarding] = useState(false);
  const fetchTotalClassrooms = async () => {
    try {
      const res = await getAllClassroomsAction({
        page: 1,
        limit: 1,
        search: undefined,
      });
      const total = res.meta ? res?.meta?.totalItems : 0;

      if (total === 0) {
        setNeedsClassroomOnboarding(true);
      }
      setHasCheckedClassrooms(true);
    } catch (error) {
      console.error("Error al actualizar badge:", error);
    }
  };
  useEffect(() => {
    // Solo consultamos si el usuario está autenticado y tiene rol de administrador
    if (user && user.isAdmin) {
      fetchTotalClassrooms();

      /* fetch("/api/classrooms?limit=1") // Limitemos a 1 en el backend para máxima velocidad
        .then((res) => res.json())
        .then((resData) => {
          // Si resData es un arreglo vacío o su propiedad count/totalItems es 0
          
        })
        .catch((err) => {
          console.error("Error verificando infraestructura:", err);
          setHasCheckedClassrooms(true); // Evitamos bloquear la UI si la API falla
        }); */
    } else {
      setHasCheckedClassrooms(true);
    }
  }, [user]);

  // 1️⃣ INTERCEPCIÓN 1: Onboarding de perfil del usuario
  if (user && !user.profileOnboarding) {
    return <OnboardingWizard userEmail={user.email} stepType="PROFILE" />;
  }

  // 2️⃣ ESTADO DE TRANSICIÓN: Evita parpadeos mientras la API responde
  if (!hasCheckedClassrooms) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Spinner animado morado */}
        <div className="w-12 h-12 border-4 border-purple-200 border-t-[#5e0472] rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-questrial font-semibold text-[#5e0472] tracking-wide animate-pulse">
          Cargando Ademan Dashboard...
        </p>
      </div>
    );
  }

  // 3️⃣ INTERCEPCIÓN 2: Forzar registro del primer salón si está vacío (Solo Admins)
  if (needsClassroomOnboarding && user?.isAdmin) {
    return (
      <OnboardingWizard
        userEmail={user.email}
        stepType="CLASSROOM"
        onSuccess={() => setNeedsClassroomOnboarding(false)}
      />
    );
  }

  // 4️⃣ UI TRADICIONAL
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <Header isSidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />

        {/* Overlay para móviles */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          />
        )}

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}