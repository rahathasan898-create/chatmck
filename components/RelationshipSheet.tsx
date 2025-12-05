import React, { useEffect, useState } from 'react';
import { X, Phone, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { User, Thread, Shift } from '../types';
import { Avatar } from './Avatar';

interface RelationshipSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  activeThreads: { thread: Thread; shift: Shift }[];
  pastThreads: { thread: Thread; shift: Shift }[];
  onSelectThread: (threadId: string) => void;
}

export const RelationshipSheet: React.FC<RelationshipSheetProps> = ({
  isOpen,
  onClose,
  user,
  activeThreads,
  pastThreads,
  onSelectThread
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-auto ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={`relative w-full max-w-md bg-white rounded-t-2xl shadow-xl transform transition-transform duration-300 pointer-events-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-zinc-100">
            <div className="flex justify-between items-start mb-4">
               <Avatar src={user.avatarUrl} alt={user.name} size="xl" />
               <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200">
                 <X size={20} />
               </button>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">{user.name}</h2>
            <p className="text-zinc-500">{user.company || 'Private Client'}</p>
            
            <div className="flex gap-3 mt-4">
              <button className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 active:bg-brand-700">
                <Phone size={18} /> Call
              </button>
              <button className="flex-1 bg-zinc-100 text-zinc-900 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 active:bg-zinc-200">
                <MessageSquare size={18} /> New Topic
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-4 space-y-6 max-h-[50vh]">
            
            {/* Active Topics */}
            {activeThreads.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 ml-2">Active Topics</h3>
                <div className="space-y-2">
                  {activeThreads.map(({ thread, shift }) => (
                    <button 
                      key={thread.id}
                      onClick={() => { onSelectThread(thread.id); onClose(); }}
                      className="w-full flex items-center p-3 bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-xl text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 shrink-0">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900">{shift.title}</div>
                        <div className="text-sm text-zinc-500">{shift.date} • {shift.time}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 ml-2">History</h3>
              <div className="space-y-2">
                {pastThreads.length > 0 ? (
                  pastThreads.map(({ thread, shift }) => (
                    <button 
                      key={thread.id}
                      onClick={() => { onSelectThread(thread.id); onClose(); }}
                      className="w-full flex items-center p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-xl text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mr-3 shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="opacity-75">
                        <div className="font-semibold text-zinc-900">{shift.title}</div>
                        <div className="text-sm text-zinc-500">{shift.date} • {shift.location}</div>
                      </div>
                    </button>
                  ))
                ) : (
                   <div className="p-4 text-center text-sm text-zinc-400 italic">No past history</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};