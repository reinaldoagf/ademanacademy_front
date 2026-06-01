// src/app/(dashboard)/students/page.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import DatePipe from "@/components/common/DatePipe";
import { Student } from "@/types/student";
import {
  saveStudentAction,
  getAllStudentsAction
} from "@/app/actions/student";


export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [kinshipFilter, setKinshipFilter] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);

  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    dni: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    kinship: "Hijo" as Student["kinship"],
    medicalObservations: "",
  });

  // 🔄 Efecto reactivo con debounce para consultas al servidor
  useEffect(() => {
    const loadStudents = () => {
      startTransition(async () => {
        const res = await getAllStudentsAction({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          kinship: kinshipFilter !== "Todos" ? kinshipFilter : undefined,
        });

        console.log({ res })

        if (res.success && res.data) {
          setStudents(res.data);
          setMeta(res.meta);
        }
      });
    };

    const handler = setTimeout(loadStudents, 300); // 300ms de Debounce
    return () => clearTimeout(handler);
  }, [searchTerm, kinshipFilter, currentPage]);

  // Si cambia un filtro de categoría o nivel, reseteamos a la página 1
  const handleFilterChange = (type: "kinship", value: string) => {
    console.log('handleFilterChange')
    if (type === "kinship") setKinshipFilter(value);
    setCurrentPage(1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    startTransition(async () => {
      const res = await saveStudentAction(formData, null);
      if (!res.success) {
        setErrorMsg(res.error || "Ocurrió un error.");
        return;
      }

      setStudents([res.data!, ...students]);
      // 🎯 REACTIVIDAD: Si era una creación (id nuevo), el badge debe subir
      window.dispatchEvent(new Event('refresh-represented-count'));
      setIsOpen(false);
    });
  };
  const handleNewElement = () => console.log('Registrar nuevo elemento modal');
  return (
    <>
      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection
        htmlTitle={`Control de  <em class="text-[#5e0472]">Alumnos y Progreso</em>`}
        htmlSubTitle={`Monitorea el nivel técnico, categorías y estado de salud de los bailarines.`}
        actions={[{
          label: "Registrar Nuevo Alumno →",
          onClick: () => {
            setFormData({
              dni: "",
              firstName: "",
              lastName: "",
              birthDate: "",
              kinship: "Hijo",
              medicalObservations: "",
            });
            setErrorMsg(null);
            setIsOpen(true);
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
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Matrícula Activa</p>
              <h4 className="text-xl font-anton text-gray-800">142 Alumnos</h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Nivel Avanzado</p>
              <h4 className="text-xl font-anton text-gray-800">28 Bailarines</h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Alertas Médicas</p>
              <h4 className="text-xl font-anton text-gray-800">3 Reportes</h4>
            </div>
          </div>

          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Asistencia Promedio</p>
              <h4 className="text-xl font-anton  text-gray-800">91.4 %</h4>
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
              <option value="Todos">Todos</option>
              <option value="Hijo">Hijo</option>
              <option value="Hija">Hija</option>
              <option value="Sobrino">Sobrino</option>
              <option value="Sobrina">Sobrina</option>
              <option value="Tutorado">Tutorado</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        {/* TABLA DE ALUMNOS */}
        <div className="glass-card p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-purple-50 font-questrial">
                  <th className="pb-3 font-semibold">Bailarín / DNI</th>
                  <th className="pb-3 font-semibold">Representante</th>
                  <th className="pb-3 font-semibold">Fecha de Nacimiento</th>
                  <th className="pb-3 font-semibold">Parentesco</th>
                  <th className="pb-3 font-semibold">Asistencia Mensual</th>
                  <th className="pb-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/50">
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="text-gray-700 hover:bg-purple-50/20 transition font-questrial">
                      <td className="py-3.5">
                        <div
                          className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider">
                            {student.firstName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                            {student.lastName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                          </div>

                          <div className="hidden md:flex flex-col text-left font-questrial">
                            <span className="text-xs font-bold text-gray-700 leading-tight">{student.firstName} {student.lastName}</span>
                            <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{student.dni}</span>
                          </div>

                        </div>
                      </td>
                      <td className="py-3.5">
                        {
                          student.user ?
                            <div
                              className="flex items-center gap-2 p-1 hover:bg-purple-50/80 transition-all cursor-pointer rounded-sm"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#5e0472] flex items-center justify-center text-white text-xs font-anton tracking-wider">
                                {student.user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                              </div>

                              <div className="hidden md:flex flex-col text-left font-questrial">
                                <span className="text-xs font-bold text-gray-700 leading-tight">{student.user.name}</span>
                                <span className="text-[10px] text-gray-400 max-w-[120px] truncate">{student.user.email}</span>
                              </div>

                            </div>
                            : <p className="text-[11px] text-gray-400 mt-0.5">
                              Sin representante
                            </p>
                        }

                      </td>
                      <td className="py-3.5">
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          <DatePipe value={student.birthDate} format="short" />
                        </p>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700">
                          {student.kinship}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <div className="w-32">
                          <span className="text-[11px] text-gray-500 font-semibold">{0}%</span>
                          <div className="w-full bg-gray-100 h-1.5 overflow-hidden mt-1">
                            <div className="h-full bg-purple-500" style={{ width: `${0}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <button className="text-xs bg-white border border-purple-100 text-[#5e0472] px-3 py-1 font-semibold hover:bg-[#5e0472] hover:text-white transition shadow-sm">
                          Progreso
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                      No se encontraron alumnos en el servidor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* CONTROLES DE PAGINACIÓN */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-purple-50 pt-4 mt-4 font-questrial text-xs text-gray-500">
              <p>Mostrando página <b>{meta.currentPage}</b> de <b>{meta.totalPages}</b></p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1 || isPending}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="cursor-pointer p-1.5 border border-purple-100 bg-white hover:bg-purple-50 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage === meta.totalPages || isPending}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="cursor-pointer p-1.5 border border-purple-100 bg-white hover:bg-purple-50 disabled:opacity-40 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-purple-100 shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">
            {/* Cabecera del Modal */}

            <div className="bg-purple-50/50 px-5 py-4 border-b border-purple-100 flex justify-between items-center">
              <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> Nuevo Alumno /
                Representado
              </h3>

              <button
                onClick={() => setIsOpen(false)}
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
                    <option value="Hijo">Hijo</option>

                    <option value="Hija">Hija</option>

                    <option value="Sobrino">Sobrino</option>

                    <option value="Sobrina">Sobrina</option>

                    <option value="Tutorado">Tutorado</option>

                    <option value="Otro">Otro</option>
                  </select>
                </div>
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

              {/* Botonera */}

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
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