import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState, AppDispatch } from '@/store';
import { fetchCurrentUser } from '@/store/userSlice';
import { NotificationCenter } from '../../modules/notifications/components/v2/NotificationCenter';
import { GlobalSearchBar } from '../../base/components/GlobalSearchBar';
import { ProfileSwitcher } from './ProfileSwitcher';
import {
    LayoutDashboard,
    Rocket,
    TestTube2,
    CheckSquare,
    Award,
    Calendar,
    Users,
    Settings,
    MessageSquare,
    Sparkles,
    Hammer
} from 'lucide-react';

const NavItem = ({ to, label, icon: Icon }: { to: string, label: string, icon: any }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');

    return (
        <Link
            to={to}
            className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive
                ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
        >
            <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium text-sm">{label}</span>
            {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            )}
        </Link>
    );
};

export function AppLayout() {
    const [isDark, setIsDark] = useState(false);
    const [activeSpace, setActiveSpace] = useState<'connect' | 'build'>('connect');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.user.data);
    const isAdmin = currentUser?.role?.toLowerCase().includes('admin');
    const location = useLocation();

    // Auto-switch space based on current route if user navigates directly
    useEffect(() => {
        const path = location.pathname;
        if (['/analytics', '/releases', '/testing', '/tasks'].some(r => path.startsWith(r))) {
            setActiveSpace('build');
        } else if (['/dashboard', '/events', '/recognition', '/teams'].some(r => path.startsWith(r))) {
            setActiveSpace('connect');
        }
        // Close mobile menu on route change
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleSpaceSwitch = (space: 'connect' | 'build') => {
        setActiveSpace(space);
        // Optional: Auto-redirect to default page of that space
        if (space === 'connect') navigate('/dashboard');
        if (space === 'build') navigate('/analytics');
    };

    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <div className="flex h-screen bg-[#f8f9fa] dark:bg-[#050507] text-slate-900 dark:text-white overflow-hidden transition-colors duration-500 font-sans">
            {/* Ambient Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20 animate-pulse-slow">
                <div className={`absolute transition-all duration-1000 ${activeSpace === 'connect' ? '-top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400' : '-top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500'} rounded-full blur-[120px]`} />
                <div className={`absolute transition-all duration-1000 ${activeSpace === 'connect' ? 'top-[40%] -right-[10%] w-[30%] h-[30%] bg-purple-400' : 'top-[40%] -right-[10%] w-[30%] h-[30%] bg-cyan-400'} rounded-full blur-[120px]`} />
                <div className={`absolute transition-all duration-1000 ${activeSpace === 'connect' ? '-bottom-[10%] left-[20%] w-[35%] h-[35%] bg-rose-400' : '-bottom-[10%] left-[20%] w-[35%] h-[35%] bg-emerald-400'} rounded-full blur-[120px]`} />
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Glass Sidebar - Mobile Recursive & Desktop Fixed */}
            <aside className={`
                fixed lg:relative z-40 w-72 h-screen flex flex-col 
                border-r border-white/40 dark:border-white/5 
                bg-white/60 dark:bg-black/40 backdrop-blur-xl
                transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand */}
                <div className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center text-white">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                            </div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                                Elevate
                            </h1>
                        </div>
                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    {/* Space Switcher */}
                    <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-xl flex relative">
                        {/* Animated Background Pill */}
                        <motion.div
                            layout
                            className="absolute top-1 bottom-1 bg-white dark:bg-slate-700 rounded-lg shadow-sm z-0"
                            initial={false}
                            animate={{
                                x: activeSpace === 'connect' ? 0 : '100%',
                                width: '50%'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />

                        <button
                            onClick={() => handleSpaceSwitch('connect')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg relative z-10 transition-colors ${activeSpace === 'connect' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            <Sparkles size={16} />
                            Community
                        </button>
                        <button
                            onClick={() => handleSpaceSwitch('build')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg relative z-10 transition-colors ${activeSpace === 'build' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            <Hammer size={16} />
                            Delivery
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide relative">
                    <AnimatePresence mode="wait">
                        {activeSpace === 'connect' ? (
                            <motion.div
                                key="connect"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-4 mt-2">
                                    Community Space
                                </div>
                                <NavItem to="/dashboard" label="Live Feed" icon={LayoutDashboard} />
                                <NavItem to="/events" label="Events" icon={Calendar} />
                                <NavItem to="/recognition" label="Recognition" icon={Award} />
                                <NavItem to="/teams" label="Teams" icon={Users} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="build"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-4 mt-2">
                                    Delivery Space
                                </div>
                                <NavItem to="/analytics" label="Execution Hub" icon={LayoutDashboard} />
                                <NavItem to="/releases" label="Release Tracker" icon={Rocket} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Common Links */}
                    <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/5">
                        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-4">
                            User Specific
                        </div>
                        <NavItem to="/feedback" label="My Feedback" icon={MessageSquare} />
                        {isAdmin && (
                            <NavItem to="/admin" label="Admin Console" icon={Settings} />
                        )}
                    </div>
                </div>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-white/40 dark:border-white/5 bg-white/40 dark:bg-white/5 space-y-2">
                    <ProfileSwitcher />
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                        <Link to="/profile" className="relative">
                            <img
                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser?.name || 'Viinu'}&backgroundColor=b6e3f4`}
                                alt="Profile"
                                className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-700"
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full shadow-sm"></div>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                {currentUser?.name || 'Guest User'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {currentUser?.role || 'View Profile'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 text-slate-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
                        >
                            {isDark ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" x2="12" y1="1" y2="3" /><line x1="12" x2="12" y1="21" y2="23" /><line x1="4.22" x2="5.64" y1="4.22" y2="5.64" /><line x1="18.36" x2="19.78" y1="18.36" y2="19.78" /><line x1="1" x2="3" y1="12" y2="12" /><line x1="21" x2="23" y1="12" y2="12" /><line x1="4.22" x2="5.64" y1="19.78" y2="18.36" /><line x1="18.36" x2="19.78" y1="5.64" y2="4.22" /></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="px-6 md:px-8 py-4 md:py-5 flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-white/10 rounded-lg"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>

                        {/* Dynamic Title based on Active Space */}
                        <h2 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                            {activeSpace === 'connect' ? 'Community & Culture' : 'Delivery & Execution'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* <GlobalSearchBar /> */}
                        {/* <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10" /> */}
                        {/* <NotificationCenter /> */}
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-hidden px-4 md:px-8 pb-4 md:pb-8">
                    <div className="w-full h-full rounded-[24px] md:rounded-[32px] bg-white/70 dark:bg-[#111114]/80 backdrop-blur-xl border border-white/50 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
                        {/* Optional: Add AnimatePresence here too if we want page transitions, but Outlet handles routing */}
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
