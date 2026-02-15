import { useState, useEffect } from 'react';
import { releaseService, type ReleaseWorkItem } from '../../api/releaseService';
import { userService, type User } from '../../api/userService';
import { StatusModal } from '@/modules/common/components/StatusModal';


import { Calendar, CheckCircle2 } from 'lucide-react';

// --- Types ---
interface TestingGate {
    checked: boolean;
    date: string;
}

interface WorkItem {
    id: number;
    title: string;
    team: string; // UI uses 'team', backend uses 'team_name'
    release: string; // UI uses 'release', backend uses 'release_version'
    unitTesting: TestingGate;
    systemTesting: TestingGate;
    intTesting: TestingGate;
    pvsTesting: boolean;
    pvsIntakeNumber: string;
    warrantyCallNeeded: boolean;
    confluenceUpdated: boolean;
    cscaIntake: 'Yes' | 'No';
    // New Fields
    description: string;
    pocId: string | null;
    pocName?: string;
    isCompleted: boolean;
    releaseDate: string;
}

// --- Data Mappers ---
const mapApiToUi = (item: ReleaseWorkItem): WorkItem => ({
    id: item.id,
    title: item.title,
    team: item.team_name,
    release: item.release_version,
    unitTesting: { checked: item.unit_testing_checked, date: item.unit_testing_date || '' },
    systemTesting: { checked: item.system_testing_checked, date: item.system_testing_date || '' },
    intTesting: { checked: item.int_testing_checked, date: item.int_testing_date || '' },
    pvsTesting: item.pvs_testing,
    pvsIntakeNumber: item.pvs_intake_number || '',
    warrantyCallNeeded: item.warranty_call_needed,
    confluenceUpdated: item.confluence_updated,
    cscaIntake: item.csca_intake as 'Yes' | 'No',
    description: item.description || '',
    pocId: item.poc_id,
    pocName: item.poc_name,
    isCompleted: item.is_completed,
    releaseDate: item.release_date || ''
});



// --- Mock Data Constants (Available for dropdowns) ---
const TEAMS = ['Olympus', 'App Builder', 'Seeing Eye', 'Data Movers', 'Interstellars', 'Skynet'];
// const RELEASES = ['v2.4.0', 'v2.5.0-beta', 'v3.0.0']; // REMOVED: Now fetching from API

