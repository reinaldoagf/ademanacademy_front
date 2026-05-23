// src/app/(dashboard)/page.tsx
"use client";
import dynamic from "next/dynamic";
import HeroSection from '@/components/layout/HeroSection';
import { BalanceChart } from "@/components/BalanceChart";
//  Importación dinámica con SSR desactivado:
const AcademicCalendar = dynamic(
  () => import("@/components/AcademicCalendar").then((mod) => mod.AcademicCalendar),
  { ssr: false }
);
import { 
  Plus, 
  Calendar, 
  UserCheck, 
  Shirt, 
  Ticket, 
  TrendingUp,
  MessageSquare
} from "lucide-react";

export default function DashboardPage() {
  const handleNewEvent = async () => {
    console.log('handleNewEvent')
  }
  return (
    <>
      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection 
        htmlTitle={`Panel <em class="text-[#5e0472]">Principal</em>`}
        htmlSubTitle={`Bienvenido de vuelta, gestiona los flujos de hoy.`}
        actions={[{
          label: "Registrar Nuevo Evento / Pago →",
          onClick: handleNewEvent,
          icon: <Plus className="w-4 h-4" />,
        }]}
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
              <h3 className="text-lg font-anton mb-4">Ingresos por Concepto</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                  <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 text-purple-500" /> Mensualidades
                  </span>
                  <span className="text-sm font-anton text-gray-800">$3,450.00</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                  <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-4 h-4 text-pink-500" /> Clases Personalizadas
                  </span>
                  <span className="text-sm font-anton text-gray-800">$1,200.00</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                  <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                    <Ticket className="w-4 h-4 text-indigo-500" /> Eventos Especiales
                  </span>
                  <span className="text-sm font-anton text-gray-800">$2,150.00</span>
                </div>
              </div>
            </div>

            {/* Caja 2: Métricas Rápidas en Degradados */}
            <div className="flex flex-col gap-4">
              <div className="gradient-purple p-5 text-white shadow-lg shadow-purple-200 flex justify-between items-center relative overflow-hidden">
                <div className="z-10">
                  <p className="text-purple-100 text-xs font-medium uppercase tracking-wider font-anton">Preinscripciones Activas</p>
                  <h3 className="text-3xl font-questrial font-bold mt-1">48 Alumnos</h3>
                </div>
                <UserCheck className="w-16 h-16 absolute -right-2 text-white opacity-20 transform rotate-12" />
              </div>
              <div className="gradient-purple p-5 text-white shadow-lg shadow-pink-200 flex justify-between items-center relative overflow-hidden">
                <div className="z-10">
                  <p className="text-purple-100 text-xs font-medium uppercase tracking-wider font-anton">Vestuarios Prestados</p>
                  <h3 className="text-3xl font-questrial font-bold mt-1">32 Piezas</h3>
                </div>
                <Shirt className="w-16 h-16 absolute -right-2 text-white opacity-20 transform rotate-12" />
              </div>
            </div>
          </div>

          {/* Gráfico / Balance Mensual (Estilo Ondas SVG) */}
      <div className="glass-card p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-anton mb-4">Balance de Ingresos vs Deudas</h3>
            <div className="flex flex-wrap gap-4 text-xs mt-1">
              <span className="flex items-center gap-1.5 text-sm font-questrial font-medium text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5e0472] inline-block"></span> Recaudado
              </span>
              <span className="flex items-center gap-1.5 text-sm font-questrial font-medium text-gray-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f472b6] inline-block"></span> Cuentas por Cobrar
              </span>
            </div>
          </div>
          <span className="bg-purple-100 text-purple-700 font-questrial px-3 py-1 text-xs font-semibold">Mayo 2026</span>
        </div>
        
        {/* Contenedor adaptado para Chart.js */}
        <div className="h-44 w-full relative mt-2">
          {/* 2. Insertamos el componente aquí en lugar del SVG plano */}
          <BalanceChart />
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
          <div className="glass-card p-6 shadow-sm text-center">
            <h3 className="text-lg font-anton mb-4 text-left">Cupos de la Academia</h3>
            <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-[10px] border-purple-100"></div>
              <div className="absolute inset-0 rounded-full border-[10px] border-purple-500 border-t-pink-400 rotate-45"></div>
              <div>
                <span className="text-2xl font-questrial font-black text-purple-700">89%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-left text-xs">
              <div className="p-2 bg-white/50 rounded-xl">
                <p className="text-gray-400 font-questrial font-medium">Baby Ballet</p>
                <p className="font-questrial font-bold text-purple-700">18/20 Cupos</p>
              </div>
              <div className="p-2 bg-white/50 rounded-xl">
                <p className="text-gray-400 font-questrial font-medium">Salsa Casino</p>
                <p className="font-questrial font-bold text-purple-700">25/25 <span className="text-red-400 text-[10px]">(Full)</span></p>
              </div>
            </div>
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
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.948 0c3.174.001 6.161 1.24 8.401 3.487 2.24 2.246 3.475 5.236 3.47 8.411-.013 6.59-5.351 11.936-11.901 11.936-2.008-.001-3.98-.515-5.725-1.498L0 24zm6.49-3.376c1.592.943 3.517 1.442 5.45 1.443 5.375 0 9.757-4.417 9.768-9.842.005-2.628-1.017-5.097-2.877-6.963-1.859-1.864-4.331-2.89-6.96-2.891-5.401 0-9.785 4.417-9.796 9.844-.003 1.97.512 3.894 1.492 5.594l-.973 3.55 3.633-.961zm11.238-7.794c-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
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