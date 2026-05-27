// src/app/(dashboard)/client/clothing/page.tsx
"use client";

import { useState } from "react";
import HeroSection from "@/components/layout/HeroSection";
import {
  Shirt,
  Search,
  Tag,
  AlertTriangle,
  FileText,
  Users,
  CheckCircle2,
  Sparkles
} from "lucide-react";

interface VestuarioAsignado {
  id: string;
  alumno: string; // Hijo/a representado
  nombreTraje: string;
  ritmo: string;
  categoria: "Baby" | "Infantil" | "Juvenil" | "Adulto";
  tallaAsignada: string;
  fechaEntrega: string;
  estadoShow: "Listo para Escenario" | "Ajuste en Taller" | "Pendiente por Retirar";
  observaciones?: string;
}

const DEMO_VESTUARIOS_CLIENTE: VestuarioAsignado[] = [
  {
    id: "VES-001",
    alumno: "Sofía Valentina",
    nombreTraje: "Tutu Gala Lago de los Cisnes",
    ritmo: "Ballet Clásico",
    categoria: "Juvenil",
    tallaAsignada: "M",
    fechaEntrega: "2026-05-15",
    estadoShow: "Listo para Escenario",
    observaciones: "Incluye tocado de cabeza."
  },
  {
    id: "VES-002",
    alumno: "Sofía Valentina",
    nombreTraje: "Traje Enterizo Neón Urban",
    ritmo: "Hip Hop / Comercial",
    categoria: "Juvenil",
    tallaAsignada: "M",
    fechaEntrega: "2026-05-20",
    estadoShow: "Listo para Escenario",
  },
  {
    id: "VES-004",
    alumno: "Lucas Mateo",
    nombreTraje: "Traje Entero Mariposa",
    ritmo: "Baby Ballet",
    categoria: "Baby",
    tallaAsignada: "4T",
    fechaEntrega: "Pendiente",
    estadoShow: "Pendiente por Retirar",
    observaciones: "Retirar en la coordinación general a partir del lunes."
  },
];

