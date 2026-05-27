// src/app/(dashboard)/client/events/page.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Calendar,
  MapPin,
  Ticket,
  Search,
  Music,
  CreditCard,
  History,
  X,
  CheckCircle2
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";

// Importar el mapa asegurando que solo se cargue en el cliente para evitar problemas de hidratación
const MapaAsientosCanvas = dynamic(
  () => import("@/components/MapaAsientosCanvas").then((mod) => mod.MapaAsientosCanvas),
  { ssr: false }
);

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

export interface ElementoMapa {
  itemID: string;
  tipo: "tarima_pista" | "silla_vip" | string;
  nombre: string;
  numeroSilla?: string;
  grupoId?: string;
  rotacion: number;
  precio: number;
  xMetros: number;
  yMetros: number;
  anchoMetros: number;
  altoMetros: number;
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

export default function ClientEventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");

  // Estados para la selección de asientos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoAcademia | null>(null);
  const [sillasElegidas, setSillasElegidas] = useState<ElementoMapa[]>([]);

  // Datos simulados del plano de la sala
  const planoConfigurado = {
    "anchoTotalSalón": 30,
    "altoTotalSalón": 20,
    "elementos": [
      { "itemID": "stage-1", "tipo": "tarima_pista", "nombre": "Pista Principal", "rotacion": 0, "precio": 0, "xMetros": 5.94, "yMetros": 1.26, "anchoMetros": 18.11, "altoMetros": 5.07 },
      { "itemID": "silla-1779563256195-0-0", "tipo": "silla_vip", "nombre": "Asiento A-1", "numeroSilla": "A-1", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 12.37, "yMetros": 7.39, "anchoMetros": 0.85, "altoMetros": 0.85 },
      { "itemID": "silla-1779563256195-0-1", "tipo": "silla_vip", "nombre": "Asiento A-2", "numeroSilla": "A-2", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 13.47, "yMetros": 7.39, "anchoMetros": 0.85, "altoMetros": 0.85 },
      { "itemID": "silla-1779563256195-0-2", "tipo": "silla_vip", "nombre": "Asiento A-3", "numeroSilla": "A-3", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 14.57, "yMetros": 7.39, "anchoMetros": 0.85, "altoMetros": 0.85 },
      { "itemID": "silla-1779563256195-0-3", "tipo": "silla_vip", "nombre": "Asiento A-4", "numeroSilla": "A-4", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 15.67, "yMetros": 7.39, "anchoMetros": 0.85, "altoMetros": 0.85 },
      { "itemID": "silla-1779563256195-0-4", "tipo": "silla_vip", "nombre": "Asiento A-5", "numeroSilla": "A-5", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 16.77, "yMetros": 7.39, "anchoMetros": 0.85, "altoMetros": 0.85 },
      { "itemID": "silla-1779563256195-1-0", "tipo": "silla_vip", "nombre": "Asiento A-6", "numeroSilla": "A-6", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 12.37, "yMetros": 8.49, "anchoMetros": 0.85, "altoMetros": 0.85 },
      { "itemID": "silla-1779563256195-1-1", "tipo": "silla_vip", "nombre": "Asiento A-7", "numeroSilla": "A-7", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 13.47, "yMetros": 8.49, "anchoMetros": 0.85, "altoMetros": 0.85 },
      { "itemID": "silla-1779563256195-1-2", "tipo": "silla_vip", "nombre": "Asiento A-8", "numeroSilla": "A-8", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 14.57, "yMetros": 8.49, "anchoMetros": 0.85, "altoMetros": 0.85 },
      { "itemID": "silla-1779563256195-1-3", "tipo": "silla_vip", "nombre": "Asiento A-9", "numeroSilla": "A-9", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 15.67, "yMetros": 8.49, "anchoMetros": 0.85, "altoMetros": 0.85 },
      { "itemID": "silla-1779563256195-1-4", "tipo": "silla_vip", "nombre": "Asiento A-10", "numeroSilla": "A-10", "grupoId": "grupo-1779563256195", "rotacion": 0, "precio": 10, "xMetros": 16.77, "yMetros": 8.49, "anchoMetros": 0.85, "altoMetros": 0.85 }
    ]
  };

