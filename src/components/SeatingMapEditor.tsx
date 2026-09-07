"use client";

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useTransition,
    forwardRef,
    useImperativeHandle
} from "react";
import {
    Mouse,
    Move,
    Plus,
    Trash2,
    Copy,
    ZoomIn,
    ZoomOut,
    Grid,
    Tag,
    Info,
    RotateCw,
    Maximize2,
    Minimize2,
    Users,
    Layers,
    Locate,
    AlignCenterHorizontal,
    AlignCenterVertical
} from "lucide-react";
import { saveSeatingMapAction } from "@/app/actions/seating-map";
import { SeatingMap, SeatingMapElement, EditorProps, SeatingMapEditorRef } from "@/types/seating-map";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
// Tipos de Modo de Arrastre/Mover
type DragMode = "single" | "group" | "macroGroup";
type ToolMode = "select" | "pan";

const CHAIR_TYPES = [
    { id: "general_chair", name: "Silla General", color: "#64748b", border: "#334155" },
    { id: "vip_chair", name: "Silla VIP", color: "#6e0372", border: "#4a024d" },
    { id: "preferred_seating", name: "Silla Preferencial", color: "#bf72f6", border: "#9810fa" },
    { id: "sponsor_chair", name: "Silla Patrocinador", color: "#eab308", border: "#ca8a04" },
];
// 1. Definimos la interfaz con la función que se expondrá al padre

