import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchCollabData, fetchVotingStatus, fetchVotingResults } from '../../store/collabSlice';
import { fetchWorkItems } from '../../store/releasesSlice';
import { endorsementsAPI } from '../../api/v2/endorsements';
import type { EndorsementResponse } from '../../api/v2/types';
import { Award, Rocket, MessageCircle, Trophy, Zap, Calendar, Star, Crown } from 'lucide-react';

export default function ProfilePage() {
    const dispatch = useDispatch<AppDispatch>();
    const currentUser = useSelector((state: RootState) => state.user.data);
    const { voting } = useSelector((state: RootState) => state.collab);
    const { workItems } = useSelector((state: RootState) => state.releases);

    const [endorsements, setEndorsements] = useState<EndorsementResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Derived current user ID to ensure reactivity
    const currentUserId = currentUser?.id || '09103f63-7cc3-4c8f-8095-e5a038b1fc17';

    useEffect(() => {
        const loadData = async () => {
            // Wait for user to be loaded if we suspect a race condition, 
            // but since we have a fallback ID, we can proceed.
            // However, we should re-fetch if currentUser changes from null to populated.

            setLoading(true);
            try {
                if (currentUserId) {
                    dispatch(fetchCollabData(currentUserId));
                }
                dispatch(fetchVotingStatus());
                dispatch(fetchVotingResults());
                dispatch(fetchWorkItems());

                // Fetch endorsements
                const allEndorsements = await endorsementsAPI.list();
                setEndorsements(allEndorsements.filter(e => e.receiver_id === currentUserId));
            } catch (error) {
                console.error("Failed to load profile data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [dispatch, currentUserId]); // Depend on currentUserId so it re-runs when user loads

    // --- Derived Data ---

    // 1. Releases (Team & POC)
    const teamReleases = workItems.filter(item =>
        item.team === currentUser?.team_name && item.status === 'Completed'
    );

    // Releases where user is POC (avoiding duplicates if they are also on the team)
    const pocReleases = workItems.filter(item =>
        item.poc_id === currentUserId &&
        item.status === 'Completed' &&
        !teamReleases.find(r => r.id === item.id) // Exclude if already in team releases
    );

    const allMyReleases = [...teamReleases, ...pocReleases].sort((a, b) =>
        new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
    );

    // 2. Awards (Voting Results)
    const votingAwards = Object.values(voting.results || {}).flatMap((result) => {
        const myRank = result.top_3.find(winner => winner.nominee_id === currentUserId);
        if (myRank) {
            return [{ ...result, rank: myRank, type: 'VOTING' }];
        }
        return [];
    });

    // 3. Event Awards (Endorsements linked to Events)
    const eventAwards = endorsements.filter(e => e.event_id || e.category === 'Event Winner').map(e => ({
        id: e.id,
        category_name: e.event_name || 'Event Award',
        category_icon: '🏆',
        rank: { vote_count: e.likes }, // Mock vote count from likes
        type: 'EVENT',
        original: e
    }));

    const totalAwardsCount = votingAwards.length + eventAwards.length;

    // 4. Impact Score Calculation
    // Logic: Team Release (50pts), POC Release (75pts), Voting Award (100pts), Event Award (50pts), Endorsement (10pts)
    const impactScore =
        (teamReleases.length * 50) +
        (pocReleases.length * 75) +
        (votingAwards.length * 100) +
        (eventAwards.length * 50) +
        (endorsements.length * 10);

    const level = Math.floor(impactScore / 1000) + 1; // Level up every 1000 points

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-50 dark:bg-slate-900/50 relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent dark:from-slate-800 dark:via-slate-900/50 dark:to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

                {/* --- Profile Header --- */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 mb-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left animate-in slide-in-from-bottom-4 duration-700">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="relative w-40 h-40 rounded-full border-[6px] border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 shadow-2xl overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.name || 'Viinu'}&backgroundColor=b6e3f4`} alt="Profile" className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110" />
                        </div>
                        <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-slate-800 rounded-full" title="Online" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                {currentUser?.name || 'Loading...'}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700">
                                    {currentUser?.role || 'Senior Developer'}
                                </span>
                                <span className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 font-bold text-sm border border-blue-100 dark:border-blue-900/30 flex items-center gap-2">
                                    <span>🌐</span> {currentUser?.team_name || 'Olympus'}
                                </span>
                            </div>
                        </div>

                        {/* Key Stats Row */}
                        <div className="flex items-center justify-center md:justify-start gap-4 md:gap-8 pt-2">
                            <div className="text-center md:text-left">
                                <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{totalAwardsCount}</div>
                                <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Awards</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                            <div className="text-center md:text-left">
                                <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{endorsements.length}</div>
                                <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Endorsements</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                            <div className="text-center md:text-left">
                                <div className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{allMyReleases.length}</div>
                                <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Releases</div>
                            </div>
                        </div>
                    </div>

                    {/* Impact Score - Mobile/Desktop Responsive */}
                    <div className="flex md:flex-col items-center gap-2 md:pl-4 md:border-l border-slate-200 dark:border-slate-700 mt-6 md:mt-0 w-full md:w-auto justify-center border-t md:border-t-0 pt-6 md:pt-0">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center md:text-left">Impact Score</div>
                        <div className="flex items-baseline gap-2 md:block">
                            <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-600 filter drop-shadow-sm">
                                {impactScore}
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 md:mt-1">
                                <Zap size={14} className="text-amber-500 fill-amber-500" /> Level {level}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Content Grid --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Recognition */}
                    <div className="space-y-8 animate-in slide-in-from-left-4 duration-700 delay-100">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Award className="text-amber-500" /> Awards & Recognition
                        </h2>

                        {/* Awards List (Voting + Events) */}
                        {(votingAwards.length > 0 || eventAwards.length > 0) && (
                            <div className="grid grid-cols-1 gap-4">
                                {/* Voting Awards */}
                                {votingAwards.map((award: any) => (
                                    <div key={award.category_id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-6 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Trophy size={80} className="text-amber-600" />
                                        </div>
                                        <div className="text-4xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                            {award.category_icon}
                                        </div>
                                        <div className="relative z-10 block text-left">
                                            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                                                Season Winner • {award.rank.vote_count} Votes
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{award.category_name}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">Recognized for outstanding contribution.</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Event Awards */}
                                {eventAwards.map((award: any) => (
                                    <div key={award.id} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/30 flex items-center gap-6 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Crown size={80} className="text-purple-600" />
                                        </div>
                                        <div className="text-4xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                                            {award.category_icon}
                                        </div>
                                        <div className="relative z-10 block text-left">
                                            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Star size={12} fill="currentColor" /> Event Champion
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{award.category_name}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                                                "{award.original.message}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Endorsements List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Peer Endorsements</h3>
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{endorsements.length} total</span>
                            </div>

                            {endorsements.length === 0 ? (
                                <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 border-dashed">
                                    <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No endorsements yet.</p>
                                </div>
                            ) : (
                                endorsements.map(endorsement => (
                                    <div key={endorsement.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow text-left">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold shrink-0">
                                                {endorsement.giver_name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900 dark:text-white">{endorsement.giver_name || 'Teammate'}</span>
                                                    <span className="text-slate-400 text-sm">•</span>
                                                    <span className="text-xs font-bold text-slate-500 uppercase">{endorsement.category}</span>
                                                </div>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-3">
                                                    "{endorsement.message}"
                                                </p>
                                                <div className="flex gap-2">
                                                    {endorsement.skills?.split(',').map((skill: string) => (
                                                        <span key={skill} className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 text-xs font-medium text-slate-500">
                                                            {skill.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Contributions */}
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-700 delay-200">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Rocket className="text-blue-500" /> Contributions
                        </h2>

                        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-4 space-y-8 pl-8 py-2">
                            {allMyReleases.length === 0 ? (
                                <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 border-dashed -ml-8">
                                    <Rocket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-400 font-medium">No releases shipped yet.</p>
                                </div>
                            ) : (
                                allMyReleases.map((release) => {
                                    const isPoc = release.poc_id === currentUserId;
                                    return (
                                        <div key={release.id} className="relative">
                                            {/* Timeline Dot */}
                                            <div className={`absolute -left-[41px] top-6 w-5 h-5 rounded-full border-4 ${isPoc ? 'bg-amber-500 border-amber-200 dark:border-amber-900' : 'bg-white dark:bg-slate-900 border-blue-500'}`} />

                                            <div className={`bg-white dark:bg-slate-800 p-6 rounded-3xl border ${isPoc ? 'border-amber-200 dark:border-amber-900/50 shadow-amber-100 dark:shadow-none' : 'border-slate-100 dark:border-slate-700/50'} shadow-sm hover:shadow-lg transition-all group text-left`}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {isPoc ? (
                                                                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
                                                                    <Crown size={12} /> Release Lead (POC)
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-bold border border-green-100 dark:border-green-900/30">
                                                                    Shipped
                                                                </span>
                                                            )}
                                                            <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                                                                <Calendar size={12} /> {new Date(release.completedAt || Date.now()).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                            {release.title}
                                                        </h3>
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">
                                                        {release.release}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                    {isPoc
                                                        ? `Led the release cycle for ${release.release}, ensuring successful delivery.`
                                                        : `Successfully delivered as part of the ${release.release} release cycle.`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