  // Simulación de los IDs ocupados por otros usuarios
  const asientosOcupadosBD = ["silla-1779563256195-1-2", "silla-1779563256195-0-1"];

  // Cálculo del monto dinámico (Suma de la base de la entrada del evento + el extra de la silla vip si aplica)
  const montoTotalCompra = sillasElegidas.reduce((total, silla) => total + (eventoSeleccionado?.precioEntrada || 0) + (silla.precio - 10), 0);

  const abrirReservaEntradas = (event: EventoAcademia) => {
    setEventoSeleccionado(event);
    setSillasElegidas([]);
    setIsModalOpen(true);
  };

  // Acciones informativas del HeroSection exclusivas para el alumno
  const accionesCliente = [
    {
      label: "Mis Entradas Compradas",
      onClick: () => console.log("Redirigiendo a historial de tickets..."),
      icon: <History className="w-4 h-4" />,
      variant: "secondary" as const
    }
  ];

  const filteredEventos = DEMO_EVENTOS.filter((eve) => {
    const matchesSearch = eve.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || eve.lugar.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === "Todos" || eve.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  // Métricas orientadas al perfil del cliente actual
  const eventosDisponibles = DEMO_EVENTOS.filter(e => e.estadoProduccion !== "Concluido" && e.estadoProduccion !== "Sold Out").length;
  const misTicketsCompradosSimulados = 3;
  const totalInvertidoSimulado = 65;

  return (
    <>
      {/* HERO SECTION ORIENTADO AL CLIENTE */}
      <HeroSection
        htmlTitle={`Cartelera de <em class="text-[#5e0472]">Eventos y Espectáculos</em>`}
        htmlSubTitle="Asegura tus entradas para las galas anuales, competencias internacionales y masterclasses de la academia eligiendo tus asientos en tiempo real."
        actions={accionesCliente}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">

        {/* PANEL DE ESTADO DEL ALUMNO / CLIENTE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Eventos Disponibles */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4 bg-white">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Próximas Funciones
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {eventosDisponibles} Eventos con Cupos
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Formatos con boletería abierta actualmente.
              </p>
            </div>
          </div>

          {/* Mis tickets comprados */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4 bg-white">
            <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Mis Asientos Reservados
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {misTicketsCompradosSimulados} Entradas Adquiridas
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Listas para presentar en el acceso al teatro.
              </p>
            </div>
          </div>

          {/* Inversión total en cultura/danza */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4 bg-white">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Total Invertido en Entradas
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                ${totalInvertidoSimulado.toLocaleString("en-US")} USD
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Historial acumulado de pagos en taquilla.
              </p>
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="glass-card shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar espectáculos o locaciones..."
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
            <option value="Todos">Todas las categorías</option>
            <option value="Gala Anual">Galas de la Academia</option>
            <option value="Competencia">Competencias y Torneos</option>
            <option value="Masterclass">Masterclasses exclusivas</option>
            <option value="Muestra">Muestras de Alumnos</option>
          </select>
        </div>

        {/* CARTELERA DE EVENTOS */}
        <div className="space-y-4">
          {filteredEventos.length > 0 ? (
            filteredEventos.map((evento) => {
              const isSoldOut = evento.entradasVendidas === evento.entradasTotales;

              return (
                <div key={evento.id} className="glass-card p-5 shadow-sm border border-purple-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition bg-white">

                  {/* Título y Tipo de Evento */}
                  <div className="flex items-start gap-4 lg:w-1/3">
                    <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${evento.tipo === "Gala Anual" ? "bg-purple-100 text-purple-700" :
                      evento.tipo === "Masterclass" ? "bg-pink-100 text-pink-700" :
                        "bg-indigo-100 text-indigo-700"
                      }`}>
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-gray-400">{evento.id}</span>
                      <h3 className="font-anton text-gray-800 text-base leading-tight mt-0.5">{evento.nombre}</h3>
                      <span className="text-[10px] bg-purple-50 text-purple-700 font-questrial font-semibold px-2 py-0.5 mt-1 inline-block">
                        {evento.tipo}
                      </span>
                    </div>
                  </div>

                  {/* Datos del lugar y fecha */}
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

                  {/* Disponibilidad e información de precio */}
                  <div className="space-y-1 lg:max-w-xs flex-1">
                    <p className="font-questrial text-xs text-gray-500">
                      Precio de Entrada Base: <strong className="text-purple-700 text-sm">${evento.precioEntrada} USD</strong>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 ${isSoldOut ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
                      <span className="text-xs font-questrial text-gray-400">
                        {isSoldOut ? "Agotado" : "Asientos disponibles en mapa"}
                      </span>
                    </div>
                  </div>

                  {/* Acciones del Cliente */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-purple-50/50 shrink-0">
                    <span className={`text-[10px] font-questrial font-semibold uppercase tracking-wider px-3 py-1 ${evento.estadoProduccion === "Sold Out" ? "bg-pink-100 text-pink-700" :
                      "bg-purple-100 text-purple-700"
                      }`}>
                      {evento.estadoProduccion === "Sold Out" ? "Agotado" : "Boletería Activa"}
                    </span>

                    <button
                      onClick={() => abrirReservaEntradas(evento)}
                      disabled={isSoldOut}
                      className="w-full cursor-pointer group font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
                    >
                      {isSoldOut ? "Sold Out" : "Comprar Entradas"}
                    </button>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 bg-white">
              No hay eventos programados en esta categoría por el momento.
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE RESERVA ADAPTADO AL CLIENTE (PASARELA INTERACTIVA) */}
      {isModalOpen && eventoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-4 shadow-xl">
            {/* Encabezado del modal */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-questrial text-purple-600 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Selección de ubicación en tiempo real
                </span>
                <h3 className="text-xl font-anton text-gray-800">{eventoSeleccionado.nombre}</h3>
                <p className="font-questrial text-xs text-gray-400">Haz clic sobre las butacas libres habilitadas en el mapa interactivo.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="cursor-pointer text-gray-400 hover:bg-gray-100 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inyección del Canvas */}
            {planoConfigurado && (
              <div className="border border-purple-50 overflow-hidden bg-gray-50/50">
                <MapaAsientosCanvas
                  mapaConfig={planoConfigurado}
                  asientosOcupados={asientosOcupadosBD}
                  onSeleccionChange={(sillas) => setSillasElegidas(sillas)}
                />
              </div>
            )}

            {/* Panel inferior para Checkout */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-purple-50">
              <div className="text-center sm:text-left font-questrial">
                <p className="text-xs text-gray-400 font-medium">
                  {sillasElegidas.length === 0
                    ? "Ningún asiento seleccionado"
                    : `${sillasElegidas.length} Asiento(s) escogido(s)`}
                </p>
                <h4 className="text-2xl font-black text-gray-800">
                  ${montoTotalCompra.toLocaleString("en-US", { minimumFractionDigits: 0 })}{" "}
                  <span className="text-xs text-gray-400 font-normal">USD</span>
                </h4>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-purple-100 text-gray-500 text-xs font-questrial hover:bg-gray-50 transition flex-1 sm:flex-none cursor-pointer"
                >
                  Regresar
                </button>
                <button
                  disabled={sillasElegidas.length === 0}
                  onClick={() => {
                    const butacas = sillasElegidas.map(s => s.numeroSilla).join(", ");
                    alert(`¡Pedido Procesado Exitosamente!\nAsientos reservados: ${butacas}\nTotal debitado: $${montoTotalCompra} USD.`);
                    setIsModalOpen(false);
                  }}
                  className="w-full cursor-pointer group font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
                >
                  Proceder al Pago Seguro
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}