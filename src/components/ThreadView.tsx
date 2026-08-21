import React, { useState } from 'react';
import { Message, User } from '../types';
import { X, MessageSquare, CornerDownRight, Smile, MoreHorizontal } from 'lucide-react';
import { MessageComposer } from './MessageComposer';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ThreadViewProps {
  parentMessage: Message;
  replies: Message[];
  users: User[];
  currentUser: User;
  onClose: () => void;
  onSendReply: (content: string, alsoSendToChannel: boolean) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  channelName?: string;
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  parentMessage,
  replies,
  users,
  currentUser,
  onClose,
  onSendReply,
  onAddReaction,
  channelName,
}) => {
  const [alsoSendToChannel, setAlsoSendToChannel] = useState(false);

  const getUser = (userId: string): User => {
    return users.find((u) => u.id === userId) || {
      id: userId,
      name: 'Unknown User',
      displayName: 'unknown',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'Member',
      title: 'Team Member',
      presence: 'offline',
      email: 'user@internal',
      timezone: 'UTC',
    };
  };

  const parentSender = getUser(parentMessage.senderId);

  const handleReaction = (msgId: string, emoji: string) => {
    onAddReaction(msgId, emoji);
    sound.playReaction();
    confetti({
      particleCount: 20,
      spread: 30,
      origin: { x: 0.8, y: 0.8 },
    });
  };

  return (
    <div
      id="slack-thread-drawer"
      className="w-96 flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#1A1D21] border-l border-neutral-200 dark:border-[#2C3136] z-20 shadow-xl"
    >
      {/* Thread Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-200 dark:border-[#2C3136] flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-neutral-500" />
          <span className="font-bold text-sm text-neutral-900 dark:text-white">Thread</span>
          {channelName && (
            <span className="text-xs text-neutral-400 truncate max-w-[140px]">
              #{channelName}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Parent Message Card */}
        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
          <div className="flex items-start gap-3">
            <img
              src={parentSender.avatar}
              alt={parentSender.name}
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-xs text-neutral-900 dark:text-white">
                  {parentSender.name}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {parentMessage.timestamp}
                </span>
              </div>
              <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                {parentMessage.content}
              </div>

              {/* Reactions on Parent */}
              {parentMessage.reactions && parentMessage.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {parentMessage.reactions.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => handleReaction(parentMessage.id, r.emoji)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-xs font-semibold"
                    >
                      <span>{r.emoji}</span>
                      <span className="text-[10px]">{r.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies Count Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="relative px-2.5 py-0.5 bg-white dark:bg-[#1A1D21] text-[11px] font-bold text-neutral-500 select-none">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </div>
        </div>

        {/* Thread Replies List */}
        <div className="space-y-3">
          {replies.map((reply) => {
            const sender = getUser(reply.senderId);
            return (
              <div key={reply.id} className="group relative flex items-start gap-3 text-xs">
                <img
                  src={sender.avatar}
                  alt={sender.name}
                  className="w-7 h-7 rounded-lg object-cover flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {sender.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {reply.timestamp}
                    </span>
                  </div>
                  <div className="text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </div>

                  {/* Reaction pills */}
                  {reply.reactions && reply.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {reply.reactions.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => handleReaction(reply.id, r.emoji)}
                          className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold"
                        >
                          <span>{r.emoji}</span>
                          <span className="text-[10px] font-mono">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick React Button */}
                <button
                  onClick={() => handleReaction(reply.id, '👍')}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-400 transition-opacity"
                  title="Thumbs up"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thread Composer Footer */}
      <div className="border-t border-neutral-200 dark:border-[#2C3136] p-2 bg-neutral-50 dark:bg-neutral-900/50">
        {/* Also send to channel checkbox */}
        {channelName && (
          <label className="flex items-center gap-2 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={alsoSendToChannel}
              onChange={(e) => setAlsoSendToChannel(e.target.checked)}
              className="rounded accent-[#007A5A]"
            />
            <div className="flex items-center gap-1">
              <CornerDownRight className="w-3 h-3 text-neutral-400" />
              <span>Also send to #{channelName}</span>
            </div>
          </label>
        )}

        <MessageComposer
          onSendMessage={(content) => {
            onSendReply(content, alsoSendToChannel);
          }}
          users={users}
          currentUser={currentUser}
          placeholder="Reply in thread..."
          isThread
        />
      </div>
    </div>
  );
};
