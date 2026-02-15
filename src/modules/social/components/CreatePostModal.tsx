import { useState } from 'react';
import {
    X,
    Smile,
    Send,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import { postsAPI } from '@/api/v2/posts';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const user = useSelector((state: RootState) => state.user.data);

    if (!isOpen) return null;

    const handleCreatePost = async () => {
        setIsSubmitting(true);
        try {
            await postsAPI.create({ content });
            setContent('');
            setShowEmojiPicker(false);
            onClose();
            // Trigger refresh - ideally via context or callback
            window.dispatchEvent(new CustomEvent('refresh-feed'));
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setContent(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-xl bg-white dark:bg-[#111114] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col my-auto max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 shrink-0">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Post</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
                        {/* User Context */}
                        <div className="flex items-center gap-3 mb-4">
                            <img
                                key={user?.id || user?.name}
                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'User'}`}
                                alt="Profile"
                                className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-700"
                            />
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{user?.name || 'User'}</h3>
                                {user?.team_name && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.team_name}</p>
                                )}
                            </div>
                        </div>

                        {/* Minimal Input Area */}
                        <div className="relative">
                            <textarea
                                className="w-full bg-transparent text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-none min-h-[150px]"
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                autoFocus
                            />
                        </div>

                    </div>

                    {/* Footer / Actions */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between shrink-0 relative">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                            >
                                <Smile size={20} />
                            </button>

                            {/* Emoji Picker Popover */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-full left-0 mb-2 z-50 shadow-2xl rounded-xl">
                                    <EmojiPicker
                                        onEmojiClick={onEmojiClick}
                                        width={350}
                                        height={400}
                                        theme={(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') as Theme}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePost}
                                disabled={!content.trim() || isSubmitting}
                                className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 ${(!content.trim() || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                <span>Post</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
