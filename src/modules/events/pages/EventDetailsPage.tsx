import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    User,
    ChevronLeft,
    Share2,
    Check,
    X,
    MoreHorizontal,
    MessageSquare,
    Award,
    Trophy
} from 'lucide-react';
import { GrantAwardModal } from '../../social/components/GrantAwardModal';
import { motion } from 'framer-motion';
import { eventsAPI } from '@/api/v2/events';
import type { EventDetailResponse } from '@/api/v2/types';
import { RSVPStatus } from '@/api/v2/types';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Send } from 'lucide-react';
import { VotingPoll } from '../components/VotingPoll';
import { StatusModal } from '@/modules/common/components/StatusModal';


export const EventDetailsPage = () => {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.user.data);
    const [event, setEvent] = useState<EventDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'discussion' | 'awards' | 'vote'>('overview');
    const [isGrantAwardModalOpen, setIsGrantAwardModalOpen] = useState(false);
    const [grantAwardInitialData, setGrantAwardInitialData] = useState({ category: '', userId: '' });

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

    // Discussion State
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    const fetchEvent = async () => {
        if (!eventId) return;
        try {
            const data = await eventsAPI.get(eventId);
            setEvent(data);
        } catch (error) {
            console.error("Failed to fetch event:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    // Fetch comments when discussion tab is active
    useEffect(() => {
        if (activeTab === 'discussion' && eventId && !commentsLoaded) {
            const loadComments = async () => {
                setLoadingComments(true);
                try {
                    const data = await eventsAPI.getComments(eventId);
                    setComments(data);
                    setCommentsLoaded(true);
                } catch (error) {
                    console.error("Failed to fetch comments", error);
                } finally {
                    setLoadingComments(false);
                }
            };
            loadComments();
        }
    }, [activeTab, eventId, commentsLoaded]);

    const handleRSVP = async (status: RSVPStatus) => {
        if (!eventId || !currentUser) return;

        try {
            await eventsAPI.addParticipant(eventId, {
                user_id: currentUser.id,
                rsvp_status: status
            });
            // Refresh event to see updated participant list
            await fetchEvent();
        } catch (error) {
            console.error("Failed to update RSVP:", error);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update RSVP status. Please try again.'
            });
        }
    };

    const handlePostComment = async () => {
        if (!eventId || !newComment.trim()) return;

        try {
            const comment = await eventsAPI.addComment(eventId, newComment);
            setComments([...comments, comment]);
            setNewComment("");
        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    const isOrganizer = currentUser?.id === event?.organizer_id;
    const myParticipantRecord = event?.participants?.find(p => p.user_id === currentUser?.id);
    const myRSVP = myParticipantRecord?.rsvp_status;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <p>Event not found or failed to load.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 hover:underline">Go Back</button>
            </div>
        );
    }

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <div className="h-full overflow-y-auto bg-slate-50 dark:bg-[#0B0C0E] pb-20">
            {/* Header / Hero */}
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors">
                        <Share2 size={20} />
                    </button>
                    <button className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
                <div className="bg-white dark:bg-[#15171B] rounded-2xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className="p-6 md:p-8">
                        {/* Event Meta Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
                                    {event.event_type || 'Event'}
                                </span>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{event.name}</h1>
                                <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <User size={16} /> Organized by <span className="font-medium text-slate-700 dark:text-slate-300">{event.organizer_name}</span>
                                </p>
                            </div>

                            {/* RSVP Actions */}
                            {!isOrganizer && (
                                <div className="flex gap-3 w-full md:w-auto">
                                    {(myRSVP === RSVPStatus.ACCEPTED || myRSVP === RSVPStatus.DECLINED) ? (
                                        <div className={`px-6 py-2.5 font-medium rounded-xl flex items-center gap-2 ${myRSVP === RSVPStatus.ACCEPTED
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {myRSVP === RSVPStatus.ACCEPTED ? <Check size={18} /> : <X size={18} />}
                                            {myRSVP === RSVPStatus.ACCEPTED ? 'Accepted' : 'Declined'}
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleRSVP(RSVPStatus.ACCEPTED)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                                            >
                                                <Check size={18} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleRSVP(RSVPStatus.DECLINED)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                                            >
                                                <X size={18} /> Decline
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                            {isOrganizer && (
                                <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-lg text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    You are the organizer
                                </div>
                            )}
                        </div>

                        <hr className="my-6 border-slate-100 dark:border-white/5" />

                        {/* Key Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">Date & Time</p>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{formatDate(event.date_time)}</p>
                                    <p className="text-slate-500 dark:text-slate-500 text-xs mt-0.5">
                                        {formatTime(event.date_time)}
                                        {/* Display End Time if available in type */}
                                        {event.end_time && ` - ${formatTime(event.end_time)}`}
                                        {' '}{event.timezone}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">Location</p>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">{event.meeting_link || 'TBD'}</p>
                                    {event.meeting_link?.includes('http') && (
                                        <a href={event.meeting_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs mt-0.5 block">
                                            Join Meeting
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="px-6 md:px-8 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex gap-6">
                        <TabButton
                            label="Overview"
                            active={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                        />
                        <TabButton
                            label="Participants"
                            active={activeTab === 'participants'}
                            onClick={() => setActiveTab('participants')}
                            count={event.participants?.filter(p => p.rsvp_status === RSVPStatus.ACCEPTED).length}
                        />
                        <TabButton
                            label="Discussion"
                            active={activeTab === 'discussion'}
                            onClick={() => setActiveTab('discussion')}
                        />

                        {event.has_awards && (
                            <TabButton
                                label="Awards"
                                active={activeTab === 'awards'}
                                onClick={() => setActiveTab('awards')}
                                count={event.endorsements?.length}
                            />
                        )}

                        {(event.voting_required || isOrganizer) && event.has_awards && (
                            <TabButton
                                label="Vote"
                                active={activeTab === 'vote'}
                                onClick={() => setActiveTab('vote')}
                            />
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#15171B] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6 md:p-8"
                        >
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Description</h3>
                            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                                <p className="whitespace-pre-line">{event.agenda || "No description provided."}</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'participants' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#15171B] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6"
                        >
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Participants ({event.participants?.filter(p => p.rsvp_status === RSVPStatus.ACCEPTED).length || 0})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {event.participants?.filter(p => p.rsvp_status === RSVPStatus.ACCEPTED).map((participant) => (
                                    <div key={participant.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-white/10">
                                        <img
                                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${participant.user_name}`}
                                            alt={participant.user_name}
                                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{participant.user_name}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${participant.rsvp_status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                participant.rsvp_status === 'DECLINED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {participant.rsvp_status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {(!event.participants || event.participants.length === 0) && (
                                    <p className="text-slate-500 italic col-span-full">No participants yet.</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'discussion' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#15171B] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6"
                        >
                            {loadingComments ? (
                                <div className="text-center py-12 text-slate-400">Loading discussion...</div>
                            ) : (
                                <>
                                    <div className="space-y-6 mb-8">
                                        {comments.length === 0 ? (
                                            <div className="text-center py-12">
                                                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No discussions yet</h3>
                                                <p className="text-slate-500 max-w-sm mx-auto">Start the conversation by posting a question or comment about this event.</p>
                                            </div>
                                        ) : (
                                            comments.map((comment: any) => (
                                                <div key={comment.id} className="flex gap-4">
                                                    <img
                                                        src={comment.user?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.user_name || 'User'}`}
                                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                                                        alt={comment.user_name}
                                                    />
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-slate-900 dark:text-white">{comment.user_name || 'User'}</span>
                                                            <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Helper to calculate seed for current user avatar */}
                                    <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <img
                                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.name || 'User'}`}
                                            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                                            alt="Me"
                                        />
                                        <div className="flex-1 relative">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handlePostComment();
                                                    }
                                                }}
                                                placeholder="Write a comment..."
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 min-h-[80px] resize-none"
                                            />
                                            <button
                                                onClick={handlePostComment}
                                                disabled={!newComment.trim()}
                                                className="absolute right-3 bottom-3 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-lg transition-colors"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'awards' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-[#15171B] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Awards & Recognition ({event.endorsements?.length || 0})</h3>
                                {isOrganizer && (
                                    <button
                                        onClick={() => setIsGrantAwardModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                                    >
                                        <Trophy size={16} />
                                        Grant Award
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {event.endorsements?.map((endorsement) => (
                                    <div key={endorsement.id} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                        <div className="p-2 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg">
                                            <Award size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 dark:text-white">{endorsement.category}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                Awarded by <span className="font-medium text-slate-700 dark:text-slate-300">{endorsement.giver_name}</span>
                                            </p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {new Date(endorsement.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {(!event.endorsements || event.endorsements.length === 0) && (
                                    <div className="col-span-full py-8 text-center text-slate-500">
                                        <Award className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700 opacity-50" />
                                        <p>No awards given in this event yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'vote' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <VotingPoll
                                event={event}
                                currentUser={currentUser}
                                onVoteSubmitted={() => {
                                    // Optional: Show success message or redirect
                                }}
                                onGrantAward={(category, nomineeId) => {
                                    setGrantAwardInitialData({ category, userId: nomineeId });
                                    setIsGrantAwardModalOpen(true);
                                }}
                            />
                        </motion.div>
                    )}
                </div>
            </div>

            <GrantAwardModal
                isOpen={isGrantAwardModalOpen}
                onClose={() => {
                    setIsGrantAwardModalOpen(false);
                    setGrantAwardInitialData({ category: '', userId: '' });
                }}
                event={event}
                onSuccess={() => fetchEvent()}
                initialCategory={grantAwardInitialData.category}
                initialUserId={grantAwardInitialData.userId}
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

const TabButton = ({ label, active, onClick, count }: { label: string, active: boolean, onClick: () => void, count?: number }) => (
    <button
        onClick={onClick}
        className={`relative py-4 text-sm font-medium transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
    >
        {label}
        {count !== undefined && <span className="ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs">{count}</span>}
        {active && (
            <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
            />
        )}
    </button>
);
