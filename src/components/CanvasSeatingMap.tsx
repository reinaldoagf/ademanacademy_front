// /components/CanvasSeatingMap.tsx
"use client";

import React, { useRef, useEffect, useState } from "react";
import { Armchair, Info } from "lucide-react";
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
  const [occupiedSeatsState, setOccupiedSeatsState] = useState<string[]>(seatsOccupied);
  const [selected, setSelected] = useState<SeatingMapElement[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Factor de escala (píxeles por metro)
  const SCALE = 25;

  // 💡 CONSTANTES GLOBALES DE AJUSTE VISUAL (Solo aplican a sillas)
  const CHAIR_INCREASE_FACTOR = 1.25;      // 25% más grandes
  const COLUMN_SPACE_FACTOR = 1.15;   // 15% más de separación horizontal entre sillas

  const canvasWidth = seatingMap.totalWidth * SCALE * COLUMN_SPACE_FACTOR;
  const canvasHeight = seatingMap.totalHeight * SCALE;

  // Función auxiliar idéntica al editor para calcular centros de rotación grupal
  const getLotCenter = (elementsLot: SeatingMapElement[]) => {
    if (elementsLot.length === 0) return { x: 0, y: 0 };
    const minX = Math.min(...elementsLot.map((o) => o.xMeters * SCALE));
    const maxX = Math.max(...elementsLot.map((o) => (o.xMeters + o.widthMeters) * SCALE));
    const minY = Math.min(...elementsLot.map((o) => o.yMeters * SCALE));
    const maxY = Math.max(...elementsLot.map((o) => (o.yMeters + o.heightMeters) * SCALE));
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
  };

  // Función matemática idéntica al editor para descifrar clics con rotación matricial
  const checkIntersection = (mX: number, mY: number, obj: SeatingMapElement) => {
    let tX = mX;
    let tY = mY;

    // 💡 Sincronizamos las dimensiones y espaciados con los del renderizado
    const fAumento = obj.itemType !== "stage_floor" ? CHAIR_INCREASE_FACTOR : 1.0;
    const fEspacio = obj.itemType !== "stage_floor" ? COLUMN_SPACE_FACTOR : 1.0;

    const x = obj.xMeters * SCALE * fEspacio;
    const y = obj.yMeters * SCALE;
    const w = obj.widthMeters * SCALE * fAumento;
    const h = obj.heightMeters * SCALE * fAumento;

    if (obj.groupId && obj.groupRotation) {
      const g = seatingMap.elements.filter((o) => o.groupId === obj.groupId);
      const cOriginal = getLotCenter(g);

      // Aplicamos el factor de espacio también al centro matricial de evaluación del clic
      const c = {
        x: cOriginal.x * fEspacio,
        y: cOriginal.y
      };

      const radG = (-obj.groupRotation * Math.PI) / 180;
      tX = c.x + (mX - c.x) * Math.cos(radG) - (mY - c.y) * Math.sin(radG);
      tY = c.y + (mX - c.x) * Math.sin(radG) + (mY - c.y) * Math.cos(radG);
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

    // Recorremos de atrás hacia adelante para priorizar los elementos superiores
    let elementClicked: SeatingMapElement | undefined = undefined;
    for (let i = seatingMap.elements.length - 1; i >= 0; i--) {
      const el = seatingMap.elements[i];
      if (el.itemType === "stage_floor") continue;
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
  // 2. Conexión a Socket.IO y actualización del estado en tiempo real
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
        if (data.eventId !== eventData.id) return
        // Actualizamos el estado local de forma inmutable
        setOccupiedSeatsState((prevOccupied) => {
          // Filtramos los asientos que fueron liberados (status === 'available')
          const freedIds = new Set(
            data.seats
              .filter((s) => s.status === "available")
              .map((s) => s.seatingMapElementId)
          );

          // Retornamos únicamente los IDs que NO han sido liberados
          return prevOccupied.filter((id) => !freedIds.has(id));
        });
      }
    );

    return () => {
      socket.emit("leaveEventRoom", { eventId: eventData.id });
      socket.disconnect();
    };
  }, [eventData?.id]);
  // Sincronizar el estado local si la prop inicial cambia desde el padre
  useEffect(() => {
    setOccupiedSeatsState(seatsOccupied);
  }, [seatsOccupied]);

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
    seatingMap.elements.forEach((el) => {
      // 💡 Aplicamos los factores condicionales según el tipo de elemento
      const fAumento = el.itemType !== "stage_floor" ? CHAIR_INCREASE_FACTOR : 1.0;
      const fEspacio = el.itemType !== "stage_floor" ? COLUMN_SPACE_FACTOR : 1.0;

      const x = el.xMeters * SCALE * fEspacio;
      const y = el.yMeters * SCALE;
      const w = el.widthMeters * SCALE * fAumento;
      const h = el.heightMeters * SCALE * fAumento;

      ctx.save();
      const centroX = x + w / 2;
      const centroY = y + h / 2;

      // 1. Aplicar Rotación de Grupo (si existe)
      let rotacionDelGrupoRad = 0;
      if (el.groupId && el.groupRotation) {
        const grupoSillas = seatingMap.elements.filter((o) => o.groupId === el.groupId);
        const gCentroOriginal = getLotCenter(grupoSillas);

        // El centro del lote se desplaza proporcionalmente al factor de espacio en X
        const gCentro = {
          x: gCentroOriginal.x * fEspacio,
          y: gCentroOriginal.y,
        };

        rotacionDelGrupoRad = (el.groupRotation * Math.PI) / 180;
        ctx.translate(gCentro.x, gCentro.y);
        ctx.rotate(rotacionDelGrupoRad);
        ctx.translate(-gCentro.x, -gCentro.y);
      }

      // 2. Aplicar Rotación Local
      const rotacionLocalRad = (el.rotation * Math.PI) / 180;
      ctx.translate(centroX, centroY);
      ctx.rotate(rotacionLocalRad);

      const localX = -w / 2;
      const localY = -h / 2;

      if (el.itemType === "stage_floor") {
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
        ctx.fillText(el.name, 0, 0);
      } else {
        // --- DISEÑO DE SILLAS CON ESTADOS DE SELECCIÓN ---
        const itsBusy = el.id && occupiedSeatsState.includes(el.id);
        const isSelected = selected.some((s) => s.itemID === el.itemID);

        let colorCushion = "#6e0372";
        let colorStructure = "#4a024d";

        // Asignación de colores por tipo (si está disponible)
        if (itsBusy) {
          colorCushion = "#f43f5e"; // Rose 500
          colorStructure = "#be123c"; // Rose 700
        } else if (isSelected) {
          colorCushion = "#10b981"; // Emerald 500
          colorStructure = "#047857"; // Emerald 700
        } else {
          // Paleta original basada en tipo de asiento
          if (el.itemType === "general_chair") { colorCushion = "#64748b"; colorStructure = "#334155"; }
          else if (el.itemType === "preferred_seating") { colorCushion = "#bf72f6"; colorStructure = "#9810fa"; }
          else if (el.itemType === "sponsor_chair") { colorCushion = "#eab308"; colorStructure = "#ca8a04"; }
        }

        const rEsq = Math.min(w, h) * 0.25;

        // Cojín Principal
        ctx.fillStyle = colorCushion;
        ctx.strokeStyle = colorStructure;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(localX + 3, localY + 3, w - 6, h - 8, rEsq);
        ctx.fill();
        ctx.stroke();

        // Espaldar
        ctx.fillStyle = colorStructure;
        ctx.beginPath();
        ctx.roundRect(localX + 2, localY + h - h * 0.22 - 2, w - 4, h * 0.22, rEsq / 2);
        ctx.fill();

        // Brazos Laterales (Izquierdo y Derecho)
        ctx.strokeStyle = colorStructure;
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(localX + 1.5, localY + 4); ctx.lineTo(localX + 1.5, localY + h - 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(localX + w - 1.5, localY + 4); ctx.lineTo(localX + w - 1.5, localY + h - 4); ctx.stroke();

        // Número de Silla Responsivo
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
  }, [selected, seatingMap, occupiedSeatsState]);

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
      <div className="overflow-auto bg-gray-50/50 border border-purple-50 max-h-[550px] flex justify-start lg:justify-center">
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
              {isMounted && selected.length > 0
                ? selected.map((s) => s.chairNumber).join(", ")
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