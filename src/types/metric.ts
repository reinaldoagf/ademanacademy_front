export interface DashboardMetricsResponse {
    incomeByConcept: {
        lockerRoom: number;
        storeSales: number;
        tuition: number;
        monthlyPayments: number;
        customClasses: number;
        specialEvents: number;
    };
    activePreInscriptions: number;
    borrowedCostumes: number;
}

export interface RevenueByCategoryResponse {
    lockerRoom: number;
    storeSales: number;
    tuition: number;
    monthlyPayments: number;
    customClasses: number;
    specialEvents: number;
}