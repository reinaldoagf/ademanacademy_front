// src/app/(dashboard)/grupos/page.tsx
"use client";
import { useState } from "react";
import { 
  Users, 
  Plus, 
  Layers, 
  MapPin, 
  Clock, 
  Search, 
  AlertTriangle,
  CheckCircle,
  UserCheck
} from "lucide-react";
import HeroSection from '@/components/layout/HeroSection';

interface Grupo {
  id: string;
  nombre: string;
  estilo: string;
  instructor: string;
  horario: string;
  salon: string;
  cuposUsados: number;
  cuposTotales: number;
  categoria: "Baby" | "Infantil" | "Juvenil" | "Adulto";
}

const DEMO_GRUPOS: Grupo[] = [
  { id: "GR-01", nombre: "Baby Ballet Inicial", estilo: "Ballet Clásico", instructor: "María F. Antoni", horario: "Lun y Mie - 03:00 PM", salon: "Salón B (Espejos)", cuposUsados: 18, cuposTotales: 20, categoria: "Baby" },
  { id: "GR-02", nombre: "Salsa Casino Pro", estilo: "Salsa Casino / Rueda", instructor: "Carlos M. Rivas", horario: "Mar y Jue - 07:00 PM", salon: "Salón Principal (Madera)", cuposUsados: 25, cuposTotales: 25, categoria: "Adulto" },
  { id: "GR-03", nombre: "Juvenil Avanzado Gala", estilo: "Contemporáneo / Jazz", instructor: "Valerie Smith", horario: "Lun, Mie y Vie - 04:30 PM", salon: "Salón Principal (Madera)", cuposUsados: 14, cuposTotales: 15, categoria: "Juvenil" },
  { id: "GR-04", nombre: "Hip Hop Comercial", estilo: "Urban / Street Dance", instructor: "Jean K. Lara", horario: "Vie - 06:00 PM", salon: "Salón A (Neon)", cuposUsados: 22, cuposTotales: 30, categoria: "Juvenil" },
  { id: "GR-05", nombre: "Infantil Ritmos Latinos", estilo: "Salsa, Merengue y Bachata", instructor: "Carlos M. Rivas", horario: "Sáb - 10:00 AM", salon: "Salón B (Espejos)", cuposUsados: 8, cuposTotales: 20, categoria: "Infantil" },
  { id: "GR-06", nombre: "Flamenco Adultos Principiantes", estilo: "Flamenco Inicial", instructor: "Lucía Delgado", horario: "Mar y Jue - 05:30 PM", salon: "Salón A (Neon)", cuposUsados: 12, cuposTotales: 15, categoria: "Adulto" },
];

