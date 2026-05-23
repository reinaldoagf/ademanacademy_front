// src/app/(dashboard)/tienda/page.tsx
"use client";

import { useState } from "react";
import HeroSection from "@/components/layout/HeroSection";
import {
  ShoppingBag,
  Search,
  Tag,
  Plus,
  PackageCheck,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  Layers,
  Sparkles,
} from "lucide-react";

interface ProductoTienda {
  id: string;
  nombre: string;
  categoria: "Calzado" | "Ropa de Práctica" | "Accesorios" | "Snacks";
  precioVenta: number;
  costo: number;
  stockActual: number;
  stockMinimoAlert: number; // Umbral para disparar alerta de escasez
}

const DEMO_INVENTARIO: ProductoTienda[] = [
  {
    id: "PROD-01",
    nombre: "Zapatillas Media Punta Lona",
    categoria: "Calzado",
    precioVenta: 22,
    costo: 11,
    stockActual: 24,
    stockMinimoAlert: 5,
  },
  {
    id: "PROD-02",
    nombre: "Leotardo Negro Omagie Oficial",
    categoria: "Ropa de Práctica",
    precioVenta: 35,
    costo: 18,
    stockActual: 3,
    stockMinimoAlert: 8,
  },
  {
    id: "PROD-03",
    nombre: "Medias de Ballet Convertibles Pink",
    categoria: "Ropa de Práctica",
    precioVenta: 12,
    costo: 5,
    stockActual: 40,
    stockMinimoAlert: 10,
  },
  {
    id: "PROD-04",
    nombre: "Bolso de Lona Escenario Mediano",
    categoria: "Accesorios",
    precioVenta: 28,
    costo: 14,
    stockActual: 0,
    stockMinimoAlert: 4,
  },
  {
    id: "PROD-05",
    nombre: "Termo de Agua Aluminio Antiderrame",
    categoria: "Accesorios",
    precioVenta: 15,
    costo: 7,
    stockActual: 18,
    stockMinimoAlert: 5,
  },
];

