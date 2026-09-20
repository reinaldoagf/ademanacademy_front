"use client";
import { useState, useEffect, useRef } from "react";
import { User, GraduationCap, Receipt, Calendar, CreditCard, ExternalLink } from "lucide-react";

import Badge from "@/components/common/Badge";
import { getAllGroupsAction } from "@/app/actions/group";
import { Group } from "@/types/group";
import { SearchInput } from "../ui/forms";

interface PaymentDetailModalProps {
    transaction: any;
    selectedGroupId: string | null;
    error: string | null;
    onSelectGroupId: (id: string) => void;
}

export default function PaymentDetailModal({ transaction, selectedGroupId, error, onSelectGroupId }: PaymentDetailModalProps) {

    // --- ESTADOS PARA BÚSQUEDA DE grupos ---
    const [groupSearch, setGroupSearch] = useState("");
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);

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
    }, [transaction, backendUrl, groupSearch]);

    if (!transaction) return null;



    return (<>


        <div className="space-y-4 font-questrial text-xs">
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
                            <Badge variant={transaction.concept} />
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
                            <Badge variant={transaction.status} />
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
            {transaction.concept === "tuition" && transaction.status === "pending" && (<>
                {/* ✨ SECCIÓN SELECTOR DE USUARIO (OPCIONAL) */}
                <SearchInput
                    label="Asignación Obligatoria de Grupo Académico *"
                    placeholder="Escribe para buscar o selecciona de la lista..."
                    value={groupSearch}
                    isLoading={isLoadingGroups}
                    options={filteredGroups.map((group: any) => ({
                        id: group.id,
                        label: group.name,
                        capacity: `Capacidad: ${group.capacity} estudiantes`,
                        data: group, // Guardamos el objeto completo si hace falta
                    }))}
                    emptyMessage="No se encontraron grupos coincidentes"
                    onChangeText={(text) => {
                        setGroupSearch(text);
                    }}
                    onSelectOption={(option) => {
                        setGroupSearch(`${option.label} (${option.data?.email || 'Grupo'})`);
                        onSelectGroupId(option.id as string);
                    }}
                /></>

            )}

        </div>

    </>);
}