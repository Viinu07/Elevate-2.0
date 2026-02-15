import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, User as UserIcon, Send, Users, Activity, ExternalLink } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import { fetchTeams, fetchTeamUpdates, addTeamUpdate } from '../../store/teamsSlice';
import { addWorkItem, updateWorkItemStatus, fetchWorkItems } from '../../store/releasesSlice';
import { fetchCurrentUser } from '../../store/userSlice';

export default function TeamDetailsPage() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Tabs
    const [activeTab, setActiveTab] = useState<'updates' | 'members'>('updates');

    // Form State
    const [newUpdateContent, setNewUpdateContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redux Data
    const { teams, isLoading } = useSelector((state: RootState) => state.teams);
    const { workItems } = useSelector((state: RootState) => state.releases);
    const currentUser = useSelector((state: RootState) => state.user.data);

    // Find Team
    const team = teams.find(t => t.id === teamId);

    // Derived Data
    const teamWorkItems = team ? workItems.filter(i => i.team === team.name) : [];
    const activeItems = teamWorkItems.filter(i => i.status !== 'Completed');
    const completedItems = teamWorkItems.filter(i => i.status === 'Completed');

    // Metrics
    const velocity = completedItems.length * 5; // Mock: 5 pts per item
    const healthScore = 92; // Mock: could be calculated from gates passed

    // Initial Fetch
    useEffect(() => {
        dispatch(fetchCurrentUser());
        dispatch(fetchWorkItems());
        if (teams.length === 0) {
            dispatch(fetchTeams());
        }
    }, [dispatch, teams.length]);

    if (isLoading && !team) {
        return <div className="h-full flex items-center justify-center text-slate-400">Loading team details...</div>;
    }

    if (!team) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <h2 className="text-2xl font-bold mb-4">Team Not Found</h2>
                <button onClick={() => navigate('/teams')} className="text-blue-600 hover:underline">Back to Teams</button>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-900 flex flex-col p-4 overflow-hidden">

            {/* Main Content Card (Glassmorphism) */}
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden relative flex flex-col">

                {/* Header Section */}
                <div className="p-8 pb-0 z-10">
                    <button
                        onClick={() => navigate('/teams')}
                        className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-6 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Teams
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{team.name}</h1>
                                {team.art_name && (
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {team.art_name}
                                    </span>
                                )}
                            </div>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Command Center & Performance</p>
                        </div>

                        {/* Tabs */}
                        <div className="p-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-2xl flex gap-1">
                            <button
                                onClick={() => setActiveTab('updates')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'updates'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                <Activity size={18} />
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'members'
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                            >
                                <Users size={18} />
                                Members
                                <span className="bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded-md text-xs">
                                    {team.members?.length || 0}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-0">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {activeTab === 'updates' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">



                                {/* Kanban Board */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-xl text-slate-900 dark:text-white">Team Kanban</h3>
                                        <div className="flex gap-4 text-sm font-medium text-slate-500">
                                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Proposed</span>
                                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Committed</span>
                                            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Completed</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                                        {['Proposed', 'Committed', 'Completed'].map(status => {
                                            const items = teamWorkItems.filter(i => i.status === status);

                                            // Status Styling
                                            const isProposed = status === 'Proposed';
                                            const isCommitted = status === 'Committed';
                                            const isCompleted = status === 'Completed';

                                            return (
                                                <div key={status} className={`flex flex-col rounded-3xl border p-4 h-full overflow-hidden transition-colors ${isCommitted ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' :
                                                    isCompleted ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' :
                                                        'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
                                                    }`}>
                                                    <div className="flex items-center justify-between mb-4 px-2">
                                                        <span className={`text-xs font-black uppercase tracking-widest ${isCommitted ? 'text-blue-600 dark:text-blue-400' :
                                                            isCompleted ? 'text-green-600 dark:text-green-400' :
                                                                'text-slate-500 dark:text-slate-400'
                                                            }`}>
                                                            {status}
                                                        </span>
                                                        <span className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm">
                                                            {items.length}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 pb-2">
                                                        {items.map(item => (
                                                            <div key={item.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-move">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${item.release.includes('beta') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                                        }`}>
                                                                        {item.release}
                                                                    </span>
                                                                    {/* Gates Dots */}
                                                                    <div className="flex gap-1">
                                                                        {(['unitTesting', 'systemTesting', 'intTesting'] as const).map(gate => (
                                                                            <div key={gate} className={`w-1.5 h-1.5 rounded-full ${(item[gate] as any)?.status === 'Passed' ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                                                                                }`} title={gate} />
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm leading-relaxed group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                    {item.title}
                                                                </h4>

                                                                <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                                        <Users size={12} />
                                                                        <span>{item.team}</span>
                                                                    </div>
                                                                    {/* Priority/Type icon placeholder */}
                                                                    <div className={`w-2 h-2 rounded-sm ${item.warrantyCallNeeded ? 'bg-red-500' : 'bg-transparent'
                                                                        }`} title="Warranty Call Needed" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {items.length === 0 && (
                                                            <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-40">
                                                                <div className="text-sm font-bold text-slate-400">Empty</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {team.members && team.members.length > 0 ? (
                                    team.members.map((member) => (
                                        <div key={member.id} className="bg-white dark:bg-slate-800 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                                {member.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{member.name}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{member.role || 'Team Member'}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Users size={32} className="text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">It's quiet here</h3>
                                        <p className="text-slate-500">Add members to this team from the Admin panel.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
