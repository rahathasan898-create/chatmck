import React, { useState, useMemo } from 'react';
import { ViewState, Message, Thread, MessageType, Booking } from './types';
import { StaffInbox } from './screens/StaffInbox';
import { StaffChat } from './screens/StaffChat';
import { ClientInbox } from './screens/ClientInbox';
import { ClientBookingDetail } from './screens/ClientBookingDetail';
import { RelationshipSheet } from './components/RelationshipSheet';
import { INITIAL_MESSAGES, THREADS, USERS, SHIFTS, BOOKINGS } from './constants';
import { LayoutGrid, MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [viewState, setViewState] = useState<ViewState>({ view: 'STAFF_INBOX' });
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [threads, setThreads] = useState<Record<string, Thread>>(THREADS);
  
  // Relationship Sheet State
  const [sheetUser, setSheetUser] = useState<string | null>(null);

  // Derived Data
  const staffThreads = useMemo(() => {
    // Only show threads where I am the staff
    return Object.values(threads).filter((t: Thread) => t.staffId === 'me');
  }, [threads]);

  const bookingList = useMemo(() => Object.values(BOOKINGS), []);
  const adminThread = useMemo(() => Object.values(threads).find((t: Thread) => t.staffId === 'admin' && t.clientId === 'steve'), [threads]);

  // Actions
  const handleSendMessage = (text: string) => {
    if (viewState.view !== 'STAFF_CHAT') return;
    
    // Helper to add message
    const addMsg = (tid: string, content: string, sender: string) => {
      const newMessage: Message = {
        id: `new-${Date.now()}-${Math.random()}`,
        threadId: tid,
        senderId: sender,
        content: content,
        timestamp: 'Just now',
        type: MessageType.TEXT,
        isRead: true
      };
      setMessages(prev => [...prev, newMessage]);
      setThreads(prev => ({
        ...prev,
        [tid]: {
          ...prev[tid],
          lastMessageId: newMessage.id,
          unreadCount: sender === 'me' ? 0 : (prev[tid].unreadCount + 1)
        }
      }));
      return newMessage;
    };

    addMsg(viewState.threadId, text, 'me');
       
    // Mock reply
    setTimeout(() => {
      const reply = {
        id: `reply-${Date.now()}`,
        threadId: viewState.threadId,
        senderId: threads[viewState.threadId].clientId,
        content: "Thanks for the update!",
        timestamp: 'Just now',
        type: MessageType.TEXT,
        isRead: false
      };
      setMessages(prev => [...prev, reply]);
      setThreads(prev => ({
        ...prev,
        [viewState.threadId]: {
          ...prev[viewState.threadId],
          lastMessageId: reply.id,
          unreadCount: 0 // Assume read if open
        }
      }));
    }, 2000);
  };

  const handleBroadcast = (text: string) => {
    if (viewState.view !== 'CLIENT_BOOKING_DETAIL') return;
    
    const booking = BOOKINGS[viewState.bookingId];
    if (!booking) return;

    // Send to all threads linked to this booking
    // This is the "Perfect" logic: 1 broadcast entry -> N worker threads
    const affectedThreads = Object.values(threads).filter((t: Thread) => t.bookingId === booking.id);
    
    const newMessages: Message[] = [];
    const updatedThreads = { ...threads };

    affectedThreads.forEach(t => {
       const msg: Message = {
         id: `bc-${Date.now()}-${t.id}`,
         threadId: t.id,
         senderId: 'me', // Client is sending
         content: text, 
         timestamp: 'Just now',
         type: MessageType.BROADCAST,
         isRead: true
       };
       newMessages.push(msg);
       updatedThreads[t.id] = {
         ...t,
         lastMessageId: msg.id,
         unreadCount: 0 // Client read their own msg
       };
    });

    setMessages(prev => [...prev, ...newMessages]);
    setThreads(updatedThreads);
    alert(`Broadcast sent to ${affectedThreads.length} workers.`);
  };

  const handleResolveAction = (messageId: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.actionData) {
        return {
          ...msg,
          actionData: {
            ...msg.actionData,
            status: 'RESOLVED'
          }
        };
      }
      return msg;
    }));
  };

  // Helper to get relationship data
  const getRelationshipData = (targetUserId: string) => {
    const user = USERS[targetUserId];
    // This is simplified for the prototype
    const userThreads = Object.values(threads).filter((t: Thread) => t.clientId === targetUserId || t.staffId === targetUserId);
    
    // Split into active/past for demo (using shift status)
    const active: { thread: Thread; shift: any }[] = [];
    const past: { thread: Thread; shift: any }[] = [];

    // Note: Relationship sheet logic needs update for Booking model, leaving simplified for now
    // In real app, we would query bookings by status.

    return { user, active, past };
  };

  // Render Logic
  const renderContent = () => {
    switch (viewState.view) {
      case 'STAFF_INBOX':
        return (
          <StaffInbox 
            threads={staffThreads} 
            messages={messages}
            onSelectThread={(id) => setViewState({ view: 'STAFF_CHAT', threadId: id })}
            onOpenProfile={(uid) => setSheetUser(uid)}
          />
        );
      case 'STAFF_CHAT':
        const sThread = threads[viewState.threadId];
        const sThreadMsgs = messages.filter(m => m.threadId === viewState.threadId);
        return (
          <StaffChat 
            thread={sThread}
            messages={sThreadMsgs}
            onBack={() => setViewState({ view: 'STAFF_INBOX' })}
            onSendMessage={handleSendMessage}
            onOpenProfile={(uid) => setSheetUser(uid)}
            onResolveAction={handleResolveAction}
          />
        );
      case 'CLIENT_INBOX':
        return (
          <ClientInbox 
            bookings={bookingList}
            threads={threads}
            messages={messages}
            adminThread={adminThread}
            onSelectBooking={(id) => setViewState({ view: 'CLIENT_BOOKING_DETAIL', bookingId: id })}
            onSelectThread={(id) => setViewState({ view: 'STAFF_CHAT', threadId: id })}
          />
        );
      case 'CLIENT_BOOKING_DETAIL':
        const booking = BOOKINGS[viewState.bookingId];
        return (
           <ClientBookingDetail 
             booking={booking}
             threads={threads}
             messages={messages}
             onBack={() => setViewState({ view: 'CLIENT_INBOX' })}
             onOpenThread={(tid) => {
               // Client opens a 1:1 chat with staff
               // We reuse StaffChat component for prototype, but act as Client
               setViewState({ view: 'STAFF_CHAT', threadId: tid });
             }}
             onBroadcast={handleBroadcast}
             onResolveAction={handleResolveAction}
           />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-zinc-100 font-sans">
      <div className="w-full max-w-md bg-white h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Global Nav Bar */}
        {(viewState.view === 'STAFF_INBOX' || viewState.view === 'CLIENT_INBOX') && (
          <div className="bg-white border-t border-zinc-100 flex justify-around items-center h-16 shrink-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
            <button 
              onClick={() => setViewState({ view: 'STAFF_INBOX' })}
              className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${viewState.view === 'STAFF_INBOX' ? 'text-brand-600' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <MessageCircle size={22} strokeWidth={viewState.view === 'STAFF_INBOX' ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide">Staff</span>
            </button>
            <div className="w-px h-8 bg-zinc-100"></div>
            <button 
              onClick={() => setViewState({ view: 'CLIENT_INBOX' })}
              className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${viewState.view === 'CLIENT_INBOX' ? 'text-brand-600' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              <LayoutGrid size={22} strokeWidth={viewState.view === 'CLIENT_INBOX' ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide">Client</span>
            </button>
          </div>
        )}

        {/* Relationship Sheet Overlay */}
        {sheetUser && (
          <RelationshipSheet 
            isOpen={!!sheetUser}
            onClose={() => setSheetUser(null)}
            user={USERS[sheetUser]}
            activeThreads={getRelationshipData(sheetUser).active}
            pastThreads={getRelationshipData(sheetUser).past}
            onSelectThread={(tid) => setViewState({ view: 'STAFF_CHAT', threadId: tid })}
          />
        )}

      </div>
    </div>
  );
};

export default App;