import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import {
    fetchAwards,
    fetchVotingStatus,
    fetchVotingResults
} from '@/store/collabSlice';
import { motion } from 'framer-motion';
import { Award, Trophy, Vote as VoteIcon } from 'lucide-react';

export default function AwardsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { voting } = useSelector((state: RootState) => state.collab);

    useEffect(() => {
        dispatch(fetchAwards());
        dispatch(fetchVotingResults());
        dispatch(fetchVotingStatus());
    }, [dispatch]);

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 0: return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 1: return <Trophy className="w-6 h-6 text-gray-400" />;
            case 2: return <Trophy className="w-6 h-6 text-amber-700" />;
            default: return null;
        }
    };

    const isVotingOpen = voting.status?.is_voting_open ?? false;

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Awards</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400">Recognize excellence in our team.</p>
            </div>

            {/* Status Banner */}
            {!isVotingOpen && (
                <div className="mb-8 bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-slate-400" />
                        <p className="text-slate-600 dark:text-slate-400">Voting is currently closed. Final results are displayed below!</p>
                    </div>
                </div>
            )}
            {isVotingOpen && (
                <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <VoteIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <p className="text-blue-800 dark:text-blue-200">Voting is open! Go to your profile to nominate your peers.</p>
                    </div>
                </div>
            )}

            {/* Results Section */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Current Results</h2>

                {voting.status?.results_visible ? (
                    voting.results && Object.keys(voting.results).length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {Object.entries(voting.results).map(([categoryId, result]: [string, any]) => (
                                <motion.div
                                    key={categoryId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                        <span className="text-3xl">{result.category_icon}</span>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{result.category_name}</h3>
                                    </div>

                                    {result.top_3.length > 0 ? (
                                        <div className="space-y-3">
                                            {result.top_3.map((nominee: any, index: number) => (
                                                <div
                                                    key={nominee.nominee_id}
                                                    className={`flex items-center justify-between p-3 rounded-xl ${index === 0
                                                        ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800'
                                                        : 'bg-slate-50 dark:bg-slate-900'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {getMedalIcon(index)}
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white">{nominee.nominee_name}</p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">Rank #{index + 1}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{nominee.vote_count}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">votes</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            <Award size={48} className="mx-auto mb-2 opacity-20" />
                                            <p>No votes yet for this category</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-slate-400">
                            <Award size={64} className="mx-auto mb-4 opacity-20" />
                            <p className="text-xl">No award categories yet.</p>
                            <p className="text-sm mt-2">Check back later to see award results!</p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Award size={64} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Results Coming Soon</h3>
                        <p className="text-slate-500 dark:text-slate-400">The awards ceremony hasn't started yet. Stay tuned!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
