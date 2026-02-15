import { useState } from 'react';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminTeams } from './components/AdminTeams';
import { AdminAwards } from './components/AdminAwards';

export default function AdminPage() {
    const [activeSection, setActiveSection] = useState<'dashboard' | 'teams' | 'awards'>('dashboard');

    return (
        <div className="h-full w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col p-4 overflow-hidden">

            {/* Main Content Card */}
            <div className="flex-1 bg-white/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-white/50 dark:border-white/5 shadow-xl backdrop-blur-sm overflow-hidden relative flex flex-col">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                {/* Header (only shown when not on dashboard) */}
                {activeSection !== 'dashboard' && (
                    <div className="flex items-center gap-4 p-8 pb-0 animate-in slide-in-from-top-4 duration-500 z-10">
                        <button
                            onClick={() => setActiveSection('dashboard')}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all font-bold shadow-sm hover:shadow-md"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </button>
                    </div>
                )}

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
                    {activeSection === 'dashboard' && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <AdminDashboard setActiveSection={setActiveSection} />
                        </div>
                    )}
                    {activeSection === 'teams' && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <AdminTeams />
                        </div>
                    )}
                    {activeSection === 'awards' && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <AdminAwards />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