export default function GruposPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("Todos");

  // Filtrado de grupos
  const filteredGrupos = DEMO_GRUPOS.filter((grupo) => {
    const matchesSearch = grupo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          grupo.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          grupo.estilo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = selectedCategoria === "Todos" || grupo.categoria === selectedCategoria;
    return matchesSearch && matchesCategoria;
  });

  // Métricas globales calculadas dinámicamente
  const totalCuposOcupados = DEMO_GRUPOS.reduce((acc, curr) => acc + curr.cuposUsados, 0);
  const totalCuposDisponibles = DEMO_GRUPOS.reduce((acc, curr) => acc + curr.cuposTotales, 0);
  const porcentajeOcupacionGlobal = Math.round((totalCuposOcupados / totalCuposDisponibles) * 100);
  const gruposLlenos = DEMO_GRUPOS.filter(g => g.cuposUsados === g.cuposTotales).length;

  const handleNewElement = async () => {
    console.log('handleNewElement')
  }
  return (
    <>
        
      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection 
        htmlTitle={`Grupos y Control de <em class="text-[#5e0472]">Cupos</em>`}
        htmlSubTitle={`Administra las secciones de baile, horarios asignados e indicadores de aforo.`}
        actionLabel={"Crear Nuevo Grupo →"}
        isActionDisabled={false}
        onAction={handleNewElement}
      />


    <div className="p-4 md:p-8  max-w-7xl mx-auto w-full overflow-y-auto space-y-6">
    
      {/* METRICAS DE CAPACIDAD DE AULA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progreso Circular Ocupación Global */}
        <div className="glass-card p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Ocupación General</p>
            <h4 className="text-2xl font-anton text-purple-700">{porcentajeOcupacionGlobal}%</h4>
            <p className="text-xs font-questrial text-gray-500">{totalCuposOcupados} alumnos inscritos de {totalCuposDisponibles} totales.</p>
          </div>
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-purple-50" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-[#5e0472] transition-all duration-500" strokeDasharray={`${porcentajeOcupacionGlobal}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute text-xs font-questrial font-bold text-gray-700">{porcentajeOcupacionGlobal}%</div>
          </div>
        </div>

        {/* Grupos al límite */}
        <div className="glass-card p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Grupos Agotados (Full)</p>
            <h4 className="text-2xl font-anton text-gray-800">{gruposLlenos} Secciones</h4>
            <p className="text-xs font-questrial text-gray-500">Requieren apertura de listas de espera u horarios espejo.</p>
          </div>
        </div>

        {/* Total de Horas/Salones activos */}
        <div className="glass-card p-4 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Salones en Operación</p>
            <h4 className="text-2xl font-anton text-gray-800">3 Salones Activos</h4>
            <p className="text-xs font-questrial text-gray-500">Distribución de bloques AM y PM optimizados.</p>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por grupo, estilo o profesor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 justify-end">
          {["Todos", "Baby", "Infantil", "Juvenil", "Adulto"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={`px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedCategoria === cat 
                  ? "bg-[#5e0472] text-white shadow-sm shadow-purple-100" 
                  : "bg-white border border-purple-50 text-gray-400 hover:text-[#5e0472]"
              }`}
            >
              {cat === "Todos" ? "Todas las Categorías" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRILLA DE TARJETAS DE GRUPOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGrupos.length > 0 ? (
          filteredGrupos.map((grupo) => {
            const porcentaje = Math.round((grupo.cuposUsados / grupo.cuposTotales) * 100);
            const isFull = grupo.cuposUsados === grupo.cuposTotales;
            const isWarning = !isFull && porcentaje >= 85;

            return (
              <div key={grupo.id} className="glass-card p-5 shadow-sm flex flex-col justify-between border border-purple-50 hover:shadow-md transition">
                <div>
                  {/* Encabezado de Tarjeta */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <span className={`font-questrial text-[10px] font-bold px-2 py-0.5 ${
                        grupo.categoria === "Baby" ? "bg-purple-100 text-purple-700" :
                        grupo.categoria === "Infantil" ? "bg-pink-100 text-pink-700" :
                        grupo.categoria === "Juvenil" ? "bg-indigo-100 text-indigo-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {grupo.categoria}
                      </span>
                      <h3 className="font-anton text-gray-800 text-base mt-1.5 line-clamp-1">{grupo.nombre}</h3>
                      <p className="text-xs text-[#5e0472] font-questrial font-medium">{grupo.estilo}</p>
                    </div>
                    
                    {/* Badge Estado Cupos */}
                    {isFull ? (
                      <span className="flex items-center gap-1 text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 font-questrial font-bold">
                        <AlertTriangle className="w-3 h-3" /> Full
                      </span>
                    ) : isWarning ? (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 font-questrial font-bold">
                        <UserCheck className="w-3 h-3" /> Últimos cupos
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 font-questrial font-bold">
                        <CheckCircle className="w-3 h-3" /> Disponible
                      </span>
                    )}
                  </div>

                  {/* Detalles Técnicos */}
                  <div className="space-y-2 my-4 border-t border-purple-50/50 pt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-questrial">{grupo.horario}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-questrial">{grupo.salon}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-questrial">Prof: <strong className="text-gray-700 font-semibold">{grupo.instructor}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Sección Baja: Barras de Aforo */}
                <div className="mt-2 pt-3 border-t border-purple-50/50">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="text-gray-400 font-questrial font-medium">Capacidad Ocupada</span>
                    <span className={`font-questrial font-bold ${isFull ? "text-red-500" : isWarning ? "text-amber-500" : "text-purple-700"}`}>
                      {grupo.cuposUsados} / {grupo.cuposTotales} Alumnos ({porcentaje}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isFull ? "bg-red-500" : 
                        isWarning ? "bg-amber-400" : 
                        "gradient-purple"
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
            No se encontraron secciones operativas con esos filtros.
          </div>
        )}
      </div>
    </div>
    </>
  );
}