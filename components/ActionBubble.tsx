import React from 'react';
import { AlertTriangle, Clock, CalendarX, FileText, CheckCircle2, CreditCard, ChevronDown } from 'lucide-react';
import { ActionData } from '../types';

interface ActionBubbleProps {
  action: ActionData;
  timestamp: string;
  onResolve?: () => void;
}

export const ActionBubble: React.FC<ActionBubbleProps> = ({ action, timestamp, onResolve }) => {
  
  // Render Resolved State (Compact)
  if (action.status === 'RESOLVED') {
    return (
      <div className="flex justify-center my-2 w-full px-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-lg opacity-70">
           <CheckCircle2 size={14} className="text-zinc-400" />
           <span className="text-xs font-medium text-zinc-500 line-through decoration-zinc-300">{action.title} Resolved</span>
        </div>
      </div>
    );
  }

  // SICK REPORT
  if (action.type === 'SICK') {
    return (
      <div className="flex justify-center my-4 w-full px-4">
        <div className="w-full max-w-sm bg-red-50 border border-red-100 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 flex gap-3">
            <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-red-700 text-sm uppercase tracking-wide">Urgent: {action.title}</h4>
                <span className="text-[10px] text-red-400 font-medium">{timestamp}</span>
              </div>
              <p className="text-zinc-700 text-sm mt-1">{action.details}</p>
              <p className="text-xs text-red-500 mt-1 italic">Requires immediate attention</p>
            </div>
          </div>
          <div className="flex border-t border-red-100 divide-x divide-red-100">
             <button onClick={onResolve} className="flex-1 py-3 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors active:bg-red-200">
               Acknowledge
             </button>
             <button onClick={onResolve} className="flex-1 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors active:bg-red-200">
               Find Replacement
             </button>
          </div>
        </div>
      </div>
    );
  }

  // TIMESHEET
  if (action.type === 'TIMESHEET') {
    return (
      <div className="flex justify-center my-4 w-full px-4">
        <div className="w-full max-w-sm bg-white border border-green-100 rounded-xl overflow-hidden shadow-sm ring-1 ring-green-50">
          <div className="p-4 flex gap-3">
            <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-green-600">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-green-700 text-sm uppercase tracking-wide">{action.title}</h4>
                <span className="text-[10px] text-zinc-400 font-medium">{timestamp}</span>
              </div>
              <p className="text-zinc-700 text-sm mt-1">{action.details}</p>
            </div>
          </div>
          <div className="flex border-t border-zinc-100 divide-x divide-zinc-100">
             <button className="flex-1 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
               View Details
             </button>
             <button onClick={onResolve} className="flex-1 py-3 text-sm font-bold text-green-600 hover:bg-green-50 transition-colors active:bg-green-100 flex items-center justify-center gap-1">
               <CheckCircle2 size={14} /> Approve
             </button>
          </div>
        </div>
      </div>
    );
  }

  // PAYMENT
  if (action.type === 'PAYMENT') {
    return (
      <div className="flex justify-center my-4 w-full px-4">
        <div className="w-full max-w-sm bg-indigo-50 border border-indigo-100 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 flex gap-3">
            <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-indigo-600">
              <CreditCard size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-indigo-700 text-sm uppercase tracking-wide">{action.title}</h4>
                <span className="text-[10px] text-indigo-400 font-medium">{timestamp}</span>
              </div>
              <p className="text-zinc-700 text-sm mt-1">{action.details}</p>
            </div>
          </div>
          <div className="flex border-t border-indigo-100 divide-x divide-indigo-100">
             <button className="flex-1 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors active:bg-indigo-200">
               Details
             </button>
             <button onClick={onResolve} className="flex-1 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-100 transition-colors active:bg-indigo-200">
               Pay Now
             </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};