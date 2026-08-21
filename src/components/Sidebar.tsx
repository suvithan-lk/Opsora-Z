import React, { useState } from 'react';
import { 
  Workspace, 
  Channel, 
  DirectMessage, 
  User, 
  MainViewType, 
  HuddleState
} from '../types';
import { 
  Hash, 
  Lock, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  MessageSquare, 
  AtSign, 
  Bookmark, 
  FileText, 
  Headphones, 
  Sparkles, 
  Volume2, 
  Mic, 
  MicOff, 
  PhoneOff,
  Star,
  Users,
  MoreVertical,
  Compass
} from 'lucide-react';

interface SidebarProps {
  workspace: Workspace;
  channels: Channel[];
  dms: DirectMessage[];
  users: User[];
  currentUser: User;
  activeView: MainViewType;
  activeChannelId: string | null;
  activeDmId: string | null;
  onSelectChannel: (channelId: string) => void;
  onSelectDm: (dmId: string) => void;
  onSelectView: (view: MainViewType) => void;
  onOpenCreateChannel: () => void;
  onOpenNewDm: () => void;
  huddleState: HuddleState;
  onToggleHuddleMute: () => void;
  onLeaveHuddle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspace,
  channels,
  dms,
  users,
  currentUser,
  activeView,
  activeChannelId,
  activeDmId,
  onSelectChannel,
  onSelectDm,
  onSelectView,
  onOpenCreateChannel,
  onOpenNewDm,
  huddleState,
  onToggleHuddleMute,
  onLeaveHuddle,
}) => {
  const [channelsCollapsed, setChannelsCollapsed] = useState(false);
  const [dmsCollapsed, setDmsCollapsed] = useState(false);
  const [starredCollapsed, setStarredCollapsed] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const starredChannels = channels.filter((c) => c.isStarred);
  const regularChannels = channels.filter((c) => !c.isStarred);

  const getUserForDm = (dm: DirectMessage): User => {
    const otherUserId = dm.participantIds.find((id) => id !== currentUser.id) || dm.participantIds[0];
    return users.find((u) => u.id === otherUserId) || users[0];
  };

  return (
    <aside
      id="slack-main-sidebar"
      className="bg-[var(--app-sidebar)] text-app border-r border-[var(--app-border)] w-64 flex-shrink-0 flex flex-col justify-between select-none h-full overflow-hidden"
    >
      {/* Workspace Header */}
      <div className="relative border-b border-[var(--app-border)]">
        <button
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="w-full h-14 px-4 flex items-center justify-between hover:bg-[var(--app-surface-hover)] transition-colors text-left group"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="font-black text-app text-base tracking-tight truncate">
              {workspace.name}
            </span>
            <ChevronDown className="w-4 h-4 text-app-muted group-hover:text-app transition-transform duration-200" />
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--app-surface-raised)] text-app-muted font-bold uppercase border border-[var(--app-border)]">
            {workspace.plan}
          </span>
        </button>

        {/* Workspace Dropdown Menu */}
        {showWorkspaceMenu && (
          <div className="absolute top-14 left-3 right-3 z-50 surface-raised text-app rounded-xl shadow-2xl border py-1.5 text-xs animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b border-[var(--app-border)]">
              <div className="font-bold text-app text-sm">{workspace.name}</div>
              <div className="text-app-muted text-[11px]">{workspace.slug}.slack.com</div>
            </div>
            <button
              onClick={() => {
                setShowWorkspaceMenu(false);
                onOpenCreateChannel();
              }}
              className="w-full px-3 py-2 text-left hover:bg-[var(--app-surface-hover)] flex items-center gap-2"
            >
              <Hash className="w-4 h-4 text-neutral-400" />
              <span>Create a channel</span>
            </button>
            <button
              onClick={() => {
                setShowWorkspaceMenu(false);
                onOpenNewDm();
              }}
              className="w-full px-3 py-2 text-left hover:bg-[var(--app-surface-hover)] flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-neutral-400" />
              <span>Send a new direct message</span>
            </button>
            <button
              onClick={() => {
                setShowWorkspaceMenu(false);
                onSelectView('canvas');
              }}
              className="w-full px-3 py-2 text-left hover:bg-[var(--app-surface-hover)] flex items-center gap-2 border-t border-[var(--app-border)]"
            >
              <FileText className="w-4 h-4 text-neutral-400" />
              <span>Workspace Canvas & Docs</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-2 space-y-4 px-2 custom-scrollbar">
        {/* Quick Views */}
        <div className="space-y-0.5 text-xs font-medium">
          <button
            onClick={() => onSelectView('threads')}
            className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
              activeView === 'threads'
                ? 'bg-[var(--app-surface-selected)] text-[var(--app-blue)] font-bold shadow-sm'
                : 'hover:bg-[var(--app-surface-hover)] text-app-secondary hover:text-app'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 opacity-80" />
              <span>Threads</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--app-surface-raised)] text-app-muted font-bold">
              3
            </span>
          </button>

          <button
            onClick={() => onSelectView('mentions')}
            className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
              activeView === 'mentions'
                ? 'bg-[#1164A3] text-white font-bold shadow-sm'
                : 'hover:bg-white/10 text-white/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AtSign className="w-4 h-4 opacity-80" />
              <span>Mentions & Reactions</span>
            </div>
          </button>

          <button
            onClick={() => onSelectView('saved')}
            className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
              activeView === 'saved'
                ? 'bg-[#1164A3] text-white font-bold shadow-sm'
                : 'hover:bg-white/10 text-white/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 opacity-80" />
              <span>Saved Items</span>
            </div>
          </button>

          <button
            onClick={() => onSelectView('canvas')}
            className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
              activeView === 'canvas'
                ? 'bg-[#1164A3] text-white font-bold shadow-sm'
                : 'hover:bg-white/10 text-white/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 opacity-80" />
              <span>Canvas & Notes</span>
            </div>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 font-bold uppercase">
              PRO
            </span>
          </button>
        </div>

        {/* Starred Channels / Items */}
        {starredChannels.length > 0 && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-white/60 hover:text-white group">
              <button
                onClick={() => setStarredCollapsed(!starredCollapsed)}
                className="flex items-center gap-1 font-bold tracking-wider uppercase text-[11px]"
              >
                {starredCollapsed ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
                <span>Starred</span>
              </button>
            </div>

            {!starredCollapsed && (
              <div className="space-y-0.5">
                {starredChannels.map((ch) => {
                  const isActive = activeView === 'channel' && activeChannelId === ch.id;
                  return (
                    <button
                      key={`starred-${ch.id}`}
                      onClick={() => onSelectChannel(ch.id)}
                      className={`w-full px-2.5 py-1 rounded-md flex items-center justify-between text-xs transition-colors ${
                        isActive
                          ? 'bg-[#1164A3] text-white font-bold shadow-sm'
                          : 'hover:bg-white/10 text-white/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {ch.isPrivate ? (
                          <Lock className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                        ) : (
                          <Hash className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                        )}
                        <span className="truncate">{ch.name}</span>
                      </div>
                      {ch.unreadCount && ch.unreadCount > 0 && !isActive ? (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                          {ch.unreadCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Regular Channels */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-white/60 hover:text-white group">
            <button
              onClick={() => setChannelsCollapsed(!channelsCollapsed)}
              className="flex items-center gap-1 font-bold tracking-wider uppercase text-[11px]"
            >
              {channelsCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <span>Channels</span>
            </button>
            <button
              onClick={onOpenCreateChannel}
              title="Create a channel"
              className="p-0.5 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {!channelsCollapsed && (
            <div className="space-y-0.5">
              {regularChannels.map((ch) => {
                const isActive = activeView === 'channel' && activeChannelId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => onSelectChannel(ch.id)}
                    className={`w-full px-2.5 py-1 rounded-md flex items-center justify-between text-xs transition-colors ${
                      isActive
                        ? 'bg-[#1164A3] text-white font-bold shadow-sm'
                        : 'hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {ch.isPrivate ? (
                        <Lock className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                      ) : (
                        <Hash className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                      )}
                      <span className="truncate">{ch.name}</span>
                    </div>

                    {ch.unreadCount && ch.unreadCount > 0 && !isActive ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white text-neutral-900 font-black">
                        {ch.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Direct Messages */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-white/60 hover:text-white group">
            <button
              onClick={() => setDmsCollapsed(!dmsCollapsed)}
              className="flex items-center gap-1 font-bold tracking-wider uppercase text-[11px]"
            >
              {dmsCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <span>Direct Messages</span>
            </button>
            <button
              onClick={onOpenNewDm}
              title="New direct message"
              className="p-0.5 rounded hover:bg-white/20 text-white/70 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {!dmsCollapsed && (
            <div className="space-y-0.5">
              {dms.map((dm) => {
                const otherUser = getUserForDm(dm);
                const isActive = activeView === 'dm' && activeDmId === dm.id;
                return (
                  <button
                    key={dm.id}
                    onClick={() => onSelectDm(dm.id)}
                    className={`w-full px-2.5 py-1 rounded-md flex items-center justify-between text-xs transition-colors ${
                      isActive
                        ? 'bg-[#1164A3] text-white font-bold shadow-sm'
                        : 'hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {/* Presence Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.name}
                          className="w-4 h-4 rounded-md object-cover"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-[#3F0E40] ${
                            otherUser.presence === 'active'
                              ? 'bg-emerald-400'
                              : otherUser.presence === 'away'
                              ? 'bg-amber-400'
                              : otherUser.presence === 'dnd'
                              ? 'bg-rose-400'
                              : 'bg-neutral-400'
                          }`}
                        />
                      </div>
                      <span className="truncate">{otherUser.name}</span>
                      {otherUser.status && (
                        <span className="text-[11px]">{otherUser.status.emoji}</span>
                      )}
                    </div>

                    {dm.unreadCount && dm.unreadCount > 0 && !isActive ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white text-neutral-900 font-black">
                        {dm.unreadCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Huddle Dock at Bottom of Sidebar if Active */}
      {huddleState.isActive && (
        <div className="p-3 bg-emerald-950/80 border-t border-emerald-700/60 text-white text-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-emerald-300">
                #{huddleState.channelName || 'Active Huddle'}
              </span>
            </div>
            <span className="text-[10px] text-neutral-300 font-mono">
              {huddleState.participants.length} connected
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onToggleHuddleMute}
              className={`p-1.5 rounded-md flex items-center gap-1 font-bold ${
                huddleState.isLocalMuted
                  ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                  : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
              }`}
            >
              {huddleState.isLocalMuted ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
              <span className="text-[11px]">{huddleState.isLocalMuted ? 'Muted' : 'Unmuted'}</span>
            </button>

            <button
              onClick={onLeaveHuddle}
              className="p-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1 text-[11px] font-bold"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
