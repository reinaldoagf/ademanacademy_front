// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Spinner animado morado */}
      <div className="w-12 h-12 border-4 border-purple-200 border-t-[#5e0472] rounded-full animate-spin"></div>
      <p className="mt-4 text-sm font-questrial font-semibold text-[#5e0472] tracking-wide animate-pulse">
        Cargando Ademan Dashboard...
      </p>
    </div>
  );
}