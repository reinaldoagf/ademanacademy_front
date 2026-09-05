"use client";

import { useState, useRef } from "react";
import HeroSection from "@/components/layout/HeroSection";
import { Save } from "lucide-react";
import SeatingMapEditor, { SeatingMapEditorRef } from "@/components/SeatingMapEditor";

export default function SeatingMapBuilderPage() {
  const [saving, setSaving] = useState<boolean>(false);
  const [isLocationValid, setIsLocationValid] = useState<boolean>(false);
  // Referencia al componente hijo
  const editorRef = useRef<SeatingMapEditorRef>(null);
  // Función ejecutada por la acción del HeroSection
  const handleSavePlan = () => {
    // Ejecuta la función interna 'save' expuesta por el hijo
    editorRef.current?.save();
  };
  return (
    <>
      <HeroSection
        htmlTitle={`Plano de <em class="text-[#5e0472]">Asientos</em>`}
        htmlSubTitle="Manejo dinámico vectorial con herramientas de alineación y leyes métricas."
        actions={[{ label: saving ? "Guardando..." : "Guardar Plano", onClick: handleSavePlan, icon: <Save className="w-4 h-4" />, variant: "primary", isDisabled: !isLocationValid || saving }]}
      />

      <div className="p-4 md:p-8 mx-auto w-full overflow-y-auto space-y-6">
        <SeatingMapEditor
          ref={editorRef}
          onLocationChange={(isValid) => setIsLocationValid(isValid)}
          onSavingStatusChange={(isSaving) => setSaving(isSaving)}
        />
      </div>
    </>
  );
}