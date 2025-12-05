import React, { useState } from 'react';
import { Search, Plus, Briefcase, ChevronRight, Megaphone, Users, AlertTriangle, Shield, LayoutGrid, Filter } from 'lucide-react';
import { Booking, Message, Thread, MessageType } from '../types';
import { USERS, SHIFTS } from '../constants';
import { Avatar } from '../components/Avatar';

interface ClientInboxProps {
  bookings: Booking[];
  threads: Record<string, Thread>;
  messages: Message[];
  adminThread?: Thread;
  onSelectBooking: (bookingId: string) => void;
  onSelectThread: (threadId: string) => void;
}

type ScopeType = 'ALL' | 'PROJECTS' | 'SYSTEM';
type FilterType = 'ALL' | 'UNREAD' | 'ACTION';

export const ClientInbox: React.FC<ClientInboxProps> = ({ 
  bookings, 
  threads,
  messages,
  adminThread,
  onSelectBooking,
  onSelectThread
}) => {
  const [activeScope, setActiveScope] = useState<ScopeType>('ALL');
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  // --- Helper Logic ---

  const getThreadLatestMsg = (t: Thread) => messages.find(m => m.id === t.lastMessageId);

  // Analyze a booking to see if it has pending actions or unreads
  const analyzeBooking = (booking: Booking) => {
    const bookingThreads = Object.values(threads).filter((t: Thread) => t.bookingId === booking.id);
    const totalUnread = bookingThreads.reduce((acc, t) => acc + t.unreadCount, 0);
    
    let latestMsg: Message | undefined;
    let hasPendingAction = false;
    let isUrgentAction = false;

    bookingThreads.forEach(t => {
      const msg = messages.find(m => m.id === t.lastMessageId);
      if (!latestMsg || (msg && msg.id > latestMsg.id)) { 
        latestMsg = msg;
      }
      if (msg?.type === MessageType.ACTION && msg.actionData?.status === 'PENDING') {
        hasPendingAction = true;
        if (msg.actionData.type === 'SICK' || msg.actionData.type === 'CANCELLATION') {
          isUrgentAction = true;
        }
      }
    });

    const activeShiftsCount = booking.shifts.filter(sid => SHIFTS[sid].status === 'ACTIVE').length;

    return { totalUnread, latestMsg, activeShiftsCount, hasPendingAction, isUrgentAction };
  };

  // Analyze admin thread
  const analyzeAdmin = () => {
    if (!adminThread) return null;
    const lastMsg = getThreadLatestMsg(adminThread);
    const hasPendingAction = lastMsg?.type === MessageType.ACTION && lastMsg.actionData?.status === 'PENDING';
    const isUrgent = false; // Admin tasks usually financial/doc, not safety urgent
    return { lastMsg, hasPendingAction, isUrgent, unreadCount: adminThread.unreadCount };
  };

  const adminStats = analyzeAdmin();

  // --- Filtering Logic ---

  // 1. Filter Bookings based on Scope AND Status
  const filteredBookings = bookings.filter(b => {
    if (b.id === 'booking-system') return false; // Handled separately
    
    // Scope Check
    if (activeScope === 'SYSTEM') return false;

    // Status Check
    const stats = analyzeBooking(b);
    if (activeFilter === 'UNREAD') return stats.totalUnread > 0;
    if (activeFilter === 'ACTION') return stats.hasPendingAction;
    return true;
  });

  // 2. Filter Admin based on Scope AND Status
  const showAdminThread = adminThread && (
    (activeScope === 'ALL' || activeScope === 'SYSTEM') &&
    (
      activeFilter === 'ALL' || 
      (activeFilter === 'UNREAD' && adminStats && adminStats.unreadCount > 0) ||
      (activeFilter === 'ACTION' && adminStats && adminStats.hasPendingAction)
    )
  );

  // Counts for Badges (Global, irrelevant of scope for the badge itself, but useful for context)
  const actionCount = bookings.filter(b => analyzeBooking(b).hasPendingAction).length + (adminStats?.hasPendingAction ? 1 : 0);
  const unreadCount = bookings.filter(b => analyzeBooking(b).totalUnread > 0).length + (adminStats?.unreadCount && adminStats.unreadCount > 0 ? 1 : 0);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-zinc-900">Inbox</h1>
        <button className="p-2 text-brand-600 bg-brand-50 rounded-full hover:bg-brand-100 transition-colors">
          <Plus size={24} />
        </button>
      </div>

      {/* Search & Filters */}
      <div className="px-5 pb-4 space-y-4 bg-white border-b border-zinc-100 shadow-sm">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* Primary Filter: Scope (Segmented Control) */}
        <div className="flex p-1 bg-zinc-100 rounded-xl">
          <button 
            onClick={() => setActiveScope('ALL')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeScope === 'ALL' 
                ? 'bg-white text-zinc-900 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <LayoutGrid size={14} /> All
          </button>
          <button 
            onClick={() => setActiveScope('PROJECTS')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeScope === 'PROJECTS' 
                ? 'bg-white text-zinc-900 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Briefcase size={14} /> Projects
          </button>
          <button 
            onClick={() => setActiveScope('SYSTEM')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeScope === 'SYSTEM' 
                ? 'bg-white text-zinc-900 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Shield size={14} /> System
          </button>
        </div>

        {/* Secondary Filter: Status (Chips) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1 mr-1">
            <Filter size={12} /> Filter:
          </span>
          
          <button 
            onClick={() => setActiveFilter(activeFilter === 'ACTION' ? 'ALL' : 'ACTION')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
              activeFilter === 'ACTION' 
                ? 'bg-red-50 text-red-600 border-red-200 ring-1 ring-red-100' 
                : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Action Required
            {actionCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeFilter === 'ACTION' ? 'bg-red-200 text-red-700' : 'bg-red-100 text-red-600'}`}>
                {actionCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveFilter(activeFilter === 'UNREAD' ? 'ALL' : 'UNREAD')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
              activeFilter === 'UNREAD' 
                ? 'bg-blue-50 text-blue-600 border-blue-200 ring-1 ring-blue-100' 
                : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeFilter === 'UNREAD' ? 'bg-blue-200 text-blue-700' : 'bg-blue-100 text-blue-600'}`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        
        {/* Empty State */}
        {!showAdminThread && filteredBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
             <Briefcase size={32} className="mb-2 opacity-50" />
             <p className="text-sm">No results found</p>
             <button onClick={() => { setActiveScope('ALL'); setActiveFilter('ALL'); }} className="mt-4 text-xs font-semibold text-brand-600 hover:underline">
               Clear Filters
             </button>
          </div>
        )}

        {/* Group: System */}
        {showAdminThread && adminThread && (
          <div className="mb-2">
            {activeScope === 'ALL' && (
              <div className="px-5 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-2 bg-zinc-50/50">
                System & Alerts
              </div>
            )}
            {(() => {
              const { lastMsg, hasPendingAction } = adminStats!;
              return (
                <div 
                  className={`group flex items-start p-5 hover:bg-indigo-50/50 transition-colors cursor-pointer active:bg-indigo-50 border-b border-zinc-50 ${hasPendingAction && activeFilter === 'ACTION' ? 'bg-indigo-50/30' : ''}`}
                  onClick={() => onSelectThread(adminThread.id)}
                >
                  <div className="mr-4 pt-1">
                    <Avatar 
                      src={USERS['admin'].avatarUrl} 
                      alt="Connect Support" 
                      badgeIcon="shield" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-base font-bold text-zinc-900">Connect Support</h3>
                      <span className="text-xs font-medium text-indigo-500">{lastMsg?.timestamp}</span>
                    </div>
                    <p className={`text-sm truncate ${adminThread.unreadCount > 0 || hasPendingAction ? 'font-semibold text-zinc-900' : 'text-zinc-500'}`}>
                      {hasPendingAction ? (
                         <span className="text-indigo-600 font-bold flex items-center gap-1">
                           {lastMsg?.actionData?.type === 'PAYMENT' ? '💳' : '⚠️'} Action Required: {lastMsg?.content}
                         </span>
                      ) : (
                         lastMsg?.content
                      )}
                    </p>
                  </div>
                  {adminThread.unreadCount > 0 && (
                    <div className="ml-3 mt-2">
                       <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Group: Projects */}
        {filteredBookings.length > 0 && (
          <div>
            {activeScope === 'ALL' && (
              <div className="px-5 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
                Active Projects
              </div>
            )}
            {filteredBookings.map(booking => {
              const { totalUnread, latestMsg, activeShiftsCount, hasPendingAction, isUrgentAction } = analyzeBooking(booking);
              
              return (
                <div 
                  key={booking.id} 
                  className={`group flex items-start p-5 hover:bg-zinc-50 transition-colors cursor-pointer active:bg-zinc-100 border-b border-zinc-50 last:border-0 ${hasPendingAction && activeFilter === 'ACTION' ? 'bg-red-50/10' : ''}`}
                  onClick={() => onSelectBooking(booking.id)}
                >
                  
                  <div className="mr-4 pt-1 relative">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm transition-colors ${isUrgentAction ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-100 text-brand-600 border-blue-200'}`}>
                       {isUrgentAction ? <AlertTriangle size={24} strokeWidth={2} /> : <Briefcase size={24} strokeWidth={2} />}
                    </div>
                    {totalUnread > 0 && (
                       <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                         {totalUnread}
                       </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="text-base font-bold text-zinc-900 truncate pr-2">{booking.title}</h3>
                      <span className={`text-xs font-medium shrink-0 ${isUrgentAction ? 'text-red-500 font-bold' : 'text-zinc-400'}`}>
                        {latestMsg?.timestamp || 'New'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Users size={12} />
                        <span>{booking.staffCount} Staff</span>
                      </div>
                      {activeShiftsCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/>
                          {activeShiftsCount} ACTIVE
                        </span>
                      )}
                    </div>

                    <p className={`text-sm truncate flex items-center gap-1.5 ${totalUnread > 0 || hasPendingAction ? 'font-semibold' : 'text-zinc-500'}`}>
                       {latestMsg ? (
                         <>
                            {latestMsg.type === 'BROADCAST' && <Megaphone size={12} className="text-brand-600" />}
                            
                            {hasPendingAction ? (
                              <span className={isUrgentAction ? "text-red-600 font-bold uppercase text-xs flex items-center gap-1" : "text-zinc-900 font-medium"}>
                                {isUrgentAction && "⚠️ URGENT: "}{latestMsg.content}
                              </span>
                            ) : (
                              <span className={totalUnread > 0 ? "text-zinc-900" : "text-zinc-500"}>
                                {latestMsg.senderId === 'me' ? 'You: ' : `${USERS[latestMsg.senderId]?.name || 'Worker'}: `}
                                {latestMsg.content}
                              </span>
                            )}
                         </>
                       ) : (
                         <span className="italic opacity-75 text-zinc-400">No messages yet</span>
                       )}
                    </p>
                  </div>

                  <div className="ml-2 self-center">
                    <ChevronRight className="text-zinc-300" size={18} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="h-20" /> 
      </div>
    </div>
  );
};