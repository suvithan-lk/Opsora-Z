import React from 'react';
import { Workspace, User } from '../types';
import { Plus, Hash, Sparkles, Settings, Bell, Palette } from 'lucide-react';

interface WorkspaceRailProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onOpenCreateWorkspace: () => void;
  currentUser: User;
  onOpenProfile: () => void;
  onOpenPreferences: () => void;
}

export const WorkspaceRail: React.FC<WorkspaceRailProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onOpenCreateWorkspace,
  currentUser,
  onOpenProfile,
  onOpenPreferences,
}) => {
  return (
    <aside
      id="slack-workspace-rail"
      className="bg-[var(--app-rail)] border-r border-[var(--app-border)] w-[68px] flex-shrink-0 flex flex-col items-center justify-between py-4 select-none text-app transition-colors duration-200 z-20"
    >
      {/* Top Workspaces */}
      <div className="flex flex-col items-center gap-3 w-full">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId;
          return (
            <div key={ws.id} className="relative group flex items-center justify-center w-full">
              {/* Active Indicator Pill */}
              <div
                className={`absolute left-0 w-1 bg-[var(--app-blue)] rounded-r-full transition-all duration-200 ${
                  isActive ? 'h-7 opacity-100' : 'h-2 opacity-0 group-hover:opacity-60'
                }`}
              />

              <button
                onClick={() => onSelectWorkspace(ws.id)}
                title={ws.name}
                className={`relative w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition-all duration-150 transform active:scale-95 ${
                  isActive
                    ? 'ring-2 ring-[var(--app-blue)] ring-offset-2 ring-offset-[var(--app-rail)] shadow-lg shadow-blue-500/10 scale-105'
                    : 'opacity-80 hover:opacity-100 hover:rounded-lg'
                } ${ws.iconBg} text-white`}
              >
                {ws.icon}

                {/* Unread badge */}
                {ws.unreadCount > 0 && !isActive && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[var(--app-rail)]">
                    {ws.unreadCount}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute left-16 px-2.5 py-1 bg-neutral-900 text-white text-xs font-semibold rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {ws.name}
              </div>
            </div>
          );
        })}

        {/* Add Workspace Button */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onOpenCreateWorkspace}
            title="Add a workspace"
            className="w-10 h-10 rounded-xl bg-[var(--app-surface-raised)] hover:bg-[var(--app-surface-hover)] text-app-muted hover:text-[var(--app-cyan)] flex items-center justify-center transition-colors active:scale-95 border border-dashed border-[var(--app-border-strong)]"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="absolute left-16 px-2.5 py-1 bg-neutral-900 text-white text-xs font-semibold rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Add Workspace
          </div>
        </div>
      </div>

      {/* Bottom Actions & User Profile */}
      <div className="flex flex-col items-center gap-3 w-full">
        {/* Workspace settings */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onOpenPreferences}
            title="Workspace settings"
            className="w-9 h-9 rounded-lg hover:bg-[var(--app-surface-hover)] text-app-muted hover:text-[var(--app-cyan)] flex items-center justify-center transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>
          <div className="absolute left-16 px-2.5 py-1 bg-neutral-900 text-white text-xs font-semibold rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Workspace settings
          </div>
        </div>

        {/* User Profile Avatar with Presence Badge */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={onOpenProfile}
            title={`${currentUser.name} (${currentUser.presence})`}
            className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-[var(--app-border-strong)] hover:ring-[var(--app-blue)] transition-all transform active:scale-95"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
            {/* Presence dot */}
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--app-rail)] ${
                currentUser.presence === 'active'
                  ? 'bg-emerald-500'
                  : currentUser.presence === 'away'
                  ? 'bg-amber-400'
                  : currentUser.presence === 'dnd'
                  ? 'bg-rose-500'
                  : 'bg-neutral-500'
              }`}
            />
          </button>
          <div className="absolute left-16 px-2.5 py-1 bg-neutral-900 text-white text-xs font-semibold rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            {currentUser.name} {currentUser.status?.emoji}
          </div>
        </div>
      </div>
    </aside>
  );
};
