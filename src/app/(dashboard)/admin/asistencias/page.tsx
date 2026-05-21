// src/app/(dashboard)/asistencias/page.tsx
"use client";

import { useState } from "react";
import { 
  CheckSquare, 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar, 
  Users, 
  Save, 
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import HeroSection from '@/components/layout/HeroSection';

interface AlumnoAsistencia {
  id: string;
  nombre: string;
  avatarInitials: string;
  estado: "presente" | "ausente" | "tarde" | null;
  nota?: string;
}

// Datos demo de alumnos inscritos en el grupo seleccionado
const DEMO_ALUMNOS_ASISTENCIA: AlumnoAsistencia[] = [
  { id: "AL-001", nombre: "Valeria Villalobos", avatarInitials: "VV", estado: "presente" },
  { id: "AL-002", nombre: "Lucas López", avatarInitials: "LL", estado: "presente" },
  { id: "AL-003", nombre: "Emma Gómez", avatarInitials: "EG", estado: null },
  { id: "AL-004", nombre: "Matías Rodríguez", avatarInitials: "MR", estado: "tarde", nota: "Aviso de retraso por tráfico" },
  { id: "AL-005", nombre: "Camila Fuentes", avatarInitials: "CF", estado: "ausente" },
  { id: "AL-006", nombre: "Sofía Pineda", avatarInitials: "SP", estado: null },
];

export default function AsistenciasPage() {
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("GR-01");
  const [fechaAsistencia, setFechaAsistencia] = useState("2026-05-21"); // Fecha fija basada en el año del proyecto
  const [alumnos, setAlumnos] = useState<AlumnoAsistencia[]>(DEMO_ALUMNOS_ASISTENCIA);
  const [searchTerm, setSearchTerm] = useState("");
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Cambiar el estado de asistencia de un alumno específico
  const marcarEstado = (id: string, nuevoEstado: "presente" | "ausente" | "tarde") => {
    setAlumnos(prev => 
      prev.map(alumno => 
        alumno.id === id ? { ...alumno, estado: alumno.estado === nuevoEstado ? null : nuevoEstado } : alumno
      )
    );
    if (guardadoExitoso) setGuardadoExitoso(false);
  };

  // Agregar una nota rápida (ej. justificación de falta o tardanza)
  const agregarNota = (id: string, nota: string) => {
    setAlumnos(prev => 
      prev.map(alumno => alumno.id === id ? { ...alumno, nota } : alumno)
    );
  };

  // Simular envío a la base de datos
  const saveAttendance = () => {
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 4000);
  };

  // Estadísticas del día en tiempo real
  const totalAlumnos = alumnos.length;
  const presentes = alumnos.filter(a => a.estado === "presente").length;
  const tardanzas = alumnos.filter(a => a.estado === "tarde").length;
  const ausentes = alumnos.filter(a => a.estado === "ausente").length;
  const pendientes = alumnos.filter(a => a.estado === null).length;

  // Filtrar por barra de búsqueda
  const alumnosFiltrados = alumnos.filter(a => 
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <>
          
        {/* SUB-TOPBAR (Saludos y Acción rápida) */}
        <HeroSection 
          htmlTitle={`Control de <em class="text-[#5e0472]">Asistencias</em>`}
          htmlSubTitle={`Registra el ingreso diario de los bailarines a sus respectivos salones.`}
          actions={[{
              label: "Guardar Lista de Hoy →",
              onClick: saveAttendance,
              icon: <Save className="w-4 h-4" />,
          }]}
        />

    <div className="p-4 md:p-8  max-w-7xl mx-auto w-full overflow-y-auto space-y-6">
      {/* MENSAJE DE NOTIFICACIÓN DE GUARDADO */}
      {guardadoExitoso && (
        <div className="font-questrial bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 flex items-center gap-2 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ¡Asistencia guardada con éxito! El sistema ha actualizado los reportes de deserción y enviado las notificaciones.
        </div>
      )}

      {/* SELECTORES PRINCIPALES (CONFIGURACIÓN DE LA CLASE) */}
      <div className="glass-card shadow-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Selector de Grupo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-questrial font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3 h-3 text-purple-500" /> Grupo / Clase
          </label>
          <select 
            value={grupoSeleccionado}
            onChange={(e) => setGrupoSeleccionado(e.target.value)}
            className="p-2.5 border border-purple-100 text-xs bg-white font-questrial text-gray-700 focus:outline-none"
          >
            <option value="GR-01">Baby Ballet Inicial (Lun y Mie - 03:00 PM)</option>
            <option value="GR-02">Salsa Casino Pro (Mar y Jue - 07:00 PM)</option>
            <option value="GR-03">Juvenil Avanzado Gala (Lun, Mie, Vie - 04:30 PM)</option>
            <option value="GR-04">Hip Hop Comercial (Vie - 06:00 PM)</option>
          </select>
        </div>

        {/* Selector de Fecha */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-questrial font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-pink-500" /> Fecha de Sesión
          </label>
          <input 
            type="date" 
            value={fechaAsistencia}
            onChange={(e) => setFechaAsistencia(e.target.value)}
            className="p-2.5 border border-purple-100 text-xs bg-white font-questrial text-gray-700 focus:outline-none"
          />
        </div>

        {/* Buscador Rápido de Alumno */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-questrial font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Search className="w-3 h-3 text-indigo-500" /> Filtrar Bailarín
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-purple-100 text-xs bg-white font-questrial focus:outline-none text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* WIDGET DE RESUMEN DE ASISTENCIA DEL DÍA */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                <Users className="w-5 h-5" />
            </div>
            <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Inscritos</p>
                <h4 className="text-xl font-anton text-gray-800">{totalAlumnos}</h4>
            </div>
        </div>
        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                <Users className="w-5 h-5" />
            </div>
            <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Presentes</p>
                <h4 className="text-xl font-anton text-gray-800">{presentes}</h4>
            </div>
        </div>
        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                <Users className="w-5 h-5" />
            </div>
            <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Tardanzas</p>
                <h4 className="text-xl font-anton text-gray-800">{tardanzas}</h4>
            </div>
        </div>
        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                <Users className="w-5 h-5" />
            </div>
            <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Ausentes</p>
                <h4 className="text-xl font-anton text-gray-800">{ausentes}</h4>
            </div>
        </div>
        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                <Users className="w-5 h-5" />
            </div>
            <div>
                <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Pendientes</p>
                <h4 className="text-xl font-anton text-gray-800">{pendientes}</h4>
            </div>
        </div>
      </div>

      {/* DETALLE Y ACCIONES POR BAILARÍN */}
      <div className="glass-card p-6 shadow-sm">
        <div className="space-y-3">
          {alumnosFiltrados.length > 0 ? (
            alumnosFiltrados.map((alumno) => (
              <div 
                key={alumno.id} 
                className={`p-3 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  alumno.estado === "presente" ? "bg-emerald-50/30 border-emerald-100" :
                  alumno.estado === "ausente" ? "bg-pink-50/30 border-pink-100" :
                  alumno.estado === "tarde" ? "bg-amber-50/30 border-amber-100" :
                  "bg-white/40 border-purple-50/50 hover:bg-white/80"
                }`}
              >
                {/* Info Alumno */}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 font-bold text-xs flex items-center justify-center shrink-0 ${
                    alumno.estado === "presente" ? "bg-emerald-100 text-emerald-700" :
                    alumno.estado === "ausente" ? "bg-pink-100 text-pink-700" :
                    alumno.estado === "tarde" ? "bg-amber-100 text-amber-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {alumno.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-anton text-gray-800 text-sm">{alumno.nombre}</h4>
                    <p className="text-[10px] text-gray-400 font-questrial">{alumno.id}</p>
                  </div>
                </div>

                {/* Nota o justificación opcional interna */}
                <div className="flex-1 sm:max-w-xs md:max-w-md">
                  <input 
                    type="text" 
                    placeholder="Añadir observación o justificación..."
                    value={alumno.nota || ""}
                    onChange={(e) => agregarNota(alumno.id, e.target.value)}
                    className="font-questrial w-full bg-white/50 border border-purple-50/50 px-2 py-1 text-[11px] text-gray-600 focus:outline-none focus:bg-white"
                  />
                </div>

                {/* BOTONES DE CONTROL DE ESTADO DE ASISTENCIA */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {/* Botón Presente */}
                  <button
                    onClick={() => marcarEstado(alumno.id, "presente")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer border ${
                      alumno.estado === "presente"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-100"
                        : "bg-white text-gray-400 border-gray-100 hover:text-emerald-600 hover:bg-emerald-50/50"
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Asistió
                  </button>

                  {/* Botón Retraso */}
                  <button
                    onClick={() => marcarEstado(alumno.id, "tarde")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer border ${
                      alumno.estado === "tarde"
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-100"
                        : "bg-white text-gray-400 border-gray-100 hover:text-amber-600 hover:bg-amber-50/50"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Tarde
                  </button>

                  {/* Botón Ausente */}
                  <button
                    onClick={() => marcarEstado(alumno.id, "ausente")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer border ${
                      alumno.estado === "ausente"
                        ? "bg-pink-500 text-white border-pink-500 shadow-sm shadow-pink-100"
                        : "bg-white text-gray-400 border-gray-100 hover:text-pink-600 hover:bg-pink-50/50"
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" /> Faltó
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">
              No hay alumnos que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}