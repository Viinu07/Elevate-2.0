import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import { fetchARTs } from '../../../store/teamsSlice';
import { fetchVotingResults, fetchVotingStatus } from '../../../store/collabSlice';

interface AdminDashboardProps {
    setActiveSection: (section: 'teams' | 'awards') => void;
}

export const AdminDashboard = ({ setActiveSection }: AdminDashboardProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const teams = useSelector((state: RootState) => state.teams);
    const arts = teams?.arts || [];
    const votingPeriod = useSelector((state: RootState) => state.collab?.awards?.activeVoting);
    const votingResults = useSelector((state: RootState) => state.collab.voting.results);

    // Fetch teams data on mount to ensure counts are up-to-date
    useEffect(() => {
        dispatch(fetchARTs());
        dispatch(fetchVotingStatus());
        dispatch(fetchVotingResults());
    }, [dispatch]);

    // Calculate total votes across all categories
    const totalVotes = useMemo(() => {
        if (!votingResults) return 0;

        return Object.values(votingResults).reduce((total: number, category: any) => {
            const categoryTotal = category.top_3?.reduce((sum: number, nominee: any) => sum + (nominee.vote_count || 0), 0) || 0;
            return total + categoryTotal;
        }, 0);
    }, [votingResults]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="mb-4">
                <h2 className="text-4xl font-black text-slate-800 dark:text-white">Admin Dashboard</h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 mt-2">Select an area to manage</p>
            </header>

            {/* Navigation Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Team Management Card */}
                <div
                    onClick={() => setActiveSection('teams')}
                    className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer min-h-[300px] flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">
                            👥
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Team Management
                        </h3>
                        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                            Manage Agile Release Trains, Teams, and Members. Organize your organization's structure.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6 mt-8">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                {arts.length}
                            </div>
                            <div className="h-10 flex items-center px-4 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400">
                                ARTs
                            </div>
                        </div>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                            Manage Teams &rarr;
                        </span>
                    </div>
                </div>

                {/* Awards & Voting Card */}
                <div
                    onClick={() => setActiveSection('awards')}
                    className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer min-h-[300px] flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-amber-500/20 transition-all duration-500"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">
                            🏆
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            Awards & Voting
                        </h3>
                        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                            Configure award categories, manage voting periods, and view live results.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-6 mt-8">
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider ${votingPeriod?.isOpen
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {votingPeriod?.isOpen ? 'Voting Open' : 'Voting Closed'}
                            </div>
                            <div className="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {totalVotes} Total Votes
                            </div>
                        </div>
                        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
                        <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-2 transition-transform">
                            Manage Awards &rarr;
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
