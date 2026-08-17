// src/app/(dashboard)/store/categories/page.tsx
"use client";

import { useState } from "react";
import HeroSection from "@/components/layout/HeroSection";
export default function ProductCategoriesPage() {
    return (
        <>
            {/* HERO SECTION DE LA SECCIÓN */}
            <HeroSection
                htmlTitle={`Tienda de la Academia e <em class="text-[#5e0472]">Inventario</em>`}
                htmlSubTitle="Administra los productos en exhibición, calcula el valor de tus activos en almacén y registra ventas de uniforme rápido."
                actions={[]}
            />
        </>
    );
}