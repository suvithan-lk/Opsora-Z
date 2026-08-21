import React, { useState } from 'react';
import { Message, User } from '../types';
import { 
  Smile, 
  MessageSquare, 
  Bookmark, 
  Pin, 
  MoreHorizontal, 
  Check, 
  Copy, 
  Play, 
  Pause, 
  Volume2, 
  ExternalLink,
  Edit2,
  Trash2,
  Share2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';
import { COMMON_EMOJIS } from '../data/mockSlackData';

interface MessageListProps {
  messages: Message[];
  users: User[];
  currentUser: User;
  onOpenThread: (message: Message) => void;
  onAddReaction: (messageId: string, emoji: string) => void;
  onToggleSave: (messageId: string) => void;
  onTogglePin: (messageId: string) => void;
  onVotePoll: (messageId: string, optionId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newContent: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  users,
  currentUser,
  onOpenThread,
  onAddReaction,
  onToggleSave,
  onTogglePin,
  onVotePoll,
  onDeleteMessage,
  onEditMessage,
}) => {
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeEmojiPickerMsgId, setActiveEmojiPickerMsgId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

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

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleReactionClick = (msgId: string, emoji: string) => {
    onAddReaction(msgId, emoji);
    sound.playReaction();
    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
    });
  };

  const handleAudioToggle = (attId: string) => {
    if (playingAudioId === attId) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(attId);
      sound.playNotification();
    }
  };

  // Helper to parse message text into rich formatted components
  const renderFormattedContent = (content: string) => {
    // Check if code block exists ```lang\ncode```
    const codeBlockMatch = content.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);

    if (codeBlockMatch) {
      const lang = codeBlockMatch[1] || 'code';
      const code = codeBlockMatch[2];
      const parts = content.split(/```[a-zA-Z0-9_-]*\n[\s\S]*?```/);

      return (
        <div className="space-y-2">
          {parts[0] && <p className="leading-relaxed whitespace-pre-wrap">{formatInline(parts[0])}</p>}
          
          <div className="relative my-2 rounded-lg bg-neutral-900 text-neutral-100 p-3 font-mono text-xs border border-neutral-800 shadow-sm group/code">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[10px] text-neutral-400">
              <span className="uppercase font-bold text-amber-400">{lang}</span>
              <button
                onClick={() => handleCopyCode(code, 'cb-' + content.slice(0, 10))}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                {copiedCodeId === 'cb-' + content.slice(0, 10) ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto">
              <code>{code}</code>
            </pre>
          </div>

          {parts[1] && <p className="leading-relaxed whitespace-pre-wrap">{formatInline(parts[1])}</p>}
        </div>
      );
    }

    return <p className="leading-relaxed whitespace-pre-wrap">{formatInline(content)}</p>;
  };

  const formatInline = (text: string) => {
    // Bold, code, mentions
    const tokens = text.split(/(\*\*.*?\*\*|`.*?`|@[a-zA-Z0-9._-]+)/g);

    return tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={i} className="font-bold text-neutral-900 dark:text-white">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-rose-600 dark:text-rose-400 font-mono text-xs">
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('@')) {
        return (
          <span key={i} className="px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold cursor-pointer hover:underline">
            {token}
          </span>
        );
      }
      return token;
    });
  };

  return (
    <div id="slack-message-list" className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      {/* Date Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
        </div>
        <div className="relative px-3 py-0.5 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 shadow-sm select-none">
          Thursday, August 21st
        </div>
      </div>

      {messages.map((msg, index) => {
        const sender = getUser(msg.senderId);
        const isOwn = msg.senderId === currentUser.id;
        const isHovered = hoveredMessageId === msg.id;
        const prevMsg = index > 0 ? messages[index - 1] : null;
        const isCompact = prevMsg && prevMsg.senderId === msg.senderId && prevMsg.dateKey === msg.dateKey && !msg.poll && !msg.attachments?.length;

        return (
          <div
            key={msg.id}
            onMouseEnter={() => setHoveredMessageId(msg.id)}
            onMouseLeave={() => {
              setHoveredMessageId(null);
              if (activeEmojiPickerMsgId === msg.id) setActiveEmojiPickerMsgId(null);
            }}
            className={`relative group rounded-lg px-3 py-1.5 transition-colors ${
              msg.isPinned
                ? 'bg-amber-500/5 border-l-2 border-amber-500'
                : isHovered
                ? 'bg-neutral-100/80 dark:bg-neutral-800/60'
                : 'hover:bg-neutral-100/40 dark:hover:bg-neutral-800/30'
            }`}
          >
            {/* Pinned Banner */}
            {msg.isPinned && (
              <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold mb-1">
                <Pin className="w-3 h-3" />
                <span>Pinned to this channel</span>
              </div>
            )}

            {/* Hover Floating Action Bar */}
            {isHovered && (
              <div className="absolute right-4 -top-3 z-30 flex items-center gap-0.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md shadow-lg p-0.5 text-neutral-600 dark:text-neutral-300 animate-in fade-in zoom-in-95">
                {/* Quick Emoji React buttons */}
                {['👍', '❤️', '🔥', '🚀'].map((em) => (
                  <button
                    key={em}
                    onClick={() => handleReactionClick(msg.id, em)}
                    title={`React with ${em}`}
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-sm transition-transform active:scale-125"
                  >
                    {em}
                  </button>
                ))}

                {/* More Emojis Picker Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setActiveEmojiPickerMsgId(activeEmojiPickerMsgId === msg.id ? null : msg.id)}
                    title="Add reaction"
                    className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <Smile className="w-3.5 h-3.5" />
                  </button>

                  {/* Emoji Picker Popover */}
                  {activeEmojiPickerMsgId === msg.id && (
                    <div className="absolute right-0 top-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-2 w-56 z-50 animate-in fade-in">
                      <div className="text-[10px] text-neutral-400 font-bold mb-1.5 uppercase">Quick Reactions</div>
                      <div className="grid grid-cols-6 gap-1">
                        {COMMON_EMOJIS.map((em) => (
                          <button
                            key={em}
                            onClick={() => {
                              handleReactionClick(msg.id, em);
                              setActiveEmojiPickerMsgId(null);
                            }}
                            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-base transition-transform hover:scale-125"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply in Thread */}
                <button
                  onClick={() => onOpenThread(msg)}
                  title="Reply in thread"
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>

                {/* Save / Bookmark */}
                <button
                  onClick={() => onToggleSave(msg.id)}
                  title={msg.isSaved ? 'Remove from saved' : 'Save message'}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      msg.isSaved ? 'fill-amber-500 text-amber-500' : ''
                    }`}
                  />
                </button>

                {/* Pin Message */}
                <button
                  onClick={() => onTogglePin(msg.id)}
                  title={msg.isPinned ? 'Unpin message' : 'Pin message'}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  <Pin
                    className={`w-3.5 h-3.5 ${
                      msg.isPinned ? 'fill-amber-500 text-amber-500' : ''
                    }`}
                  />
                </button>

                {/* Edit / Delete if Own */}
                {isOwn && (
                  <>
                    <button
                      onClick={() => {
                        setEditingMessageId(msg.id);
                        setEditContent(msg.content);
                      }}
                      title="Edit message"
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      title="Delete message"
                      className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Message Body */}
            <div className="flex items-start gap-3">
              {!isCompact ? (
                <img
                  src={sender.avatar}
                  alt={sender.name}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0 mt-0.5 ring-1 ring-black/10 shadow-sm cursor-pointer hover:opacity-90"
                />
              ) : (
                <div className="w-9 flex-shrink-0 text-right text-[10px] text-neutral-400 opacity-0 group-hover:opacity-100 select-none pt-1 font-mono">
                  {msg.timestamp.split(' ')[0]}
                </div>
              )}

              <div className="flex-1 min-w-0">
                {!isCompact && (
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white cursor-pointer hover:underline">
                      {sender.name}
                    </span>
                    {sender.isBot && (
                      <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold uppercase">
                        APP
                      </span>
                    )}
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* Content or Edit Form */}
                {editingMessageId === msg.id ? (
                  <div className="mt-1 space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full p-2 text-xs rounded-md bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => {
                          onEditMessage(msg.id, editContent);
                          setEditingMessageId(null);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="px-2.5 py-1 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed break-words">
                    {renderFormattedContent(msg.content)}
                    {msg.isEdited && (
                      <span className="text-[10px] text-neutral-400 ml-1.5 italic">(edited)</span>
                    )}
                  </div>
                )}

                {/* Attachments Section */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((att) => {
                      if (att.type === 'image' && att.url) {
                        return (
                          <div key={att.id} className="relative rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 max-w-md shadow-sm">
                            <img
                              src={att.url}
                              alt={att.name}
                              className="w-full h-auto object-cover max-h-72 cursor-pointer hover:opacity-95"
                            />
                            <div className="p-2 bg-neutral-900/80 text-white text-[11px] flex justify-between items-center backdrop-blur-sm">
                              <span className="truncate">{att.name}</span>
                              <span className="text-neutral-400 font-mono text-[10px]">{att.size}</span>
                            </div>
                          </div>
                        );
                      }

                      if (att.type === 'audio') {
                        const isPlaying = playingAudioId === att.id;
                        return (
                          <div key={att.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 max-w-sm">
                            <button
                              onClick={() => handleAudioToggle(att.id)}
                              className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-transform active:scale-95 shadow-sm"
                            >
                              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </button>

                            <div className="flex-1">
                              <div className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                                {att.name}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {[40, 70, 90, 60, 30, 80, 100, 50, 40, 90, 60, 85, 35, 75, 95].map((height, idx) => (
                                  <div
                                    key={idx}
                                    style={{ height: `${height * 0.16}px` }}
                                    className={`w-1 rounded-full ${
                                      isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300 dark:bg-neutral-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-500">
                              0:{att.durationSec || 30}
                            </span>
                          </div>
                        );
                      }

                      if (att.type === 'link_preview') {
                        return (
                          <div key={att.id} className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 border-l-4 border-emerald-500 border-t border-r border-b border-neutral-200 dark:border-neutral-700 max-w-lg space-y-1">
                            <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                              <ExternalLink className="w-3 h-3 text-emerald-500" />
                              <span>{att.previewSite}</span>
                            </div>
                            <h4 className="font-bold text-xs text-neutral-900 dark:text-white hover:underline cursor-pointer">
                              {att.previewTitle}
                            </h4>
                            <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                              {att.previewDescription}
                            </p>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}

                {/* Interactive Poll Widget */}
                {msg.poll && (
                  <div className="mt-2.5 p-3.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 max-w-md shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-800">
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white">
                        {msg.poll.question}
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        ACTIVE POLL
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.poll.options.map((option) => {
                        const hasVoted = option.votes.includes(currentUser.id);
                        const totalVotes = msg.poll!.options.reduce((acc, opt) => acc + opt.votes.length, 0);
                        const pct = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;

                        return (
                          <div key={option.id} className="space-y-1">
                            <button
                              onClick={() => {
                                onVotePoll(msg.id, option.id);
                                sound.playReaction();
                              }}
                              className={`w-full p-2 rounded-md border text-left flex items-center justify-between text-xs transition-all ${
                                hasVoted
                                  ? 'border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300'
                                  : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                              }`}
                            >
                              <span>{option.text}</span>
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <span>{option.votes.length} votes</span>
                                <span className="text-[10px] text-neutral-400">({pct}%)</span>
                              </div>
                            </button>

                            {/* Progress bar */}
                            <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-emerald-500 transition-all duration-300"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Emoji Reactions List */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {msg.reactions.map((r, rIdx) => {
                      const hasReacted = r.userIds.includes(currentUser.id);
                      return (
                        <button
                          key={rIdx}
                          onClick={() => handleReactionClick(msg.id, r.emoji)}
                          title={`${r.userIds.length} people reacted`}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all transform active:scale-110 ${
                            hasReacted
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-600 dark:text-blue-300 shadow-sm'
                              : 'bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                          }`}
                        >
                          <span>{r.emoji}</span>
                          <span className="text-[11px] font-mono">{r.count}</span>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setActiveEmojiPickerMsgId(activeEmojiPickerMsgId === msg.id ? null : msg.id)}
                      className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
                      title="Add reaction"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Thread Replies Button */}
                {msg.replyCount && msg.replyCount > 0 ? (
                  <button
                    onClick={() => onOpenThread(msg)}
                    className="flex items-center gap-2 mt-2 px-2.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors group/thread"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{msg.replyCount} {msg.replyCount === 1 ? 'reply' : 'replies'}</span>
                    <span className="text-[10px] text-neutral-400 font-normal group-hover/thread:underline">
                      Last reply {msg.lastReplyTimestamp || 'recently'}
                    </span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
