'use client';

import React, { useState, useEffect } from 'react';
import { 
  Workspace, 
  Channel, 
  DirectMessage, 
  Message, 
  User, 
  MainViewType, 
  HuddleState,
  ChannelCanvas,
  MessageAttachment,
  MessagePoll
} from './types';
import { 
  MOCK_WORKSPACES, 
  MOCK_USERS, 
  MOCK_CHANNELS, 
  MOCK_DMS, 
  INITIAL_MESSAGES,
  INITIAL_CANVASES
} from './data/mockSlackData';
import { WorkspaceRail } from './components/WorkspaceRail';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageComposer } from './components/MessageComposer';
import { ThreadView } from './components/ThreadView';
import { HuddleOverlay } from './components/HuddleOverlay';
import { SearchModal } from './components/SearchModal';
import { ChannelCanvasModal } from './components/ChannelCanvasModal';
import { CreateChannelModal } from './components/CreateChannelModal';
import { NewDirectMessageModal } from './components/NewDirectMessageModal';
import { UserProfileModal } from './components/UserProfileModal';
import { PreferencesModal } from './components/PreferencesModal';
import { SavedItemsView } from './components/SavedItemsView';
import { ThreadsSummaryView } from './components/ThreadsSummaryView';
import { DetailsDrawer } from './components/DetailsDrawer';
import { sound } from './utils/sound';

