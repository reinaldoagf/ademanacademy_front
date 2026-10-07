// src/app/(dashboard)/admin/dashboard/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { getAdminDashboardMetrics, getBalanceMetrics } from '@/app/actions/metric';
import { getGroupSlotsData } from '@/app/actions/group';
import { DashboardMetricsResponse } from '@/types/metric';
import { SlotsData } from '@/types/group';
import dynamic from "next/dynamic";
import HeroSection from '@/components/layout/HeroSection';
import { BalanceChart } from "@/components/BalanceChart";
import { DateRangePicker, DateRangeValue } from "@/components/ui/forms/DateRangePicker";
//  Importación dinámica con SSR desactivado:
const AcademicCalendar = dynamic(
  () => import("@/components/AcademicCalendar").then((mod) => mod.AcademicCalendar),
  { ssr: false }
);
import {
  Calendar,
  UserCheck,
  Shirt,
  Ticket,
  TrendingUp,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Users,
} from "lucide-react";
import { BalanceChartData } from '@/types/dashboard';
// Convierte Date a string en formato YYYY-MM-DD
const formatDateToString = (date: Date): Date => {
  return new Date(date);
};

// Genera el rango por defecto: Último Año (hace 365 días hasta hoy)
const getDefaultDateRange = (): DateRangeValue => {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  return {
    startDate: formatDateToString(oneYearAgo),
    endDate: formatDateToString(today),
  };
};
export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(getDefaultDateRange());

  // Estado para el indicador de carga exclusivo del gráfico
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [onlyActive, setOnlyActive] = useState(true);
  const [groupSlotsData, setGroupSlotsData] = useState<SlotsData | null>(null);
  const [isSlotsLoading, setIsSlotsLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [balanceData, setBalanceData] = useState<BalanceChartData | null>(null);
  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(0);
  // Lista estructurada de ítems
  const concepts = [
    {
      label: 'Vestuario',
      icon: <Shirt className="w-4 h-4 text-purple-500" />,
      value: metrics?.incomeByConcept.lockerRoom ?? 0,
    },
    {
      label: 'Tienda',
      icon: <ShoppingBag className="w-4 h-4 text-purple-500" />,
      value: metrics?.incomeByConcept.storeSales ?? 0,
    },
    {
      label: 'Inscripciones',
      icon: <Calendar className="w-4 h-4 text-purple-500" />,
      value: metrics?.incomeByConcept.tuition ?? 0,
    },
    {
      label: 'Mensualidades',
      icon: <Calendar className="w-4 h-4 text-purple-500" />,
      value: metrics?.incomeByConcept.monthlyPayments ?? 0,
    },
    {
      label: 'Clases Personalizadas',
      icon: <TrendingUp className="w-4 h-4 text-pink-500" />,
      value: metrics?.incomeByConcept.customClasses ?? 0,
    },
    {
      label: 'Eventos Especiales',
      icon: <Ticket className="w-4 h-4 text-indigo-500" />,
      value: metrics?.incomeByConcept.specialEvents ?? 0,
    },
  ];

  const totalPages = Math.ceil(concepts.length / itemsPerPage);
  const currentItems = concepts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  const overallOccupancy = groupSlotsData?.overallOccupancyPercentage ?? 0;
  const groups = groupSlotsData?.groups ?? [];
  // Carga los datos de cupos cada vez que cambia el estado `onlyActive`
  useEffect(() => {
    async function fetchGroupSlots() {
      setIsSlotsLoading(true);
      try {
        const res = await getGroupSlotsData({ onlyActive });
        if (res.success && res.data) {
          setGroupSlotsData(res.data);
        }
      } catch (error) {
        console.error('Error al cargar cupos:', error);
      } finally {
        setIsSlotsLoading(false);
      }
    }

    fetchGroupSlots();
  }, [onlyActive]);
  useEffect(() => {
    async function loadBalanceData() {
      if (!dateRange?.startDate || !dateRange?.endDate) return;

      setIsBalanceLoading(true);
      try {
        const res = await getBalanceMetrics({
          startDate: String(dateRange.startDate),
          endDate: String(dateRange.endDate),
        });

        if (res.success && res.data) {
          setBalanceData(res.data);
        }
      } catch (error) {
        console.error('Error al actualizar métricas de balance:', error);
      } finally {
        setIsBalanceLoading(false);
      }
    }

    loadBalanceData();
  }, [dateRange]);
  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        // Ejecutamos ambas peticiones en paralelo de manera limpia
        const [metricsRes, slotsRes, /* balanceRes */] = await Promise.all([
          getAdminDashboardMetrics(),
          getGroupSlotsData({ onlyActive }),
          /*  getBalanceMetrics({
             startDate: dateRange.startDate,
             endDate: dateRange.endDate,
           }) */
        ]);

        if (metricsRes.success && metricsRes.data) {
          setMetrics(metricsRes.data);
        }

        if (slotsRes.success && slotsRes.data) {
          setGroupSlotsData(slotsRes.data); // Guardamos directamente 'data' (SlotsData)
        }

        /* if (balanceRes.success && balanceRes.data) {
          setBalanceData(balanceRes.data); // Guardamos directamente 'data' (SlotsData)
        } */
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);
  return (
    <>
      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection
        htmlTitle={`Panel <em class="text-[#5e0472]">Principal</em>`}
        htmlSubTitle={`Bienvenido de vuelta, gestiona los flujos de hoy.`}
        actions={[]}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto">

        {/* GRILLA DEL DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMNA IZQUIERDA Y CENTRAL */}
          <div className="lg:col-span-2 space-y-6">

            {/* Fila de Resumen de Ingresos y Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Caja 1: Distribución de Ingresos */}
              <div className="glass-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-anton">Ingresos por Concepto</h3>

                  {/* Botones de control de paginación */}
                  {!isLoading && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                        disabled={currentPage === 0}
                        className={(currentPage === 0) ? "cursor-not-allowed" : "cursor-pointer p-1 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"}
                      >
                        <ChevronLeft className="w-4 h-4 text-purple-700" />
                      </button>
                      <span className="text-xs font-questrial font-medium text-gray-500 px-1">
                        {currentPage + 1}/{totalPages}
                      </span>
                      <button
                        className={(currentPage === totalPages - 1) ? "cursor-not-allowed" : "cursor-pointer p-1 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                        disabled={currentPage === totalPages - 1}
                      >
                        <ChevronRight className="w-4 h-4 text-purple-700" />
                      </button>
                    </div>
                  )}
                </div>

                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-purple-100/50 rounded-xl" />
                    <div className="h-10 bg-purple-100/50 rounded-xl" />
                    <div className="h-10 bg-purple-100/50 rounded-xl" />
                  </div>
                ) : (
                  <div key={currentPage} className="space-y-3 animate-fadeIn" >
                    {currentItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 border border-purple-100/40"
                      >
                        <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                          {item.icon} {item.label}
                        </span>
                        <span className="text-sm font-anton text-gray-800">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Caja 2: Métricas Rápidas en Degradados */}
              <div className="flex flex-col gap-4">

                {/* Tarjeta: Preinscripciones Activas */}
                <div className="gradient-purple p-5 text-white shadow-lg shadow-purple-200 flex justify-between items-center relative overflow-hidden">
                  <div className="z-10">
                    <p className="text-purple-100 text-xs font-medium uppercase tracking-wider font-anton">
                      Preinscripciones Activas
                    </p>
                    {isLoading ? (
                      <div className="h-8 w-28 bg-white/20 rounded animate-pulse mt-2" />
                    ) : (
                      <h3 className="text-3xl font-questrial font-bold mt-1">
                        {metrics?.activePreInscriptions ?? 0} Alumnos
                      </h3>
                    )}
                  </div>
                  <UserCheck className="w-16 h-16 absolute -right-2 text-white opacity-20 transform rotate-12 pointer-events-none" />
                </div>

                {/* Tarjeta: Vestuarios Prestados */}
                <div className="gradient-purple p-5 text-white shadow-lg shadow-pink-200 flex justify-between items-center relative overflow-hidden">
                  <div className="z-10">
                    <p className="text-purple-100 text-xs font-medium uppercase tracking-wider font-anton">
                      Vestuarios Asignados
                    </p>
                    {isLoading ? (
                      <div className="h-8 w-28 bg-white/20 rounded animate-pulse mt-2" />
                    ) : (
                      <h3 className="text-3xl font-questrial font-bold mt-1">
                        {metrics?.borrowedCostumes ?? 0} Piezas
                      </h3>
                    )}
                  </div>
                  <Shirt className="w-16 h-16 absolute -right-2 text-white opacity-20 transform rotate-12 pointer-events-none" />
                </div>

              </div>
            </div>

            {/* Gráfico / Balance Mensual (Estilo Ondas SVG) */}
            <div className="glass-card p-6 shadow-sm relative z-20 overflow-visible">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-anton mb-2">Balance de Ingresos</h3>
                  <div className="flex flex-wrap gap-4 text-xs mt-1">
                    <span className="flex items-center gap-1.5 text-sm font-questrial font-medium text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#5e0472] inline-block"></span> Recaudado
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-questrial font-medium text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] inline-block"></span> Cuentas por Cobrar
                    </span>
                  </div>
                </div>

                {/* Filtro por Rango de Fechas */}{/* Componente DateRangePicker */}
                {/* Uso del componente reutilizable DateRangePicker */}
                <div className="w-full sm:w-72">
                  <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>
              </div>

              {/* Contenedor del Gráfico */}
              <div className="h-44 w-full relative mt-2">
                <BalanceChart
                  chartData={balanceData}
                  isLoading={isLoading || isBalanceLoading}
                />
              </div>
            </div>
            {/* Tabla de Control de Inventario de Vestuarios */}
            <div className="glass-card p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-anton mb-4">Control de Vestuarios e Impacto Financiero</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-purple-50">
                      <th className="pb-3 font-questrial font-semibold">Vestuario</th>
                      <th className="pb-3 font-questrial font-semibold">Responsable</th>
                      <th className="pb-3 font-questrial font-semibold">Estado</th>
                      <th className="pb-3 font-questrial font-semibold text-right">Cuota Pendiente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50/50">
                    <tr className="text-gray-700">
                      <td className="py-3.5 font-medium flex items-center gap-2 font-questrial">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Tutú Flamenco
                      </td>
                      <td className="py-3.5 text-gray-500 font-questrial">Valeria V.</td>
                      <td className="py-3.5 font-questrial">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-600">Retrasado</span>
                      </td>
                      <td className="py-3.5 text-right font-questrial font-bold text-red-500">$25.00</td>
                    </tr>
                    <tr className="text-gray-700">
                      <td className="py-3.5 font-questrial font-medium flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span> Hip Hop Neon
                      </td>
                      <td className="py-3.5 font-questrial text-gray-500">Lucas L.</td>
                      <td className="py-3.5 font-questrial">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-600">En uso</span>
                      </td>
                      <td className="py-3.5 text-right font-questrial font-semibold text-gray-400">$0.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-6">
            {/* Módulo de Capacidad de Grupos */}
            <div className="glass-card p-6 shadow-sm text-center flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-lg font-anton text-left">Cupos de la Academia</h3>

                {/* Toggle / Pill Buttons para filtrar */}
                <div className="flex items-center bg-purple-50/80 p-0.5 rounded-lg border border-purple-100 text-[11px] font-questrial font-medium">
                  <button
                    type="button"
                    onClick={() => setOnlyActive(true)}
                    className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${onlyActive
                      ? 'bg-white text-[#5e0472] shadow-sm font-bold'
                      : 'cursor-pointer text-gray-500 hover:text-gray-800'
                      }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Activos
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlyActive(false)}
                    className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${!onlyActive
                      ? 'bg-white text-[#5e0472] shadow-sm font-bold'
                      : 'cursor-pointer text-gray-500 hover:text-gray-800'
                      }`}
                  >
                    <Users className="w-3 h-3 text-purple-500" />
                    Todos
                  </button>
                </div>
              </div>

              {isLoading || isSlotsLoading ? (
                /* Estado de Carga (Skeleton Loader) */
                <div className="animate-pulse space-y-4 my-2">
                  <div className="w-32 h-32 rounded-full bg-purple-100/60 mx-auto flex items-center justify-center">
                    <div className="w-24 h-24 bg-white rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-12 bg-purple-100/50 rounded-xl" />
                    <div className="h-12 bg-purple-100/50 rounded-xl" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Gráfico Circular Dinámico con conic-gradient */}
                  <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center">
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center transition-all duration-500"
                      style={{
                        background: `conic-gradient(#5e0472 ${overallOccupancy}%, #f3e8ff ${overallOccupancy}% 100%)`,
                      }}
                    >
                      {/* Círculo central (Efecto Dona) */}
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-2xl font-questrial font-black text-[#5e0472]">
                          {overallOccupancy}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Listado de Grupos con Scroll */}
                  <div className="grid grid-cols-2 gap-2 text-left text-xs max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-200">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="p-2 bg-white/50 rounded-xl border border-purple-50 flex flex-col justify-center"
                      >
                        <p
                          className="text-gray-400 font-questrial font-medium truncate"
                          title={group.name}
                        >
                          {group.name}
                        </p>
                        <p className="font-questrial font-bold text-[#5e0472]">
                          {group.occupiedSlots}/{group.totalSlots} Cupos{' '}
                          {group.isFull && (
                            <span className="text-red-400 text-[10px] ml-0.5">(Full)</span>
                          )}
                        </p>
                      </div>
                    ))}

                    {groups.length === 0 && (
                      <p className="col-span-2 text-center text-gray-400 py-4">
                        No hay grupos registrados
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Agenda de Ensayos + Calendario */}
            <div className="glass-card p-6 shadow-sm">
              <AcademicCalendar />
            </div>

            {/* Alertas de WhatsApp */}
            <div className="glass-card p-6 shadow-sm">
              <h3 className="text-lg font-anton mb-4">Notificaciones Automáticas (WhatsApp)</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2 rounded-2xl bg-white/30 text-xs">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    {/* Icono de WhatsApp SVG limpio */}
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.948 0c3.174.001 6.161 1.24 8.401 3.487 2.24 2.246 3.475 5.236 3.47 8.411-.013 6.59-5.351 11.936-11.901 11.936-2.008-.001-3.98-.515-5.725-1.498L0 24zm6.49-3.376c1.592.943 3.517 1.442 5.45 1.443 5.375 0 9.757-4.417 9.768-9.842.005-2.628-1.017-5.097-2.877-6.963-1.859-1.864-4.331-2.89-6.96-2.891-5.401 0-9.785 4.417-9.796 9.844-.003 1.97.512 3.894 1.492 5.594l-.973 3.55 3.633-.961zm11.238-7.794c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-questrial font-bold text-gray-800">Davis V. (Mamá)</p>
                    <p className="font-questrial text-gray-500 italic">"Aviso: Recordatorio de mensualidad pendiente."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </>
  );
}