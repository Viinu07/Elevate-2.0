import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, type User } from '@/api/userService';
import { setUser } from '@/store/userSlice';
import type { RootState } from '@/store';

export const ProfileSwitcher = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state: RootState) => state.user.data);
    const [users, setUsers] = useState<User[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to load users for switcher:', error);
        }
    };

    const handleSwitch = async (user: User) => {
        try {
            const response = await userService.loginAs(user.id);
            localStorage.setItem('token', response.access_token);
            // Remove legacy ID if present
            localStorage.removeItem('currentUserId');

            // Dispatch and reload
            dispatch(setUser(user));
            setIsOpen(false);
            window.location.reload();
        } catch (error) {
            console.error('Login failed:', error);
            alert('Failed to switch user. See console.');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-xs font-medium text-slate-500 dark:text-slate-400 w-full justify-between group"
                title="Switch User (Testing)"
            >
                <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>Switch Profile</span>
                </div>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} opacity-0 group-hover:opacity-100`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-[#1A1D21] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden"
                        >
                            <div className="p-3 border-b border-slate-100 dark:border-white/5">
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Profile</h4>
                            </div>
                            <div className="max-h-60 overflow-y-auto p-1">
                                {users.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleSwitch(user)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${currentUser?.id === user.id
                                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        <img
                                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}&backgroundColor=b6e3f4`}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{user.name}</p>
                                            <p className="text-xs opacity-70 truncate">{user.role || 'Member'}</p>
                                        </div>
                                        {currentUser?.id === user.id && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
