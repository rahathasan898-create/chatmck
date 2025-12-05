
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Thread, Message } from '../types';
import { Avatar } from '../components/Avatar';
import { USERS, BOOKINGS } from '../constants';

interface StaffInboxProps {
  threads: Thread[];
  messages: Message[];
  onSelectThread: (threadId: string) => void;
  onOpenProfile: (userId: string) => void;
}

export const StaffInbox: React.FC<StaffInboxProps> = ({ 
  threads, 
  messages, 
  onSelectThread, 
  onOpenProfile 
}) => {
  
  const getThreadPreview = (thread: Thread) => {
    const booking = BOOKINGS[thread.bookingId];
    const client = USERS[thread.clientId];
    const lastMsg = messages.find(m => m.id === thread.lastMessageId);
    
    return { booking, client, lastMsg };
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-zinc-900">Messages</h1>
        <button className="p-2 text-brand-600 bg-brand-50 rounded-full hover:bg-brand-100 transition-colors">
          <Plus size={24} />
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="px-5 py-3 space-y-3 bg-white border-b border-zinc-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search messages..." 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
        <div className="flex space-x-6">
          <button className="text-sm font-semibold text-brand-600 border-b-2 border-brand-600 pb-2">Inbox</button>
          <button className="text-sm font-medium text-zinc-500 pb-2 hover:text-zinc-700">Archive</button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {threads.map(thread => {
          const { booking, client, lastMsg } = getThreadPreview(thread);
          
          return (
            <div key={thread.id} className="group flex items-start p-5 hover:bg-zinc-50 transition-colors cursor-pointer active:bg-zinc-100 border-b border-zinc-50 last:border-0"
                 onClick={() => onSelectThread(thread.id)}>
              
              <div className="mr-4 pt-1">
                <Avatar 
                  src={client.avatarUrl} 
                  alt={client.name} 
                  badgeIcon="briefcase"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProfile(client.id);
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="text-base font-bold text-zinc-900 truncate pr-2">{booking.title}</h3>
                  <span className="text-xs font-medium text-zinc-400 shrink-0">
                    {lastMsg?.timestamp}
                  </span>
                </div>
                
                <p className="text-sm text-zinc-500 mb-1 flex items-center gap-1">
                  <span className="font-medium text-zinc-700">{client.name}</span>
                </p>

                <p className={`text-sm truncate ${thread.unreadCount > 0 ? 'font-semibold text-zinc-900' : 'text-zinc-500'}`}>
                   {lastMsg?.type === 'BROADCAST' ? (
                     <span className="text-brand-600 flex items-center gap-1">
                       <span className="uppercase text-[9px] font-bold border border-brand-200 bg-brand-50 px-1 rounded">TEAM</span>
                       {lastMsg.content}
                     </span>
                   ) : lastMsg?.senderId === 'system' ? (
                     <span className="italic opacity-80">{lastMsg.content}</span>
                   ) : (
                     <>
                       {lastMsg?.senderId === 'me' && <span className="text-zinc-400 mr-1">You:</span>}
                       {lastMsg?.content}
                     </>
                   )}
                </p>
              </div>

              {thread.unreadCount > 0 && (
                <div className="ml-3 mt-2 flex flex-col items-end gap-1">
                   <div className="w-2.5 h-2.5 rounded-full bg-brand-600"></div>
                </div>
              )}
            </div>
          );
        })}
        <div className="h-20" /> {/* Spacer for fab/nav */}
      </div>
    </div>
  );
};
