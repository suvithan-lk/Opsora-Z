import React from 'react';
import { Message, User } from '../types';
import { Bookmark, MessageSquare, ExternalLink, Trash2 } from 'lucide-react';

interface SavedItemsViewProps {
  savedMessages: Message[];
  users: User[];
  onOpenMessage: (message: Message) => void;
  onRemoveSave: (messageId: string) => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  savedMessages,
  users,
  onOpenMessage,
  onRemoveSave,
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
    <div id="slack-saved-items-view" className="flex-1 flex flex-col h-full bg-white dark:bg-[#1A1D21] overflow-hidden">
      <div className="h-14 px-6 flex items-center gap-2 border-b border-neutral-200 dark:border-[#2C3136] flex-shrink-0">
        <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h2 className="font-black text-base text-neutral-900 dark:text-white">Saved Items</h2>
        <span className="text-xs text-neutral-400">({savedMessages.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {savedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-neutral-400 text-xs">
            <Bookmark className="w-8 h-8 mb-2 opacity-40" />
            <p className="font-bold text-sm text-neutral-600 dark:text-neutral-300">No saved items yet</p>
            <p className="max-w-xs mt-1">Hover over any message and click the bookmark icon to save it for later reference.</p>
          </div>
        ) : (
          savedMessages.map((msg) => {
            const sender = getUser(msg.senderId);
            return (
              <div
                key={msg.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/50 dark:bg-neutral-800/40 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={sender.avatar} alt={sender.name} className="w-6 h-6 rounded-md object-cover" />
                    <span className="font-bold text-xs text-neutral-900 dark:text-white">{sender.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{msg.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRemoveSave(msg.id)}
                      title="Remove bookmark"
                      className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40 text-neutral-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenMessage(msg)}
                      title="Jump to message"
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
