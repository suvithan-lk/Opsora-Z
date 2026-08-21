import React from 'react';
import { Workspace, User, HuddleState } from '../types';
import { 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Headphones, 
  HelpCircle, 
  Sparkles,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

interface TopNavProps {
  workspace: Workspace;
  currentUser: User;
  onOpenSearch: () => void;
  huddleState: HuddleState;
  onOpenHuddle: () => void;
  onOpenProfile: () => void;
  onOpenPreferences: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  workspace,
  currentUser,
  onOpenSearch,
  huddleState,
  onOpenHuddle,
  onOpenProfile,
  onOpenPreferences,
}) => {
  return (
    <header
      id="slack-top-nav"
      className="surface-app h-12 flex-shrink-0 flex items-center justify-between px-4 border-b text-app transition-colors select-none z-10"
    >
      {/* Left: History navigation */}
      <div className="flex items-center gap-1">
        <button
          title="Back"
          className="p-1.5 rounded-md hover:bg-[var(--app-surface-hover)] text-app-muted hover:text-app disabled:opacity-30 disabled:pointer-events-none transition-colors"
          disabled
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          title="Forward"
          className="p-1.5 rounded-md hover:bg-[var(--app-surface-hover)] text-app-muted hover:text-app disabled:opacity-30 disabled:pointer-events-none transition-colors"
          disabled
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          title="Recent history"
          onClick={onOpenSearch}
          className="p-1.5 rounded-md hover:bg-[var(--app-surface-hover)] text-app-muted hover:text-app transition-colors ml-1"
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {/* Middle: Universal Search Bar (Click or Cmd+K) */}
      <div className="flex-1 max-w-2xl mx-4">
        <button
          onClick={onOpenSearch}
          className="w-full h-8 px-3.5 rounded-lg bg-[var(--app-surface-raised)] hover:bg-[var(--app-surface-hover)] text-app-secondary hover:text-app text-xs flex items-center justify-between transition-all border border-[var(--app-border)] group cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-app-muted group-hover:text-[var(--app-cyan)]" />
            <span className="truncate">Search {workspace.name}...</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] text-app-muted bg-[var(--app-surface)] px-1.5 py-0.5 rounded border border-[var(--app-border)]">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Active Huddle pill, Quick Status & Profile */}
      <div className="flex items-center gap-2">
        {/* Active Huddle Pill */}
        {huddleState.isActive ? (
          <button
            onClick={onOpenHuddle}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--app-cyan)] hover:bg-[#62e8df] text-[#071113] text-xs font-bold shadow-md shadow-cyan-500/10 transition-all animate-pulse"
          >
            <Radio className="w-3.5 h-3.5 text-black" />
            <span>HUDDLE IN #{huddleState.channelName || 'CALL'}</span>
          </button>
        ) : (
          <button
            onClick={onOpenHuddle}
            title="Start or Join Huddle"
            className="p-1.5 rounded-md hover:bg-[var(--app-surface-hover)] text-app-muted hover:text-app transition-colors"
          >
            <Headphones className="w-4 h-4" />
          </button>
        )}

        {/* User Quick Status Pill */}
        {currentUser.status && (
          <button
            onClick={onOpenProfile}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--app-surface-raised)] hover:bg-[var(--app-surface-hover)] text-xs text-app-secondary transition-colors max-w-[160px] truncate border border-[var(--app-border)]"
          >
            <span>{currentUser.status.emoji}</span>
            <span className="truncate text-[11px]">{currentUser.status.text}</span>
          </button>
        )}

        <button
          onClick={onOpenPreferences}
          title="Workspace settings"
          className="p-1.5 rounded-md hover:bg-[var(--app-surface-hover)] text-app-muted hover:text-app transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
