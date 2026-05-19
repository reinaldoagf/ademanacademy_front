// src/app/(dashboard)/alumnos/page.tsx
"use client";

import HeroSection from '@/components/layout/HeroSection';
import { useState } from "react";
import { 
  Users, 
  Heart, 
  Search, 
  Filter, 
  Plus, 
  SlidersHorizontal,
  Award,
  UserCheck2,
  AlertCircle
} from "lucide-react";

// Estructura de datos para los alumnos
interface Alumno {
  id: string;
  nombre: string;
  edad: number;
  categoria: "Baby" | "Infantil" | "Juvenil" | "Adulto";
  estiloPrincipal: string;
  nivel: "Principiante" | "Intermedio" | "Avanzado";
  estadoPago: "Al día" | "Pendiente" | "Retrasado";
  condicionMedica?: string;
  asistenciaMes: number; // Porcentaje
}

const DEMO_ALUMNOS: Alumno[] = [
  { id: "AL-001", nombre: "Valeria Villalobos", edad: 15, categoria: "Juvenil", estiloPrincipal: "Flamenco / Ballet", nivel: "Avanzado", estadoPago: "Al día", asistenciaMes: 95 },
  { id: "AL-002", nombre: "Lucas López", edad: 17, categoria: "Juvenil", estiloPrincipal: "Hip Hop / Urbanos", nivel: "Intermedio", estadoPago: "Al día", asistenciaMes: 88 },
  { id: "AL-003", nombre: "Emma Gómez", edad: 5, categoria: "Baby", estiloPrincipal: "Baby Ballet", nivel: "Principiante", estadoPago: "Pendiente", asistenciaMes: 100 },
  { id: "AL-004", nombre: "Matías Rodríguez", edad: 11, categoria: "Infantil", estiloPrincipal: "Salsa Casino", nivel: "Intermedio", estadoPago: "Retrasado", condicionMedica: "Esguince leve en tobillo izq.", asistenciaMes: 60 },
  { id: "AL-005", nombre: "Camila Fuentes", edad: 24, categoria: "Adulto", estiloPrincipal: "Contemporáneo", nivel: "Avanzado", estadoPago: "Al día", condicionMedica: "Asma crónica", asistenciaMes: 92 },
  { id: "AL-006", nombre: "Sofía Pineda", edad: 8, categoria: "Infantil", estiloPrincipal: "Baby Ballet", nivel: "Principiante", estadoPago: "Al día", asistenciaMes: 85 },
];

export default function AlumnosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("Todos");
  const [nivelFilter, setNivelFilter] = useState<string>("Todos");

  // Filtrado lógico de la tabla
  const filteredAlumnos = DEMO_ALUMNOS.filter((alumno) => {
    const matchesSearch = alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          alumno.estiloPrincipal.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter === "Todos" || alumno.categoria === categoriaFilter;
    const matchesNivel = nivelFilter === "Todos" || alumno.nivel === nivelFilter;
    
    return matchesSearch && matchesCategoria && matchesNivel;
  });

  const handleNewElement = async () => {
    console.log('handleNewElement')
  }
  return (
    <>

    
      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection 
        htmlTitle={`Control de  <em class="text-[#6d0371]">Alumnos y Progreso</em>`}
        htmlSubTitle={`Monitorea el nivel técnico, categorías y estado de salud de los bailarines.`}
        actionLabel={"Registrar Nuevo Alumno →"}
        isActionDisabled={false}
        onAction={handleNewElement}
      />


    <div className="p-4 md:p-8  max-w-7xl mx-auto w-full overflow-y-auto space-y-6">

      {/* METRICAS RÁPIDAS DE ALUMNOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-purple-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Matrícula Activa</p>
            <h4 className="text-xl font-anton text-gray-800">142 Alumnos</h4>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Nivel Avanzado</p>
            <h4 className="text-xl font-anton text-gray-800">28 Bailarines</h4>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-100 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Alertas Médicas</p>
            <h4 className="text-xl font-anton text-gray-800">3 Reportes</h4>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-4">
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
      <div className="glass-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
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
            <span className="">Categoría:</span>
          </div>
          <select 
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="p-2 border border-purple-100 text-xs bg-white/50 text-gray-700 focus:outline-none"
          >
            <option value="Todos">Todas las edades</option>
            <option value="Baby">Baby (3-6 años)</option>
            <option value="Infantil">Infantil (7-12 años)</option>
            <option value="Juvenil">Juvenil (13-17 años)</option>
            <option value="Adulto">Adultos (18+ años)</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-pink-500" />
            <span>Nivel:</span>
          </div>
          <select 
            value={nivelFilter}
            onChange={(e) => setNivelFilter(e.target.value)}
            className="p-2 border border-purple-100 text-xs bg-white/50 text-gray-700 focus:outline-none"
          >
            <option value="Todos">Todos los niveles</option>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </div>
      </div>

      {/* TABLA DE ALUMNOS */}
      <div className="glass-card p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-purple-50 font-questrial">
                <th className="pb-3 font-semibold">Bailarín / ID</th>
                <th className="pb-3 font-semibold">Categoría / Edad</th>
                <th className="pb-3 font-semibold">Estilo de Danza</th>
                <th className="pb-3 font-semibold">Nivel Técnico</th>
                <th className="pb-3 font-semibold">Asistencia Mensual</th>
                <th className="pb-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50/50">
              {filteredAlumnos.length > 0 ? (
                filteredAlumnos.map((alumno) => (
                  <tr key={alumno.id} className="text-gray-700 hover:bg-purple-50/20 transition font-questrial">
                    {/* Alumno e Info Médica */}
                    <td className="py-3.5">
                      <div>
                        <p className="font-bold text-gray-800">{alumno.nombre}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-gray-400 font-mono">{alumno.id}</span>
                          {alumno.condicionMedica && (
                            <span className="flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 font-medium border border-amber-100 animate-pulse">
                              <Heart className="w-2.5 h-2.5 fill-current" /> Condición
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Categoría */}
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 text-xs font-semibold ${
                        alumno.categoria === "Baby" ? "bg-purple-100 text-purple-700" :
                        alumno.categoria === "Infantil" ? "bg-pink-100 text-pink-700" :
                        alumno.categoria === "Juvenil" ? "bg-indigo-100 text-indigo-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {alumno.categoria}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-0.5">{alumno.edad} años</p>
                    </td>

                    {/* Estilo Principal */}
                    <td className="py-3.5 font-medium text-gray-600">
                      {alumno.estiloPrincipal}
                    </td>

                    {/* Nivel Técnico */}
                    <td className="py-3.5">
                      <span className={`text-xs font-bold px-2 py-1 ${
                        alumno.nivel === "Avanzado" ? "text-purple-600 bg-purple-50 " :
                        alumno.nivel === "Intermedio" ? "text-pink-600 bg-pink-50" :
                        "text-gray-500"
                      }`}>
                        {alumno.nivel}
                      </span>
                    </td>

                    {/* Barra de Asistencia */}
                    <td className="py-3.5">
                      <div className="w-32">
                        <div className="flex justify-between text-[11px] text-gray-500 mb-1 font-semibold">
                          <span>{alumno.asistenciaMes}%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${alumno.asistenciaMes < 75 ? 'bg-amber-400' : 'bg-purple-500'}`}
                            style={{ width: `${alumno.asistenciaMes}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 text-right">
                      <button className="text-xs bg-white border border-purple-100 text-purple-600 px-3 py-1 font-semibold hover:bg-purple-600 hover:text-white transition shadow-sm cursor-pointer">
                        Progreso
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                    No se encontraron alumnos con los criterios seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>);
}