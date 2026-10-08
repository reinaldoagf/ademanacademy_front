// src/app/(dashboard)/admin/dashboard/page.tsx
"use client";
import dynamic from "next/dynamic";
import HeroSection from '@/components/layout/HeroSection';
//  Importación dinámica con SSR desactivado:
const AcademicCalendar = dynamic(
  () => import("@/components/AcademicCalendar").then((mod) => mod.AcademicCalendar),
  { ssr: false }
);
const RevenueByCategory = dynamic(
  () => import("@/components/RevenueByCategory").then((mod) => mod.RevenueByCategory),
  { ssr: false }
);
const PreRegistrationOpen = dynamic(
  () => import("@/components/PreRegistrationOpen").then((mod) => mod.PreRegistrationOpen),
  { ssr: false }
);
const AssignedChangingRooms = dynamic(
  () => import("@/components/AssignedChangingRooms").then((mod) => mod.AssignedChangingRooms),
  { ssr: false }
);
const MonthlyBalanceChart = dynamic(
  () => import("@/components/MonthlyBalanceChart").then((mod) => mod.MonthlyBalanceChart),
  { ssr: false }
);
const CostumeControlTable = dynamic(
  () => import("@/components/CostumeControlTable").then((mod) => mod.CostumeControlTable),
  { ssr: false }
);
const GroupCapacityModule = dynamic(
  () => import("@/components/GroupCapacityModule").then((mod) => mod.GroupCapacityModule),
  { ssr: false }
);

const AutomaticNotifications = dynamic(
  () => import("@/components/AutomaticNotifications").then((mod) => mod.AutomaticNotifications),
  { ssr: false }
);


export default function AdminDashboardPage() {
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
              <RevenueByCategory />
              {/* Caja 2: Métricas Rápidas en Degradados */}
              <div className="flex flex-col gap-4">
                {/* Tarjeta: Preinscripciones Activas */}
                <PreRegistrationOpen />
                {/* Tarjeta: Vestuarios Prestados */}
                <AssignedChangingRooms />
              </div>
            </div>
            {/* Gráfico / Balance Mensual (Estilo Ondas SVG) */}
            <MonthlyBalanceChart />
            {/* Tabla de Control de Inventario de Vestuarios */}
            <CostumeControlTable />
          </div>

          {/* COLUMNA DERECHA */}

          <div className="space-y-6">
            <GroupCapacityModule />
            {/* Agenda de Ensayos + Calendario */}
            <AcademicCalendar />
            {/* Alertas de WhatsApp */}
            <AutomaticNotifications />
          </div>

        </div>
      </div>

    </>
  );
}