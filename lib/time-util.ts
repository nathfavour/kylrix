/**
 * Light-weight time utilities to replace date-fns.
 * Reduces bundle size by using native Intl.DateTimeFormat and Math.
 */

export function isValidDate(date: any): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
}

export function toDate(value: string | number | Date | null | undefined): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return isValidDate(date) ? date : null;
}

const DEFAULT_TIME_FORMAT: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
};

export function formatTime(date: Date | string | number, options: Intl.DateTimeFormatOptions = DEFAULT_TIME_FORMAT): string {
    const d = typeof date === 'object' ? date : new Date(date);
    if (!isValidDate(d)) return '';
    return new Intl.DateTimeFormat('en-US', options).format(d);
}

export function formatDistanceToNow(date: Date | string | number): string {
    const d = typeof date === 'object' ? date : new Date(date);
    if (!isValidDate(d)) return '';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    const absDiff = Math.abs(diffInSeconds);

    if (absDiff < 60) return 'just now';
    
    const minutes = Math.floor(absDiff / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(months / 12);
    return `${years}y ago`;
}

export function isToday(date: Date | string | number): boolean {
    const d = typeof date === 'object' ? date : new Date(date);
    const now = new Date();
    return d.getDate() === now.getDate() &&
           d.getMonth() === now.getMonth() &&
           d.getFullYear() === now.getFullYear();
}

export function isTomorrow(date: Date | string | number): boolean {
    const d = typeof date === 'object' ? date : new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getDate() === tomorrow.getDate() &&
           d.getMonth() === tomorrow.getMonth() &&
           d.getFullYear() === tomorrow.getFullYear();
}

export function isThisWeek(date: Date | string | number): boolean {
    const d = typeof date === 'object' ? date : new Date(date);
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return d >= startOfWeek && d <= endOfWeek;
}

export function isPast(date: Date | string | number): boolean {
    const d = typeof date === 'object' ? date : new Date(date);
    return d.getTime() < Date.now();
}
