import React, { useState } from 'react';
import { ChannelCanvas, User } from '../types';
import { 
  FileText, 
  X, 
  CheckSquare, 
  Plus, 
  Save, 
  Sparkles, 
  Clock, 
  Share2, 
  Check, 
  Trash2,
  Lock,
  ListTodo
} from 'lucide-react';
import { sound } from '../utils/sound';

interface ChannelCanvasModalProps {
  canvas: ChannelCanvas | null;
  channelName?: string;
  onClose: () => void;
  onSaveCanvas: (updatedCanvas: ChannelCanvas) => void;
  currentUser: User;
}

export const ChannelCanvasModal: React.FC<ChannelCanvasModalProps> = ({
  canvas,
  channelName,
  onClose,
  onSaveCanvas,
  currentUser,
}) => {
  const defaultCanvas: ChannelCanvas = canvas || {
    id: `canvas-${Date.now()}`,
    channelId: 'general',
    title: `${channelName || 'Workspace'} Documentation & Checklist`,
    content: `# ${channelName || 'Team'} Overview\n\nWelcome to our live channel canvas! Use this space to document sprint goals, links, on-call schedules, and key architectural decisions.\n\n### 🎯 Sprint Deliverables\n- [x] Launch real-time messaging engine\n- [x] Configure audio huddle room synthesis\n- [ ] Deploy production release to staging\n\n### 🔗 Useful Links\n- Production API Endpoint: https://api.slack-preview.internal\n- Design System Docs: https://design.internal/tokens`,
    lastEditedBy: currentUser.name,
    lastEditedAt: 'Just now',
    blocks: [
      { id: 'b-1', type: 'heading', content: 'Sprint Focus & Key OKRs' },
      { id: 'b-2', type: 'checklist', content: 'Design review with product managers', isChecked: true },
      { id: 'b-3', type: 'checklist', content: 'Setup WebAudio huddle synthesizer', isChecked: true },
      { id: 'b-4', type: 'checklist', content: 'Finalize emoji reaction reactions system', isChecked: false },
      { id: 'b-5', type: 'paragraph', content: 'Please ensure all PRs have at least 2 approvals before merging to main branch.' }
    ],
  };

  const [activeCanvas, setActiveCanvas] = useState<ChannelCanvas>(defaultCanvas);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleToggleCheck = (blockId: string) => {
    const updatedBlocks = activeCanvas.blocks.map((b) =>
      b.id === blockId ? { ...b, isChecked: !b.isChecked } : b
    );
    const updated = {
      ...activeCanvas,
      blocks: updatedBlocks,
      lastEditedBy: currentUser.name,
      lastEditedAt: 'Just now',
    };
    setActiveCanvas(updated);
    onSaveCanvas(updated);
    sound.playReaction();
  };

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    const newBlock = {
      id: `b-${Date.now()}`,
      type: 'checklist' as const,
      content: newChecklistText.trim(),
      isChecked: false,
    };
    const updated = {
      ...activeCanvas,
      blocks: [...activeCanvas.blocks, newBlock],
      lastEditedBy: currentUser.name,
      lastEditedAt: 'Just now',
    };
    setActiveCanvas(updated);
    onSaveCanvas(updated);
    setNewChecklistText('');
    sound.playSend();
  };

  const handleDeleteBlock = (blockId: string) => {
    const updated = {
      ...activeCanvas,
      blocks: activeCanvas.blocks.filter((b) => b.id !== blockId),
      lastEditedBy: currentUser.name,
      lastEditedAt: 'Just now',
    };
    setActiveCanvas(updated);
    onSaveCanvas(updated);
  };

  return (
    <div
      id="slack-canvas-drawer"
      className="w-96 flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#1A1D21] border-l border-neutral-200 dark:border-[#2C3136] z-20 shadow-2xl"
    >
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-200 dark:border-[#2C3136] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-neutral-900 dark:text-white block truncate">
              Canvas: #{channelName || 'workspace'}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">
              Edited by {activeCanvas.lastEditedBy}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Title */}
        <input
          type="text"
          value={activeCanvas.title}
          onChange={(e) => setActiveCanvas({ ...activeCanvas, title: e.target.value })}
          className="w-full text-base font-black bg-transparent text-neutral-900 dark:text-white border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 outline-none pb-1"
        />

        {/* Content Blocks */}
        <div className="space-y-2">
          {activeCanvas.blocks.map((block) => {
            if (block.type === 'heading') {
              return (
                <h3 key={block.id} className="font-bold text-sm text-neutral-900 dark:text-white pt-2 border-b border-neutral-100 dark:border-neutral-800 pb-1 flex justify-between items-center group">
                  <span>{block.content}</span>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </h3>
              );
            }

            if (block.type === 'checklist') {
              return (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/60 group text-xs transition-colors"
                >
                  <label className="flex items-center gap-2 cursor-pointer select-none flex-1 truncate">
                    <input
                      type="checkbox"
                      checked={block.isChecked || false}
                      onChange={() => handleToggleCheck(block.id)}
                      className="rounded accent-emerald-600 w-3.5 h-3.5"
                    />
                    <span
                      className={`truncate ${
                        block.isChecked
                          ? 'line-through text-neutral-400 dark:text-neutral-500'
                          : 'text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {block.content}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={block.id}
                className="p-2 text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/40 rounded-md border border-neutral-200 dark:border-neutral-700/50 relative group"
              >
                <p>{block.content}</p>
                <button
                  onClick={() => handleDeleteBlock(block.id)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Checklist Item */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Add Action Item
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChecklist()}
              placeholder="e.g. Test iOS push notification trigger..."
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 outline-none text-neutral-900 dark:text-white"
            />
            <button
              onClick={handleAddChecklist}
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
