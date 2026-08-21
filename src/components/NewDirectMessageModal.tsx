import React, { useState } from 'react';
import { User } from '../types';
import { MessageSquare, X, Search, Check } from 'lucide-react';

interface NewDirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onStartDm: (userIds: string[]) => void;
}

export const NewDirectMessageModal: React.FC<NewDirectMessageModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onStartDm,
}) => {
  const [query, setQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const otherUsers = users.filter((u) => u.id !== currentUser.id);
  const filteredUsers = otherUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.displayName.toLowerCase().includes(query.toLowerCase())
  );

  const toggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleStart = () => {
    if (selectedUserIds.length === 0) return;
    onStartDm(selectedUserIds);
    setSelectedUserIds([]);
    onClose();
  };

  return (
    <div
      id="slack-new-dm-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="slack-new-dm-modal"
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-5 animate-in zoom-in-95 text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base">New direct message</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Users Chips */}
        {selectedUserIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {selectedUserIds.map((id) => {
              const u = users.find((item) => item.id === id);
              if (!u) return null;
              return (
                <span
                  key={id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold"
                >
                  <span>{u.name}</span>
                  <button onClick={() => toggleSelectUser(id)} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type the name or @handle of a person..."
            autoFocus
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* User List */}
        <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar mb-4">
          {filteredUsers.map((u) => {
            const isSelected = selectedUserIds.includes(u.id);
            return (
              <div
                key={u.id}
                onClick={() => toggleSelectUser(u.id)}
                className={`p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
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
                    <div className="text-[11px] text-neutral-500">{u.title}</div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={selectedUserIds.length === 0}
            className={`px-5 py-2 rounded-lg font-bold text-xs text-white transition-all ${
              selectedUserIds.length > 0
                ? 'bg-[#007A5A] hover:bg-[#00664B]'
                : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
            }`}
          >
            Start Conversation
          </button>
        </div>
      </div>
    </div>
  );
};
