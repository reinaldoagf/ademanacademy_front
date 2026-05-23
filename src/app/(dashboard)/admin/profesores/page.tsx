// src/app/(dashboard)/profesores/page.tsx
"use client";

import { useState } from "react";
import {
  Contact,
  Plus,
  Search,
  Clock,
  BadgeDollarSign,
  UserCheck,
  CircleCheck,
  Briefcase,
  Layers,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";

interface Profesor {
  id: string;
  nombre: string;
  avatarInitials: string;
  especialidades: string[];
  tipoContrato: "Por Hora" | "Fijo + Comisión" | "Por Proyecto";
  horasDictadasMes: number;
  tarifaHora: number;
  bonoMontaje: number; // Pagos extras por coreografías de gala
  estadoNomina: "Calculado" | "Pagado";
}

const DEMO_PROFESORES: Profesor[] = [
  {
    id: "PRF-001",
    nombre: "Valerie Smith",
    avatarInitials: "VS",
    especialidades: ["Ballet Clásico", "Contemporáneo"],
    tipoContrato: "Fijo + Comisión",
    horasDictadasMes: 42,
    tarifaHora: 20,
    bonoMontaje: 150,
    estadoNomina: "Calculado",
  },
  {
    id: "PRF-002",
    nombre: "Jean K. Lara",
    avatarInitials: "JL",
    especialidades: ["Urban Dance", "Hip Hop Comercial"],
    tipoContrato: "Por Hora",
    horasDictadasMes: 36,
    tarifaHora: 18,
    bonoMontaje: 200,
    estadoNomina: "Calculado",
  },
  {
    id: "PRF-003",
    nombre: "Carlos M. Rivas",
    avatarInitials: "CR",
    especialidades: ["Salsa Casino", "Ritmos Latinos"],
    tipoContrato: "Por Hora",
    horasDictadasMes: 48,
    tarifaHora: 15,
    bonoMontaje: 0,
    estadoNomina: "Pagado",
  },
  {
    id: "PRF-004",
    nombre: "María F. Antoni",
    avatarInitials: "MA",
    especialidades: ["Baby Ballet", "Jazz Infantil"],
    tipoContrato: "Fijo + Comisión",
    horasDictadasMes: 30,
    tarifaHora: 15,
    bonoMontaje: 50,
    estadoNomina: "Pagado",
  },
  {
    id: "PRF-005",
    nombre: "Lucía Delgado",
    avatarInitials: "LD",
    especialidades: ["Flamenco Inicial"],
    tipoContrato: "Por Proyecto",
    horasDictadasMes: 16,
    tarifaHora: 22,
    bonoMontaje: 0,
    estadoNomina: "Calculado",
  },
];

export default function ProfesoresPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [profesores, setProfesores] = useState<Profesor[]>(DEMO_PROFESORES);

  // Filtrado de la plantilla de profesores
  const filteredProfesores = profesores.filter(
    (prof) =>
      prof.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prof.especialidades.some((e) =>
        e.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  // Totales financieros y de gestión del mes en curso (Mayo 2026)
  const totalHorasDictadas = profesores.reduce(
    (acc, curr) => acc + curr.horasDictadasMes,
    0,
  );
  const nominaTotalMes = profesores.reduce(
    (acc, curr) =>
      acc + curr.horasDictadasMes * curr.tarifaHora + curr.bonoMontaje,
    0,
  );
  const pendientesPorPagar = profesores
    .filter((p) => p.estadoNomina === "Calculado")
    .reduce(
      (acc, curr) =>
        acc + curr.horasDictadasMes * curr.tarifaHora + curr.bonoMontaje,
      0,
    );

  // Simulación de pago masivo de honorarios
  const procesarPagoMasivo = () => {
    setProfesores((prev) =>
      prev.map((p) => ({ ...p, estadoNomina: "Pagado" })),
    );
  };

  const handleNewElement = async () => {
    console.log("handleNewElement");
  };
  return (
    <>
      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection
        htmlTitle={`Profesores y Control de <em class="text-[#5e0472]">Nómina</em>`}
        htmlSubTitle={`Supervisa las horas de clase dictadas, coreógrafos asignados y honorarios acumulados.`}
        actions={[
          {
            label: "Liquidar Nómina",
            onClick: handleNewElement,
            icon: <DollarSign className="w-4 h-4" />,
            variant: "secondary",
          },
          {
            label: "Registrar Profesor →",
            onClick: handleNewElement,
            icon: <Plus className="w-4 h-4" />,
          },
        ]}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
        {/* MÉTRICAS DE HONORARIOS DEL MES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Horas totales ejecutadas */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Horas pedagógicas frente a clase.
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                {totalHorasDictadas} Hrs
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Horas pedagógicas frente a clase.
              </p>
            </div>
          </div>

          {/* Total Nómina */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Presupuesto de Nómina
              </p>
              <h4 className="text-xl font-anton text-gray-800">
                ${nominaTotalMes.toLocaleString()}
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Incluye sueldos base y bonos de montaje.
              </p>
            </div>
          </div>

          {/* Pendientes de pago */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                Pendiente por Liquidar
              </p>
              <h4 className="text-xl font-anton text-pink-600">
                ${pendientesPorPagar.toLocaleString()}
              </h4>
              <p className="font-questrial text-xs text-gray-500">
                Honorarios listos por transferir.
              </p>
            </div>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por profesor o ritmo (ej. Ballet)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>
        </div>

        {/* LISTADO DE PROFESORES Y HOJA DE TIEMPO */}
        <div className="glass-card p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-4 font-questrial">
            Cálculo Analítico de Honorarios
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-purple-50 font-questrial">
                  <th className="pb-3 font-semibold">Instructor</th>
                  <th className="pb-3 font-semibold">
                    Especialidades Artísticas
                  </th>
                  <th className="pb-3 font-semibold">Esquema de Pago</th>
                  <th className="pb-3 font-semibold">Horas Clave</th>
                  <th className="pb-3 font-semibold">Bono Coreográfico</th>
                  <th className="pb-3 font-semibold">Total a Cobrar</th>
                  <th className="pb-3 font-semibold text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50/50">
                {filteredProfesores.length > 0 ? (
                  filteredProfesores.map((prof) => {
                    const sueldoHoras = prof.horasDictadasMes * prof.tarifaHora;
                    const sueldoTotal = sueldoHoras + prof.bonoMontaje;

                    return (
                      <tr
                        key={prof.id}
                        className="text-gray-700 hover:bg-purple-50/10 transition"
                      >
                        {/* Avatar e Identidad */}
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 font-questrial">
                              {prof.avatarInitials}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 font-questrial">
                                {prof.nombre}
                              </p>
                              <p className="text-[10px] text-gray-400 font-questrial">
                                {prof.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Especialidades en Tags */}
                        <td className="py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {prof.especialidades.map((esp, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-questrial font-semibold bg-purple-50 text-purple-700 border border-purple-100/50 px-1.5 py-0.5"
                              >
                                {esp}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Contrato */}
                        <td className="py-3.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1 font-questrial">
                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />{" "}
                            {prof.tipoContrato}
                          </span>
                        </td>

                        {/* Horas acumuladas */}
                        <td className="py-3.5 text-xs">
                          <p className="font-bold text-gray-800 font-questrial">
                            {prof.horasDictadasMes} Horas
                          </p>
                          <p className="text-[10px] text-gray-400 font-questrial font-medium">
                            ${prof.tarifaHora}/hr base
                          </p>
                        </td>

                        {/* Bonos coreográficos extras */}
                        <td className="py-3.5 text-xs font-semibold text-gray-600">
                          {prof.bonoMontaje > 0 ? (
                            <span className="text-pink-600 font-bold bg-pink-50 px-2 py-0.5 font-questrial">
                              +${prof.bonoMontaje}
                            </span>
                          ) : (
                            <span className="text-gray-300 font-questrial">
                              —
                            </span>
                          )}
                        </td>

                        {/* Monto Neto */}
                        <td className="py-3.5 font-extrabold text-gray-900 text-sm font-questrial">
                          ${sueldoTotal.toLocaleString()}
                        </td>

                        {/* Estado del pago individual */}
                        <td className="py-3.5 text-right">
                          <span
                            className={`text-[10px] font-questrial font-bold px-2.5 py-0.5 inline-flex items-center gap-1 ${
                              prof.estadoNomina === "Pagado"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {prof.estadoNomina === "Pagado" && (
                              <CircleCheck className="w-3 h-3" />
                            )}
                            {prof.estadoNomina}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-xs text-gray-400"
                    >
                      No se encontraron profesores bajo los términos de búsqueda
                      introducidos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
