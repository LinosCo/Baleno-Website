import { format, formatDistance, formatDuration, intervalToDuration } from 'date-fns';
import { it } from 'date-fns/locale';

// ============ DATE UTILS ============

export function formatDate(date: Date | string, formatString: string = 'PPP'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatString, { locale: it });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'PPP p', { locale: it });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'HH:mm', { locale: it });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true, locale: it });
}

export function calculateDuration(start: Date | string, end: Date | string): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  const duration = intervalToDuration({ start: startDate, end: endDate });
  return formatDuration(duration, { locale: it });
}

export function calculateHours(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;

  const diffInMs = endDate.getTime() - startDate.getTime();
  return diffInMs / (1000 * 60 * 60);
}

// ============ CURRENCY UTILS ============

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function calculatePrice(pricePerHour: number, hours: number): number {
  return pricePerHour * hours;
}

// ============ STRING UTILS ============

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ============ VALIDATION UTILS ============

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 9;
}

// ============ ARRAY UTILS ============

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// ============ BOOKING UTILS ============

export function isBookingOverlapping(
  booking1: { startTime: Date | string; endTime: Date | string },
  booking2: { startTime: Date | string; endTime: Date | string },
): boolean {
  const start1 = typeof booking1.startTime === 'string' ? new Date(booking1.startTime) : booking1.startTime;
  const end1 = typeof booking1.endTime === 'string' ? new Date(booking1.endTime) : booking1.endTime;
  const start2 = typeof booking2.startTime === 'string' ? new Date(booking2.startTime) : booking2.startTime;
  const end2 = typeof booking2.endTime === 'string' ? new Date(booking2.endTime) : booking2.endTime;

  return start1 < end2 && start2 < end1;
}

export function getBookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'yellow',
    APPROVED: 'green',
    REJECTED: 'red',
    CANCELLED: 'gray',
    COMPLETED: 'blue',
  };
  return colors[status] || 'gray';
}

export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'yellow',
    PROCESSING: 'blue',
    SUCCEEDED: 'green',
    FAILED: 'red',
    REFUNDED: 'purple',
    PARTIALLY_REFUNDED: 'orange',
  };
  return colors[status] || 'gray';
}