export default function TiendaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("Todos");

  // Configuración de los botones superiores en nuestro HeroSection dinámico
  const accionesTienda = [
    {
      label: "Ingresar Lote / Producto",
      onClick: () => console.log("Abriendo modal de carga de stock..."),
      icon: <Plus className="w-4 h-4" />,
      variant: "secondary" as const,
    },
    {
      label: "Registrar Venta Rápida →",
      onClick: () => console.log("Abriendo pasarela de venta..."),
      icon: <ShoppingCart className="w-4 h-4" />,
      variant: "primary" as const,
    },
  ];

  // Filtrado de catálogo
  const filteredProductos = DEMO_INVENTARIO.filter((prod) => {
    const matchesSearch =
      prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = catFilter === "Todos" || prod.categoria === catFilter;
    return matchesSearch && matchesCat;
  });

  // Cálculos financieros y de almacén exprés
  const valorInventario = DEMO_INVENTARIO.reduce(
    (acc, curr) => acc + curr.stockActual * curr.costo,
    0,
  );
  const productosAgotados = DEMO_INVENTARIO.filter(
    (p) => p.stockActual === 0,
  ).length;
  const productosBajoStock = DEMO_INVENTARIO.filter(
    (p) => p.stockActual > 0 && p.stockActual <= p.stockMinimoAlert,
  ).length;

  return (
    <>
      {/* HERO SECTION DE LA SECCIÓN */}
      <HeroSection
        htmlTitle={`Tienda de la Academia e <em class="text-[#5e0472]">Inventario</em>`}
        htmlSubTitle="Administra los productos en exhibición, calcula el valor de tus activos en almacén y registra ventas de uniforme rápido."
        actions={accionesTienda}
      />

      <div className="p-4 md:p-8 w-full overflow-y-auto space-y-6">
        {/* METRICAS DE RENDIMIENTO DE LA TIENDA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Valor de Activos */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                          Capital en Almacén
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                          ${valorInventario.toLocaleString()}
                        </h4>
                        <p className="font-questrial text-xs text-gray-500">
                          Costo total acumulado de las existencias.
                        </p>
                      </div>
                    </div>

          {/* Alertas de Reabastecimiento */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 flex items-center justify-center text-amber-600">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                          Por Agotarse (Bajo Mínimo)
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                          {productosBajoStock} Artículos
                        </h4>
                        <p className="font-questrial text-xs text-gray-500">
                          Requieren reordenar con el proveedor.
                        </p>
                      </div>
                    </div>
          {/* Quiebres de Stock */}
          <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                      <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600">
                        <PackageCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">
                          Agotados Totalmente
                        </p>
                        <h4 className="text-xl font-anton text-gray-800">
                          {productosAgotados} Variantes
                        </h4>
              <span className="text-[10px] bg-pink-50 text-pink-600 font-bold px-2 py-0.5 inline-flex items-center gap-0.5">
                Quiebre de stock activo
              </span>
                      </div>
                    </div>

        </div>

        {/* FILTROS DE CATEGORÍAS */}

        <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código o descripción de producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 font-questrial border border-purple-100 text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 justify-end">
            {["Todos", "Calzado", "Ropa de Práctica", "Accesorios"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-questrial font-semibold transition cursor-pointer whitespace-nowrap ${
                    catFilter === cat
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-white border border-purple-50 text-gray-400 hover:text-purple-600"
                  }`}
                >
                  {cat}
                </button>
              ),
            )}
          </div>
        </div>

        {/* GRILLA DE CATÁLOGO / PRODUCTOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProductos.length > 0 ? (
            filteredProductos.map((producto) => {
              const isOut = producto.stockActual === 0;
              const isLow =
                !isOut && producto.stockActual <= producto.stockMinimoAlert;
              const margenGanancia = Math.round(
                ((producto.precioVenta - producto.costo) /
                  producto.precioVenta) *
                  100,
              );

              return (
                <div
                  key={producto.id}
                  className="glass-card p-5 shadow-sm border border-purple-50/60 flex flex-col justify-between hover:shadow-md transition bg-white"
                >
                  <div>
                    {/* Categoría y Código */}
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium mb-2">
                      <span className="font-questrial">{producto.id}</span>
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 font-questrial font-semibold">
                        {producto.categoria}
                      </span>
                    </div>

                    {/* Nombre y Margen */}
                    <div className="space-y-1">
                      <h3 className="font-anton text-gray-800 text-sm line-clamp-2 min-h-[40px]">
                        {producto.nombre}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-questrial font-bold bg-emerald-50/50 px-2 py-0.5 w-fit">
                        <TrendingUp className="w-3 h-3" /> Margen:{" "}
                        {margenGanancia}%
                      </div>
                    </div>

                    {/* Precios Financieros */}
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl my-4 text-xs">
                      <div>
                        <p className="text-gray-400 text-[9px] font-questrial font-bold uppercase">
                          Costo Base
                        </p>
                        <p className="font-questrial font-semibold text-gray-600">
                          ${producto.costo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 text-[9px] font-questrial font-bold uppercase">
                          Precio de Venta
                        </p>
                        <p className="font-questrial font-extrabold text-purple-700 text-sm">
                          ${producto.precioVenta}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status de Almacén e Indicador */}
                  <div className="space-y-2 border-t border-purple-50/50 pt-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-questrial font-medium">
                        Existencia disponible
                      </span>
                      <span
                        className={`font-questrial font-bold ${isOut ? "text-pink-600" : isLow ? "text-amber-500" : "text-gray-700"}`}
                      >
                        {producto.stockActual} Unidades
                      </span>
                    </div>

                    {/* Barra de progreso visual */}
                    <div className="w-full bg-gray-100 h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOut
                            ? "w-0"
                            : isLow
                              ? "bg-amber-400 w-1/4"
                              : "gradient-purple w-full"
                        }`}
                      ></div>
                    </div>

                    {/* Alertas semánticas breves */}
                    {isOut ? (
                      <p className="text-[10px] text-pink-600 font-questrial font-semibold flex items-center gap-1">
                        ⚠️ Agotado. Detener ventas en taquilla.
                      </p>
                    ) : isLow ? (
                      <p className="text-[10px] text-amber-600 font-questrial font-semibold flex items-center gap-1">
                        ⚠️ Alerta. Reposición necesaria (mínimo:{" "}
                        {producto.stockMinimoAlert}).
                      </p>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-questrial font-semibold flex items-center gap-1">
                        ✓ Stock en rango seguro de distribución.
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-xs text-gray-400 border border-dashed border-purple-100 rounded-3xl bg-white/20">
              Ningún ítem coincide con los criterios de búsqueda comerciales.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
