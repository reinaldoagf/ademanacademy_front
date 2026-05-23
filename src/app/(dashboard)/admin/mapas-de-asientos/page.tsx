"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/layout/HeroSection";
import {
  Armchair,
  Search,
  Plus,
  Calendar,
  Layers,
  Maximize2,
  ChevronRight,
  SlidersHorizontal,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";

// Estructura de datos simulada para los mapas de asientos guardados
interface PlanoRegistrado {
  id: string;
  nombre: string;
  eventoAsociado: string;
  fechaCreacion: string;
  anchoMetros: number;
  altoMetros: number;
  totalAsientos: number;
  ocupacionM2: number;
  tipoMobiliarioPredominante: string;
}

export default function ListaPlanosAsientosPage() {
  const router = useRouter();

  const [busqueda, setBusqueda] = useState<string>("");

  // Datos de ejemplo basados en los esquemas vectoriales de tu editor
  const [planos, setPlanos] = useState<PlanoRegistrado[]>([
    {
      id: "plano-01",
      nombre: "Distribución Concierto Gala",
      eventoAsociado: "Filarmónica Metropolitana 2026",
      fechaCreacion: "2026-05-15",
      anchoMetros: 30,
      altoMetros: 20,
      totalAsientos: 240,
      ocupacionM2: 173.4,
      tipoMobiliarioPredominante: "VIP (Morada)",
    },
    {
      id: "plano-02",
      nombre: "Configuración Pasarela Moda",
      eventoAsociado: "Fashion Week Spring",
      fechaCreacion: "2026-05-10",
      anchoMetros: 25,
      altoMetros: 25,
      totalAsientos: 180,
      ocupacionM2: 130.05,
      tipoMobiliarioPredominante: "Preferencia (Roja)",
    },
    {
      id: "plano-03",
      nombre: "Plano General Corporativo",
      eventoAsociado: "Congreso de Tecnología AI",
      fechaCreacion: "2026-04-28",
      anchoMetros: 40,
      altoMetros: 30,
      totalAsientos: 450,
      ocupacionM2: 325.12,
      tipoMobiliarioPredominante: "General (Gris)",
    },
  ]);

  // Acciones para la barra del Hero (Redirección al creador)
  const accionesHero = [
    {
      label: "Nuevo Plano →",
      onClick: () => {
        router.push("/admin/mapas-de-asientos/editor");
      }, // Ajusta tu ruta aquí
      icon: <Plus className="w-4 h-4" />,
      variant: "primary" as const,
    },
  ];

  // Filtrado lógico de los planos en tiempo real
  const planosFiltrados = planos.filter((plano) => {
    const coincideBusqueda =
      plano.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      plano.eventoAsociado.toLowerCase().includes(busqueda.toLowerCase());
    return coincideBusqueda;
  });

  const eliminarPlano = (id: string) => {
    if (
      confirm("¿Estás seguro de que deseas eliminar este plano de asientos?")
    ) {
      setPlanos(planos.filter((p) => p.id !== id));
    }
  };

  const duplicarPlano = (plano: PlanoRegistrado) => {
    const clon: PlanoRegistrado = {
      ...plano,
      id: `plano-clon-${Date.now()}`,
      nombre: `${plano.nombre} (Copia)`,
      fechaCreacion: new Date().toISOString().split("T")[0],
    };
    setPlanos([...planos, clon]);
  };

  // KPIs globales calculados dinámicamente
  const totalPlanos = planos.length;
  const asientosTotalesRegistrados = planos.reduce(
    (acc, p) => acc + p.totalAsientos,
    0,
  );
  const m2TotalesGestionados = planos.reduce(
    (acc, p) => acc + p.anchoMetros * p.altoMetros,
    0,
  );

  return (
    <>
      <HeroSection
        htmlTitle={`Listado de <em class="text-[#5e0472]">Mapas de Asientos</em>`}
        htmlSubTitle="Gestión, duplicación y control métrico de distribuciones vectoriales registradas."
        actions={accionesHero}
      />

      <div className="p-4 md:p-8 mx-auto w-full space-y-6">
        {/* --- CONTENEDOR DE INDICADORES / KPIs --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-purple-100 p-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-[#5e0472]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-gray-400 font-questrial">
                Planos Registrados
              </h4>
              <p className="text-xl font-questrial font-bold text-gray-800">
                {totalPlanos} Mapas Activos
              </p>
            </div>
          </div>

          <div className="bg-white border border-purple-100 p-4 shadow-sm flex items-center gap-3 md:border-x border-gray-100">
            <div className="p-2 bg-indigo-50 text-indigo-600">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-gray-400 font-questrial">
                Aforos Totales
              </h4>
              <p className="text-xl font-questrial font-bold text-gray-800">
                {asientosTotalesRegistrados} Asientos Diseñados
              </p>
            </div>
          </div>

          <div className="bg-white border border-purple-100 p-4 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-pink-50 text-pink-600">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-gray-400 font-questrial">
                Área Total Techada
              </h4>
              <p className="text-xl font-questrial font-bold text-gray-800">
                {m2TotalesGestionados.toFixed(1)} m² Diseñables
              </p>
            </div>
          </div>
        </div>

        {/* --- BARRA DE FILTROS Y BÚSQUEDA --- */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre de plano o evento..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 font-questrial border border-purple-100 text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
            </div>
          </div>

        </div>

        {/* --- REJILLA DE PLANOS REGISTRADOS --- */}
        {planosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planosFiltrados.map((plano) => (
              <div
                key={plano.id}
                className="glass-card bg-white border border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Cabecera de la tarjeta */}
                <div className="p-5 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-anton tracking-wider px-2 py-0.5 bg-purple-50 border border-purple-100 text-[#6e0372]">
                      {plano.tipoMobiliarioPredominante}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-[11px] font-questrial">
                      <Calendar className="w-3 h-3" />
                      <span>{plano.fechaCreacion}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-questrial font-bold text-gray-800 hover:text-[#5e0472] transition cursor-pointer">
                      {plano.nombre}
                    </h3>
                    <p className="text-xs font-questrial text-gray-400 italic">
                      Evento: {plano.eventoAsociado}
                    </p>
                  </div>

                  {/* Sub-métricas vectoriales del plano */}
                  <div className="grid grid-cols-3 gap-2 pt-3 text-center border-t border-dashed border-gray-100">
                    <div className="bg-slate-50 p-2">
                      <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                        Dimensión
                      </p>
                      <p className="text-xs font-questrial font-bold text-gray-700">
                        {plano.anchoMetros}x{plano.altoMetros}m
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2">
                      <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                        Asientos
                      </p>
                      <p className="text-xs font-questrial font-bold text-gray-700">
                        {plano.totalAsientos}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-2">
                      <p className="text-[10px] text-gray-400 font-questrial uppercase font-medium">
                        Ocupado
                      </p>
                      <p className="text-xs font-questrial font-bold text-pink-600">
                        {plano.ocupacionM2.toFixed(1)}m²
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones y Footer de la tarjeta */}
                <div className="px-5 py-3 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        (window.location.href = `/configuracion-escenarios?id=${plano.id}`)
                      } // Redirección con query param
                      className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition border border-transparent hover:border-purple-200"
                      title="Editar plano vector"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicarPlano(plano)}
                      className="p-1.5 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 transition border border-transparent hover:border-indigo-200"
                      title="Duplicar distribución"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminarPlano(plano.id)}
                      className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 transition border border-transparent hover:border-red-200"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      (window.location.href = `/configuracion-escenarios?id=${plano.id}`)
                    }
                    className="flex items-center gap-1 text-[11px] font-questrial font-bold text-[#5e0472] hover:text-[#4a024d] transition"
                  >
                    Abrir Editor <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- ESTADO SIN RESULTADOS --- */
          <div className="bg-white border border-purple-100 p-12 text-center shadow-sm">
            <Armchair className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-questrial text-gray-400 italic">
              No se encontraron mapas de asientos que coincidan con los
              criterios de búsqueda.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
