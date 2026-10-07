export interface BalanceChartPoint {
    label: string; // ej. "Semana 1", "Semana 2", etc.
    recaudado: number;
    cuentasPorCobrar: number;
}

export interface BalanceChartData {
    monthName: string; // ej. "Mayo 2026"
    labels: string[];
    recaudadoData: number[];
    cuentasPorCobrarData: number[];
}

export interface BalanceChartResponse {
    success: boolean;
    data?: BalanceChartData;
    error?: string;
}

export interface BalanceChartProps {
    chartData?: BalanceChartData | null;
    isLoading?: boolean;
}