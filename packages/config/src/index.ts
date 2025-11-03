// ============ APP CONSTANTS ============

export const APP_NAME = 'Baleno San Zeno';
export const APP_DESCRIPTION = 'Sistema di gestione e prenotazione spazi';

// ============ API CONSTANTS ============

export const API_TIMEOUT = 30000; // 30 seconds
export const API_RETRY_ATTEMPTS = 3;

// ============ PAGINATION ============

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ============ DATE/TIME CONSTANTS ============

export const DEFAULT_TIMEZONE = 'Europe/Rome';
export const DEFAULT_LOCALE = 'it-IT';

export const BOOKING_TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
];

export const MIN_BOOKING_DURATION_HOURS = 1;
export const MAX_BOOKING_DURATION_HOURS = 8;
export const BOOKING_ADVANCE_DAYS = 90; // Massimo giorni di anticipo per prenotare

// ============ PRICING ============

export const DEFAULT_CURRENCY = 'EUR';
export const TAX_RATE = 0.22; // 22% IVA

// ============ FILE UPLOAD ============

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ============ VALIDATION RULES ============

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const PHONE_REGEX = /^[\d\s\-\+\(\)]+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============ FEATURES FLAGS ============

export const FEATURES = {
  OAUTH_GOOGLE: true,
  PUSH_NOTIFICATIONS: false, // Da implementare
  DARK_MODE: true,
  BOOKING_REMINDERS: true,
  AUTO_APPROVAL: false, // Se true, le prenotazioni sono auto-approvate
};

// ============ ROLES & PERMISSIONS ============

export const ROLE_HIERARCHY = {
  ADMIN: 3,
  COMMUNITY_MANAGER: 2,
  USER: 1,
};

export const PERMISSIONS = {
  // Users
  VIEW_ALL_USERS: ['ADMIN', 'COMMUNITY_MANAGER'],
  MANAGE_USERS: ['ADMIN'],
  UPDATE_USER_ROLES: ['ADMIN'],

  // Bookings
  VIEW_ALL_BOOKINGS: ['ADMIN', 'COMMUNITY_MANAGER'],
  APPROVE_BOOKINGS: ['ADMIN', 'COMMUNITY_MANAGER'],
  REJECT_BOOKINGS: ['ADMIN', 'COMMUNITY_MANAGER'],
  DELETE_ANY_BOOKING: ['ADMIN'],

  // Resources
  CREATE_RESOURCES: ['ADMIN'],
  UPDATE_RESOURCES: ['ADMIN', 'COMMUNITY_MANAGER'],
  DELETE_RESOURCES: ['ADMIN'],

  // Payments
  VIEW_ALL_PAYMENTS: ['ADMIN', 'COMMUNITY_MANAGER'],
  PROCESS_REFUNDS: ['ADMIN', 'COMMUNITY_MANAGER'],

  // Reports
  VIEW_REPORTS: ['ADMIN', 'COMMUNITY_MANAGER'],
};

// ============ NOTIFICATION TEMPLATES ============

export const EMAIL_TEMPLATES = {
  BOOKING_CONFIRMATION: {
    subject: 'Conferma Prenotazione - {{title}}',
    template: 'booking-confirmation',
  },
  BOOKING_APPROVED: {
    subject: 'Prenotazione Approvata - {{title}}',
    template: 'booking-approved',
  },
  BOOKING_REJECTED: {
    subject: 'Prenotazione Rifiutata - {{title}}',
    template: 'booking-rejected',
  },
  BOOKING_CANCELLED: {
    subject: 'Prenotazione Cancellata - {{title}}',
    template: 'booking-cancelled',
  },
  PAYMENT_SUCCESS: {
    subject: 'Pagamento Confermato - Ricevuta',
    template: 'payment-success',
  },
  PAYMENT_REFUND: {
    subject: 'Rimborso Processato',
    template: 'payment-refund',
  },
};

// ============ STATUS LABELS (i18n) ============

export const BOOKING_STATUS_LABELS = {
  PENDING: 'In Attesa',
  APPROVED: 'Approvata',
  REJECTED: 'Rifiutata',
  CANCELLED: 'Cancellata',
  COMPLETED: 'Completata',
};

export const PAYMENT_STATUS_LABELS = {
  PENDING: 'In Attesa',
  PROCESSING: 'In Elaborazione',
  SUCCEEDED: 'Completato',
  FAILED: 'Fallito',
  REFUNDED: 'Rimborsato',
  PARTIALLY_REFUNDED: 'Rimborsato Parzialmente',
};

export const RESOURCE_TYPE_LABELS = {
  ROOM: 'Sala',
  SPACE: 'Spazio',
  EQUIPMENT: 'Attrezzatura',
  SERVICE: 'Servizio',
};

export const USER_ROLE_LABELS = {
  ADMIN: 'Amministratore',
  COMMUNITY_MANAGER: 'Community Manager',
  USER: 'Utente',
};
