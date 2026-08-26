"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { OnboardingWizard } from "@/components/layout/OnboardingWizard";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { getAllClassroomsAction } from "@/app/actions/classroom";
import { ShoppingBag, X, Trash2, ArrowRight, Minus, Plus } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // 🎯 ESTADO PARA EL DRAWER Y CARRITO DE COMPRA
  // Zustand Cart Store
  const {
    items,
    isOpen,
    openCart,
    closeCart,
    setUserId,
    removeItem,
    updateQuantity,
    getTotalAmount,
    getTotalItemsCount,
  } = useCartStore();
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
  // Total de elementos en el carrito
  const totalCount = getTotalItemsCount();
  const totalAmount = getTotalAmount();
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
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={openCart}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-[#5e0472] hover:bg-[#4a0359] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer group"
      >
        <ShoppingBag className="w-6 h-6 group-hover:rotate-6 transition-transform" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {totalCount}
          </span>
        )}
      </button>

      {/* Overlay del Carrito */}
      {isOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      {/* Drawer del Carrito */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#5e0472]">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-questrial font-bold text-base">Carrito de Compras</h2>
            <span className="text-xs bg-purple-200/60 px-2 py-0.5 rounded-full font-semibold">
              {totalCount}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="cursor-pointer p-1.5 text-gray-400 hover:text-gray-700 hover:bg-purple-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Ítems */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-questrial text-xs">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
              <ShoppingBag className="w-12 h-12 stroke-1 text-purple-200" />
              <p className="text-sm font-medium">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.tempId}
                className="p-3 bg-purple-50/30 border border-purple-100 rounded-lg flex justify-between items-start gap-2"
              >
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-gray-800">
                    {item.conceptLabel || item.concept}
                  </p>
                  {item.student && (
                    <p className="text-[10px] text-gray-500">
                      Alumno: {item.student.firstName} {item.student.lastName}
                    </p>
                  )}
                  <p className="text-purple-700 font-bold">${item.price}</p>

                  {/* Selector de cantidad */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => updateQuantity(item.tempId, item.quantity - 1)}
                      className="cursor-pointer p-1 border border-purple-200 rounded hover:bg-purple-100"
                    >
                      <Minus className="w-3 h-3 text-purple-700" />
                    </button>
                    <span className="font-bold text-xs px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.tempId, item.quantity + 1)}
                      className="cursor-pointer p-1 border border-purple-200 rounded hover:bg-purple-100"
                    >
                      <Plus className="w-3 h-3 text-purple-700" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.tempId)}
                  className="cursor-pointer text-red-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer con el Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-purple-100 bg-purple-50/20 space-y-3 font-questrial">
            <div className="flex justify-between items-center text-sm font-bold text-gray-800">
              <span>Total Estimado:</span>
              <span className="text-[#5e0472] text-base">${(totalAmount ?? 0).toFixed(2)}</span>
            </div>

            <button
              onClick={() => {
                // Aquí invocas tu Server Action pasando `items` y `totalAmount`
                closeCart();
              }}
              className="w-full py-2.5 px-4 bg-[#5e0472] hover:bg-[#4a0359] text-white font-bold rounded-lg shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <span>Registrar Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}