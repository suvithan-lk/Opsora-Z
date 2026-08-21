import React, { useState, useEffect } from 'react';
import { HuddleState, User } from '../types';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Smile, 
  Volume2, 
  Users, 
  Share2, 
  Maximize2, 
  Minimize2,
  Radio,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/sound';

interface HuddleOverlayProps {
  huddleState: HuddleState;
  currentUser: User;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeaveHuddle: () => void;
  onSendHuddleReaction: (emoji: string) => void;
}

export const HuddleOverlay: React.FC<HuddleOverlayProps> = ({
  huddleState,
  currentUser,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveHuddle,
  onSendHuddleReaction,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState(0);

  // Simulate active speaker switching
  useEffect(() => {
    const interval = setInterval(() => {
      if (huddleState.participants.length > 0) {
        const randomIdx = Math.floor(Math.random() * huddleState.participants.length);
        setActiveSpeakerIdx(randomIdx);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [huddleState.participants]);

  const handleEmojiBurst = (emoji: string) => {
    onSendHuddleReaction(emoji);
    sound.playReaction();
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  };

  if (!huddleState.isActive) return null;

  if (isMinimized) {
    return (
      <div
        id="slack-huddle-minimized"
        className="fixed bottom-6 right-6 z-50 bg-white text-neutral-900 rounded-full p-2 pl-4 pr-3 shadow-2xl border border-emerald-500/60 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-xs font-mono">
            Huddle #{huddleState.channelName || 'general'}
          </span>
        </div>

        <button
          onClick={onToggleMute}
          className={`p-1.5 rounded-full ${
            huddleState.isLocalMuted ? 'bg-rose-500/30 text-rose-300' : 'bg-emerald-500/30 text-emerald-300'
          }`}
        >
          {huddleState.isLocalMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setIsMinimized(false)}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500"
          title="Expand Huddle"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onLeaveHuddle}
          className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white"
          title="Leave Huddle"
        >
          <PhoneOff className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      id="slack-huddle-modal"
      className="fixed bottom-6 right-6 z-50 w-96 bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 flex flex-col"
    >
      {/* Top Huddle Bar */}
      <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="font-bold text-xs truncate">
            #{huddleState.channelName || 'general'} Huddle
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-md hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLeaveHuddle}
            className="p-1 rounded-md hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
            title="Leave Huddle"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Participants Video / Waveform Canvas */}
      <div className="p-4 bg-neutral-50 min-h-[220px] flex flex-col justify-center items-center relative">
        {/* Screen share banner simulation */}
        {huddleState.isScreenSharing && (
          <div className="absolute top-2 left-2 right-2 px-2.5 py-1 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold">
              <Monitor className="w-3 h-3" /> You are sharing your screen
            </span>
            <span className="font-mono">1080p 60fps</span>
          </div>
        )}

        {/* Participants Avatar Grid */}
        <div className="grid grid-cols-2 gap-3 w-full my-auto">
          {huddleState.participants.map((p, idx) => {
            const isSpeaking = idx === activeSpeakerIdx && !p.isMuted;
            return (
              <div
                key={p.userId}
                className={`relative rounded-xl p-3 bg-white border flex flex-col items-center justify-center transition-all ${
                  isSpeaking
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105'
                    : 'border-neutral-200'
                }`}
              >
                {/* Avatar with live pulse ring */}
                <div className="relative mb-2">
                  {isSpeaking && (
                    <div className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping" />
                  )}
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="relative w-12 h-12 rounded-full object-cover ring-2 ring-neutral-200"
                  />
                  {p.isMuted && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white">
                      ✕
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold truncate max-w-[100px] text-center">
                  {p.name}
                </span>

                {isSpeaking && (
                  <span className="text-[9px] font-mono text-emerald-400 font-bold mt-0.5">
                    SPEAKING...
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Reaction Emojis Row */}
      <div className="px-3 py-1.5 bg-white border-t border-neutral-200 flex items-center justify-around">
        {['🎉', '🔥', '❤️', '👏', '🚀', '💯'].map((em) => (
          <button
            key={em}
            onClick={() => handleEmojiBurst(em)}
            className="text-base p-1 hover:bg-neutral-100 rounded-lg transition-transform active:scale-150 hover:scale-125"
          >
            {em}
          </button>
        ))}
      </div>

      {/* Bottom Controls Dock */}
      <div className="p-3 bg-neutral-50 flex items-center justify-between border-t border-neutral-200">
        <div className="flex items-center gap-1.5">
          {/* Mute toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-xl font-bold transition-all active:scale-95 ${
              huddleState.isLocalMuted
                ? 'bg-rose-600/80 hover:bg-rose-500 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-emerald-600'
            }`}
          >
            {huddleState.isLocalMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Video toggle */}
          <button
            onClick={onToggleVideo}
            className={`p-2.5 rounded-xl font-bold transition-all active:scale-95 ${
              huddleState.isLocalVideo
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-500'
            }`}
          >
            {huddleState.isLocalVideo ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* Screen share toggle */}
          <button
            onClick={onToggleScreenShare}
            className={`p-2.5 rounded-xl font-bold transition-all active:scale-95 ${
              huddleState.isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-500'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* Leave button */}
        <button
          onClick={onLeaveHuddle}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
};
