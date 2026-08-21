import React from 'react';
import { Message, User } from '../types';
import { MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';

interface ThreadsSummaryViewProps {
  threads: { parentMessage: Message; replies: Message[] }[];
  users: User[];
  onOpenThread: (parent: Message) => void;
}

export const ThreadsSummaryView: React.FC<ThreadsSummaryViewProps> = ({
  threads,
  users,
  onOpenThread,
}) => {
  const getUser = (id: string): User => {
    return users.find((u) => u.id === id) || {
      id,
      name: 'Unknown User',
      displayName: 'unknown',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'Member',
      title: 'Team Member',
      presence: 'offline',
      email: 'user@internal',
      timezone: 'UTC',
    };
  };

  return (
    <div id="slack-threads-summary-view" className="flex-1 flex flex-col h-full bg-white dark:bg-[#1A1D21] overflow-hidden">
      <div className="h-14 px-6 flex items-center gap-2 border-b border-neutral-200 dark:border-[#2C3136] flex-shrink-0">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <h2 className="font-black text-base text-neutral-900 dark:text-white">All Threads</h2>
        <span className="text-xs text-neutral-400">({threads.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {threads.map(({ parentMessage, replies }) => {
          const parentSender = getUser(parentMessage.senderId);
          const lastReply = replies[replies.length - 1];
          const lastSender = lastReply ? getUser(lastReply.senderId) : null;

          return (
            <div
              key={parentMessage.id}
              onClick={() => onOpenThread(parentMessage)}
              className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/60 dark:bg-neutral-800/40 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group shadow-sm"
            >
              {/* Parent message header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={parentSender.avatar} alt={parentSender.name} className="w-6 h-6 rounded-md object-cover" />
                  <span className="font-bold text-xs text-neutral-900 dark:text-white">{parentSender.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">{parentMessage.timestamp}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </div>

              <p className="text-xs text-neutral-800 dark:text-neutral-200 line-clamp-2 mb-3">
                {parentMessage.content}
              </p>

              {/* Last Reply Snippet */}
              {lastReply && lastSender && (
                <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <img src={lastSender.avatar} alt={lastSender.name} className="w-5 h-5 rounded-md object-cover" />
                    <span className="font-bold text-neutral-900 dark:text-white">{lastSender.name}:</span>
                    <span className="text-neutral-600 dark:text-neutral-400 truncate">{lastReply.content}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
