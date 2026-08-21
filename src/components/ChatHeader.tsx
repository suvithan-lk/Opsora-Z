import React, { useState } from 'react';
import { Channel, DirectMessage, User, HuddleState } from '../types';
import { 
  Hash, 
  Lock, 
  Star, 
  Users, 
  Headphones, 
  FileText, 
  Pin, 
  Search, 
  Info, 
  Radio, 
  ChevronDown,
  UserPlus
} from 'lucide-react';

interface ChatHeaderProps {
  channel: Channel | null;
  dm: DirectMessage | null;
  users: User[];
  currentUser: User;
  onToggleStar: () => void;
  isStarred: boolean;
  onStartHuddle: () => void;
  huddleState: HuddleState;
  onToggleCanvas: () => void;
  isCanvasOpen: boolean;
  onTogglePinned: () => void;
  pinnedCount: number;
  onOpenDetails: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  channel,
  dm,
  users,
  currentUser,
  onToggleStar,
  isStarred,
  onStartHuddle,
  huddleState,
  onToggleCanvas,
  isCanvasOpen,
  onTogglePinned,
  pinnedCount,
  onOpenDetails,
}) => {
  const [showMembersPopover, setShowMembersPopover] = useState(false);

  const getOtherUser = (): User => {
    if (!dm) return currentUser;
    const otherId = dm.participantIds.find((id) => id !== currentUser.id) || dm.participantIds[0];
    return users.find((u) => u.id === otherId) || users[0];
  };

  const otherUser = dm ? getOtherUser() : null;

  const channelMembers = channel 
    ? users.filter((u) => channel.memberIds.includes(u.id))
    : [];

  const getHeaderBg = () => {
    return 'surface-app border-b border-[var(--app-border)] text-app';
  };

  return (
    <div
      id="slack-chat-header"
      className={`h-16 px-5 flex items-center justify-between ${getHeaderBg()} flex-shrink-0 z-10`}
    >
      {/* Left: Channel / DM Title & Topic */}
      <div className="flex items-center gap-2 min-w-0">
        {channel ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={onOpenDetails}
              className="flex items-center gap-1 font-black text-base hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-1 rounded-md transition-colors truncate"
            >
              {channel.isPrivate ? (
                <Lock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              ) : (
                <Hash className="w-4 h-4 text-neutral-500 flex-shrink-0" />
              )}
              <span className="truncate">{channel.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={onToggleStar}
              title={isStarred ? 'Unstar channel' : 'Star channel'}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Star
                className={`w-4 h-4 ${
                  isStarred ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'
                }`}
              />
            </button>
          </div>
        ) : otherUser ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative">
              <img
                src={otherUser.avatar}
                alt={otherUser.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-neutral-900 ${
                  otherUser.presence === 'active'
                    ? 'bg-emerald-500'
                    : otherUser.presence === 'away'
                    ? 'bg-amber-400'
                    : otherUser.presence === 'dnd'
                    ? 'bg-rose-500'
                    : 'bg-neutral-400'
                }`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span className="truncate">{otherUser.name}</span>
                {otherUser.status && (
                  <span className="text-xs">{otherUser.status.emoji}</span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 truncate">{otherUser.title}</p>
            </div>

            <button
              onClick={onToggleStar}
              title={isStarred ? 'Unstar conversation' : 'Star conversation'}
              className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-1"
            >
              <Star
                className={`w-4 h-4 ${
                  isStarred ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'
                }`}
              />
            </button>
          </div>
        ) : null}

        {/* Topic description in channels */}
        {channel?.topic && (
          <span className="hidden lg:inline-block text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-md border-l border-neutral-300 dark:border-neutral-700 pl-3 ml-2">
            {channel.topic}
          </span>
        )}
      </div>

      {/* Right Actions: Members, Huddle, Canvas, Pinned */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Members Pill */}
        {channel && (
          <div className="relative">
            <button
              onClick={() => setShowMembersPopover(!showMembersPopover)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{channelMembers.length}</span>
            </button>

            {/* Members Popover */}
            {showMembersPopover && (
              <div className="absolute right-0 top-9 w-64 bg-white dark:bg-neutral-900 rounded-lg shadow-2xl border border-neutral-200 dark:border-neutral-700 p-2 z-50 animate-in fade-in">
                <div className="px-2 py-1.5 border-b border-neutral-200 dark:border-neutral-800 font-bold text-xs flex justify-between items-center">
                  <span>Channel Members ({channelMembers.length})</span>
                  <button
                    onClick={() => setShowMembersPopover(false)}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                  {channelMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs"
                    >
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-6 h-6 rounded-md object-cover"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-neutral-900 ${
                            member.presence === 'active'
                              ? 'bg-emerald-500'
                              : member.presence === 'away'
                              ? 'bg-amber-400'
                              : member.presence === 'dnd'
                              ? 'bg-rose-500'
                              : 'bg-neutral-400'
                          }`}
                        />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold truncate">{member.name}</div>
                        <div className="text-[10px] text-neutral-500 truncate">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Huddle Button */}
        <button
          onClick={onStartHuddle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
            huddleState.isActive && huddleState.channelId === (channel?.id || dm?.id)
              ? 'bg-emerald-500 text-black animate-pulse'
              : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {huddleState.isActive && huddleState.channelId === (channel?.id || dm?.id)
              ? 'In Huddle'
              : 'Huddle'}
          </span>
        </button>

        {/* Canvas Toggle */}
        <button
          onClick={onToggleCanvas}
          title="Toggle Canvas notes"
          className={`p-2 rounded-md transition-colors ${
            isCanvasOpen
              ? 'bg-neutral-200 dark:bg-neutral-700 text-amber-600 dark:text-amber-400'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Pinned Items */}
        <button
          onClick={onTogglePinned}
          title="Pinned messages"
          className="relative p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
        >
          <Pin className="w-4 h-4" />
          {pinnedCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Info / Details Drawer */}
        <button
          onClick={onOpenDetails}
          title="Conversation details"
          className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
