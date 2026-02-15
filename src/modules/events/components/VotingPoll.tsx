import { useState, useEffect } from 'react';
import { Check, MessageSquare, Send, Trophy, Lock } from 'lucide-react';
import { StatusModal } from '@/modules/common/components/StatusModal';
import { eventsAPI } from '@/api/v2/events';
import { profilesAPI } from '@/api/v2/profiles';
import type { EventDetailResponse, VoteCount, UserProfileFullResponse } from '@/api/v2/types';

interface VotingPollProps {
    event: EventDetailResponse;
    currentUser: any;
    onVoteSubmitted: () => void;
    onGrantAward?: (category: string, nomineeId: string) => void;
}

export const VotingPoll = ({ event, currentUser, onVoteSubmitted, onGrantAward }: VotingPollProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedNominee, setSelectedNominee] = useState<string>("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

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

    // Organizer View State
    const [voteResults, setVoteResults] = useState<VoteCount[]>([]);
    const [loadingResults, setLoadingResults] = useState(false);

    // All Users State for Nominations
    const [allUsers, setAllUsers] = useState<UserProfileFullResponse[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    const isOrganizer = currentUser?.id === event.organizer_id;
    const categories = event.award_categories ? event.award_categories.split(',').map(c => c.trim()) : [];

    // Filter eligible nominees (all users excluding self)
    const nominees = allUsers.filter(u => u.user_id !== currentUser.id);

    useEffect(() => {
        if (categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [event.award_categories]);

    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const users = await profilesAPI.list();
                setAllUsers(users);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (isOrganizer) {
            fetchResults();
        }
    }, [isOrganizer, event.id]);

    const fetchResults = async () => {
        setLoadingResults(true);
        try {
            const results = await eventsAPI.getVotes(event.id);
            setVoteResults(results);
        } catch (error) {
            console.error("Failed to fetch vote results", error);
        } finally {
            setLoadingResults(false);
        }
    };

    const handleVote = async () => {
        if (!selectedCategory || !selectedNominee) return;

        setIsSubmitting(true);
        try {
            await eventsAPI.vote(event.id, {
                event_id: event.id,
                nominee_id: selectedNominee,
                award_category: selectedCategory,
                reason: reason
            });
            setHasVoted(true);
            onVoteSubmitted();
            if (isOrganizer) fetchResults(); // Refresh results if organizer votes
        } catch (error) {
            console.error("Failed to submit vote", error);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Submission Failed',
                message: 'Failed to submit vote. You may have already voted.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Organizer View
    if (isOrganizer) {
        return (
            <div className="bg-white dark:bg-[#15171B] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Lock size={18} className="text-amber-500" />
                            Voting Results
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Only visible to organizer</p>
                    </div>
                    <button
                        onClick={fetchResults}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Refresh
                    </button>
                </div>

                {loadingResults ? (
                    <div className="py-12 text-center text-slate-400">Loading results...</div>
                ) : voteResults.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <Trophy size={32} className="mx-auto mb-3 opacity-20" />
                        <p>No votes cast yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {categories.map(category => {
                            const categoryVotes = voteResults
                                .filter(v => v.award_category === category)
                                .sort((a, b) => b.count - a.count);

                            if (categoryVotes.length === 0) return null;

                            return (
                                <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">
                                        {category}
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {categoryVotes.map((vote, idx) => (
                                            <div key={vote.nominee_id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        idx === 1 ? 'bg-slate-100 text-slate-700' :
                                                            idx === 2 ? 'bg-amber-100 text-amber-800' : 'bg-transparent text-slate-400'
                                                        }`}>
                                                        {idx + 1}
                                                    </span>
                                                    <img src={vote.nominee_avatar} alt={vote.nominee_name} className="w-8 h-8 rounded-full bg-slate-200" />
                                                    <span className="font-medium text-slate-900 dark:text-white">{vote.nominee_name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-slate-900 dark:text-white">{vote.count} votes</span>
                                                    {onGrantAward && (
                                                        <button
                                                            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                                                            onClick={() => onGrantAward(vote.award_category, vote.nominee_id)}
                                                        >
                                                            <Trophy size={14} />
                                                            Grant Award
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Attendee View
    if (hasVoted) {
        return (
            <div className="bg-white dark:bg-[#15171B] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vote Submitted!</h3>
                <p className="text-slate-500 dark:text-slate-400">Thank you for participating. The organizer will announce the winners soon.</p>
                <button
                    onClick={() => setHasVoted(false)}
                    className="mt-6 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                    Cast another vote
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#15171B] rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className="text-amber-500" size={20} />
                    Cast Your Vote
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select a category and nominate a team member.
                </p>
            </div>

            <div className="space-y-6 max-w-xl">
                {/* Category Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Award Category</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nominee Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Nominee</label>

                    {loadingUsers ? (
                        <div className="text-center py-8 text-slate-400 text-sm">Loading eligible nominees...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                            {nominees.map(nominee => (
                                <button
                                    key={nominee.user_id}
                                    onClick={() => setSelectedNominee(nominee.user_id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedNominee === nominee.user_id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500'
                                        : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <img
                                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${nominee.name}`}
                                        alt={nominee.name}
                                        className="w-10 h-10 rounded-full bg-slate-100"
                                    />
                                    <div>
                                        <p className={`font-semibold text-sm ${selectedNominee === nominee.user_id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                                            {nominee.name}
                                        </p>
                                        <p className="text-xs text-slate-500">Team Member</p>
                                    </div>
                                    {selectedNominee === nominee.user_id && <Check size={16} className="ml-auto text-blue-600" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {!loadingUsers && nominees.length === 0 && (
                        <p className="text-sm text-slate-500 italic">No eligible nominees found.</p>
                    )}
                </div>

                {/* Reason */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Reason (Optional)</label>
                    <div className="relative">
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why do they deserve this award?"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                        />
                        <MessageSquare className="absolute right-3 top-3 text-slate-400" size={16} />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleVote}
                        disabled={isSubmitting || !selectedCategory || !selectedNominee}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${isSubmitting || !selectedCategory || !selectedNominee
                            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:scale-[1.02]'
                            }`}
                    >
                        {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
                        {!isSubmitting && <Send size={18} />}
                    </button>
                </div>
            </div>

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
