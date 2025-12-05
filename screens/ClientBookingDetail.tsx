import React, { useState, useMemo } from 'react';
import { ArrowLeft, Megaphone, Users, Search, MessageSquare, Phone, ChevronRight, AlertTriangle, FileText, Activity, CheckCircle2, Info, Clock, Calendar, UserPlus } from 'lucide-react';
import { Booking, Thread, Message, Shift, User, MessageType } from '../types';
import { USERS, SHIFTS, BOOKING_ACTIVITIES } from '../constants';
import { Avatar } from '../components/Avatar';

interface ClientBookingDetailProps {
  booking: Booking;
  threads: Record<string, Thread>;
  messages: Message[];
  onBack: () => void;
  onOpenThread: (threadId: string) => void;
  onBroadcast: (text: string) => void;
  onResolveAction?: (messageId: string) => void;
}

export const ClientBookingDetail: React.FC<ClientBookingDetailProps> = ({
  booking,
  threads,
  messages,
  onBack,
  onOpenThread,
  onBroadcast,
  onResolveAction
}) => {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'staff' | 'activity'>('staff');
  const [inputText, setInputText] = useState('');

  // 1. Group Shifts by Worker & Determine Priority
  const { workerList, unassignedShifts } = useMemo(() => {
    const workersMap: Record<string, { user: User; shifts: Shift[]; thread?: Thread; lastMsg?: Message; hasAction: boolean; actionType?: string }> = {};
    const unassigned: Shift[] = [];

    booking.shifts.forEach(sid => {
      const shift = SHIFTS[sid];
      if (!shift) return;
      
      if (!shift.assignedTo) {
        unassigned.push(shift);
        return;
      }
      
      const workerId = shift.assignedTo;
      
      if (!workersMap[workerId]) {
        const thread = Object.values(threads).find((t: Thread) => 
          t.bookingId === booking.id && t.staffId === workerId
        );
        
        let lastMsg = undefined;
        let hasAction = false;
        let actionType = undefined;

        if (thread) {
          lastMsg = messages.find(m => m.id === thread.lastMessageId);
          // Determine if there is a pending action
          if (lastMsg?.type === MessageType.ACTION && lastMsg.actionData?.status === 'PENDING') {
            hasAction = true;
            actionType = lastMsg.actionData.type;
          }
        }

        workersMap[workerId] = { 
          user: USERS[workerId], 
          shifts: [], 
          thread,
          lastMsg,
          hasAction,
          actionType
        };
      }
      workersMap[workerId].shifts.push(shift);
    });

    // Sort Logic: Actions First > Unread > Read
    const sortedWorkers = Object.values(workersMap).sort((a, b) => {
      if (a.hasAction && !b.hasAction) return -1;
      if (!a.hasAction && b.hasAction) return 1;
      
      const aUnread = a.thread?.unreadCount || 0;
      const bUnread = b.thread?.unreadCount || 0;
      
      if (aUnread > 0 && bUnread === 0) return -1;
      if (aUnread === 0 && bUnread > 0) return 1;
      
      return 0;
    });

    return { workerList: sortedWorkers, unassignedShifts: unassigned };
  }, [booking.shifts, threads, messages, booking.id]);


  const broadcastMessages = useMemo(() => {
    return messages.filter(m => 
      m.type === MessageType.BROADCAST && 
      Object.values(threads).some((t: Thread) => t.id === m.threadId && t.bookingId === booking.id)
    ).reduce((acc, current) => {
      const x = acc.find(item => item.content === current.content && Math.abs(new Date(item.timestamp).getTime() - new Date(current.timestamp).getTime()) < 1000); 
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, [] as Message[]);
  }, [messages, threads, booking.id]);

  const activities = useMemo(() => {
    return BOOKING_ACTIVITIES.filter(a => a.bookingId === booking.id).reverse(); // Newest first
  }, [booking.id]);

  const handleSendBroadcast = () => {
    if (inputText.trim()) {
      onBroadcast(inputText);
      setInputText('');
    }
  };

  const getActivityIcon = (type: string, iconStr?: string) => {
    if (iconStr === 'calendar') return <Calendar size={16} />;
    if (iconStr === 'users') return <Users size={16} />;
    if (iconStr === 'clock') return <Clock size={16} />;
    if (iconStr === 'megaphone') return <Megaphone size={16} />;
    
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 size={16} />;
      case 'WARNING': return <AlertTriangle size={16} />;
      case 'ERROR': return <AlertTriangle size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-100 text-green-600 border-green-200';
      case 'WARNING': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'ERROR': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  // Stats Logic
  const totalShifts = booking.shifts.length;
  const unfilledCount = unassignedShifts.length;
  const filledCount = totalShifts - unfilledCount;
  const isFullyStaffed = unfilledCount === 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-50 rounded-full transition-colors">
            <ArrowLeft size={22} className="text-zinc-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-zinc-900 leading-tight truncate">{booking.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-zinc-500">
                {totalShifts} Shifts • {workerList.length} Staff
              </p>
              {/* Fill Rate Badge */}
              {isFullyStaffed ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                  <CheckCircle2 size={10} /> Fully Staffed
                </span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <AlertTriangle size={10} /> {unfilledCount} Unfilled
                </span>
              )}
            </div>
          </div>
          <button className="p-2 text-zinc-400 hover:text-brand-600 rounded-full">
             <Phone size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-6 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('staff')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'staff' ? 'text-brand-600 border-brand-600' : 'text-zinc-500 border-transparent hover:text-zinc-700'}`}
          >
            <Users size={16} />
            Staff List
            <span className="bg-zinc-100 text-zinc-600 text-[10px] px-1.5 py-0.5 rounded-full">{workerList.length + (unfilledCount > 0 ? 1 : 0)}</span>
          </button>
          <button 
            onClick={() => setActiveTab('broadcast')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'broadcast' ? 'text-brand-600 border-brand-600' : 'text-zinc-500 border-transparent hover:text-zinc-700'}`}
          >
            <Megaphone size={16} />
            Broadcast
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'activity' ? 'text-brand-600 border-brand-600' : 'text-zinc-500 border-transparent hover:text-zinc-700'}`}
          >
            <Activity size={16} />
            Activity
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-zinc-50 flex flex-col">
        
        {/* TAB: STAFF LIST (The "Perfect" View) */}
        {activeTab === 'staff' && (
          <div className="flex flex-col h-full">
            <div className="p-3 bg-white border-b border-zinc-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input type="text" placeholder="Filter staff..." className="w-full bg-zinc-100 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              
              {/* SECTION: Unassigned Shifts (Phantom Row) */}
              {unassignedShifts.length > 0 && (
                 <div className="flex items-start p-4 border-b border-dashed border-amber-200 bg-amber-50/20 hover:bg-amber-50/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-300 flex items-center justify-center bg-amber-50 text-amber-500 shrink-0">
                      <UserPlus size={20} />
                    </div>
                    
                    <div className="ml-3 flex-1">
                       <div className="flex justify-between items-start">
                         <h3 className="font-bold text-amber-700">Open Positions</h3>
                         <button className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded border border-amber-200 uppercase tracking-wide hover:bg-amber-200 transition-colors">
                            Find Staff
                         </button>
                       </div>
                       
                       <div className="flex flex-wrap gap-1.5 mt-2">
                         {unassignedShifts.map(s => (
                           <span key={s.id} className="text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 bg-white text-zinc-500 border-zinc-200">
                             {s.date.split(' ').slice(0, 2).join(' ')}
                           </span>
                         ))}
                       </div>
                       
                       <p className="text-xs text-amber-600/70 mt-2 font-medium">
                         {unassignedShifts.length} shifts require staffing
                       </p>
                    </div>
                 </div>
              )}

              {workerList.map(({ user, shifts, thread, hasAction, actionType }, idx) => (
                <div 
                  key={idx} 
                  onClick={() => thread && onOpenThread(thread.id)}
                  className={`flex items-start p-4 border-b border-zinc-50 transition-colors cursor-pointer group ${hasAction ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-zinc-50'}`}
                >
                  <Avatar src={user.avatarUrl} alt={user.name} />
                  
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-zinc-900">{user.name}</h3>
                        
                        {/* Action Badges */}
                        {hasAction && actionType === 'SICK' && (
                          <span className="flex items-center gap-1 bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-200 uppercase tracking-wide">
                            <AlertTriangle size={10} /> Sick Report
                          </span>
                        )}
                        {hasAction && actionType === 'TIMESHEET' && (
                          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-green-200 uppercase tracking-wide">
                            <FileText size={10} /> Timesheet
                          </span>
                        )}
                      </div>

                      {thread && thread.unreadCount > 0 && !hasAction && (
                        <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {thread.unreadCount} new
                        </span>
                      )}
                    </div>
                    
                    {/* Shift Badges: Shows "Mon, Tue, Wed" aggregated */}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {shifts.map(s => (
                        <span key={s.id} className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${s.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium' : s.status === 'COMPLETED' ? 'bg-zinc-50 text-zinc-400 border-zinc-100 decoration-slice' : s.status === 'CANCELLED' ? 'bg-red-50 text-red-400 border-red-100 line-through' : 'bg-white text-zinc-600 border-zinc-200'}`}>
                          {s.date.split(' ').slice(0, 2).join(' ')}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1 group-hover:text-brand-600 transition-colors">
                      <MessageSquare size={12} />
                      <span className="truncate max-w-[200px]">Open chat</span>
                    </p>
                  </div>
                  
                  <ChevronRight className="text-zinc-300 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                </div>
              ))}
              <div className="h-10" />
            </div>
          </div>
        )}

        {/* TAB: BROADCAST */}
        {activeTab === 'broadcast' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex gap-3">
                <Megaphone className="shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="font-bold mb-1">Broadcast Channel</p>
                  <p className="opacity-90">Messages sent here will be delivered to <span className="font-bold">all {workerList.length} staff</span> members active on this booking.</p>
                </div>
              </div>

              {/* History of broadcasts */}
              <div className="space-y-4">
                 {broadcastMessages.length > 0 ? (
                   <>
                     <div className="flex justify-center"><span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Previous Announcements</span></div>
                     {broadcastMessages.map((msg, idx) => (
                       <div key={idx} className="flex justify-end">
                          <div className="bg-brand-600/10 border border-brand-600/20 text-brand-900 rounded-2xl rounded-br-none px-4 py-3 max-w-[85%]">
                            <p className="text-sm font-medium mb-1 text-brand-700">📣 Broadcast</p>
                            <p className="text-sm">{msg.content}</p>
                            <span className="text-[10px] opacity-60 mt-1 block text-right">{msg.timestamp} • Sent to {workerList.length}</span>
                          </div>
                       </div>
                     ))}
                   </>
                 ) : (
                   <div className="text-center text-zinc-400 text-sm mt-10">No broadcasts sent yet.</div>
                 )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-zinc-200">
               <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
                 <textarea 
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                   placeholder="Type an announcement to the team..."
                   className="w-full bg-transparent border-none focus:ring-0 text-sm p-2 min-h-[60px] resize-none"
                 />
                 <div className="flex justify-between items-center px-2 pb-1">
                   <span className="text-xs text-zinc-400">Sends to {workerList.length} people</span>
                   <button 
                     onClick={handleSendBroadcast}
                     disabled={!inputText.trim()}
                     className="bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
                   >
                     Send
                   </button>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* TAB: ACTIVITY (Timeline) */}
        {activeTab === 'activity' && (
          <div className="flex flex-col h-full bg-white">
            <div className="p-4 bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-500 flex items-center justify-between">
              <span>System & Operational Log</span>
              <span>Sorted by Newest</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="relative border-l-2 border-zinc-100 ml-3 space-y-8 pb-10">
                {activities.map((act) => (
                  <div key={act.id} className="relative pl-6">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${getActivityColor(act.type)}`}>
                       {getActivityIcon(act.type, act.icon)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">{act.timestamp}</span>
                      <h4 className="text-sm font-bold text-zinc-900">{act.title}</h4>
                      {act.description && (
                        <p className="text-sm text-zinc-500 mt-1 leading-relaxed">
                          {act.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};