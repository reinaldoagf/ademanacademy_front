// components/DatePipe.tsx
interface DatePipeProps {
    value: string | Date | number;
    format?: 'short' | 'long' | 'custom';
}

export default function DatePipe({ value, format = 'short' }: DatePipeProps) {
    const date = new Date(value);

    // Fallback para fechas inválidas
    if (isNaN(date.getTime())) return <span>Invalid Date</span>;

    let formattedDate = '';

    if (format === 'long') {
        // Formato largo en inglés con soporte UTC
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            timeZone: 'UTC',
        };
        formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
    } else {
        // 🌟 Formato YYYY/MM/DD estricto utilizando métodos UTC para evitar saltos de día
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        formattedDate = `${year}/${month}/${day}`;
    }

    return <time dateTime={date.toISOString()}>{formattedDate}</time>;
}