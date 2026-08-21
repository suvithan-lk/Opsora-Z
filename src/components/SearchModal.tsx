import React, { useState, useEffect } from 'react';
import { Channel, DirectMessage, Message, User } from '../types';
import { 
  Search, 
  Hash, 
  Lock, 
  MessageSquare, 
  User as UserIcon, 
  FileText, 
  X, 
  CornerDownLeft,
  Calendar,
  Clock
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  users: User[];
  messages: Message[];
  onSelectChannel: (channelId: string) => void;
  onSelectDm: (userId: string) => void;
  onSelectMessage: (message: Message) => void;
}

type SearchTab = 'all' | 'messages' | 'channels' | 'people' | 'files';

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  channels,
  users,
  messages,
  onSelectChannel,
  onSelectDm,
  onSelectMessage,
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredChannels = channels.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || (c.topic && c.topic.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.displayName.toLowerCase().includes(query.toLowerCase()) || u.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMessages = messages.filter(
    (m) => m.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      id="slack-search-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="slack-search-modal"
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels, people, files, or messages..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-500 font-mono border border-neutral-200 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 text-xs font-semibold text-neutral-500">
          {(['all', 'messages', 'channels', 'people'] as SearchTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
          {/* Channels Section */}
          {(activeTab === 'all' || activeTab === 'channels') && filteredChannels.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Channels ({filteredChannels.length})
              </div>
              {filteredChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelectChannel(ch.id);
                    onClose();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-xs text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {ch.isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Hash className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white group-hover:text-blue-500">
                        #{ch.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-md">
                        {ch.topic || 'No topic set'}
                      </div>
                    </div>
                  </div>
                  <CornerDownLeft className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}

          {/* People Section */}
          {(activeTab === 'all' || activeTab === 'people') && filteredUsers.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                People ({filteredUsers.length})
              </div>
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectDm(u.id);
                    onClose();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between text-xs text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-neutral-900 ${
                          u.presence === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {u.name} <span className="font-normal text-neutral-400">@{u.displayName}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400">{u.title}</div>
                    </div>
                  </div>
                  <CornerDownLeft className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}

          {/* Messages Section */}
          {(activeTab === 'all' || activeTab === 'messages') && filteredMessages.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Messages ({filteredMessages.length})
              </div>
              {filteredMessages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectMessage(m);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-start gap-2.5 text-xs text-left group"
                >
                  <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {users.find((u) => u.id === m.senderId)?.name || 'User'}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">{m.timestamp}</span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 line-clamp-2">{m.content}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {filteredChannels.length === 0 && filteredUsers.length === 0 && filteredMessages.length === 0 && (
            <div className="p-8 text-center text-neutral-400 text-xs">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
