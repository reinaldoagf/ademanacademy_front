import React from "react";
import { CheckCircle2, Clock, AlertCircle, Info, LucideIcon, Users } from "lucide-react";

interface BadgeProps {
    variant: string;
    children?: React.ReactNode; // Ahora es opcional, si no viene, usamos la variante traducida
    theme?: string;
    className?: string;
}

export default function Badge({ variant, children, theme = "light", className = "" }: BadgeProps) {
    const normalizedVariant = variant.toLowerCase().trim();

    // Diccionario de configuraciones visuales (Mapea llaves del sistema a Estilos + Iconos)
    const config: Record<string, { styles: string; icon: LucideIcon }> = {
        emerald: {
            styles: theme == "light" ?
                "bg-emerald-50 text-emerald-700 border-emerald-100/80" :
                "bg-emerald-950/40 text-emerald-400 border-emerald-800/60",
            icon: CheckCircle2
        },
        amber: {
            styles: theme == "light" ?
                "bg-amber-50 text-amber-700 border-amber-100/80" :
                "bg-amber-950/40 text-amber-400 border-amber-800/60",
            icon: Clock
        },
        red: {
            styles: theme == "light" ?
                "bg-red-50 text-red-700 border-red-100/80" :
                "bg-red-950/40 text-red-400 border-red-800/60",
            icon: AlertCircle
        },
        blue: {
            styles: theme == "light" ?
                "bg-blue-50 text-blue-700 border-blue-100/80" :
                "bg-blue-950/40 text-blue-400 border-blue-800/60",
            icon: Info
        },
        green: {
            styles: theme == "light" ?
                "bg-green-50 text-green-700 border-green-100/80" :
                "bg-green-950/40 text-green-400 border-green-800/60", icon: AlertCircle
        },
        orange: {
            styles: theme == "light" ?
                "bg-orange-50 text-orange-700 border-orange-100/80" :
                "bg-orange-950/40 text-orange-400 border-orange-800/60", icon: AlertCircle
        },
        yellow: {
            styles: theme == "light" ?
                "bg-yellow-50 text-yellow-700 border-yellow-100/80" :
                "bg-yellow-950/40 text-yellow-400 border-yellow-800/60", icon: Users
        },
    };

    const currentConfig = config[normalizedVariant] || {
        styles: theme == "light" ? "bg-gray-50 text-gray-600 border-gray-200" : "bg-gray-950/40 text-gray-400 border-gray-800/60",
        icon: Info
    };

    const Icon = currentConfig.icon;

    // 🌟 Aplicamos el Pipe: si hay hijos usamos los hijos, si no, traducimos la variante automáticamente
    const displayedText = children ? children : variant;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border transition-colors ${currentConfig.styles} ${className}`}
        >
            <Icon className="w-3 h-3 shrink-0 stroke-[2.5]" />
            {displayedText}
        </span>
    );
}