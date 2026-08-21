import React, { useState, useRef, useEffect } from 'react';
import { User, MessageAttachment, MessagePoll } from '../types';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Paperclip, 
  Smile, 
  AtSign, 
  Mic, 
  MicOff, 
  Send, 
  ChevronDown, 
  Sparkles, 
  Image as ImageIcon, 
  FileCode, 
  BarChart2, 
  Clock, 
  X,
  Radio,
  CornerDownLeft
} from 'lucide-react';
import { sound } from '../utils/sound';
import { COMMON_EMOJIS } from '../data/mockSlackData';

interface MessageComposerProps {
  channelName?: string;
  recipientName?: string;
  onSendMessage: (
    content: string, 
    attachments?: MessageAttachment[], 
    poll?: MessagePoll
  ) => void;
  users: User[];
  currentUser: User;
  placeholder?: string;
  isThread?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  channelName,
  recipientName,
  onSendMessage,
  users,
  currentUser,
  placeholder,
  isThread = false,
}) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioTimer, setAudioTimer] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<MessageAttachment[]>([]);
  const [isAiPolishing, setIsAiPolishing] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Audio timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingAudio) {
      interval = setInterval(() => {
        setAudioTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setAudioTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingAudio]);

  const targetLabel = channelName ? `#${channelName}` : recipientName || 'message';

  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + (selected.length || 4)
        );
      }
    }, 10);
  };

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    // Check for slash commands
    if (trimmed.startsWith('/shrug')) {
      const remaining = trimmed.replace('/shrug', '').trim();
      onSendMessage(`${remaining} ¯\\_(ツ)_/¯`, attachedFiles);
    } else if (trimmed.startsWith('/poll')) {
      // Parse poll syntax: /poll "Question" "Opt1" "Opt2"
      const matches = trimmed.match(/"([^"]+)"/g);
      if (matches && matches.length >= 2) {
        const question = matches[0].replace(/"/g, '');
        const options = matches.slice(1).map((opt, i) => ({
          id: `opt-${Date.now()}-${i}`,
          text: opt.replace(/"/g, ''),
          votes: [],
        }));
        const poll: MessagePoll = {
          id: `poll-${Date.now()}`,
          question,
          options,
          creatorId: currentUser.id,
        };
        onSendMessage(question, attachedFiles, poll);
      } else {
        onSendMessage(trimmed, attachedFiles);
      }
    } else if (trimmed.startsWith('/giphy')) {
      const query = trimmed.replace('/giphy', '').trim() || 'celebration';
      const gifAttachment: MessageAttachment = {
        id: `att-gif-${Date.now()}`,
        name: `${query}.gif`,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
        size: '1.4 MB',
      };
      onSendMessage(`*Giphy search: "${query}"*`, [gifAttachment]);
    } else {
      onSendMessage(trimmed, attachedFiles.length > 0 ? attachedFiles : undefined);
    }

    sound.playSend();
    setContent('');
    setAttachedFiles([]);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setShowMentionMenu(false);
    setShowSlashMenu(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    // Auto slash menu trigger
    if (val.startsWith('/') && val.length <= 6) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }

    // Auto mention trigger
    if (val.endsWith('@')) {
      setShowMentionMenu(true);
    } else if (!val.includes('@')) {
      setShowMentionMenu(false);
    }
  };

  const addPresetAttachment = (type: 'image' | 'code' | 'audio') => {
    if (type === 'image') {
      setAttachedFiles((prev) => [
        ...prev,
        {
          id: `att-img-${Date.now()}`,
          name: 'Sprint-Architecture-Diagram.png',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
          size: '620 KB',
        },
      ]);
    } else if (type === 'code') {
      setAttachedFiles((prev) => [
        ...prev,
        {
          id: `att-code-${Date.now()}`,
          name: 'rate-limiter-redis.ts',
          type: 'code',
          codeLanguage: 'typescript',
          size: '3.1 KB',
        },
      ]);
      setContent((prev) => prev + '\n```typescript\nexport const rateLimiter = new TokenBucket({ capacity: 100, refillRate: 10 });\n```');
    }
    setShowAttachMenu(false);
  };

  const handleStopAudioRecording = () => {
    setIsRecordingAudio(false);
    setAttachedFiles((prev) => [
      ...prev,
      {
        id: `att-audio-${Date.now()}`,
        name: `Audio Voice Clip (${audioTimer}s).wav`,
        type: 'audio',
        durationSec: Math.max(2, audioTimer),
        size: `${(audioTimer * 0.05).toFixed(1)} MB`,
      },
    ]);
    sound.playReaction();
  };

  // AI Message Polish simulation
  const handleAiPolish = () => {
    if (!content.trim()) return;
    setIsAiPolishing(true);
    setTimeout(() => {
      const polished = `✨ **Refined Update**: ${content.trim()}\n\n*Key takeaways and next steps aligned with the team roadmap.*`;
      setContent(polished);
      setIsAiPolishing(false);
      sound.playReaction();
    }, 600);
  };

  return (
    <div
      id="slack-message-composer"
      className="p-3 bg-white dark:bg-[#1A1D21] border-t border-neutral-200 dark:border-[#2C3136] relative flex-shrink-0"
    >
      {/* Attached Files Chips */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-medium"
            >
              {f.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-blue-500" />}
              {f.type === 'code' && <FileCode className="w-3.5 h-3.5 text-amber-500" />}
              {f.type === 'audio' && <Radio className="w-3.5 h-3.5 text-emerald-500" />}
              <span className="truncate max-w-[150px]">{f.name}</span>
              <button
                onClick={() => setAttachedFiles(attachedFiles.filter((item) => item.id !== f.id))}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Audio Recording Active Banner */}
      {isRecordingAudio && (
        <div className="flex items-center justify-between p-2.5 mb-2 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-bold">RECORDING VOICE CLIP...</span>
            <span>0:{audioTimer.toString().padStart(2, '0')}</span>
          </div>
          <button
            onClick={handleStopAudioRecording}
            className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
          >
            Attach Audio
          </button>
        </div>
      )}

      {/* Message Box Card */}
      <div className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm focus-within:border-neutral-500 dark:focus-within:border-neutral-500 transition-colors">
        {/* Top Formatting Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => applyFormatting('**')}
            title="Bold (Ctrl+B)"
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting('*')}
            title="Italic (Ctrl+I)"
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting('~')}
            title="Strikethrough"
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

          <button
            onClick={() => applyFormatting('`')}
            title="Inline Code"
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting('```typescript\n', '\n```')}
            title="Code Block"
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white text-xs font-mono"
          >
            {'</>'}
          </button>

          <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

          <button
            onClick={() => applyFormatting('> ')}
            title="Quote"
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting('• ')}
            title="Bullet list"
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* AI Message Polish */}
          <button
            onClick={handleAiPolish}
            disabled={!content.trim() || isAiPolishing}
            title="AI Polish / Refine Draft"
            className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
              content.trim()
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
                : 'text-neutral-400 opacity-40 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>{isAiPolishing ? 'Polishing...' : 'AI Polish'}</span>
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Send a message to ${targetLabel}...`}
          rows={isThread ? 2 : 3}
          className="w-full p-3 bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none resize-none leading-relaxed"
        />

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between px-2 py-1.5 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
            {/* Attachment Button */}
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                title="Attach file, screenshot, or code"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Attachment Popup Menu */}
              {showAttachMenu && (
                <div className="absolute bottom-9 left-0 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-1.5 z-50 text-xs animate-in fade-in">
                  <button
                    onClick={() => addPresetAttachment('image')}
                    className="w-full px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-left"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    <span>Upload Image Mockup</span>
                  </button>
                  <button
                    onClick={() => addPresetAttachment('code')}
                    className="w-full px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-left"
                  >
                    <FileCode className="w-3.5 h-3.5 text-amber-500" />
                    <span>Attach Code Snippet</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAttachMenu(false);
                      setContent('/poll "Weekly Sync Time?" "10:00 AM" "2:00 PM" "4:00 PM"');
                    }}
                    className="w-full px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-left"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Create Team Poll</span>
                  </button>
                </div>
              )}
            </div>

            {/* Emoji Picker Button */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Insert emoji"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-9 left-0 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-2 z-50 animate-in fade-in">
                  <div className="text-[10px] text-neutral-400 font-bold mb-1.5 uppercase">Emojis</div>
                  <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto">
                    {COMMON_EMOJIS.map((em) => (
                      <button
                        key={em}
                        onClick={() => {
                          setContent((prev) => prev + em);
                          setShowEmojiPicker(false);
                        }}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-lg transition-transform hover:scale-125"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mention @ Button */}
            <button
              onClick={() => setShowMentionMenu(!showMentionMenu)}
              title="Mention someone"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <AtSign className="w-4 h-4" />
            </button>

            {/* Audio Voice Note Record */}
            <button
              onClick={() => {
                if (isRecordingAudio) {
                  handleStopAudioRecording();
                } else {
                  setIsRecordingAudio(true);
                  sound.playHuddleJoin();
                }
              }}
              title={isRecordingAudio ? 'Stop Recording' : 'Record Video / Voice Clip'}
              className={`p-1.5 rounded transition-colors ${
                isRecordingAudio
                  ? 'bg-rose-500 text-white'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Send Button & Schedule dropdown */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() => setShowScheduleMenu(!showScheduleMenu)}
                title="Schedule Send"
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
              </button>

              {/* Schedule Send Menu */}
              {showScheduleMenu && (
                <div className="absolute bottom-9 right-0 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-1.5 z-50 text-xs animate-in fade-in">
                  <div className="px-2 py-1 text-[10px] text-neutral-400 font-bold uppercase">Schedule Message</div>
                  <button
                    onClick={() => {
                      setShowScheduleMenu(false);
                      handleSend();
                    }}
                    className="w-full px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                  >
                    Tomorrow at 9:00 AM
                  </button>
                  <button
                    onClick={() => {
                      setShowScheduleMenu(false);
                      handleSend();
                    }}
                    className="w-full px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                  >
                    Monday at 9:00 AM
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSend}
              disabled={!content.trim() && attachedFiles.length === 0}
              className={`p-1.5 px-3 rounded-md font-bold text-xs flex items-center gap-1 transition-all ${
                content.trim() || attachedFiles.length > 0
                  ? 'bg-[#007A5A] hover:bg-[#00664B] text-white shadow-sm cursor-pointer'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mention Auto-Suggest Menu */}
      {showMentionMenu && (
        <div className="absolute bottom-24 left-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-1 w-60 z-50 animate-in fade-in">
          <div className="px-2 py-1 text-[10px] text-neutral-400 font-bold uppercase">Members</div>
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setContent((prev) => prev.replace(/@$/, '') + `@${u.displayName} `);
                setShowMentionMenu(false);
              }}
              className="w-full p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs text-left"
            >
              <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-md object-cover" />
              <div className="truncate">
                <span className="font-bold">{u.name}</span>
                <span className="text-[10px] text-neutral-400 ml-1">@{u.displayName}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Slash Commands Auto-Suggest Menu */}
      {showSlashMenu && (
        <div className="absolute bottom-24 left-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-2xl p-1.5 w-72 z-50 animate-in fade-in">
          <div className="px-2 py-1 text-[10px] text-neutral-400 font-bold uppercase">Slash Commands</div>
          <button
            onClick={() => {
              setContent('/poll "Question" "Option 1" "Option 2"');
              setShowSlashMenu(false);
            }}
            className="w-full p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs text-left"
          >
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            <div>
              <span className="font-mono font-bold">/poll</span>
              <p className="text-[10px] text-neutral-400">Create an interactive team poll</p>
            </div>
          </button>
          <button
            onClick={() => {
              setContent('/shrug ');
              setShowSlashMenu(false);
            }}
            className="w-full p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs text-left"
          >
            <Smile className="w-4 h-4 text-amber-500" />
            <div>
              <span className="font-mono font-bold">/shrug</span>
              <p className="text-[10px] text-neutral-400">Appends ¯\_(ツ)_/¯</p>
            </div>
          </button>
          <button
            onClick={() => {
              setContent('/giphy celebration');
              setShowSlashMenu(false);
            }}
            className="w-full p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2 text-xs text-left"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <div>
              <span className="font-mono font-bold">/giphy</span>
              <p className="text-[10px] text-neutral-400">Search and post an animated GIF</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
