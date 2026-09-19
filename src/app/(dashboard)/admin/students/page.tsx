// src/app/(dashboard)/admin/students/page.tsx
"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import {
  Trash2,
  Pencil,
  Users,
  Search,
  Filter,
  Plus,
  Award,
  UserCheck2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useModal } from "@/hooks/useModal";
import HeroSection from "@/components/layout/HeroSection";
import DataTable, { Column } from "@/components/common/DataTable";
import Badge from "@/components/common/Badge";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import DatePipe from "@/components/pipes/DatePipe";
import { MacDockModal } from "@/components/ui/MacDockModal";
import { TextInput, TextArea, SelectInput, SearchInput, DateInput, EmailInput } from '@/components/ui/forms';
import { Student } from "@/types/student";
import {
  saveStudentAction,
  getAllStudentsAction,
  deleteStudentAction
} from "@/app/actions/student";
import { getAllGroupsAction } from "@/app/actions/group";
import { getAllUsersAction } from "@/app/actions/user";
import { Group } from "@/types/group";
import { User } from "@/types/user";

type StudentFormData = {
  dni: string,
  firstName: string,
  lastName: string,
  birthDate: string,
  email: string,
  kinship: Student["kinship"],
  medicalObservations: string,
  address: string,
  shirtSize: string,
  phone: string,
  hasExperience: boolean,
  groupId: string | undefined,
  userId: string | undefined,
};
const initialFormState: StudentFormData = {
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
  userId: "",
};
export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    itemCount: 0,
  });

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [kinshipFilter, setKinshipFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isPending, startTransition] = useTransition();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // --- ESTADOS PARA BÚSQUEDA DE grupos ---
  const [groupSearch, setGroupSearch] = useState("");
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  // Refs para cerrar los menús si el usuario hace click afuera
  const groupRef = useRef<HTMLDivElement>(null);
  // --- ESTADOS PARA BÚSQUEDA DE grupos ---
  const [userSearch, setUserSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);


  const [formData, setFormData] = useState<StudentFormData>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

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
  const closeConfirmModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));
  // Acción definitiva que se ejecuta al pasar el filtro del Modal
  const handleConfirmAction = async () => {
    if (modalConfig?.id) {
      startTransition(async () => {
        if (modalConfig?.id) {
          const res = await deleteStudentAction(modalConfig.id);
          if (res.success) {
            toast.success("Operación exitosa");
            setStudents(students.filter((item) => item.id !== modalConfig.id));
            // 🎯 REACTIVIDAD: Notificamos al Sidebar de forma inmediata
            window.dispatchEvent(new Event('refresh-students-count'));
          }
        }
      });
    }
  };
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
  }, [isOpen, groupSearch]);
  // 🎯 MANEJADORES DE LA TABLA
  // --- EFFECT PARA usuarios (Vía Server Action) ---
  useEffect(() => {
    // Evitamos re-consultar si el string coincide con el elemento ya seleccionado
    if (filteredUsers.find(c => c.id === formData.userId)?.name === userSearch) {
      return;
    }

    setIsLoadingUsers(true);

    const isSearchEmpty = !userSearch.trim();
    const delay = isSearchEmpty ? 0 : 400;

    const delayDebounce = setTimeout(async () => {
      try {
        // Construimos los parámetros requeridos por FetchUsersParams
        const params = isSearchEmpty
          ? { limit: 5 }
          : { search: userSearch.trim() };

        // Llamada directa al Server Action
        const result = await getAllUsersAction(params);

        if (result.success && result.data) {
          // Axios mapea la respuesta en result.data. data.data suele ser el array
          // Si tu backend anida los grupos en 'users', úsalo; de lo contrario asigna result.data
          setFilteredUsers(result.data.users || result.data);
        } else {
          console.error("Error en Server Action (usuarios):", result.error);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error crítico buscando usuarios:", error);
        setFilteredUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    }, delay);

    return () => clearTimeout(delayDebounce);
  }, [isOpen, userSearch]);
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
      closeModal();
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
            </div>
          </div>
        );
      },
    },
    {
      header: "Fecha de Nacimiento",
      render: (student) => {
        if (student.birthDate)
          return <p className="text-[11px] text-gray-400 mt-0.5">
            <DatePipe value={student.birthDate} format="short" />
          </p>
        return <p className="text-[11px] text-gray-400 mt-0.5">
          Facha no válida
        </p>
      },
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
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              setEditingId(student.id);

              // 🎯 CORRECCIÓN: Manejo robusto de fechas (sea Date o string ISO de la API)
              let formattedBirthDate = "";
              if (student.birthDate) {
                const dateObj = student.birthDate instanceof Date
                  ? student.birthDate
                  : new Date(student.birthDate);

                if (!isNaN(dateObj.getTime())) {
                  // Extrae YYYY-MM-DD considerando la zona horaria local
                  const year = dateObj.getFullYear();
                  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                  const day = String(dateObj.getDate()).padStart(2, '0');
                  formattedBirthDate = `${year}-${month}-${day}`;
                }
              }

              setFormData({
                dni: student.dni,
                firstName: student.firstName,
                lastName: student.lastName,
                birthDate: formattedBirthDate, // 👈 Ahora sí recibe "YYYY-MM-DD"
                email: student.user?.email || '',
                kinship: student.kinship,
                medicalObservations: student.medicalObservations || "",
                address: student.address,
                shirtSize: student.shirtSize,
                phone: student.phone,
                hasExperience: student.hasExperience,
                groupId: student.groupId,
                userId: student.userId,
              });

              setGroupSearch(student.group?.name || "");
              setUserSearch(student.user?.name || "");
              openModal();
            }}
            className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
          <button onClick={() => {
            setModalConfig({
              isOpen: true,
              type: "word",
              title: "Confirmar operación",
              description: "¿Quieres eliminar el registro del alumno?",
              id: student.id,
            });
          }}
            disabled={!!student.user}

            className={`
               flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-questrial font-bold  rounded-xl transition-colors active:scale-95 ${!student.user ? "cursor-pointer text-rose-600 bg-rose-50 hover:bg-rose-100" : "bg-gray-200"}`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </button>
        </div>
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
            openModal();
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
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="all">Todos</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="son">Hijo</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="daughter">Hija</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="nephew">Sobrino</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="niece">Sobrina</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="tutored">Tutorado</option>
              <option className="font-questrial font-bold cursor-pointer text-purple-700 bg-purple-50" value="other">Otro</option>
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
      <MacDockModal
        isOpen={isOpen}
        onClose={closeModal}
        title={editingId ? "Actualizar Estudiante" : "Registrar Nuevo Estudiante"}
        size={"lg"}
      >
        {/* Formulario */}

        <form
          onSubmit={handleSave}
          className="space-y-4 font-questrial text-xs"
        >
          {errorMsg && <p className="text-red-500 bg-red-50 p-2 rounded text-sm text-center mb-4">{errorMsg}</p>}

          <div className="grid grid-cols-2 gap-3">

            <TextInput
              label="DNI"
              required
              type="text"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              placeholder="DNI"
            />
            <EmailInput
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={formData.email || ""}
              onChange={(val) => setFormData({ ...formData, email: val })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">

            <TextInput
              label="Nombre"
              required
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Nombre"
            />

            <TextInput
              label="Apellido"
              required
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Apellido"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DateInput
              label="Fecha de Nacimiento"
              value={formData.birthDate}
              onChange={(val) => setFormData({ ...formData, birthDate: val })}
            />

            <SelectInput
              label="Parentesco"
              value={formData.kinship}
              onChange={(e) => setFormData({ ...formData, kinship: e.target.value as Student["kinship"] })}
              options={[
                { label: "Selecciona un parentesco", value: "", disabled: true },
                { label: "Hijo", value: "son" },
                { label: "Hija", value: "daughter" },
                { label: "Sobrino", value: "nephew" },
                { label: "Sobrina", value: "niece" },
                { label: "Tutorado", value: "tutored" },
                { label: "Otro", value: "other" },
              ]}
            />

          </div>
          <TextArea
            label="Dirección de Habitación"
            placeholder="Ej. Calle Principal #123..."
            required
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <TextArea
            label="Observaciones Médicas o Alergias"
            placeholder="Ej: Alérgico a la penicilina, asma, etc."
            rows={3}
            value={formData.medicalObservations}
            onChange={(e) => setFormData({ ...formData, medicalObservations: e.target.value })}
          />

          {/* ✨ SECCIÓN SELECTOR DE GRUPO (Aparece sólo si es Matrícula Pendiente) */}
          <SearchInput
            label="Asignación Obligatoria de Grupo Académico"
            placeholder="Escribe para buscar o selecciona de la lista..."
            value={groupSearch}
            isLoading={isLoadingGroups}
            options={filteredGroups.map((group: any) => ({
              id: group.id,
              label: group.name,
              subLabel: `Categoría: ${group.category?.name}, Nivel: ${group.level?.name}`,
              data: group, // Guardamos el objeto completo si hace falta
            }))}
            emptyMessage="No se encontraron grupos coincidentes"
            onChangeText={(text) => {
              setGroupSearch(text);
              setFormData({
                ...formData,
                groupId: text as any,
              });
            }}
            onSelectOption={(option) => {
              setFormData({
                ...formData,
                groupId: option.id as any,
              });
              setGroupSearch(`${option.label} (${option.data?.level} - ${option.data?.section})`);
            }}
          />

          {/* ✨ SECCIÓN SELECTOR DE GRUPO (Aparece sólo si es Matrícula Pendiente) */}
          <SearchInput
            label="Asignación de representante académico"
            placeholder="Escribe para buscar o selecciona de la lista..."
            value={userSearch}
            isLoading={isLoadingUsers}
            options={filteredUsers.map((user: any) => ({
              id: user.id,
              label: user.name,
              subLabel: `Email: ${user.email}`,
              data: user, // Guardamos el objeto completo si hace falta
            }))}
            emptyMessage="No se encontraron usuarios coincidentes"
            onChangeText={(text) => {
              setUserSearch(text);
              setFormData({
                ...formData,
                userId: text as any,
              });
            }}
            onSelectOption={(option) => {
              setFormData({
                ...formData,
                userId: option.id as any,
              });
              setUserSearch(`${option.label} (${option.data?.email || 'Usuario'})`);
            }}
          />


          {/* Botonera */}

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => closeModal()}
              className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 rounded-md"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
            >
              {isPending
                ? "Guardando..."
                : editingId
                  ? "Actualizar Alumno"
                  : "Registrar Alumno"}
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
    </>);
}