export default function App() {
  // Workspaces state
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(MOCK_WORKSPACES[0]?.id || 'ws-acme');

  // Users state
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  // Navigation views
  const [activeView, setActiveView] = useState<MainViewType>('channel');
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>(MOCK_CHANNELS[0]?.id || 'c-general');
  const [dms, setDms] = useState<DirectMessage[]>(MOCK_DMS);
  const [activeDmId, setActiveDmId] = useState<string | null>(null);

  // Messages state
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeThreadParent, setActiveThreadParent] = useState<Message | null>(null);

  // Canvases state
  const [canvases, setCanvases] = useState<ChannelCanvas[]>(INITIAL_CANVASES);
  const [isCanvasDrawerOpen, setIsCanvasDrawerOpen] = useState(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isNewDmOpen, setIsNewDmOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);

  // Huddle live state
  const [huddleState, setHuddleState] = useState<HuddleState>({
    isActive: false,
    channelId: null,
    channelName: null,
    participants: [],
    isLocalMuted: false,
    isLocalVideo: false,
    isScreenSharing: false,
  });

  // Global Keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const activeChannel = activeView === 'channel' ? channels.find((c) => c.id === activeChannelId) || channels[0] : null;
  const activeDm = activeView === 'dm' ? dms.find((d) => d.id === activeDmId) || dms[0] : null;

  // Filter messages for current channel or DM
  const currentMessages = messages.filter((m) => {
    if (m.threadParentId) return false; // Hide threaded replies from main stream
    if (activeView === 'channel') {
      const match = m.channelId === activeChannelId;
      return filterPinnedOnly ? match && m.isPinned : match;
    }
    if (activeView === 'dm') {
      const match = m.dmId === activeDmId;
      return filterPinnedOnly ? match && m.isPinned : match;
    }
    return false;
  });

  // Thread replies for active thread
  const activeThreadReplies = activeThreadParent
    ? messages.filter((m) => m.threadParentId === activeThreadParent.id)
    : [];

  // Saved messages
  const savedMessages = messages.filter((m) => m.isSaved);

  // Aggregate all threads
  const allThreads = messages
    .filter((m) => !m.threadParentId && (m.replyCount || 0) > 0)
    .map((parent) => ({
      parentMessage: parent,
      replies: messages.filter((m) => m.threadParentId === parent.id),
    }));

  // Pinned count for active chat
  const currentPinnedCount = messages.filter((m) => {
    if (activeView === 'channel') return m.channelId === activeChannelId && m.isPinned;
    if (activeView === 'dm') return m.dmId === activeDmId && m.isPinned;
    return false;
  }).length;

  // Handlers for selection
  const handleSelectChannel = (channelId: string) => {
    setActiveView('channel');
    setActiveChannelId(channelId);
    setActiveDmId(null);
    setFilterPinnedOnly(false);
  };

  const handleSelectDm = (dmId: string) => {
    setActiveView('dm');
    setActiveDmId(dmId);
    setActiveChannelId('');
    setFilterPinnedOnly(false);
  };

  const handleSelectView = (view: MainViewType) => {
    setActiveView(view);
    setFilterPinnedOnly(false);
  };

  // Star Toggle
  const handleToggleStar = () => {
    if (activeView === 'channel' && activeChannel) {
      setChannels(channels.map((c) => (c.id === activeChannel.id ? { ...c, isStarred: !c.isStarred } : c)));
      sound.playReaction();
    }
  };

  // Send Message in Main Stream
  const handleSendMessage = (
    content: string, 
    attachments?: MessageAttachment[], 
    poll?: MessagePoll
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channelId: activeView === 'channel' ? activeChannelId : undefined,
      dmId: activeView === 'dm' && activeDmId ? activeDmId : undefined,
      senderId: currentUser.id,
      content,
      timestamp: timeStr,
      dateKey: now.toISOString().split('T')[0],
      reactions: [],
      attachments,
      poll,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Simulate smart bot response if Slackbot DM or tagged @Slackbot
    if (
      (activeView === 'dm' && activeDm?.participantIds.includes('u-slackbot')) ||
      content.includes('@Slackbot') ||
      content.includes('@slackbot')
    ) {
      setTimeout(() => {
        const botReply: Message = {
          id: `msg-bot-${Date.now()}`,
          channelId: activeView === 'channel' ? activeChannelId : undefined,
          dmId: activeView === 'dm' && activeDmId ? activeDmId : undefined,
          senderId: 'u-slackbot',
          content: `🤖 **Slackbot Assistance**: I've noted that for you! Need help scheduling meetings, setting reminders, or searching docs? Just ask! ✨`,
          timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          dateKey: new Date().toISOString().split('T')[0],
        };
        setMessages((prev) => [...prev, botReply]);
        sound.playNotification();
      }, 1200);
    }
  };

  // Thread Reply Send
  const handleSendThreadReply = (content: string, alsoSendToChannel: boolean) => {
    if (!activeThreadParent) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const newReply: Message = {
      id: `reply-${Date.now()}`,
      threadParentId: activeThreadParent.id,
      channelId: activeThreadParent.channelId,
      dmId: activeThreadParent.dmId,
      senderId: currentUser.id,
      content,
      timestamp: timeStr,
      dateKey: now.toISOString().split('T')[0],
      reactions: [],
    };

    setMessages((prev) => {
      const updated = [...prev, newReply];
      return updated.map((m) =>
        m.id === activeThreadParent.id
          ? {
              ...m,
              replyCount: (m.replyCount || 0) + 1,
              lastReplyTimestamp: timeStr,
            }
          : m
      );
    });

    if (alsoSendToChannel) {
      const broadcastMsg: Message = {
        id: `msg-broadcast-${Date.now()}`,
        channelId: activeThreadParent.channelId,
        dmId: activeThreadParent.dmId,
        senderId: currentUser.id,
        content: `*Replied in thread:* ${content}`,
        timestamp: timeStr,
        dateKey: now.toISOString().split('T')[0],
      };
      setMessages((prev) => [...prev, broadcastMsg]);
    }

    sound.playSend();
  };

  // Reactions
  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const existingReactions = msg.reactions || [];
        const found = existingReactions.find((r) => r.emoji === emoji);

        if (found) {
          if (found.userIds.includes(currentUser.id)) {
            // Remove user reaction
            const updatedUserIds = found.userIds.filter((id) => id !== currentUser.id);
            if (updatedUserIds.length === 0) {
              return { ...msg, reactions: existingReactions.filter((r) => r.emoji !== emoji) };
            }
            return {
              ...msg,
              reactions: existingReactions.map((r) =>
                r.emoji === emoji ? { ...r, count: updatedUserIds.length, userIds: updatedUserIds } : r
              ),
            };
          } else {
            // Add user to reaction
            return {
              ...msg,
              reactions: existingReactions.map((r) =>
                r.emoji === emoji
                  ? { ...r, count: r.count + 1, userIds: [...r.userIds, currentUser.id] }
                  : r
              ),
            };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...existingReactions, { emoji, count: 1, userIds: [currentUser.id] }],
          };
        }
      })
    );
  };

  // Save / Bookmark
  const handleToggleSave = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isSaved: !m.isSaved } : m))
    );
    sound.playReaction();
  };

  // Pin / Unpin
  const handleTogglePin = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isPinned: !m.isPinned } : m))
    );
    sound.playReaction();
  };

  // Edit Message
  const handleEditMessage = (messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, content: newContent, isEdited: true } : m))
    );
  };

  // Delete Message
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // Vote Poll
  const handleVotePoll = (messageId: string, optionId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId || !m.poll) return m;
        const updatedOptions = m.poll.options.map((opt) => {
          if (opt.id === optionId) {
            const hasVoted = opt.votes.includes(currentUser.id);
            return {
              ...opt,
              votes: hasVoted
                ? opt.votes.filter((id) => id !== currentUser.id)
                : [...opt.votes, currentUser.id],
            };
          }
          return opt;
        });
        return {
          ...m,
          poll: {
            ...m.poll,
            options: updatedOptions,
          },
        };
      })
    );
  };

  // Huddle Start / Join / Leave
  const handleToggleHuddle = () => {
    if (huddleState.isActive) {
      // Leave
      setHuddleState({
        isActive: false,
        channelId: null,
        channelName: null,
        participants: [],
        isLocalMuted: false,
        isLocalVideo: false,
        isScreenSharing: false,
      });
      sound.playNotification();
    } else {
      // Start in current channel or DM
      const targetId = activeChannel?.id || activeDm?.id || 'c-1';
      const targetName = activeChannel?.name || 'DM Call';
      setHuddleState({
        isActive: true,
        channelId: targetId,
        channelName: targetName,
        participants: [
          {
            userId: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar,
            isMuted: false,
            isSpeaking: false,
          },
          {
            userId: 'u-2',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            isMuted: false,
            isSpeaking: true,
          },
        ],
        isLocalMuted: false,
        isLocalVideo: false,
        isScreenSharing: false,
      });
      sound.playHuddleJoin();
    }
  };

  // Create Channel
  const handleCreateChannel = (name: string, topic: string, isPrivate: boolean) => {
    const newChan: Channel = {
      id: `c-${Date.now()}`,
      name,
      topic,
      isPrivate,
      isStarred: false,
      memberIds: [currentUser.id, 'u-2', 'u-3'],
      unreadCount: 0,
      createdAt: 'Just now',
    };
    setChannels((prev) => [...prev, newChan]);
    setActiveChannelId(newChan.id);
    setActiveView('channel');
  };

  // Start DM
  const handleStartDm = (userIds: string[]) => {
    const existingDm = dms.find((d) =>
      d.participantIds.includes(userIds[0]) && d.participantIds.includes(currentUser.id)
    );
    if (existingDm) {
      setActiveDmId(existingDm.id);
      setActiveView('dm');
    } else {
      const newDm: DirectMessage = {
        id: `dm-${Date.now()}`,
        participantIds: [currentUser.id, ...userIds],
        unreadCount: 0,
      };
      setDms((prev) => [...prev, newDm]);
      setActiveDmId(newDm.id);
      setActiveView('dm');
    }
  };

  // Current active canvas
  const currentCanvas = canvases.find(
    (c) => c.channelId === (activeChannel?.id || 'general')
  ) || null;

  return (
    <div
      id="slack-app-root"
      className="app-shell h-screen w-screen flex flex-col overflow-hidden select-none"
    >
      {/* Top Universal Search & Status Navigation */}
      <TopNav
        workspace={activeWorkspace}
        currentUser={currentUser}
        onOpenSearch={() => setIsSearchOpen(true)}
        huddleState={huddleState}
        onOpenHuddle={handleToggleHuddle}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
      />

      {/* Main App Workspace Shell */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Workspace Switcher Left Rail */}
        <WorkspaceRail
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSelectWorkspace={setActiveWorkspaceId}
          onOpenCreateWorkspace={() => setIsPreferencesOpen(true)}
          currentUser={currentUser}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
        />

        {/* Primary Workspace Channels & DMs Sidebar */}
        <Sidebar
          workspace={activeWorkspace}
          channels={channels}
          dms={dms}
          users={users}
          currentUser={currentUser}
          activeView={activeView}
          activeChannelId={activeChannelId}
          activeDmId={activeDmId}
          onSelectChannel={handleSelectChannel}
          onSelectDm={handleSelectDm}
          onSelectView={handleSelectView}
          onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
          onOpenNewDm={() => setIsNewDmOpen(true)}
          huddleState={huddleState}
          onToggleHuddleMute={() =>
            setHuddleState((prev) => ({ ...prev, isLocalMuted: !prev.isLocalMuted }))
          }
          onLeaveHuddle={handleToggleHuddle}
        />

        {/* Main Content Viewport */}
        <main className="surface-app flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Channel or DM Conversation View */}
          {(activeView === 'channel' || activeView === 'dm') && (
            <>
              <ChatHeader
                channel={activeChannel}
                dm={activeDm}
                users={users}
                currentUser={currentUser}
                onToggleStar={handleToggleStar}
                isStarred={activeChannel?.isStarred || false}
                onStartHuddle={handleToggleHuddle}
                huddleState={huddleState}
                onToggleCanvas={() => setIsCanvasDrawerOpen(!isCanvasDrawerOpen)}
                isCanvasOpen={isCanvasDrawerOpen}
                onTogglePinned={() => setFilterPinnedOnly(!filterPinnedOnly)}
                pinnedCount={currentPinnedCount}
                onOpenDetails={() => setIsDetailsOpen(!isDetailsOpen)}
              />

              {/* Pinned filter indicator banner */}
              {filterPinnedOnly && (
                <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/30 text-amber-700 text-xs font-semibold flex items-center justify-between">
                  <span>Showing pinned messages only</span>
                  <button
                    onClick={() => setFilterPinnedOnly(false)}
                    className="underline hover:opacity-80"
                  >
                    Clear filter
                  </button>
                </div>
              )}

              {/* Message List */}
              <MessageList
                messages={currentMessages}
                users={users}
                currentUser={currentUser}
                onOpenThread={(msg) => setActiveThreadParent(msg)}
                onAddReaction={handleAddReaction}
                onToggleSave={handleToggleSave}
                onTogglePin={handleTogglePin}
                onVotePoll={handleVotePoll}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
              />

              {/* Message Composer */}
              <MessageComposer
                channelName={activeChannel?.name}
                recipientName={
                  activeDm
                    ? users.find(
                        (u) =>
                          activeDm.participantIds.includes(u.id) && u.id !== currentUser.id
                      )?.name
                    : undefined
                }
                onSendMessage={handleSendMessage}
                users={users}
                currentUser={currentUser}
              />
            </>
          )}

          {/* Saved Items Dedicated View */}
          {activeView === 'saved' && (
            <SavedItemsView
              savedMessages={savedMessages}
              users={users}
              onOpenMessage={(msg) => {
                if (msg.channelId) {
                  setActiveView('channel');
                  setActiveChannelId(msg.channelId);
                }
              }}
              onRemoveSave={handleToggleSave}
            />
          )}

          {/* All Threads Summary View */}
          {activeView === 'threads' && (
            <ThreadsSummaryView
              threads={allThreads}
              users={users}
              onOpenThread={(parent) => {
                setActiveThreadParent(parent);
                if (parent.channelId) {
                  setActiveView('channel');
                  setActiveChannelId(parent.channelId);
                }
              }}
            />
          )}

          {/* Canvas & Notes Full View */}
          {activeView === 'canvas' && (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <ChannelCanvasModal
                canvas={currentCanvas}
                channelName={activeChannel?.name || 'Workspace'}
                onClose={() => setActiveView('channel')}
                onSaveCanvas={(updated) => {
                  setCanvases((prev) =>
                    prev.map((c) => (c.id === updated.id ? updated : c))
                  );
                }}
                currentUser={currentUser}
              />
            </div>
          )}
        </main>

        {/* Right Thread Drawer */}
        {activeThreadParent && (
          <ThreadView
            parentMessage={activeThreadParent}
            replies={activeThreadReplies}
            users={users}
            currentUser={currentUser}
            onClose={() => setActiveThreadParent(null)}
            onSendReply={handleSendThreadReply}
            onAddReaction={handleAddReaction}
            channelName={activeChannel?.name}
          />
        )}

        {/* Right Canvas Drawer */}
        {isCanvasDrawerOpen && activeView !== 'canvas' && (
          <ChannelCanvasModal
            canvas={currentCanvas}
            channelName={activeChannel?.name || 'Channel'}
            onClose={() => setIsCanvasDrawerOpen(false)}
            onSaveCanvas={(updated) => {
              setCanvases((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
              );
            }}
            currentUser={currentUser}
          />
        )}

        {/* Right Details Drawer */}
        {isDetailsOpen && (
          <DetailsDrawer
            channel={activeChannel}
            dm={activeDm}
            users={users}
            currentUser={currentUser}
            onClose={() => setIsDetailsOpen(false)}
          />
        )}
      </div>

      {/* Live Interactive Huddle Overlay */}
      <HuddleOverlay
        huddleState={huddleState}
        currentUser={currentUser}
        onToggleMute={() =>
          setHuddleState((prev) => ({ ...prev, isLocalMuted: !prev.isLocalMuted }))
        }
        onToggleVideo={() =>
          setHuddleState((prev) => ({ ...prev, isLocalVideo: !prev.isLocalVideo }))
        }
        onToggleScreenShare={() =>
          setHuddleState((prev) => ({ ...prev, isScreenSharing: !prev.isScreenSharing }))
        }
        onLeaveHuddle={handleToggleHuddle}
        onSendHuddleReaction={(emoji) => sound.playReaction()}
      />

      {/* Universal Search Modal (Cmd+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={channels}
        users={users}
        messages={messages}
        onSelectChannel={handleSelectChannel}
        onSelectDm={handleSelectDm}
        onSelectMessage={(msg) => {
          if (msg.channelId) handleSelectChannel(msg.channelId);
          if (msg.dmId) handleSelectDm(msg.dmId);
        }}
      />

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        onCreateChannel={handleCreateChannel}
      />

      {/* New Direct Message Modal */}
      <NewDirectMessageModal
        isOpen={isNewDmOpen}
        onClose={() => setIsNewDmOpen(false)}
        users={users}
        currentUser={currentUser}
        onStartDm={handleStartDm}
      />

      {/* User Profile & Status Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser((prev) => ({ ...prev, ...updated }))}
      />

      {/* Workspace Preferences Modal */}
      <PreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  );
}
