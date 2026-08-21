import React, { useState } from 'react';
import { X, Volume2, Bell } from 'lucide-react';
import { sound } from '../utils/sound';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'sound' | 'notifications'>('sound');
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!isOpen) return null;

  const handleTestSound = (type: 'send' | 'reaction' | 'huddle') => {
    if (type === 'send') sound.playSend();
    if (type === 'reaction') sound.playReaction();
    if (type === 'huddle') sound.playHuddleJoin();
  };

  return (
    <div
      id="slack-preferences-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="slack-preferences-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 flex flex-col md:flex-row max-h-[85vh] text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Tabs Sidebar */}
        <div className="w-full md:w-48 bg-neutral-50 p-4 border-r border-neutral-200 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-black text-sm mb-3">Preferences</h3>
            <button
              onClick={() => setActiveTab('sound')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-left transition-colors ${
                activeTab === 'sound'
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Audio & Sounds</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-left transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
            <h4 className="font-bold text-base capitalize">{activeTab} Settings</h4>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {activeTab === 'sound' && (
            <div className="space-y-4 text-xs">
              <p className="text-neutral-500">
                Slack Web Audio synthesized sound effects for sends, reactions, and calls.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleTestSound('send')}
                  className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <span className="font-bold">Play Message Sent &apos;Knock-Knock&apos;</span>
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                </button>

                <button
                  onClick={() => handleTestSound('reaction')}
                  className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <span className="font-bold">Play Emoji Reaction Pop</span>
                  <Volume2 className="w-4 h-4 text-amber-500" />
                </button>

                <button
                  onClick={() => handleTestSound('huddle')}
                  className="w-full p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  <span className="font-bold">Play Huddle Chime Tone</span>
                  <Volume2 className="w-4 h-4 text-indigo-500" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-bold">Notify me about:</span>
                  <select className="p-1 rounded bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs">
                    <option>All new messages</option>
                    <option>Direct messages & mentions</option>
                    <option>Nothing</option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
