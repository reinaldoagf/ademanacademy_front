// src/app/(dashboard)/vestuarios/page.tsx
"use client";

import { useState } from "react";
import HeroSection from '@/components/layout/HeroSection';
import { 
  Scissors, 
  Shirt, 
  Search, 
  Tag, 
  UserCheck2, 
  AlertTriangle,
  Plus,
  RefreshCw
} from "lucide-react";

interface Vestuario {
  id: string;
  nombre: string;
  ritmo: string;
  categoria: "Baby" | "Infantil" | "Juvenil" | "Adulto";
  tallasDisponibles: { talla: string; cantidad: number }[];
  totalUnidades: number;
  asignados: number;
  estado: "Listo" | "En Costura" | "Por Lavar";
}

const DEMO_VESTUARIOS: Vestuario[] = [
  { 
    id: "VES-001", 
    nombre: "Tutu Gala Lago de los Cisnes", 
    ritmo: "Ballet Clásico", 
    categoria: "Juvenil",
    tallasDisponibles: [{ talla: "S", cantidad: 5 }, { talla: "M", cantidad: 7 }, { talla: "L", cantidad: 3 }],
    totalUnidades: 15, 
    asignados: 12, 
    estado: "Listo" 
  },
  { 
    id: "VES-002", 
    nombre: "Traje Enterizo Neón Urban", 
    ritmo: "Hip Hop / Comercial", 
    categoria: "Juvenil",
    tallasDisponibles: [{ talla: "M", cantidad: 12 }, { talla: "L", cantidad: 8 }],
    totalUnidades: 20, 
    asignados: 20, 
    estado: "Listo" 
  },
  { 
    id: "VES-003", 
    nombre: "Vestido Raso Rojo Casino", 
    ritmo: "Salsa Casino", 
    categoria: "Adulto",
    tallasDisponibles: [{ talla: "S", cantidad: 4 }, { talla: "M", cantidad: 6 }],
    totalUnidades: 10, 
    asignados: 5, 
    estado: "En Costura" 
  },
  { 
    id: "VES-004", 
    nombre: "Traje Entero Mariposa", 
    ritmo: "Baby Ballet", 
    categoria: "Baby",
    tallasDisponibles: [{ talla: "2T", cantidad: 8 }, { talla: "4T", cantidad: 10 }],
    totalUnidades: 18, 
    asignados: 0, 
    estado: "Por Lavar" 
  },
  { 
    id: "VES-005", 
    nombre: "Falda Flamenca Lunares", 
    ritmo: "Flamenco", 
    categoria: "Adulto",
    tallasDisponibles: [{ talla: "M", cantidad: 5 }, { talla: "L", cantidad: 5 }],
    totalUnidades: 10, 
    asignados: 8, 
    estado: "Listo" 
  },
];

