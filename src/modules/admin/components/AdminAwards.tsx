import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import {
    fetchAwards,
    fetchVotingStatus,
    toggleVotingStatus,
    fetchVotingResults,
    createAwardCategory
} from '@/store/collabSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

export const AdminAwards = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { awards, voting } = useSelector((state: RootState) => state.collab);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResults, setShowResults] = useState(true);
    const [newCategory, setNewCategory] = useState({
        name: '',
        icon: '🏆',
        description: ''
    });
    const [currentUserId] = useState('46a3bbe3-20ab-41f0-9d25-b5d7863170d3');

    useEffect(() => {
        dispatch(fetchAwards());
        dispatch(fetchVotingStatus());
        dispatch(fetchVotingResults());
    }, [dispatch]);

    const handleToggleVoting = async () => {
        if (voting.status) {
            try {
                await dispatch(toggleVotingStatus({
                    isOpen: !voting.status.is_voting_open,
                    updatedBy: currentUserId
                })).unwrap();

                await dispatch(fetchVotingStatus());
                await dispatch(fetchVotingResults());
            } catch (error) {
                console.error('Failed to toggle voting status:', error);
                alert('Failed to update voting status');
            }
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategory.name || !newCategory.icon || !newCategory.description) return;

        try {
            await dispatch(createAwardCategory(newCategory));
            setShowCreateModal(false);
            setNewCategory({ name: '', icon: '🏆', description: '' });
            dispatch(fetchAwards());
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    const isVotingOpen = voting.status?.is_voting_open ?? false;
    const resultsVisible = voting.status?.results_visible ?? false;

    const commonEmojis = ['🏆', '⭐', '🎯', '💎', '🔥', '🌟', '👑', '🎖️', '🏅', '💪', '🚀', '⚡', '🎨', '💡', '🎭'];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <header>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-1">Awards & Voting</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage categories, control voting periods, and monitor results</p>
            </header>

            {/* Controls - Minimalistic */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Controls</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Voting Toggle */}
                    <button
                        onClick={handleToggleVoting}
                        className="group flex items-center justify-between p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isVotingOpen ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                🗳️
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900 dark:text-white">Voting Status</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {isVotingOpen ? 'Open - Users can vote' : 'Closed - No voting allowed'}
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg text-sm font-bold ${isVotingOpen ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {isVotingOpen ? 'Open' : 'Closed'}
                        </div>
                    </button>

                    {/* Results Visibility Toggle */}
                    <button
                        onClick={async () => {
                            if (voting.status) {
                                await dispatch(toggleVotingStatus({
                                    resultsVisible: !voting.status.results_visible,
                                    updatedBy: currentUserId
                                })).unwrap();
                                await dispatch(fetchVotingStatus());
                            }
                        }}
                        className="group flex items-center justify-between p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${resultsVisible ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                👁️
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900 dark:text-white">Results Visibility</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {resultsVisible ? 'Visible - Everyone can see' : 'Hidden - Results kept private'}
                                </p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg text-sm font-bold ${resultsVisible ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {resultsVisible ? 'Visible' : 'Hidden'}
                        </div>
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700"></div>

            {/* Categories */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Award Categories</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{awards.categories.length} active categories</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                </div>

                {awards.categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {awards.categories.map((category: any) => (
                            <div key={category.id} className="group p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{category.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{category.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{category.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                        <Award size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400">No categories yet. Create one to get started!</p>
                    </div>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 dark:border-slate-700"></div>

            {/* Results Section - Collapsible */}
            <div className="space-y-4">
                <button
                    onClick={() => setShowResults(!showResults)}
                    className="w-full flex justify-between items-center group"
                >
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-left mb-1">Current Results</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Live vote tallies across all categories</p>
                    </div>
                    {showResults ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    )}
                </button>

                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {voting.results && Object.keys(voting.results).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(voting.results).map(([categoryId, result]: [string, any]) => (
                                        <div key={categoryId} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                                                <span className="text-2xl">{result.category_icon}</span>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{result.category_name}</h4>
                                            </div>

                                            {result.top_3.length > 0 ? (
                                                <div className="space-y-2">
                                                    {result.top_3.map((nominee: any, index: number) => (
                                                        <div
                                                            key={nominee.nominee_id}
                                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">
                                                                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                                </span>
                                                                <p className="font-medium text-slate-900 dark:text-white text-sm">{nominee.nominee_name}</p>
                                                            </div>
                                                            <p className="font-bold text-slate-600 dark:text-slate-400 text-sm">{nominee.vote_count}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-slate-400 text-sm py-4">No votes yet</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <Award size={40} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">No voting results available</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Create Category Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md pointer-events-auto"
                            >
                                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">New Award Category</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category Name</label>
                                        <input
                                            type="text"
                                            value={newCategory.name}
                                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                            placeholder="e.g., Best Team Player"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Icon</label>
                                        <div className="flex gap-2 flex-wrap mb-2">
                                            {commonEmojis.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => setNewCategory({ ...newCategory, icon: emoji })}
                                                    className={`text-2xl p-2 rounded-lg transition-all ${newCategory.icon === emoji
                                                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                                                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                        }`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            value={newCategory.icon}
                                            onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                            placeholder="Or enter custom emoji"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                        <textarea
                                            value={newCategory.description}
                                            onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none transition-all"
                                            rows={3}
                                            placeholder="Describe this award category..."
                                        />
                                    </div>

                                    <button
                                        onClick={handleCreateCategory}
                                        disabled={!newCategory.name || !newCategory.icon || !newCategory.description}
                                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Create Category
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
