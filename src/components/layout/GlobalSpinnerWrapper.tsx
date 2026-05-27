// /src/components/layout/GlobalSpinnerWrapper.tsx
"use client";

import { useLoadingStore } from "@/store/useLoadingStore";
import LogoSpinner from "@/components/layout/LogoSpinner";

export default function GlobalSpinnerWrapper() {
    const isLoading = useLoadingStore((state) => state.isLoading);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
            <LogoSpinner size="lg" />
        </div>
    );
}