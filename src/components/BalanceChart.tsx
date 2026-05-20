// src/features/pagos/components/BalanceChart.tsx
"use client";

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

export function BalanceChart() {
  // 1. Datos del gráfico
  const data = {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
    datasets: [
      {
        label: 'Recaudado',
        data: [2500, 3100, 2900, 3450],
        borderColor: '#5e0472', // Tu color Morado (#5e0472)
        borderWidth: 2.5,
        tension: 0.35, // Curvatura elegante de la línea
        pointBackgroundColor: '#5e0472',
        pointHoverRadius: 6,
        fill: true,
        // Gradiente dinámico para el fondo de la curva morada
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 160);
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
          return gradient;
        },
      },
      {
        label: 'Cuentas por Cobrar',
        data: [1200, 950, 1500, 800],
        borderColor: '#f472b6', // Tu color Rosa (#f472b6)
        borderWidth: 2,
        tension: 0.35,
        pointBackgroundColor: '#f472b6',
        pointHoverRadius: 6,
        fill: true,
        // Gradiente dinámico para el fondo de la curva rosa
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 160);
          gradient.addColorStop(0, 'rgba(236, 72, 153, 0.15)');
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0.0)');
          return gradient;
        },
      },
    ],
  };

  // 2. Opciones de configuración y estilización del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Lo ocultamos porque ya construimos nuestra propia leyenda HTML más estética
      },
      tooltip: {
        backgroundColor: '#1f2937', // Fondo gris oscuro minimalista para el tooltip
        padding: 10,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Ocultar rejilla vertical para un look más limpio
        },
        ticks: {
          color: '#9ca3af', // Color gris suave para las semanas
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(243, 232, 255, 0.6)', // Líneas horizontales moradas muy sutiles
        },
        ticks: {
          color: '#9ca3af',
          font: { size: 11 },
          callback: (value: any) => `$${value}`, // Formatear el eje Y con el símbolo de dólar
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