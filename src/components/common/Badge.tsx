import React from "react";
import { CheckCircle2, Clock, AlertCircle, Info, LucideIcon, CreditCard, User, Users } from "lucide-react";


// 🌟 El "Custom Pipe" (Función pura de transformación)
function statusTranslatePipe(value: string): string {
    if (!value) return "";

    const translations: Record<string, string> = {
        approved: "Aprobado",
        pending: "Pendiente",
        rejected: "Rechazado",
        info: "Información",
        tuition: "Matrícula",
        bank_transfer: "Transferencia Bancaria",
        son: "Hijo",
        daughter: "Hija",
        nephew: "Sobrino",
        niece: "Sobrina",
        tutored: "Tutorado",
        monthly_payment: "Pago mensual",
        locker_room: "Vestuario",
        ticket: "boleto",
        pending_preparation: "Por Confeccionar",
        available: "En lavandería / Reparación",
        retired: "Fuera de servicio",
        canceled: "Cancelado",
        baby: "Baby",
        childrens: "Infantil",
        youth: "Juvenil",
        adult: "Adulto",
        other: "Otro",
    };

    const normalized = value.toLowerCase().trim();
    // Retorna la traducción si existe, de lo contrario devuelve el valor original capitalizado
    return translations[normalized] || value.charAt(0).toUpperCase() + value.slice(1);
}

interface BadgeProps {
    variant: string;
    children?: React.ReactNode; // Ahora es opcional, si no viene, usamos la variante traducida
    className?: string;
}

export default function Badge({ variant, children, className = "" }: BadgeProps) {
    const normalizedVariant = variant.toLowerCase().trim();

    // Diccionario de configuraciones visuales (Mapea llaves del sistema a Estilos + Iconos)
    const config: Record<string, { styles: string; icon: LucideIcon }> = {
        approved: { styles: "bg-emerald-50 text-emerald-700 border-emerald-100/80", icon: CheckCircle2 },
        pending: { styles: "bg-amber-50 text-amber-700 border-amber-100/80", icon: Clock },
        rejected: { styles: "bg-red-50 text-red-700 border-red-100/80", icon: AlertCircle },
        info: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: Info },
        bank_transfer: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: CreditCard },
        monthly_payment: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: CreditCard },
        tuition: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: CreditCard },
        locker_room: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: CreditCard },
        ticket: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: CreditCard },
        son: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: User },
        daughter: { styles: "bg-red-50 text-red-700 border-red-100/80", icon: User },
        nephew: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: User },
        niece: { styles: "bg-red-50 text-red-700 border-red-100/80", icon: User },
        tutored: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: User },
        available: { styles: "bg-green-50 text-green-700 border-green-100/80", icon: AlertCircle },
        retired: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: AlertCircle },
        pending_preparation: { styles: "bg-orange-50 text-orange-700 border-orange-100/80", icon: AlertCircle },
        canceled: { styles: "bg-red-50 text-red-700 border-red-100/80", icon: AlertCircle },
        baby: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: Users },
        childrens: { styles: "bg-yellow-50 text-yellow-700 border-yellow-100/80", icon: Users },
        youth: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: Users },
        adult: { styles: "bg-yellow-50 text-yellow-700 border-yellow-100/80", icon: Users },
        other: { styles: "bg-blue-50 text-blue-700 border-blue-100/80", icon: User },
    };

    const currentConfig = config[normalizedVariant] || {
        styles: "bg-gray-50 text-gray-600 border-gray-200",
        icon: Info
    };

    const Icon = currentConfig.icon;

    // 🌟 Aplicamos el Pipe: si hay hijos usamos los hijos, si no, traducimos la variante automáticamente
    const displayedText = children ? children : statusTranslatePipe(variant);

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-colors ${currentConfig.styles} ${className}`}
        >
            <Icon className="w-3 h-3 shrink-0 stroke-[2.5]" />
            {displayedText}
        </span>
    );
}