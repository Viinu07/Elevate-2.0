import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch, type RootState } from '../../../store';
import {
    fetchARTs,
    addART,
    updateART,
    deleteART,
    addTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember
} from '../../../store/teamsSlice';
import {
    Users, Plus, Trash2, Edit2, X, Check, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmationDialog } from '../../../shared/components/ConfirmationDialog';
import { FantasySpinner } from '../../../shared/components/FantasySpinner';

export const AdminTeams = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { arts, isLoading, error } = useSelector((state: RootState) => state.teams);

    // Local State
    const [selectedArtId, setSelectedArtId] = useState<string | null>(null);

    // Form States
    const [newArtName, setNewArtName] = useState('');
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedTeamForMember, setSelectedTeamForMember] = useState<string>('');
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('');

    // Editing States
    const [editingArtId, setEditingArtId] = useState<string | null>(null);
    const [editingArtName, setEditingArtName] = useState('');
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [editingTeamName, setEditingTeamName] = useState('');

    // UI States
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => Promise<void>;
    }>({ isOpen: false, title: '', message: '', action: async () => { } });

    const [viewMembersTeamId, setViewMembersTeamId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchARTs());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedArtId && arts.length > 0) {
            setSelectedArtId(arts[0].id);
        }
    }, [arts, selectedArtId]);

    const selectedArt = arts.find(a => a.id === selectedArtId);

    // --- Actions ---

    const handleAddArt = async () => {
        if (!newArtName.trim()) return;
        await dispatch(addART(newArtName));
        setNewArtName('');
    };

    const handleUpdateArt = async (id: string) => {
        if (!editingArtName.trim()) return;
        await dispatch(updateART({ id, name: editingArtName }));
        setEditingArtId(null);
    };

    const handleDeleteArt = (id: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete ART?',
            message: 'Are you sure you want to delete this ART? All teams and members within it will be permanently deleted.',
            action: async () => {
                await dispatch(deleteART(id));
                if (selectedArtId === id) setSelectedArtId(null);
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleAddTeam = async () => {
        if (!newTeamName.trim() || !selectedArtId) return;
        await dispatch(addTeam({ artId: selectedArtId, name: newTeamName }));
        setNewTeamName('');
    };

    const handleUpdateTeam = async (id: string) => {
        if (!editingTeamName.trim()) return;
        await dispatch(updateTeam({ id, name: editingTeamName }));
        setEditingTeamId(null);
    };

    const handleDeleteTeam = (id: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Team?',
            message: 'Are you sure you want to delete this team? All its members and history will be lost.',
            action: async () => {
                await dispatch(deleteTeam(id));
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleAddMember = async () => {
        if (!newMemberName.trim() || !selectedArtId || !selectedTeamForMember) return;
        await dispatch(addMember({
            artId: selectedArtId,
            teamId: selectedTeamForMember,
            name: newMemberName,
            role: newMemberRole.trim() || undefined
        }));
        setNewMemberName('');
        setNewMemberRole('');
    };

    const handleRemoveMember = (teamId: string, memberId: string) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Remove Member?',
            message: 'Are you sure you want to remove this member from the team?',
            action: async () => {
                await dispatch(removeMember({ teamId, memberId }));
                setConfirmDialog(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">Team Management</h2>
                    <p className="text-slate-500 dark:text-slate-400">Organize ARTs, Teams, and Members</p>
                </div>
            </header>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2"
                    >
                        <span>⚠️ {error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ART Selector / Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                <AnimatePresence mode="popLayout">
                    {arts.map(art => (
                        <motion.div
                            key={art.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="relative group"
                        >
                            {editingArtId === art.id ? (
                                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-full border border-blue-500 shadow-lg">
                                    <input
                                        autoFocus
                                        className="bg-transparent px-2 py-1 text-sm font-bold outline-none w-32 dark:text-white"
                                        value={editingArtName}
                                        onChange={e => setEditingArtName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleUpdateArt(art.id)}
                                    />
                                    <button onClick={() => handleUpdateArt(art.id)} className="p-1 hover:bg-blue-100 rounded-full text-blue-600"><Check size={14} /></button>
                                    <button onClick={() => setEditingArtId(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-500"><X size={14} /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedArtId(art.id)}
                                    className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${selectedArtId === art.id
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    {art.name}
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add New ART Button */}
                <div className="flex items-center gap-2">
                    <input
                        className="px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-40 dark:text-white"
                        placeholder="+ New ART Name"
                        value={newArtName}
                        onChange={e => setNewArtName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddArt()}
                    />
                    <button
                        disabled={!newArtName.trim()}
                        onClick={handleAddArt}
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <FantasySpinner size={48} color="#3b82f6" />
                </div>
            ) : selectedArt ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto pb-8">
                    {/* Teams Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header with ART Actions */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">{selectedArt.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {(selectedArt.teams?.length || 0)} Teams • {selectedArt.teams?.reduce((acc, t) => acc + (t.members?.length || 0), 0) || 0} Members
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditingArtId(selectedArt.id); setEditingArtName(selectedArt.name); }}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> Edit Name
                                </button>
                                <button
                                    onClick={() => handleDeleteArt(selectedArt.id)}
                                    className="px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> Delete ART
                                </button>
                            </div>
                        </div>

                        {/* Add Team Section */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Teams</h3>
                            <div className="flex gap-2">
                                <input
                                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    placeholder="New Team Name..."
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddTeam()}
                                />
                                <button
                                    onClick={handleAddTeam}
                                    disabled={!newTeamName.trim()}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Add Team
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AnimatePresence mode="popLayout">
                                {(selectedArt.teams || []).map(team => (
                                    <motion.div
                                        key={team.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col h-full"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            {editingTeamId === team.id ? (
                                                <div className="flex items-center gap-2 flex-1 mr-2">
                                                    <input
                                                        autoFocus
                                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-blue-500 rounded px-2 py-1 text-lg font-bold outline-none dark:text-white"
                                                        value={editingTeamName}
                                                        onChange={e => setEditingTeamName(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleUpdateTeam(team.id)}
                                                    />
                                                    <button onClick={() => handleUpdateTeam(team.id)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Check size={18} /></button>
                                                    <button onClick={() => setEditingTeamId(null)} className="text-slate-400 p-1 hover:bg-slate-100 rounded"><X size={18} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-black text-slate-800 dark:text-white truncate pr-2">{team.name}</h4>
                                                    <p className="text-xs text-slate-500">{(team.members?.length || 0)} members</p>
                                                </div>
                                            )}

                                            {/* Refined Actions - using standard buttons instead of hover icons */}
                                            <div className="flex gap-1 shrink-0">
                                                <button
                                                    onClick={() => { setEditingTeamId(team.id); setEditingTeamName(team.name); }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Rename Team"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTeam(team.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Delete Team"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Members List (Compact) */}
                                        <div className="flex-1 space-y-2">
                                            {(team.members?.slice(0, 3) || []).map(member => (
                                                <div key={member.id} className="flex items-center justify-between text-sm py-1 border-b border-slate-100 dark:border-slate-700/50 last:border-0 group/member">
                                                    <div className="flex-1 min-w-0 mr-2">
                                                        <span className="block text-slate-700 dark:text-slate-300 font-medium truncate">{member.name}</span>
                                                        <span className="block text-xs text-slate-400 truncate">{member.role || 'Member'}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveMember(team.id, member.id)}
                                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover/member:opacity-100 transition-opacity"
                                                        title="Remove Member"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {(team.members?.length || 0) === 0 && (
                                                <p className="text-xs text-slate-400 italic py-2 text-center">No members yet</p>
                                            )}
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                                            <button
                                                className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2"
                                                onClick={() => setSelectedTeamForMember(team.id)}
                                            >
                                                <UserPlus size={14} /> Add Member
                                            </button>

                                            {(team.members?.length || 0) > 3 && (
                                                <button
                                                    onClick={() => setViewMembersTeamId(team.id)}
                                                    className="px-3 py-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                    title="View All Members"
                                                >
                                                    +{(team.members?.length || 0) - 3}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Quick Add Member Panel */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 h-fit sticky top-6">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <UserPlus size={20} className="text-blue-600" />
                            Quick Add Member
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Team</label>
                                <select
                                    value={selectedTeamForMember}
                                    onChange={e => setSelectedTeamForMember(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium"
                                >
                                    <option value="">Select a Team...</option>
                                    {(selectedArt.teams || []).map(team => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Member Name</label>
                                <input
                                    value={newMemberName}
                                    onChange={e => setNewMemberName(e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                                    onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role (Optional)</label>
                                <input
                                    value={newMemberRole}
                                    onChange={e => setNewMemberRole(e.target.value)}
                                    placeholder="Frontend Developer"
                                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                                    onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                                />
                            </div>

                            <button
                                disabled={!newMemberName.trim() || !selectedTeamForMember}
                                onClick={handleAddMember}
                                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                                Add Member
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <p className="text-lg font-medium mb-2">No ART Selected</p>
                    <p className="text-sm">Create an ART to get started</p>
                </div>
            )}

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.action}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />

            {/* View All Members Modal */}
            <AnimatePresence>
                {viewMembersTeamId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            onClick={() => setViewMembersTeamId(null)}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-full max-w-lg pointer-events-auto"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        All Members ({selectedArt?.teams?.find(t => t.id === viewMembersTeamId)?.members?.length})
                                    </h3>
                                    <button onClick={() => setViewMembersTeamId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-2">
                                    {selectedArt?.teams?.find(t => t.id === viewMembersTeamId)?.members?.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                                                    {member.name[0]}
                                                </div>
                                                <div>
                                                    <span className="block font-bold text-slate-700 dark:text-slate-300">{member.name}</span>
                                                    <span className="block text-xs text-slate-400">{member.role || 'Member'}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMember(viewMembersTeamId, member.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
