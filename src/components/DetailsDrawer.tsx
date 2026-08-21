import React from 'react';
import { Channel, DirectMessage, User } from '../types';
import { X, Hash, Lock, Users, Info, Bell, FileText, Plus, UserPlus } from 'lucide-react';

interface DetailsDrawerProps {
  channel: Channel | null;
  dm: DirectMessage | null;
  users: User[];
  currentUser: User;
  onClose: () => void;
}

export const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  channel,
  dm,
  users,
  currentUser,
  onClose,
}) => {
  const channelMembers = channel
    ? users.filter((u) => channel.memberIds.includes(u.id))
    : [];

  const otherUser = dm
    ? users.find((u) => dm.participantIds.includes(u.id) && u.id !== currentUser.id) || users[0]
    : null;

  return (
    <div
      id="slack-details-drawer"
      className="w-80 flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#1A1D21] border-l border-neutral-200 dark:border-[#2C3136] z-20 shadow-xl"
    >
      <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-200 dark:border-[#2C3136] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-neutral-500" />
          <span className="font-bold text-sm text-neutral-900 dark:text-white">Details</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
        {/* Title & Topic */}
        {channel ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              {channel.isPrivate ? <Lock className="w-4 h-4 text-amber-500" /> : <Hash className="w-4 h-4 text-neutral-500" />}
              <h3 className="font-black text-base text-neutral-900 dark:text-white">#{channel.name}</h3>
            </div>
            <p className="text-neutral-500 leading-relaxed mt-1">
              {channel.topic || 'No topic has been added to this channel.'}
            </p>
          </div>
        ) : otherUser ? (
          <div className="text-center py-2">
            <img src={otherUser.avatar} alt={otherUser.name} className="w-16 h-16 rounded-2xl mx-auto object-cover mb-2 ring-2 ring-neutral-200 dark:ring-neutral-700" />
            <h3 className="font-black text-sm text-neutral-900 dark:text-white">{otherUser.name}</h3>
            <p className="text-neutral-400 text-[11px]">@{otherUser.displayName} • {otherUser.title}</p>
          </div>
        ) : null}

        {/* Channel Members List */}
        {channel && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider">
                Members ({channelMembers.length})
              </span>
              <button className="text-blue-500 hover:underline text-[11px] font-bold flex items-center gap-1">
                <UserPlus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1 max-h-52 overflow-y-auto custom-scrollbar">
              {channelMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  <div className="relative">
                    <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-md object-cover" />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-neutral-900 ${
                        member.presence === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}
                    />
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-neutral-900 dark:text-white truncate">{member.name}</div>
                    <div className="text-[10px] text-neutral-400">{member.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pinned & Shared files stats */}
        <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Notifications</span>
            <span className="text-neutral-400 text-[11px]">All messages</span>
          </div>
          <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Retention</span>
            <span className="text-neutral-400 text-[11px]">Unlimited history</span>
          </div>
        </div>
      </div>
    </div>
  );
};
