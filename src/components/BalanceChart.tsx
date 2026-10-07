// src/features/pagos/components/BalanceChart.tsx
"use client";

import { BalanceChartProps } from '@/types/dashboard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ScriptableContext
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Registrar los módulos necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);
export function BalanceChart({ chartData, isLoading }: BalanceChartProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[160px] animate-pulse">
        <div className="w-full h-32 bg-purple-100/40 rounded-xl" />
      </div>
    );
  }
  if (!chartData) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[160px]">
        <p className="text-gray-500">No hay datos para mostrar.</p>
      </div>
    );
  }
  const labels = chartData?.labels ?? ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
  const recaudado = chartData?.recaudadoData ?? [0, 0, 0, 0];
  const cuentasPorCobrar = chartData?.cuentasPorCobrarData ?? [0, 0, 0, 0];

  const data = {
    labels,
    datasets: [
      {
        label: "Recaudado",
        data: recaudado,
        borderColor: "#5e0472",
        borderWidth: 2.5,
        tension: 0.35,
        pointBackgroundColor: "#5e0472",
        pointHoverRadius: 6,
        fill: true,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 160);
          gradient.addColorStop(0, "rgba(168, 85, 247, 0.25)");
          gradient.addColorStop(1, "rgba(168, 85, 247, 0.0)");
          return gradient;
        },
      },
      {
        label: "Cuentas por Cobrar",
        data: cuentasPorCobrar,
        borderColor: "#f472b6",
        borderWidth: 2,
        tension: 0.35,
        pointBackgroundColor: "#f472b6",
        pointHoverRadius: 6,
        fill: true,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 160);
          gradient.addColorStop(0, "rgba(236, 72, 153, 0.15)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 0.0)");
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        padding: 10,
        titleFont: { size: 12, weight: "bold" as const },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            return `${context.dataset.label}: $${val.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(243, 232, 255, 0.6)" },
        ticks: {
          color: "#9ca3af",
          font: { size: 11 },
          callback: (value: any) => `$${value}`,
        },
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[160px]">
      <Line data={data} options={options} />
    </div>
  );
}