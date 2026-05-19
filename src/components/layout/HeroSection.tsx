"use client";

import { 
  Plus, 
} from "lucide-react";

const HeroSection = () => {
   return (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-[36px] pb-[24px] px-[44px] bg-white/80">
            <div>
              <h2 className="text-2xl font-anton text-gray-800">Panel Principal</h2>
              <p className="text-xs text-gray-500 font-questrial">Bienvenido de vuelta, gestiona los flujos de hoy.</p>
            </div>
            <button className="gradient-purple font-questrial text-white px-4 py-2 cursor-pointer flex items-center justify-center gap-2 font-medium shadow-md shadow-purple-200 hover:opacity-90 transition text-xs self-start sm:self-auto cursor-pointer">
              <Plus className="w-4 h-4" /> Registrar Nuevo Evento / Pago
            </button>
          </div>
        </>
    );
};

export default HeroSection;