export default function VestuariosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");

  // Configuración de botones para el HeroSection actualizado
  const accionesHero = [
    {
      label: "Control de Lavandería",
      onClick: () => console.log("Abriendo lavandería..."),
      icon: <RefreshCw className="w-4 h-4" />,
      variant: "secondary" as const
    },
    {
      label: "Agregar Diseño / Traje  →",
      onClick: () => console.log("Abriendo modal de trajes..."),
      icon: <Plus className="w-4 h-4" />,
      variant: "primary" as const
    }
  ];

  // Filtrado de trajes
  const filteredVestuarios = DEMO_VESTUARIOS.filter((ves) => {
    const matchesSearch = ves.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || ves.ritmo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === "Todos" || ves.estado === estadoFilter;
    return matchesSearch && matchesEstado;
  });

  // Métricas de inventario text-analíticas
  const totalTrajes = DEMO_VESTUARIOS.reduce((acc, curr) => acc + curr.totalUnidades, 0);
  const trajesAsignados = DEMO_VESTUARIOS.reduce((acc, curr) => acc + curr.asignados, 0);
  const enTaller = DEMO_VESTUARIOS.filter(v => v.estado === "En Costura").length;

  return (
    <>
      {/* HERO SECTION COMPONENTE REFACTORIZADO */}
      <HeroSection 
        htmlTitle={`Inventario y Control de <em class="text-[#5e0472]">Vestuarios</em>`}
        htmlSubTitle="Asigna prendas de baile, gestiona tallas por alumno y controla el estatus del taller de costura."
        actions={accionesHero}
      />

        <div className="p-4 md:p-8  max-w-7xl mx-auto w-full overflow-y-auto space-y-6">
      {/* TARJETAS DE INDICADORES RÁPIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Total Prendas en Stock
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {totalTrajes} Piezas
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Disponibles en el almacén de utilería.
              </p>
            </div>
        </div>
        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
              <UserCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Trajes Alquilados / Asignados
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {trajesAsignados} en Uso
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Bailarines con trajes bajo su custodia.
              </p>
            </div>
        </div>
        <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                En Modista / Ajustes
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {enTaller} Modelos
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Prendas retenidas por ajustes de bastilla o cierres.
              </p>
            </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar traje o género de danza..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
          />
        </div>

        <select
          value={estadoFilter}
          onChange={(e) => setEstadoFilter(e.target.value)}
          className="p-2 w-full sm:w-auto font-questrial border border-purple-100 text-xs bg-white/50 text-gray-700 focus:outline-none"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Listo">Listo para Escenario</option>
          <option value="En Costura">En Taller de Costura</option>
          <option value="Por Lavar">Mantenimiento / Lavandería</option>
        </select>
      </div>

      {/* LISTADO DE STOCK CON DESGLOSE DE TALLAS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredVestuarios.length > 0 ? (
          filteredVestuarios.map((ves) => {
            const stockReal = ves.totalUnidades - ves.asignados;
            const porcentajeUso = Math.round((ves.asignados / ves.totalUnidades) * 100);

            return (
              <div key={ves.id} className="glass-card p-5 shadow-sm border border-purple-50 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  {/* Encabezado Fila */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-questrial text-gray-400">{ves.id}</span>
                        <span className={`text-[9px] font-questrial font-bold px-1.5 py-0.5 ${
                          ves.categoria === "Baby" ? "bg-purple-100 text-purple-700" :
                          ves.categoria === "Infantil" ? "bg-pink-100 text-pink-700" :
                          "bg-indigo-100 text-indigo-700"
                        }`}>{ves.categoria}</span>
                      </div>
                      <h3 className="font-anton text-gray-800 text-base mt-1">{ves.nombre}</h3>
                      <p className="text-xs text-purple-600 font-questrial font-semibold">{ves.ritmo}</p>
                    </div>

                    {/* Estado de la indumentaria */}
                    <span className={`text-[10px] font-questrial font-bold px-2.5 py-1 ${
                      ves.estado === "Listo" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      ves.estado === "En Costura" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      "bg-pink-50 text-pink-700 border border-pink-100"
                    }`}>
                      {ves.estado}
                    </span>
                  </div>

                  {/* Distribución por tallas en cuadritos */}
                  <div className="mt-4">
                    <p className="text-[10px] font-questrial font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-purple-400" /> Distribución de Tallas (Totales)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ves.tallasDisponibles.map((t, index) => (
                        <div key={index} className="font-questrial bg-white/70 border border-purple-100 px-3 py-1.5 text-center min-w-[50px]">
                          <p className="text-[10px] text-gray-400 font-questrial font-bold">{t.talla}</p>
                          <p className="text-xs font-questrial font-black text-gray-700">{t.cantidad} u.</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Métricas de Uso y Alquileres */}
                <div className="mt-5 pt-4 border-t border-purple-50/60 space-y-2">
                  <div className="flex justify-between text-xs font-questrial font-medium text-gray-500">
                    <span>Disponibles en rack: <strong className="text-gray-700">{stockReal} trajes</strong></span>
                    <span>Asignados: <strong className="text-purple-700">{ves.asignados} ({porcentajeUso}%)</strong></span>
                  </div>

                  <div className="w-full bg-gray-100 h-1.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        porcentajeUso === 100 ? "bg-purple-600" : "gradient-purple"
                      }`}
                      style={{ width: `${porcentajeUso}%` }}
                    ></div>
                  </div>

                  {stockReal === 0 && (
                    <p className="text-[10px] font-questrial font-semibold text-pink-600 flex items-center gap-1 pt-1">
                      <AlertTriangle className="w-3 h-3" /> Todo el lote de este diseño se encuentra fuera del almacén.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
            No se encontraron registros de vestuarios en base a los filtros.
          </div>
        )}
      </div>

        </div>
    </>
  );
}