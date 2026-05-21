// src/app/(dashboard)/pagos/page.tsx
"use client";

import { useState } from "react";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Search, 
  TrendingUp,
  FileText,
  CreditCard,
  CircleDollarSign,
  AlertCircle
} from "lucide-react";
import HeroSection from '@/components/layout/HeroSection';

interface Transaccion {
  id: string;
  alumno: string;
  concepto: "Mensualidad" | "Matrícula" | "Uniforme" | "Entradas Gala";
  monto: number;
  metodo: "Transferencia" | "Tarjeta" | "Efectivo" | "Pago Móvil";
  fecha: string;
  estado: "Aprobado" | "Pendiente";
}

const DEMO_TRANSACCIONES: Transaccion[] = [
  { id: "TX-901", alumno: "Valeria Villalobos", concepto: "Mensualidad", monto: 45, metodo: "Pago Móvil", fecha: "2026-05-21", estado: "Aprobado" },
  { id: "TX-902", alumno: "Lucas López", concepto: "Mensualidad", monto: 45, metodo: "Tarjeta", fecha: "2026-05-21", estado: "Aprobado" },
  { id: "TX-903", alumno: "Emma Gómez", concepto: "Uniforme", monto: 25, metodo: "Efectivo", fecha: "2026-05-20", estado: "Aprobado" },
  { id: "TX-904", alumno: "Matías Rodríguez", concepto: "Mensualidad", monto: 45, metodo: "Transferencia", fecha: "2026-05-19", estado: "Pendiente" },
  { id: "TX-905", alumno: "Camila Fuentes", concepto: "Entradas Gala", monto: 60, metodo: "Tarjeta", fecha: "2026-05-18", estado: "Aprobado" },
];

export default function PagosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterConcepto, setFilterConcepto] = useState("Todos");
  const [transacciones, setTransacciones] = useState<Transaccion[]>(DEMO_TRANSACCIONES);

  // Filtrado de historial
  const filteredTx = transacciones.filter((tx) => {
    const matchesSearch = tx.alumno.toLowerCase().includes(searchTerm.toLowerCase()) || tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesConcepto = filterConcepto === "Todos" || tx.concepto === filterConcepto;
    return matchesSearch && matchesConcepto;
  });

  // Métricas financieras calculadas dinámicamente
  const ingresosMes = 6450;
  const porCobrar = 1120;
  const cajaChica = 340;

  const handleNewElement = async () => {
    console.log('handleNewElement')
  }

  return (
    <>
                
      {/* SUB-TOPBAR (Saludos y Acción rápida) */}
      <HeroSection 
        htmlTitle={`Caja y Flujo de <em class="text-[#5e0472]">Pagos</em>`}
        htmlSubTitle={`Administra las recaudaciones diarias, mensualidades de alumnos e ingresos por tienda.`}
        actionLabel={"Registrar Ingreso a Caja →"}
        isActionDisabled={false}
        onAction={handleNewElement}
      />

        <div className="p-4 md:p-8  max-w-7xl mx-auto w-full overflow-y-auto space-y-6">
        {/* REPORTE FINANCIERO EXPRESS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Recaudado */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 flex items-center justify-center text-[#5e0472]">
                    <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Recaudación de Mayo</p>
                    <h4 className="text-xl font-anton text-gray-800">${ingresosMes.toLocaleString()}</h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 inline-flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +12% vs mes anterior
                    </span>
                </div>
            </div>



            {/* Cuentas por Cobrar */}
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-pink-100 flex items-center justify-center text-pink-600 ">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Cuentas por Cobrar</p>
                    <h4 className="text-xl font-anton text-gray-800">${porCobrar.toLocaleString()}</h4>
                    <p className="font-questrial text-xs text-gray-500">Alumnos con mensualidad vencida.</p>
                </div>
            </div>

            {/* Caja Chica */}
            
            <div className="glass-card shadow-sm p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Wallet className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-gray-400 text-[11px] font-questrial font-semibold uppercase tracking-wider">Efectivo en Caja</p>
                    <h4 className="text-xl font-anton text-gray-800">${cajaChica.toLocaleString()}</h4>
                    <p className="font-questrial text-xs text-gray-500">Monto disponible para gastos locales.</p>
                </div>
            </div>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="glass-card p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
                type="text" 
                placeholder="Buscar por bailarín o nro de recibo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-purple-100 font-questrial text-xs bg-white/50 focus:outline-none focus:border-purple-400 transition text-gray-700"
            />
            </div>

            <select
                value={filterConcepto}
                onChange={(e) => setFilterConcepto(e.target.value)}
              className="p-2 w-full sm:w-auto border border-purple-100 font-questrial text-xs bg-white text-gray-700 focus:outline-none"
            >
                <option value="Todos">Todos los conceptos</option>
                <option value="Mensualidad">Mensualidades</option>
                <option value="Matrícula">Matrículas</option>
                <option value="Uniforme">Tienda / Uniformes</option>
                <option value="Entradas Gala">Entradas de Eventos</option>
            </select>
        </div>

        {/* TABLA HISTORIAL DE AUDITORÍA */}
        <div className="glass-card p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4 font-questrial">Últimos Movimientos de Caja</h3>
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                <tr className="text-gray-400 border-b border-purple-50 font-questrial">
                    <th className="pb-3 font-semibold">ID Recibo</th>
                    <th className="pb-3 font-semibold">Bailarín</th>
                    <th className="pb-3 font-semibold">Concepto</th>
                    <th className="pb-3 font-semibold">Método</th>
                    <th className="pb-3 font-semibold">Fecha</th>
                    <th className="pb-3 font-semibold">Monto</th>
                    <th className="pb-3 font-semibold text-right">Estado</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-purple-50/50">
                {filteredTx.length > 0 ? (
                    filteredTx.map((tx) => (
                    <tr key={tx.id} className="text-gray-700 hover:bg-purple-50/20 transition font-questrial">
                        {/* ID */}
                        <td className="py-3.5 font-mono text-xs text-gray-400">{tx.id}</td>
                        
                        {/* Alumno */}
                        <td className="py-3.5 font-bold text-gray-800">{tx.alumno}</td>
                        
                        {/* Concepto */}
                        <td className="py-3.5 text-xs font-semibold">
                        <span className={`px-2 py-0.5 ${
                            tx.concepto === "Mensualidad" ? "bg-purple-50 text-purple-700" :
                            tx.concepto === "Uniforme" ? "bg-pink-50 text-pink-700" :
                            "bg-indigo-50 text-indigo-700"
                        }`}>
                            {tx.concepto}
                        </span>
                        </td>

                        {/* Método de pago */}
                        <td className="py-3.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-gray-400" /> {tx.metodo}
                        </span>
                        </td>

                        {/* Fecha */}
                        <td className="py-3.5 text-xs text-gray-400 font-medium">{tx.fecha}</td>

                        {/* Monto */}
                        <td className="py-3.5 font-bold text-gray-800">${tx.monto}</td>

                        {/* Estado */}
                        <td className="py-3.5 text-right">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 ${
                            tx.estado === "Aprobado" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}>
                            {tx.estado}
                        </span>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-gray-400">
                        No se registraron transacciones con los criterios seleccionados.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
      </div>
    </>
  );
}