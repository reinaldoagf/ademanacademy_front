"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/layout/HeroSection";
import {
  Map,
  Armchair,
  Move,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  Settings,
  Grid,
  Eye,
  EyeOff,
  Plus,
  Maximize2,
  Copy,
  Trash2,
  Save,
  Layers,
  Users,
  ShieldAlert
} from "lucide-react";
import { toast } from "react-hot-toast";
import { SeatingMapElement, SeatingMap } from "@/types/seating-map";
import { saveSeatingMapAction } from "@/app/actions/seating-map";

// --- ICONOS ADICIONALES REQUERIDOS ---
const AlignCenterHorizontal = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12H2M12 2v20M8 5h8M8 19h8" /></svg>
);
const AlignCenterVertical = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V2M2 12h22M5 8v8M19 8v8" /></svg>
);

const getLetterPrefix = (index: number): string => {
  let prefix = "";
  let temp = index;
  while (temp >= 0) {
    prefix = String.fromCharCode((temp % 26) + 65) + prefix;
    temp = Math.floor(temp / 26) - 1;
  }
  return prefix;
};

export default function SeatingMapBuilderPage() {

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerCanvasRef = useRef<HTMLDivElement | null>(null);
  const [seatingMap, setSeatingMap] = useState<SeatingMap>({
    location: "",
    totalWidth: 30,
    totalHeight: 20,
    elements: []
  });
  // 1. Validamos que la localización no esté vacía (eliminando espacios en blanco)
  const isLocationValid = seatingMap.location && seatingMap.location?.trim().length > 0;
  const [showGuides, setShowGuides] = useState<boolean>(true);

  const [canvasWidthPx, setCanvasWidthPx] = useState<number>(800);
  const highResolutionCanvas = 500;
  const pxPerMeter = canvasWidthPx / seatingMap.totalWidth;

  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [chairMode, setChairMode] = useState<boolean>(true);
  const [cameraLocked, setCameraLocked] = useState<boolean>(false);

  const [lotRows, setLotRows] = useState<number>(3);
  const [lotColumns, setLotColumns] = useState<number>(5);

  const [chairTypeLot, setChairTypeLot] = useState<"silla_vip" | "silla_general" | "silla_patrocinante" | "silla_preferencial">("silla_vip");
  const [unitPricePerLot, setUnitPricePerLot] = useState<number>(0);

  const [objects, setObjects] = useState<SeatingMapElement[]>([
    {
      itemID: "stage-1",
      type: "tarima_pista",
      name: "Pista Principal",
      x: 150,
      y: 35,
      width: 500,
      height: 140,
      rotation: 0,
      xMeters: 0,
      yMeters: 0,
      widthMeters: 0,
      heightMeters: 0,
      groupRotation: 0,
    },
  ]);

  const [selectedObject, setSelectedObject] = useState<SeatingMapElement | null>(null);
  const [objectUnderHover, setObjectUnderHover] = useState<SeatingMapElement | null>(null);
  const [mousePositionCanvas, setMousePositionCanvas] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState<boolean>(false);

  // --- CONTROL EXCLUSIVO DE PRECIOS FIJADOS POR MAPA ---
  // Verifica si el type de chair seleccionado actualmente ya tiene presencia activa en el mapa
  const typeAlreadyEstablishedOnMap = objects.some((o) => o.type === chairTypeLot);

  // Sincroniza el price mostrado en el panel si el usuario cambia el selector a un type existente
  useEffect(() => {
    const existingChair = objects.find((o) => o.type === chairTypeLot);
    if (existingChair && existingChair.price !== undefined) {
      setUnitPricePerLot(existingChair.price);
    }
  }, [chairTypeLot, objects]);

  const alignHorizontal = () => {
    if (!selectedObject) return;
    const salonXCenter = (seatingMap.totalWidth * pxPerMeter) / 2;
    const objectXcenter = selectedObject.x + selectedObject.width / 2;
    const deltaX = salonXCenter - objectXcenter;

    setObjects((prev) =>
      prev.map((o) => {
        if (selectedObject.groupId && o.groupId === selectedObject.groupId) {
          return { ...o, x: o.x + deltaX };
        } else if (o.itemID === selectedObject.itemID) {
          return { ...o, x: o.x + deltaX };
        }
        return o;
      })
    );
    setSelectedObject((prev) => prev ? { ...prev, x: prev.x + deltaX } : null);
  };

  const alignVertical = () => {
    if (!selectedObject) return;
    const salonYCenter = (seatingMap.totalHeight * pxPerMeter) / 2;
    const objectYCenter = selectedObject.y + selectedObject.height / 2;
    const deltaY = salonYCenter - objectYCenter;

    setObjects((prev) =>
      prev.map((o) => {
        if (selectedObject.groupId && o.groupId === selectedObject.groupId) {
          return { ...o, y: o.y + deltaY };
        } else if (o.itemID === selectedObject.itemID) {
          return { ...o, y: o.y + deltaY };
        }
        return o;
      })
    );
    setSelectedObject((prev) => prev ? { ...prev, y: prev.y + deltaY } : null);
  };

  const changeCoordinatesManual = (eje: "x" | "y", valueMeters: number) => {
    if (!selectedObject) return;
    const newPosPx = valueMeters * pxPerMeter;
    const posActualPx = selectedObject[eje];
    const deltaPx = newPosPx - posActualPx;

    setObjects((prev) =>
      prev.map((o) => {
        if (selectedObject.groupId && o.groupId === selectedObject.groupId) {
          return { ...o, [eje]: o[eje] + deltaPx };
        } else if (o.itemID === selectedObject.itemID) {
          return { ...o, [eje]: newPosPx };
        }
        return o;
      })
    );
    setSelectedObject((prev) => (prev ? { ...prev, [eje]: prev[eje] + deltaPx } : null));
  };

  const handleSavePlan = async () => {
    setSaving(true);
    const normalizedData = objects.map((obj) => ({
      itemID: obj.itemID,
      type: obj.type,
      name: obj.name,
      limitPerRepresentative: obj.limitPerRepresentative,
      macroGroupId: obj.macroGroupId,
      chairNumber: obj.chairNumber,
      groupId: obj.groupId,
      rotation: obj.rotation,
      groupRotation: obj.groupRotation,
      price: obj.price || 0,
      x: obj.x,
      y: obj.y,
      width: 0,
      height: 0,
      xMeters: obj.x / pxPerMeter,
      yMeters: obj.y / pxPerMeter,
      widthMeters: obj.width / pxPerMeter,
      heightMeters: obj.height / pxPerMeter,
    }));


    setSeatingMap((prev) => ({ ...prev, elements: normalizedData }));

    startTransition(async () => {
      const res = await saveSeatingMapAction(seatingMap, null);
      setSaving(false);
      if (!res.success) {
        console.log(res.error || "Ocurrió un error.");
        return;
      }
      toast.success("Operación exitosa");
      router.push("/admin/seating-charts")
    });
  };

  useEffect(() => {
    if (!containerCanvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const containerWidth = entry.contentRect.width;
        if (containerWidth > 0) setCanvasWidthPx(containerWidth);
      }
    });
    observer.observe(containerCanvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => { setIsPanning(false); setIsDragging(false); };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const getLotCenter = (elementsLot: SeatingMapElement[]) => {
    if (elementsLot.length === 0) return { x: 0, y: 0 };
    const minX = Math.min(...elementsLot.map((o) => o.x));
    const maxX = Math.max(...elementsLot.map((o) => o.x + o.width));
    const minY = Math.min(...elementsLot.map((o) => o.y));
    const maxY = Math.max(...elementsLot.map((o) => o.height + o.y));
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
  };

  const getNextIndexGroupChairs = (listaActual: SeatingMapElement[]) => {
    const existingGroups = Array.from(
      new Set(listaActual.filter((o) => o.type.startsWith("silla_") && o.groupId).map((o) => o.groupId))
    );
    return existingGroups.length;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(scale, scale);

    ctx.strokeStyle = "rgba(110, 3, 114, 0.05)";
    ctx.lineWidth = 1 / scale;
    for (let mX = 0; mX <= seatingMap.totalWidth; mX++) {
      ctx.beginPath(); ctx.moveTo(mX * pxPerMeter, 0); ctx.lineTo(mX * pxPerMeter, seatingMap.totalHeight * pxPerMeter); ctx.stroke();
    }
    for (let mY = 0; mY <= seatingMap.totalHeight; mY++) {
      ctx.beginPath(); ctx.moveTo(0, mY * pxPerMeter); ctx.lineTo(seatingMap.totalWidth * pxPerMeter, mY * pxPerMeter); ctx.stroke();
    }

    if (showGuides && selectedObject) {
      ctx.save();
      ctx.strokeStyle = "rgba(236, 72, 153, 0.4)";
      ctx.lineWidth = 1.2 / scale;
      ctx.setLineDash([6 / scale, 4 / scale]);
      const cX = selectedObject.x + selectedObject.width / 2;
      const cY = selectedObject.y + selectedObject.height / 2;
      ctx.beginPath(); ctx.moveTo(cX, 0); ctx.lineTo(cX, seatingMap.totalHeight * pxPerMeter); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cY); ctx.lineTo(seatingMap.totalWidth * pxPerMeter, cY); ctx.stroke();
      ctx.fillStyle = "#ec4899";
      ctx.font = `${Math.max(10, 11 / scale)}px Questrial, sans-serif`;
      ctx.fillText(`X: ${(cX / pxPerMeter).toFixed(2)}m`, cX + 5 / scale, 15 / scale);
      ctx.fillText(`Y: ${(cY / pxPerMeter).toFixed(2)}m`, 5 / scale, cY - 5 / scale);
      ctx.restore();
    }

    ctx.strokeStyle = "#5e0472";
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(0, 0, seatingMap.totalWidth * pxPerMeter, seatingMap.totalHeight * pxPerMeter);

    objects.forEach((obj) => {
      const isTheSelected = selectedObject?.itemID === obj.itemID;
      const isSameGroup = selectedObject?.groupId && obj.groupId === selectedObject.groupId;
      const hasHover = objectUnderHover?.itemID === obj.itemID;

      ctx.save();
      const centroX = obj.x + obj.width / 2;
      const centroY = obj.y + obj.height / 2;

      let rotationOfTheRadGroup = 0;
      if (obj.groupId && obj.groupRotation) {
        const grupoSillas = objects.filter((o) => o.groupId === obj.groupId);
        const gCentro = getLotCenter(grupoSillas);
        rotationOfTheRadGroup = (obj.groupRotation * Math.PI) / 180;
        ctx.translate(gCentro.x, gCentro.y);
        ctx.rotate(rotationOfTheRadGroup);
        ctx.translate(-gCentro.x, -gCentro.y);
      }

      const localRadialRotation = (obj.rotation * Math.PI) / 180;
      ctx.translate(centroX, centroY);
      ctx.rotate(localRadialRotation);
      const localX = -obj.width / 2;
      const localY = -obj.height / 2;

      if (isTheSelected) {
        ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2.5 / scale; ctx.strokeRect(localX - 5, localY - 5, obj.width + 10, obj.height + 10);
      } else if (hasHover) {
        ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2 / scale; ctx.strokeRect(localX - 4, localY - 4, obj.width + 8, obj.height + 8);
      } else if (isSameGroup) {
        ctx.strokeStyle = "rgba(79, 70, 229, 0.4)"; ctx.lineWidth = 1.5 / scale; ctx.strokeRect(localX - 3, localY - 3, obj.width + 6, obj.height + 6);
      }

      if (obj.type === "tarima_pista") {
        ctx.fillStyle = "#334155"; ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 3 / scale;
        ctx.beginPath(); ctx.roundRect(localX, localY, obj.width, obj.height, 8); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)"; ctx.lineWidth = 1 / scale;
        for (let step = localY + 15; step < localY + obj.height; step += 15) { ctx.beginPath(); ctx.moveTo(localX, step); ctx.lineTo(localX + obj.width, step); ctx.stroke(); }
      } else {
        let colorCojin = "#6e0372"; let colorEstructura = "#4a024d";
        if (obj.type === "silla_general") { colorCojin = "#64748b"; colorEstructura = "#334155"; }
        else if (obj.type === "silla_preferencial") { colorCojin = "#bf72f6"; colorEstructura = "#9810fa"; }
        else if (obj.type === "silla_patrocinante") { colorCojin = "#eab308"; colorEstructura = "#ca8a04"; }

        const rEsq = Math.min(obj.width, obj.height) * 0.45;
        ctx.fillStyle = colorCojin; ctx.strokeStyle = colorEstructura; ctx.lineWidth = 2 / scale;
        ctx.beginPath(); ctx.roundRect(localX + 3, localY + 3, obj.width - 6, obj.height - 8, rEsq); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colorEstructura; ctx.beginPath(); ctx.roundRect(localX + 2, localY + obj.height - obj.height * 0.22 - 2, obj.width - 4, obj.height * 0.22, rEsq / 2); ctx.fill();
        ctx.strokeStyle = colorEstructura; ctx.lineWidth = 3.5 / scale; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(localX + 1.5, localY + 4); ctx.lineTo(localX + 1.5, localY + obj.height - 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(localX + obj.width - 1.5, localY + 4); ctx.lineTo(localX + obj.width - 1.5, localY + obj.height - 4); ctx.stroke();

        if (obj.chairNumber) {
          ctx.save(); ctx.rotate(-(localRadialRotation + rotationOfTheRadGroup));
          ctx.fillStyle = "#ffffff";
          const largoTexto = obj.chairNumber.toString().length;
          const factorEscala = largoTexto > 3 ? 0.35 : 0.45;
          ctx.font = `bold ${Math.max(10, obj.width * factorEscala)}px Questrial, sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; ctx.shadowBlur = 3;
          ctx.fillText(obj.chairNumber.toString(), 0, -2); ctx.restore();
        }
      }
      if (obj.type === "tarima_pista") {
        ctx.fillStyle = "#ffffff"; ctx.font = `bold ${Math.max(12, 13 / scale)}px Questrial, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(obj.name, 0, 0);
      }
      ctx.restore();
    });

    if (objectUnderHover) {
      ctx.restore(); ctx.save();
      const tX = mousePositionCanvas.x + 15; const tY = mousePositionCanvas.y + 15;
      const lineasInfo = [];
      if (objectUnderHover.type === "tarima_pista") {
        lineasInfo.push(`Estructura: ${objectUnderHover.name}`);
        lineasInfo.push(`Área: ${(objectUnderHover.width / pxPerMeter).toFixed(1)}m x ${(objectUnderHover.height / pxPerMeter).toFixed(1)}m`);
      } else {
        const col: Record<string, string> = { silla_vip: "VIP", silla_general: "General", silla_preferencial: "Preferencial", silla_patrocinante: "Patrocinante" };
        lineasInfo.push(`Asiento: #${objectUnderHover.chairNumber}`);
        lineasInfo.push(`Tipo: ${col[objectUnderHover.type]}`);
        lineasInfo.push(`Precio: $${(objectUnderHover.price || 0).toFixed(2)}`);
      }
      ctx.font = "11px sans-serif"; let anchoMax = 120;
      lineasInfo.forEach((l) => { const m = ctx.measureText(l).width; if (m > anchoMax) anchoMax = m; });
      ctx.fillStyle = "rgba(15, 23, 42, 0.95)"; ctx.beginPath(); ctx.roundRect(tX, tY, anchoMax + 16, lineasInfo.length * 16 + 10, 8); ctx.fill();
      lineasInfo.forEach((linea, index) => {
        ctx.fillStyle = index === 0 ? "#f8fafc" : "#94a3b8"; ctx.font = index === 0 ? "bold 11px sans-serif" : "11px sans-serif";
        ctx.fillText(linea, tX + 8, tY + 18 + index * 16);
      });
    }
    ctx.restore();
  }, [objects, selectedObject, objectUnderHover, mousePositionCanvas, seatingMap.totalWidth, seatingMap.totalHeight, pxPerMeter, scale, pan, canvasWidthPx, showGuides]);

  const getWorldCoordinates = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: (clientX - rect.left - pan.x) / scale, y: (clientY - rect.top - pan.y) / scale };
  };

  const checkIntersection = (mX: number, mY: number, obj: SeatingMapElement) => {
    let tX = mX; let tY = mY;
    if (obj.groupId && obj.groupRotation) {
      const g = objects.filter((o) => o.groupId === obj.groupId); const c = getLotCenter(g);
      const radG = (-obj.groupRotation * Math.PI) / 180;
      tX = c.x + (mX - c.x) * Math.cos(radG) - (mY - c.y) * Math.sin(radG);
      tY = c.y + (mX - c.x) * Math.sin(radG) + (mY - c.y) * Math.cos(radG);
    }
    const cX = obj.x + obj.width / 2; const cY = obj.y + obj.height / 2; const radL = (-obj.rotation * Math.PI) / 180;
    const fX = cX + (tX - cX) * Math.cos(radL) - (tY - cY) * Math.sin(radL);
    const fY = cY + (tX - cX) * Math.sin(radL) + (tY - cY) * Math.cos(radL);
    return (fX >= obj.x && fX <= obj.x + obj.width && fY >= obj.y && fY <= obj.y + obj.height);
  };

  const addMappedChairsBatch = () => {
    const idG = `grupo-${Date.now()}`;
    const indiceGrupo = getNextIndexGroupChairs(objects);
    const prefijoLetra = getLetterPrefix(indiceGrupo);

    const dim = 0.85 * pxPerMeter; const esp = 0.25 * pxPerMeter;
    const inX = (seatingMap.totalWidth * pxPerMeter) / 2 - (lotColumns * (dim + esp)) / 2;
    const inY = (seatingMap.totalHeight * pxPerMeter) / 2 - (lotRows * (dim + esp)) / 2;
    const newS: SeatingMapElement[] = [];
    let seatNumber = 1;

    for (let f = 0; f < lotRows; f++) {
      for (let c = 0; c < lotColumns; c++) {
        newS.push({
          itemID: `chair-${Date.now()}-${f}-${c}`,
          type: chairTypeLot,
          name: `Asiento ${prefijoLetra}-${seatNumber}`,
          chairNumber: `${prefijoLetra}-${seatNumber}`,
          groupId: idG,
          x: inX + c * (dim + esp),
          y: inY + f * (dim + esp),
          width: dim,
          height: dim,
          rotation: 0,
          groupRotation: 0,
          price: unitPricePerLot,
          xMeters: 0,
          yMeters: 0,
          widthMeters: 0,
          heightMeters: 0,
        });
        seatNumber++;
      }
    }
    setObjects([...objects, ...newS]); setSelectedObject(newS[0]);
  };

  const mutateStructuralRotation = (grados: number) => {
    setObjects((prev) => prev.map((obj) => {
      if (selectedObject?.groupId && obj.groupId === selectedObject.groupId) return { ...obj, groupRotation: grados };
      else if (obj.itemID === selectedObject?.itemID) return { ...obj, rotation: grados };
      return obj;
    }));
    setSelectedObject((p) => p ? (p.groupId ? { ...p, groupRotation: grados } : { ...p, rotation: grados }) : null);
  };

  const executeDuplicationElement = () => {
    if (!selectedObject) return;
    const off = 25;
    if (selectedObject.groupId) {
      const idN = `grupo-clon-${Date.now()}`; const orig = objects.filter((o) => o.groupId === selectedObject.groupId);
      const indiceGrupo = getNextIndexGroupChairs(objects);
      const prefijoLetra = getLetterPrefix(indiceGrupo);
      let seatNumber = 1;

      const clons = orig.map((obj, i) => {
        const esSilla = obj.type.startsWith("silla_");
        const c: SeatingMapElement = {
          ...obj,
          itemID: `clon-${Date.now()}-${i}`,
          x: obj.x + off,
          y: obj.y + off,
          groupId: idN,
          name: esSilla ? `Asiento ${prefijoLetra}-${seatNumber}` : `${obj.name} (Copia)`,
          chairNumber: esSilla ? `${prefijoLetra}-${seatNumber}` : undefined,
          price: obj.price
        };
        if (esSilla) seatNumber++; return c;
      });
      setObjects([...objects, ...clons]); setSelectedObject(clons[0]);
    } else {
      const clon: SeatingMapElement = { ...selectedObject, itemID: `clon-${Date.now()}`, x: selectedObject.x + off, y: selectedObject.y + off, name: `${selectedObject.name} (Copia)`, groupId: undefined };
      setObjects([...objects, clon]); setSelectedObject(clon);
    }
  };

  const executeElementDeletion = () => {
    if (!selectedObject) return;
    let remainingObjects = [];
    if (selectedObject.groupId) {
      remainingObjects = objects.filter((o) => o.groupId !== selectedObject.groupId);
    } else {
      remainingObjects = objects.filter((o) => o.itemID !== selectedObject.itemID);
    }

    const uniqueGroups = Array.from(
      new Set(remainingObjects.filter((o) => o.type.startsWith("silla_") && o.groupId).map((o) => o.groupId))
    );

    const standardizedObjects = remainingObjects.map((obj) => {
      if (obj.type.startsWith("silla_") && obj.groupId) {
        const newIndexGroup = uniqueGroups.indexOf(obj.groupId);
        const newPrefix = getLetterPrefix(newIndexGroup);
        const brothersGroup = remainingObjects.filter(o => o.groupId === obj.groupId);
        const posicionEnGrupo = brothersGroup.findIndex(o => o.itemID === obj.itemID) + 1;

        return {
          ...obj,
          name: `Asiento ${newPrefix}-${posicionEnGrupo}`,
          chairNumber: `${newPrefix}-${posicionEnGrupo}`
        };
      }
      return obj;
    });

    setObjects(standardizedObjects);
    setSelectedObject(null); setObjectUnderHover(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chairMode) { setIsPanning(true); setLastMousePos({ x: e.clientX, y: e.clientY }); return; }
    const { x: mX, y: mY } = getWorldCoordinates(e.clientX, e.clientY);
    for (let i = objects.length - 1; i >= 0; i--) {
      if (checkIntersection(mX, mY, objects[i])) {
        setSelectedObject(objects[i]); setIsDragging(true); setDragOffset({ x: mX - objects[i].x, y: mY - objects[i].y }); return;
      }
    }
    setSelectedObject(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    setMousePositionCanvas({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (isPanning && !cameraLocked) {
      setPan((p) => ({ x: p.x + (e.clientX - lastMousePos.x), y: p.y + (e.clientY - lastMousePos.y) }));
      setLastMousePos({ x: e.clientX, y: e.clientY }); return;
    }
    const { x: mX, y: mY } = getWorldCoordinates(e.clientX, e.clientY);
    let hover = null;
    for (let i = objects.length - 1; i >= 0; i--) { if (checkIntersection(mX, mY, objects[i])) { hover = objects[i]; break; } }
    setObjectUnderHover(hover);
    if (!isDragging || !selectedObject) return;
    const dX = mX - dragOffset.x - selectedObject.x; const dY = mY - dragOffset.y - selectedObject.y;
    setObjects((prev) => prev.map((obj) => {
      if (selectedObject.groupId && obj.groupId === selectedObject.groupId) return { ...obj, x: obj.x + dX, y: obj.y + dY };
      else if (obj.itemID === selectedObject.itemID) return { ...obj, x: mX - dragOffset.x, y: mY - dragOffset.y };
      return obj;
    }));
    setDragOffset({ x: mX - (selectedObject.x + dX), y: mY - (selectedObject.y + dY) });
    setSelectedObject((p) => p ? { ...p, x: p.x + dX, y: p.y + dY } : null);
  };

  const getCursorStyle = () => {
    if (!chairMode) return isPanning ? "cursor-grabbing" : "cursor-grab";
    if (isDragging) return "cursor-grabbing";
    if (objectUnderHover) return "cursor-pointer";
    return "cursor-default";
  };

  const currentEffectiveAngle = selectedObject ? (selectedObject.groupId ? selectedObject.groupRotation || 0 : selectedObject.rotation) : 0;

  // --- MÉTODOS DE ANALÍTICAS ---
  const currentChairs = objects.filter(o => o.type.startsWith("silla_"));
  const totalChairsCount = currentChairs.length;
  const totalProjectedIncome = currentChairs.reduce((acc, s) => acc + (s.price || 0), 0);

  // --- 💡 NUEVA LÓGICA: ESTADOS PARA AGRUPACIÓN POSTERIOR ---
  const [selectedLotsForMacro, setSelectedLotsForMacro] = useState<string[]>([]);
  const [limiteVentaMacroGrupo, setLimiteVentaMacroGrupo] = useState<number>(5);
  const [macroGruposConfig, setMacroGruposConfig] = useState<Record<string, { limitPerRepresentative: number; lotes: string[] }>>({});

  const breakdownByType = currentChairs.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // --- 💡 NUEVA LÓGICA: FUNCIONES DE PROCESAMIENTO ---
  const executeSubsequentLotGrouping = () => {
    if (selectedLotsForMacro.length < 2) return;

    const newMacroGroupId = `macro_lote_${Date.now()}`;
    const limiteAsignado = limiteVentaMacroGrupo;

    // Registrar macro grupo en la configuración local
    setMacroGruposConfig(prev => ({
      ...prev,
      [newMacroGroupId]: {
        limitPerRepresentative: limiteAsignado,
        lotes: [...selectedLotsForMacro]
      }
    }));

    // Inyectar transversalmente la metadata de venta a los lotes elegidos
    setObjects(previousObjects =>
      previousObjects.map(chair => {
        if (chair.groupId && selectedLotsForMacro.includes(chair.groupId)) {
          return {
            ...chair,
            macroGroupId: newMacroGroupId,
            limitPerRepresentative: limiteAsignado
          };
        }
        return chair;
      })
    );

    // Resetear formulario lateral de macro-grupos
    setSelectedLotsForMacro([]);
    alert(`¡Éxito! Lotes agrupados correctamente con un límite de ${limiteAsignado} sillas por representante.`);
  };
  // Extrae todos los loteIds únicos presentes en el lienzo actual
  const listaDeLotesDisponibles = Array.from(new Set(objects.map(o => o.groupId).filter(Boolean))) as string[];
  return (
    <>
      <HeroSection
        htmlTitle={`Plano de <em class="text-[#5e0472]">Asientos</em>`}
        htmlSubTitle="Manejo dinámico vectorial con herramientas de alineación y leyes métricas."
        actions={[{ label: saving ? "Guardando..." : "Guardar Plano", onClick: handleSavePlan, icon: <Save className="w-4 h-4" />, variant: "primary", isDisabled: !isLocationValid || saving }]}
      />

      <div className="p-4 md:p-8 mx-auto w-full overflow-y-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 shrink-0">
            <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1 text-gray-800">
              <Map className="w-3.5 h-3.5 text-purple-600" /> Dirección del Salón
              <span className="text-red-500 font-bold ml-0.5">*</span>
            </h3>
          </div>

          <div className="flex-1 w-full text-xs">
            <div className="relative">
              <input
                required
                type="text"
                value={seatingMap.location}
                onChange={(e) => setSeatingMap((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Ej. Av. Principal #123, Salón de Eventos Bella Vista"
                className={`w-full p-2.5 border font-questrial font-medium text-gray-700 transition-colors focus:outline-none rounded-sm ${seatingMap.location && !seatingMap.location.trim()
                  ? "border-red-200 focus:border-red-400 placeholder:text-red-300"
                  : "border-purple-100 focus:border-purple-400"
                  }`}
              />

              {/* Mensaje de validación discreto debajo o dentro */}
              {seatingMap.location && !seatingMap.location.trim() && (
                <span className="text-[10px] text-red-400 font-questrial block mt-1">
                  * La dirección es obligatoria para guardar el plano
                </span>
              )}
            </div>
          </div>
        </div>
        {/* --- CONTROLES SUPERIORES --- */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => setChairMode(true)} className={`px-4 py-2 text-xs font-questrial font-bold flex items-center gap-1.5 transition ${chairMode ? "bg-[#5e0472] text-white" : "bg-purple-50 text-[#6e0372]"}`}><Armchair className="w-4 h-4" /> Editar Mobiliario</button>
            <button onClick={() => setChairMode(false)} className={`px-4 py-2 text-xs font-questrial font-bold flex items-center gap-1.5 transition ${!chairMode ? "bg-[#5e0472] text-white" : "bg-purple-50 text-[#6e0372]"}`}><Move className="w-4 h-4" /> Mover Escenario (Cámara)</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1">
              <button onClick={() => setScale((s) => Math.max(0.4, s - 0.1))} className="p-2 hover:bg-white rounded-lg transition text-gray-600"><ZoomOut className="w-4 h-4" /></button>
              <span className="px-3 text-xs font-questrial font-bold text-gray-600">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale((s) => Math.min(3, s + 0.1))} className="p-2 hover:bg-white rounded-lg transition text-gray-600"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setCameraLocked(!cameraLocked)} className={`p-2 border transition ${cameraLocked ? "bg-pink-50 border-pink-200 text-pink-600" : "bg-white border-gray-200 text-gray-600"}`}>{cameraLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}</button>
          </div>
        </div>

        {/* --- REJILLA CENTRAL EDITOR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4 lg:col-span-1">

            {/* ENTORNO SALÓN */}
            <div className="glass-card p-4 bg-white space-y-3 border border-purple-100 shadow-sm">
              <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1"><Settings className="w-3.5 h-3.5" /> Entorno del Salón</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-gray-400 font-questrial font-medium mb-1">Ancho (m)</label>
                  <input type="number" min="5" max="200"
                    value={seatingMap.totalWidth}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setSeatingMap((prev) => ({
                        ...prev,
                        totalWidth: isNaN(val) ? 0 : val
                      }));
                    }}
                    onBlur={(e) => {
                      const val = Math.min(200, Math.max(5, seatingMap.totalWidth));
                      setSeatingMap((prev) => ({ ...prev, totalWidth: val }));
                    }}
                    className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-gray-400 font-questrial font-medium mb-1">Alto (m)</label>
                  <input type="number" min="5" max="200" value={seatingMap.totalHeight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setSeatingMap((prev) => ({
                        ...prev,
                        totalHeight: isNaN(val) ? 0 : val
                      }));
                    }}
                    onBlur={(e) => {
                      const val = Math.min(200, Math.max(5, seatingMap.totalHeight));
                      setSeatingMap((prev) => ({ ...prev, totalHeight: val }));
                    }}
                    className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700" />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowGuides(!showGuides)} className={`w-full flex items-center justify-between p-2 rounded text-xs font-questrial transition ${showGuides ? "bg-purple-50 border-purple-200 text-[#6e0372]" : "bg-gray-50 border-gray-200 text-gray-500"}`}><div className="flex items-center gap-2"><Grid className="w-3.5 h-3.5" /><span>Líneas Guía</span></div>{showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
              </div>
            </div>

            {/* CREAR BLOQUE SILLAS CON VALIDACIÓN EXCLUSIVA DE PRECIO FIJO */}
            <div className="glass-card p-4 bg-white space-y-3 border border-purple-100 shadow-sm">
              <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1">
                <Grid className="w-3.5 h-3.5 text-purple-600" /> Crear Bloque Sillas
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-gray-400 font-questrial mb-1">Filas</label>
                  <input type="number" min="1" value={lotRows} onChange={(e) => setLotRows(Math.max(1, parseInt(e.target.value) || 1))} className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-gray-400 font-questrial mb-1">Cols</label>
                  <input type="number" min="1" value={lotColumns} onChange={(e) => setLotColumns(Math.max(1, parseInt(e.target.value) || 1))} className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700" />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-gray-400 font-questrial mb-1">Clasificación de Asiento</label>
                  <select value={chairTypeLot} onChange={(e) => setChairTypeLot(e.target.value as any)} className="w-full p-2 border border-purple-100 font-questrial font-bold text-gray-700 bg-white">
                    <option value="silla_vip">VIP</option>
                    <option value="silla_general">General</option>
                    <option value="silla_preferencial">Preferencial</option>
                    <option value="silla_patrocinante">Patrocinantes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-questrial mb-1 flex items-center justify-between">
                    <span>Precio de Venta ($)</span>
                    {typeAlreadyEstablishedOnMap && (
                      <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Fijado por mapa
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={unitPricePerLot}
                      disabled={typeAlreadyEstablishedOnMap}
                      onChange={(e) => setUnitPricePerLot(Math.max(0, parseFloat(e.target.value) || 0))}
                      className={`w-full p-2 pr-7 border font-questrial font-bold text-right text-gray-700 ${typeAlreadyEstablishedOnMap
                        ? "bg-amber-50/60 border-amber-200 text-amber-800 cursor-not-allowed select-none"
                        : "bg-slate-50 border-purple-100 focus:bg-white focus:outline-purple-300"
                        }`}
                      placeholder="0.00"
                    />
                    {typeAlreadyEstablishedOnMap && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-600">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button type="button" onClick={addMappedChairsBatch} className="w-full mt-1 bg-[#5e0472] cursor-pointer text-white p-2 text-xs font-questrial font-bold flex items-center justify-center gap-1 transition shadow-sm"><Plus className="w-3.5 h-3.5" /> Desplegar Lote</button>
            </div>

            {/* CONTROL VECTORIAL */}
            <div className="glass-card p-4 bg-white space-y-4 border border-purple-100 shadow-sm">
              <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-pink-500" /> Control Vectorial</h3>
              {selectedObject ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1.5"><label className="block text-gray-400 font-questrial">Giro {selectedObject.groupId ? "del Lote" : "Individual"}</label><div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 border border-purple-100"><input type="number" min="-360" max="360" value={currentEffectiveAngle} onChange={(e) => mutateStructuralRotation(parseInt(e.target.value) || 0)} className="w-12 bg-transparent font-questrial text-[#6e0372] text-right focus:outline-none" /><span className="text-[#6e0372] font-bold">°</span></div></div>
                    <input type="range" min="-360" max="360" value={currentEffectiveAngle} onChange={(e) => mutateStructuralRotation(parseInt(e.target.value))} className="w-full h-1.5 accent-[#5e0472] bg-purple-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed border-purple-100">
                    <div>
                      <label className="block text-gray-400 font-questrial mb-0.5">Posición X (m)</label>
                      <input type="number" step="0.1" value={parseFloat((selectedObject.x / pxPerMeter).toFixed(2)) || 0} onChange={(e) => changeCoordinatesManual("x", parseFloat(e.target.value) || 0)} className="w-full p-2 border border-purple-100 font-questrial text-center bg-slate-50 text-gray-700 focus:bg-white focus:outline-purple-300" />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-questrial mb-0.5">Posición Y (m)</label>
                      <input type="number" step="0.1" value={parseFloat((selectedObject.y / pxPerMeter).toFixed(2)) || 0} onChange={(e) => changeCoordinatesManual("y", parseFloat(e.target.value) || 0)} className="w-full p-2 border border-purple-100 font-questrial text-center bg-slate-50 text-gray-700 focus:bg-white focus:outline-purple-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-gray-400 font-questrial mb-0.5">Ancho (m)</label><input type="number" step="0.05" value={(selectedObject.width / pxPerMeter).toFixed(2)} onChange={(e) => { const v = Math.max(0.1, parseFloat(e.target.value) || 0.1) * pxPerMeter; setObjects(prev => prev.map(o => (o.itemID === selectedObject.itemID ? { ...o, width: v } : o))); setSelectedObject(p => (p ? { ...p, width: v } : null)); }} className="w-full p-2 border border-purple-100 font-questrial text-center" /></div>
                    <div><label className="block text-gray-400 font-questrial mb-0.5">Alto (m)</label><input type="number" step="0.05" value={(selectedObject.height / pxPerMeter).toFixed(2)} onChange={(e) => { const v = Math.max(0.1, parseFloat(e.target.value) || 0.1) * pxPerMeter; setObjects(prev => prev.map(o => (o.itemID === selectedObject.itemID ? { ...o, height: v } : o))); setSelectedObject(p => (p ? { ...p, height: v } : null)); }} className="w-full p-2 border border-purple-100 font-questrial text-center" /></div>
                  </div>
                </div>
              ) : <p className="text-xs font-questrial text-gray-400 italic text-center py-2">Selecciona un elemento.</p>}
            </div>

            {/* --- 💡 NUEVO MÓDULO: AGRUPACIÓN POSTERIOR MULTILOTE (CASO 1) --- */}
            {!selectedObject && (
              <div className="glass-card p-4 bg-white space-y-3 border border-purple-100 shadow-sm animate-fade-in">
                <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1.5 text-purple-950">
                  <Layers className="w-3.5 h-3.5 text-purple-700" /> Agrupación de Lotes Posterior
                </h3>
                <p className="text-[11px] text-gray-400 font-questrial leading-tight">
                  Selecciona lotes independientes ya posicionados para fusionar sus reglas de negocio de venta máxima.
                </p>

                {listaDeLotesDisponibles.length > 0 ? (
                  <div className="space-y-3 text-xs pt-1">
                    <div className="space-y-1 max-h-36 overflow-y-auto border border-purple-50 p-2 bg-slate-50/50">
                      {listaDeLotesDisponibles.map((groupId) => {
                        const count = objects.filter(o => o.groupId === groupId).length;
                        const tSilla = objects.find(o => o.groupId === groupId)?.type || "silla_general";
                        const estaChequeado = selectedLotsForMacro.includes(groupId);

                        return (
                          <label key={groupId} className="flex items-center gap-2 p-1.5 hover:bg-purple-50/60 cursor-pointer transition text-gray-700 font-questrial border-b border-gray-100/70 last:border-0">
                            <input
                              type="checkbox"
                              checked={estaChequeado}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLotsForMacro(prev => [...prev, groupId]);
                                } else {
                                  setSelectedLotsForMacro(prev => prev.filter(id => id !== groupId));
                                }
                              }}
                              className="accent-[#5e0472]"
                            />
                            <div className="flex justify-between w-full text-[11px]">
                              <span className="font-mono font-bold truncate max-w-[110px]">{groupId}</span>
                              <span className="text-[10px] bg-slate-200/70 px-1 text-gray-600 font-sans font-medium uppercase">{tSilla.split("_")[1]} ({count})</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Controles Dinámicos de Fusión */}
                    <div className="space-y-2.5 pt-2 border-t border-dashed border-purple-100">
                      <div className="space-y-1">
                        <label className="block text-gray-600 font-questrial font-bold text-[10px] uppercase">
                          Límite de Venta por Representante:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={limiteVentaMacroGrupo}
                            onChange={(e) => setLimiteVentaMacroGrupo(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 p-1.5 border border-purple-200 text-center font-questrial font-bold text-[#5e0472] bg-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-400"
                          />
                          <span className="text-[11px] text-gray-500 font-questrial">asientos como máximo</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={selectedLotsForMacro.length < 2}
                        onClick={executeSubsequentLotGrouping}
                        className={`w-full text-xs font-questrial font-bold p-2 flex items-center justify-center gap-1.5 transition ${selectedLotsForMacro.length >= 2
                          ? "bg-[#5e0472] text-white cursor-pointer shadow-sm"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        <Users className="w-3.5 h-3.5" /> Unificar Lotes Seleccionados
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] font-questrial text-gray-400 italic text-center py-2 bg-slate-50 border border-dashed border-gray-200">
                    Inserta al menos 2 bloques de sillas para habilitar la macro-agrupación posterior.
                  </p>
                )}
              </div>
            )}

            {/* ALINEACIÓN Y ACCIONES */}
            {selectedObject && (
              <div className="glass-card p-4 bg-white space-y-4 border border-purple-100 shadow-sm animate-fade-in">
                <div>
                  <h3 className="text-xs font-anton uppercase tracking-wider text-gray-700 mb-2">Alineación en Salón</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={alignHorizontal} className="cursor-pointer flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 text-[11px] font-questrial font-bold transition border border-gray-200">
                      <AlignCenterHorizontal className="w-3.5 h-3.5" /> Horizontal
                    </button>
                    <button onClick={alignVertical} className="cursor-pointer flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 text-[11px] font-questrial font-bold transition border border-gray-200">
                      <AlignCenterVertical className="w-3.5 h-3.5" /> Vertical
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-anton uppercase tracking-wider text-gray-700 mb-2">Edición Directa</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={executeDuplicationElement} className="flex items-center justify-center gap-1.5 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-questrial font-bold transition border border-indigo-200 cursor-pointer"><Copy className="w-3.5 h-3.5" /> Duplicar</button>
                    <button onClick={executeElementDeletion} className="flex items-center justify-center gap-1.5 p-2 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-questrial font-bold transition border border-red-200 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* VISUALIZADOR VISTA METRICA CANVAS Y LEYENDAS */}
          <div className="lg:col-span-3 space-y-4">
            <div ref={containerCanvasRef} className="w-full bg-slate-50 border border-purple-100 relative shadow-inner overflow-hidden" style={{ height: `${highResolutionCanvas}px` }}>
              <canvas ref={canvasRef} width={canvasWidthPx} height={highResolutionCanvas} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseLeave={() => { setObjectUnderHover(null); setIsPanning(false); setIsDragging(false); }} className={`block transition-colors ${getCursorStyle()}`} />
              {/* 💡 TOOLTIP FLOTANTE EN HOVER: INFORMACIÓN DE AGRUPACIÓN Y CONDICIONES DE VENTA */}
              {objectUnderHover && (
                <div
                  className="absolute z-50 bg-slate-900/95 text-white p-3 rounded shadow-xl border border-purple-500/30 text-[11px] font-questrial pointer-events-none w-52 space-y-1.5 animate-fade-in backdrop-blur-sm"
                  style={{
                    left: `${mousePositionCanvas.x + 15}px`,
                    top: `${mousePositionCanvas.y + 15}px`
                  }}
                >
                  {/* Encabezado e ID */}
                  <div className="flex justify-between items-center border-b border-slate-700 pb-1">
                    <span className="font-anton uppercase tracking-wider text-purple-400">
                      {objectUnderHover.type.replace("silla_", "").toUpperCase()}
                    </span>
                    <span className="font-mono text-[9px] text-gray-400">
                      {objectUnderHover.itemID.split("_")[1] || "ID"}
                    </span>
                  </div>

                  {/* Identificadores de Lote */}
                  <div className="space-y-0.5">
                    {objectUnderHover.groupId && (
                      <div className="text-gray-300">
                        Lote Origen: <span className="font-mono font-bold text-gray-100">{objectUnderHover.groupId}</span>
                      </div>
                    )}

                    {objectUnderHover.macroGroupId ? (
                      <div className="text-purple-300 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block"></span>
                        Agrupación: <span className="font-mono font-bold text-white">{objectUnderHover.macroGroupId.substring(0, 15)}...</span>
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">Sin macro-agrupación</div>
                    )}
                  </div>

                  {/* Condiciones de Venta */}
                  <div className="pt-1 border-t border-slate-800 space-y-1">
                    {objectUnderHover.type === "silla_patrocinante" ? (
                      <div className="text-amber-400 font-bold flex items-center gap-1 bg-amber-950/40 p-1 rounded border border-amber-900/50 text-[10px]">
                        <ShieldAlert className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        RESTRICCIÓN: Solo Organizador
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-slate-800/60 p-1 rounded">
                        <span className="text-gray-400">Máx por persona:</span>
                        <span className="font-bold text-emerald-400">
                          {objectUnderHover.limitPerRepresentative || 5} uds.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* --- SECCIÓN INTEGRADA: LEYENDA ANTERIOR + SECCIÓN DE VENTAS --- */}
            <div className="bg-white border border-purple-100 p-5 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">

              {/* LEYENDA ANTERIOR CONTEO DE INVENTARIO */}
              <div className="lg:col-span-3">
                <h4 className="text-xs font-anton uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-1.5">
                  <span>Distribución de Aforo e Inventario</span>
                </h4>
                <div className="flex flex-wrap gap-4 text-xs font-questrial">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#6e0372]" />
                    <span className="text-gray-600 font-medium">VIP: <strong className="text-gray-900">{breakdownByType["silla_vip"] || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#64748b]" />
                    <span className="text-gray-600 font-medium">General: <strong className="text-gray-900">{breakdownByType["silla_general"] || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#9810fa]" />
                    <span className="text-gray-600 font-medium">Preferencial: <strong className="text-gray-900">{breakdownByType["silla_preferencial"] || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                    <span className="text-gray-600 font-medium">Patrocinante: <strong className="text-gray-900">{breakdownByType["silla_patrocinante"] || 0}</strong></span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE VENTAS TOTALES ASOCIADA A LA LEYENDA */}
              <div className="lg:col-span-1 bg-purple-50 border border-purple-100 p-3 text-right">
                <span className="block text-[10px] font-questrial uppercase font-bold text-[#6e0372] tracking-wider">Venta Total Estimada</span>
                <span className="text-xl font-anton text-[#5e0472]">
                  ${totalProjectedIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="block text-[10px] font-questrial text-gray-400 italic mt-0.5">Basado en {totalChairsCount} asientos diseñados</span>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}