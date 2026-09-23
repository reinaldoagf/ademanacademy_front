// src/app/(dashboard)/admin/payments/[id]/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import {
    ArrowLeft,
    Wallet,
    Receipt,
    CreditCard,
    Calendar,
    Check,
    User,
    Ticket,
    ExternalLink
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import HeroSection from '@/components/layout/HeroSection';
import Badge from "@/components/common/Badge";
import DatePipe from "@/components/pipes/DatePipe";
import { SearchInput } from "@/components/ui/forms";
import { getAllGroupsAction } from "@/app/actions/group";
import { getTransactionByIdAction, approveTransactionAction } from "@/app/actions/transaction";
import { Transaction } from "@/types/transaction";
import { Group } from "@/types/group";

export default function PaymentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [error, setError] = useState<string | null>(null);
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // --- ESTADOS PARA BÚSQUEDA DE grupos ---
    const [groupSearch, setGroupSearch] = useState("");
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_NEST_BACKEND_URL || "http://localhost:3000";
    const receiptUrl = transaction ? `${backendUrl}/uploads/receipts/${transaction.receiptPath}` : "";

    useEffect(() => {
        if (!id) return;

        const fetchTransactionDetails = async () => {
            try {
                startTransition(async () => {
                    const res = await getTransactionByIdAction(id);
                    if (res.success && res.data) {
                        setTransaction(res.data);
                    }
                });
            } catch (error) {
                console.error("Error al obtener los detalles de la orden de pago:", error);
            }
        };

        fetchTransactionDetails();
    }, [id]);
    const handleBack = () => {
        router.back();
    };
    const handleApprove = () => {
        if (!transaction) return;
        // 🎯 VALIDACIÓN: Si es matrícula, obligar a seleccionar un grupo antes de proceder
        if (transaction?.concept === "tuition" && !selectedGroupId) {
            setError("Por favor, selecciona un grupo académico para asignar al estudiante.");
            return;
        }

        startTransition(async () => {
            setError(null);

            // Pasamos el realId junto al groupId (si aplica) al Server Action
            const res = await approveTransactionAction(transaction.id, selectedGroupId || undefined);

            if (res.success) {
                toast.success(res.data.message ?? 'Operación exitosa')
                setError(null);
                router.push(`/admin/payments`);
            } else {
                setError(res.error);
            }
        });
    };

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
    return (
        <>
            {/* HERO SECTION */}
            <HeroSection
                htmlTitle={`Detalles de la <em class="text-[#5e0472]">Transacción</em>`}
                htmlSubTitle="Consulta la información detallada de la transacción, estado de la transacción, desglose de ítems y asientos asociados."
                actions={[
                    {
                        label: "Volver al listado",
                        icon: <ArrowLeft className="w-4 h-4" />,
                        onClick: handleBack,
                        variant: "secondary",
                    },
                ]}
            /> {/* Capa de Carga Asíncrona */}
            <div className="relative w-full">
                <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
                    {!transaction ? (
                        <div className="text-center py-16 border border-dashed border-purple-100 bg-white">
                            <Wallet className="w-10 h-10 text-purple-200 mx-auto mb-3" />
                            <p className="font-questrial text-xs text-gray-400">
                                {isPending ? "Sincronizando..." : "No se encontró la transacción solicitada."}
                            </p>
                        </div>
                    ) : (

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Tarjeta Estudiante */}
                                <div className="glass-card p-6 shadow-sm">
                                    <h3 className="text-lg font-anton mb-4">Información del Estudiante</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-purple-500" /> Nombre completo
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{transaction.client?.firstName} {transaction.client?.lastName}</span>
                                        </div>
                                        {(transaction.client?.student) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-pink-500" /> DNI / Cédula
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{transaction.client?.dni}</span>
                                        </div>)}
                                        {(transaction.client?.student) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Ticket className="w-4 h-4 text-indigo-500" /> Email
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{transaction.client?.email}</span>
                                        </div>)}
                                        {(transaction.client?.student) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Ticket className="w-4 h-4 text-indigo-500" /> Talla
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{transaction.client?.student?.shirtSize}</span>
                                        </div>)}
                                    </div>
                                </div>
                                {/* Tarjeta Usuario */}
                                <div className="glass-card p-6 shadow-sm">
                                    <h3 className="text-lg font-anton mb-4">Información del Usuario</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-purple-500" /> Nombre completo
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{transaction.user?.name}</span>
                                        </div>
                                        {(transaction.user?.dni) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <User className="w-4 h-4 text-pink-500" /> DNI / Cédula
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{transaction.user?.dni}</span>
                                        </div>)}
                                        {(transaction.user?.email) && (<div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Ticket className="w-4 h-4 text-indigo-500" /> Email
                                            </span>
                                            <span className="text-sm font-anton text-gray-800">{transaction.user?.email}</span>
                                        </div>)}
                                    </div>
                                </div>
                                {/* Comprobante Digital */}
                                <div className="glass-card p-6 shadow-sm">
                                    <h3 className="text-lg font-anton mb-4">
                                        Comprobante Digital
                                    </h3><div className="flex-1 bg-gray-50 border border-dashed border-gray-200 p-2 flex flex-col justify-center items-center min-h-[240px] relative group overflow-hidden">
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

                            {/* Auditoría de Pago */}
                            <div className="glass-card p-6 shadow-sm">
                                <h3 className="text-lg font-anton mb-4">
                                    Auditoría de Pago
                                </h3>
                                <div className="space-y-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Receipt className="w-4 h-4 text-purple-500" /> Estado
                                            </span>
                                            <Badge variant={transaction.status} />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Receipt className="w-4 h-4 text-purple-500" /> Concepto
                                            </span>
                                            <Badge variant={transaction.concept} />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <CreditCard className="w-4 h-4 text-purple-500" /> Método de pago
                                            </span>
                                            <Badge variant={transaction.method?.replace('_', ' ')} />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/50">
                                            <span className="text-sm font-questrial font-medium flex items-center gap-2 text-gray-700">
                                                <Calendar className="w-4 h-4 text-purple-500" /> Reportado
                                            </span>
                                            <span className="text-sm font-anton text-gray-800"><DatePipe value={transaction.createdAt} format="short" /></span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 font-questrial">
                                        <div className="p-4 gradient-purple text-white shadow-lg shadow-purple-200 rounded-lg flex justify-between items-center font-bold">
                                            <span className="text-sm">Monto Neto:</span>
                                            <span className="text-lg text-emerald-400">
                                                ${transaction.amount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ✨ SECCIÓN SELECTOR DE GRUPO (Aparece sólo si es Matrícula Pendiente) */}
                            {transaction.concept === "tuition" && transaction.status === "pending" && (<>

                                <div className="glass-card p-6 shadow-sm">
                                    <h3 className="text-lg font-anton mb-4">
                                        Asignación de Grupo
                                    </h3>
                                    <div className="font-questrial text-xs">
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
                                            onChangeText={(text: string) => {
                                                setSelectedGroupId(null);
                                                setGroupSearch(text);
                                            }}
                                            onSelectOption={(option: any) => {
                                                setSelectedGroupId(option.id as string);
                                                setGroupSearch(`${option.label} (${option.data?.email || 'Grupo'})`);
                                            }}
                                        />
                                    </div>
                                    <div className="pt-4 border-t border-purple-100 bg-purple-50/20 flex justify-end shrink-0">

                                        <button
                                            type="button"
                                            disabled={!!(isPending || !selectedGroupId)}
                                            onClick={handleApprove}
                                            className="font-questrial px-5 py-2 flex items-center justify-center gap-2 font-medium transition text-xs cursor-pointer gradient-purple text-white shadow-md shadow-purple-200 hover:opacity-90 disabled:opacity-50 rounded-md"
                                        >
                                            <Check className="w-4 h-4" /> {isPending
                                                ? "Guardando..."
                                                : "Aprobar →"}
                                        </button>
                                    </div>

                                </div>
                            </>)}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}