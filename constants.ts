

import { User, Role, Shift, Thread, Message, MessageType, Booking, ActivityItem } from './types';

// Users
export const USERS: Record<string, User> = {
  'me': { id: 'me', name: 'Alex Worker', role: Role.STAFF, avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop' },
  'steve': { id: 'steve', name: 'Steve Miller', role: Role.CLIENT, company: "Steve's Const", avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' },
  'sarah': { id: 'sarah', name: 'Sarah Jenkins', role: Role.CLIENT, company: "EventCo", avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  'ben': { id: 'ben', name: 'Ben Smith', role: Role.STAFF, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  'charlie': { id: 'charlie', name: 'Charlie Kim', role: Role.STAFF, avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=200&fit=crop' },
  'david': { id: 'david', name: 'David Lee', role: Role.STAFF, avatarUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop' },
  'admin': { id: 'admin', name: 'Connect Support', role: Role.ADMIN, avatarUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop' },
};

// Bookings
export const BOOKINGS: Record<string, Booking> = {
  'booking-george': { 
    id: 'booking-george', 
    title: 'George St - Concreting Phase', 
    clientId: 'steve', 
    staffCount: 5, // Increased to show gaps
    shifts: ['s1-a', 's1-b', 's1-c', 's1-d', 's2-a', 's2-b', 's2-c', 's2-d', 's3-a', 's3-b', 's3-c', 's3-d', 's-open-1', 's-open-2'] 
  },
  'booking-mascot': { 
    id: 'booking-mascot', 
    title: 'Mascot Event - Waitstaff', 
    clientId: 'sarah', 
    staffCount: 1, 
    shifts: ['s-mascot-1'] 
  },
  'booking-system': {
    id: 'booking-system',
    title: 'System',
    clientId: 'steve',
    staffCount: 0,
    shifts: []
  }
};

// Shifts: 4 Workers x 3 Days = 12 Shifts
const georgeShifts: Record<string, Shift> = {};
const days = ['Mon Oct 24', 'Tue Oct 25', 'Wed Oct 26'];
const staffKeys = ['me', 'ben', 'charlie', 'david'];

days.forEach((day, dayIdx) => {
  staffKeys.forEach((staffKey, staffIdx) => {
    const id = `s${dayIdx + 1}-${String.fromCharCode(97 + staffIdx)}`; // s1-a, s1-b...
    georgeShifts[id] = {
      id,
      title: 'General Labourer',
      date: day,
      time: '07:00 AM - 03:00 PM',
      location: '12 George St',
      status: dayIdx === 0 ? 'COMPLETED' : (dayIdx === 1 ? 'ACTIVE' : 'UPCOMING'),
      bookingId: 'booking-george',
      assignedTo: staffKey
    };
  });
});

// Add Unfilled Shifts
georgeShifts['s-open-1'] = { id: 's-open-1', title: 'General Labourer', date: 'Thu Oct 27', time: '07:00 AM - 03:00 PM', location: '12 George St', status: 'OPEN', bookingId: 'booking-george' };
georgeShifts['s-open-2'] = { id: 's-open-2', title: 'General Labourer', date: 'Fri Oct 28', time: '07:00 AM - 03:00 PM', location: '12 George St', status: 'OPEN', bookingId: 'booking-george' };


export const SHIFTS: Record<string, Shift> = {
  ...georgeShifts,
  's-mascot-1': { id: 's-mascot-1', title: 'Senior Waitstaff', date: 'Fri Oct 28', time: '05:00 PM', location: 'Mascot Terminal', status: 'UPCOMING', bookingId: 'booking-mascot', assignedTo: 'me' },
};

// Threads: 1 per [Booking + Staff]
export const THREADS: Record<string, Thread> = {
  // My thread for George St (covers all 3 of my shifts)
  't-me-george': { id: 't-me-george', bookingId: 'booking-george', clientId: 'steve', staffId: 'me', lastMessageId: 'msg-g-2', unreadCount: 1, isArchived: false },
  
  // Other workers' threads (for Client View)
  't-ben-george': { id: 't-ben-george', bookingId: 'booking-george', clientId: 'steve', staffId: 'ben', lastMessageId: 'msg-action-ben', unreadCount: 1, isArchived: false },
  't-charlie-george': { id: 't-charlie-george', bookingId: 'booking-george', clientId: 'steve', staffId: 'charlie', lastMessageId: 'msg-action-charlie', unreadCount: 1, isArchived: false },
  't-david-george': { id: 't-david-george', bookingId: 'booking-george', clientId: 'steve', staffId: 'david', lastMessageId: 'msg-sys-david', unreadCount: 0, isArchived: false },
  
  // My thread for Mascot
  't-me-mascot': { id: 't-me-mascot', bookingId: 'booking-mascot', clientId: 'sarah', staffId: 'me', lastMessageId: 'msg-m-1', unreadCount: 0, isArchived: false },

  // Admin / Support Thread
  't-admin-steve': { id: 't-admin-steve', bookingId: 'booking-system', clientId: 'steve', staffId: 'admin', lastMessageId: 'msg-admin-pay', unreadCount: 1, isArchived: false },
};

// Messages
export const INITIAL_MESSAGES: Message[] = [
  // Thread: Me @ George St
  { id: 'msg-g-0', threadId: 't-me-george', senderId: 'system', content: 'You have been assigned 3 shifts for George St.', timestamp: '2 days ago', type: MessageType.SYSTEM, isRead: true },
  { id: 'msg-g-1', threadId: 't-me-george', senderId: 'me', content: 'Hi Steve, confirm boots required?', timestamp: 'Yesterday', type: MessageType.TEXT, isRead: true },
  { id: 'msg-g-2', threadId: 't-me-george', senderId: 'steve', content: 'Yes, steel cap boots are mandatory.', timestamp: '09:20 AM', type: MessageType.TEXT, isRead: false },

  // Thread: Ben @ George St
  { id: 'msg-sys-ben', threadId: 't-ben-george', senderId: 'system', content: 'Shift 1 Completed.', timestamp: 'Yesterday', type: MessageType.SYSTEM, isRead: true },
  { 
    id: 'msg-action-ben', 
    threadId: 't-ben-george', 
    senderId: 'ben', 
    content: 'Timesheet submitted for approval.', 
    timestamp: '10:30 AM', 
    type: MessageType.ACTION, 
    isRead: false,
    actionData: {
      type: 'TIMESHEET',
      title: 'Timesheet Submitted',
      details: '8.0 Hours • Mon Oct 24',
      status: 'PENDING',
      shiftId: 's1-b' // Linked to Ben's Monday shift
    }
  },

  // Thread: Charlie @ George St
  { id: 'msg-sys-charlie', threadId: 't-charlie-george', senderId: 'charlie', content: 'I might be 10 mins late tomorrow.', timestamp: 'Yesterday', type: MessageType.TEXT, isRead: true },
  { 
    id: 'msg-action-charlie', 
    threadId: 't-charlie-george', 
    senderId: 'charlie', 
    content: 'Sick report filed.', 
    timestamp: '08:15 AM', 
    type: MessageType.ACTION, 
    isRead: false,
    actionData: {
      type: 'SICK',
      title: 'Sick Report',
      details: 'Shift #2 (Tue Oct 25)',
      status: 'PENDING',
      shiftId: 's2-c' // Linked to Charlie's Tuesday shift
    }
  },

  // Thread: Me @ Mascot
  { id: 'msg-m-1', threadId: 't-me-mascot', senderId: 'sarah', content: 'Menu has been updated, check attachment.', timestamp: 'Mon', type: MessageType.TEXT, isRead: true },

  // Thread: Admin @ Steve (Client)
  { 
    id: 'msg-admin-pay', 
    threadId: 't-admin-steve', 
    senderId: 'admin', 
    content: 'Invoice #4092 is due.', 
    timestamp: '11:00 AM', 
    type: MessageType.ACTION, 
    isRead: false,
    actionData: {
      type: 'PAYMENT',
      title: 'Invoice Due',
      details: 'Invoice #4092 • $1,250.00',
      status: 'PENDING',
    }
  },
];

// Activity Log (System Notifications)
export const BOOKING_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    bookingId: 'booking-george',
    type: 'INFO',
    title: 'Booking Created',
    description: 'Order received for 4x General Labourers.',
    timestamp: 'Oct 20 • 09:00 AM',
    icon: 'calendar'
  },
  {
    id: 'act-2',
    bookingId: 'booking-george',
    type: 'SUCCESS',
    title: 'Staff Assigned',
    description: 'System automatically matched 4 workers to 12 shifts.',
    timestamp: 'Oct 21 • 02:30 PM',
    icon: 'users'
  },
  {
    id: 'act-3',
    bookingId: 'booking-george',
    type: 'INFO',
    title: 'Shift Started',
    description: 'All 4 workers checked in for Day 1.',
    timestamp: 'Oct 24 • 07:05 AM',
    icon: 'clock'
  },
  {
    id: 'act-4',
    bookingId: 'booking-george',
    type: 'WARNING',
    title: 'Safety Broadcast Sent',
    description: 'Message regarding PPE sent to all 4 staff.',
    timestamp: 'Oct 24 • 08:15 AM',
    icon: 'megaphone'
  },
  {
    id: 'act-5',
    bookingId: 'booking-george',
    type: 'ERROR',
    title: 'Sick Report Filed',
    description: 'Charlie Kim reported sick for Shift #2.',
    timestamp: 'Oct 25 • 08:15 AM',
    icon: 'alert'
  }
];
