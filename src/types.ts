export type PresenceStatus = 'active' | 'away' | 'dnd' | 'offline';

export interface UserStatus {
  emoji: string;
  text: string;
  clearTime?: string;
  expiresAt?: string;
}

export interface User {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  role: string;
  title: string;
  presence: PresenceStatus;
  status?: UserStatus;
  email: string;
  timezone: string;
  isBot?: boolean;
  phone?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'code' | 'audio' | 'file' | 'link_preview';
  url?: string;
  size?: string;
  codeLanguage?: string;
  snippetContent?: string;
  durationSec?: number;
  previewTitle?: string;
  previewDescription?: string;
  previewSite?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // userIds
}

export interface MessagePoll {
  id: string;
  question: string;
  options: PollOption[];
  isClosed?: boolean;
  creatorId: string;
}

export interface Message {
  id: string;
  workspaceId?: string;
  channelId?: string;
  dmId?: string;
  senderId: string;
  content: string;
  timestamp: string;
  dateKey: string; // e.g. '2026-08-21'
  reactions?: Reaction[];
  attachments?: MessageAttachment[];
  replyCount?: number;
  replyUserIds?: string[];
  lastReplyTimestamp?: string;
  threadId?: string; // If this message is a reply inside a thread
  threadParentId?: string;
  isEdited?: boolean;
  isPinned?: boolean;
  isSaved?: boolean;
  poll?: MessagePoll;
}

export interface ChannelCanvasBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'checklist' | 'code' | 'link';
  content: string;
  isChecked?: boolean;
}

export interface ChannelCanvas {
  id: string;
  channelId: string;
  title: string;
  content?: string;
  lastEditedBy: string;
  lastEditedAt: string;
  blocks: ChannelCanvasBlock[];
}

export interface Channel {
  id: string;
  workspaceId?: string;
  name: string;
  topic?: string;
  description?: string;
  isPrivate: boolean;
  isMember?: boolean;
  isMuted?: boolean;
  isStarred?: boolean;
  unreadCount?: number;
  memberIds: string[];
  createdAt: string;
  createdBy?: string;
  pinnedMessageIds?: string[];
  canvasContent?: string;
}

export interface DirectMessage {
  id: string;
  workspaceId?: string;
  participantIds: string[];
  isStarred?: boolean;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTimestamp?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon: string;
  iconBg: string;
  plan: 'Free' | 'Pro' | 'Enterprise Grid';
  unreadCount: number;
  channelsCount: number;
  membersCount: number;
}

export interface HuddleParticipant {
  userId: string;
  name?: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOn?: boolean;
  isSpeaking: boolean;
}

export interface HuddleState {
  isActive: boolean;
  channelId?: string | null;
  channelName?: string | null;
  participants: HuddleParticipant[];
  isLocalMuted: boolean;
  isLocalVideo: boolean;
  isScreenSharing: boolean;
  startedAt?: number;
}

export type MainViewType = 'channel' | 'dm' | 'threads' | 'unreads' | 'drafts' | 'mentions' | 'saved' | 'canvas';
