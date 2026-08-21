import React, { useState } from 'react';
import { User, UserStatus } from '../types';
import { X, Smile, Clock, Mail, Shield, Check, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
}

const STATUS_PRESETS: UserStatus[] = [
  { emoji: '🗓️', text: 'In a meeting', expiresAt: 'in 1 hour' },
  { emoji: '🚌', text: 'Commuting', expiresAt: 'in 30 mins' },
  { emoji: '🎧', text: 'Focus mode / Coding', expiresAt: 'today' },
  { emoji: '🤒', text: 'Out sick', expiresAt: 'today' },
  { emoji: '🌴', text: 'Vacationing', expiresAt: 'next Monday' },
  { emoji: '☕', text: 'Grabbing coffee', expiresAt: 'in 15 mins' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [statusText, setStatusText] = useState(currentUser.status?.text || '');
  const [statusEmoji, setStatusEmoji] = useState(currentUser.status?.emoji || '💬');
  const [presence, setPresence] = useState(currentUser.presence);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateUser({
      presence,
      status: statusText ? { emoji: statusEmoji, text: statusText } : undefined,
    });
    sound.playSend();
    onClose();
  };

  return (
    <div
      id="slack-user-profile-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="slack-user-profile-modal"
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-in zoom-in-95 text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Header */}
        <div className="relative h-24 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar with Presence Ring */}
          <div className="relative -mt-12 mb-3 inline-block">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-neutral-900 shadow-md"
            />
            <span
              className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-neutral-900 ${
                presence === 'active'
                  ? 'bg-emerald-500'
                  : presence === 'away'
                  ? 'bg-amber-400'
                  : presence === 'dnd'
                  ? 'bg-rose-500'
                  : 'bg-neutral-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black">{currentUser.name}</h2>
              <p className="text-xs text-neutral-500 font-mono">@{currentUser.displayName} • {currentUser.title}</p>
            </div>
          </div>

          {/* Presence Switcher */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              Set Presence Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'active', label: 'Active', color: 'bg-emerald-500' },
                { id: 'away', label: 'Away', color: 'bg-amber-400' },
                { id: 'dnd', label: 'Do Not Disturb', color: 'bg-rose-500' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPresence(item.id as any)}
                  className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    presence === item.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Message Editor */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
              What&apos;s your status?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={statusEmoji}
                onChange={(e) => setStatusEmoji(e.target.value)}
                className="w-12 text-center text-lg p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none"
              />
              <input
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="What are you working on?"
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1 mb-5">
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
              Quick Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {STATUS_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setStatusEmoji(preset.emoji);
                    setStatusText(preset.text);
                  }}
                  className="p-1.5 px-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left flex items-center gap-2 text-xs transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                >
                  <span>{preset.emoji}</span>
                  <span className="truncate">{preset.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Details metadata */}
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs space-y-2 mb-4">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <Mail className="w-3.5 h-3.5" />
              <span>{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Local time: 10:45 AM ({currentUser.timezone})</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Role: {currentUser.role}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-[#007A5A] hover:bg-[#00664B] text-white font-bold text-xs shadow-md transition-all"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
