// src/app/(dashboard)/admin/students/page.tsx
"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import {
  Sparkles,
  X,
  Users,
  Search,
  Filter,
  Plus,
  Award,
  UserCheck2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import HeroSection from "@/components/layout/HeroSection";
import DataTable, { Column } from "@/components/common/DataTable";
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";
import { Student } from "@/types/student";
import {
  saveStudentAction,
  getAllStudentsAction
} from "@/app/actions/student";
import { getAllGroupsAction } from "@/app/actions/group";
import { Group } from "@/types/group";

type GroupFormData = {
  dni: string,
  firstName: string,
  lastName: string,
  birthDate: string,
  kinship: Student["kinship"],
  medicalObservations: string,
  address: string,
  shirtSize: string,
  phone: string,
  hasExperience: boolean,
  groupId: string | undefined,
};
const initialFormState: GroupFormData = {
  dni: "",
  firstName: "",
  lastName: "",
  birthDate: "",
  kinship: "son" as Student["kinship"],
  medicalObservations: "",
  address: "",
  shirtSize: "M",
  phone: "",
  hasExperience: true,
  groupId: "",
};
export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    itemCount: 10,
  });

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [kinshipFilter, setKinshipFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // --- ESTADOS PARA BÚSQUEDA DE grupos ---
  const [groupSearch, setGroupSearch] = useState("");
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  // Refs para cerrar los menús si el usuario hace click afuera
  const groupRef = useRef<HTMLDivElement>(null);
  // Refs para cerrar los menús si el usuario hace click afuera
  const [formData, setFormData] = useState<GroupFormData>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fetchTableData = (pageToFetch: number, limitToFetch: number) => {
    startTransition(async () => {
      const res = await getAllStudentsAction({
        page: pageToFetch,
        limit: limitToFetch, // 🎯 Enviamos el límite dinámico
        search: searchTerm || undefined,
        kinship: kinshipFilter === "all" ? undefined : kinshipFilter,
      });

      if (res.success && res.data) {
        setStudents(res.data);
        setMeta(res.meta); // NestJS ya devuelve el "itemsPerPage" en su meta
      }
    });
  };
  // 🔄 Efecto reactivo con debounce para consultas al servidor
  // Reacciona a cambios en buscador, página o cantidad de filas
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTableData(currentPage, itemsPerPage);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, kinshipFilter, currentPage, itemsPerPage]);

  // --- EFFECT PARA grupos (Vía Server Action) ---
  useEffect(() => {
    // Evitamos re-consultar si el string coincide con el elemento ya seleccionado
    if (filteredGroups.find(c => c.id === formData.groupId)?.name === groupSearch) {
      return;
    }

    setIsLoadingGroups(true);

    const isSearchEmpty = !groupSearch.trim();
    const delay = isSearchEmpty ? 0 : 400;

    const delayDebounce = setTimeout(async () => {
      try {
        // Construimos los parámetros requeridos por FetchGroupsParams
        const params = isSearchEmpty
          ? { limit: 5 }
          : { search: groupSearch.trim() };

        // Llamada directa al Server Action
        const result = await getAllGroupsAction(params);

        if (result.success && result.data) {
          // Axios mapea la respuesta en result.data. data.data suele ser el array
          // Si tu backend anida los grupos en 'groups', úsalo; de lo contrario asigna result.data
          setFilteredGroups(result.data.groups || result.data);
        } else {
          console.error("Error en Server Action (grupos):", result.error);
          setFilteredGroups([]);
        }
      } catch (error) {
        console.error("Error crítico buscando grupos:", error);
        setFilteredGroups([]);
      } finally {
        setIsLoadingGroups(false);
      }
    }, delay);

    return () => clearTimeout(delayDebounce);
  }, [isModalOpen, groupSearch]);
  // 🎯 MANEJADORES DE LA TABLA

  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // 💡 Regla de oro: Si cambias el límite, regresa siempre a la página 1
  };

  // Si cambia un filtro de categoría o nivel, reseteamos a la página 1
  const handleFilterChange = (type: "kinship", value: string) => {
    if (type === "kinship") setKinshipFilter(value);
    setCurrentPage(1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      const res = await saveStudentAction(formData, editingId);
      if (!res.success) {
        setErrorMsg(res.error || "Ocurrió un error.");
        return;
      }
      toast.success("Operación exitosa");
      // Sincronizar estado local
      if (editingId) {
        setStudents(students.map((item) => (item.id === editingId ? res.data! : item)));
      } else {
        setStudents([res.data!, ...students]);
        // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
        window.dispatchEvent(new Event('refresh-students-count'));
      }
      setIsModalOpen(false);
    });

  };
  // 3️⃣ 🎯 MANEJADOR DE CAMBIO DE PÁGINA
  const handlePageChange = (newPage: number) => {
    // Actualizamos el estado local. Al cambiar, disparará el useEffect superior de forma reactiva
    setCurrentPage(newPage);

    // 💡 Opcional y Recomendado: Scroll suave hacia arriba de la tabla para mejorar la UX al cambiar de página
    //window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🎯 Configuración declarativa de las columnas
  const columns: Column<Student>[] = [
    {
      header: "Bailarín / DNI",
      render: (student) => {
        const initials = `${student.firstName[0] || ""}${student.lastName[0] || ""}`.toUpperCase();
        return (
          <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
            <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
              {initials}
            </div>
            <div className="hidden md:flex flex-col text-left font-questrial">
              <span className="text-xs font-bold text-gray-700 leading-tight">
                {student.firstName} {student.lastName}
              </span>
              <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{student.dni}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Representante",
      render: (student) => {
        if (!student.user) {
          return <p className="text-[11px] text-gray-400 mt-0.5">Sin representante</p>;
        }
        const userInitials = student.user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
            <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
              {userInitials}
            </div>
            <div className="hidden md:flex flex-col text-left font-questrial">
              <span className="text-xs font-bold text-gray-700 leading-tight">{student.user.name}</span>
              <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{student.user.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Grupo",
      render: (student) => {
        if (!student.group) {
          return <p className="text-[11px] text-gray-400 mt-0.5">Sin grupo asignado</p>;
        }
        const userInitials = student.group.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm">
            <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider shrink-0">
              {userInitials}
            </div>
            <div className="hidden md:flex flex-col text-left font-questrial">
              <span className="text-xs font-bold text-gray-700 leading-tight">{student.group.name}</span>
              <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{student.group.style}</span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Fecha de Nacimiento",
      render: (student) => (
        <p className="text-[11px] text-gray-400 mt-0.5">
          <DatePipe value={student.birthDate} format="short" />
        </p>
      ),
    },
    {
      header: "Parentesco",
      render: (student) => (
        <Badge variant={student.kinship || ''} />
      ),
    },
    {
      header: "Acciones",
      className: "text-right", // Alinea el encabezado a la derecha
      render: (student) => (
        <button
          onClick={() => {
            setEditingId(student.id);
            // 🌟 CORRECCIÓN: Extraemos solo 'YYYY-MM-DD' de la fecha ISO
            const formattedBirthDate = student.birthDate
              ? student.birthDate.split("T")[0]
              : "";
            setFormData({
              dni: student.dni,
              firstName: student.firstName,
              lastName: student.lastName,
              birthDate: formattedBirthDate,
              kinship: student.kinship,
              medicalObservations: student.medicalObservations || "",
              address: student.address,
              shirtSize: student.shirtSize,
              phone: student.phone,
              hasExperience: student.hasExperience,
              groupId: student.groupId,
            });
            setGroupSearch(student.group?.name || "")
            setIsModalOpen(true);
            setShowGroupDropdown(false);
          }}
          className="text-xs bg-white border border-purple-100 text-[#5e0472] px-3 py-1 font-semibold hover:bg-[#5e0472] hover:text-white transition shadow-sm cursor-pointer"
        >
          Editar
        </button>
      ),
    },
  ];

  return (
    <>
      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection
        htmlTitle={`Control de <em class="text-[#5e0472]">Alumnos y Progreso</em>`}
        htmlSubTitle={`Monitorea el nivel técnico, categorías y estado de salud de los bailarines.`}
        actions={[{
          label: "Registrar Nuevo Alumno →",
          onClick: () => {
            setEditingId(null);
            setFormData(initialFormState);
            setGroupSearch("")
            setErrorMsg(null);
            setIsModalOpen(true);
          },
          icon: <Plus className="w-4 h-4" />,
          variant: "primary",
        }]}
      />
      <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">

        {/* METRICAS RÁPIDAS DE ALUMNOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Resultado total</p>
              <h4 className="text-xl font-anton text-gray-800">{meta.totalItems || 0} Alumnos</h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Recuento de artículos</p>
              <h4 className="text-xl font-anton text-gray-800">{meta.itemCount || 0} Alumnos</h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Elementos por página</p>
              <h4 className="text-xl font-anton text-gray-800">{meta.itemsPerPage || 0} Alumnos</h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Páginas totales</p>
              <h4 className="text-xl font-anton  text-gray-800">{meta.totalPages || 0} Páginas</h4>
            </div>
          </div>
        </div>
        {/* BARRA DE FILTROS Y BÚSQUEDA */}
        <div className="glass-card p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre o estilo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>

          {/* selectores de filtros */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end font-questrial">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Filter className="w-3.5 h-3.5 text-purple-500" />
              <span className="">Parentesco:</span>
            </div>
            <select
              value={kinshipFilter}
              onChange={(e) => handleFilterChange("kinship", e.target.value)}
              className="p-2 border border-purple-100 text-xs bg-white/50 text-gray-700 focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="son">Hijo</option>
              <option value="daughter">Hija</option>
              <option value="nephew">Sobrino</option>
              <option value="niece">Sobrina</option>
              <option value="tutored">Tutorado</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
        {/* TABLA DE ALUMNOS */}
        <DataTable
          data={students}
          columns={columns}
          meta={meta}
          isLoading={isPending}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange} // 👈 Pasamos el manejador del límite
          rowKey={(student) => student.id}
          emptyMessage="No se encontraron alumnos registrados en la academia."
        />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">
            {/* Cabecera del Modal */}

            <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center">
              <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> Nuevo Alumno / Representado
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}

            <form
              onSubmit={handleSave}
              className="p-5 space-y-4 font-questrial text-xs"
            >
              {errorMsg && <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">{errorMsg}</p>}

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    DNI
                  </label>

                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({ ...formData, dni: e.target.value })
                    }
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Nombre
                  </label>

                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Apellido
                  </label>

                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    F. de Nacimiento
                  </label>

                  <input
                    required
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">
                    Parentesco
                  </label>

                  <select
                    value={formData.kinship}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kinship: e.target.value as any,
                      })
                    }
                    className="w-full p-2 border border-purple-100 bg-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="son">Hijo</option>
                    <option value="daughter">Hija</option>
                    <option value="nephew">Sobrino</option>
                    <option value="niece">Sobrina</option>
                    <option value="tutored">Tutorado</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-500 font-bold mb-1">
                  Dirección de Habitación
                </label>
                <input
                  required
                  type="text"
                  placeholder="Calle, Avenida, Edificio / Casa..."
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">
                  Observaciones Médicas o Alergias
                </label>

                <textarea
                  rows={2}
                  value={formData.medicalObservations}
                  onChange={(e) =>
                    setFormData({ ...formData, medicalObservations: e.target.value })
                  }
                  placeholder="Ej: Alérgico a la penicilina, asma, etc."
                  className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 resize-none"
                ></textarea>
              </div>

              {/* ✨ SECCIÓN SELECTOR DE GRUPO (Aparece sólo si es Matrícula Pendiente) */}

              <div className="relative" ref={groupRef}>
                <label className="block text-gray-500 font-bold mb-1">Asignación Obligatoria de Grupo Académico *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="Escribe para buscar o selecciona de la lista..."
                    value={groupSearch}
                    onFocus={() => setShowGroupDropdown(true)} // Al hacer foco abre la lista inicial
                    onChange={(e) => {
                      setGroupSearch(e.target.value);
                      setShowGroupDropdown(true);
                      setFormData({
                        ...formData,
                        groupId: e.target.value as any,
                      })
                      // setError(null);
                    }}
                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 pr-8"
                  />
                  {isLoadingGroups && (
                    <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  )}
                </div>


                {/* ✨ CAMBIO: Se muestra siempre que el dropdown esté activo y tengamos elementos cargados (o cargándose) */}
                {showGroupDropdown && (filteredGroups.length > 0 || isLoadingGroups || groupSearch.trim().length > 0) && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg font-questrial text-xs rounded-none divide-y divide-gray-50">
                    {isLoadingGroups ? (
                      <li className="p-2 text-gray-400 italic">Cargando opciones...</li>
                    ) : filteredGroups.length === 0 ? (
                      <li className="p-2 text-red-400 bg-red-50/30">No se encontraron grupos coincidentes</li>
                    ) : (
                      filteredGroups.map((c: any) => (
                        <li
                          key={c.id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              groupId: c.id as any,
                            })
                            setGroupSearch(`${c.name} (${c.type || 'Aula'})`);
                            setShowGroupDropdown(false);
                          }}
                          className="p-2 hover:bg-purple-50 cursor-pointer transition-colors flex justify-between items-center"
                        >
                          <span className="font-medium text-gray-700">{c.name}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Cap: {c.maxCapacity || c.capacity}</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>


              {/* Botonera */}

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="

                                        font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer

                                        gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90

                                    "
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>);
}