export const formatDateForInput = (dateInput?: Date | string | null): string => {
    if (!dateInput) return "";

    // Si viene como string ISO o Date, se extraen los primeros 10 caracteres (YYYY-MM-DD)
    if (typeof dateInput === "string") {
        return dateInput.split("T")[0];
    }

    if (dateInput instanceof Date) {
        return dateInput.toISOString().split("T")[0];
    }

    return "";
};