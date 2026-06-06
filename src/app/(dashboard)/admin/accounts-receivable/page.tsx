// src/app/(dashboard)/admin/accounts-receivable/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Plus,
} from "lucide-react";
import HeroSection from "@/components/layout/HeroSection";
export default function OrdersPage() {

    const handleNewElement = () => {
        console.log('handleNewElement');
    };
    return (
        <>
            {/* TOPBAR / HERO */}
            <HeroSection
                htmlTitle={`Cuentas por <em class="text-[#5e0472]">Cobrar</em>`}
                htmlSubTitle={`Administra, emite aranceles y monitorea las cuentas por cobrar de la academia.`}
                actions={[{
                    label: "Registrar pedido →",
                    onClick: handleNewElement,
                    icon: <Plus className="w-4 h-4" />,
                }]}
            />
        </>
    );
}