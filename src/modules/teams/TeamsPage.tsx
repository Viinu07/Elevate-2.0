import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchARTs, fetchTeams } from '@/store/teamsSlice';
import { motion } from 'framer-motion';

const TeamCard = ({ name, id, color, memberCount }: { name: string, id: string, color: string, memberCount: number }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/teams/${id}`)}
            className="group relative bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-300 cursor-pointer overflow-hidden"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-bl-[100px] transition-transform group-hover:scale-150 duration-500`}></div>

            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white font-bold text-lg mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    {name[0]}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{memberCount} members</p>

                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors flex items-center gap-2">
                    Explore Team
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </span>
            </div>
        </motion.div>
    );
};

import { FantasySpinner } from '../../shared/components/FantasySpinner';

export default function TeamsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { arts, isLoading } = useSelector((state: RootState) => state.teams);

    useEffect(() => {
        dispatch(fetchARTs());
        dispatch(fetchTeams());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <FantasySpinner size={64} color="#3b82f6" />
            </div>
        );
    }
    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto w-full">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Organization</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-12">ARTs & Teams Structure</p>

            <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto">
                {arts.map((art) => (
                    <div key={art.id}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                            <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest px-4">
                                {art.name}
                            </h2>
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(art.teams || []).map((team) => (
                                <TeamCard
                                    key={team.id}
                                    name={team.name}
                                    id={team.id}
                                    memberCount={team.members?.length || 0}
                                    // Assign distinct colors based on index or hash for variety
                                    color={['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-cyan-500', 'bg-amber-500'][team.id.charCodeAt(0) % 5]}
                                />
                            ))}
                            {(art.teams || []).length === 0 && (
                                <div className="col-span-full text-center text-slate-400 italic py-8">
                                    No teams in this ART.
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {arts.length === 0 && (
                    <div className="text-center text-slate-500 py-12">No ARTs found.</div>
                )}
            </div>
        </div>
    );
}
