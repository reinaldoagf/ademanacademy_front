"use client";

import { useEffect, useState, useRef, use } from "react";
import { notFound } from "next/navigation";
import HeroSection from "@/components/layout/HeroSection";
import { Save, Loader2 } from "lucide-react";
import SeatingMapEditor, { SeatingMapEditorRef } from "@/components/SeatingMapEditor";
import { getSeatingMapAction } from "@/app/actions/seating-map";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSeatingMapBuilderPage({ params }: PageProps) {
  // 1. Desenvolver params de la promesa
  const { id } = use(params);

  // Estados
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isLocationValid, setIsLocationValid] = useState<boolean>(false);
  const [initialData, setInitialData] = useState<any>(null);

  // Referencia al componente hijo
  const editorRef = useRef<SeatingMapEditorRef>(null);

  // Carga de datos del mapa
  useEffect(() => {
    let isMounted = true;

    async function fetchSeatingMap() {
      setLoading(true);
      const data = await getSeatingMapAction(id);
      if (!isMounted) return;

      if (!data) {
        notFound();
      }

      setInitialData(data);
      if (data.location?.trim()) {
        setIsLocationValid(true);
      }
      setLoading(false);
    }

    fetchSeatingMap();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Ejecuta el método 'save' expuesto por el hijo
  const handleSavePlan = () => {
    console.log('handleSavePlan')
    editorRef.current?.save();
  };

  return (
    <>
      <HeroSection
        htmlTitle={`Mapa de <em class="text-[#5e0472]">Asientos</em>`}
        htmlSubTitle="Manejo dinámico vectorial con herramientas de alineación y leyes métricas."
        actions={[
          {
            label: saving ? "Guardando..." : (id ? "Actualizar Mapa" : "Registrar Mapa"),
            onClick: handleSavePlan,
            icon: <Save className="w-4 h-4" />,
            variant: "primary",
            isDisabled: !isLocationValid || saving,
          },
        ]}
      />

      <div className="p-4 md:p-8 mx-auto w-full overflow-y-auto space-y-6">
        {loading ? (<div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-purple-800">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-questrial font-medium">Cargando mapas de asientos...</p>
        </div>) : (<SeatingMapEditor
          ref={editorRef}
          seatingMap={initialData}
          elementId={id}
          onLocationChange={(isValid: boolean) => setIsLocationValid(isValid)}
          onSavingStatusChange={(isSaving: boolean) => setSaving(isSaving)}
        />)}
      </div>
    </>
  );
}