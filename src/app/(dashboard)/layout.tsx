"use client";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { OnboardingWizard } from "@/components/layout/OnboardingWizard";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { getAllClassroomsAction } from "@/app/actions/classroom";
import { getAllUsersAction } from "@/app/actions/user";
import { ShoppingBag, X, Trash2, ArrowRight, Minus, Plus, Search, UserCheck } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // 🎯 ESTADO PARA EL DRAWER Y CARRITO DE COMPRA
  // Zustand Cart Store
  const {
    items,
    isOpen,
    userId,
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

  // --- ESTADOS PARA BÚSQUEDA DE USUARIO ---
  const [userSearch, setUserSearch] = useState("");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const userRef = useRef<HTMLDivElement>(null);

  // Cargar usuarios desde la API o Server Action (ajusta la URL según tu backend)
  useEffect(() => {
    // Si la barra lateral del carrito no está abierta, se omite la consulta
    if (!isOpen) return;

    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        // 2. Invocar el Server Action pasando los parámetros requeridos (ej. paginación o búsqueda limpia)
        const response = await getAllUsersAction({
          // Pasa los parámetros que acepte tu FetchUsersParams si es necesario
          limit: 50, page: 1
        });

        if (response.success && response.data) {
          setUsersList(response.data);
          setFilteredUsers(response.data);
        } else {
          console.error("Error devuelto por la Server Action:", response.error);
          setUsersList([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        setUsersList([]);
        setFilteredUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // Cerrar dropdown al hacer clic fuera del control
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrado reactivo según el input del usuario
  const handleSearchChange = (value: string) => {
    setUserSearch(value);
    setShowUserDropdown(true);

    if (userId) {
      setUserId(null); // Si edita la búsqueda, limpia la selección anterior
      setSelectedUserName("");
    }

    const query = value.toLowerCase().trim();
    if (!query) {
      setFilteredUsers(usersList);
      return;
    }

    const filtered = usersList.filter((u) => {
      const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.toLowerCase();
      const email = u.email?.toLowerCase() ?? "";
      const dni = u.dni?.toLowerCase() ?? u.identification ?? "";
      return fullName.includes(query) || email.includes(query) || dni.includes(query);
    });

    setFilteredUsers(filtered);
  };

  const handleSelectUser = (user: any) => {
    const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
    setUserId(user.id);
    setSelectedUserName(displayName);
    setUserSearch(displayName);
    setShowUserDropdown(false);
  };

  const handleClearUserSelection = () => {
    setUserId(null);
    setSelectedUserName("");
    setUserSearch("");
    setFilteredUsers(usersList);
  };
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

            {/* 🔍 Buscador de Usuario (Ubicado al final) */}
            <div className="relative" ref={userRef}>
              <label className="block text-gray-600 font-bold mb-1 text-xs">
                Asignar Cliente / Usuario *
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuario por nombre, email o DNI..."
                  value={userSearch}
                  onFocus={() => setShowUserDropdown(true)}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={`w-full p-2 pl-8 pr-7 border rounded-lg bg-white text-xs focus:outline-none transition ${userId
                      ? "border-emerald-400 bg-emerald-50/20 text-emerald-900 font-medium"
                      : "border-purple-200 focus:border-purple-400"
                    }`}
                />
                <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-2.5" />

                {isLoadingUsers && (
                  <div className="absolute right-2.5 top-2.5 w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                )}

                {userId && (
                  <button
                    type="button"
                    onClick={handleClearUserSelection}
                    className="absolute right-2 top-2 p-0.5 text-gray-400 hover:text-rose-600 transition"
                    title="Cambiar usuario"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdown desplegable hacia arriba (bottom-full) para evitar scroll innecesario */}
              {showUserDropdown && !userId && (
                <ul className="absolute z-50 left-0 right-0 bottom-full mb-1 max-h-44 overflow-y-auto bg-white border border-purple-100 shadow-xl rounded-lg divide-y divide-gray-50 text-xs">
                  {isLoadingUsers ? (
                    <li className="p-2.5 text-gray-400 italic">Cargando usuarios...</li>
                  ) : filteredUsers.length === 0 ? (
                    <li className="p-2.5 text-rose-500 bg-rose-50/40">
                      No se encontraron usuarios coincidentes
                    </li>
                  ) : (
                    filteredUsers.map((u: any) => (
                      <li
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className="p-2 hover:bg-purple-50 cursor-pointer transition-colors flex justify-between items-center"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">
                            {u.firstName} {u.lastName}
                          </span>
                          <span className="text-[10px] text-gray-400">{u.email}</span>
                        </div>
                        {u.dni && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-sans">
                            {u.dni}
                          </span>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              )}

              {/* Badge de Confirmación */}
              {userId && (
                <div className="mt-1.5 flex items-center gap-1.5 text-emerald-700 text-[11px] font-medium bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                  <UserCheck className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">Cliente: <strong>{selectedUserName}</strong></span>
                </div>
              )}
            </div>
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