export default function ClientClothingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAlumno, setFilterAlumno] = useState("Todos");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const accionesHero = [
    {
      label: "Normativa de Custodia",
      onClick: () => console.log("Abriendo PDF de normativas..."),
      icon: <FileText className="w-4 h-4" />,
      variant: "secondary" as const,
    },
  ];

  // Filtrado de vestuarios familiares
  const filteredVestuarios = DEMO_VESTUARIOS_CLIENTE.filter((ves) => {
    const matchesSearch =
      ves.nombreTraje.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ves.ritmo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAlumno = filterAlumno === "Todos" || ves.alumno === filterAlumno;
    const matchesEstado = filterEstado === "Todos" || ves.estadoShow === filterEstado;

    return matchesSearch && matchesAlumno && matchesEstado;
  });

  // Métricas del grupo familiar
  const totalAsignados = DEMO_VESTUARIOS_CLIENTE.length;
  const listosParaShow = DEMO_VESTUARIOS_CLIENTE.filter((v) => v.estadoShow === "Listo para Escenario").length;
  const porRetirar = DEMO_VESTUARIOS_CLIENTE.filter((v) => v.estadoShow === "Pendiente por Retirar").length;

  return (
    <>
      {/* HERO SECTION ENFOCADO EN EL CLIENTE */}
      <HeroSection
        htmlTitle={`Control de <em class="text-[#5e0472]">Vestuarios e Indumentaria</em>`}
        htmlSubTitle="Consulta las piezas asignadas a tus representados, las tallas registradas en sistema y el estatus de entrega para las galas."
        actions={accionesHero}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">

        {/* TARJETAS DE INDICADORES RÁPIDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Trajes */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Trajes Asignados
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {totalAsignados} Piezas
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Total bajo custodia de tu grupo familiar.
              </p>
            </div>
          </div>

          {/* Listos para Escenario */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Listos para el Show
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {listosParaShow} Entregados
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Prendas revisadas y conformes para las galas.
              </p>
            </div>
          </div>

          {/* Accesorios o Pendientes */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Pendientes por Retirar
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {porRetirar} Diseños
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Pendientes de asignación física en el almacén.
              </p>
            </div>
          </div>
        </div>

        {/* BARRA DE FILTROS MULTIPLES */}
        <div className="glass-card p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por traje o ritmo de baile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
            {/* Filtro Alumno (Hijo) */}
            <div className="flex items-center gap-2 w-full sm:w-auto border border-purple-100 px-2 bg-white/50">
              <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <select
                value={filterAlumno}
                onChange={(e) => setFilterAlumno(e.target.value)}
                className="p-2 w-full sm:w-auto font-questrial text-xs bg-transparent text-gray-700 focus:outline-none border-none"
              >
                <option value="Todos">Todos los representados</option>
                <option value="Sofía Valentina">Sofía Valentina</option>
                <option value="Lucas Mateo">Lucas Mateo</option>
              </select>
            </div>

            {/* Filtro de Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="p-2 w-full sm:w-auto font-questrial border border-purple-100 text-xs bg-white/50 text-gray-700 focus:outline-none"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Listo para Escenario">Listo para Escenario</option>
              <option value="Ajuste en Taller">En Ajuste / Costura</option>
              <option value="Pendiente por Retirar">Pendiente por Retirar</option>
            </select>
          </div>
        </div>

        {/* TARJETAS DE INDUMENTARIA ASIGNADA */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {filteredVestuarios.length > 0 ? (
            filteredVestuarios.map((ves) => (
              <div
                key={ves.id}
                className="glass-card p-5 shadow-sm border border-purple-50 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  {/* Fila de Encabezado */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-gray-400">
                          {ves.id}
                        </span>
                        <span
                          className={`text-[9px] font-questrial font-bold px-1.5 py-0.5 ${ves.categoria === "Baby"
                              ? "bg-purple-100 text-purple-700"
                              : ves.categoria === "Infantil"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-indigo-100 text-indigo-700"
                            }`}
                        >
                          {ves.categoria}
                        </span>
                      </div>
                      <h3 className="font-anton text-gray-800 text-base mt-1">
                        {ves.nombreTraje}
                      </h3>
                      <p className="text-xs text-purple-600 font-questrial font-semibold">
                        {ves.ritmo}
                      </p>
                    </div>

                    {/* Estado del traje */}
                    <span
                      className={`text-[10px] font-questrial font-bold px-2.5 py-1 text-center ${ves.estadoShow === "Listo para Escenario"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : ves.estadoShow === "Ajuste en Taller"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-pink-50 text-pink-700 border border-pink-100 animate-pulse"
                        }`}
                    >
                      {ves.estadoShow}
                    </span>
                  </div>

                  {/* Fila del Alumno Asignado */}
                  <div className="mt-4 bg-purple-50/40 p-2.5 border border-purple-50 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-questrial font-bold text-purple-400 uppercase tracking-wider">
                        Bailarín Asignado
                      </p>
                      <p className="text-xs font-questrial font-bold text-gray-800">
                        {ves.alumno}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-questrial font-bold text-purple-400 uppercase tracking-wider">
                        Talla Registrada
                      </p>
                      <span className="inline-block text-xs font-anton bg-[#5e0472] text-white px-2 py-0.5 mt-0.5">
                        {ves.tallaAsignada}
                      </span>
                    </div>
                  </div>

                  {/* Detalles complementarios */}
                  {ves.observaciones && (
                    <div className="mt-3 flex gap-1.5 items-start text-xs font-questrial bg-gray-50 p-2 text-gray-600">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-gray-700">Nota:</strong> {ves.observaciones}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Control de Fechas */}
                <div className="mt-5 pt-3 border-t border-purple-50/60 flex justify-between text-[11px] font-questrial text-gray-400">
                  <span>
                    Fecha de Asignación:{" "}
                    <strong className="text-gray-600">{ves.fechaEntrega}</strong>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
              No se encontraron registros de vestuario asociados a tus representados.
            </div>
          )}
        </div>
      </div>
    </>
  );
}