export default function ReleasesPage() {
    const [view, setView] = useState<'tracker' | 'planner'>('tracker');
    const [workItems, setWorkItems] = useState<WorkItem[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Status Modal State
    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    // Form State
    const [formData, setFormData] = useState<Partial<ReleaseWorkItem>>({
        team_name: TEAMS[0],
        release_version: '',
        description: '',
        poc_id: '',
        // Testing Gates
        unit_testing_checked: false,
        unit_testing_date: null,
        system_testing_checked: false,
        system_testing_date: null,
        int_testing_checked: false,
        int_testing_date: null,
        // Compliance
        pvs_testing: false,
        pvs_intake_number: '',
        warranty_call_needed: false,
        confluence_updated: false,
        csca_intake: 'No',
        is_completed: false,
        release_date: ''
    });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setIsLoading(true);
            const [workItemsData, usersData] = await Promise.all([
                releaseService.getAll(),
                userService.getUsers()
            ]);
            setWorkItems(workItemsData.map(mapApiToUi));
            setUsers(usersData);
        } catch (error) {
            console.error('Failed to load releases:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleCompletion = async (id: number, currentStatus: boolean) => {
        try {
            const newIsCompleted = !currentStatus;
            const newStatus = newIsCompleted ? 'Completed' : 'Proposed';

            // Optimistic Update
            setWorkItems(prev => prev.map(item =>
                item.id === id ? { ...item, isCompleted: newIsCompleted, status: newStatus } : item
            ));

            await releaseService.update(id, {
                is_completed: newIsCompleted,
                status: newStatus
            });
        } catch (error) {
            console.error('Failed to update completion status:', error);
            // Revert on error
            setWorkItems(prev => prev.map(item =>
                item.id === id ? { ...item, isCompleted: currentStatus, status: currentStatus ? 'Completed' : 'Proposed' } : item
            ));
        }
    };

    if (isLoading && workItems.length === 0) {
        return <div className="p-8 flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>;
    }

    const handleCreateItem = async () => {
        if (!formData.title) {
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Missing Information',
                message: 'Please enter a title for the work item.'
            });
            return;
        }

        try {
            const tempId = Date.now(); // Generate ID for API if needed, or backend ignores it

            // Construct payload directly from formData which matches ReleaseWorkItem structure
            const apiPayload: any = {
                ...formData,
                id: tempId,
                title: formData.title || 'Untitled Work Item',
                // Ensure defaults for required fields if missing
                team_name: formData.team_name || TEAMS[0],
                release_version: formData.release_version || '',
                description: formData.description || '',
                poc_id: formData.poc_id || null,
                is_completed: false,
                release_date: formData.release_date || null
            };

            await releaseService.create(apiPayload);

            // Refresh list
            await loadItems();

            setView('tracker');
            // Reset form (optional, keeping some defaults)
            setFormData({
                ...formData,
                title: '',
                unit_testing_checked: false,
                unit_testing_date: null,
                system_testing_checked: false,
                system_testing_date: null,
                int_testing_checked: false,
                int_testing_date: null,
                pvs_testing: false,
                pvs_intake_number: '',
                warranty_call_needed: false,
                confluence_updated: false,
                csca_intake: 'No',
                is_completed: false,
                release_date: ''
            });
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'Success!',
                message: 'Work item has been successfully created and added to the tracker.'
            });
        } catch (error) {
            console.error('Failed to create work item:', error);
        }
    };





    return (
        <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto w-full">
            <div className="flex justify-between items-end mb-6 md:mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Releases</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">Manage release cycles and work items.</p>
                </div>

                {/* Removed New Release button as per instruction */}
            </div>

            {/* View Toggles */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                    onClick={() => setView('tracker')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'tracker' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Tracker
                </button>
                <button
                    onClick={() => setView('planner')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'planner' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Planner
                </button>
            </div>

            {/* --- PLANNER VIEW --- */}
            {
                view === 'planner' && (
                    <div className="max-w-4xl mx-auto w-full bg-white dark:bg-slate-800 rounded-[40px] p-10 border border-slate-100 dark:border-slate-700 shadow-xl">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </span>
                            New Work Item
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Features & Deployment</label>

                                <input
                                    type="text"
                                    placeholder="Work Item Title"
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        value={formData.team_name}
                                        onChange={e => setFormData({ ...formData, team_name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    >
                                        {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Release Version (e.g. v2.4.0)"
                                        value={formData.release_version}
                                        onChange={e => setFormData({ ...formData, release_version: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    />
                                </div>

                                {/* POC Dropdown */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Point of Contact</label>
                                    <select
                                        value={formData.poc_id || ''}
                                        onChange={e => setFormData({ ...formData, poc_id: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    >
                                        <option value="">Select POC</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description Input */}
                                <textarea
                                    placeholder="Description / Details"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white h-24 resize-none"
                                />

                                {/* Release Date Input */}
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Target Release Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={formData.release_date || ''}
                                            onChange={e => setFormData({ ...formData, release_date: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white pl-10"
                                        />
                                        <Calendar className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Compliance & Ops</label>

                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-slate-600 dark:text-slate-400 font-medium">PVS Testing Intake</label>
                                        <input
                                            type="checkbox"
                                            checked={formData.pvs_testing}
                                            onChange={e => setFormData({ ...formData, pvs_testing: e.target.checked })}
                                            className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    {formData.pvs_testing && (
                                        <input
                                            type="text"
                                            placeholder="PVS Intake #"
                                            value={formData.pvs_intake_number || ''}
                                            onChange={e => setFormData({ ...formData, pvs_intake_number: e.target.value })}
                                            className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none dark:text-white"
                                        />
                                    )}
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">CSCA / PVS Intake</span>
                                        <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-0.5">
                                            {['Yes', 'No'].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setFormData({ ...formData, csca_intake: opt as 'Yes' | 'No' })}
                                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.csca_intake === opt ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="my-8">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">Quality Gates</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { key: 'unit_testing', label: 'Unit Testing' },
                                    { key: 'system_testing', label: 'System Testing' },
                                    { key: 'int_testing', label: 'Int Testing' }
                                ].map((gate) => {
                                    const checkedKey = `${gate.key}_checked` as keyof ReleaseWorkItem;
                                    const dateKey = `${gate.key}_date` as keyof ReleaseWorkItem;

                                    return (
                                        <div key={gate.key} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="font-bold text-slate-700 dark:text-slate-200">{gate.label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={formData[checkedKey] as boolean || false}
                                                    onChange={e => setFormData(prev => ({
                                                        ...prev,
                                                        [checkedKey]: e.target.checked
                                                    }))}
                                                    className="w-6 h-6 rounded-md text-emerald-500 focus:ring-emerald-500 border-slate-300"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Code Drop Date</label>
                                                <input
                                                    type="date"
                                                    value={formData[dateKey] as string || ''}
                                                    onChange={e => setFormData(prev => ({
                                                        ...prev,
                                                        [dateKey]: e.target.value || null
                                                    }))}
                                                    disabled={!(formData[checkedKey] as boolean)}
                                                    className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm outline-none dark:text-white transition-opacity ${!(formData[checkedKey] as boolean) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-8 py-4 border-t border-b border-slate-100 dark:border-slate-800">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.warranty_call_needed}
                                    onChange={e => setFormData({ ...formData, warranty_call_needed: e.target.checked })}
                                    className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500"
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-300">Warranty Call Needed</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.confluence_updated}
                                    onChange={e => setFormData({ ...formData, confluence_updated: e.target.checked })}
                                    className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                                />
                                <span className="font-medium text-slate-700 dark:text-slate-300">Confluence Page Updated</span>
                            </label>
                        </div>

                        <button
                            onClick={handleCreateItem}
                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all"
                        >
                            Create Work Item
                        </button>
                    </div>
                )
            }

            {/* --- TRACKER VIEW --- */}
            {
                view === 'tracker' && (
                    <div className="space-y-12">
                        {/* Filter Controls could go here in future */}

                        {TEAMS.map(team => {
                            const teamItems = workItems.filter(i => i.team === team);
                            if (teamItems.length === 0) return null;

                            return (
                                <div key={team} className="relative">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400">
                                            {team[0]}
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{team}</h2>
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                                    </div>

                                    <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-hide snap-x snap-mandatory">
                                        {teamItems.map(item => (
                                            <div key={item.id} className={`min-w-[350px] max-w-[350px] snap-center bg-white dark:bg-slate-800 p-6 rounded-3xl border shadow-sm hover:shadow-lg transition-all group relative overflow-hidden flex flex-col justify-between ${item.isCompleted ? 'border-green-200 dark:border-green-900/30 opacity-75' : 'border-slate-100 dark:border-slate-700/50'}`}>

                                                {/* Top Section */}
                                                <div>
                                                    {/* Completion Checkmark */}
                                                    <button
                                                        onClick={() => handleToggleCompletion(item.id, item.isCompleted)}
                                                        className={`absolute top-6 right-6 p-2 rounded-full transition-all ${item.isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-50 text-slate-300 dark:bg-slate-700/50 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                        title={item.isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                                                    >
                                                        <CheckCircle2 className="w-6 h-6" strokeWidth={item.isCompleted ? 3 : 2} />
                                                    </button>

                                                    <div className="flex justify-between items-start mb-4 pr-12">
                                                        <div className="flex flex-col gap-2">
                                                            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider w-fit ${item.release.includes('beta') ? 'bg-amber-100 text-amber-700' :
                                                                item.release.includes('v3') ? 'bg-purple-100 text-purple-700' :
                                                                    'bg-emerald-100 text-emerald-700'
                                                                }`}>
                                                                {item.release}
                                                            </span>
                                                            {/* Prominent Release Date */}
                                                            {item.releaseDate && (
                                                                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-md w-fit">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    <span className="text-xs">Target: {item.releaseDate}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <h3 className={`font-bold text-lg mb-6 transition-colors ${item.isCompleted ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                                                        {item.title}
                                                    </h3>
                                                </div>

                                                {/* Bottom Section */}
                                                <div>
                                                    <div className="space-y-3 mb-6">
                                                        <GateStatus label="Unit" gate={item.unitTesting} />
                                                        <GateStatus label="System" gate={item.systemTesting} />
                                                        <GateStatus label="Integration" gate={item.intTesting} />
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                                        {item.pvsTesting && <span className="text-[10px] font-mono text-slate-400 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded-md">PVS: {item.pvsIntakeNumber}</span>}
                                                        {item.warrantyCallNeeded && <span className="text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded font-bold border border-amber-100 dark:border-amber-900/30">Warranty</span>}
                                                        {item.confluenceUpdated && <span className="text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded font-bold border border-blue-100 dark:border-blue-900/30">Docs Updated</span>}
                                                        <span className={`text-[10px] px-2 py-1 rounded font-bold border ${item.cscaIntake === 'Yes' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>CSCA: {item.cscaIntake}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            }
            {/* Status Modal */}
            <StatusModal
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
            />


        </div >
    );
}

const GateStatus = ({ label, gate }: { label: string, gate: TestingGate }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-slate-500 dark:text-slate-400">{label} Check</span>
        <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${gate.checked ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>
                {gate.checked ? gate.date : '--/--'}
            </span>
            {gate.checked ? (
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
            ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-600"></div>
            )}
        </div>
    </div>
);
