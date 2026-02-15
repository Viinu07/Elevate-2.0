import { useState, useEffect } from 'react';
import { endorsementsAPI } from '@/api/v2/endorsements';
import type { EndorsementResponse } from '@/api/v2/types';
import { Award, Heart, MessageCircle, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RecognitionWall = () => {
    const [endorsements, setEndorsements] = useState<EndorsementResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterBadge, setFilterBadge] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const badges = ['Team Player', 'Bug Hunter', 'Innovator', 'Saviour', 'Leader', 'Mentor'];

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

    const getBadgeColor = (label: string) => {
        switch (label) {
            case 'Team Player': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Bug Hunter': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'Innovator': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'Saviour': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'Leader': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Mentor': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    useEffect(() => {
        const fetchEndorsements = async () => {
            try {
                const data = await endorsementsAPI.list();
                setEndorsements(data);

                // After endorsements load, check if there's a hash in URL
                if (window.location.hash) {
                    const endorsementId = window.location.hash.substring(1); // Remove the '#'
                    setTimeout(() => {
                        const element = document.getElementById(`endorsement-${endorsementId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('ring-2', 'ring-rose-500', 'ring-offset-2');
                            setTimeout(() => {
                                element.classList.remove('ring-2', 'ring-rose-500', 'ring-offset-2');
                            }, 3000);
                        }
                    }, 300); // Small delay to ensure rendering
                }
            } catch (error) {
                console.error("Failed to fetch endorsements", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEndorsements();
    }, []);

    const filteredEndorsements = endorsements.filter(e => {
        const matchesBadge = filterBadge ? e.category === filterBadge : true;
        const matchesSearch = searchQuery
            ? e.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.giver_name.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return matchesBadge && matchesSearch;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto h-full overflow-y-auto scrollbar-hide">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Award className="text-amber-500" />
                        Recognition Wall
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Celebrating our team's wins and values</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search people or messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setFilterBadge(null)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${!filterBadge ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            All
                        </button>
                        {badges.map(badge => (
                            <button
                                key={badge}
                                onClick={() => setFilterBadge(badge)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterBadge === badge ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            >
                                {badge}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredEndorsements.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Award size={40} className="mx-auto mb-4 opacity-20" />
                    <p>No endorsements found matching your filters.</p>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    <AnimatePresence>
                        {filteredEndorsements.map((endorsement) => (
                            <motion.div
                                key={endorsement.id}
                                id={`endorsement-${endorsement.id}`}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="break-inside-avoid bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img
                                                src={endorsement.receiver_avatar}
                                                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm">
                                                <div className="bg-blue-100 dark:bg-blue-900/50 p-0.5 rounded-full">
                                                    <span className="text-xs">👏</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{endorsement.receiver_name}</h3>
                                            <p className="text-xs text-slate-500">received kudos from <span className="font-medium text-slate-700 dark:text-slate-300">{endorsement.giver_name}</span></p>
                                        </div>
                                    </div>
                                    <span className={`text-2xl`} title={endorsement.category}>
                                        {getBadgeIcon(endorsement.category)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className={`p-4 rounded-xl mb-4 ${getBadgeColor(endorsement.category)}`}>
                                    <p className="text-sm italic font-medium leading-relaxed">
                                        "{endorsement.message}"
                                    </p>
                                </div>

                                {/* Event Award Badge & Event Name */}
                                {endorsement.event_name && (
                                    <div className="mb-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium rounded-full mb-2">
                                            📅 Event Award
                                        </span>
                                        <div className="px-3 py-1.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                                <span className="font-semibold">Awarded at:</span> {endorsement.event_name}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Metadata / Tags */}
                                {(endorsement.project_id || endorsement.skills) && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {endorsement.project_id && (
                                            <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase tracking-wider rounded-md border border-slate-200 dark:border-white/10">
                                                Project Linked
                                            </span>
                                        )}
                                        {endorsement.skills && endorsement.skills.split(',').map((skill) => (
                                            <span key={skill} className="px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[10px] uppercase tracking-wider rounded-md border border-slate-200 dark:border-white/10">
                                                {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Footer (Social) */}
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                    <span className="text-xs text-slate-400">{new Date(endorsement.created_at).toLocaleDateString()}</span>

                                    <div className="flex gap-3">
                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <Heart size={14} className={endorsement.liked_by_user ? "text-rose-500 fill-rose-500" : ""} />
                                            <span>{endorsement.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                            <MessageCircle size={14} />
                                            <span>{endorsement.comments}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
