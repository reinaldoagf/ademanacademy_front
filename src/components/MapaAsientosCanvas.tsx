// /components/MapaAsientosCanvas.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Armchair, Info } from "lucide-react";

export interface ElementoMapa {
  itemID: string;
  tipo: "tarima_pista" | "silla_vip" | "silla_general" | "silla_patrocinante" | "silla_preferencial" | string;
  nombre: string;
  numeroSilla?: string;
  grupoId?: string;
  rotacion: number;
  rotacionGrupo?: number; // Añadido para soportar la rotación heredada del lote
  precio: number;
  xMetros: number;
  yMetros: number;
  anchoMetros: number;
  altoMetros: number;
}

export interface PayloadMapa {
  anchoTotalSalón: number;
  altoTotalSalón: number;
  elementos: ElementoMapa[];
}

interface MapaAsientosProps {
  mapaConfig: PayloadMapa;
  asientosOcupados?: string[]; // IDs de asientos vendidos ej: ["silla-1234"]
  onSeleccionChange: (asientosSeleccionados: ElementoMapa[]) => void;
}

export const MapaAsientosCanvas: React.FC<MapaAsientosProps> = ({
  mapaConfig,
  asientosOcupados = [],
  onSeleccionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [seleccionados, setSeleccionados] = useState<ElementoMapa[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Factor de escala (píxeles por metro)
  const ESCALA = 25; 
  
  const canvasWidth = mapaConfig.anchoTotalSalón * ESCALA;
  const canvasHeight = mapaConfig.altoTotalSalón * ESCALA;

  // Función auxiliar idéntica al editor para calcular centros de rotación grupal
  const obtenerCentroDelLote = (elementosLote: ElementoMapa[]) => {
    if (elementosLote.length === 0) return { x: 0, y: 0 };
    const minX = Math.min(...elementosLote.map((o) => o.xMetros * ESCALA));
    const maxX = Math.max(...elementosLote.map((o) => (o.xMetros + o.anchoMetros) * ESCALA));
    const minY = Math.min(...elementosLote.map((o) => o.yMetros * ESCALA));
    const maxY = Math.max(...elementosLote.map((o) => (o.yMetros + o.altoMetros) * ESCALA));
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpiar escenario
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo del salón
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Renderizar elementos con diseño idéntico al editor
    mapaConfig.elementos.forEach((el) => {
      const x = el.xMetros * ESCALA;
      const y = el.yMetros * ESCALA;
      const w = el.anchoMetros * ESCALA;
      const h = el.altoMetros * ESCALA;

      ctx.save();
      const centroX = x + w / 2;
      const centroY = y + h / 2;

      // 1. Aplicar Rotación de Grupo (si existe)
      let rotacionDelGrupoRad = 0;
      if (el.grupoId && el.rotacionGrupo) {
        const grupoSillas = mapaConfig.elementos.filter((o) => o.grupoId === el.grupoId);
        const gCentro = obtenerCentroDelLote(grupoSillas);
        rotacionDelGrupoRad = (el.rotacionGrupo * Math.PI) / 180;
        ctx.translate(gCentro.x, gCentro.y);
        ctx.rotate(rotacionDelGrupoRad);
        ctx.translate(-gCentro.x, -gCentro.y);
      }

      // 2. Aplicar Rotación Local
      const rotacionLocalRad = (el.rotacion * Math.PI) / 180;
      ctx.translate(centroX, centroY);
      ctx.rotate(rotacionLocalRad);
      
      const localX = -w / 2;
      const localY = -h / 2;

      if (el.tipo === "tarima_pista") {
        // --- DISEÑO DE TARIMA ORIGINAL ---
        ctx.fillStyle = "#334155"; 
        ctx.strokeStyle = "#1e293b"; 
        ctx.lineWidth = 3;
        ctx.beginPath(); 
        ctx.roundRect(localX, localY, w, h, 8); 
        ctx.fill(); 
        ctx.stroke();
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)"; 
        ctx.lineWidth = 1;
        for (let step = localY + 15; step < localY + h; step += 15) { 
          ctx.beginPath(); ctx.moveTo(localX, step); ctx.lineTo(localX + w, step); ctx.stroke(); 
        }

        ctx.fillStyle = "#ffffff"; 
        ctx.font = "bold 13px Questrial, sans-serif";
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        ctx.fillText(el.nombre, 0, 0);
      } else {
        // --- DISEÑO DE SILLAS CON ESTADOS DE SELECCIÓN ---
        const esOcupado = asientosOcupados.includes(el.itemID);
        const esSeleccionado = seleccionados.some((s) => s.itemID === el.itemID);

        let colorCojin = "#6e0372"; 
        let colorEstructura = "#4a024d";

        // Asignación de colores por tipo (si está disponible)
        if (esOcupado) {
          colorCojin = "#f43f5e"; // Rose 500
          colorEstructura = "#be123c"; // Rose 700
        } else if (esSeleccionado) {
          colorCojin = "#10b981"; // Emerald 500
          colorEstructura = "#047857"; // Emerald 700
        } else {
          // Paleta original basada en tipo de asiento
          if (el.tipo === "silla_general") { colorCojin = "#64748b"; colorEstructura = "#334155"; }
          else if (el.tipo === "silla_preferencial") { colorCojin = "#bf72f6"; colorEstructura = "#9810fa"; }
          else if (el.tipo === "silla_patrocinante") { colorCojin = "#eab308"; colorEstructura = "#ca8a04"; }
        }

        const rEsq = Math.min(w, h) * 0.25;
        
        // Cojín Principal
        ctx.fillStyle = colorCojin; 
        ctx.strokeStyle = colorEstructura; 
        ctx.lineWidth = 2;
        ctx.beginPath(); 
        ctx.roundRect(localX + 3, localY + 3, w - 6, h - 8, rEsq); 
        ctx.fill(); 
        ctx.stroke();
        
        // Espaldar
        ctx.fillStyle = colorEstructura; 
        ctx.beginPath(); 
        ctx.roundRect(localX + 2, localY + h - h * 0.22 - 2, w - 4, h * 0.22, rEsq / 2); 
        ctx.fill();
        
        // Brazos Laterales (Izquierdo y Derecho)
        ctx.strokeStyle = colorEstructura; 
        ctx.lineWidth = 3.5; 
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(localX + 1.5, localY + 4); ctx.lineTo(localX + 1.5, localY + h - 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(localX + w - 1.5, localY + 4); ctx.lineTo(localX + w - 1.5, localY + h - 4); ctx.stroke();

        // Número de Silla Responsivo
        const textoSilla = el.numeroSilla || el.nombre.replace("Asiento ", "");
        if (textoSilla) {
          ctx.save(); 
          ctx.rotate(-(rotacionLocalRad + rotacionDelGrupoRad));
          ctx.fillStyle = "#ffffff"; 
          
          const largoTexto = textoSilla.toString().length;
          const factorEscala = largoTexto > 3 ? 0.35 : 0.45;
          
          ctx.font = `bold ${Math.max(9, w * factorEscala)}px Questrial, sans-serif`;
          ctx.textAlign = "center"; 
          ctx.textBaseline = "middle"; 
          ctx.shadowColor = "rgba(0, 0, 0, 0.4)"; 
          ctx.shadowBlur = 2;
          
          ctx.fillText(textoSilla.toString(), 0, -2); 
          ctx.restore();
        }
      }
      ctx.restore();
    });
  }, [seleccionados, mapaConfig, asientosOcupados]);

  // Función matemática idéntica al editor para descifrar clics con rotación matricial
  const comprobarInterseccion = (mX: number, mY: number, obj: ElementoMapa) => {
    let tX = mX; 
    let tY = mY;
    const x = obj.xMetros * ESCALA;
    const y = obj.yMetros * ESCALA;
    const w = obj.anchoMetros * ESCALA;
    const h = obj.altoMetros * ESCALA;

    if (obj.grupoId && obj.rotacionGrupo) {
      const g = mapaConfig.elementos.filter((o) => o.grupoId === obj.grupoId); 
      const c = obtenerCentroDelLote(g);
      const radG = (-obj.rotacionGrupo * Math.PI) / 180;
      tX = c.x + (mX - c.x) * Math.cos(radG) - (mY - c.y) * Math.sin(radG);
      tY = c.y + (mX - c.x) * Math.sin(radG) + (mY - c.y) * Math.cos(radG);
    }
    
    const cX = x + w / 2; 
    const cY = y + h / 2; 
    const radL = (-obj.rotacion * Math.PI) / 180;
    const fX = cX + (tX - cX) * Math.cos(radL) - (tY - cY) * Math.sin(radL);
    const fY = cY + (tX - cX) * Math.sin(radL) + (tY - cY) * Math.cos(radL);
    
    return (fX >= x && fX <= x + w && fY >= y && fY <= y + h);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Recorremos de atrás hacia adelante para priorizar los elementos superiores
    let elementoClickeado: ElementoMapa | undefined = undefined;
    for (let i = mapaConfig.elementos.length - 1; i >= 0; i--) {
      const el = mapaConfig.elementos[i];
      if (el.tipo === "tarima_pista") continue;
      if (asientosOcupados.includes(el.itemID)) continue;

      if (comprobarInterseccion(clickX, clickY, el)) {
        elementoClickeado = el;
        break;
      }
    }

    if (elementoClickeado) {
      let nuevaSeleccion: ElementoMapa[];
      if (seleccionados.some((s) => s.itemID === elementoClickeado!.itemID)) {
        nuevaSeleccion = seleccionados.filter((s) => s.itemID !== elementoClickeado!.itemID);
      } else {
        nuevaSeleccion = [...seleccionados, elementoClickeado];
      }
      setSeleccionados(nuevaSeleccion);
      onSeleccionChange(nuevaSeleccion);
    }
  };
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <div className="space-y-4">
      {/* Leyenda Dinámica Adaptada */}
      <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-gray-500 py-2 border-b border-purple-50">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-purple-600 border border-purple-800 inline-block"></span>
          <span className="font-questrial">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-slate-500 border border-slate-700 inline-block"></span>
          <span className="font-questrial">General</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-purple-400 border border-purple-600 inline-block"></span>
          <span className="font-questrial">Preferencial</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-500 border border-yellow-600 inline-block"></span>
          <span className="font-questrial">Patrocinante</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-emerald-500 border border-emerald-600 inline-block"></span>
          <span className="font-questrial">Tu Selección</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-rose-500 border border-rose-600 inline-block"></span>
          <span className="font-questrial">Ocupado</span>
        </div>
      </div>

      {/* Contenedor del Canvas */}
      <div className="overflow-auto p-4 bg-gray-50/50 border border-purple-50 max-h-[550px] flex justify-start lg:justify-center">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleCanvasClick}
          className="cursor-pointer border border-gray-200 bg-white shadow-md"
        />
      </div>

      {/* Info Inferior */}
      <div className="bg-purple-50 p-3 flex items-center justify-between text-xs text-purple-800">
        <div className="flex items-center gap-2">
          <Armchair className="w-4 h-4 text-purple-600" />
          <span className="font-questrial">
            Asientos elegidos:{" "}
            <strong className="font-bold">
              {isMounted && seleccionados.length > 0
                ? seleccionados.map((s) => s.numeroSilla).join(", ")
                : "Ninguno"}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Info className="w-3.5 h-3.5" />
          <span className="font-questrial">Haz clic en los asientos para seleccionarlos</span>
        </div>
      </div>
    </div>
  );
};