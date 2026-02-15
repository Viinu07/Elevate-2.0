import { useState, useEffect } from 'react';
import {
    X,
    Trophy,
    User,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusModal } from '@/modules/common/components/StatusModal';
import { endorsementsAPI } from '@/api/v2/endorsements';
import { profilesAPI } from '@/api/v2/profiles';
import type { EventDetailResponse, UserProfileFullResponse } from '@/api/v2/types';

interface GrantAwardModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: EventDetailResponse | null;
    onSuccess: () => void;
    initialCategory?: string;
    initialUserId?: string;
}

export const GrantAwardModal = ({ isOpen, onClose, event, onSuccess, initialCategory = '', initialUserId = '' }: GrantAwardModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Status Modal State
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [selectedUserId, setSelectedUserId] = useState(initialUserId);
    const [message, setMessage] = useState('');
    const [allUsers, setAllUsers] = useState<UserProfileFullResponse[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Fetch all users when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedCategory(initialCategory);
            setSelectedUserId(initialUserId);

            const fetchUsers = async () => {
                setLoadingUsers(true);
                try {
                    const users = await profilesAPI.list({ limit: 1000 });
                    setAllUsers(users);
                } catch (error) {
                    console.error("Failed to fetch users:", error);
                }
                setLoadingUsers(false);
            };
            fetchUsers();
        }
    }, [isOpen, initialCategory, initialUserId]);

    if (!isOpen || !event) return null;

    // Parse categories
    const categories = event.award_categories
        ? event.award_categories.split(',').map(c => c.trim()).filter(c => c)
        : [];

    const handleGrantAward = async () => {
        if (!selectedCategory || !selectedUserId) {
            setStatusModal({
                isOpen: true,
                type: 'info',
                title: 'Missing Information',
                message: 'Please select both an award category and a recipient.'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await endorsementsAPI.create({
                event_id: event.id,
                category: selectedCategory,
                receiver_id: selectedUserId,
                message: message || `Awarded for ${selectedCategory} during ${event.name}`
            });

            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Award Granted',
                message: 'Award has been successfully granted!'
            });

            // Delay closing to let user see success message
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
            // Reset form
            setSelectedCategory('');
            setSelectedUserId('');
            setMessage('');
        } catch (error) {
            console.error("Failed to grant award:", error);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Grant Failed',
                message: 'Failed to grant award. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-[#111114] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col"
                >
                    <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 shrink-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl shadow-lg shadow-amber-500/30">
                                    <Trophy size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Grant Award</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recognize a participant</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Category Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                Award Category
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 pl-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 border border-slate-200 dark:border-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="">Select an award...</option>
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat}>{cat}</option>
                                    ))}
                                    {categories.length === 0 && <option disabled>No categories defined</option>}
                                </select>
                                <Trophy className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
                            </div>
                            {categories.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">No award categories defined for this event.</p>
                            )}
                        </div>

                        {/* Recipient Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                                Recipient
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 pl-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 border border-slate-200 dark:border-slate-700 appearance-none cursor-pointer"
                                >
                                    <option value="">Select recipient...</option>
                                    {loadingUsers ? (
                                        <option disabled>Loading users...</option>
                                    ) : (
                                        allUsers.map((user) => (
                                            <option key={user.user_id} value={user.user_id}>
                                                {user.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                                <User className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                                Message (Optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Add a personal note..."
                                className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-500/40 border border-slate-200 dark:border-slate-700 resize-none h-24"
                            />
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGrantAward}
                            disabled={isSubmitting || !selectedCategory || !selectedUserId}
                            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Granting...' : (
                                <>
                                    <Send size={16} />
                                    Grant Award
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                <StatusModal
                    isOpen={statusModal.isOpen}
                    onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                    type={statusModal.type}
                    title={statusModal.title}
                    message={statusModal.message}
                />
            </div>
        </AnimatePresence>
    );
};
