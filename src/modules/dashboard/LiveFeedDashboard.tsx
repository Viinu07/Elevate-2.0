import { useState, useEffect } from 'react';
import {
    Calendar,
    MessageCircle,
    Image,
    Award,
    ThumbsUp,
    Send,
    MapPin,
    X,
    Rocket
} from 'lucide-react';
import { UserProfileModal } from '../social/components/UserProfileModal';
import { ConfirmationModal } from '../common/components/ConfirmationModal';
import { StatusModal } from '@/modules/common/components/StatusModal';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '@/store';
import { fetchWorkItems } from '@/store/releasesSlice';
import { CreatePostModal } from '../social/components/CreatePostModal';
import { CreateEventModal } from '../social/components/CreateEventModal';
import { CreateEndorsementModal } from '../social/components/CreateEndorsementModal';
import { eventsAPI } from '@/api/v2/events';
import { postsAPI } from '@/api/v2/posts';
import { endorsementsAPI } from '@/api/v2/endorsements';
import { releasesAPI } from '@/api/v2/releases';

// Helper function to get relative time
const getRelativeTime = (date: Date | string): string => {
    const now = new Date();
    let then: Date;

    if (typeof date === 'string') {
        // Ensure we're parsing the string as UTC if it doesn't have timezone info
        then = date.endsWith('Z') || date.includes('+') ? new Date(date) : new Date(date + 'Z');
    } else {
        then = date;
    }

    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 0) return 'Just now'; // Handle future dates
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return then.toLocaleDateString();
};

const ShareBox = ({ user, onOpenPost, onOpenEvent, onOpenEndorsement }: {
    user: any,
    onOpenPost: () => void,
    onOpenEvent: () => void,
    onOpenEndorsement: () => void
}) => (
    <div className="bg-white/80 dark:bg-[#15171B]/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow mb-6">
        <div className="flex gap-4">
            <div className="shrink-0">
                <img
                    key={user?.id || user?.name}
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'CurrentUser'}&backgroundColor=b6e3f4`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <div
                    onClick={onOpenPost}
                    className="w-full bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-black/40 transition-colors rounded-xl px-4 py-3 cursor-pointer text-slate-500 dark:text-slate-400 font-medium text-sm flex items-center justify-between group"
                >
                    <span>What's happening?</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <Image size={16} className="text-blue-500" />
                        <Calendar size={16} className="text-amber-500" />
                        <Award size={16} className="text-rose-500" />
                    </div>
                </div>

                <div className="flex items-center justify-between mt-3 pl-1">
                    <div className="flex gap-1">
                        <ActionButton icon={Image} color="text-blue-500" onClick={onOpenPost} tooltip="Media" />
                        <ActionButton icon={Calendar} color="text-amber-500" onClick={onOpenEvent} tooltip="Event" />
                        <ActionButton icon={Award} color="text-rose-500" onClick={onOpenEndorsement} tooltip="Endorse" />
                    </div>

                    <button
                        onClick={onOpenPost}
                        className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    </div >
);

const ActionButton = ({ icon: Icon, color, onClick }: any) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${color}`}
    >
        <Icon size={18} />
    </button>
);

