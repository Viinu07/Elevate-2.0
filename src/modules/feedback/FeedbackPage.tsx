import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch, type RootState } from '@/store';
import { fetchReceivedFeedback, fetchSentFeedback, sendFeedback } from '@/store/collabSlice';
import { userService, type User } from '@/api/userService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Send,
    Sparkles,
    TrendingUp,
    MessageSquare,
    ThumbsUp,
    Heart,
    Lightbulb,
    CheckCircle,
    Edit2
} from 'lucide-react';
import { feedbackService } from '@/api/feedbackService';

// Category configuration with icons and colors
const CATEGORIES = {
    praise: {
        label: 'Praise',
        icon: '🎉',
        color: 'from-green-400 to-emerald-500',
        bgLight: 'bg-green-50',
        bgDark: 'dark:bg-green-900/20',
        textLight: 'text-green-700',
        textDark: 'dark:text-green-400',
        borderLight: 'border-green-200',
        borderDark: 'dark:border-green-800'
    },
    constructive: {
        label: 'Constructive',
        icon: '💡',
        color: 'from-blue-400 to-indigo-500',
        bgLight: 'bg-blue-50',
        bgDark: 'dark:bg-blue-900/20',
        textLight: 'text-blue-700',
        textDark: 'dark:text-blue-400',
        borderLight: 'border-blue-200',
        borderDark: 'dark:border-blue-800'
    },
    suggestion: {
        label: 'Suggestion',
        icon: '🚀',
        color: 'from-purple-400 to-pink-500',
        bgLight: 'bg-purple-50',
        bgDark: 'dark:bg-purple-900/20',
        textLight: 'text-purple-700',
        textDark: 'dark:text-purple-400',
        borderLight: 'border-purple-200',
        borderDark: 'dark:border-purple-800'
    },
    goal: {
        label: 'Goal Setting',
        icon: '🎯',
        color: 'from-orange-400 to-red-500',
        bgLight: 'bg-orange-50',
        bgDark: 'dark:bg-orange-900/20',
        textLight: 'text-orange-700',
        textDark: 'dark:text-orange-400',
        borderLight: 'border-orange-200',
        borderDark: 'dark:border-orange-800'
    },
    concern: {
        label: 'Concern',
        icon: '⚠️',
        color: 'from-yellow-400 to-amber-500',
        bgLight: 'bg-yellow-50',
        bgDark: 'dark:bg-yellow-900/20',
        textLight: 'text-yellow-700',
        textDark: 'dark:text-yellow-400',
        borderLight: 'border-yellow-200',
        borderDark: 'dark:border-yellow-800'
    }
};

const TEMPLATES = {
    praise: "I wanted to recognize your excellent work on...",
    constructive: "I've noticed an opportunity for growth in...",
    suggestion: "Have you considered trying...",
    goal: "Let's work together on achieving...",
    concern: "I wanted to discuss..."
};

