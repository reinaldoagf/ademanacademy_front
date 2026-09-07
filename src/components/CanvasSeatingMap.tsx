// /components/CanvasSeatingMap.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Armchair, Info, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { SeatingMapElement, SeatingMap } from "@/types/seating-map";
import { EventData } from "@/types/event";

interface SeatingMapProps {
  eventData: EventData;
  seatingMap: SeatingMap;
  seatsOccupied?: string[]; // IDs de asientos vendidos ej: ["silla-1234"]
  onSeleccionChange: (asientosSeleccionados: SeatingMapElement[]) => void;
}

export const CanvasSeatingMap: React.FC<SeatingMapProps> = ({
  eventData,
  seatingMap,
  seatsOccupied = [],
  onSeleccionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [occupiedSeatsState, setOccupiedSeatsState] = useState<string[]>(seatsOccupied);
  const [selected, setSelected] = useState<SeatingMapElement[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredSeat, setHoveredSeat] = useState<{
    element: SeatingMapElement;
    x: number;
    y: number;
  } | null>(null);
  // Factor de escala (píxeles por metro)
  const SCALE = 25;

  // CONSTANTES GLOBALES DE AJUSTE VISUAL (Solo aplican a sillas)
  const CHAIR_INCREASE_FACTOR = 1.0;      // 25% más grandes
  const COLUMN_SPACE_FACTOR = 1.0;   // 15% más de separación horizontal entre sillas

  // Dimensiones dinámicas del Canvas calculadas a partir del mapa de asientos
  const baseWidth = Math.max(800, (seatingMap.totalWidth || 30) * SCALE * COLUMN_SPACE_FACTOR);
  const baseHeight = Math.max(500, (seatingMap.totalHeight || 20) * SCALE);

  const canvasWidth = baseWidth * zoomLevel;
  const canvasHeight = baseHeight * zoomLevel;

  // Funciones para control de Zoom
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.6));
  const handleZoomReset = () => setZoomLevel(1);
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    let foundElement: SeatingMapElement | undefined = undefined;

    // Recorrer los elementos del mapa
    for (let i = seatingMap.elements.length - 1; i >= 0; i--) {
      const el = seatingMap.elements[i];
      if (el.type === "platform") continue;

      if (checkIntersection(mouseX, mouseY, el)) {
        foundElement = el;
        break;
      }
    }

    if (foundElement) {
      canvas.style.cursor = "pointer";
      setHoveredSeat({
        element: foundElement,
        x: mouseX,
        y: mouseY,
      });
    } else {
      canvas.style.cursor = "default";
      setHoveredSeat(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSeat(null);
  };
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  // Función auxiliar idéntica al editor para calcular centros de rotación grupal
  const getLotCenter = (elementsLot: SeatingMapElement[]) => {
    if (elementsLot.length === 0) return { x: 0, y: 0 };
    const minX = Math.min(...elementsLot.map((o) => o.xMeters * SCALE));
    const maxX = Math.max(...elementsLot.map((o) => (o.xMeters + o.widthMeters) * SCALE));
    const minY = Math.min(...elementsLot.map((o) => o.yMeters * SCALE));
    const maxY = Math.max(...elementsLot.map((o) => (o.yMeters + o.heightMeters) * SCALE));
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
  };

  // Función matemática ajustada al nivel de zoom para descifrar clics
  const checkIntersection = (mX: number, mY: number, obj: SeatingMapElement) => {
    // Normalizar coordenadas del clic eliminando el factor del zoom
    const unscaledMX = mX / zoomLevel;
    const unscaledMY = mY / zoomLevel;

    let tX = unscaledMX;
    let tY = unscaledMY;

    const fAumento = obj.type !== "platform" ? CHAIR_INCREASE_FACTOR : 1.0;
    const fEspacio = obj.type !== "platform" ? COLUMN_SPACE_FACTOR : 1.0;

    const x = obj.xMeters * SCALE * fEspacio;
    const y = obj.yMeters * SCALE;
    const w = obj.widthMeters * SCALE * fAumento;
    const h = obj.heightMeters * SCALE * fAumento;

    if (obj.groupId && obj.groupRotation) {
      const g = seatingMap.elements.filter((o) => o.groupId === obj.groupId);
      const cOriginal = getLotCenter(g);

      const c = {
        x: cOriginal.x * fEspacio,
        y: cOriginal.y
      };

      const radG = (-obj.groupRotation * Math.PI) / 180;
      tX = c.x + (unscaledMX - c.x) * Math.cos(radG) - (unscaledMY - c.y) * Math.sin(radG);
      tY = c.y + (unscaledMX - c.x) * Math.sin(radG) + (unscaledMY - c.y) * Math.cos(radG);
    }

    const cX = x + w / 2;
    const cY = y + h / 2;
    const radL = (-obj.rotation * Math.PI) / 180;
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

    let elementClicked: SeatingMapElement | undefined = undefined;
    for (let i = seatingMap.elements.length - 1; i >= 0; i--) {
      const el = seatingMap.elements[i];
      if (el.type === "platform") continue;
      if (el.id && occupiedSeatsState.includes(el.id)) continue;

      if (checkIntersection(clickX, clickY, el)) {
        elementClicked = el;
        break;
      }
    }

    if (elementClicked) {
      let newSelection: SeatingMapElement[];
      if (selected.some((s) => s.itemID === elementClicked!.itemID)) {
        newSelection = selected.filter((s) => s.itemID !== elementClicked!.itemID);
      } else {
        newSelection = [...selected, elementClicked];
      }
      setSelected(newSelection);
      onSeleccionChange(newSelection);
    }
  };

  // Socket.IO
  useEffect(() => {
    if (!eventData?.id) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const socket: Socket = io(socketUrl);

    socket.emit("joinEventRoom", { eventId: eventData.id });

    socket.on(
      "seatsUpdated",
      (data: {
        eventId: string;
        seats: Array<{ seatingMapElementId: string; status: string }>;
      }) => {
        if (data.eventId !== eventData.id) return;
        setOccupiedSeatsState((prevOccupied) => {
          const freedIds = new Set(
            data.seats
              .filter((s) => s.status === "available")
              .map((s) => s.seatingMapElementId)
          );
          return prevOccupied.filter((id) => !freedIds.has(id));
        });
      }
    );

    return () => {
      socket.emit("leaveEventRoom", { eventId: eventData.id });
      socket.disconnect();
    };
  }, [eventData?.id]);

  useEffect(() => {
    setOccupiedSeatsState(seatsOccupied);
  }, [seatsOccupied]);

  // Dibujo del Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Escalar el contexto según el nivel de zoom
    ctx.scale(zoomLevel, zoomLevel);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    seatingMap.elements.forEach((el) => {
      // Aplicamos COLUMN_SPACE_FACTOR globalmente a la posición X de TODOS los elementos 
      // para que mantengan la misma distancia relativa entre sí.
      const x = el.xMeters * SCALE * COLUMN_SPACE_FACTOR;
      const y = el.yMeters * SCALE;

      // El tamaño del sprite (width/height) solo aumenta para sillas
      const fAumento = el.type !== "platform" ? CHAIR_INCREASE_FACTOR : 1.0;
      const w = el.widthMeters * SCALE * fAumento;
      const h = el.heightMeters * SCALE * fAumento;

      ctx.save();
      const centroX = x + w / 2;
      const centroY = y + h / 2;

      let rotacionDelGrupoRad = 0;
      if (el.groupId && el.groupRotation) {
        const grupoSillas = seatingMap.elements.filter((o) => o.groupId === el.groupId);
        const gCentroOriginal = getLotCenter(grupoSillas);

        // Mantenemos COLUMN_SPACE_FACTOR en el punto de pivote del grupo
        const gCentro = {
          x: gCentroOriginal.x * SCALE * COLUMN_SPACE_FACTOR,
          y: gCentroOriginal.y * SCALE,
        };

        rotacionDelGrupoRad = (el.groupRotation * Math.PI) / 180;
        ctx.translate(gCentro.x, gCentro.y);
        ctx.rotate(rotacionDelGrupoRad);
        ctx.translate(-gCentro.x, -gCentro.y);
      }

      const rotacionLocalRad = (el.rotation * Math.PI) / 180;
      ctx.translate(centroX, centroY);
      ctx.rotate(rotacionLocalRad);

      const localX = -w / 2;
      const localY = -h / 2;

      if (el.type === "platform") {
        ctx.fillStyle = "#334155";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(localX, localY, w, h, 8);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        for (let step = localY + 15; step < localY + h; step += 15) {
          ctx.beginPath();
          ctx.moveTo(localX, step);
          ctx.lineTo(localX + w, step);
          ctx.stroke();
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Questrial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(el.name, 0, 0);
      } else {
        const itsBusy = el.id && occupiedSeatsState.includes(el.id);
        const isSelected = selected.some((s) => s.itemID === el.itemID);

        let colorCushion = "#6e0372";
        let colorStructure = "#4a024d";

        if (itsBusy) {
          colorCushion = "#f43f5e";
          colorStructure = "#be123c";
        } else if (isSelected) {
          colorCushion = "#10b981";
          colorStructure = "#047857";
        } else {
          if (el.itemType === "general_chair") { colorCushion = "#64748b"; colorStructure = "#334155"; }
          else if (el.itemType === "preferred_seating") { colorCushion = "#bf72f6"; colorStructure = "#9810fa"; }
          else if (el.itemType === "sponsor_chair") { colorCushion = "#eab308"; colorStructure = "#ca8a04"; }
        }

        const rEsq = Math.min(w, h) * 0.25;

        ctx.fillStyle = colorCushion;
        ctx.strokeStyle = colorStructure;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(localX + 3, localY + 3, w - 6, h - 8, rEsq);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colorStructure;
        ctx.beginPath();
        ctx.roundRect(localX + 2, localY + h - h * 0.22 - 2, w - 4, h * 0.22, rEsq / 2);
        ctx.fill();

        ctx.strokeStyle = colorStructure;
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(localX + 1.5, localY + 4); ctx.lineTo(localX + 1.5, localY + h - 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(localX + w - 1.5, localY + 4); ctx.lineTo(localX + w - 1.5, localY + h - 4); ctx.stroke();

        const textoSilla = el.chairNumber || el.name.replace("Asiento ", "");
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

    ctx.restore();
  }, [selected, seatingMap, occupiedSeatsState, zoomLevel, baseWidth, baseHeight]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Leyenda Dinámica */}
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

      {/* Contenedor con Scroll y Controles de Zoom */}
      <div className="relative border border-purple-50 rounded-lg overflow-hidden bg-gray-50/50">
        {/* Barra de Herramientas del Zoom */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Acercar (Zoom In)"
            className="cursor-pointer p-1.5 hover:bg-purple-50 text-purple-700 rounded transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Alejar (Zoom Out)"
            className="cursor-pointer p-1.5 hover:bg-purple-50 text-purple-700 rounded transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            title="Restablecer vista"
            className="p-1.5 hover:bg-purple-50 text-purple-700 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-semibold text-gray-500 px-2 select-none border-l border-gray-200">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Scrollbox para navegación de mapas grandes */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          className="overflow-auto max-h-[550px] max-w-full flex justify-start lg:justify-center p-4 cursor-grab active:cursor-grabbing"
        >

          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="cursor-pointer border border-gray-200 bg-white shadow-md rounded transition-all duration-75"
          />
          {/* TOOLTIP EMERGENTE EN HOVER */}
          {hoveredSeat && (
            <div
              style={{
                position: "absolute",
                top: hoveredSeat.y,
                left: hoveredSeat.x,
                pointerEvents: "none", // Evita interferir con los clics del mouse
                transform: "translate(0, -10%)",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                padding: "8px 12px",
                borderRadius: "6px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
                fontSize: "12px",
                fontFamily: "Questrial, sans-serif",
                zIndex: 50,
                whiteSpace: "nowrap",
                border: "1px solid #334155",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "13px", color: "#38bdf8" }}>
                {hoveredSeat.element.name || `Asiento ${hoveredSeat.element.chairNumber}`}
              </div>
              <div>Tipo: {hoveredSeat.element.itemType || "Estándar"}</div>
              {hoveredSeat.element.price !== undefined && (
                <div style={{ color: "#34d399", fontWeight: "bold", marginTop: "2px" }}>
                  Precio: ${hoveredSeat.element.price}
                </div>
              )}
              {occupiedSeatsState.includes(hoveredSeat.element.id || '') && (
                <div style={{ color: "#f43f5e", marginTop: "2px", fontWeight: "bold" }}>
                  Ocupado
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Info Inferior */}
      <div className="bg-purple-50 p-3 flex items-center justify-between text-xs text-purple-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Armchair className="w-4 h-4 text-purple-600" />
          <span className="font-questrial">
            Asientos elegidos:{" "}
            <strong className="font-bold">
              {isMounted && selected.length > 0
                ? selected.map((s) => s.chairNumber).join(", ")
                : "Ninguno"}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Info className="w-3.5 h-3.5" />
          <span className="font-questrial">Haz clic en los asientos para seleccionarlos | Usa Ctrl + Rueda para Zoom</span>
        </div>
      </div>
    </div>
  );
};