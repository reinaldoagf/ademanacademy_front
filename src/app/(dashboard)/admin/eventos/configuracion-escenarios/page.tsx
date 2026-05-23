// src/app/(dashboard)/eventos/configuracion-escenarios/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import HeroSection from "@/components/layout/HeroSection";
import {
  Trash2,
  Grid,
  Save,
  Armchair,
  Move,
  RotateCw,
  Maximize2,
  Ungroup,
  Copy,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  Settings,
} from "lucide-react";

interface ObjetoEscenario {
  itemID: string;
  tipo: "tarima_pista" | "silla_morada" | "silla_gris" | "silla_roja";
  nombre: string;
  numeroSilla?: number;
  grupoId?: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  rotacion: number;
  rotacionGrupo?: number;
}

export default function ConfiguracionEscenariosPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contenedorCanvasRef = useRef<HTMLDivElement | null>(null);

  const [anchoMetros, setAnchoMetros] = useState<number>(30);
  const [altoMetros, setAltoMetros] = useState<number>(20);

  // Estado dinámico para el ancho del canvas, inicializado con el valor base
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
  const [tipoSillaLote, setTipoSillaLote] = useState<
    "silla_morada" | "silla_gris" | "silla_roja"
  >("silla_morada");

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

  const [objetoSeleccionado, setObjetoSeleccionado] =
    useState<ObjetoEscenario | null>(null);
  const [objetoBajoHover, setObjetoBajoHover] =
    useState<ObjetoEscenario | null>(null);
  const [posicionMouseCanvas, setPosicionMouseCanvas] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  const [guardando, setGuardando] = useState<boolean>(false);
  const handleGuardarPlano = async () => {
    setGuardando(true);
    /* try { */
    // Convertimos los datos dependientes de píxeles a metros puros para que sea 100% responsivo al recargar
    const datosNormalizados = objetos.map((obj) => ({
      itemID: obj.itemID,
      tipo: obj.tipo,
      nombre: obj.nombre,
      numeroSilla: obj.numeroSilla,
      grupoId: obj.grupoId,
      rotacion: obj.rotacion,
      rotacionGrupo: obj.rotacionGrupo,
      // Convertimos píxeles a metros reales
      xMetros: obj.x / pxPorMetro,
      yMetros: obj.y / pxPorMetro,
      anchoMetros: obj.ancho / pxPorMetro,
      altoMetros: obj.alto / pxPorMetro,
    }));

    const payload = {
      anchoTotalSalón: anchoMetros,
      altoTotalSalón: altoMetros,
      elementos: datosNormalizados,
    };

    console.log({ payload });

    // Reemplaza esta URL por tu endpoint real (ej. /api/escenarios o una Server Action)
    /*  const respuesta = await fetch("/api/eventos/configuracion-escenarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!respuesta.ok) throw new Error("Error en el servidor al guardar.");

    alert("¡Plano guardado exitosamente en la base de datos!"); */
    /* } catch (error) {
    console.error("Error guardando el plano:", error);
    alert("Hubo un fallo al intentar guardar el escenario.");
  } finally {
    setGuardando(false);
  } */
  };
  // Hook ResizeObserver para recalcular el ancho del elemento contenedor en tiempo real
  useEffect(() => {
    if (!contenedorCanvasRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // Obtenemos el ancho total del contenedor (descontando bordes)
        const anchoContenedor = entry.contentRect.width;
        if (anchoContenedor > 0) {
          setCanvasAnchoPx(anchoContenedor);
        }
      }
    });

    observer.observe(contenedorCanvasRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setIsDragging(false);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const obtenerCentroDelLote = (elementosLote: ObjetoEscenario[]) => {
    if (elementosLote.length === 0) return { x: 0, y: 0 };
    const minX = Math.min(...elementosLote.map((o) => o.x));
    const maxX = Math.max(...elementosLote.map((o) => o.x + o.ancho));
    const minY = Math.min(...elementosLote.map((o) => o.y));
    const maxY = Math.max(...elementosLote.map((o) => o.y + o.alto));
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
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

    // Grilla Base
    ctx.strokeStyle = "rgba(110, 3, 114, 0.05)";
    ctx.lineWidth = 1 / scale;
    for (let mX = 0; mX <= anchoMetros; mX++) {
      ctx.beginPath();
      ctx.moveTo(mX * pxPorMetro, 0);
      ctx.lineTo(mX * pxPorMetro, altoMetros * pxPorMetro);
      ctx.stroke();
    }
    for (let mY = 0; mY <= altoMetros; mY++) {
      ctx.beginPath();
      ctx.moveTo(0, mY * pxPorMetro);
      ctx.lineTo(anchoMetros * pxPorMetro, mY * pxPorMetro);
      ctx.stroke();
    }

    ctx.strokeStyle = "#5e0472";
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(0, 0, anchoMetros * pxPorMetro, altoMetros * pxPorMetro);

    objetos.forEach((obj) => {
      const esElSeleccionado = objetoSeleccionado?.itemID === obj.itemID;
      const esMismoGrupo =
        objetoSeleccionado?.grupoId &&
        obj.grupoId === objetoSeleccionado.grupoId;
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

      // Bordes de Estado (Selección, Grupo o Hover)
      if (esElSeleccionado) {
        ctx.strokeStyle = "#4f46e5";
        ctx.lineWidth = 2.5 / scale;
        ctx.strokeRect(localX - 5, localY - 5, obj.ancho + 10, obj.alto + 10);
      } else if (tieneHover) {
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2 / scale;
        ctx.strokeRect(localX - 4, localY - 4, obj.ancho + 8, obj.alto + 8);
      } else if (esMismoGrupo) {
        ctx.strokeStyle = "rgba(79, 70, 229, 0.4)";
        ctx.lineWidth = 1.5 / scale;
        ctx.strokeRect(localX - 3, localY - 3, obj.ancho + 6, obj.alto + 6);
      }

      // Renderizado Estructural Vectorial
      if (obj.tipo === "tarima_pista") {
        ctx.fillStyle = "#334155";
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 3 / scale;
        ctx.beginPath();
        ctx.roundRect(localX, localY, obj.ancho, obj.alto, 8);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1 / scale;
        for (let step = localY + 15; step < localY + obj.alto; step += 15) {
          ctx.beginPath();
          ctx.moveTo(localX, step);
          ctx.lineTo(localX + obj.ancho, step);
          ctx.stroke();
        }
      } else {
        let colorCojin = "#6e0372";
        let colorEstructura = "#4a024d";

        if (obj.tipo === "silla_gris") {
          colorCojin = "#64748b";
          colorEstructura = "#334155";
        } else if (obj.tipo === "silla_roja") {
          colorCojin = "#dc2626";
          colorEstructura = "#991b1b";
        }

        const rEsq = Math.min(obj.ancho, obj.alto) * 0.25;

        // Cojín
        ctx.fillStyle = colorCojin;
        ctx.strokeStyle = colorEstructura;
        ctx.lineWidth = 2 / scale;
        ctx.beginPath();
        ctx.roundRect(
          localX + 3,
          localY + 3,
          obj.ancho - 6,
          obj.alto - 8,
          rEsq,
        );
        ctx.fill();
        ctx.stroke();

        // Respaldo (Mirando hacia arriba)
        ctx.fillStyle = colorEstructura;
        ctx.beginPath();
        ctx.roundRect(
          localX + 2,
          localY + obj.alto - obj.alto * 0.22 - 2,
          obj.ancho - 4,
          obj.alto * 0.22,
          rEsq / 2,
        );
        ctx.fill();

        // Apoyabrazos
        ctx.strokeStyle = colorEstructura;
        ctx.lineWidth = 3.5 / scale;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(localX + 1.5, localY + 4);
        ctx.lineTo(localX + 1.5, localY + obj.alto - 4);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(localX + obj.ancho - 1.5, localY + 4);
        ctx.lineTo(localX + obj.ancho - 1.5, localY + obj.alto - 4);
        ctx.stroke();

        // Identificador Numérico
        if (obj.numeroSilla) {
          ctx.save();
          const rotacionTotalAcumulada = rotacionLocalRad + rotacionDelGrupoRad;
          ctx.rotate(-rotacionTotalAcumulada);

          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.max(12, obj.ancho * 0.48)}px Questrial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowBlur = 3;
          ctx.fillText(obj.numeroSilla.toString(), 0, -2);
          ctx.restore();
        }
      }

      if (obj.tipo === "tarima_pista") {
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.max(12, 13 / scale)}px Questrial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obj.nombre, 0, 0);
      }

      ctx.restore();
    });

    // CAPA DEL TOOLTIP SOBRE EL LIENZO
    if (objetoBajoHover) {
      ctx.restore();
      ctx.save();

      const tX = posicionMouseCanvas.x + 15;
      const tY = posicionMouseCanvas.y + 15;

      const lineasInfo = [];
      if (objetoBajoHover.tipo === "tarima_pista") {
        lineasInfo.push(`Estructura: ${objetoBajoHover.nombre}`);
        lineasInfo.push(
          `Área: ${(objetoBajoHover.ancho / pxPorMetro).toFixed(1)}m x ${(objetoBajoHover.alto / pxPorMetro).toFixed(1)}m`,
        );
      } else {
        const coloresLabel: Record<string, string> = {
          silla_morada: "VIP (Morada)",
          silla_gris: "General (Gris)",
          silla_roja: "Preferencia (Roja)",
        };
        lineasInfo.push(`Asiento: #${objetoBajoHover.numeroSilla}`);
        lineasInfo.push(`Tipo: ${coloresLabel[objetoBajoHover.tipo]}`);
        lineasInfo.push(
          `Posición: X:${(objetoBajoHover.x / pxPorMetro).toFixed(1)}m, Y:${(objetoBajoHover.y / pxPorMetro).toFixed(1)}m`,
        );
      }
      if (objetoBajoHover.grupoId) lineasInfo.push(`Bloque: En Lote Rígido`);

      ctx.font = "11px sans-serif";
      let anchoMax = 120;
      lineasInfo.forEach((l) => {
        const m = ctx.measureText(l).width;
        if (m > anchoMax) anchoMax = m;
      });
      anchoMax += 16;
      const altoTooltip = lineasInfo.length * 16 + 10;

      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.roundRect(tX, tY, anchoMax, altoTooltip, 8);
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      lineasInfo.forEach((linea, index) => {
        ctx.fillStyle = index === 0 ? "#f8fafc" : "#94a3b8";
        ctx.font = index === 0 ? "bold 11px sans-serif" : "11px sans-serif";
        ctx.fillText(linea, tX + 8, tY + 18 + index * 16);
      });
    }

    ctx.restore();
  }, [
    objetos,
    objetoSeleccionado,
    objetoBajoHover,
    posicionMouseCanvas,
    anchoMetros,
    altoMetros,
    pxPorMetro,
    scale,
    pan,
    canvasAnchoPx,
  ]);

  const obtenerCoordenadasMundo = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / scale,
      y: (clientY - rect.top - pan.y) / scale,
    };
  };

  const comprobarInterseccion = (
    mX: number,
    mY: number,
    obj: ObjetoEscenario,
  ) => {
    let testX = mX;
    let testY = mY;

    if (obj.grupoId && obj.rotacionGrupo) {
      const grupo = objetos.filter((o) => o.grupoId === obj.grupoId);
      const centroLote = obtenerCentroDelLote(grupo);
      const radG = (-obj.rotacionGrupo * Math.PI) / 180;
      const rx =
        centroLote.x +
        (mX - centroLote.x) * Math.cos(radG) -
        (mY - centroLote.y) * Math.sin(radG);
      const ry =
        centroLote.y +
        (mX - centroLote.x) * Math.sin(radG) +
        (mY - centroLote.y) * Math.cos(radG);
      testX = rx;
      testY = ry;
    }

    const centroX = obj.x + obj.ancho / 2;
    const centroY = obj.y + obj.alto / 2;
    const radL = (-obj.rotacion * Math.PI) / 180;

    const finalX =
      centroX +
      (testX - centroX) * Math.cos(radL) -
      (testY - centroY) * Math.sin(radL);
    const finalY =
      centroY +
      (testX - centroX) * Math.sin(radL) +
      (testY - centroY) * Math.cos(radL);

    return (
      finalX >= obj.x &&
      finalX <= obj.x + obj.ancho &&
      finalY >= obj.y &&
      finalY <= obj.y + obj.alto
    );
  };

  const obtenerSiguienteNumeroSilla = (listaActual: ObjetoEscenario[]) => {
    const sillas = listaActual.filter((o) => o.tipo.startsWith("silla_"));
    if (sillas.length === 0) return 1;
    return Math.max(...sillas.map((s) => s.numeroSilla || 0)) + 1;
  };

  const agregarLoteSillasMapeadas = () => {
    let numeroSillaActual = obtenerSiguienteNumeroSilla(objetos);
    const idGrupoUnico = `grupo-${Date.now()}`;

    const sillaDimPx = 0.85 * pxPorMetro;
    const espacioPx = 0.25 * pxPorMetro;

    const inicioX =
      (anchoMetros * pxPorMetro) / 2 -
      (loteColumnas * (sillaDimPx + espacioPx)) / 2;
    const inicioY =
      (altoMetros * pxPorMetro) / 2 -
      (loteFilas * (sillaDimPx + espacioPx)) / 2;

    const nuevasSillas: ObjetoEscenario[] = [];

    for (let f = 0; f < loteFilas; f++) {
      for (let c = 0; c < loteColumnas; c++) {
        nuevasSillas.push({
          itemID: `silla-lote-${Date.now()}-${f}-${c}`,
          tipo: tipoSillaLote,
          nombre: `Silla #${numeroSillaActual}`,
          numeroSilla: numeroSillaActual,
          grupoId: idGrupoUnico,
          x: inicioX + c * (sillaDimPx + espacioPx),
          y: inicioY + f * (sillaDimPx + espacioPx),
          ancho: sillaDimPx,
          alto: sillaDimPx,
          rotacion: 0,
          rotacionGrupo: 0,
        });
        numeroSillaActual++;
      }
    }

    setObjetos([...objetos, ...nuevasSillas]);
    setObjetoSeleccionado(nuevasSillas[0]);
  };

  const mutarRotacionEstructural = (gradosEntrada: number) => {
    setObjetos((prev) =>
      prev.map((obj) => {
        if (
          objetoSeleccionado?.grupoId &&
          obj.grupoId === objetoSeleccionado.grupoId
        ) {
          return { ...obj, rotacionGrupo: gradosEntrada };
        } else if (obj.itemID === objetoSeleccionado?.itemID) {
          return { ...obj, rotacion: gradosEntrada };
        }
        return obj;
      }),
    );
    setObjetoSeleccionado((prev) =>
      prev
        ? prev.grupoId
          ? { ...prev, rotacionGrupo: gradosEntrada }
          : { ...prev, rotacion: gradosEntrada }
        : null,
    );
  };

  const ejecutarDuplicacionElemento = () => {
    if (!objetoSeleccionado) return;
    const offsetPx = 25;
    let proximosObjetos: ObjetoEscenario[] = [];

    if (objetoSeleccionado.grupoId) {
      const idNuevoGrupo = `grupo-clon-${Date.now()}`;
      const elementosDelLoteOriginal = objetos.filter(
        (o) => o.grupoId === objetoSeleccionado.grupoId,
      );
      let siguienteIdSilla = obtenerSiguienteNumeroSilla(objetos);

      const clonacionesLote = elementosDelLoteOriginal.map((obj, index) => {
        const esElFoco = obj.itemID === objetoSeleccionado.itemID;
        const nuevoId = `clon-lote-${Date.now()}-${index}`;

        const clon: ObjetoEscenario = {
          ...obj,
          itemID: nuevoId,
          x: obj.x + offsetPx,
          y: obj.y + offsetPx,
          grupoId: idNuevoGrupo,
          nombre: obj.tipo.startsWith("silla_")
            ? `Silla #${siguienteIdSilla}`
            : `${obj.nombre} (Copia)`,
          numeroSilla: obj.tipo.startsWith("silla_")
            ? siguienteIdSilla
            : undefined,
        };
        if (obj.tipo.startsWith("silla_")) siguienteIdSilla++;
        return { clon, esElFoco };
      });

      proximosObjetos = [...objetos, ...clonacionesLote.map((c) => c.clon)];
      setObjetos(proximosObjetos);
      const focoNuevo =
        clonacionesLote.find((c) => c.esElFoco)?.clon ||
        clonacionesLote[0].clon;
      setObjetoSeleccionado(focoNuevo);
    } else {
      let siguienteIdSilla = obtenerSiguienteNumeroSilla(objetos);
      const nuevoIdUnico = `clon-solo-${Date.now()}`;

      const objetoClonado: ObjetoEscenario = {
        ...objetoSeleccionado,
        itemID: nuevoIdUnico,
        x: objetoSeleccionado.x + offsetPx,
        y: objetoSeleccionado.y + offsetPx,
        nombre: objetoSeleccionado.tipo.startsWith("silla_")
          ? `Silla #${siguienteIdSilla} (Libre)`
          : `${objetoSeleccionado.nombre} (Copia)`,
        numeroSilla: objetoSeleccionado.tipo.startsWith("silla_")
          ? siguienteIdSilla
          : undefined,
        grupoId: undefined,
      };
      proximosObjetos = [...objetos, objetoClonado];
      setObjetos(proximosObjetos);
      setObjetoSeleccionado(objetoClonado);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!modoSilla) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }
    const { x: mX, y: mY } = obtenerCoordenadasMundo(e.clientX, e.clientY);
    for (let i = objetos.length - 1; i >= 0; i--) {
      if (comprobarInterseccion(mX, mY, objetos[i])) {
        setObjetoSeleccionado(objetos[i]);
        setIsDragging(true);
        setDragOffset({ x: mX - objetos[i].x, y: mY - objetos[i].y });
        return;
      }
    }
    setObjetoSeleccionado(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const mouseCanvasX = e.clientX - rect.left;
    const mouseCanvasY = e.clientY - rect.top;
    setPosicionMouseCanvas({ x: mouseCanvasX, y: mouseCanvasY });

    if (isPanning && !camaraBloqueada) {
      setPan((prev) => ({
        x: prev.x + (e.clientX - lastMousePos.x),
        y: prev.y + (e.clientY - lastMousePos.y),
      }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
      return;
    }

    const { x: mX, y: mY } = obtenerCoordenadasMundo(e.clientX, e.clientY);

    let encontradoHover = null;
    for (let i = objetos.length - 1; i >= 0; i--) {
      if (comprobarInterseccion(mX, mY, objetos[i])) {
        encontradoHover = objetos[i];
        break;
      }
    }
    setObjetoBajoHover(encontradoHover);

    if (!isDragging || !objetoSeleccionado) return;

    const deltaX = mX - dragOffset.x - objetoSeleccionado.x;
    const deltaY = mY - dragOffset.y - objetoSeleccionado.y;

    setObjetos((prev) =>
      prev.map((obj) => {
        if (
          objetoSeleccionado.grupoId &&
          obj.grupoId === objetoSeleccionado.grupoId
        ) {
          return { ...obj, x: obj.x + deltaX, y: obj.y + deltaY };
        } else if (obj.itemID === objetoSeleccionado.itemID) {
          return { ...obj, x: mX - dragOffset.x, y: mY - dragOffset.y };
        }
        return obj;
      }),
    );

    setDragOffset({
      x: mX - (objetoSeleccionado.x + deltaX),
      y: mY - (objetoSeleccionado.y + deltaY),
    });
    setObjetoSeleccionado((prev) =>
      prev ? { ...prev, x: prev.x + deltaX, y: prev.y + deltaY } : null,
    );
  };

  const handleMouseLeave = () => {
    setObjetoBajoHover(null);
    setIsPanning(false);
    setIsDragging(false);
  };

  const obtenerEstiloCursor = () => {
    if (!modoSilla) return isPanning ? "cursor-grabbing" : "cursor-grab";
    if (isDragging) return "cursor-grabbing";
    if (objetoBajoHover) return "cursor-pointer";
    return "cursor-default";
  };

  const anguloActualEfectivo = objetoSeleccionado
    ? objetoSeleccionado.grupoId
      ? objetoSeleccionado.rotacionGrupo || 0
      : objetoSeleccionado.rotacion
    : 0;
    useEffect(() => {
    // Espera a que el navegador cargue por completo las fuentes web
    document.fonts.ready.then(() => {
        // Forzamos un pequeño re-render mutando sutilmente un estado si fuera necesario,
        // o simplemente obligando al canvas a redibujar si tus objetos ya están cargados.
        setObjetos(prev => [...prev]); 
    });
    }, []);
  return (
    <>
      <HeroSection
        htmlTitle={`Plano de <em class="text-[#5e0472]">Asientos</em>`}
        htmlSubTitle="Manejo dinámico vectorial con Tooltip reactivo al hover y números estables en plano superior."
        actions={[
          {
            label: guardando ? "Guardando..." : "Guardar Plano",
            onClick: handleGuardarPlano,
            icon: <Save className="w-4 h-4" />,
            variant: "primary",
            disabled: guardando, // Si tu HeroSection soporta deshabilitar botones
          },
        ]}
      />

      <div className="p-4 md:p-8 mx-auto w-full overflow-y-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-purple-100 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModoSilla(true)}
              className={`px-4 py-2 text-xs font-questrial font-bold flex items-center gap-1.5 transition ${modoSilla ? "bg-[#5e0472] text-white" : "bg-purple-50 text-[#6e0372]"}`}
            >
              <Armchair className="w-4 h-4" /> Editar Mobiliario
            </button>
            <button
              onClick={() => setModoSilla(false)}
              className={`px-4 py-2 text-xs font-questrial font-bold flex items-center gap-1.5 transition ${!modoSilla ? "bg-[#5e0472] text-white" : "bg-purple-50 text-[#6e0372]"}`}
            >
              <Move className="w-4 h-4" /> Mover Escenario (Cámara)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1">
              <button
                onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
                className="p-2 hover:bg-white rounded-lg transition text-gray-600"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-questrial font-bold text-gray-600">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(3, s + 0.1))}
                className="p-2 hover:bg-white rounded-lg transition text-gray-600"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setCamaraBloqueada(!camaraBloqueada)}
              className={`p-2 border transition ${camaraBloqueada ? "bg-pink-50 border-pink-200 text-pink-600" : "bg-white border-gray-200 text-gray-600"}`}
            >
              {camaraBloqueada ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4 lg:col-span-1">
            <div className="glass-card p-4 bg-white space-y-3 border border-purple-100 shadow-sm">
              <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" /> Entorno del Salón
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-gray-400 font-questrial font-medium mb-1">
                    Ancho Total (m)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={anchoMetros}
                    onChange={(e) =>
                      setAnchoMetros(Math.max(5, parseInt(e.target.value) || 5))
                    }
                    className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-questrial font-medium mb-1">
                    Alto Total (m)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={altoMetros}
                    onChange={(e) =>
                      setAltoMetros(Math.max(5, parseInt(e.target.value) || 5))
                    }
                    className="w-full p-2 border border-purple-100 text-center font-questrial font-bold text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-4 bg-white space-y-4 border border-purple-100 shadow-sm">
              <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-pink-500" /> Control
                Vectorial
              </h3>
              {objetoSeleccionado ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-gray-400 font-questrial">
                        Giro{" "}
                        {objetoSeleccionado.grupoId ? "del Lote" : "Individual"}
                      </label>
                      <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 border border-purple-100">
                        <input
                          type="number"
                          min="-360"
                          max="360"
                          value={anguloActualEfectivo}
                          onChange={(e) =>
                            mutarRotacionEstructural(
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-12 bg-transparent font-mono font-questrial text-[#6e0372] text-right focus:outline-none"
                        />
                        <span className="text-[#6e0372] font-bold text-[11px]">
                          °
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <RotateCw className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <input
                        type="range"
                        min="-360"
                        max="360"
                        value={anguloActualEfectivo}
                        onChange={(e) =>
                          mutarRotacionEstructural(parseInt(e.target.value))
                        }
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#5e0472] bg-purple-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-400 font-questrial mb-0.5">
                        Ancho (m)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={(objetoSeleccionado.ancho / pxPorMetro).toFixed(
                          2,
                        )}
                        onChange={(e) => {
                          const v =
                            Math.max(0.1, parseFloat(e.target.value) || 0.1) *
                            pxPorMetro;
                          setObjetos((prev) =>
                            prev.map((o) =>
                              o.itemID === objetoSeleccionado.itemID
                                ? { ...o, ancho: v }
                                : o,
                            ),
                          );
                          setObjetoSeleccionado((p) =>
                            p ? { ...p, ancho: v } : null,
                          );
                        }}
                        className="w-full p-2 border border-purple-100 font-questrial text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 font-questrial mb-0.5">
                        Alto (m)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={(objetoSeleccionado.alto / pxPorMetro).toFixed(
                          2,
                        )}
                        onChange={(e) => {
                          const v =
                            Math.max(0.1, parseFloat(e.target.value) || 0.1) *
                            pxPorMetro;
                          setObjetos((prev) =>
                            prev.map((o) =>
                              o.itemID === objetoSeleccionado.itemID
                                ? { ...o, alto: v }
                                : o,
                            ),
                          );
                          setObjetoSeleccionado((p) =>
                            p ? { ...p, alto: v } : null,
                          );
                        }}
                        className="w-full p-2 border border-purple-100 font-questrial text-center"
                      />
                    </div>
                  </div>

                  {objetoSeleccionado.grupoId && (
                    <button
                      onClick={() => {
                        setObjetos((prev) =>
                          prev.map((o) =>
                            o.itemID === objetoSeleccionado.itemID
                              ? {
                                  ...o,
                                  grupoId: undefined,
                                  rotacion: o.rotacionGrupo || 0,
                                  rotacionGrupo: undefined,
                                }
                              : o,
                          ),
                        );
                        setObjetoSeleccionado((prev) =>
                          prev ? { ...prev, grupoId: undefined } : null,
                        );
                      }}
                      className="w-full py-2 bg-purple-50 text-[#6e0372] font-questrial font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Ungroup className="w-3.5 h-3.5" /> Separar Silla del Lote
                    </button>
                  )}

                  <button
                    onClick={ejecutarDuplicacionElemento}
                    className="w-full p-2 bg-indigo-50 text-indigo-600 transition font-questrial font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />{" "}
                    {objetoSeleccionado.grupoId
                      ? "Duplicar Lote Completo"
                      : "Duplicar Selección"}
                  </button>

                  <button
                    onClick={() => {
                      if (objetoSeleccionado.grupoId) {
                        setObjetos((p) =>
                          p.filter(
                            (o) => o.grupoId !== objetoSeleccionado.grupoId,
                          ),
                        );
                      } else {
                        setObjetos((p) =>
                          p.filter((o) => o.itemID !== objetoSeleccionado.itemID),
                        );
                      }
                      setObjetoSeleccionado(null);
                    }}
                    className="w-full p-2 bg-pink-50 text-pink-600 font-questrial font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />{" "}
                    {objetoSeleccionado.grupoId ? "Eliminar Lote" : "Eliminar"}
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 text-center py-2">
                  Haz clic sobre un elemento del escenario para editarlo,
                  removerlo o clonarlo.
                </p>
              )}
            </div>

            <div className="glass-card p-4 bg-white space-y-3 border border-purple-100 shadow-sm">
              <h3 className="text-xs font-anton uppercase tracking-wider flex items-center gap-1">
                <Grid className="w-3.5 h-3.5" /> Configurar Lote
              </h3>

              <div className="space-y-2 text-xs">
                <label className="block text-gray-400 font-questrial">
                  Color de Silla del Bloque
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTipoSillaLote("silla_morada")}
                    className={`p-2 font-questrial font-bold border transition text-[11px] ${tipoSillaLote === "silla_morada" ? "bg-purple-600 text-white border-purple-700" : "bg-purple-50 text-purple-700 border-purple-200"}`}
                  >
                    Morada
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoSillaLote("silla_gris")}
                    className={`p-2 font-questrial font-bold border transition text-[11px] ${tipoSillaLote === "silla_gris" ? "bg-slate-600 text-white border-slate-700" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                  >
                    Gris
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoSillaLote("silla_roja")}
                    className={`p-2 font-questrial font-bold border transition text-[11px] ${tipoSillaLote === "silla_roja" ? "bg-red-600 text-white border-red-700" : "bg-red-50 text-red-700 border-red-200"}`}
                  >
                    Roja
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <label className="block font-questrial text-gray-400 font-medium mb-1">
                    Filas
                  </label>
                  <input
                    type="number"
                    value={loteFilas}
                    onChange={(e) =>
                      setLoteFilas(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full p-1.5 border border-purple-100 text-center font-questrial font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-questrial font-medium mb-1">
                    Columnas
                  </label>
                  <input
                    type="number"
                    value={loteColumnas}
                    onChange={(e) =>
                      setLoteColumnas(
                        Math.max(1, parseInt(e.target.value) || 1),
                      )
                    }
                    className="w-full p-1.5 border border-purple-100 text-center font-questrial font-bold"
                  />
                </div>
              </div>

              <button
                onClick={agregarLoteSillasMapeadas}
                className="w-full p-2 bg-purple-600 text-white hover:bg-purple-700 transition text-xs font-questrial font-bold shadow-sm"
              >
                Insertar Bloque Rígido
              </button>
            </div>
          </div>

          <div
            ref={contenedorCanvasRef}
            className="lg:col-span-3 space-y-3 w-full"
          >
            <div className="flex justify-center border overflow-hidden shadow-inner select-none w-full">
              <canvas
                ref={canvasRef}
                width={canvasAnchoPx}
                height={canvasAltoPx}
                className={`bg-slate-50 ${obtenerEstiloCursor()}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
