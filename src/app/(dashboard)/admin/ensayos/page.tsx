// src/app/(dashboard)/ensayos/page.tsx
"use client";

import { useState } from "react";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Search, 
  Layers, 
  Sparkles,
  BookmarkCheck,
  Flame
} from "lucide-react";
import HeroSection from '@/components/layout/HeroSection';

interface Actividad {
  id: string;
  tipo: "clase" | "ensayo_extra";
  titulo: string;
  grupo: string;
  profesor: string;
  salon: string;
  bloqueHorario: string;
  prioridad: "Normal" | "Crítica" | "Montaje Final";
  estado: "Programado" | "En Curso" | "Concluido";
}

const DEMO_ACTIVIDADES: Actividad[] = [
  { id: "ACT-101", tipo: "clase", titulo: "Técnica de Puntas Avanzado", grupo: "Juvenil Avanzado", profesor: "Valerie Smith", salon: "Salón Principal (Madera)", bloqueHorario: "03:00 PM - 04:30 PM", prioridad: "Normal", estado: "Concluido" },
  { id: "ACT-102", tipo: "ensayo_extra", titulo: "Montaje Coreográfico: Apertura Gala", grupo: "Elenco de Competencia", profesor: "Jean K. Lara", salon: "Salón Principal (Madera)", bloqueHorario: "04:30 PM - 06:30 PM", prioridad: "Montaje Final", estado: "En Curso" },
  { id: "ACT-103", tipo: "clase", titulo: "Urban Dance Comercial", grupo: "Juvenil Inicial", profesor: "Jean K. Lara", salon: "Salón A (Neon)", bloqueHorario: "05:00 PM - 06:00 PM", prioridad: "Normal", estado: "Programado" },
  { id: "ACT-104", tipo: "clase", titulo: "Ritmos Latinos / Bachata", grupo: "Adultos Principiantes", profesor: "Carlos M. Rivas", salon: "Salón B (Espejos)", bloqueHorario: "06:30 PM - 08:00 PM", prioridad: "Normal", estado: "Programado" },
  { id: "ACT-105", tipo: "ensayo_extra", titulo: "Ensayo General: Dúo Contemporáneo", grupo: "Sofía y Lucas (Solistas)", profesor: "Valerie Smith", salon: "Salón A (Neon)", bloqueHorario: "06:00 PM - 07:30 PM", prioridad: "Crítica", estado: "Programado" },
];

