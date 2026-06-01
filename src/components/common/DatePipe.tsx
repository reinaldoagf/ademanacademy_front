// components/DatePipe.tsx
interface DatePipeProps {
    value: string | Date | number;
    format?: 'short' | 'long' | 'custom';
}

export default function DatePipe({ value, format = 'short' }: DatePipeProps) {
    const date = new Date(value);

    // Fallback for invalid dates
    if (isNaN(date.getTime())) return <span>Invalid Date</span>;

    // Emulate Angular-like predefined options
    const options: Intl.DateTimeFormatOptions =
        format === 'long'
            ? { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
            : { year: 'numeric', month: '2-digit', day: '2-digit' };

    // Explicitly set locale (e.g., 'en-US') to prevent hydration mismatches
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

    return <time dateTime={date.toISOString()}>{formattedDate}</time>;
}