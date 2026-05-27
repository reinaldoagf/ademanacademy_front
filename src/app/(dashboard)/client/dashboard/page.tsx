// src/app/(client)/dashboard/page.tsx
"use client";
import dynamic from "next/dynamic";
import HeroSection from '@/components/layout/HeroSection';
import { useAuthStore } from "@/store/authStore"; // Importamos la tienda que creamos con Zustand
import { useState, useEffect } from "react";

// Importación dinámica con SSR desactivado para mantener consistencia:
const AcademicCalendar = dynamic(
  () => import("@/components/AcademicCalendar").then((mod) => mod.AcademicCalendar),
  { ssr: false }
);

import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Shirt,
  Ticket,
  Clock,
  MessageSquare
} from "lucide-react";

export default function ClientDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [isClient, setIsClient] = useState(false);

  // Control de hidratación para Zustand
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleReportPayment = async () => {
    console.log('handleReportPayment');
    // Lógica para que el cliente reporte un pago de mensualidad o evento
  };

  const nombreUsuario = isClient && user ? user.name.split(" ")[0] : "Estudiante";

  return (
    <>
      {/* SUB-TOPBAR (Saludos Personalizados y Acción del Alumno) */}
      <HeroSection
        htmlTitle={`Mi Panel <em class="text-[#5e0472]">Académico</em>`}
        htmlSubTitle={`¡Hola, ${nombreUsuario}! Revisa tu estatus, horarios y asignaciones para hoy.`}
        actions={[{
          label: "Reportar Pago Realizado →",
          onClick: handleReportPayment,
          icon: <CreditCard className="w-4 h-4" />,
        }]}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto">

        {/* GRILLA DEL DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMNA IZQUIERDA Y CENTRAL */}
          <div className="lg:col-span-2 space-y-6">

            {/* Fila de Resumen Financiero Personal y Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Caja 1: Mis Pagos y Estado de Cuenta */}
              <div className="glass-card p-6 shadow-sm">
                <h3 className="text-lg font-anton mb-4">Mis Conceptos y Estado</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-green-50/60">
                    <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-green-600" /> Mensualidad (Mayo)
                    </span>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700">Pagado</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                    <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                      <Ticket className="w-4 h-4 text-purple-500" /> Gala de Fin de Año
                    </span>
                    <span className="text-sm font-anton text-gray-800">$45.00</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-red-50/60">
                    <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-red-500" /> Cuota de Vestuario
                    </span>
                    <span className="text-sm font-anton text-red-600">$25.00</span>
                  </div>
                </div>
              </div>

              {/* Caja 2: Métricas del Estudiante en Degradados */}
              <div className="flex flex-col gap-4">
                <div className="gradient-purple p-5 text-white shadow-lg shadow-purple-200 flex justify-between items-center relative overflow-hidden">
                  <div className="z-10">
                    <p className="text-purple-100 text-xs font-medium uppercase tracking-wider font-anton">Asistencia General</p>
                    <h3 className="text-3xl font-questrial font-bold mt-1">94% Regular</h3>
                  </div>
                  <CheckCircle2 className="w-16 h-16 absolute -right-2 text-white opacity-20 transform rotate-12" />
                </div>
                <div className="gradient-purple p-5 text-white shadow-lg shadow-pink-200 flex justify-between items-center relative overflow-hidden">
                  <div className="z-10">
                    <p className="text-purple-100 text-xs font-medium uppercase tracking-wider font-anton">Mis Vestuarios Asignados</p>
                    <h3 className="text-3xl font-questrial font-bold mt-1">1 Pieza</h3>
                  </div>
                  <Shirt className="w-16 h-16 absolute -right-2 text-white opacity-20 transform rotate-12" />
                </div>
              </div>
            </div>

            {/* Progreso del Alumno / Nivel en la Academia */}
            <div className="glass-card p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-anton mb-1">Mi Progreso de Nivel</h3>
                  <p className="text-xs font-questrial text-gray-500">Horas acumuladas prácticas y teóricas</p>
                </div>
                <span className="bg-purple-100 text-purple-700 font-questrial px-3 py-1 text-xs font-semibold">Nivel Intermedio B</span>
              </div>

              {/* Barra de progreso visual estilizada para el cliente */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-questrial text-gray-600 mb-1">
                    <span>Técnica de Baile e Interpretación</span>
                    <span className="font-bold text-[#5e0472]">75%</span>
                  </div>
                  <div className="w-full h-3 bg-purple-100 overflow-hidden">
                    <div className="h-full bg-[#5e0472] transition-all duration-500" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-questrial text-gray-600 mb-1">
                    <span>Ensayos de Coreografía</span>
                    <span className="font-bold text-pink-500">90%</span>
                  </div>
                  <div className="w-full h-3 bg-pink-100 overflow-hidden">
                    <div className="h-full bg-pink-500 transition-all duration-500" style={{ width: '90%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla de Mis Vestuarios Alquilados/Prestados */}
            <div className="glass-card p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-anton mb-2">Mis Vestuarios en Resguardo</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-purple-50">
                      <th className="pb-3 font-questrial font-semibold">Vestuario Asignado</th>
                      <th className="pb-3 font-questrial font-semibold">Fecha Retiro</th>
                      <th className="pb-3 font-questrial font-semibold">Estado de Devolución</th>
                      <th className="pb-3 font-questrial font-semibold text-right">Cargo de Limpieza</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50/50">
                    <tr className="text-gray-700">
                      <td className="py-3.5 font-medium flex items-center gap-2 font-questrial">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Tutú Flamenco Especial
                      </td>
                      <td className="py-3.5 text-gray-500 font-questrial">12 Mayo, 2026</td>
                      <td className="py-3.5 font-questrial">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-600">Retrasado</span>
                      </td>
                      <td className="py-3.5 text-right font-questrial font-bold text-red-500">$25.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-6">

            {/* Mis Clases y Horarios / Cupos de su grupo */}
            <div className="glass-card p-6 shadow-sm text-center">
              <h3 className="text-lg font-anton mb-4 text-left">Mi Grupo Actual</h3>
              <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[10px] border-purple-100"></div>
                <div className="absolute inset-0 rounded-full border-[10px] border-[#5e0472] border-t-pink-400 rotate-12"></div>
                <div>
                  <span className="text-xl font-questrial font-black text-[#5e0472]">Grupo B</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 text-left text-xs">
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/30">
                  <p className="text-gray-400 font-questrial font-medium">Horario Regular</p>
                  <p className="font-questrial font-bold text-[#5e0472] text-sm">Lun - Mie - Vie | 4:00 PM</p>
                </div>
              </div>
            </div>

            {/* Agenda del Alumno (Calendario de Ensayos / Exámenes) */}
            <div className="glass-card p-6 shadow-sm">
              <h3 className="text-lg font-anton mb-2 text-left">Calendario de Ensayos</h3>
              <AcademicCalendar />
            </div>

            {/* Buzón de Comunicados de la Dirección / Profesores */}
            <div className="glass-card p-6 shadow-sm">
              <h3 className="text-lg font-anton mb-4">Anuncios de Profesores</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/50 text-xs border border-purple-50">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-questrial font-bold text-gray-800">Prof. Andrea Mendoza</p>
                    <p className="font-questrial text-gray-500 italic mt-0.5">
                      "Recuerden traer calzado de gala para el ensayo general de este viernes sin falta."
                    </p>
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