// src/app/(dashboard)/preinscripciones/page.tsx
"use client";

import { useState } from "react";
import { 
  UserPlus, 
  Search, 
  Calendar, 
  Phone, 
  Sparkles, 
  XCircle, 
  Clock,
  Filter
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";

interface Preinscripcion {
  id: string;
  nombreAspirante: string;
  edad: number;
  ritmoInteres: string;
  representante?: string; // Requerido si es menor de edad
  telefono: string;
  fechaSolicitud: string;
  estado: "Pendiente" | "Llamado / En Contacto" | "Clase de Prueba" | "Rechazado";
}

const DEMO_PREINSCRIPCIONES: Preinscripcion[] = [
  { id: "PRE-101", nombreAspirante: "Camila Estévez", edad: 6, ritmoInteres: "Baby Ballet Inicial", representante: "Mariana Estévez", telefono: "+58 412-5551234", fechaSolicitud: "2026-05-21", estado: "Pendiente" },
  { id: "PRE-102", nombreAspirante: "Sebastián Mendez", edad: 16, ritmoInteres: "Hip Hop Comercial", representante: "Roberto Mendez", telefono: "+58 424-5557890", fechaSolicitud: "2026-05-20", estado: "Clase de Prueba" },
  { id: "PRE-103", nombreAspirante: "Amanda Salazar", edad: 23, ritmoInteres: "Salsa Casino / Bachata", telefono: "+58 414-5554321", fechaSolicitud: "2026-05-20", estado: "Llamado / En Contacto" },
  { id: "PRE-104", nombreAspirante: "Antonella Rossi", edad: 5, ritmoInteres: "Baby Ballet Inicial", representante: "Gabriela Rossi", telefono: "+58 412-5556677", fechaSolicitud: "2026-05-18", estado: "Pendiente" },
  { id: "PRE-105", nombreAspirante: "Diego Hurtado", edad: 12, ritmoInteres: "Urban Dance Juvenil", representante: "Patricia Hurtado", telefono: "+58 416-5558899", fechaSolicitud: "2026-05-17", estado: "Rechazado" }
];

export default function PreinscripcionesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [solicitudes, setSolicitudes] = useState<Preinscripcion[]>(DEMO_PREINSCRIPCIONES);

  // Acciones globales para el HeroSection
  const accionesPreinscripciones = [
    {
      label: "Asignar Clases de Prueba Masivas",
      onClick: () => console.log("Abriendo agenda de pruebas..."),
      icon: <Calendar className="w-4 h-4" />,
      variant: "secondary" as const
    },
    {
      label: "Cargar Solicitud Manual  →",
      onClick: () => console.log("Abriendo formulario interno..."),
      icon: <UserPlus className="w-4 h-4" />,
      variant: "primary" as const
    }
  ];

  // Cambiar el estado del aspirante
  const cambiarEstado = (id: string, nuevoEstado: Preinscripcion["estado"]) => {
    setSolicitudes(prev => 
      prev.map(sol => sol.id === id ? { ...sol, estado: nuevoEstado } : sol)
    );
  };

  // Filtrado lógico
  const filteredSolicitudes = solicitudes.filter((sol) => {
    const matchesSearch = sol.nombreAspirante.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sol.ritmoInteres.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === "Todos" || sol.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  // Métricas rápidas de prospección
  const totalNuevas = solicitudes.filter(s => s.estado === "Pendiente").length;
  const enPrueba = solicitudes.filter(s => s.estado === "Clase de Prueba").length;
  const totalRegistros = solicitudes.length;

  return (
    <>
        {/* HERO SECTION */}
        <HeroSection 
            htmlTitle={`Aspirantes y <em class="text-[#5e0472]">Preinscripciones</em>`}
            htmlSubTitle="Gestiona los prospectos que desean unirse a Omagie, programa sus clases de prueba gratuitas y formaliza su ingreso."
            actions={accionesPreinscripciones}
        />

        <div className="p-4 md:p-8  max-w-7xl mx-auto w-full overflow-y-auto space-y-6">
            {/* MÉTRICAS DE ADMISIONES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-purple-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                          Por Contactar
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                          {totalNuevas} Pendientes
                        </h4>
                        <p className="font-questrial text-xs text-gray-500">
                          Nuevas solicitudes desde la web.
                        </p>
                      </div>
                    </div>


<div className="glass-card shadow-sm p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                          Evaluaciones en Salón
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                          {enPrueba} Bailarines
                        </h4>
                        <p className="font-questrial text-xs text-gray-500">
                          Asistirán a una clase introductoria esta semana.
                        </p>
                      </div>
                    </div>

<div className="glass-card shadow-sm p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
                        <Filter className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                          Total Embudo del Mes
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                          {totalRegistros} Leads
                        </h4>
                        <p className="font-questrial text-xs text-gray-500">
                          Interesados totales registrados en el sistema.
                        </p>
                      </div>
                    </div>


            </div>

            {/* FILTROS DE EMBUDO */}
            <div className="glass-card shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                    type="text" 
                    placeholder="Buscar por aspirante o ritmo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 font-questrial border border-purple-100 text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
                />
                </div>

                <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="p-2 w-full sm:w-auto font-questrial border border-purple-100 text-xs bg-white/50 text-gray-700 focus:outline-none"
                >
                <option value="Todos">Ver todos los estatus</option>
                <option value="Pendiente">Pendientes (Nuevos)</option>
                <option value="Llamado / En Contacto">En Seguimiento Telefónico</option>
                <option value="Clase de Prueba">Clases de Prueba Agendadas</option>
                <option value="Rechazado">Inactivos / Declinados</option>
                </select>
            </div>

            {/* LISTA DE SOLICITUDES */}
            <div className="space-y-3">
                {filteredSolicitudes.length > 0 ? (
                filteredSolicitudes.map((sol) => {
                    const esMenor = sol.edad < 18;

                    return (
                    <div 
                        key={sol.id} 
                        className={`glass-card p-5 shadow-sm border transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:shadow-md ${
                        sol.estado === "Pendiente" ? "border-l-4 border-l-amber-500 bg-amber-50/5" :
                        sol.estado === "Clase de Prueba" ? "border-l-4 border-l-purple-600 bg-purple-50/5" :
                        "border-purple-50/60"
                        }`}
                    >
                        {/* Identidad y Edad */}
                        <div className="flex items-start gap-3 lg:w-1/4">
                        <div className="w-9 h-9 font-questrial bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-100">
                            {sol.edad}a
                        </div>
                        <div>
                            <h3 className="font-anton text-gray-800 text-sm leading-tight">{sol.nombreAspirante}</h3>
                            <p className="text-[10px] text-gray-400 font-questrial mt-0.5">{sol.id}</p>
                        </div>
                        </div>

                        {/* Clase de Interés e Información de Contacto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 lg:w-2/5 font-medium">
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-gray-400 font-questrial font-bold">Clase Solicitada</p>
                            <span className="text-purple-700 font-questrial font-bold">{sol.ritmoInteres}</span>
                        </div>
                        <div>
                            <p className="text-[9px] uppercase tracking-wider text-gray-400 font-questrial font-bold flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" /> Contacto
                            </p>
                            <p className="text-gray-700 font-questrial font-semibold">{sol.telefono}</p>
                            {esMenor && (
                            <p className="font-questrial text-[10px] text-gray-400 line-clamp-1">Rep: {sol.representante}</p>
                            )}
                        </div>
                        </div>

                        {/* Estado Actual */}
                        <div className="lg:w-32">
                        <span className={`text-[10px] font-questrial font-bold px-2.5 py-1 inline-block ${
                            sol.estado === "Pendiente" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            sol.estado === "Clase de Prueba" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                            sol.estado === "Llamado / En Contacto" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                            "bg-gray-100 text-gray-400"
                        }`}>
                            {sol.estado}
                        </span>
                        </div>

                        {/* Acciones de Pipeline Comercial */}
                        <div className="flex items-center gap-1.5 self-end lg:self-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-purple-50/50 w-full lg:w-auto justify-end">
                        {sol.estado !== "Clase de Prueba" && sol.estado !== "Rechazado" && (
                            <button 
                            onClick={() => cambiarEstado(sol.id, "Clase de Prueba")}
                            title="Agendar Clase de Cortonía"
                            className="p-1.5 border border-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white transition cursor-pointer"
                            >
                            <Sparkles className="w-4 h-4" />
                            </button>
                        )}
                        
                        {sol.estado === "Pendiente" && (
                            <button 
                            onClick={() => cambiarEstado(sol.id, "Llamado / En Contacto")}
                            title="Marcar como Contactado"
                            className="p-1.5 border border-purple-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition cursor-pointer"
                            >
                            <Phone className="w-4 h-4" />
                            </button>
                        )}

                        <button 
                            onClick={() => cambiarEstado(sol.id, "Rechazado")}
                            title="Descartar solicitud"
                            className="p-1.5 border border-purple-100 text-gray-400 hover:bg-pink-50 hover:text-pink-600 transition cursor-pointer"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                        </div>

                    </div>
                    );
                })
                ) : (
                <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
                    No existen solicitudes de preinscripción activas para el filtro seleccionado.
                </div>
                )}
            </div>
        </div>
    </>
  );
}