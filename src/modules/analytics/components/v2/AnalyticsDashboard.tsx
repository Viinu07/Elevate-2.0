import React, { useEffect, useState } from 'react';
import { releaseService, type ReleaseWorkItem } from '../../../../api/releaseService';
import { analyticsAPI } from '../../../../api/v2/analytics';

import type { DashboardMetrics } from '../../../../api/v2/types';
import { ChevronLeft, ChevronRight, Rocket, Calendar as CalendarIcon, FileText, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


export const AnalyticsDashboard: React.FC = () => {

    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [workItems, setWorkItems] = useState<ReleaseWorkItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [currentPulseIndex, setCurrentPulseIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Removed velocity metrics fetch as it's no longer needed
                const [metricsData, workItemsData] = await Promise.all([
                    analyticsAPI.getDashboardMetrics(),
                    releaseService.getAll()
                ]);
                setMetrics(metricsData);
                setWorkItems(workItemsData);
            } catch (err) {
                console.error('Failed to load analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const monthDays = getDaysInMonth(currentDate);

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };



    // Filter Work Items for the *selected* date (Memo view)
    const getWorkItemsForDay = (date: Date) => {
        return workItems.filter(item => {
            // Check Target Release Date (Planner)
            if (item.release_date) {
                // item.release_date is YYYY-MM-DD string
                const [y, m, d] = item.release_date.split('-').map(Number);
                // Note: Month in Date constructor is 0-indexed
                const itemDate = new Date(y, m - 1, d);
                if (isSameDay(date, itemDate)) return true;
            }

            // Check Testing Gate Dates (optional, if we want to show testing activities)
            // For now, focusing on the main "Target Release Date"
            return false;
        });
    };

    const selectedWorkItems = getWorkItemsForDay(selectedDate);

    // Combine for Calendar Dots
    const hasActivity = (date: Date) => {
        return getWorkItemsForDay(date).length > 0;
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!metrics) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

    const MetricCard = ({ title, value, subtext, color = "blue", icon: Icon }: any) => (
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`h-12 w-12 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>
                            {Icon ? <Icon size={24} /> : <span className="text-xl font-bold">{title.charAt(0)}</span>}
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</dt>
                            <dd>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-t border-slate-100 dark:border-slate-700/50">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {subtext}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Execution Hub</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Track releases and daily execution plans.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <MetricCard
                    title="Active Releases"
                    value={workItems.filter(i => !i.is_completed).length}
                    subtext="Currently in pipeline"
                    color="indigo"
                    icon={Rocket}
                />
                <MetricCard
                    title="Completed Releases"
                    value={workItems.filter(i => i.is_completed).length}
                    subtext="Successfully shipped"
                    color="emerald"
                    icon={CheckCircle2}
                />

                {/* Weekly Focus Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20 col-span-1 sm:col-span-2">
                    <h3 className="font-bold text-lg mb-1">Weekly Focus</h3>
                    {(() => {
                        const today = new Date();
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay());
                        startOfWeek.setHours(0, 0, 0, 0);

                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6);
                        endOfWeek.setHours(23, 59, 59, 999);

                        const weeklyItems = workItems.filter(item => {
                            if (!item.release_date) return false;
                            const [y, m, d] = item.release_date.split('-').map(Number);
                            const date = new Date(y, m - 1, d);
                            return date >= startOfWeek && date <= endOfWeek;
                        });

                        const weeklyTotal = weeklyItems.length;
                        const weeklyCompleted = weeklyItems.filter(i => i.is_completed).length;
                        const percentage = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

                        return (
                            <>
                                <p className="text-white/80 text-sm mb-4">
                                    {weeklyTotal} releases planned for this week.
                                </p>
                                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Completion</span>
                                        <span className="font-bold">{percentage}%</span>
                                    </div>
                                    <div className="w-full bg-black/20 rounded-full h-1.5">
                                        <div
                                            className="bg-white h-1.5 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="mt-2 text-xs text-white/60 flex justify-between">
                                        <span>{weeklyCompleted} completed</span>
                                        <span>{weeklyTotal - weeklyCompleted} remaining</span>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Main Content: Daily Memo */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    {/* Daily Memo */}
                    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-3xl border border-slate-100 dark:border-slate-700/50 flex-1 flex flex-col overflow-hidden relative min-h-[500px]">
                        {/* Memo Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-700/50 bg-yellow-50/50 dark:bg-yellow-900/10 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 font-serif">
                                    <FileText className="text-yellow-600 dark:text-yellow-500" />
                                    Daily Memo
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 font-serif italic">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500">
                                {selectedWorkItems.length} Item{selectedWorkItems.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        {/* Memo Lines Background */}
                        <div className="absolute inset-0 top-[100px] pointer-events-none opacity-5"
                            style={{
                                backgroundImage: 'linear-gradient(transparent 23px, #94a3b8 24px)',
                                backgroundSize: '100% 24px'
                            }}
                        ></div>

                        {/* Work Item List */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-4 relative z-10">
                            {selectedWorkItems.length > 0 ? (
                                selectedWorkItems.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="group bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Team Avatar/Icon */}
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm
                                                ${item.team_name === 'Olympus' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    item.team_name === 'App Builder' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                        item.team_name === 'Seeing Eye' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                            'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}
                                            `}>
                                                {item.team_name ? item.team_name.substring(0, 1).toUpperCase() : '?'}
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                                        {item.team_name}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-md border ${item.release_version?.includes('beta') ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30' :
                                                        'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                                                        }`}>
                                                        {item.release_version}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status / Completion */}
                                        <div className="text-slate-300">
                                            {item.is_completed ? (
                                                <CheckCircle2 className="text-green-500 w-6 h-6" />
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <CalendarIcon size={32} />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">No items planned</h3>
                                    <p className="text-slate-500 dark:text-slate-400">No work items scheduled for this day.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Calendar & Smart Schedule */}
                <div className="flex flex-col gap-6 overflow-y-auto">
                    {/* Calendar */}
                    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-3xl border border-slate-100 dark:border-slate-700/50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 dark:text-white">Calendar</h3>
                            <div className="flex gap-1">
                                <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="text-center font-bold text-sm mb-4">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                <div key={index} className="text-[10px] font-bold text-slate-400 uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {monthDays.map((day, index) => {
                                if (!day) return <div key={`empty-${index}`} />;

                                const isSelected = isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, new Date());
                                const hasEvents = hasActivity(day);

                                return (
                                    <button
                                        key={day.toISOString()}
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                                            aspect-square rounded-full flex items-center justify-center text-xs font-medium relative transition-all
                                            ${isSelected
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                                                : isToday
                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                            }
                                        `}
                                    >
                                        {day.getDate()}
                                        {hasEvents && !isSelected && (
                                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Smart Weekly Dashboard (Compact - Carousel) */}
                    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-3xl border border-slate-100 dark:border-slate-700/50 p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            This Week's Pulse
                        </h3>

                        <div className="flex-1 relative">
                            {(() => {
                                const today = new Date();
                                const startOfWeek = new Date(today);
                                startOfWeek.setDate(today.getDate() - today.getDay());
                                startOfWeek.setHours(0, 0, 0, 0);

                                const endOfWeek = new Date(startOfWeek);
                                endOfWeek.setDate(startOfWeek.getDate() + 6);
                                endOfWeek.setHours(23, 59, 59, 999);

                                const weeklyItems = workItems.filter(item => {
                                    if (!item.release_date) return false;
                                    const [y, m, d] = item.release_date.split('-').map(Number);
                                    const date = new Date(y, m - 1, d);
                                    return date >= startOfWeek && date <= endOfWeek;
                                });

                                if (weeklyItems.length === 0) {
                                    return (
                                        <div className="text-center py-10 text-xs text-slate-400">
                                            No releases this week.
                                        </div>
                                    );
                                }

                                const teams = Array.from(new Set(weeklyItems.map(i => i.team_name))).sort();

                                // Ensure index is safe
                                const safeIndex = currentPulseIndex % teams.length;
                                const currentTeam = teams[safeIndex];
                                const teamItems = weeklyItems.filter(i => i.team_name === currentTeam);

                                return (
                                    <div className="flex flex-col h-full">
                                        {/* Slide Content */}
                                        <div className="flex-1 min-h-[150px]">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
                                                {currentTeam}
                                            </div>
                                            <div className="space-y-3">
                                                {teamItems.map(item => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => setSelectedItem(item)}
                                                        className="flex items-center justify-between group cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-3">
                                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 transition-colors">
                                                                {item.title}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                                {item.release_version}
                                                            </div>
                                                        </div>
                                                        {item.is_completed ? (
                                                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                                                        ) : (
                                                            <div className="w-3 h-3 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Dotted Pagination */}
                                        <div className="flex justify-center gap-2 mt-4 pt-2">
                                            {teams.map((team, index) => (
                                                <button
                                                    key={team}
                                                    onClick={() => setCurrentPulseIndex(index)}
                                                    className={`transition-all duration-300 rounded-full ${index === safeIndex
                                                        ? 'w-6 h-2 bg-blue-500'
                                                        : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                                                        }`}
                                                    aria-label={`Go to ${team}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
            {/* Work Item Details Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                            onClick={() => setSelectedItem(null)}
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-2xl border border-slate-100 dark:border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${selectedItem.team_name === 'Olympus' ? 'bg-purple-100 text-purple-700' :
                                                selectedItem.team_name === 'App Builder' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {selectedItem.team_name}
                                            </span>
                                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
                                            <span className="text-sm font-mono text-slate-500">{selectedItem.release_version}</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                            {selectedItem.title}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6 text-slate-400" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* POC & Description */}
                                    <div className="space-y-6">
                                        {selectedItem.poc_name && (
                                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold">
                                                    {selectedItem.poc_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Point of Contact</div>
                                                    <div className="font-medium text-slate-900 dark:text-white">{selectedItem.poc_name}</div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedItem.description && (
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                    {selectedItem.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Gates Grid */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quality Gates</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <GateStatusDisplay label="Unit Testing" checked={selectedItem.unit_testing_checked} date={selectedItem.unit_testing_date} />
                                            <GateStatusDisplay label="System Testing" checked={selectedItem.system_testing_checked} date={selectedItem.system_testing_date} />
                                            <GateStatusDisplay label="Integration" checked={selectedItem.int_testing_checked} date={selectedItem.int_testing_date} />
                                        </div>
                                    </div>

                                    {/* Compliance */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Compliance & Ops</h4>
                                        <div className="flex flex-wrap gap-3">
                                            <ComplianceBadge label="PVS Testing" active={selectedItem.pvs_testing} value={selectedItem.pvs_intake_number} />
                                            <ComplianceBadge label="Warranty Call" active={selectedItem.warranty_call_needed} />
                                            <ComplianceBadge label="Docs Updated" active={selectedItem.confluence_updated} />
                                            <ComplianceBadge label="CSCA Intake" active={selectedItem.csca_intake === 'Yes'} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence >
        </div >
    );
};

// Helper Components for Modal
const GateStatusDisplay = ({ label, checked, date }: { label: string, checked: boolean, date: string | null }) => (
    <div className={`p-4 rounded-xl border ${checked ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
        <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-bold ${checked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>{label}</span>
            {checked ? (
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-1 rounded-full">
                    <CheckCircle2 size={14} />
                </div>
            ) : (
                <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-600" />
            )}
        </div>
        <div className="text-xs font-mono text-slate-400">
            {checked && date ? date : '--/--/----'}
        </div>
    </div>
);

const ComplianceBadge = ({ label, active, value }: { label: string, active: boolean, value?: string | null }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold ${active
        ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-400'
        : 'bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700'
        }`}>
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-blue-500' : 'bg-slate-300'}`} />
        <span>{label}</span>
        {value && <span className="ml-1 px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-blue-200 dark:border-blue-800">{value}</span>}
    </div>
);
