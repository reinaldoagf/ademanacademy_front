// src/app/(dashboard)/eventos/page.tsx
"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Ticket, 
  Search, 
  Plus, 
  Music, 
  TrendingUp,
  Users,
  X
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
import { MapaAsientosCanvas } from "@/components/MapaAsientosCanvas";

interface EventoAcademia {
  id: string;
  nombre: string;
  tipo: "Gala Anual" | "Competencia" | "Masterclass" | "Muestra";
  fecha: string;
  lugar: string;
  entradasVendidas: number;
  entradasTotales: number;
  precioEntrada: number;
  estadoProduccion: "Planificación" | "Ensayos Generales" | "Sold Out" | "Concluido";
}

const DEMO_EVENTOS: EventoAcademia[] = [
  { 
    id: "EVE-2026-01", 
    nombre: "Gala de Fin de Año: Metamorfosis 2026", 
    tipo: "Gala Anual", 
    fecha: "2026-12-15", 
    lugar: "Teatro Municipal Principal", 
    entradasVendidas: 480, 
    entradasTotales: 500, 
    precioEntrada: 25, 
    estadoProduccion: "Ensayos Generales" 
  },
  { 
    id: "EVE-2026-02", 
    nombre: "Masterclass Intensiva: Hip Hop Street Style", 
    tipo: "Masterclass", 
    fecha: "2026-07-10", 
    lugar: "Salón Principal Omagie", 
    entradasVendidas: 35, 
    entradasTotales: 35, 
    precioEntrada: 40, 
    estadoProduccion: "Sold Out" 
  },
  { 
    id: "EVE-2026-03", 
    nombre: "Nacional de Danza: Copa Diamond 2026", 
    tipo: "Competencia", 
    fecha: "2026-09-05", 
    lugar: "Polideportivo Central", 
    entradasVendidas: 120, 
    entradasTotales: 300, 
    precioEntrada: 15, 
    estadoProduccion: "Planificación" 
  },
  { 
    id: "EVE-2026-04", 
    nombre: "Muestra de Mitad de Año: Ritmos Urbanos", 
    tipo: "Muestra", 
    fecha: "2026-06-28", 
    lugar: "Anfiteatro de la Plaza", 
    entradasVendidas: 180, 
    entradasTotales: 200, 
    precioEntrada: 10, 
    estadoProduccion: "Ensayos Generales" 
  }
];

