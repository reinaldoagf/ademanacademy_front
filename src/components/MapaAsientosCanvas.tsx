// src/components/MapaAsientosCanvas.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Armchair, CheckCircle, Info } from "lucide-react";

interface MapaAsientosProps {
  filas?: number;
  columnas?: number;
  asientosOcupados?: string[]; // Ej: ["A-3", "B-5"]
  onSeleccionChange: (seleccionados: string[]) => void;
}

export const MapaAsientosCanvas: React.FC<MapaAsientosProps> = ({
  filas = 10,
  columnas = 14,
  asientosOcupados = ["A-3", "A-4", "B-7", "C-8", "C-9", "E-5"],
  onSeleccionChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<string[]>([]);

  // Dimensiones estéticas de las butacas
  const radioAsiento = 14;
  const espaciadoX = 38;
  const espaciadoY = 38;
  const offsetX = 50;
  const offsetY = 70;

  // Mapa de letras para las filas
  const obtenerLetraFila = (index: number) => String.fromCharCode(65 + index);

  // Redibujar el Canvas cada vez que cambie la selección
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpiar escenario
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Dibujar el Escenario / Tarima Principal
    ctx.fillStyle = "#7c3aed"; // Morado Omagie
    ctx.beginPath();
    ctx.roundRect(100, 15, canvas.width - 200, 18, 6);
    ctx.fill();

    ctx.fillStyle = "#6b7280";
    ctx.font = "bold 10px Questrial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ESCENARIO / PISTA PRINCIPAL", canvas.width / 2, 48);

    // 2. Renderizar la matriz de butacas
    for (let f = 0; f < filas; f++) {
      const letraFila = obtenerLetraFila(f);
      
      // Dibujar identificador de fila izquierdo
      ctx.fillStyle = "#9ca3af";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(letraFila, offsetX - 15, offsetY + f * espaciadoY + 4);

      for (let c = 1; c <= columnas; c++) {
        const idAsiento = `${letraFila}-${c}`;
        const posX = offsetX + (c - 1) * espaciadoX;
        const posY = offsetY + f * espaciadoY;

        const esOcupado = asientosOcupados.includes(idAsiento);
        const esSeleccionado = asientosSeleccionados.includes(idAsiento);

        // Definir paleta estética según el estado de la silla
        if (esOcupado) {
          ctx.fillStyle = "#f43f5e"; // Rosa / Ocupado
          ctx.strokeStyle = "#e11d48";
        } else if (esSeleccionado) {
          ctx.fillStyle = "#10b981"; // Esmeralda / Seleccionado
          ctx.strokeStyle = "#059669";
        } else {
          ctx.fillStyle = "#f3e8ff"; // Lila claro / Disponible
          ctx.strokeStyle = "#c084fc";
        }

        // Dibujar base del asiento (Círculo estilizado)
        ctx.beginPath();
        ctx.arc(posX, posY, radioAsiento, 0, 2 * Math.PI);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dibujar el número del asiento en su centro
        ctx.fillStyle = esOcupado || esSeleccionado ? "#ffffff" : "#7e22ce";
        ctx.font = "9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.toString(), posX, posY);
      }
    }
  }, [asientosSeleccionados, filas, columnas, asientosOcupados]);

  // Capturar los clics del mouse sobre el Canvas geométrico
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Detectar si el clic colisiona con el radio de alguna silla
    for (let f = 0; f < filas; f++) {
      const letraFila = obtenerLetraFila(f);
      for (let c = 1; c <= columnas; c++) {
        const idAsiento = `${letraFila}-${c}`;
        
        // Si ya está ocupado por otra entrada vendida, ignorar la colisión
        if (asientosOcupados.includes(idAsiento)) continue;

        const posX = offsetX + (c - 1) * espaciadoX;
        const posY = offsetY + f * espaciadoY;

        // Fórmula de la distancia Euclidiana para determinar colisión radial
        const distancia = Math.sqrt(Math.pow(clickX - posX, 2) + Math.pow(clickY - posY, 2));

        if (distancia <= radioAsiento) {
          let nuevaSeleccion: string[];
          
          if (asientosSeleccionados.includes(idAsiento)) {
            // Deseleccionar
            nuevaSeleccion = asientosSeleccionados.filter(item => item !== idAsiento);
          } else {
            // Seleccionar
            nuevaSeleccion = [...asientosSeleccionados, idAsiento];
          }

          setAsientosSeleccionados(nuevaSeleccion);
          onSeleccionChange(nuevaSeleccion);
          return; // Salir del bucle una vez hallada la silla
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Nomenclatura / Leyenda de Estados */}
      <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-gray-500 py-2 border-b border-purple-50">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-purple-100 border border-purple-400 inline-block"></span>
          <span className="font-questrial">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-emerald-500 border border-emerald-600 inline-block"></span>
          <span className="font-questrial">Tu Selección</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-rose-500 border border-rose-600 inline-block"></span>
          <span className="font-questrial">Vendido / Ocupado</span>
        </div>
      </div>

      {/* Contenedor con scroll adaptativo para el plano */}
      <div className="overflow-x-auto p-4 bg-gray-50/50 rounded-2xl border border-purple-50 flex justify-center">
        <canvas
          ref={canvasRef}
          width={columnas * espaciadoX + offsetX * 2 - 20}
          height={filas * espaciadoY + offsetY + 20}
          onClick={handleCanvasClick}
          className="cursor-pointer max-w-full"
        />
      </div>

      {/* Barra Informativa Inferior */}
      <div className="bg-purple-50 p-3 flex items-center justify-between text-xs font-questrial text-purple-800">
        <div className="flex items-center gap-2">
          <Armchair className="w-4 h-4 text-purple-600" />
          <span>
            Asientos elegidos:{" "}
            <strong className="font-bold font-mono">
              {asientosSeleccionados.length > 0 ? asientosSeleccionados.join(", ") : "Ninguno"}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Info className="w-3.5 h-3.5" />
          <span>Haz clic en los círculos para seleccionar</span>
        </div>
      </div>
    </div>
  );
};