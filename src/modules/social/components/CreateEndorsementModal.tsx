import { useState, useEffect } from 'react';
import {
    X,
    Users,
    Award,
    Send,
    Briefcase,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { endorsementsAPI } from '@/api/v2/endorsements';
import { eventsAPI } from '@/api/v2/events';
import { userService, type User } from '@/api/userService';

interface CreateEndorsementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateEndorsementModal = ({ isOpen, onClose }: CreateEndorsementModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [receiverId, setReceiverId] = useState("");
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");
    const [skills, setSkills] = useState("");
    const [contextType, setContextType] = useState<"PROJECT" | "EVENT" | null>(null);
    const [contextId, setContextId] = useState("");

    // Mock data for projects/events until we have full selectors
    const [availableEvents, setAvailableEvents] = useState<any[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Fetch events and users for selectors
            const fetchData = async () => {
                try {
                    const [events, users] = await Promise.all([
                        eventsAPI.list(),
                        userService.getUsers()
                    ]);
                    setAvailableEvents(events);
                    setAvailableUsers(users);
                } catch (e) {
                    console.error("Failed to fetch data", e);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCreateEndorsement = async () => {
        if (!receiverId || !category || !message) return;

        setIsSubmitting(true);
        try {
            await endorsementsAPI.create({
                receiver_id: receiverId,
                category,
                message,
                skills: skills,
                event_id: contextType === 'EVENT' ? contextId : undefined,
                project_id: contextType === 'PROJECT' ? contextId : undefined,
            });
            onClose();
            // Trigger refresh logic if needed
            window.dispatchEvent(new Event('refresh-feed'));
        } catch (error) {
            console.error("Failed to create endorsement", error);
        } finally {
            setIsSubmitting(false);
        }
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
                    className="relative w-full max-w-2xl bg-white dark:bg-[#111114] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col my-auto max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                                <Award size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Give Endorsement</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Who do you want to recognize?</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-50 dark:bg-black/20 rounded-xl px-4 py-3 pl-10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-200 dark:border-white/10 appearance-none cursor-pointer"
                                        value={receiverId}
                                        onChange={(e) => setReceiverId(e.target.value)}
                                    >
                                        <option value="">Select a colleague...</option>
                                        {availableUsers.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute left-3 top-3.5 text-slate-400">
                                        <Users size={18} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Select Badge</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {['Team Player', 'Bug Hunter', 'Innovator', 'Saviour', 'Leader', 'Mentor'].map(badge => (
                                        <BadgeOption
                                            key={badge}
                                            label={badge}
                                            icon={getBadgeIcon(badge)}
                                            selected={category === badge}
                                            onClick={() => setCategory(badge)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Context & Skills */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Link to Context (Optional)</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-50 dark:bg-black/20 rounded-xl px-4 py-3 pl-10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-200 dark:border-white/10 appearance-none cursor-pointer"
                                            onChange={(e) => {
                                                if (e.target.value.startsWith('event-')) {
                                                    setContextType('EVENT');
                                                    setContextId(e.target.value.replace('event-', ''));
                                                } else {
                                                    setContextType(null);
                                                    setContextId("");
                                                }
                                            }}
                                        >
                                            <option value="">No specific context</option>
                                            <optgroup label="Recent Events">
                                                {availableEvents.map(event => (
                                                    <option key={event.id} value={`event-${event.id}`}>{event.name}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                        <div className="absolute left-3 top-3.5 text-slate-400">
                                            <Briefcase size={18} />
                                        </div>
                                    </div>
                                </div>

                                <Input
                                    label="Tagged Skills (Optional)"
                                    placeholder="e.g. Python, Leadership"
                                    icon={Zap}
                                    value={skills}
                                    onChange={(e: any) => setSkills(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-black/20 rounded-xl p-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-200 dark:border-white/10 resize-none min-h-[100px] transition-all"
                                    placeholder="Why are they awesome?"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-end gap-3 shrink-0">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateEndorsement}
                            disabled={isSubmitting || !receiverId || !category || !message}
                            className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 ${isSubmitting || !receiverId || !category || !message ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Sending...' : (
                                <>
                                    Endorse
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const Input = ({ label, placeholder, type = "text", icon: Icon, value, onChange }: any) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        <div className="relative">
            <input
                type={type}
                className="w-full bg-slate-50 dark:bg-black/20 rounded-xl px-4 py-3 pl-10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-slate-200 dark:border-white/10 transition-all hover:bg-slate-100 dark:hover:bg-white/5"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            <div className="absolute left-3 top-3.5 text-slate-400">
                {Icon && <Icon size={18} />}
            </div>
        </div>
    </div>
);

const BadgeOption = ({ label, icon, selected, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 group ${selected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 bg-slate-50 dark:bg-black/20'}`}
    >
        <span className="text-3xl group-hover:scale-110 transition-transform filter drop-shadow-sm">{icon}</span>
        <span className={`text-xs font-semibold ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>{label}</span>
    </button>
);

const getBadgeIcon = (label: string) => {
    switch (label) {
        case 'Team Player': return '🤝';
        case 'Bug Hunter': return '🐛';
        case 'Innovator': return '💡';
        case 'Saviour': return '🦸‍♂️';
        case 'Leader': return '👑';
        case 'Mentor': return '🎓';
        default: return '🏅';
    }
};
