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
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [hoveredSeat, setHoveredSeat] = useState<{
    element: SeatingMapElement;
    x: number;
    y: number;
  } | null>(null);

  // Escala fija uniforme (Píxeles por Metro) para mantener la proporción 1:1 exacta de ancho/alto
  const SCALE = 35;

  // Factores globales ajustados simétricamente para evitar distorsiones
  const CHAIR_INCREASE_FACTOR = 1.0;

  // Dimensiones internas del Canvas (Buffer lógico)
  const baseWidth = Math.max(800, (seatingMap.totalWidth || 30) * SCALE);
  const baseHeight = Math.max(500, (seatingMap.totalHeight || 20) * SCALE);

  const canvasWidth = baseWidth * zoomLevel;
  const canvasHeight = baseHeight * zoomLevel;

  // Helper para obtener el centro del grupo (en metros)
  const getLotCenterInMeters = (elements: SeatingMapElement[]) => {
    if (!elements || elements.length === 0) return { x: 0, y: 0 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    elements.forEach((el) => {
      const w = el.widthMeters || (el.width ? el.width / SCALE : 0.8);
      const h = el.heightMeters || (el.height ? el.height / SCALE : 0.8);
      minX = Math.min(minX, el.xMeters);
      maxX = Math.max(maxX, el.xMeters + w);
      minY = Math.min(minY, el.yMeters);
      maxY = Math.max(maxY, el.yMeters + h);
    });

    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    };
  };

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

  /**
    * CORRECCIÓN #2: Obtiene las coordenadas exactas dentro del buffer interno del Canvas
    * independiente del CSS, del zoom o de la escala.
    */
  const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // Calcula la relación de escala entre los píxeles reales del CSS y el buffer interno
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Coordenada exacta en el Canvas (tomando en cuenta el Zoom interno del CTX)
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;

    return {
      x: canvasX / zoomLevel,
      y: canvasY / zoomLevel,
    };
  };


  /**
   * CORRECCIÓN #1 y #2: Chequeo de colisión matemático sin desfasamiento por rotación o proporciones
   */
  const checkIntersection = (unscaledMX: number, unscaledMY: number, obj: SeatingMapElement) => {
    let tX = unscaledMX;
    let tY = unscaledMY;

    const fAumento = obj.type !== "platform" ? CHAIR_INCREASE_FACTOR : 1.0;

    // Usamos dimensiones uniformes
    const w = (obj.widthMeters || 0.8) * SCALE * fAumento;
    const h = (obj.heightMeters || 0.8) * SCALE * fAumento;
    const x = obj.xMeters * SCALE;
    const y = obj.yMeters * SCALE;

    // 1. Desrotar según el Centro del Grupo (si pertenece a un grupo con rotación)
    if (obj.groupId && obj.groupRotation) {
      const groupElements = seatingMap.elements.filter((o) => o.groupId === obj.groupId);
      const cMeters = getLotCenterInMeters(groupElements);

      const c = {
        x: cMeters.x * SCALE,
        y: cMeters.y * SCALE,
      };

      const radG = (-obj.groupRotation * Math.PI) / 180;
      const dx = unscaledMX - c.x;
      const dy = unscaledMY - c.y;

      tX = c.x + dx * Math.cos(radG) - dy * Math.sin(radG);
      tY = c.y + dx * Math.sin(radG) + dy * Math.cos(radG);
    }

    // 2. Desrotar la posición respecto a la rotación individual del objeto
    const cX = x + w / 2;
    const cY = y + h / 2;
    const radL = (-obj.rotation * Math.PI) / 180;

    const dxL = tX - cX;
    const dyL = tY - cY;

    const fX = cX + dxL * Math.cos(radL) - dyL * Math.sin(radL);
    const fY = cY + dxL * Math.sin(radL) + dyL * Math.cos(radL);

    // Bounding box en espacio local
    return fX >= x && fX <= x + w && fY >= y && fY <= y + h;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x: clickX, y: clickY } = getCanvasCoordinates(event);

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
  // Sincronizar el estado interno si el prop 'seatsOccupied' cambia desde el padre
  useEffect(() => {
    setOccupiedSeatsState(seatsOccupied);
  }, [seatsOccupied]);
  // Socket.IO
  // Escuchar cambios de Socket.IO en tiempo real
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
        // Extraer IDs liberados
        const freedIds = new Set(
          data.seats
            .filter((s) => s.status === "available" || s.status === "AVAILABLE")
            .map((s) => s.seatingMapElementId)
        );

        // Actualizar ocupados: comprobamos contra seatingMapElementId e id
        setOccupiedSeatsState((prevOccupied) =>
          prevOccupied.filter((seatId) => {
            // Si el seatId almacenado coincide directamente con alguno liberado
            if (freedIds.has(seatId)) return false;

            // Si el estado guarda el id del elemento o itemID en el objeto del mapa
            const matchingElement = seatingMap.elements.find(
              (el) => el.id === seatId || el.itemID === seatId
            );

            if (matchingElement && freedIds.has(matchingElement.itemID)) {
              return false;
            }

            return true;
          })
        );

        // Deseleccionar asientos si el usuario los tenía marcados en su UI
        setSelected((prevSelected) =>
          prevSelected.filter((el) => !freedIds.has(el.itemID))
        );
      }
    );

    return () => {
      socket.emit("leaveEventRoom", { eventId: eventData.id });
      socket.disconnect();
    };
  }, [eventData?.id, seatingMap]);

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
    ctx.scale(zoomLevel, zoomLevel);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, baseWidth, baseHeight);

    seatingMap.elements.forEach((el) => {
      const fAumento = el.type !== "platform" ? CHAIR_INCREASE_FACTOR : 1.0;

      // Dimensiones cuadradas/proporcionales exactas (1:1 en metros)
      const w = (el.widthMeters || 0.8) * SCALE * fAumento;
      const h = (el.heightMeters || 0.8) * SCALE * fAumento;
      const x = el.xMeters * SCALE;
      const y = el.yMeters * SCALE;

      ctx.save();
      const centroX = x + w / 2;
      const centroY = y + h / 2;

      let rotacionDelGrupoRad = 0;
      if (el.groupId && el.groupRotation) {
        const grupoSillas = seatingMap.elements.filter((o) => o.groupId === el.groupId);
        const gCentroMeters = getLotCenterInMeters(grupoSillas);

        const gCentro = {
          x: gCentroMeters.x * SCALE,
          y: gCentroMeters.y * SCALE,
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
          if (el.itemType === "general_chair") {
            colorCushion = "#64748b";
            colorStructure = "#334155";
          } else if (el.itemType === "preferred_seating") {
            colorCushion = "#bf72f6";
            colorStructure = "#9810fa";
          } else if (el.itemType === "sponsor_chair") {
            colorCushion = "#eab308";
            colorStructure = "#ca8a04";
          }
        }

        const rEsq = Math.min(w, h) * 0.25;

        // Asiento principal
        ctx.fillStyle = colorCushion;
        ctx.strokeStyle = colorStructure;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(localX + 3, localY + 3, w - 6, h - 8, rEsq);
        ctx.fill();
        ctx.stroke();

        // Respaldar
        ctx.fillStyle = colorStructure;
        ctx.beginPath();
        ctx.roundRect(localX + 2, localY + h - h * 0.22 - 2, w - 4, h * 0.22, rEsq / 2);
        ctx.fill();

        // Reposabrazos
        ctx.strokeStyle = colorStructure;
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(localX + 1.5, localY + 4);
        ctx.lineTo(localX + 1.5, localY + h - 4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(localX + w - 1.5, localY + 4);
        ctx.lineTo(localX + w - 1.5, localY + h - 4);
        ctx.stroke();

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
          className="w-full max-h-[50vh] overflow-auto border border-gray-300 rounded-lg bg-gray-50 p-4 relative"
        >
          <div className="inline-block min-w-full min-h-full flex justify-center items-center">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
              }}
              className="cursor-pointer border border-gray-200 bg-white shadow-md rounded transition-all duration-75 block"
            />
          </div>

          {/* TOOLTIP EMERGENTE EN HOVER */}
          {hoveredSeat && (
            <div
              style={{
                position: "absolute",
                top: hoveredSeat.y,
                left: hoveredSeat.x,
                pointerEvents: "none", // Evita interferir con los clics del mouse
                transform: "translate(0, -110%)",
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