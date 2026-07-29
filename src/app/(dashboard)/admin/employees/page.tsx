// src/app/(dashboard)/employeeesores/page.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Contact,
  Plus,
  Search,
  Clock,
  BadgeDollarSign,
  UserCheck,
  CircleCheck,
  Briefcase,
  Layers,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import HeroSection from "@/components/layout/HeroSection";
import DataTable, { Column } from "@/components/common/DataTable";
import { MacDockModal } from "@/components/ui/MacDockModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { saveEmployeeAction, getAllEmployeesAction, deleteEmployeeAction } from "@/app/actions/employee";
import { EmployeeFormData, Employee } from "@/types/employee";

// Estado inicial limpio del formulario para Empleados
const initialFormState: EmployeeFormData = {
  firstName: "",
  lastName: "",
  dni: "",
  phone: "",
  typeOfContract: "fixed",
  hourlyRate: 0,
  hoursTaughtMonth: 0,
  bonus: 0,
  birthDate: "",
  address: "",
};
export default function EmployeesPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormState);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 6,
    itemCount: 6,
  });
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "simple" | "word" | "email";
    title: string;
    description: string;
    requiredWord?: string;
    userEmail?: string;
    id?: string;
  }>({
    isOpen: false,
    type: "word",
    title: "",
    description: "",
  });

  // Totales financieros y de gestión del mes en curso (Mayo 2026)
  const totalHorasDictadas = 15
  const nominaTotalMes = 13
  const pendientesPorPagar = 15

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    // Validaciones preventivas en el cliente
    if (!formData.firstName.trim()) {
      setErrorMsg("El nombre del empleado es obligatorio.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setErrorMsg("El apellido del empleado es obligatorio.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.dni.trim()) {
      setErrorMsg("El DNI / documento de identidad es obligatorio.");
      setIsSubmitting(false);
      return;
    }

    try {
      startTransition(async () => {
        // 🎯 Acción de servidor / API para guardar el empleado
        const res = await saveEmployeeAction(formData, editingId);

        if (!res.success) {
          setErrorMsg(res.error || "Ocurrió un error al guardar el empleado.");
          return;
        }

        toast.success(
          editingId
            ? "Empleado actualizado correctamente"
            : "Empleado registrado con éxito"
        );

        // Reactividad: refrescar listado o badges si aplica
        if (!editingId) {
          window.dispatchEvent(new Event("refresh-employees-count"));
        }

        fetchData(currentPage, itemsPerPage);
        closeModal();
      });
    } catch (error: any) {
      console.error("Error detectado en handleSave:", error);
      setErrorMsg(
        error.message ||
        "Ocurrió un problema de red al intentar guardar el empleado."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // 3️⃣ 🎯 MANEJADOR DE CAMBIO DE PÁGINA
  const handlePageChange = (newPage: number) => {
    // Actualizamos el estado local. Al cambiar, disparará el useEffect superior de forma reactiva
    setCurrentPage(newPage);

    // 💡 Opcional y Recomendado: Scroll suave hacia arriba de la tabla para mejorar la UX al cambiar de página
    //window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🎯 MANEJADOR DE CAMBIO DE LÍMITE (Filas por página)
  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // 💡 Regla de oro: Si cambias el límite, vuelve siempre a la página 1
  };

  const handleEditModal = (employee: Employee) => { // Puedes usar la interfaz de tu Student de Prisma
    setFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      dni: employee.dni || "",
      phone: employee.phone || "",
      typeOfContract: employee.typeOfContract || "fixed",
      hourlyRate: employee.hourlyRate || 0,
      hoursTaughtMonth: employee.hoursTaughtMonth || 0,
      bonus: employee.bonus || 0,
      birthDate: employee.birthDate || "",
      address: employee.address || "",
    })
    setEditingId(employee.id);
    setErrorMsg(null);
    openModal();
  };
  const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
  // Acción definitiva que se ejecuta al pasar el filtro del Modal
  const handleConfirmAction = async () => {
    if (modalConfig?.id) {
      startTransition(async () => {
        if (modalConfig?.id) {
          const res = await deleteEmployeeAction(modalConfig.id);
          if (res.success) {
            toast.success("Operación exitosa");
            fetchData(currentPage, itemsPerPage);
            // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
            window.dispatchEvent(new Event('refresh-employees-count'));
          }
        }
      });
    }
  };
  // 🎯 Configuración declarativa de las columnas para la tabla de Empleados
  const columns: Column<Employee>[] = [
    {
      header: "Empleado",
      render: (employee) => {
        const initials = `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 font-questrial rounded-full">
              {initials || "EM"}
            </div>
            <div>
              <p className="font-bold text-gray-800 font-questrial">
                {employee.firstName} {employee.lastName}
              </p>
              <p className="text-[10px] text-gray-400 font-questrial">
                DNI: {employee.dni || "Sin DNI"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Contacto",
      render: (employee) => (
        <span className="text-xs text-gray-600 font-questrial">
          {employee.phone || "Sin teléfono"}
        </span>
      ),
    },
    {
      header: "Tipo de Contrato",
      render: (employee) => (
        <span className="flex items-center gap-1 text-xs text-gray-500 font-questrial capitalize">
          <Briefcase className="w-3.5 h-3.5 text-gray-400" />
          {employee.typeOfContract}
        </span>
      ),
    },
    {
      header: "Horas Dictadas",
      render: (employee) => {
        const hourlyRate = Number(employee.hourlyRate || 0);
        const hoursTaught = Number(employee.hoursTaughtMonth || 0);
        return (
          <div className="text-xs">
            <p className="font-bold text-gray-800 font-questrial">
              {hoursTaught} Horas
            </p>
            <p className="text-[10px] text-gray-400 font-questrial font-medium">
              ${hourlyRate.toFixed(2)}/hr base
            </p>
          </div>
        );
      },
    },
    {
      header: "Bono Extra",
      render: (employee) => {
        const bonus = Number(employee.bonus || 0);
        return bonus > 0 ? (
          <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 font-questrial rounded">
            +${bonus.toFixed(2)}
          </span>
        ) : (
          <span className="text-xs text-gray-300 font-questrial">—</span>
        );
      },
    },
    {
      header: "Monto Neto",
      render: (employee) => {
        const hourlyRate = Number(employee.hourlyRate || 0);
        const hoursTaught = Number(employee.hoursTaughtMonth || 0);
        const bonus = Number(employee.bonus || 0);
        const sueldoTotal = hoursTaught * hourlyRate + bonus;

        return (
          <span className="font-extrabold text-gray-900 text-sm font-questrial">
            ${sueldoTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      header: "Estado de Nómina",
      render: (employee) => (
        <span
          className={`text-[10px] font-questrial font-bold px-2.5 py-0.5 inline-flex items-center gap-1 ${employee.payrollStatus === "paid"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800"
            }`}
        >
          {employee.payrollStatus === "paid" && (
            <CircleCheck className="w-3 h-3" />
          )}
          {employee.payrollStatus === "paid" ? "Pagado" : "Pendiente"}
        </span>
      ),
    },
    {
      header: "Acciones",
      className: "text-right",
      render: (employee) => (
        <div className="flex gap-2 justify-end">

          <button
            onClick={() => handleEditModal(employee)}
            className="text-xs bg-white border border-purple-100 text-[#5e0472] px-3 py-1 font-semibold hover:bg-[#5e0472] hover:text-white transition shadow-sm cursor-pointer rounded-sm"
          >
            Editar
          </button>
          <button onClick={() => {
            setModalConfig({
              isOpen: true,
              type: "word",
              title: "Confirmar operación",
              description: "¿Quieres eliminar el registro del empleado?",
              id: employee.id,
            });
          }}
            className={`text-xs  border border-purple-100 text-[#5e0472] px-3 py-1.5 font-semibold  transition shadow-sm cursor-pointer bg-white hover:bg-[#5e0472] hover:text-white`}
          >
            Eliminar
          </button>
        </div>


      ),
    },
  ];

  const fetchData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res = await getAllEmployeesAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
      });

      if (res.success && res.data) {
        setEmployees(res.data);
        setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
      }
    });
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(currentPage, itemsPerPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, currentPage, itemsPerPage]);
  return (
    <>
      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection
        htmlTitle={`Empleados y Control de <em class="text-[#5e0472]">Nómina</em>`}
        htmlSubTitle={`Supervisa las horas de clase dictadas, coreógrafos asignados y honorarios acumulados.`}
        actions={[
          {
            label: "Registrar Empleado →",
            onClick: () => {
              setFormData(initialFormState);
              setErrorMsg(null);
              setEditingId(null);
              openModal();
            },
            icon: <Plus className="w-4 h-4" />,
          },
        ]}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
        {/* MÉTRICAS DE HONORARIOS DEL MES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Horas totales ejecutadas */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Horas pedagógicas frente a clase.
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {totalHorasDictadas} Hrs
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Horas pedagógicas frente a clase.
              </p>
            </div>
          </div>

          {/* Total Nómina */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Presupuesto de Nómina
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                ${nominaTotalMes.toLocaleString()}
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Incluye sueldos base y bonos de montaje.
              </p>
            </div>
          </div>

          {/* Pendientes de pago */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Pendiente por Liquidar
              </p>
              <h4 className="text-xl font-anton text-pink-600">
                ${pendientesPorPagar.toLocaleString()}
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Honorarios listos por transferir.
              </p>
            </div>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>
        </div>

        {/* TABLA DE ALUMNOS */}
        <DataTable
          data={employees}
          columns={columns}
          meta={meta}
          isLoading={isPending}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange} // 👈 Pasamos el manejador del límite
          rowKey={(employee) => employee.id}
          emptyMessage="No se encontraron transacciones registradas."
        />

      </div>

      <MacDockModal
        isOpen={isOpen}
        onClose={closeModal}
        title={editingId ? "Actualizar Empleado" : "Registrar Nuevo Empleado"}
      >
        {/* Formulario */}
        <form onSubmit={handleSave} className="space-y-4 font-questrial text-xs">
          {errorMsg && (
            <p className="text-red-500 bg-red-50 p-2 text-sm text-center mb-4 border border-red-100">
              {errorMsg}
            </p>
          )}

          {/* Fila 1: Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Nombres *
              </label>
              <input
                required
                type="text"
                placeholder="Ej: Maria Paula"
                value={formData.firstName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Apellidos *
              </label>
              <input
                required
                type="text"
                placeholder="Ej: Gomez Pérez"
                value={formData.lastName || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Fila 2: DNI y Fecha de Nacimiento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 font-bold mb-1">
                DNI / Identificación *
              </label>
              <input
                required
                type="text"
                placeholder="Ej: 1098765432"
                value={formData.dni || ""}
                onChange={(e) =>
                  setFormData({ ...formData, dni: e.target.value })
                }
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.birthDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 text-gray-700"
              />
            </div>
          </div>

          {/* Fila 3: Teléfono y Tipo de Contrato */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                placeholder="Ej: +57 300 123 4567"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Tipo de Contrato *
              </label>
              <select
                required
                value={formData.typeOfContract || "fixed"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    typeOfContract: e.target.value as EmployeeFormData["typeOfContract"],
                  })
                }
                className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400 capitalize"
              >
                <option value="fixed">Fijo</option>
                <option value="per_hour">Por Hora</option>
                <option value="by_project">Por proyecto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-500 font-bold mb-1">
              Dirección
            </label>

            <textarea
              required
              rows={3}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
            ></textarea>
          </div>

          {/* Fila 4: Tarifa por Hora, Horas Dictadas y Bono Extra */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Tarifa / Hora ($)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={formData.hourlyRate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hourlyRate: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Horas del Mes
              </label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={formData.hoursTaughtMonth || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hoursTaughtMonth: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-gray-500 font-bold mb-1">
                Bono Extra ($)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={formData.bonus || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bonus: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {/* Botonera de Acción */}
          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Guardando..."
                : editingId
                  ? "Actualizar Empleado"
                  : "Registrar Empleado"}
            </button>
          </div>
        </form>
      </MacDockModal>
      {/* INSTANCIA ÚNICA DEL MODAL DINÁMICO */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        type={modalConfig.type}
        title={modalConfig.title}
        description={modalConfig.description}
        requiredWord={modalConfig.requiredWord}
        userEmail={modalConfig.userEmail}
        variant={modalConfig.type === "word" ? "danger" : modalConfig.type === "email" ? "warning" : "primary"}
        confirmButtonText={modalConfig.type === "word" ? "Eliminar de Por Vida" : "Confirmar Acción"}
      />
    </>
  );
}
