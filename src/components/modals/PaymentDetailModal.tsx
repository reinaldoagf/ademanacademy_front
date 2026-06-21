"use client";
import { useState, useEffect, useTransition, useRef } from "react";
import { Sparkles, X, User, GraduationCap, Receipt, Calendar, CreditCard, ExternalLink } from "lucide-react";
import { approveTransactionAction } from "@/app/actions/transaction";
import { getAllGroupsAction } from "@/app/actions/group";
import { Group } from "@/types/group";

interface PaymentDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
    onSuccess: () => void;
}

export default function PaymentDetailModal({ isOpen, onClose, transaction, onSuccess }: PaymentDetailModalProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    // --- ESTADOS PARA BÚSQUEDA DE grupos ---
    const [groupSearch, setGroupSearch] = useState("");
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    // Refs para cerrar los menús si el usuario hace click afuera
    const groupRef = useRef<HTMLDivElement>(null);
    // ✨ Estados para manejar los grupos
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");

    const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";
    const receiptUrl = transaction ? `${backendUrl}/uploads/receipts/${transaction.receiptPath}` : "";
    // Debounce Effect para grupos
    // --- EFFECT PARA grupos (Vía Server Action) ---
    useEffect(() => {
        // Evitamos re-consultar si el string coincide con el elemento ya seleccionado
        if (filteredGroups.find(c => c.id === selectedGroupId)?.name === groupSearch) {
            return;
        }

        setIsLoadingGroups(true);

        const isSearchEmpty = !groupSearch.trim();
        const delay = isSearchEmpty ? 0 : 400;

        const delayDebounce = setTimeout(async () => {
            try {
                // Construimos los parámetros requeridos por FetchGroupsParams
                const params = isSearchEmpty
                    ? { limit: 5 }
                    : { search: groupSearch.trim() };

                // Llamada directa al Server Action
                const result = await getAllGroupsAction(params);

                if (result.success && result.data) {
                    // Axios mapea la respuesta en result.data. data.data suele ser el array
                    // Si tu backend anida los grupos en 'groups', úsalo; de lo contrario asigna result.data
                    setFilteredGroups(result.data.groups || result.data);
                } else {
                    console.error("Error en Server Action (grupos):", result.error);
                    setFilteredGroups([]);
                }
            } catch (error) {
                console.error("Error crítico buscando grupos:", error);
                setFilteredGroups([]);
            } finally {
                setIsLoadingGroups(false);
            }
        }, delay);

        return () => clearTimeout(delayDebounce);
    }, [isOpen, transaction, backendUrl, groupSearch]);

    if (!isOpen || !transaction) return null;

    const handleApprove = () => {
        // 🎯 VALIDACIÓN: Si es matrícula, obligar a seleccionar un grupo antes de proceder
        if (transaction.concept === "tuition" && !selectedGroupId) {
            setError("Por favor, selecciona un grupo académico para asignar al estudiante.");
            return;
        }

        startTransition(async () => {
            setError(null);

            // Pasamos el realId junto al groupId (si aplica) al Server Action
            const res = await approveTransactionAction(transaction.realId, selectedGroupId || undefined);

            if (res.success) {
                onSuccess();
                onClose();
            } else {
                setError(res.error);
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border border-purple-100 shadow-2xl  overflow-hidden relative animate-in zoom-in-95 duration-150 rounded-none">

                {/* Header */}
                <div className="p-4 bg-purple-50/60 border-b border-purple-100 flex justify-between items-center">
                    <h3 className="font-anton text-gray-800 text-sm uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" /> Detalles del Pago ({transaction.id})
                    </h3>
                    <button onClick={onClose} className="cursor-pointer p-1 hover:bg-gray-100 rounded text-gray-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 font-questrial text-xs">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 border border-red-200 font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Columna Izquierda: Información Estructurada */}
                        <div className="space-y-4">

                            {/* Card de Personas (Representante + Estudiante) */}
                            <div className="bg-gray-50/50 p-4 border border-gray-100 space-y-3">
                                {/* Representante */}
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                        <User className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Representante</h5>
                                        <p className="font-semibold text-gray-800 text-xs mt-0.5">{transaction.user?.name}</p>
                                        <p className="text-gray-500 text-[11px] leading-relaxed mt-0.5">
                                            C.I. {transaction.user?.dni} • {transaction.user?.phone}
                                        </p>
                                        <p className="text-gray-400 text-[11px]">{transaction.user?.email}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100/80 my-2" />

                                {/* Estudiante */}
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                        <GraduationCap className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Estudiante Inscrito</h5>
                                        <p className="font-semibold text-gray-800 text-xs mt-0.5">
                                            {transaction.student?.firstName} {transaction.student?.lastName}
                                        </p>
                                        <p className="text-gray-500 text-[11px] mt-0.5">Camisa: Talla {transaction.student?.shirtSize}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles Técnicos de Transacción */}
                            <div className="bg-white p-4 border border-gray-100 space-y-2.5">
                                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 flex items-center gap-1.5">
                                    <Receipt className="w-3 h-3 text-gray-400" /> Auditoría de Pago
                                </h4>

                                <div className="flex justify-between items-center text-[11px] text-gray-600">
                                    <span className="text-gray-400">Concepto</span>
                                    <span className="font-medium text-gray-800 bg-gray-100 px-2 py-0.5 text-[10px]">Matrícula</span>
                                </div>

                                <div className="flex justify-between items-center text-[11px] text-gray-600">
                                    <span className="text-gray-400 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Método</span>
                                    <span className="font-medium text-gray-800 uppercase text-[10px]">{transaction.method?.replace('_', ' ')}</span>
                                </div>

                                <div className="flex justify-between items-center text-[11px] text-gray-600">
                                    <span className="text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Reportado</span>
                                    <span className="font-medium text-gray-700">{transaction.createdAt}</span>
                                </div>

                                <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
                                    <span className="font-bold text-gray-700">Monto Neto</span>
                                    <span className="text-sm font-extrabold text-emerald-600">${transaction.amount}</span>
                                </div>

                                <div className="flex justify-end pt-1">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${transaction.status === "approved"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-amber-50 text-amber-700 border border-amber-100"
                                        }`}>
                                        {transaction.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Visor de Comprobante Minimalista */}
                        <div className="h-full flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 block">
                                Comprobante Digital
                            </span>

                            <div className="flex-1 bg-gray-50 border border-dashed border-gray-200 p-2 flex flex-col justify-center items-center min-h-[240px] relative group overflow-hidden">
                                {transaction.receiptPath ? (
                                    <>
                                        <img
                                            src={receiptUrl}
                                            alt="Comprobante de pago"
                                            className="max-h-56 w-full object-contain transition-all duration-300 group-hover:blur-[2px]"
                                        />
                                        {/* Overlay al hacer Hover */}
                                        <a
                                            href={receiptUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white gap-1 transition-all duration-200 cursor-pointer text-center"
                                        >
                                            <ExternalLink className="w-4 h-4 text-white drop-shadow-sm" />
                                            <span className="font-medium text-[11px]">Expandir imagen</span>
                                        </a>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <p className="text-gray-400 font-medium italic text-[11px]">Sin archivo adjunto</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ✨ SECCIÓN SELECTOR DE GRUPO (Aparece sólo si es Matrícula Pendiente) */}
                    {transaction.concept === "tuition" && transaction.status === "pending" && (
                        <div className="relative" ref={groupRef}>
                            <label className="block text-gray-500 font-bold mb-1">Asignación Obligatoria de Grupo Académico *</label>
                            <div className="relative">
                                <input
                                    required
                                    type="text"
                                    placeholder="Escribe para buscar o selecciona de la lista..."
                                    value={groupSearch}
                                    onFocus={() => setShowGroupDropdown(true)} // Al hacer foco abre la lista inicial
                                    onChange={(e) => {
                                        setGroupSearch(e.target.value);
                                        setShowGroupDropdown(true);

                                        setSelectedGroupId(e.target.value);
                                        setError(null);
                                    }}
                                    className="w-full p-2 border border-purple-100 bg-purple-50/30 focus:outline-none focus:border-purple-400 pr-8"
                                />
                                {isLoadingGroups && (
                                    <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                )}
                            </div>


                            {/* ✨ CAMBIO: Se muestra siempre que el dropdown esté activo y tengamos elementos cargados (o cargándose) */}
                            {showGroupDropdown && (filteredGroups.length > 0 || isLoadingGroups || groupSearch.trim().length > 0) && (
                                <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg font-questrial text-xs rounded-none divide-y divide-gray-50">
                                    {isLoadingGroups ? (
                                        <li className="p-2 text-gray-400 italic">Cargando opciones...</li>
                                    ) : filteredGroups.length === 0 ? (
                                        <li className="p-2 text-red-400 bg-red-50/30">No se encontraron grupos coincidentes</li>
                                    ) : (
                                        filteredGroups.map((c: any) => (
                                            <li
                                                key={c.id}
                                                onClick={() => {
                                                    setGroupSearch(`${c.name} (${c.type || 'Aula'})`);
                                                    setShowGroupDropdown(false);
                                                }}
                                                className="p-2 hover:bg-purple-50 cursor-pointer transition-colors flex justify-between items-center"
                                            >
                                                <span className="font-medium text-gray-700">{c.name}</span>
                                                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 font-sans">Cap: {c.maxCapacity || c.capacity}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-between border-t border-gray-100 pt-4">
                        <button
                            onClick={onClose}
                            className="cursor-pointer font-questrial px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            Cerrar
                        </button>

                        {transaction.status === "pending" && (
                            <button
                                onClick={handleApprove}
                                disabled={isPending || isLoadingGroups || !selectedGroupId}
                                className="font-questrial px-4 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90"
                            >
                                {isPending ? "Aprobando..." : "Aprobar Pago ✓"}
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}