export default function EnsayosPage() {
  const [activeTab, setActiveTab] = useState<"todos" | "clases" | "ensayos">("todos");
  const [salonFilter, setSalonFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrado lógico de la agenda de hoy
  const filteredActividades = DEMO_ACTIVIDADES.filter((act) => {
    const matchesTab = activeTab === "todos" || 
                     (activeTab === "clases" && act.tipo === "clase") || 
                     (activeTab === "ensayos" && act.tipo === "ensayo_extra");
    
    const matchesSalon = salonFilter === "Todos" || act.salon.includes(salonFilter);
    
    const matchesSearch = act.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          act.grupo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          act.profesor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSalon && matchesSearch;
  });

  // Métricas rápidas para la coordinación del día
  const totalHoy = DEMO_ACTIVIDADES.length;
  const enCurso = DEMO_ACTIVIDADES.filter(a => a.estado === "En Curso").length;
  const ensayosExtra = DEMO_ACTIVIDADES.filter(a => a.tipo === "ensayo_extra").length;

  const handleNewElement = async () => {
    console.log('handleNewElement')
  }
  return (
    <>
                
        {/* SUB-TOPBAR (Saludos y Acción rápida) */}
        <HeroSection 
          htmlTitle={`Cronograma de <em class="text-[#5e0472]">Ensayos y Clases</em>`}
          htmlSubTitle={`Monitorea el uso de los salones, bloques de danza del día y montajes extraordinarios.`}
          actionLabel={"Agendar Bloque / Ensayo →"}
          isActionDisabled={false}
          onAction={handleNewElement}
        />

    <div className="p-4 md:p-8  max-w-7xl mx-auto w-full overflow-y-auto space-y-6">
      {/* METRICAS OPERATIVAS DEL DÍA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Bloques Hoy</p>
            <h4 className="text-xl font-anton text-gray-800">{totalHoy} Sesiones</h4>
          </div>
        </div>

        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Ensayos de Gala</p>
            <h4 className="text-xl font-anton text-gray-800">{ensayosExtra} Extraordinarios</h4>
          </div>
        </div>

        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Clases Activas Ahora</p>
            <h4 className="text-xl font-anton text-gray-800">{enCurso} En Salón</h4>
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGACIÓN Y FILTROS BAR */}
      <div className="glass-card p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Buscador e Infraestructura */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center justify-end">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar profesor, coreografía..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>
          <select
            value={salonFilter}
            onChange={(e) => setSalonFilter(e.target.value)}
            className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
          >
            <option value="Todos">Todos los salones</option>
            <option value="Principal">Salón Principal</option>
            <option value="Salón A">Salón A (Neon)</option>
            <option value="Salón B">Salón B (Espejos)</option>
          </select>
        </div>
        {/* Pestañas de Tipo */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 justify-end">
          <button 
            onClick={() => setActiveTab("todos")}
            className={`px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "todos" ? "bg-[#5e0472] text-white shadow-sm shadow-purple-100" : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"}`}
          >
            Todo el día
          </button>
          <button 
            onClick={() => setActiveTab("clases")}
            className={`px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "clases" ? "bg-[#5e0472] text-white shadow-sm shadow-purple-100" : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"}`}
          >
            Clases Malla
          </button>
          <button 
            onClick={() => setActiveTab("ensayos")}
            className={`px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer whitespace-nowrap ${activeTab === "ensayos" ? "bg-[#5e0472] text-white shadow-sm shadow-purple-100" : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"}`}
          >
            Ensayos Extras
          </button>
        </div>
      </div>

      {/* FLUJO TIPO TIME-LINE / TARJETAS */}
      <div className="space-y-4">
        {filteredActividades.length > 0 ? (
          filteredActividades.map((act) => (
            <div 
              key={act.id} 
              className={`glass-card p-5 shadow-sm border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                act.estado === "En Curso" ? "border-l-4 border-l-[#5e0472] bg-purple-50/10" : "border-purple-50/60"
              }`}
            >
              {/* Información e Identificador */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:w-2/5">
                {/* Iconografía por tipo */}
                <div className={`w-11 h-11 flex items-center justify-center shrink-0 ${
                  act.tipo === "clase" ? "bg-purple-100 text-purple-700" : "bg-pink-100 text-pink-700"
                }`}>
                  {act.tipo === "clase" ? <BookmarkCheck className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap font-questrial">
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-bold ${
                      act.prioridad === "Montaje Final" ? "bg-red-100 text-red-700" :
                      act.prioridad === "Crítica" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {act.prioridad}
                    </span>
                    <span className="text-[10px] text-gray-400 font-questrial">{act.id}</span>
                  </div>
                  <h3 className="font-anton text-gray-800 text-base mt-1">{act.titulo}</h3>
                  <p className="text-xs text-gray-500 font-questrial font-medium">{act.grupo}</p>
                </div>
              </div>

              {/* Logística de Salón y Profesor */}
              <div className="grid grid-cols-2 gap-3 text-xs md:w-2/5 text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="font-questrial">{act.bloqueHorario}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                  <span className="font-questrial line-clamp-1">{act.salon}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <User className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-questrial">Dirige: <strong className="text-gray-700 font-semibold">{act.profesor}</strong></span>
                </div>
              </div>

              {/* Estado de Ejecución en Salón */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-purple-50/50 shrink-0 font-questrial">
                <span className={`text-xs font-bold px-3 py-1 ${
                  act.estado === "En Curso" ? "bg-purple-100 text-purple-700 animate-pulse" :
                  act.estado === "Concluido" ? "bg-gray-100 text-gray-400" :
                  "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}>
                  {act.estado}
                </span>

                <button className="text-xs bg-white border border-purple-100 text-[#5e0472] px-3 py-1.5 font-semibold hover:bg-[#5e0472] hover:text-white transition shadow-sm cursor-pointer">
                  Gestionar
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
            No hay clases ni bloques de ensayo pautados para este filtro en la agenda de hoy.
          </div>
        )}
      </div>

    </div>
    </>
  );
}