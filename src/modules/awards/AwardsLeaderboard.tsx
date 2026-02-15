import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { selectTop3ByAward } from '../../store/awardsSelectors';
import { fetchAwards, fetchVotingResults, fetchVotingStatus } from '../../store/collabSlice';

export default function AwardsLeaderboard() {
    const dispatch = useDispatch<AppDispatch>();
    const top3ByAward = useSelector(selectTop3ByAward);
    const { activeVoting: votingPeriod, categories } = useSelector((state: RootState) => state.collab.awards);

    useEffect(() => {
        dispatch(fetchAwards());
        dispatch(fetchVotingResults());
        dispatch(fetchVotingStatus());
    }, [dispatch]);

    return (
        <div className="h-full w-full p-8 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                    🏆 Awards Leaderboard
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400">
                    Top 3 nominees in each category
                </p>

                {/* Voting Status */}
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className={`w-2 h-2 rounded-full ${votingPeriod.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Voting {votingPeriod.isOpen ? 'Open' : 'Closed'}
                    </span>
                </div>
            </div>

            {/* Awards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {categories.map(category => {
                    const top3 = top3ByAward[category.id] || [];

                    return (
                        <div
                            key={category.id}
                            className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-lg border border-slate-200 dark:border-slate-700"
                        >
                            {/* Category Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl">
                                    {category.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                        {category.name}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {category.description}
                                    </p>
                                </div>
                            </div>

                            {/* Podium */}
                            {top3.length > 0 ? (
                                <div className="flex items-end justify-center gap-4 h-64">
                                    {/* 2nd Place */}
                                    {top3[1] && (
                                        <div className="flex flex-col items-center flex-1">
                                            <div className="mb-3 text-center">
                                                <div className="w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center mx-auto mb-2 text-2xl font-bold border-4 border-slate-400">
                                                    🥈
                                                </div>
                                                <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[100px]">
                                                    {top3[1].nominee}
                                                </p>
                                                <p className="text-lg font-black text-slate-600 dark:text-slate-400">
                                                    {top3[1].voteCount}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                                    {top3[1].percentage.toFixed(0)}%
                                                </p>
                                            </div>
                                            <div className="w-full h-32 bg-gradient-to-t from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 rounded-t-2xl flex items-center justify-center shadow-inner">
                                                <span className="text-4xl font-black text-white opacity-50">2</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 1st Place */}
                                    {top3[0] && (
                                        <div className="flex flex-col items-center flex-1">
                                            <div className="mb-3 text-center">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center mx-auto mb-2 text-3xl font-bold border-4 border-yellow-400 shadow-lg animate-pulse">
                                                    🥇
                                                </div>
                                                <p className="font-bold text-base text-slate-900 dark:text-white truncate max-w-[120px]">
                                                    {top3[0].nominee}
                                                </p>
                                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                                    {top3[0].voteCount}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {top3[0].percentage.toFixed(0)}%
                                                </p>
                                            </div>
                                            <div className="w-full h-48 bg-gradient-to-t from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-500 rounded-t-2xl flex items-center justify-center shadow-xl">
                                                <span className="text-5xl font-black text-white opacity-50">1</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3rd Place */}
                                    {top3[2] && (
                                        <div className="flex flex-col items-center flex-1">
                                            <div className="mb-3 text-center">
                                                <div className="w-14 h-14 rounded-full bg-orange-300 dark:bg-orange-700 flex items-center justify-center mx-auto mb-2 text-xl font-bold border-4 border-orange-400">
                                                    🥉
                                                </div>
                                                <p className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[90px]">
                                                    {top3[2].nominee}
                                                </p>
                                                <p className="text-base font-black text-slate-600 dark:text-slate-400">
                                                    {top3[2].voteCount}
                                                </p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-500">
                                                    {top3[2].percentage.toFixed(0)}%
                                                </p>
                                            </div>
                                            <div className="w-full h-24 bg-gradient-to-t from-orange-300 to-orange-400 dark:from-orange-700 dark:to-orange-600 rounded-t-2xl flex items-center justify-center shadow-inner">
                                                <span className="text-3xl font-black text-white opacity-50">3</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-600">
                                    <div className="text-center">
                                        <p className="text-lg font-medium mb-2">No votes yet</p>
                                        <p className="text-sm">Be the first to vote!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
