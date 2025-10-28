// ============ ENUMS ============

export enum UserRole {
  ADMIN = 'ADMIN',
  COMMUNITY_MANAGER = 'COMMUNITY_MANAGER',
  USER = 'USER',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum ResourceType {
  ROOM = 'ROOM',
  SPACE = 'SPACE',
  EQUIPMENT = 'EQUIPMENT',
  SERVICE = 'SERVICE',
}

export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_APPROVED = 'BOOKING_APPROVED',
  BOOKING_REJECTED = 'BOOKING_REJECTED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REFUND_PROCESSED = 'REFUND_PROCESSED',
  REMINDER = 'REMINDER',
}

// ============ TYPES ============

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  googleId?: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface Resource {
  id: string;
  name: string;
  description?: string;
  type: ResourceType;
  capacity?: number;
  pricePerHour: number;
  isActive: boolean;
  images: string[];
  amenities: string[];
  rules?: string;
  location?: string;
  floor?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  user?: User;
  resourceId: string;
  resource?: Resource;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  approvedBy?: string;
  approver?: User;
  approvedAt?: Date;
  rejectedBy?: string;
  rejector?: User;
  rejectedAt?: Date;
  rejectionReason?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  title: string;
  description?: string;
  attendees?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  bookingId: string;
  booking?: Booking;
  userId: string;
  user?: User;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeRefundId?: string;
  receiptUrl?: string;
  refundedAmount?: number;
  refundedAt?: Date;
  refundReason?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  user?: User;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  emailSent: boolean;
  emailSentAt?: Date;
  metadata?: any;
  createdAt: Date;
}

// ============ DTOs ============

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreateBookingDto {
  resourceId: string;
  startTime: Date | string;
  endTime: Date | string;
  title: string;
  description?: string;
  attendees?: number;
  notes?: string;
}

export interface UpdateBookingDto {
  startTime?: Date | string;
  endTime?: Date | string;
  title?: string;
  description?: string;
  attendees?: number;
  notes?: string;
}

export interface CreateResourceDto {
  name: string;
  description?: string;
  type: ResourceType;
  capacity?: number;
  pricePerHour: number;
  images?: string[];
  amenities?: string[];
  rules?: string;
  location?: string;
  floor?: string;
}

// ============ API RESPONSES ============

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: any;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  totalRevenue: number;
  totalUsers: number;
  activeResources: number;
  recentBookings: Booking[];
}