export default function FeedbackPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { feedback } = useSelector((state: RootState) => state.collab);
    const currentUser = useSelector((state: RootState) => state.user.data);

    // Check if user is admin/manager - supports "Admin", "Admin User", "Manager", "Administrator", etc.
    const isManager = currentUser?.role?.toLowerCase().includes('admin') ||
        currentUser?.role?.toLowerCase().includes('manager');

    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedToUserId, setSelectedToUserId] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORIES | ''>('');

    // Search removed effectively

    // Track replies locally (feedbackId -> reply text)
    const [replies, setReplies] = useState<Record<string, string>>({});
    const [editingReply, setEditingReply] = useState<string | null>(null); // feedbackId being edited

    // Track reactions locally (feedbackId -> single reaction type or null)
    const [reactions, setReactions] = useState<Record<string, string | null>>({});

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchReceivedFeedback(currentUser.id));
            if (isManager) {
                dispatch(fetchSentFeedback(currentUser.id));
            }
        }
    }, [dispatch, currentUser, isManager]);

    // Initialize reactions from feedback data
    useEffect(() => {
        const initialReactions: Record<string, string | null> = {};
        const allFeedback = [...feedback.received, ...feedback.sent];
        allFeedback.forEach((item: any) => {
            if (item.reaction) {
                initialReactions[item.id] = item.reaction;
            }
        });
        setReactions(initialReactions);
    }, [feedback]);

    useEffect(() => {
        // Fetch all users for the user selector
        if (isManager) {
            userService.getUsers().then(setUsers);
        }
    }, [isManager]);

    const handleReaction = async (feedbackId: string, reactionType: string) => {
        const currentReaction = reactions[feedbackId];
        const newReaction = currentReaction === reactionType ? null : reactionType;

        // Optimistically update UI
        setReactions(prev => ({
            ...prev,
            [feedbackId]: newReaction
        }));

        // Persist to API
        try {
            const response = await fetch(`http://localhost:8000/api/v1/feedback/${feedbackId}/reaction?reaction=${newReaction || ''}`, {
                method: 'PATCH',
            });

            if (!response.ok) {
                // Revert on error
                setReactions(prev => ({
                    ...prev,
                    [feedbackId]: currentReaction
                }));
                console.error('Failed to update reaction');
            }
        } catch {
            // Revert on error
            setReactions(prev => ({
                ...prev,
                [feedbackId]: currentReaction
            }));
            console.error('Failed to update reaction');
        }


    };

    const handleReply = async (feedbackId: string) => {
        const replyText = replies[feedbackId];
        if (!replyText?.trim()) return;

        try {
            await feedbackService.updateReply(feedbackId, replyText);
            setEditingReply(null);
            // Refresh feedback to get updated data
            if (activeTab === 'received') {
                dispatch(fetchReceivedFeedback(currentUser?.id || ''));
            } else {
                dispatch(fetchSentFeedback(currentUser?.id || ''));
            }
        } catch (error) {
            console.error('Error updating reply:', error);
        }
    };

    const handleSendFeedback = async () => {
        if (!currentUser || !selectedToUserId || !content.trim()) return;

        await dispatch(sendFeedback({
            from_user_id: currentUser.id,
            to_user_id: selectedToUserId,
            content
        }));

        // Refresh sent feedback
        if (currentUser) {
            dispatch(fetchSentFeedback(currentUser.id));
        }

        setShowModal(false);
        setSelectedToUserId('');
        setContent('');
        setSelectedCategory('');
    };

    const handleCategorySelect = (category: keyof typeof CATEGORIES) => {
        setSelectedCategory(category);
        setContent(TEMPLATES[category]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const handleTabClick = (tab: 'received' | 'sent') => {
        setActiveTab(tab);
        if (currentUser) {
            if (tab === 'received') {
                dispatch(fetchReceivedFeedback(currentUser.id));
            } else {
                dispatch(fetchSentFeedback(currentUser.id));
            }
        }
    };

    // Filter feedback
    const filteredFeedback = activeTab === 'received' ? feedback.received : feedback.sent;

    // Calculate statistics
    const totalReceived = feedback.received.length;
    const unreadCount = 0; // TODO: Implement read/unread tracking

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto w-full">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <Sparkles className="text-blue-500" size={36} />
                        {isManager ? 'Team Feedback' : 'My Feedback'}
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        {isManager
                            ? 'Share insights and guide your team to excellence'
                            : 'Your growth journey with feedback from managers'}
                    </p>
                </div>
                {isManager && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-xl"
                    >
                        <Send size={20} />
                        New Feedback
                    </button>
                )}
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
                        <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalReceived}</span>
                    </div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Received</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                        <span className="text-3xl font-bold text-purple-900 dark:text-purple-100">{unreadCount}</span>
                    </div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Unread</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <Sparkles className="text-green-600 dark:text-green-400" size={24} />
                        <span className="text-3xl font-bold text-green-900 dark:text-green-100">
                            {feedback.received.filter(f => f.content.length > 100).length}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Detailed</p>
                </div>
            </div>

            {/* Tabs (only show for managers) */}
            {isManager ? (
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button
                            onClick={() => handleTabClick('received')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'received'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                                }`}
                        >
                            Received
                        </button>
                        <button
                            onClick={() => handleTabClick('sent')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'sent'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                                }`}
                        >
                            Sent
                        </button>
                    </div>

                </div>
            ) : (
                <div className="mb-6"></div>
            )}

            {/* Feedback Cards */}
            <div className="space-y-4 max-w-5xl">
                {filteredFeedback.length > 0 ? (
                    filteredFeedback.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <img
                                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${item.from_user_name || 'User'}`}
                                        alt="Avatar"
                                        className="w-12 h-12 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
                                    />
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">
                                            {activeTab === 'sent' ? `To: ${item.to_user_name}` : `From: ${item.from_user_name}`}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {formatDate(item.date)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                                    "{item.content}"
                                </p>
                            </div>

                            {/* Reply / Action Plan Section */}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                {activeTab === 'received' ? (
                                    // Receiver View: Edit Reply
                                    <div className="space-y-3">
                                        {(editingReply === item.id || !item.reply) ? (
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <textarea
                                                        value={replies[item.id] || ''}
                                                        onChange={(e) => setReplies(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                        placeholder="Add an action plan or reply..."
                                                        className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
                                                        rows={2}
                                                        onFocus={() => setEditingReply(item.id)}
                                                    />
                                                </div>
                                                {editingReply === item.id && (
                                                    <button
                                                        onClick={() => handleReply(item.id)}
                                                        className="h-10 px-4 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <Send size={14} />
                                                        Save
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors group/reply"
                                                onClick={() => setEditingReply(item.id)}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Your Action Plan</h4>
                                                    <Edit2 size={12} className="text-slate-400 opacity-0 group-hover/reply:opacity-100 transition-opacity" />
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{item.reply}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Sender View: Read Only Reply
                                    item.reply ? (
                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Recipient's Action Plan</h4>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap pl-3.5 border-l-2 border-blue-200 dark:border-blue-800">{item.reply}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2">
                                            <p className="text-xs text-slate-400 italic">No action plan added yet</p>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Reaction Buttons (for both received and sent) */}
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => handleReaction(item.id, 'helpful')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${reactions[item.id] === 'helpful'
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                >
                                    <ThumbsUp size={16} className={reactions[item.id] === 'helpful' ? 'fill-current' : ''} />
                                    Helpful
                                </button>
                                <button
                                    onClick={() => handleReaction(item.id, 'appreciate')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${reactions[item.id] === 'appreciate'
                                        ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:text-pink-600 dark:hover:text-pink-400'
                                        }`}
                                >
                                    <Heart size={16} className={reactions[item.id] === 'appreciate' ? 'fill-current' : ''} />
                                    Appreciate
                                </button>
                                <button
                                    onClick={() => handleReaction(item.id, 'insightful')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${reactions[item.id] === 'insightful'
                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400'
                                        }`}
                                >
                                    <Lightbulb size={16} className={reactions[item.id] === 'insightful' ? 'fill-current' : ''} />
                                    Insightful
                                </button>
                                <button
                                    onClick={() => handleReaction(item.id, 'acknowledged')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${reactions[item.id] === 'acknowledged'
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
                                        }`}
                                >
                                    <CheckCircle size={16} className={reactions[item.id] === 'acknowledged' ? 'fill-current' : ''} />
                                    Acknowledged
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                            <MessageSquare className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            {`No feedback ${activeTab} yet`}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            {activeTab === 'received'
                                ? 'Feedback from your managers will appear here'
                                : 'Send your first feedback to get started'}
                        </p>
                    </div>
                )}
            </div>

            {/* Manager Feedback Modal */}
            <AnimatePresence>
                {showModal && isManager && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setShowModal(false)}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden w-full max-w-lg pointer-events-auto max-h-[85vh] flex flex-col"
                            >
                                {/* Modal Header */}
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send Feedback</h3>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-5 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
                                    {/* Category Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                            Feedback Type
                                        </label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {Object.entries(CATEGORIES).map(([key, cat]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => handleCategorySelect(key as keyof typeof CATEGORIES)}
                                                    className={`p-2.5 rounded-lg border-2 transition-all text-center ${selectedCategory === key
                                                        ? `${cat.borderLight} ${cat.borderDark} ${cat.bgLight} ${cat.bgDark}`
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                >
                                                    <div className="text-xl mb-0.5">{cat.icon}</div>
                                                    <div className={`text-[10px] font-semibold leading-tight ${selectedCategory === key ? `${cat.textLight} ${cat.textDark}` : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {cat.label}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recipient */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                            To
                                        </label>
                                        <select
                                            value={selectedToUserId}
                                            onChange={(e) => setSelectedToUserId(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                                        >
                                            <option value="">Select team member...</option>
                                            {users.filter(u => u.id !== currentUser?.id).map(user => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                                            Your Feedback
                                        </label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={5}
                                            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none text-sm scrollbar-hide"
                                            placeholder="Share your thoughts..."
                                        />
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                                            {content.length} characters
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendFeedback}
                                        disabled={!selectedToUserId || !content.trim()}
                                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl flex items-center gap-2"
                                    >
                                        <Send size={16} />
                                        Send
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
