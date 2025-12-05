
export enum Role {
  STAFF = 'STAFF',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN', // New: System/Platform
}

export enum MessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
  BROADCAST = 'BROADCAST',
  ACTION = 'ACTION', // New: Requires intervention
}

export type ActionType = 'SICK' | 'TIMESHEET' | 'CANCELLATION' | 'PAYMENT' | 'DOCUMENT';

export interface ActionData {
  type: ActionType;
  title: string;
  details?: string;
  status: 'PENDING' | 'RESOLVED';
  metadata?: any;
  shiftId?: string; // Links action to a specific shift for UI context
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatarUrl: string;
  company?: string;
}

export interface Shift {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'ACTIVE' | 'COMPLETED' | 'UPCOMING' | 'CANCELLED' | 'OPEN';
  bookingId: string;
  assignedTo?: string; // userId of the staff member (Optional if OPEN)
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string; // 'system' or userId
  content: string;
  timestamp: string;
  type: MessageType;
  isRead: boolean;
  actionData?: ActionData; // New: Payload for action messages
}

export interface Thread {
  id: string;
  bookingId: string; // Primary scope: Project/Booking level
  shiftId?: string; // Optional: specific shift context if needed, but discouraged in new model
  clientId: string;
  staffId: string;
  lastMessageId?: string;
  unreadCount: number;
  isArchived: boolean;
}

export interface Booking {
  id: string;
  title: string;
  clientId: string;
  staffCount: number;
  shifts: string[]; // Shift IDs
}

export interface ActivityItem {
  id: string;
  bookingId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  description?: string;
  timestamp: string;
  icon?: string;
}

export type ViewState = 
  | { view: 'STAFF_INBOX' }
  | { view: 'STAFF_CHAT'; threadId: string }
  | { view: 'CLIENT_INBOX' }
  | { view: 'CLIENT_BOOKING_DETAIL'; bookingId: string };
