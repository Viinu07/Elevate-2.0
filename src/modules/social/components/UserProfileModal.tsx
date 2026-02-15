import { useState, useEffect } from 'react';
import { X, Briefcase } from 'lucide-react';
import { profilesAPI } from '@/api/v2/profiles';

interface UserProfileModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal = ({ userId, isOpen, onClose }: UserProfileModalProps) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            setLoading(true);
            profilesAPI.getUser(userId)
                .then(data => {
                    setProfile(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch profile", err);
                    setLoading(false);
                });
        } else {
            setProfile(null);
        }
    }, [isOpen, userId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animation-in fade-in zoom-in duration-200 relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10 backdrop-blur-md"
                >
                    <X size={16} />
                </button>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : profile ? (
                    <>
                        {/* Header / Banner */}
                        <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
                            {/* Avatar */}
                            <div className="absolute -bottom-12 left-8">
                                <div className="p-1.5 bg-white dark:bg-slate-800 rounded-full">
                                    <img
                                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`}
                                        alt={profile.name}
                                        className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 object-cover border border-slate-200 dark:border-slate-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="pt-16 pb-8 px-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {profile.name}
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                                        {profile.role || ''}
                                    </span>
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{profile.profile?.title || ''}</p>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <Briefcase size={16} className="text-slate-400" />
                                    <span>{profile.team || profile.profile?.department || ''}</span>
                                </div>
                            </div>

                            {/* Stats or Badges (Mock for now if not in profile object) */}
                            {/* <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Achievements</h3>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl" title="Top Contributor">🏆</div>
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl" title="Bug Hunter">🐛</div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl" title="Team Player">🤝</div>
                                </div>
                            </div> */}
                        </div>

                        {/* Footer Actions */}
                        <div className="px-8 py-4 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-700/50 flex gap-3">
                            <button className="flex-1 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:shadow-lg transition-transform active:scale-95">
                                View Full Profile
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-slate-500">
                        User not found.
                    </div>
                )}
            </div>
        </div>
    );
};