export default function EventosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  // ESTADOS PARA LA TAQUILLA MAPA INTERACTIVO
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoAcademia | null>(null);
  const [sillasElegidas, setSillasElegidas] = useState<string[]>([]);
    const abrirTaquillaMapa = (event: EventoAcademia) => {
        console.log({ event })
        setEventoSeleccionado(event);
        setSillasElegidas([]);
        setIsModalOpen(true);
    };
  // Configuración de acciones del HeroSection
  const accionesEventos = [
    {
      label: "Nuevo Evento",
      onClick: () => console.log("Creando evento nuevo..."),
      icon: <Plus className="w-4 h-4" />,
      variant: "secondary" as const
    },
    {
      label: "Vender Entradas →",
      onClick: () => console.log("Abriendo pasarela de tickets..."),
      icon: <Ticket className="w-4 h-4" />,
      variant: "primary" as const
    },
  ];

  // Filtrado de la lista de eventos
  const filteredEventos = DEMO_EVENTOS.filter((eve) => {
    const matchesSearch = eve.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || eve.lugar.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === "Todos" || eve.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  // Métricas financieras y logísticas globales (Basadas exclusivamente en las ventas actuales)
  const totalRecaudadoTickets = DEMO_EVENTOS.reduce((acc, curr) => acc + (curr.entradasVendidas * curr.precioEntrada), 0);
  const totalBailarinesEnEscena = 145; // Dato operativo de la academia
  const eventosProximos = DEMO_EVENTOS.filter(e => e.estadoProduccion !== "Concluido").length;

  return (
    <>
      {/* HERO SECTION DE EVENTOS */}
      <HeroSection 
        htmlTitle={`Producción de <em class="text-[#5e0472]">Eventos y Taquilla</em>`}
        htmlSubTitle="Planifica los espectáculos de la academia, controla el aforo de los teatros y monitorea los ingresos por venta de entradas."
        actions={accionesEventos}
      />

        <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
            {/* REPORTE DE PRODUCCIÓN EXPRESS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Recaudación de Taquilla */}
                <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-purple-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                          Taquilla Proyectada
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                          ${totalRecaudadoTickets.toLocaleString()}
                        </h4>
                        <p className="font-questrial text-xs text-gray-500">
                          Ingresos brutos por boletas vendidas.
                        </p>
                      </div>
                    </div>

                {/* Artistas en escena */}
                <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                          Bailarines Convocados
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                          {totalBailarinesEnEscena} Alumnos
                        </h4>
                        <p className="font-questrial text-xs text-gray-500">
                          Participantes activos en coreografías.
                        </p>
                      </div>
                    </div>


                {/* Producciones Activas */}
                <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                          Fechas en Agenda
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                          {eventosProximos} Activos
                        </h4>
                        <p className="font-questrial text-xs text-gray-500">
                          Espectáculos y talleres en desarrollo.
                        </p>
                      </div>
                    </div>
            </div>

            {/* FILTROS DE AGENDA */}
            <div className="glass-card shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre de gala o teatro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-9 pr-4 py-2 font-questrial border border-purple-100 text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
                </div>

                <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="p-2 w-full sm:w-auto font-questrial border border-purple-100 text-xs bg-white/50 text-gray-700 focus:outline-none"
                >
                <option value="Todos">Todos los formatos</option>
                <option value="Gala Anual">Galas Anuales</option>
                <option value="Competencia">Competencias</option>
                <option value="Masterclass">Masterclasses / Talleres</option>
                <option value="Muestra">Muestras de Aula</option>
                </select>
            </div>

            {/* LISTADO DE EVENTOS */}
            <div className="space-y-4">
                {filteredEventos.length > 0 ? (
                filteredEventos.map((evento) => {
                    const porcentajeVendido = Math.round((evento.entradasVendidas / evento.entradasTotales) * 100);
                    const recaudacionIndividual = evento.entradasVendidas * evento.precioEntrada;
                    const isSoldOut = evento.entradasVendidas === evento.entradasTotales;

                    return (
                    <div key={evento.id} className="glass-card p-5 shadow-sm border border-purple-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition bg-white">
                        
                        {/* Detalles del Evento */}
                        <div className="flex items-start gap-4 lg:w-1/3">
                        <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${
                            evento.tipo === "Gala Anual" ? "bg-purple-100 text-purple-700" :
                            evento.tipo === "Masterclass" ? "bg-pink-100 text-pink-700" :
                            "bg-indigo-100 text-indigo-700"
                        }`}>
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[9px] uppercase font-questrial font-bold tracking-wider text-gray-400 font-mono">{evento.id}</span>
                            <h3 className="font-anton text-gray-800 text-base leading-tight mt-0.5">{evento.nombre}</h3>
                            <span className="text-[10px] bg-purple-50 text-purple-700 font-questrial font-semibold px-2 py-0.5 mt-1 inline-block">
                            {evento.tipo}
                            </span>
                        </div>
                        </div>

                        {/* Logística Física y Fecha */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 lg:w-1/4 font-medium">
                        <div className="flex items-center gap-2 font-questrial">
                            <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>{evento.fecha}</span>
                        </div>
                        <div className="flex items-center gap-2 font-questrial">
                            <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                            <span className="line-clamp-1">{evento.lugar}</span>
                        </div>
                        </div>

                        {/* Control de Aforo y Taquilla */}
                        <div className="space-y-1.5 flex-1 lg:max-w-xs">
                        <div className="flex justify-between text-xs font-questrial font-semibold">
                            <span className="text-gray-400">Entradas vendidas</span>
                            <span className={isSoldOut ? "text-pink-600 font-black animate-pulse" : "text-purple-700"}>
                            {evento.entradasVendidas} / {evento.entradasTotales} ({porcentajeVendido}%)
                            </span>
                        </div>
                        
                        {/* Barra de Progreso de Aforo */}
                        <div className="w-full bg-gray-100 h-1.5 overflow-hidden">
                            <div 
                            className={`h-full transition-all duration-500 ${
                                isSoldOut ? "bg-pink-500" : "gradient-purple"
                            }`}
                            style={{ width: `${porcentajeVendido}%` }}
                            ></div>
                        </div>
                        
                        <p className="font-questrial text-[10px] text-gray-400">
                            Recaudado: <strong className="text-gray-700">${recaudacionIndividual.toLocaleString()}</strong> (${evento.precioEntrada} c/u)
                        </p>
                        </div>

                        {/* Estatus y Botón Acciones */}
                        <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-purple-50/50 shrink-0">
                        <span className={`text-[10px] font-questrial font-semibold uppercase tracking-wider px-3 py-1 ${
                            evento.estadoProduccion === "Sold Out" ? "bg-pink-100 text-pink-700" :
                            evento.estadoProduccion === "Ensayos Generales" ? "bg-purple-100 text-purple-700" :
                            "bg-gray-100 text-gray-500"
                        }`}>
                            {evento.estadoProduccion}
                        </span>

                        {/* Botón de Activación de Mapa */}
              <button 
                onClick={() => abrirTaquillaMapa(evento)}
                disabled={evento.estadoProduccion === "Sold Out"}
                className="text-xs gradient-purple text-white px-4 py-2 font-questrial font-semibold hover:opacity-90 transition shadow-sm disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer"
              >
                {evento.estadoProduccion === "Sold Out" ? "Sold Out" : "Vender e Imprimir Boleto"}
              </button>
                        </div>

                    </div>
                    );
                })
                ) : (
                <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
                    No se encontraron eventos activos o planificados que coincidan con los filtros establecidos.
                </div>
                )}
            </div>
        </div>
        {/* MODAL DETALLE DE SILLAS CON CANVAS */}
      {isModalOpen && eventoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            
            {/* Encabezado Modal */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-questrial font-bold text-purple-600 uppercase tracking-wider">Taquilla en Vivo con Mapa Numerado</span>
                <h3 className="text-lg font-anton text-gray-800 ">{eventoSeleccionado.nombre}</h3>
                <p className="font-questrial text-xs text-gray-400">Selecciona los asientos solicitados por el cliente en taquilla física.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inyección de nuestro mapa interactivo en Canvas */}
            <MapaAsientosCanvas 
              filas={8} 
              columnas={16} 
              onSeleccionChange={(sillas) => setSillasElegidas(sillas)}
            />

            {/* Cierre de Compra y Caja del Modal */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-purple-50">
              <div className="text-center sm:text-left font-questrial">
                <p className="text-xs text-gray-400 font-medium">Monto Total Liquidado en Caja</p>
                <h4 className="text-2xl font-black text-gray-800">
                  ${(sillasElegidas.length * eventoSeleccionado.precioEntrada).toLocaleString()}{" "}
                  <span className="text-xs text-gray-400 font-normal">USD</span>
                </h4>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-purple-100 text-gray-500 text-xs font-questrial font-semibold hover:bg-gray-50 transition flex-1 sm:flex-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  disabled={sillasElegidas.length === 0}
                  onClick={() => {
                    alert(`Venta registrada con éxito. Asientos reservados: ${sillasElegidas.join(", ")}`);
                    setIsModalOpen(false);
                  }}
                  className="px-5 py-2 gradient-purple text-white font-questrial font-semibold text-xs hover:opacity-90 shadow-md shadow-purple-100 transition flex-1 sm:flex-none disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Confirmar Asignación ({sillasElegidas.length})
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}