const LikesDialog = ({ activityId, isOpen, onClose }: { activityId: string, isOpen: boolean, onClose: () => void }) => {
    const [likers, setLikers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const fetchLikes = async () => {
                try {
                    let data = [];
                    if (activityId.startsWith('post-')) {
                        data = await postsAPI.getLikes(activityId.replace('post-', ''));
                    } else if (activityId.startsWith('event-')) {
                        data = await eventsAPI.getLikes(activityId.replace('event-', ''));
                    } else if (activityId.startsWith('endorsement-')) {
                        data = await endorsementsAPI.getLikes(activityId.replace('endorsement-', ''));
                    }
                    setLikers(data);
                } catch {
                    // ignore
                } finally {
                    setLoading(false);
                }
            };
            fetchLikes();
        }
    }, [isOpen, activityId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden transform transition-all scale-100 animation-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Liked by</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={14} className="text-slate-500" />
                    </button>
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-hide p-2">
                    {loading ? (
                        <div className="text-center py-4 text-xs text-slate-400">Loading...</div>
                    ) : likers.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400">No likes yet.</div>
                    ) : (
                        <div className="space-y-1">
                            {likers.map(liker => (
                                <div key={liker.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                                    <img src={liker.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${liker.name}`} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{liker.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FeedPost = ({ activity, onUserClick, onDeleteClick }: {
    activity: any,
    onUserClick: (userId: string) => void,
    onDeleteClick: (activityId: string) => void
}) => {
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.user.data);
    const [isLiked, setIsLiked] = useState(activity.liked_by_user || false);
    const [likesCount, setLikesCount] = useState(activity.likes || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [showLikesDialog, setShowLikesDialog] = useState(false);

    // Sync state with prop if it changes (e.g. from refresh)
    useEffect(() => {
        setIsLiked(activity.liked_by_user);
        setLikesCount(activity.likes);
    }, [activity.liked_by_user, activity.likes]);

    const handleContentClick = () => {
        if (activity.type === 'EVENT' && activity.metadata?.eventId) {
            navigate(`/events/${activity.metadata.eventId}`);
        } else if (activity.type === 'ENDORSEMENT') {
            // Navigate to recognition page with endorsement ID as hash/param
            const endorsementId = activity.id.replace('endorsement-', '');
            navigate(`/recognition#${endorsementId}`);
        } else if (activity.type === 'RELEASE') {
            if (activity.metadata?.releaseId) {
                navigate(`/releases/${activity.metadata.releaseId}`);
            } else {
                console.warn('Release ID not found for navigation');
                // Optional: Show toast or alert
            }
        }
    };

    const handleLike = async () => {
        // Optimistic update
        const previousState = isLiked;
        const previousCount = likesCount;

        setIsLiked(!isLiked);
        setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1);

        try {
            if (activity.id.startsWith('post-')) {
                const postId = activity.id.replace('post-', '');
                await postsAPI.like(postId);
            } else if (activity.id.startsWith('event-')) {
                const eventId = activity.id.replace('event-', '');
                await eventsAPI.like(eventId);
            } else if (activity.id.startsWith('endorsement-')) {
                const endorsementId = activity.id.replace('endorsement-', '');
                await endorsementsAPI.like(endorsementId);
            }
        } catch (error) {
            // Revert on error
            setIsLiked(previousState);
            setLikesCount(previousCount);
            console.error("Failed to like:", error);
        }
    };

    const handleDelete = () => {
        onDeleteClick(activity.id);
    };

    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                let fetchedComments = [];
                if (activity.id.startsWith('post-')) {
                    const postId = activity.id.replace('post-', '');
                    fetchedComments = await postsAPI.getComments(postId);
                } else if (activity.id.startsWith('event-')) {
                    const eventId = activity.id.replace('event-', '');
                    fetchedComments = await eventsAPI.getComments(eventId);
                } else if (activity.id.startsWith('endorsement-')) {
                    const endorsementId = activity.id.replace('endorsement-', '');
                    fetchedComments = await endorsementsAPI.getComments(endorsementId);
                }
                setComments(fetchedComments);
            } catch (error) {
                console.error("Failed to fetch comments", error);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            let comment;
            if (activity.id.startsWith('post-')) {
                const postId = activity.id.replace('post-', '');
                comment = await postsAPI.addComment(postId, newComment);
            } else if (activity.id.startsWith('event-')) {
                const eventId = activity.id.replace('event-', '');
                comment = await eventsAPI.addComment(eventId, newComment);
            } else if (activity.id.startsWith('endorsement-')) {
                const endorsementId = activity.id.replace('endorsement-', '');
                comment = await endorsementsAPI.addComment(endorsementId, newComment);
            }

            if (comment) {
                setComments([...comments, comment]);
                setNewComment("");
            }
        } catch (error) {
            console.error("Failed to add comment", error);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-0 border border-slate-200 dark:border-slate-700 shadow-sm mb-6 overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex gap-3">
                <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {activity.type === 'RELEASE' ? (
                                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm cursor-default">
                                        {activity.user.name}
                                    </h3>
                                ) : (
                                    <h3
                                        onClick={() => onUserClick(activity.user.id)}
                                        className="font-semibold text-slate-900 dark:text-white text-sm hover:underline hover:text-blue-600 cursor-pointer transition-colors"
                                    >
                                        {activity.user.name}
                                    </h3>
                                )}
                                {/* Type Badge - Only show for Events and Endorsements */}
                                {(activity.type === 'EVENT' || activity.type === 'ENDORSEMENT' || activity.type === 'RELEASE') && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${activity.type === 'EVENT'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : activity.type === 'RELEASE'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                        }`}>
                                        {activity.type === 'EVENT' ? '📅 Event' : activity.type === 'RELEASE' ? '🚀 Ship' : '🏆 Kudos'}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {activity.user.team || activity.user.role || 'Team Member'}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                {getRelativeTime(activity.created_at)} • <span className="opacity-70">🌎</span>
                            </p>
                        </div>
                    </div>
                </div>
                {/* Delete Button for Author */}
                {activity.user.id === currentUser?.id && (
                    <button
                        onClick={handleDelete}
                        className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                        title="Delete Post"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Post Content */}
            <div className="px-4 pb-2">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {activity.content}
                </p>
            </div>

            {/* Rich Media / Attachment - Only for Events, Endorsements, and Releases */}
            {(activity.type === 'EVENT' || activity.type === 'ENDORSEMENT' || activity.type === 'RELEASE') && (
                <div
                    onClick={handleContentClick}
                    className={`mt-3 mx-4 mb-1 p-4 rounded-xl border transition-all cursor-pointer ${activity.type === 'EVENT'
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 hover:bg-blue-100/50 dark:hover:bg-blue-900/20'
                        : activity.type === 'RELEASE'
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20'
                            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 hover:bg-rose-100/50 dark:hover:bg-rose-900/20'
                        }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-lg shrink-0 ${activity.type === 'EVENT'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                            : activity.type === 'RELEASE'
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                            }`}>
                            <activity.icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            {activity.type === 'EVENT' && (
                                <>
                                    <p className="font-semibold text-base text-slate-900 dark:text-white mb-2">{activity.target}</p>
                                    <div className="space-y-1.5">
                                        <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                            <Calendar size={13} className="text-slate-400" />
                                            {new Date(activity.metadata.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            {' • '}
                                            {new Date(activity.metadata.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                        {activity.metadata.location && (
                                            <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 truncate">
                                                <MapPin size={13} className="text-slate-400" />
                                                {activity.metadata.location}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                            {activity.type === 'RELEASE' && (
                                <>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">
                                        Feature: <span className="text-emerald-600 dark:text-emerald-400">{activity.metadata.title}</span>
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                        Released in: <span className="font-bold">{activity.metadata.release}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                            Completed
                                        </span>
                                    </div>
                                </>
                            )}
                            {activity.type === 'ENDORSEMENT' && (
                                <>
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">
                                        Recognized <span className="text-rose-600 dark:text-rose-400">{activity.target}</span>
                                    </p>
                                    {activity.metadata.message && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-2">"{activity.metadata.message}"</p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {activity.metadata.category && (
                                            <span className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded-full font-medium">
                                                {activity.metadata.category}
                                            </span>
                                        )}
                                        {activity.metadata.event_name && (
                                            <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                📅 Event Award
                                            </span>
                                        )}
                                        {activity.metadata.project && (
                                            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                                                {activity.metadata.project}
                                            </span>
                                        )}
                                        {activity.metadata.skills && activity.metadata.skills.split(',').map((skill: string) => (
                                            <span key={skill} className="text-xs bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                    {activity.metadata.event_name && (
                                        <div className="mt-2 px-3 py-1.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                                <span className="font-semibold">Awarded at:</span> {activity.metadata.event_name}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="px-4 py-2 mt-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">
                            <ThumbsUp size={10} fill="currentColor" />
                        </div>
                    </div>

                    <div
                        className="relative group cursor-pointer"
                        onClick={() => setShowLikesDialog(true)}
                    >
                        <span className="hover:text-blue-500 hover:underline cursor-pointer ml-1">{likesCount} Likes</span>
                    </div>

                    <LikesDialog
                        activityId={activity.id}
                        isOpen={showLikesDialog}
                        onClose={() => setShowLikesDialog(false)}
                    />
                </div>
                <div onClick={toggleComments} className="hover:text-blue-500 hover:underline cursor-pointer">
                    {activity.comments} comments
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-1 flex justify-between">
                <button
                    onClick={handleLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium transition-colors text-sm ${isLiked ? 'text-blue-600' : 'text-slate-500'}`}
                >
                    <ThumbsUp size={18} fill={isLiked ? "currentColor" : "none"} />
                    <span className="hidden sm:inline">Like</span>
                </button>
                <button
                    onClick={toggleComments}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-500 font-medium transition-colors text-sm"
                >
                    <MessageCircle size={18} />
                    <span className="hidden sm:inline">Comment</span>
                </button>

            </div>

            {/* Comments Section */}
            {
                showComments && (
                    <div className="px-4 py-3 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-slate-700/50">
                        {loadingComments ? (
                            <div className="text-center py-2 text-xs text-slate-400">Loading comments...</div>
                        ) : (
                            <div className="space-y-3 mb-4">
                                {comments.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-2">
                                        <img src={comment.user_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.user_name}`} className="w-8 h-8 rounded-full" />
                                        <div className="bg-slate-100 dark:bg-white/5 rounded-2xl rounded-tl-none px-3 py-2">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{comment.user_name}</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <img
                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=Viinu`}
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                    placeholder="Write a comment..."
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                    className="absolute right-1 top-1 p-1 text-blue-600 disabled:opacity-50 hover:bg-blue-50 rounded-full"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export const LiveFeedDashboard = () => {
    const user = useSelector((state: RootState) => state.user.data);

    // Separate states for each modal
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isEndorsementModalOpen, setIsEndorsementModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    // Delete Confirmation
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<'ALL' | 'POST' | 'EVENT' | 'ENDORSEMENT' | 'RELEASE'>('ALL');

    const dispatch = useDispatch<any>();
    const { workItems } = useSelector((state: RootState) => state.releases);

    const [socialData, setSocialData] = useState<{ events: any[], posts: any[], endorsements: any[], v2Releases: any[] }>({
        events: [],
        posts: [],
        endorsements: [],
        v2Releases: []
    });

    const fetchSocialData = async () => {
        try {
            setLoading(true);
            const [events, posts, endorsements, v2Releases] = await Promise.all([
                eventsAPI.list(),
                postsAPI.list(),
                endorsementsAPI.list(),
                releasesAPI.list()
            ]);
            setSocialData({ events, posts, endorsements, v2Releases });
        } catch (error) {
            console.error("Failed to fetch social data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSocialData();
        dispatch(fetchWorkItems());

        const handleRefresh = () => {
            fetchSocialData();
            dispatch(fetchWorkItems());
        };
        window.addEventListener('refresh-feed', handleRefresh);
        return () => window.removeEventListener('refresh-feed', handleRefresh);
    }, [dispatch]);

    useEffect(() => {
        const { events, posts, endorsements } = socialData;

        // Transform events to activity format
        const eventActivities = events.map((event: any) => ({
            id: `event-${event.id}`,
            type: 'EVENT',
            user: {
                id: event.organizer_id,
                name: event.organizer_name || 'Elevate Team',
                avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${event.organizer_name || 'Elevate'}`,
                role: 'Organizer',
                team: event.organizer_team
            },
            action: '',
            target: event.name,
            timestamp: new Date(event.created_at).toLocaleDateString(),
            created_at: event.created_at,
            content: event.agenda || event.name,
            likes: event.likes || 0,
            comments: event.comments || 0,
            liked_by_user: event.liked_by_user || false,
            icon: Calendar,
            color: 'text-purple-500 bg-purple-500/10',
            metadata: {
                eventId: event.id,
                date: event.date_time,
                location: event.meeting_link,
            }
        }));

        // Transform posts to activity format
        const postActivities = posts.map((post: any) => ({
            id: `post-${post.id}`,
            type: 'POST',
            user: {
                id: post.author_id,
                name: post.author_name || 'User',
                avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.author_name || 'User'}`,
                role: post.author_role || 'Member',
                team: post.author_team
            },
            action: '',
            target: '',
            timestamp: new Date(post.created_at).toLocaleDateString(),
            created_at: post.created_at,
            content: post.content,
            likes: post.likes || 0,
            comments: post.comments || 0,
            liked_by_user: post.liked_by_user,
            icon: MessageCircle,
            color: 'text-blue-500 bg-blue-500/10',
            metadata: {}
        }));

        // Transform endorsements to activity format
        const endorsementActivities = endorsements.map((endorsement: any) => ({
            id: `endorsement-${endorsement.id}`,
            type: 'ENDORSEMENT',
            user: {
                id: endorsement.giver_id,
                name: endorsement.giver_name || 'User',
                avatar: endorsement.giver_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${endorsement.giver_name}`,
                role: 'Team Member',
                team: endorsement.giver_team
            },
            action: '',
            target: endorsement.receiver_name,
            timestamp: new Date(endorsement.created_at).toLocaleDateString(),
            created_at: endorsement.created_at,
            content: endorsement.message || `Recognized ${endorsement.receiver_name} for ${endorsement.category}`,
            likes: endorsement.likes || 0,
            comments: endorsement.comments || 0,
            liked_by_user: endorsement.liked_by_user || false,
            icon: Award,
            color: 'text-rose-500 bg-rose-500/10',
            metadata: {
                message: endorsement.message,
                project: endorsement.project_id,
                skills: endorsement.skills,
                category: endorsement.category,
                event_name: endorsement.event_name
            }
        }));

        // Transform Completed Work Items (Releases)
        const releaseActivities = workItems
            .filter(item => item.status === 'Completed')
            .map(item => ({
                id: `release-${item.id}`,
                type: 'RELEASE',
                user: {
                    id: `team-${item.team}`,
                    name: item.team,
                    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${item.team}`,
                    role: 'Product Team',
                    team: item.team
                },
                action: 'shipped',
                target: item.title,
                timestamp: item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 'Recently',
                created_at: item.completedAt || new Date().toISOString(),
                content: `🚀 Team ${item.team} has successfully shipped "${item.title}" in release ${item.release}!`,
                likes: 0,
                comments: 0,
                liked_by_user: false,
                icon: Rocket,
                color: 'text-green-500 bg-green-500/10',
                metadata: {
                    release: item.release,
                    title: item.title,
                    team: item.team,
                    releaseId: socialData.v2Releases?.find((r: any) => r.version === item.release)?.id
                }
            }));

        // Merge and sort
        const allActivities = [...eventActivities, ...postActivities, ...endorsementActivities, ...releaseActivities].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA;
        });

        setActivities(allActivities);
    }, [socialData, workItems]);

    const handleDataRefresh = () => {
        fetchSocialData();
        dispatch(fetchWorkItems());
    };

    const handleConfirmDelete = async () => {
        console.log("Confirming delete for item:", itemToDelete);
        if (!itemToDelete) return;

        try {
            if (itemToDelete.startsWith('post-')) {
                const postId = itemToDelete.replace('post-', '');
                console.log("Making API call to delete post:", postId);
                await postsAPI.delete(postId);
                console.log("API call successful");

                // Remove locally to update UI instantly
                setActivities(prev => prev.filter(a => a.id !== itemToDelete));

                // Also trigger refresh to be safe
                handleDataRefresh();
            } else if (itemToDelete.startsWith('event-')) {
                const eventId = itemToDelete.replace('event-', '');
                console.log("Making API call to delete event:", eventId);
                await eventsAPI.delete(eventId);
                console.log("API call successful");

                // Remove locally
                setActivities(prev => prev.filter(a => a.id !== itemToDelete));
                handleDataRefresh();
            } else if (itemToDelete.startsWith('endorsement-')) {
                const endorsementId = itemToDelete.replace('endorsement-', '');
                console.log("Making API call to delete endorsement:", endorsementId);
                await endorsementsAPI.delete(endorsementId);
                console.log("API call successful");

                // Remove locally
                setActivities(prev => prev.filter(a => a.id !== itemToDelete));
                handleDataRefresh();
            }
        } catch (error) {
            console.error("Failed to delete item:", error);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Deletion Failed',
                message: 'Failed to delete item. You may not have permission or it may have already been deleted.'
            });
        }
    };

    return (
        <div className="h-full overflow-y-auto scrollbar-hide py-4 px-2">
            <div className="max-w-3xl mx-auto w-full">

                <ShareBox
                    user={user}
                    onOpenPost={() => setIsPostModalOpen(true)}
                    onOpenEvent={() => setIsEventModalOpen(true)}
                    onOpenEndorsement={() => setIsEndorsementModalOpen(true)}
                />

                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="h-[1px] bg-slate-200 dark:bg-slate-700 flex-1"></div>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 mb-4 px-2 overflow-x-auto scrollbar-hide">
                    {[
                        { label: 'All', value: 'ALL', icon: '🌐' },
                        { label: 'Posts', value: 'POST', icon: '📝' },
                        { label: 'Events', value: 'EVENT', icon: '📅' },
                        { label: 'Kudos', value: 'ENDORSEMENT', icon: '🏆' },
                        { label: 'Releases', value: 'RELEASE', icon: '🚀' }
                    ].map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterType(filter.value as any)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${filterType === filter.value
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            <span>{filter.icon}</span>
                            <span>{filter.label}</span>
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {activities
                            .filter(activity => filterType === 'ALL' || activity.type === filterType)
                            .map((activity) => (
                                <FeedPost
                                    key={activity.id}
                                    activity={activity}
                                    onUserClick={(userId) => {
                                        if (userId) {
                                            setSelectedUserId(userId);
                                            setIsProfileModalOpen(true);
                                        }
                                    }}
                                    onDeleteClick={(activityId) => {
                                        setItemToDelete(activityId);
                                        setIsDeleteModalOpen(true);
                                    }}
                                />
                            ))}
                        {activities.filter(activity => filterType === 'ALL' || activity.type === filterType).length === 0 && activities.length > 0 && (
                            <div className="text-center py-12 text-slate-400">
                                No {filterType.toLowerCase()}s found.
                            </div>
                        )}
                        {activities.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                <p>No recent updates. Be the first to post!</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center py-8">
                    {loading && (
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">You're all caught up!</p>
                </div>
            </div>

            {/* Separate Modals */}
            <CreatePostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
            />
            <CreateEventModal
                isOpen={isEventModalOpen}
                onClose={() => {
                    setIsEventModalOpen(false);
                    handleDataRefresh();
                }}
            />
            <CreateEndorsementModal
                isOpen={isEndorsementModalOpen}
                onClose={() => setIsEndorsementModalOpen(false)}
            />
            <UserProfileModal
                userId={selectedUserId}
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                isDangerous={true}
            />

            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />


        </div>
    );
};
