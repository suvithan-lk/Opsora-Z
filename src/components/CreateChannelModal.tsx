import React, { useState } from 'react';
import { Hash, Lock, X } from 'lucide-react';
import { sound } from '../utils/sound';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChannel: (name: string, topic: string, isPrivate: boolean) => void;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  onCreateChannel,
}) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
    if (!cleanName) return;

    onCreateChannel(cleanName, topic, isPrivate);
    sound.playSend();
    setName('');
    setTopic('');
    setIsPrivate(false);
    onClose();
  };

  return (
    <div
      id="slack-create-channel-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="slack-create-channel-modal"
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-6 animate-in zoom-in-95 text-neutral-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-neutral-100 dark:bg-neutral-800">
              {isPrivate ? <Lock className="w-5 h-5 text-amber-500" /> : <Hash className="w-5 h-5 text-neutral-500" />}
            </div>
            <h3 className="font-bold text-base">Create a channel</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">Name</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-neutral-400 font-mono">#</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. plan-launch"
                required
                className="w-full pl-7 pr-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Channels are where conversations happen around a topic.
            </p>
          </div>

          <div>
            <label className="block font-bold mb-1">Topic / Description (optional)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
            <div>
              <div className="font-bold text-neutral-900 dark:text-white">Make private</div>
              <div className="text-[11px] text-neutral-500">
                When a channel is private, it can only be viewed or joined by invitation.
              </div>
            </div>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 rounded accent-[#007A5A] cursor-pointer"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={`px-5 py-2 rounded-lg font-bold text-white transition-all ${
                name.trim()
                  ? 'bg-[#007A5A] hover:bg-[#00664B] shadow-md'
                  : 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
              }`}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
