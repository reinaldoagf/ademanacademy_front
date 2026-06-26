// src/app/(dashboard)/admin/registrations/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Plus,
} from "lucide-react";
import HeroSection from '@/components/layout/HeroSection';

export default function RegistrationsPage() {
    return (
        <>
            {/* SUB-TOPBAR (Saludos y Acción rápida) */}
            <HeroSection
                htmlTitle={`Inscripciones <em class="text-[#5e0472]">Registradas</em>`}
                htmlSubTitle={`Administra las iinscripciones de estudiantes en el sistema.`}
                actions={[]}
            />
        </>
    );
}