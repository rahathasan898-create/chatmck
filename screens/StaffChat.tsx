import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone, Info, Send, Calendar, CheckCircle2, Circle, Clock, Megaphone, AlertCircle, AlertTriangle, FileText, XCircle } from 'lucide-react';
import { Thread, Message, MessageType } from '../types';
import { USERS, SHIFTS, BOOKINGS } from '../constants';
import { Avatar } from '../components/Avatar';
import { ActionBubble } from '../components/ActionBubble';

interface StaffChatProps {
  thread: Thread;
  messages: Message[];
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onOpenProfile: (userId: string) => void;
  onResolveAction?: (messageId: string) => void;
}

export const StaffChat: React.FC<StaffChatProps> = ({ 
  thread, 
  messages, 
  onBack, 
  onSendMessage,
  onOpenProfile,
  onResolveAction
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const client = USERS[thread.clientId];
  const booking = BOOKINGS[thread.bookingId];
  
  // Get all shifts for this user in this booking (The "Context")
  const contextShifts = booking.shifts
    .map(sid => SHIFTS[sid])
    .filter(s => s.assignedTo === thread.staffId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const getStatusIcon = (status: string, actionType?: string) => {
    if (actionType === 'SICK') return <AlertTriangle size={12} className="text-red-600 animate-pulse" />;
    if (actionType === 'TIMESHEET') return <FileText size={12} className="text-green-600" />;

    switch (status) {
      case 'COMPLETED': return <CheckCircle2 size={12} className="text-green-600" />;
      case 'ACTIVE': return <Circle size={12} className="text-blue-600 fill-blue-600 animate-pulse" />;
      case 'CANCELLED': return <XCircle size={12} className="text-red-500" />;
      default: return <Clock size={12} className="text-zinc-400" />;
    }
  };

  const getShiftActionStatus = (shiftId: string) => {
    const relatedAction = messages.find(m => 
      m.type === MessageType.ACTION && 
      m.actionData?.shiftId === shiftId && 
      m.actionData.status === 'PENDING'
    );
    return relatedAction?.actionData?.type;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Header */}
      <header className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3 bg-white z-20">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft size={22} />
        </button>
        
        <div className="flex-1 cursor-pointer" onClick={() => onOpenProfile(client.id)}>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-zinc-900 truncate max-w-[200px]">{booking.title}</h1>
          </div>
          <p className="text-xs text-zinc-500">w/ {client.name}</p>
        </div>

        <div className="flex gap-1">
          <button className="p-2 text-zinc-400 hover:text-brand-600 hover:bg-zinc-50 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 text-zinc-400 hover:text-brand-600 hover:bg-zinc-50 rounded-full transition-colors">
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Sticky Context Strip - Horizontal Scroll of Shifts */}
      <div className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur-sm border-b border-zinc-200 py-2">
        <div className="overflow-x-auto no-scrollbar flex px-4 gap-2">
          {contextShifts.map(s => {
            const actionType = getShiftActionStatus(s.id);
            const isSick = actionType === 'SICK';
            const isTimesheet = actionType === 'TIMESHEET';
            
            return (
              <div key={s.id} className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${
                isSick ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-100' :
                isTimesheet ? 'bg-green-50 border-green-200 text-green-700 ring-1 ring-green-100' :
                s.status === 'ACTIVE' ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-100' : 
                s.status === 'CANCELLED' ? 'bg-zinc-50 border-zinc-200 text-zinc-500 line-through decoration-red-500 decoration-2 opacity-80' :
                'bg-white border-zinc-200 text-zinc-600'
              }`}>
                {getStatusIcon(s.status, actionType)}
                <span>{s.date}</span>
                <span className="opacity-50 mx-1">|</span>
                <span>{s.time.split(' - ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === 'me';
          const isSystem = msg.type === MessageType.SYSTEM;
          const isBroadcast = msg.type === MessageType.BROADCAST;
          const isAction = msg.type === MessageType.ACTION;
          const showAvatar = !isMe && !isSystem && !isAction && !isBroadcast && (index === 0 || messages[index - 1].senderId !== msg.senderId);

          if (isSystem) {
             return (
               <div key={msg.id} className="flex justify-center my-4">
                 <span className="bg-zinc-100 text-zinc-500 text-[10px] font-medium uppercase tracking-wide px-3 py-1 rounded-full border border-zinc-200 shadow-sm">
                   {msg.content}
                 </span>
               </div>
             );
          }

          if (isAction && msg.actionData) {
            return (
              <ActionBubble 
                key={msg.id} 
                action={msg.actionData} 
                timestamp={msg.timestamp} 
                onResolve={onResolveAction ? () => onResolveAction(msg.id) : undefined} 
              />
            );
          }

          if (isBroadcast) {
            return (
              <div key={msg.id} className="flex justify-center my-2 w-full px-4">
                <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 shadow-sm">
                  <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-blue-600">
                    <Megaphone size={14} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">Team Broadcast</p>
                    <p className="text-sm text-zinc-800">{msg.content}</p>
                    <p className="text-[10px] text-zinc-400 mt-1 text-right">{msg.timestamp}</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
              {!isMe && (
                <div className="w-8 mr-2 flex flex-col justify-end">
                   {showAvatar ? <Avatar src={client.avatarUrl} alt={client.name} size="sm" /> : <div className="w-8" />}
                </div>
              )}
              
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                isMe 
                  ? 'bg-brand-600 text-white rounded-br-none' 
                  : 'bg-zinc-100 text-zinc-800 rounded-bl-none'
              }`}>
                {msg.content}
                <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-zinc-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-100 bg-white">
        <div className="flex items-end gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition-all">
          <input 
            className="flex-1 bg-transparent border-none focus:ring-0 px-3 py-2.5 min-h-[44px] max-h-32 resize-none text-sm text-zinc-900 placeholder-zinc-400"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl transition-all ${
              inputText.trim() 
                ? 'bg-brand-600 text-white shadow-md hover:bg-brand-700' 
                : 'bg-zinc-200 text-zinc-400'
            }`}
          >
            <Send size={18} fill={inputText.trim() ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};
