"use client";

import { useState, useRef, useEffect } from "react";
import HeroSection from "@/components/layout/HeroSection";
import {
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
  Save
} from "lucide-react";

// --- ICONOS ADICIONALES REQUERIDOS ---
const AlignCenterHorizontal = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12H2M12 2v20M8 5h8M8 19h8"/></svg>
);
const AlignCenterVertical = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V2M2 12h22M5 8v8M19 8v8"/></svg>
);

// --- INTERFACES ---
interface ObjetoEscenario {
  itemID: string;
  tipo: "tarima_pista" | "silla_vip" | "silla_general" | "silla_patrocinante" | "silla_preferencial";
  nombre: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  rotacion: number;
  numeroSilla?: string | number;
  grupoId?: string;
  rotacionGrupo?: number;
  precio?: number;
}

const obtenerLetraPrefijo = (index: number): string => {
  let prefijo = "";
  let temp = index;
  while (temp >= 0) {
    prefijo = String.fromCharCode((temp % 26) + 65) + prefijo;
    temp = Math.floor(temp / 26) - 1;
  }
  return prefijo;
};

export default function SeatingMapBuilderPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contenedorCanvasRef = useRef<HTMLDivElement | null>(null);

  const [anchoMetros, setAnchoMetros] = useState<number>(30);
  const [altoMetros, setAltoMetros] = useState<number>(20);
  const [mostrarGuias, setMostrarGuias] = useState<boolean>(true);

  const [canvasAnchoPx, setCanvasAnchoPx] = useState<number>(800);
  const canvasAltoPx = 500;
  const pxPorMetro = canvasAnchoPx / anchoMetros;

  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [modoSilla, setModoSilla] = useState<boolean>(true);
  const [camaraBloqueada, setCamaraBloqueada] = useState<boolean>(false);

  const [loteFilas, setLoteFilas] = useState<number>(3);
  const [loteColumnas, setLoteColumnas] = useState<number>(5);
  
  const [tipoSillaLote, setTipoSillaLote] = useState<"silla_vip" | "silla_general" | "silla_patrocinante" | "silla_preferencial">("silla_vip");
  const [precioUnitarioLote, setPrecioUnitarioLote] = useState<number>(0);

  const [objetos, setObjetos] = useState<ObjetoEscenario[]>([
    {
      itemID: "stage-1",
      tipo: "tarima_pista",
      nombre: "Pista Principal",
      x: 150,
      y: 35,
      ancho: 500,
      alto: 140,
      rotacion: 0,
    },
  ]);

  const [objetoSeleccionado, setObjetoSeleccionado] = useState<ObjetoEscenario | null>(null);
  const [objetoBajoHover, setObjetoBajoHover] = useState<ObjetoEscenario | null>(null);
  const [posicionMouseCanvas, setPosicionMouseCanvas] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [guardando, setGuardando] = useState<boolean>(false);

  // --- CONTROL EXCLUSIVO DE PRECIOS FIJADOS POR MAPA ---
  // Verifica si el tipo de silla seleccionado actualmente ya tiene presencia activa en el mapa
  const tipoYaEstablecidoEnMapa = objetos.some((o) => o.tipo === tipoSillaLote);

  // Sincroniza el precio mostrado en el panel si el usuario cambia el selector a un tipo existente
  useEffect(() => {
    const sillaExistente = objetos.find((o) => o.tipo === tipoSillaLote);
    if (sillaExistente && sillaExistente.precio !== undefined) {
      setPrecioUnitarioLote(sillaExistente.precio);
    }
  }, [tipoSillaLote, objetos]);

  const alinearHorizontal = () => {
    if (!objetoSeleccionado) return;
    const centroSalonX = (anchoMetros * pxPorMetro) / 2;
    const centroObjetoX = objetoSeleccionado.x + objetoSeleccionado.ancho / 2;
    const deltaX = centroSalonX - centroObjetoX;

    setObjetos((prev) =>
      prev.map((o) => {
        if (objetoSeleccionado.grupoId && o.grupoId === objetoSeleccionado.grupoId) {
          return { ...o, x: o.x + deltaX };
        } else if (o.itemID === objetoSeleccionado.itemID) {
          return { ...o, x: o.x + deltaX };
        }
        return o;
      })
    );
    setObjetoSeleccionado((prev) => prev ? { ...prev, x: prev.x + deltaX } : null);
  };

  const alinearVertical = () => {
    if (!objetoSeleccionado) return;
    const centroSalonY = (altoMetros * pxPorMetro) / 2;
    const centroObjetoY = objetoSeleccionado.y + objetoSeleccionado.alto / 2;
    const deltaY = centroSalonY - centroObjetoY;

    setObjetos((prev) =>
      prev.map((o) => {
        if (objetoSeleccionado.grupoId && o.grupoId === objetoSeleccionado.grupoId) {
          return { ...o, y: o.y + deltaY };
        } else if (o.itemID === objetoSeleccionado.itemID) {
          return { ...o, y: o.y + deltaY };
        }
        return o;
      })
    );
    setObjetoSeleccionado((prev) => prev ? { ...prev, y: prev.y + deltaY } : null);
  };

  const cambiarCoordenadaManual = (eje: "x" | "y", valorMetros: number) => {
    if (!objetoSeleccionado) return;
    const nuevaPosPx = valorMetros * pxPorMetro;
    const posActualPx = objetoSeleccionado[eje];
    const deltaPx = nuevaPosPx - posActualPx;

    setObjetos((prev) =>
      prev.map((o) => {
        if (objetoSeleccionado.grupoId && o.grupoId === objetoSeleccionado.grupoId) {
          return { ...o, [eje]: o[eje] + deltaPx };
        } else if (o.itemID === objetoSeleccionado.itemID) {
          return { ...o, [eje]: nuevaPosPx };
        }
        return o;
      })
    );
    setObjetoSeleccionado((prev) => (prev ? { ...prev, [eje]: prev[eje] + deltaPx } : null));
  };

  const handleGuardarPlano = async () => {
    setGuardando(true);
    const datosNormalizados = objetos.map((obj) => ({
      itemID: obj.itemID,
      tipo: obj.tipo,
      nombre: obj.nombre,
      numeroSilla: obj.numeroSilla,
      grupoId: obj.grupoId,
      rotacion: obj.rotacion,
      rotacionGrupo: obj.rotacionGrupo,
      precio: obj.precio || 0,
      xMetros: obj.x / pxPorMetro,
      yMetros: obj.y / pxPorMetro,
      anchoMetros: obj.ancho / pxPorMetro,
      altoMetros: obj.alto / pxPorMetro,
    }));
    console.log({ payload: { anchoTotalSalón: anchoMetros, altoTotalSalón: altoMetros, elementos: datosNormalizados } });
    setGuardando(false);
  };

  useEffect(() => {
    if (!contenedorCanvasRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const anchoContenedor = entry.contentRect.width;
        if (anchoContenedor > 0) setCanvasAnchoPx(anchoContenedor);
      }
    });
    observer.observe(contenedorCanvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => { setIsPanning(false); setIsDragging(false); };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const obtenerCentroDelLote = (elementosLote: ObjetoEscenario[]) => {
    if (elementosLote.length === 0) return { x: 0, y: 0 };
    const minX = Math.min(...elementosLote.map((o) => o.x));
    const maxX = Math.max(...elementosLote.map((o) => o.x + o.ancho));
    const minY = Math.min(...elementosLote.map((o) => o.y));
    const maxY = Math.max(...elementosLote.map((o) => o.alto + o.y));
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
  };

  const obtenerSiguienteIndiceGrupoSillas = (listaActual: ObjetoEscenario[]) => {
    const gruposExistentes = Array.from(
      new Set(listaActual.filter((o) => o.tipo.startsWith("silla_") && o.grupoId).map((o) => o.grupoId))
    );
    return gruposExistentes.length;
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
    for (let mX = 0; mX <= anchoMetros; mX++) {
      ctx.beginPath(); ctx.moveTo(mX * pxPorMetro, 0); ctx.lineTo(mX * pxPorMetro, altoMetros * pxPorMetro); ctx.stroke();
    }
    for (let mY = 0; mY <= altoMetros; mY++) {
      ctx.beginPath(); ctx.moveTo(0, mY * pxPorMetro); ctx.lineTo(anchoMetros * pxPorMetro, mY * pxPorMetro); ctx.stroke();
    }

    if (mostrarGuias && objetoSeleccionado) {
      ctx.save();
      ctx.strokeStyle = "rgba(236, 72, 153, 0.4)";
      ctx.lineWidth = 1.2 / scale;
      ctx.setLineDash([6 / scale, 4 / scale]);
      const cX = objetoSeleccionado.x + objetoSeleccionado.ancho / 2;
      const cY = objetoSeleccionado.y + objetoSeleccionado.alto / 2;
      ctx.beginPath(); ctx.moveTo(cX, 0); ctx.lineTo(cX, altoMetros * pxPorMetro); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cY); ctx.lineTo(anchoMetros * pxPorMetro, cY); ctx.stroke();
      ctx.fillStyle = "#ec4899";
      ctx.font = `${Math.max(10, 11 / scale)}px Questrial, sans-serif`;
      ctx.fillText(`X: ${(cX / pxPorMetro).toFixed(2)}m`, cX + 5 / scale, 15 / scale);
      ctx.fillText(`Y: ${(cY / pxPorMetro).toFixed(2)}m`, 5 / scale, cY - 5 / scale);
      ctx.restore();
    }

    ctx.strokeStyle = "#5e0472";
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(0, 0, anchoMetros * pxPorMetro, altoMetros * pxPorMetro);

    objetos.forEach((obj) => {
      const esElSeleccionado = objetoSeleccionado?.itemID === obj.itemID;
      const esMismoGrupo = objetoSeleccionado?.grupoId && obj.grupoId === objetoSeleccionado.grupoId;
      const tieneHover = objetoBajoHover?.itemID === obj.itemID;

      ctx.save();
      const centroX = obj.x + obj.ancho / 2;
      const centroY = obj.y + obj.alto / 2;

      let rotacionDelGrupoRad = 0;
      if (obj.grupoId && obj.rotacionGrupo) {
        const grupoSillas = objetos.filter((o) => o.grupoId === obj.grupoId);
        const gCentro = obtenerCentroDelLote(grupoSillas);
        rotacionDelGrupoRad = (obj.rotacionGrupo * Math.PI) / 180;
        ctx.translate(gCentro.x, gCentro.y);
        ctx.rotate(rotacionDelGrupoRad);
        ctx.translate(-gCentro.x, -gCentro.y);
      }

      const rotacionLocalRad = (obj.rotacion * Math.PI) / 180;
      ctx.translate(centroX, centroY);
      ctx.rotate(rotacionLocalRad);
      const localX = -obj.ancho / 2;
      const localY = -obj.alto / 2;

      if (esElSeleccionado) {
        ctx.strokeStyle = "#4f46e5"; ctx.lineWidth = 2.5 / scale; ctx.strokeRect(localX - 5, localY - 5, obj.ancho + 10, obj.alto + 10);
      } else if (tieneHover) {
        ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2 / scale; ctx.strokeRect(localX - 4, localY - 4, obj.ancho + 8, obj.alto + 8);
      } else if (esMismoGrupo) {
        ctx.strokeStyle = "rgba(79, 70, 229, 0.4)"; ctx.lineWidth = 1.5 / scale; ctx.strokeRect(localX - 3, localY - 3, obj.ancho + 6, obj.alto + 6);
      }

      if (obj.tipo === "tarima_pista") {
        ctx.fillStyle = "#334155"; ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 3 / scale;
        ctx.beginPath(); ctx.roundRect(localX, localY, obj.ancho, obj.alto, 8); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)"; ctx.lineWidth = 1 / scale;
        for (let step = localY + 15; step < localY + obj.alto; step += 15) { ctx.beginPath(); ctx.moveTo(localX, step); ctx.lineTo(localX + obj.ancho, step); ctx.stroke(); }
      } else {
        let colorCojin = "#6e0372"; let colorEstructura = "#4a024d";
        if (obj.tipo === "silla_general") { colorCojin = "#64748b"; colorEstructura = "#334155"; }
        else if (obj.tipo === "silla_preferencial") { colorCojin = "#bf72f6"; colorEstructura = "#9810fa"; }
        else if (obj.tipo === "silla_patrocinante") { colorCojin = "#eab308"; colorEstructura = "#ca8a04"; }

        const rEsq = Math.min(obj.ancho, obj.alto) * 0.25;
        ctx.fillStyle = colorCojin; ctx.strokeStyle = colorEstructura; ctx.lineWidth = 2 / scale;
        ctx.beginPath(); ctx.roundRect(localX + 3, localY + 3, obj.ancho - 6, obj.alto - 8, rEsq); ctx.fill(); ctx.stroke();
        ctx.fillStyle = colorEstructura; ctx.beginPath(); ctx.roundRect(localX + 2, localY + obj.alto - obj.alto * 0.22 - 2, obj.ancho - 4, obj.alto * 0.22, rEsq / 2); ctx.fill();
        ctx.strokeStyle = colorEstructura; ctx.lineWidth = 3.5 / scale; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(localX + 1.5, localY + 4); ctx.lineTo(localX + 1.5, localY + obj.alto - 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(localX + obj.ancho - 1.5, localY + 4); ctx.lineTo(localX + obj.ancho - 1.5, localY + obj.alto - 4); ctx.stroke();

        if (obj.numeroSilla) {
          ctx.save(); ctx.rotate(-(rotacionLocalRad + rotacionDelGrupoRad));
          ctx.fillStyle = "#ffffff"; 
          const largoTexto = obj.numeroSilla.toString().length;
          const factorEscala = largoTexto > 3 ? 0.35 : 0.45;
          ctx.font = `bold ${Math.max(10, obj.ancho * factorEscala)}px Questrial, sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.shadowColor = "rgba(0, 0, 0, 0.5)"; ctx.shadowBlur = 3;
          ctx.fillText(obj.numeroSilla.toString(), 0, -2); ctx.restore();
        }
      }
      if (obj.tipo === "tarima_pista") {
        ctx.fillStyle = "#ffffff"; ctx.font = `bold ${Math.max(12, 13 / scale)}px Questrial, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(obj.nombre, 0, 0);
      }
      ctx.restore();
    });

    if (objetoBajoHover) {
      ctx.restore(); ctx.save();
      const tX = posicionMouseCanvas.x + 15; const tY = posicionMouseCanvas.y + 15;
      const lineasInfo = [];
      if (objetoBajoHover.tipo === "tarima_pista") {
        lineasInfo.push(`Estructura: ${objetoBajoHover.nombre}`);
        lineasInfo.push(`Área: ${(objetoBajoHover.ancho / pxPorMetro).toFixed(1)}m x ${(objetoBajoHover.alto / pxPorMetro).toFixed(1)}m`);
      } else {
        const col: Record<string, string> = { silla_vip: "VIP", silla_general: "General", silla_preferencial: "Preferencial", silla_patrocinante: "Patrocinante" };
        lineasInfo.push(`Asiento: #${objetoBajoHover.numeroSilla}`);
        lineasInfo.push(`Tipo: ${col[objetoBajoHover.tipo]}`);
        lineasInfo.push(`Precio: $${(objetoBajoHover.precio || 0).toFixed(2)}`);
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
  }, [objetos, objetoSeleccionado, objetoBajoHover, posicionMouseCanvas, anchoMetros, altoMetros, pxPorMetro, scale, pan, canvasAnchoPx, mostrarGuias]);

  const obtenerCoordenadasMundo = (clientX: number, clientY: number) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: (clientX - rect.left - pan.x) / scale, y: (clientY - rect.top - pan.y) / scale };
  };

  const comprobarInterseccion = (mX: number, mY: number, obj: ObjetoEscenario) => {
    let tX = mX; let tY = mY;
    if (obj.grupoId && obj.rotacionGrupo) {
      const g = objetos.filter((o) => o.grupoId === obj.grupoId); const c = obtenerCentroDelLote(g);
      const radG = (-obj.rotacionGrupo * Math.PI) / 180;
      tX = c.x + (mX - c.x) * Math.cos(radG) - (mY - c.y) * Math.sin(radG);
      tY = c.y + (mX - c.x) * Math.sin(radG) + (mY - c.y) * Math.cos(radG);
    }
    const cX = obj.x + obj.ancho / 2; const cY = obj.y + obj.alto / 2; const radL = (-obj.rotacion * Math.PI) / 180;
    const fX = cX + (tX - cX) * Math.cos(radL) - (tY - cY) * Math.sin(radL);
    const fY = cY + (tX - cX) * Math.sin(radL) + (tY - cY) * Math.cos(radL);
    return (fX >= obj.x && fX <= obj.x + obj.ancho && fY >= obj.y && fY <= obj.y + obj.alto);
  };

  const agregarLoteSillasMapeadas = () => {
    const idG = `grupo-${Date.now()}`;
    const indiceGrupo = obtenerSiguienteIndiceGrupoSillas(objetos);
    const prefijoLetra = obtenerLetraPrefijo(indiceGrupo);

    const dim = 0.85 * pxPorMetro; const esp = 0.25 * pxPorMetro;
    const inX = (anchoMetros * pxPorMetro) / 2 - (loteColumnas * (dim + esp)) / 2;
    const inY = (altoMetros * pxPorMetro) / 2 - (loteFilas * (dim + esp)) / 2;
    const newS: ObjetoEscenario[] = [];
    let numAsiento = 1;

    for (let f = 0; f < loteFilas; f++) {
      for (let c = 0; c < loteColumnas; c++) {
        newS.push({
          itemID: `silla-${Date.now()}-${f}-${c}`,
          tipo: tipoSillaLote,
          nombre: `Asiento ${prefijoLetra}-${numAsiento}`,
          numeroSilla: `${prefijoLetra}-${numAsiento}`,
          grupoId: idG,
          x: inX + c * (dim + esp),
          y: inY + f * (dim + esp),
          ancho: dim,
          alto: dim,
          rotacion: 0,
          rotacionGrupo: 0,
          precio: precioUnitarioLote
        });
        numAsiento++;
      }
    }
    setObjetos([...objetos, ...newS]); setObjetoSeleccionado(newS[0]);
  };

  const mutarRotacionEstructural = (grados: number) => {
    setObjetos((prev) => prev.map((obj) => {
      if (objetoSeleccionado?.grupoId && obj.grupoId === objetoSeleccionado.grupoId) return { ...obj, rotacionGrupo: grados };
      else if (obj.itemID === objetoSeleccionado?.itemID) return { ...obj, rotacion: grados };
      return obj;
    }));
    setObjetoSeleccionado((p) => p ? (p.grupoId ? { ...p, rotacionGrupo: grados } : { ...p, rotacion: grados }) : null);
  };

  const ejecutarDuplicacionElemento = () => {
    if (!objetoSeleccionado) return;
    const off = 25;
    if (objetoSeleccionado.grupoId) {
      const idN = `grupo-clon-${Date.now()}`; const orig = objetos.filter((o) => o.grupoId === objetoSeleccionado.grupoId);
      const indiceGrupo = obtenerSiguienteIndiceGrupoSillas(objetos);
      const prefijoLetra = obtenerLetraPrefijo(indiceGrupo);
      let numAsiento = 1;

      const clons = orig.map((obj, i) => {
        const esSilla = obj.tipo.startsWith("silla_");
        const c: ObjetoEscenario = {
          ...obj,
          itemID: `clon-${Date.now()}-${i}`,
          x: obj.x + off,
          y: obj.y + off,
          grupoId: idN,
          nombre: esSilla ? `Asiento ${prefijoLetra}-${numAsiento}` : `${obj.nombre} (Copia)`,
          numeroSilla: esSilla ? `${prefijoLetra}-${numAsiento}` : undefined,
          precio: obj.precio
        };
        if (esSilla) numAsiento++; return c;
      });
      setObjetos([...objetos, ...clons]); setObjetoSeleccionado(clons[0]);
    } else {
      const clon: ObjetoEscenario = { ...objetoSeleccionado, itemID: `clon-${Date.now()}`, x: objetoSeleccionado.x + off, y: objetoSeleccionado.y + off, nombre: `${objetoSeleccionado.nombre} (Copia)`, grupoId: undefined };
      setObjetos([...objetos, clon]); setObjetoSeleccionado(clon);
    }
  };

  const ejecutarEliminacionElemento = () => {
    if (!objetoSeleccionado) return;
    let objetosRestantes = [];
    if (objetoSeleccionado.grupoId) {
      objetosRestantes = objetos.filter((o) => o.grupoId !== objetoSeleccionado.grupoId);
    } else {
      objetosRestantes = objetos.filter((o) => o.itemID !== objetoSeleccionado.itemID);
    }

    const gruposUnicos = Array.from(
      new Set(objetosRestantes.filter((o) => o.tipo.startsWith("silla_") && o.grupoId).map((o) => o.grupoId))
    );

    const objetosNormalizados = objetosRestantes.map((obj) => {
      if (obj.tipo.startsWith("silla_") && obj.grupoId) {
        const nuevoIndiceGrupo = gruposUnicos.indexOf(obj.grupoId);
        const nuevoPrefijo = obtenerLetraPrefijo(nuevoIndiceGrupo);
        const hermanosGrupo = objetosRestantes.filter(o => o.grupoId === obj.grupoId);
        const posicionEnGrupo = hermanosGrupo.findIndex(o => o.itemID === obj.itemID) + 1;

        return {
          ...obj,
          nombre: `Asiento ${nuevoPrefijo}-${posicionEnGrupo}`,
          numeroSilla: `${nuevoPrefijo}-${posicionEnGrupo}`
        };
      }
      return obj;
    });

    setObjetos(objetosNormalizados);
    setObjetoSeleccionado(null); setObjetoBajoHover(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!modoSilla) { setIsPanning(true); setLastMousePos({ x: e.clientX, y: e.clientY }); return; }
    const { x: mX, y: mY } = obtenerCoordenadasMundo(e.clientX, e.clientY);
    for (let i = objetos.length - 1; i >= 0; i--) {
      if (comprobarInterseccion(mX, mY, objetos[i])) {
        setObjetoSeleccionado(objetos[i]); setIsDragging(true); setDragOffset({ x: mX - objetos[i].x, y: mY - objetos[i].y }); return;
      }
    }
    setObjetoSeleccionado(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    setPosicionMouseCanvas({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (isPanning && !camaraBloqueada) {
      setPan((p) => ({ x: p.x + (e.clientX - lastMousePos.x), y: p.y + (e.clientY - lastMousePos.y) }));
      setLastMousePos({ x: e.clientX, y: e.clientY }); return;
    }
    const { x: mX, y: mY } = obtenerCoordenadasMundo(e.clientX, e.clientY);
    let hover = null;
    for (let i = objetos.length - 1; i >= 0; i--) { if (comprobarInterseccion(mX, mY, objetos[i])) { hover = objetos[i]; break; } }
    setObjetoBajoHover(hover);
    if (!isDragging || !objetoSeleccionado) return;
    const dX = mX - dragOffset.x - objetoSeleccionado.x; const dY = mY - dragOffset.y - objetoSeleccionado.y;
    setObjetos((prev) => prev.map((obj) => {
      if (objetoSeleccionado.grupoId && obj.grupoId === objetoSeleccionado.grupoId) return { ...obj, x: obj.x + dX, y: obj.y + dY };
      else if (obj.itemID === objetoSeleccionado.itemID) return { ...obj, x: mX - dragOffset.x, y: mY - dragOffset.y };
      return obj;
    }));
    setDragOffset({ x: mX - (objetoSeleccionado.x + dX), y: mY - (objetoSeleccionado.y + dY) });
    setObjetoSeleccionado((p) => p ? { ...p, x: p.x + dX, y: p.y + dY } : null);
  };

  const obtenerEstiloCursor = () => {
    if (!modoSilla) return isPanning ? "cursor-grabbing" : "cursor-grab";
    if (isDragging) return "cursor-grabbing";
    if (objetoBajoHover) return "cursor-pointer";
    return "cursor-default";
  };

  const anguloActualEfectivo = objetoSeleccionado ? (objetoSeleccionado.grupoId ? objetoSeleccionado.rotacionGrupo || 0 : objetoSeleccionado.rotacion) : 0;

  // --- MÉTODOS DE ANALÍTICAS ---
  const sillasActuales = objetos.filter(o => o.tipo.startsWith("silla_"));
  const totalSillasCount = sillasActuales.length;
  const ingresoTotalProyectado = sillasActuales.reduce((acc, s) => acc + (s.precio || 0), 0);

  const desglosePorTipo = sillasActuales.reduce((acc, s) => {
    acc[s.tipo] = (acc[s.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <HeroSection
        htmlTitle={`Plano de <em class="text-[#5e0472]">Asientos</em>`}
        htmlSubTitle="Manejo dinámico vectorial con herramientas de alineación y leyes métricas."
        actions={[{ label: guardando ? "Guardando..." : "Guardar Plano", onClick: handleGuardarPlano, icon: <Save className="w-4 h-4" />, variant: "primary", disabled: guardando }]}
      />

      <div className="p-4 md:p-8 mx-auto w-full overflow-y-auto space-y-6">
        {/* --- CONTROLES SUPERIORES --- */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => setModoSilla(true)} className={`px-4 py-2 text-xs font-questrial font-bold flex items-center gap-1.5 transition ${modoSilla ? "bg-[#5e0472] text-white" : "bg-purple-50 text-[#6e0372]"}`}><Armchair className="w-4 h-4" /> Editar Mobiliario</button>
            <button onClick={() => setModoSilla(false)} className={`px-4 py-2 text-xs font-questrial font-bold flex items-center gap-1.5 transition ${!modoSilla ? "bg-[#5e0472] text-white" : "bg-purple-50 text-[#6e0372]"}`}><Move className="w-4 h-4" /> Mover Escenario (Cámara)</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1">
              <button onClick={() => setScale((s) => Math.max(0.4, s - 0.1))} className="p-2 hover:bg-white rounded-lg transition text-gray-600"><ZoomOut className="w-4 h-4" /></button>
              <span className="px-3 text-xs font-questrial font-bold text-gray-600">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale((s) => Math.min(3, s + 0.1))} className="p-2 hover:bg-white rounded-lg transition text-gray-600"><ZoomIn className="w-4 h-4" /></button>
            </div>
            <button onClick={() => setCamaraBloqueada(!camaraBloqueada)} className={`p-2 border transition ${camaraBloqueada ? "bg-pink-50 border-pink-200 text-pink-600" : "bg-white border-gray-200 text-gray-600"}`}>{camaraBloqueada ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}</button>
          </div>
        </div>

        {/* --- REJILLA CENTRAL EDITOR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4 lg:col-span-1">
            
            {/* ENTORNO SALÓN */}
            <div className="glass-card p-4 bg-white space-y-3 border border-purple-100 shadow-sm">
              <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1"><Settings className="w-3.5 h-3.5" /> Entorno del Salón</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><label className="block text-gray-400 font-questrial font-medium mb-1">Ancho (m)</label><input type="number" min="5" max="200" value={anchoMetros} onChange={(e) => setAnchoMetros(Math.max(5, parseInt(e.target.value) || 5))} className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700" /></div>
                <div><label className="block text-gray-400 font-questrial font-medium mb-1">Alto (m)</label><input type="number" min="5" max="200" value={altoMetros} onChange={(e) => setAltoMetros(Math.max(5, parseInt(e.target.value) || 5))} className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700" /></div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setMostrarGuias(!mostrarGuias)} className={`w-full flex items-center justify-between p-2 rounded text-xs font-questrial transition ${mostrarGuias ? "bg-purple-50 border-purple-200 text-[#6e0372]" : "bg-gray-50 border-gray-200 text-gray-500"}`}><div className="flex items-center gap-2"><Grid className="w-3.5 h-3.5" /><span>Líneas Guía</span></div>{mostrarGuias ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
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
                  <input type="number" min="1" value={loteFilas} onChange={(e) => setLoteFilas(Math.max(1, parseInt(e.target.value) || 1))} className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700" />
                </div>
                <div>
                  <label className="block text-gray-400 font-questrial mb-1">Cols</label>
                  <input type="number" min="1" value={loteColumnas} onChange={(e) => setLoteColumnas(Math.max(1, parseInt(e.target.value) || 1))} className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700" />
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-gray-400 font-questrial mb-1">Clasificación de Asiento</label>
                  <select value={tipoSillaLote} onChange={(e) => setTipoSillaLote(e.target.value as any)} className="w-full p-2 border border-purple-100 font-questrial font-bold text-gray-700 bg-white">
                    <option value="silla_vip">VIP</option>
                    <option value="silla_general">General</option>
                    <option value="silla_preferencial">Preferencial</option>
                    <option value="silla_patrocinante">Patrocinantes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-questrial mb-1 flex items-center justify-between">
                    <span>Precio de Venta ($)</span>
                    {tipoYaEstablecidoEnMapa && (
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
                      value={precioUnitarioLote} 
                      disabled={tipoYaEstablecidoEnMapa}
                      onChange={(e) => setPrecioUnitarioLote(Math.max(0, parseFloat(e.target.value) || 0))} 
                      className={`w-full p-2 pr-7 border font-questrial font-bold text-right text-gray-700 ${
                        tipoYaEstablecidoEnMapa 
                          ? "bg-amber-50/60 border-amber-200 text-amber-800 cursor-not-allowed select-none" 
                          : "bg-slate-50 border-purple-100 focus:bg-white focus:outline-purple-300"
                      }`}
                      placeholder="0.00"
                    />
                    {tipoYaEstablecidoEnMapa && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-600">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button type="button" onClick={agregarLoteSillasMapeadas} className="w-full mt-1 bg-[#5e0472] cursor-pointer text-white p-2 text-xs font-questrial font-bold flex items-center justify-center gap-1 transition shadow-sm"><Plus className="w-3.5 h-3.5" /> Desplegar Lote</button>
            </div>

            {/* CONTROL VECTORIAL */}
            <div className="glass-card p-4 bg-white space-y-4 border border-purple-100 shadow-sm">
              <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-pink-500" /> Control Vectorial</h3>
              {objetoSeleccionado ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1.5"><label className="block text-gray-400 font-questrial">Giro {objetoSeleccionado.grupoId ? "del Lote" : "Individual"}</label><div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 border border-purple-100"><input type="number" min="-360" max="360" value={anguloActualEfectivo} onChange={(e) => mutarRotacionEstructural(parseInt(e.target.value) || 0)} className="w-12 bg-transparent font-questrial text-[#6e0372] text-right focus:outline-none" /><span className="text-[#6e0372] font-bold">°</span></div></div>
                    <input type="range" min="-360" max="360" value={anguloActualEfectivo} onChange={(e) => mutarRotacionEstructural(parseInt(e.target.value))} className="w-full h-1.5 accent-[#5e0472] bg-purple-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dashed border-purple-100">
                    <div>
                      <label className="block text-gray-400 font-questrial mb-0.5">Posición X (m)</label>
                      <input type="number" step="0.1" value={parseFloat((objetoSeleccionado.x / pxPorMetro).toFixed(2)) || 0} onChange={(e) => cambiarCoordenadaManual("x", parseFloat(e.target.value) || 0)} className="w-full p-2 border border-purple-100 font-questrial text-center bg-slate-50 text-gray-700 focus:bg-white focus:outline-purple-300" />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-questrial mb-0.5">Posición Y (m)</label>
                      <input type="number" step="0.1" value={parseFloat((objetoSeleccionado.y / pxPorMetro).toFixed(2)) || 0} onChange={(e) => cambiarCoordenadaManual("y", parseFloat(e.target.value) || 0)} className="w-full p-2 border border-purple-100 font-questrial text-center bg-slate-50 text-gray-700 focus:bg-white focus:outline-purple-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="block text-gray-400 font-questrial mb-0.5">Ancho (m)</label><input type="number" step="0.05" value={(objetoSeleccionado.ancho / pxPorMetro).toFixed(2)} onChange={(e) => { const v = Math.max(0.1, parseFloat(e.target.value) || 0.1) * pxPorMetro; setObjetos(prev => prev.map(o => (o.itemID === objetoSeleccionado.itemID ? { ...o, ancho: v } : o))); setObjetoSeleccionado(p => (p ? { ...p, ancho: v } : null)); }} className="w-full p-2 border border-purple-100 font-questrial text-center" /></div>
                    <div><label className="block text-gray-400 font-questrial mb-0.5">Alto (m)</label><input type="number" step="0.05" value={(objetoSeleccionado.alto / pxPorMetro).toFixed(2)} onChange={(e) => { const v = Math.max(0.1, parseFloat(e.target.value) || 0.1) * pxPorMetro; setObjetos(prev => prev.map(o => (o.itemID === objetoSeleccionado.itemID ? { ...o, alto: v } : o))); setObjetoSeleccionado(p => (p ? { ...p, alto: v } : null)); }} className="w-full p-2 border border-purple-100 font-questrial text-center" /></div>
                  </div>
                </div>
              ) : <p className="text-xs font-questrial text-gray-400 italic text-center py-2">Selecciona un elemento.</p>}
            </div>

            {/* ALINEACIÓN Y ACCIONES */}
            {objetoSeleccionado && (
              <div className="glass-card p-4 bg-white space-y-4 border border-purple-100 shadow-sm animate-fade-in">
                <div>
                  <h3 className="text-xs font-anton uppercase tracking-wider text-gray-700 mb-2">Alineación en Salón</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={alinearHorizontal} className="cursor-pointer flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 text-[11px] font-questrial font-bold transition border border-gray-200">
                      <AlignCenterHorizontal className="w-3.5 h-3.5" /> Horizontal
                    </button>
                    <button onClick={alinearVertical} className="cursor-pointer flex items-center justify-center gap-1.5 p-2 bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 text-[11px] font-questrial font-bold transition border border-gray-200">
                      <AlignCenterVertical className="w-3.5 h-3.5" /> Vertical
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-anton uppercase tracking-wider text-gray-700 mb-2">Edición Directa</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={ejecutarDuplicacionElemento} className="flex items-center justify-center gap-1.5 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-questrial font-bold transition border border-indigo-200 cursor-pointer"><Copy className="w-3.5 h-3.5" /> Duplicar</button>
                    <button onClick={ejecutarEliminacionElemento} className="flex items-center justify-center gap-1.5 p-2 bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-questrial font-bold transition border border-red-200 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Eliminar</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* VISUALIZADOR VISTA METRICA CANVAS Y LEYENDAS */}
          <div className="lg:col-span-3 space-y-4">
            <div ref={contenedorCanvasRef} className="w-full bg-slate-50 border border-purple-100 relative shadow-inner overflow-hidden" style={{ height: `${canvasAltoPx}px` }}>
              <canvas ref={canvasRef} width={canvasAnchoPx} height={canvasAltoPx} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseLeave={() => { setObjetoBajoHover(null); setIsPanning(false); setIsDragging(false); }} className={`block transition-colors ${obtenerEstiloCursor()}`} />
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
                    <span className="text-gray-600 font-medium">VIP: <strong className="text-gray-900">{desglosePorTipo["silla_vip"] || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#64748b]" />
                    <span className="text-gray-600 font-medium">General: <strong className="text-gray-900">{desglosePorTipo["silla_general"] || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#9810fa]" />
                    <span className="text-gray-600 font-medium">Preferencial: <strong className="text-gray-900">{desglosePorTipo["silla_preferencial"] || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#eab308]" />
                    <span className="text-gray-600 font-medium">Patrocinante: <strong className="text-gray-900">{desglosePorTipo["silla_patrocinante"] || 0}</strong></span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE VENTAS TOTALES ASOCIADA A LA LEYENDA */}
              <div className="lg:col-span-1 bg-purple-50 border border-purple-100 p-3 text-right">
                <span className="block text-[10px] font-questrial uppercase font-bold text-[#6e0372] tracking-wider">Venta Total Estimada</span>
                <span className="text-xl font-anton text-[#5e0472]">
                  ${ingresoTotalProyectado.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="block text-[10px] font-questrial text-gray-400 italic mt-0.5">Basado en {totalSillasCount} asientos diseñados</span>
              </div>
              
            </div>

          </div>
        </div>
      </div>
    </>
  );
}