const SeatingMapEditor = forwardRef<SeatingMapEditorRef, EditorProps>(({
    seatingMap,
    elementId,
    onLocationChange,
    onSavingStatusChange
}, ref) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // 1. Manejo seguro si `seatingMap` llega como undefined
    const [safeMap, setSafeMap] = useState<SeatingMap>(seatingMap || {
        location: "",
        totalWidth: 30,
        totalHeight: 20,
        elements: [],
    });

    const [objects, setObjects] = useState<SeatingMapElement[]>(seatingMap?.elements || [
        {
            itemID: "stage-1",
            type: "platform",
            itemType: "stage_floor",
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
    const [selectedObjectID, setSelectedObjectID] = useState<string | null>(null);
    const [activeTool, setActiveTool] = useState<ToolMode>("select");

    // Modo de Arrastre: "single" | "group" | "macroGroup"
    const [dragMode, setDragMode] = useState<DragMode>("single");

    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 50, y: 50 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Estados para ARRASTRE (Drag) de elementos
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    // Guarda las posiciones iniciales del lote/grupo al iniciar el arrastre
    const [initialDragPositions, setInitialDragPositions] = useState<
        Record<string, { x: number; y: number }>
    >({});

    // Estados para ROTACIÓN interactiva
    const [isRotating, setIsRotating] = useState(false);
    const [rotationStartAngle, setRotationStartAngle] = useState(0);
    const [initialRotation, setInitialRotation] = useState(0);

    // Configuración de creación por Lote / Grupo
    const [lotRows, setLotRows] = useState(10);
    const [lotColumns, setLotColumns] = useState(20);
    const [unitPricePerLot, setUnitPricePerLot] = useState(100);
    const [chairTypeLot, setChairTypeLot] = useState("general_chair");
    const [groupNameLot, setGroupNameLot] = useState("Zona A");
    const [macroGroupNameLot, setMacroGroupNameLot] = useState("");

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chairSpritesRef = useRef<Record<string, HTMLCanvasElement>>({});

    const pxPerMeter = 40;
    const canvasWidthPx = safeMap.totalWidth * pxPerMeter;
    const canvasHeightPx = safeMap.totalHeight * pxPerMeter;

    // Obtener objeto seleccionado
    const selectedObject = objects.find((o) => o.itemID === selectedObjectID);

    const handleSaveInternal = async () => {
        onSavingStatusChange?.(true);

        const normalizedData = objects.map((obj) => ({
            itemID: obj.itemID,
            itemType: obj.itemType,
            type: obj.type,
            name: obj.name,
            limitPerRepresentative: obj.limitPerRepresentative,
            macroGroupId: obj.macroGroupId,
            chairNumber: obj.chairNumber,
            groupId: obj.groupId,
            rotation: obj.rotation,
            groupRotation: obj.groupRotation,
            price: obj.price || 0,
            x: Math.round(obj.x),
            y: Math.round(obj.y),
            width: Math.round(obj.width),
            height: Math.round(obj.height),
            xMeters: obj.x / pxPerMeter,
            yMeters: obj.y / pxPerMeter,
            widthMeters: obj.width / pxPerMeter,
            heightMeters: obj.height / pxPerMeter,
        }));

        startTransition(async () => {
            const res = await saveSeatingMapAction({ ...safeMap, elements: normalizedData }, elementId);

            onSavingStatusChange?.(false);
            if (!res.success) {
                toast.error(res.error || "Error al guardar el mapa.");
                return;
            }
            toast.success("Mapa guardado exitosamente");
            router.push("/admin/seating-charts");
        });
    };
    useImperativeHandle(ref, () => ({
        save: handleSaveInternal,
    }));
    // Helper: Obtener IDs de elementos agrupados según el dragMode actual
    const getTargetObjectIDs = useCallback(
        (targetObj: SeatingMapElement | undefined): string[] => {
            if (!targetObj) return [];

            if (dragMode === "group" && targetObj.groupId) {
                return objects
                    .filter((o) => o.groupId === targetObj.groupId)
                    .map((o) => o.itemID);
            }

            if (dragMode === "macroGroup" && targetObj.macroGroupId) {
                return objects
                    .filter((o) => o.macroGroupId === targetObj.macroGroupId)
                    .map((o) => o.itemID);
            }

            return [targetObj.itemID];
        },
        [objects, dragMode]
    );

    // Pre-render de Sprites para optimización
    useEffect(() => {
        const size = 32;
        CHAIR_TYPES.forEach((typeObj) => {
            const offscreen = document.createElement("canvas");
            offscreen.width = size;
            offscreen.height = size;
            const ctx = offscreen.getContext("2d");
            if (!ctx) return;

            ctx.fillStyle = typeObj.color;
            ctx.strokeStyle = typeObj.border;
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.roundRect(2, 2, size - 4, size - 8, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = typeObj.border;
            ctx.beginPath();
            ctx.roundRect(2, size - 8, size - 4, 6, 2);
            ctx.fill();

            chairSpritesRef.current[typeObj.id] = offscreen;
        });
    }, []);

    // Renderizado en canvas
    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        ctx.translate(pan.x, pan.y);
        ctx.scale(scale, scale);

        // Fondo claro
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, canvasWidthPx, canvasHeightPx);

        // Cuadrícula clara
        ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
        ctx.lineWidth = 1;
        const gridSize = pxPerMeter;
        for (let x = 0; x < canvasWidthPx; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeightPx);
            ctx.stroke();
        }
        for (let y = 0; y < canvasHeightPx; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidthPx, y);
            ctx.stroke();
        }

        // Viewport Culling
        const viewportX = -pan.x / scale;
        const viewportY = -pan.y / scale;
        const viewportW = canvas.width / scale;
        const viewportH = canvas.height / scale;

        // Determinar qué IDs deben destacarse (por selección individual o grupal)
        const highlightedIDs = new Set(getTargetObjectIDs(selectedObject));



        objects.forEach((obj) => {
            if (
                obj.x + obj.width < viewportX ||
                obj.x > viewportX + viewportW ||
                obj.y + obj.height < viewportY ||
                obj.y > viewportY + viewportH
            ) {
                return;
            }

            const isSelected = obj.itemID === selectedObjectID;
            const isGroupHighlighted = highlightedIDs.has(obj.itemID);

            ctx.save();
            ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
            ctx.rotate(((obj.rotation || 0) * Math.PI) / 180);

            if (obj.type === "platform") {
                ctx.fillStyle = "#334155";
                ctx.strokeStyle = "#1e293b";
                ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(obj.name, 0, 0);
            } else {
                const sprite = chairSpritesRef.current[obj.itemType];
                if (sprite) {
                    ctx.drawImage(
                        sprite,
                        -obj.width / 2,
                        -obj.height / 2,
                        obj.width,
                        obj.height
                    );
                }

                if (scale > 0.65 && obj.chairNumber) {
                    ctx.fillStyle = "#ffffff";
                    ctx.font = `bold ${Math.max(8, obj.width * 0.35)}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(String(obj.chairNumber), 0, -2);
                }
            }

            // Indicador de Selección Individual vs Selección Grupal
            if (isSelected) {
                ctx.strokeStyle = "#0284c7";
                ctx.lineWidth = 2.5 / scale;
                ctx.strokeRect(
                    -obj.width / 2 - 2,
                    -obj.height / 2 - 2,
                    obj.width + 4,
                    obj.height + 4
                );

                // Pivot de Rotación Visual
                if (activeTool === "select") {
                    ctx.fillStyle = "#0284c7";
                    ctx.beginPath();
                    ctx.arc(0, -obj.height / 2 - 20 / scale, 6 / scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 1 / scale;
                    ctx.stroke();
                }
            } else if (isGroupHighlighted) {
                // Contorno para elementos secundarios del mismo grupo / macroGrupo
                ctx.strokeStyle = dragMode === "macroGroup" ? "#9333ea" : "#a855f7";
                ctx.setLineDash([4 / scale, 4 / scale]);
                ctx.lineWidth = 2 / scale;
                ctx.strokeRect(
                    -obj.width / 2 - 2,
                    -obj.height / 2 - 2,
                    obj.width + 4,
                    obj.height + 4
                );
            }

            ctx.restore();
        });

        ctx.restore();
    }, [
        objects,
        selectedObjectID,
        selectedObject,
        scale,
        pan,
        canvasWidthPx,
        canvasHeightPx,
        activeTool,
        dragMode,
        getTargetObjectIDs,
    ]);

    useEffect(() => {
        renderCanvas();
    }, [renderCanvas]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
                renderCanvas();
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [renderCanvas]);

    const addMappedChairsBatch = () => {
        const groupId = groupNameLot.trim() || `g_${Date.now()}`;
        const macroGroupId = macroGroupNameLot.trim() || undefined;
        const dim = 0.8 * pxPerMeter;
        const gap = 0.2 * pxPerMeter;

        const startX = canvasWidthPx / 2 - (lotColumns * (dim + gap)) / 2;
        const startY = canvasHeightPx / 2 - (lotRows * (dim + gap)) / 2;

        const newChairs: SeatingMapElement[] = new Array(lotRows * lotColumns);
        let count = 0;

        for (let r = 0; r < lotRows; r++) {
            const rowLetter = String.fromCharCode(65 + (r % 26));
            for (let c = 0; c < lotColumns; c++) {
                const chairNum = `${rowLetter}-${c + 1}`;
                newChairs[count] = {
                    itemID: `c_${Date.now()}_${count}`,
                    type: "chair",
                    itemType: chairTypeLot,
                    name: `Asiento ${chairNum}`,
                    chairNumber: chairNum,
                    groupId,
                    macroGroupId,
                    x: startX + c * (dim + gap),
                    y: startY + r * (dim + gap),
                    width: dim,
                    height: dim,
                    rotation: 0,
                    price: unitPricePerLot,
                    xMeters: 0,
                    yMeters: 0,
                    widthMeters: 0,
                    heightMeters: 0,
                };
                count++;
            }
        }

        setObjects((prev) => [...prev, ...newChairs]);
        toast.success(`Se agregaron ${newChairs.length} sillas al grupo "${groupId}"`);
    };

    // Coordenadas del mundo
    const getWorldCoordinates = (clientX: number, clientY: number) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: (clientX - rect.left - pan.x) / scale,
            y: (clientY - rect.top - pan.y) / scale,
        };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (activeTool === "pan" || e.button === 1) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            return;
        }

        const worldPoint = getWorldCoordinates(e.clientX, e.clientY);
        const mX = worldPoint.x;
        const mY = worldPoint.y;

        // Verificar si hicimos clic en el Pivot de Rotación del objeto seleccionado
        if (selectedObject && activeTool === "select") {
            const sObj = selectedObject;
            const radL = (sObj.rotation * Math.PI) / 180;
            const pLX = 0;
            const pLY = -sObj.height / 2 - 20 / scale;
            const pivotWorldX = sObj.x + sObj.width / 2 + pLX * Math.cos(radL) - pLY * Math.sin(radL);
            const pivotWorldY = sObj.y + sObj.height / 2 + pLX * Math.sin(radL) + pLY * Math.cos(radL);

            const dx = mX - pivotWorldX;
            const dy = mY - pivotWorldY;
            if (Math.sqrt(dx * dx + dy * dy) < 10 / scale) {
                setIsRotating(true);
                setInitialRotation(sObj.rotation);
                const centerX = sObj.x + sObj.width / 2;
                const centerY = sObj.y + sObj.height / 2;
                setRotationStartAngle(Math.atan2(mY - centerY, mX - centerX));
                return;
            }
        }

        // Detección de colisión para arrastrar elementos
        const clicked = objects
            .slice()
            .reverse()
            .find(
                (obj) =>
                    mX >= obj.x &&
                    mX <= obj.x + obj.width &&
                    mY >= obj.y &&
                    mY <= obj.y + obj.height
            );

        if (clicked) {
            setSelectedObjectID(clicked.itemID);
            setIsDragging(true);
            setDragOffset({ x: mX - clicked.x, y: mY - clicked.y });

            // Registrar las posiciones iniciales de todos los elementos pertenecientes al grupo / macroGrupo
            const targetIDs = getTargetObjectIDs(clicked);
            const initialPos: Record<string, { x: number; y: number }> = {};
            objects.forEach((o) => {
                if (targetIDs.includes(o.itemID)) {
                    initialPos[o.itemID] = { x: o.x, y: o.y };
                }
            });
            setInitialDragPositions(initialPos);
        } else {
            setSelectedObjectID(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanning) {
            setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
            return;
        }

        const worldPoint = getWorldCoordinates(e.clientX, e.clientY);
        const mX = worldPoint.x;
        const mY = worldPoint.y;

        // Lógica de Rotación Interactiva
        if (isRotating && selectedObject) {
            const centerX = selectedObject.x + selectedObject.width / 2;
            const centerY = selectedObject.y + selectedObject.height / 2;
            const currentAngle = Math.atan2(mY - centerY, mX - centerX);
            const angleDiff = ((currentAngle - rotationStartAngle) * 180) / Math.PI;
            const newRotation = (initialRotation + angleDiff) % 360;

            setObjects((prev) =>
                prev.map((o) =>
                    o.itemID === selectedObject.itemID ? { ...o, rotation: newRotation } : o
                )
            );
            return;
        }

        // Lógica de Arrastre (Drag) Individual o Grupal
        if (isDragging && selectedObject) {
            // Delta / Desplazamiento desde el punto original del elemento cliqueado
            const targetIDs = getTargetObjectIDs(selectedObject);
            const initialClickedPos = initialDragPositions[selectedObject.itemID];

            if (!initialClickedPos) return;

            const targetX = mX - dragOffset.x;
            const targetY = mY - dragOffset.y;

            const deltaX = targetX - initialClickedPos.x;
            const deltaY = targetY - initialClickedPos.y;

            setObjects((prev) =>
                prev.map((o) => {
                    if (targetIDs.includes(o.itemID) && initialDragPositions[o.itemID]) {
                        return {
                            ...o,
                            x: initialDragPositions[o.itemID].x + deltaX,
                            y: initialDragPositions[o.itemID].y + deltaY,
                        };
                    }
                    return o;
                })
            );
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setIsDragging(false);
        setIsRotating(false);
        setInitialDragPositions({});
    };


    const updateMapDimensions = (axis: "totalWidth" | "totalHeight", delta: number) => {
        setSafeMap((prev) => ({
            ...prev,
            [axis]: Math.max(5, prev[axis] + delta),
        }));
    };

    const getCursorStyle = () => {
        if (isRotating) return "cursor-alias";
        if (activeTool === "pan") return isPanning ? "cursor-grabbing" : "cursor-grab";
        if (isDragging) return "cursor-grabbing";
        return "cursor-crosshair";
    };
    const handleDelete = () => {
        // 1. Si no hay nada seleccionado, no hacemos nada
        if (!selectedObject?.itemID) {
            console.warn("No hay ningún elemento ni grupo seleccionado para eliminar.");
            return;
        }

        // 2. Si está seleccionado un GRUPO completo
        if (dragMode === 'macroGroup' && selectedObject.macroGroupId) {
            removeMacroGroup(selectedObject.macroGroupId);
        } else if (dragMode === 'group' && selectedObject.groupId) {
            deleteGroup(selectedObject.groupId);
        } else if (dragMode === 'single') {
            deleteIndividualItem(selectedObject.itemID);
        }

        // Deseleccionar después de eliminar
        setSelectedObjectID(null);
    };

    // Funciones auxiliares para actualizar el estado o base de datos:

    // 1. Eliminar por MacroGrupo (elimina todos los elementos con ese macroGroupId)
    const removeMacroGroup = (macroGroupId: string) => {
        if (!macroGroupId) return;

        setObjects((prevObjects) =>
            prevObjects.filter((obj) => obj.macroGroupId !== macroGroupId)
        );
        console.log(`MacroGrupo ${macroGroupId} eliminado con todos sus elementos.`);
    };

    // 2. Eliminar por Grupo (elimina todos los elementos con ese groupId)
    const deleteGroup = (groupId: string) => {
        if (!groupId) return;

        setObjects((prevObjects) =>
            prevObjects.filter((obj) => obj.groupId !== groupId)
        );
        console.log(`Grupo ${groupId} eliminado con todos sus elementos.`);
    };

    // 3. Eliminar Elemento Individual (elimina únicamente por itemID)
    const deleteIndividualItem = (itemId: string) => {
        if (!itemId) return;

        setObjects((prevObjects) =>
            prevObjects.filter((obj) => obj.itemID !== itemId)
        );
        console.log(`Elemento individual ${itemId} eliminado.`);
    };
    const generateNextChairNumber = (
        currentChairNumber: string | null | undefined,
        existingObjects: typeof objects,
        usedInCurrentBatch: Set<string>
    ): { chairNumber: string | null; name: string } => {
        if (!currentChairNumber) return { chairNumber: null, name: "" };

        // Extrae la parte alfabética (prefijo) y la parte numérica (sufijo)
        // Ejemplo: "E-8" -> prefijo: "E-", número: 8 | "A12" -> prefijo: "A", número: 12
        const match = currentChairNumber.match(/^([A-Za-z\s-_]*?)(\d+)$/);

        if (!match) {
            // Si no se detecta número al final, devuelve el valor original
            return { chairNumber: currentChairNumber, name: `Asiento ${currentChairNumber}` };
        }

        const prefix = match[1];
        let num = parseInt(match[2], 10);

        // Conjunto de todos los chairNumbers existentes actualmente
        const existingChairNumbers = new Set(
            existingObjects.map((o) => o.chairNumber).filter(Boolean)
        );

        let nextChairNumber = "";

        // Incrementa el número hasta encontrar uno que no exista ni en 'objects' ni en la tanda actual
        do {
            num++;
            nextChairNumber = `${prefix}${num}`;
        } while (existingChairNumbers.has(nextChairNumber) || usedInCurrentBatch.has(nextChairNumber));

        usedInCurrentBatch.add(nextChairNumber);

        return {
            chairNumber: `${nextChairNumber}`,
            name: `Asiento ${nextChairNumber}`,
        };
    };
    // Método modificado
    const duplicateSelected = useCallback(() => {
        if (!selectedObject) return;

        let elementsToDuplicate = [];

        // 1. Filtrar los elementos según el dragMode actual
        if (dragMode === "macroGroup" && selectedObject.macroGroupId) {
            elementsToDuplicate = objects.filter(
                (o) => o.macroGroupId === selectedObject.macroGroupId
            );
        } else if (dragMode === "group" && selectedObject.groupId) {
            elementsToDuplicate = objects.filter(
                (o) => o.groupId === selectedObject.groupId
            );
        } else {
            elementsToDuplicate = [selectedObject];
        }

        if (elementsToDuplicate.length === 0) return;

        // 2. Definir un desplazamiento en píxeles (offset)
        const OFFSET = 20;

        // 3. Generar un nuevo groupId/macroGroupId si duplicamos grupos completos
        const newGroupId = selectedObject.groupId
            ? `${selectedObject.groupId}_copy_${Date.now()}`
            : '';

        const newMacroGroupId = selectedObject.macroGroupId
            ? `${selectedObject.macroGroupId}_copy_${Date.now()}`
            : '';

        // Registrar los números asignados en esta tanda de duplicación
        const usedInBatch = new Set<string>();

        // 4. Crear las copias con IDs únicos, posición desplazada y chairNumber ascendente
        const newCopies = elementsToDuplicate.map((obj) => {
            const { chairNumber: newChairNumber, name: newName } = generateNextChairNumber(
                obj.chairNumber,
                objects,
                usedInBatch
            );

            return {
                ...obj,
                id: undefined, // Elimina la clave primaria de la BD para que genere una nueva
                itemID: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                chairNumber: newChairNumber ?? obj.chairNumber,
                name: newName || obj.name,
                groupId: obj.groupId ? newGroupId : obj.groupId,
                macroGroupId: obj.macroGroupId ? newMacroGroupId : obj.macroGroupId,
                x: obj.x + OFFSET,
                y: obj.y + OFFSET,
            };
        });

        // 5. Agregar las copias al estado
        setObjects((prev) => [...prev, ...newCopies]);

        // 6. Seleccionar el primer elemento duplicado
        if (newCopies.length > 0) {
            setSelectedObjectID(newCopies[0].itemID);
        }
    }, [selectedObject, dragMode, objects]);

    // Centrar Horizontalmente (Eje X)
    const centerHorizontally = useCallback(() => {
        if (!selectedObject) return;

        // 1. Obtener los elementos involucrados según el dragMode actual
        let elementos = [];
        if (dragMode === "macroGroup" && selectedObject.macroGroupId) {
            elementos = objects.filter((o) => o.macroGroupId === selectedObject.macroGroupId);
        } else if (dragMode === "group" && selectedObject.groupId) {
            elementos = objects.filter((o) => o.groupId === selectedObject.groupId);
        } else {
            elementos = [selectedObject];
        }

        if (elementos.length === 0) return;

        // 2. Calcular los límites (Bounding Box) del elemento o grupo seleccionado
        const minX = Math.min(...elementos.map((e) => e.x));
        const maxX = Math.max(...elementos.map((e) => e.x + (e.width || 0)));
        const boundingWidth = maxX - minX;

        // 3. Calcular la nueva posición inicial X para centrar el bloque
        const newTargetMinX = (canvasWidthPx - boundingWidth) / 2;
        const deltaX = newTargetMinX - minX;

        const idsAFectar = new Set(elementos.map((e) => e.itemID));

        // 4. Actualizar la posición X de los elementos seleccionados
        setObjects((prev) =>
            prev.map((obj) =>
                idsAFectar.has(obj.itemID)
                    ? { ...obj, x: Math.round(obj.x + deltaX) }
                    : obj
            )
        );
    }, [selectedObject, dragMode, objects]);

    // Centrar Verticalmente (Eje Y)
    const centerVertically = useCallback(() => {
        if (!selectedObject) return;

        let elementos = [];
        if (dragMode === "macroGroup" && selectedObject.macroGroupId) {
            elementos = objects.filter((o) => o.macroGroupId === selectedObject.macroGroupId);
        } else if (dragMode === "group" && selectedObject.groupId) {
            elementos = objects.filter((o) => o.groupId === selectedObject.groupId);
        } else {
            elementos = [selectedObject];
        }

        if (elementos.length === 0) return;

        // 1. Calcular los límites (Bounding Box)
        const minY = Math.min(...elementos.map((e) => e.y));
        const maxY = Math.max(...elementos.map((e) => e.y + (e.height || 0)));
        const boundingHeight = maxY - minY;

        // 2. Calcular la nueva posición inicial Y para centrar el bloque
        const newTargetMinY = (canvasHeightPx - boundingHeight) / 2;
        const deltaY = newTargetMinY - minY;

        const idsAFectar = new Set(elementos.map((e) => e.itemID));

        // 3. Actualizar la posición Y de los elementos seleccionados
        setObjects((prev) =>
            prev.map((obj) =>
                idsAFectar.has(obj.itemID)
                    ? { ...obj, y: Math.round(obj.y + deltaY) }
                    : obj
            )
        );
    }, [selectedObject, dragMode, objects]);
    return (
        <div className="flex h-screen w-full bg-slate-200 text-slate-800 overflow-hidden font-sans">
            {/* Sidebar Claro */}
            <div className="w-80 border-r border-slate-300 bg-white flex flex-col z-10 shadow-sm">


                <div className="p-4 flex-1 overflow-y-auto space-y-5">
                    {/* Ubicación */}
                    <div className="font-questrial bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Locate className="w-4 h-4 text-purple-600" /> Ubicación
                        </span>
                        <div className="text-xs grid grid-cols-1">
                            <input type="text" value={safeMap.location}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSafeMap((prev) => ({ ...prev, location: val }));
                                    onLocationChange?.(val.trim().length > 0);
                                }}
                                placeholder="Ej. Av. Principal #123, Salón de Eventos Bella Vista"
                                className="w-full p-2 bg-white border border-purple-100 focus:outline-none focus:border-purple-400 rounded transition-colors" />

                        </div>{/* Mensaje de validación discreto debajo o dentro */}
                        {safeMap.location && !safeMap.location.trim() && (
                            <span className="text-[10px] text-red-400 font-questrial block mt-1">
                                * La dirección es obligatoria para guardar el plano.
                            </span>
                        )}

                    </div>
                    {/* Dimensiones del Plano */}
                    <div className="font-questrial bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Maximize2 className="w-4 h-4 text-purple-600" /> Dimensiones del Salón (Metros)
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1">
                                <input type="number" value={safeMap.totalWidth} readOnly className="w-full text-center text-sm font-bold text-purple-900" />
                                <button onClick={() => updateMapDimensions("totalWidth", 1)} className="cursor-pointer p-1 bg-slate-100 rounded hover:bg-slate-200"><Plus className="w-3.5 h-3.5" /></button>
                                <button onClick={() => updateMapDimensions("totalWidth", -1)} className="cursor-pointer p-1 bg-slate-100 rounded hover:bg-slate-200"><Minimize2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1">
                                <input type="number" value={safeMap.totalHeight} readOnly className="w-full text-center text-sm font-bold text-purple-900" />
                                <button onClick={() => updateMapDimensions("totalHeight", 1)} className="cursor-pointer p-1 bg-slate-100 rounded hover:bg-slate-200"><Plus className="w-3.5 h-3.5" /></button>
                                <button onClick={() => updateMapDimensions("totalHeight", -1)} className="cursor-pointer p-1 bg-slate-100 rounded hover:bg-slate-200"><Minimize2 className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1"><Info className="w-3 h-3" /> Aumenta si los asientos sobrepasan el plano visible.</p>
                    </div>

                    {/* Herramientas de navegación */}
                    <div className="font-questrial">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                            Herramienta Activa
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setActiveTool("select")}
                                className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition ${activeTool === "select"
                                    ? "bg-purple-600 text-white"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                            >
                                <Mouse className="w-4 h-4" /> Seleccionar
                            </button>
                            <button
                                onClick={() => setActiveTool("pan")}
                                className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg text-sm font-medium transition ${activeTool === "pan"
                                    ? "bg-purple-600 text-white"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                            >
                                <Move className="w-4 h-4" /> Mover Vista
                            </button>
                        </div>
                    </div>

                    {/* Modo de Mover / Arrastrar */}
                    <div className="font-questrial bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                        <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-purple-600" /> Modo de Mover Elementos
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                            <button
                                onClick={() => setDragMode("single")}
                                className={`cursor-pointer p-1.5 rounded text-xs font-medium transition flex flex-col items-center gap-1 ${dragMode === "single"
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                    }`}
                            >
                                <Mouse className="w-3.5 h-3.5" /> Único
                            </button>
                            <button
                                onClick={() => setDragMode("group")}
                                className={`cursor-pointer p-1.5 rounded text-xs font-medium transition flex flex-col items-center gap-1 ${dragMode === "group"
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                    }`}
                            >
                                <Users className="w-3.5 h-3.5" /> Grupo
                            </button>
                            <button
                                onClick={() => setDragMode("macroGroup")}
                                className={`cursor-pointer p-1.5 rounded text-xs font-medium transition flex flex-col items-center gap-1 ${dragMode === "macroGroup"
                                    ? "bg-purple-600 text-white shadow-sm"
                                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                                    }`}
                            >
                                <Layers className="w-3.5 h-3.5" /> Macro
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            {dragMode === "single" && "Mueve únicamente la silla o elemento seleccionado."}
                            {dragMode === "group" && "Mueve todas las sillas con el mismo groupId."}
                            {dragMode === "macroGroup" && "Mueve todas las sillas con el mismo macroGroupId."}
                        </p>
                    </div>

                    {/* Generador de Lotes / Zonas */}
                    <div className="font-questrial bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Grid className="w-4 h-4 text-purple-600" /> Crear Bloque de Asientos
                        </span>
                        <div className="text-xs">
                            <label className="text-[10px] text-slate-500 font-medium">
                                Nombre de Grupo (groupId)
                            </label>
                            <input
                                type="text"
                                value={groupNameLot}
                                onChange={(e) => setGroupNameLot(e.target.value)}
                                placeholder="Ej. Zona A"
                                className="w-full p-2 bg-white border border-purple-100 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            />
                        </div>
                        <div className="text-xs">
                            <label className="text-[10px] text-slate-500 font-medium">
                                Macro Grupo Opcional (macroGroupId)
                            </label>
                            <input
                                type="text"
                                value={macroGroupNameLot}
                                onChange={(e) => setMacroGroupNameLot(e.target.value)}
                                placeholder="Ej. Nivel 1"
                                className="w-full p-2 bg-white border border-purple-100 focus:outline-none focus:border-purple-400 rounded transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-xs">
                                <label className="text-slate-500 font-medium">Filas</label>
                                <input
                                    type="number"
                                    value={lotRows}
                                    onChange={(e) => setLotRows(Number(e.target.value))}
                                    className="w-full p-2 bg-white border border-purple-100 focus:outline-none focus:border-purple-400 rounded transition-colors"
                                />
                            </div>
                            <div className="text-xs">
                                <label className="text-xs text-slate-500 font-medium">
                                    Columnas
                                </label>
                                <input
                                    type="number"
                                    value={lotColumns}
                                    onChange={(e) => setLotColumns(Number(e.target.value))}
                                    className="w-full p-2 bg-white border border-purple-100 focus:outline-none focus:border-purple-400 rounded transition-colors"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-xs">
                                <label className="text-[10px] text-slate-500 font-medium">
                                    Tipo de Silla
                                </label>
                                <select
                                    value={chairTypeLot}
                                    onChange={(e) => setChairTypeLot(e.target.value)}
                                    className="w-full p-2 bg-white border border-purple-100 focus:outline-none focus:border-purple-400 rounded transition-colors"
                                >
                                    {CHAIR_TYPES.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-xs">
                                <label className="text-[10px] text-slate-500 font-medium">
                                    Precio ($)
                                </label>
                                <input
                                    type="number"
                                    value={unitPricePerLot}
                                    onChange={(e) => setUnitPricePerLot(Number(e.target.value))}
                                    className="w-full p-2 bg-white border border-purple-100 focus:outline-none focus:border-purple-400 rounded transition-colors"
                                />
                            </div>
                        </div>
                        <button
                            onClick={addMappedChairsBatch}
                            className="cursor-pointer w-full bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5"
                        >
                            <Plus className="w-4 h-4" /> Generar ({lotRows * lotColumns}) Sillas
                        </button>
                    </div>

                    {/* Editor de Selección Individual */}
                    {selectedObject && (
                        <div className="font-questrial bg-purple-50/50 p-3 rounded-xl border border-purple-200 space-y-3">
                            <span className="text-xs font-semibold text-purple-900 block border-b border-purple-200 pb-1">
                                Elemento Seleccionado
                            </span>

                            {/* Mostrar información de Grupo */}
                            <div className="text-xs space-y-1 text-slate-600 bg-white p-2 rounded border border-purple-100">
                                <div><strong className="text-slate-800">GroupID:</strong> {selectedObject.groupId || "Ninguno"}</div>
                                <div><strong className="text-slate-800">MacroGroupID:</strong> {selectedObject.macroGroupId || "Ninguno"}</div>
                            </div>

                            <div className="text-xs">
                                <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-purple-600" /> Precio ($)
                                </label>
                                <input
                                    type="number"
                                    value={selectedObject.price || 0}
                                    onChange={(e) => {
                                        const p = Number(e.target.value);
                                        setObjects((prev) =>
                                            prev.map((o) =>
                                                o.itemID === selectedObject.itemID
                                                    ? { ...o, price: p }
                                                    : o
                                            )
                                        );
                                    }} className="w-full p-2 bg-white border border-purple-100 focus:outline-none focus:border-purple-400 rounded transition-colors"

                                />
                            </div>
                            <div className="text-xs">
                                <label className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                    <RotateCw className="w-3 h-3 text-purple-600" /> Rotación Manual (°)
                                </label>
                                <input
                                    type="number"
                                    value={selectedObject.rotation || 0}
                                    onChange={(e) => {
                                        const r = Number(e.target.value);

                                        setObjects((prev) =>
                                            prev.map((o) => {
                                                // Modo MacroGrupo: rotar todos con el mismo macroGroupId
                                                if (dragMode === "macroGroup" && selectedObject.macroGroupId) {
                                                    return o.macroGroupId === selectedObject.macroGroupId
                                                        ? { ...o, rotation: r }
                                                        : o;
                                                }

                                                // Modo Grupo: rotar todos con el mismo groupId
                                                if (dragMode === "group" && selectedObject.groupId) {
                                                    return o.groupId === selectedObject.groupId
                                                        ? { ...o, rotation: r }
                                                        : o;
                                                }

                                                // Modo Single (Individual): rotar solo el elemento seleccionado
                                                return o.itemID === selectedObject.itemID
                                                    ? { ...o, rotation: r }
                                                    : o;
                                            })
                                        );
                                    }} className="w-full p-2 bg-white border border-purple-100 focus:outline-none focus:border-purple-400 rounded transition-colors"

                                />
                                <p className="text-[9px] text-slate-500 mt-1">O usa el control visual azul en el canvas.</p>
                            </div>
                            <button
                                onClick={handleDelete}
                                className="cursor-pointer w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1 rounded text-xs transition flex items-center justify-center gap-1 mt-2"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar Elemento
                            </button>
                            <button
                                onClick={duplicateSelected}
                                className="cursor-pointer w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 py-1 rounded text-xs transition flex items-center justify-center gap-1 mt-2"
                            >
                                <Copy className="w-4 h-4" />
                                {dragMode === "single" && "Duplicar Elemento"}
                                {dragMode === "group" && "Duplicar Grupo"}
                                {dragMode === "macroGroup" && "Duplicar MacroGrupo"}
                            </button>


                            <div className="flex gap-2 my-2">
                                <button
                                    type="button"
                                    onClick={centerHorizontally}
                                    title="Centrar Horizontalmente"
                                    className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 transition"
                                >
                                    {/* Ícono de Centrar Horizontal */}
                                    <AlignCenterHorizontal className="w-4 h-4" />
                                    Centrar Horizontal
                                </button>

                                <button
                                    type="button"
                                    onClick={centerVertically}
                                    title="Centrar Verticalmente"
                                    className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 transition"
                                >
                                    {/* Ícono de Centrar Vertical */}
                                    <AlignCenterVertical className="w-4 h-4" />
                                    Centrar Vertical
                                </button>
                            </div>

                        </div>
                    )}
                </div>
                <div className="p-4 border-b border-slate-200">
                    <p className="font-questrial text-xs text-slate-500">
                        {objects.length} elementos | {safeMap.totalWidth}m x {safeMap.totalHeight}m
                    </p>
                </div>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="flex-1 h-full relative"
                style={{ cursor: getCursorStyle() }}
            >
                {/* Controles Zoom */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-300 shadow-sm rounded-xl p-1.5 flex gap-1 z-20">
                    <button
                        onClick={() => setScale((s) => Math.min(s * 1.2, 4))}
                        className="cursor-pointer p-1 hover:bg-slate-100 rounded text-slate-700 font-bold"
                    >
                        <ZoomIn className="w-4 h-4" />

                    </button>
                    <button
                        onClick={() => setScale((s) => Math.max(s / 1.2, 0.2))}
                        className="cursor-pointer p-1 hover:bg-slate-100 rounded text-slate-700 font-bold"
                    >

                        <ZoomOut className="w-4 h-4" />
                    </button>
                </div>

                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="w-full h-full block"
                />
            </div>
        </div>
    );
})
SeatingMapEditor.displayName = "SeatingMapEditor";

export default SeatingMapEditor;