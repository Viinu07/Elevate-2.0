import { useState, useEffect } from 'react';
import {
    X,
    Calendar,
    MapPin,
    Clock,
    ChevronDown,
    Send,
    Globe,
    Sparkles,
    Users,
    Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusModal } from '@/modules/common/components/StatusModal';
import { eventsAPI } from '@/api/v2/events';
import { profilesAPI } from '@/api/v2/profiles';
import type { UserProfileFullResponse } from '@/api/v2/types';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateEventModal = ({ isOpen, onClose }: CreateEventModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

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
    const [users, setUsers] = useState<UserProfileFullResponse[]>([]);
    const [eventDetails, setEventDetails] = useState({
        name: '',
        type: 'Online',
        timezone: 'UTC',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        description: '',
        organizerId: '',
        hasAwards: false,
        votingRequired: false,
        awardCategories: ''
    });

    useEffect(() => {
        if (isOpen) {
            // Fetch users when modal opens
            profilesAPI.list().then(fetchedUsers => {
                setUsers(fetchedUsers);
                // Set current user as default organizer
                if (fetchedUsers.length > 0 && !eventDetails.organizerId) {
                    setEventDetails(prev => ({ ...prev, organizerId: fetchedUsers[0].user_id }));
                }
            }).catch(err => console.error('Failed to fetch users:', err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleEventChange = (field: string, value: any) => {
        setEventDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleCreateEvent = async () => {
        setIsSubmitting(true);
        try {
            const startDateTime = eventDetails.startDate && eventDetails.startTime
                ? new Date(`${eventDetails.startDate}T${eventDetails.startTime}`).toISOString()
                : new Date().toISOString();

            const endDateTime = eventDetails.endDate && eventDetails.endTime
                ? new Date(`${eventDetails.endDate}T${eventDetails.endTime}`).toISOString()
                : undefined;

            await eventsAPI.create({
                name: eventDetails.name,
                event_type: eventDetails.type,
                date_time: startDateTime,
                end_time: endDateTime,
                timezone: eventDetails.timezone,
                meeting_link: eventDetails.location,
                agenda: eventDetails.description,
                organizer_id: eventDetails.organizerId, // Send selected organizer
                has_awards: eventDetails.hasAwards,
                voting_required: eventDetails.votingRequired,
                award_categories: eventDetails.awardCategories
            });
            onClose();
        } catch (error) {
            console.error("Failed to create event:", error);
            setStatusModal({
                isOpen: true,
                type: 'error',
                title: 'Creation Failed',
                message: 'Failed to create event. Please check the console for details.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-[#111114] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col my-auto max-h-[80vh]"
                >
                    {/* Header with Gradient */}
                    <div className="relative px-6 py-5 border-b border-slate-200 dark:border-white/10 shrink-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl shadow-lg shadow-amber-500/30">
                                    <Calendar size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Event</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Schedule and organize your team</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
                        <div className="space-y-5">
                            {/* Event Type & Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ModernSelect
                                    label="Event Type"
                                    options={['Online', 'In Person']}
                                    value={eventDetails.type}
                                    onChange={(e: any) => handleEventChange('type', e.target.value)}
                                    icon={Sparkles}
                                />
                                <ModernInput
                                    label="Event Name"
                                    placeholder="e.g., Q2 Hackathon"
                                    value={eventDetails.name}
                                    onChange={(e: any) => handleEventChange('name', e.target.value)}
                                    icon={Calendar}
                                />
                            </div>

                            {/* Timezone & Location */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ModernSelect
                                    label="Timezone"
                                    options={['UTC', 'EST', 'PST', 'IST', 'GMT']}
                                    value={eventDetails.timezone}
                                    onChange={(e: any) => handleEventChange('timezone', e.target.value)}
                                    icon={Globe}
                                />
                                <ModernInput
                                    label="Location / Link"
                                    placeholder={eventDetails.type === 'Online' ? 'Zoom Link' : 'Conference Room'}
                                    value={eventDetails.location}
                                    onChange={(e: any) => handleEventChange('location', e.target.value)}
                                    icon={MapPin}
                                />
                            </div>

                            {/* Date & Time Section */}
                            <div className="relative p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
                                <div className="absolute top-3 right-3">
                                    <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-md">
                                        Schedule
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <DateInput
                                            label="Start Date"
                                            value={eventDetails.startDate}
                                            onChange={(e: any) => handleEventChange('startDate', e.target.value)}
                                        />
                                        <TimeInput
                                            label="Start Time"
                                            value={eventDetails.startTime}
                                            onChange={(e: any) => handleEventChange('startTime', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DateInput
                                            label="End Date"
                                            value={eventDetails.endDate}
                                            onChange={(e: any) => handleEventChange('endDate', e.target.value)}
                                        />
                                        <TimeInput
                                            label="End Time"
                                            value={eventDetails.endTime}
                                            onChange={(e: any) => handleEventChange('endTime', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                                    Agenda & Details
                                </label>
                                <textarea
                                    className="w-full bg-white dark:bg-slate-900/50 rounded-xl p-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border border-slate-200 dark:border-slate-700 resize-none min-h-[100px] transition-all shadow-sm"
                                    placeholder="What's this event about? Share the agenda, goals, or any important details..."
                                    value={eventDetails.description}
                                    onChange={(e) => handleEventChange('description', e.target.value)}
                                />
                            </div>



                            {/* Awards Section */}
                            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg">
                                            <Trophy size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Event Awards</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Recognize participants with awards</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={eventDetails.hasAwards}
                                            onChange={(e) => handleEventChange('hasAwards', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                                    </label>
                                </div>

                                {eventDetails.hasAwards && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden space-y-4"
                                    >
                                        <div className="pt-2">
                                            <ModernInput
                                                label="Award Categories"
                                                placeholder="Use commas to separate (e.g. Best Speaker, Most Helpful)"
                                                value={eventDetails.awardCategories}
                                                onChange={(e: any) => handleEventChange('awardCategories', e.target.value)}
                                                icon={Trophy}
                                            />
                                            <p className="text-xs text-slate-500 mt-2 ml-1">
                                                Separated by commas. These will be available options when granting awards.
                                            </p>
                                        </div>

                                        {/* Voting Required Toggle */}
                                        <div className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Require Voting?</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Open a poll for attendees to vote</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={eventDetails.votingRequired}
                                                    onChange={(e) => handleEventChange('votingRequired', e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                                            </label>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Organizer Selection */}
                            <ModernSelect
                                label="Event Organizer"
                                options={users.map(u => ({ value: u.user_id, label: u.name }))}
                                value={eventDetails.organizerId}
                                onChange={(e: any) => handleEventChange('organizerId', e.target.value)}
                                icon={Users}
                                isUserSelect
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Clock size={14} className="text-blue-500" />
                            <span>Invites will be sent to team</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateEvent}
                                disabled={isSubmitting}
                                className={`px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Create Event
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                <StatusModal
                    isOpen={statusModal.isOpen}
                    onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
                    type={statusModal.type}
                    title={statusModal.title}
                    message={statusModal.message}
                />
            </div >
        </AnimatePresence >
    );
};

const ModernInput = ({ label, placeholder, icon: Icon, value, onChange }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            {label}
        </label>
        <div className="relative group">
            <input
                type="text"
                className="w-full bg-white dark:bg-slate-900/50 rounded-xl px-4 py-3 pl-11 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border border-slate-200 dark:border-slate-700 transition-all shadow-sm hover:shadow-md"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
            <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                {Icon && <Icon size={18} />}
            </div>
        </div>
    </div>
);

const ModernSelect = ({ label, options, value, onChange, icon: Icon, isUserSelect }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            {label}
        </label>
        <div className="relative group">
            <select
                value={value}
                onChange={onChange}
                className="w-full bg-white dark:bg-slate-900/50 rounded-xl px-4 py-3 pl-11 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 border border-slate-200 dark:border-slate-700 appearance-none cursor-pointer transition-all shadow-sm hover:shadow-md"
            >
                {isUserSelect && !value && <option value="">Select organizer...</option>}
                {options.map((opt: any) => {
                    const optValue = typeof opt === 'string' ? opt : opt.value;
                    const optLabel = typeof opt === 'string' ? opt : opt.label;
                    return <option key={optValue} value={optValue}>{optLabel}</option>;
                })}
            </select>
            <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                {Icon && <Icon size={18} />}
            </div>
            <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
        </div>
    </div>
);

const DateInput = ({ label, value, onChange }: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{label}</label>
        <div className="relative">
            <input
                type="date"
                className="w-full bg-white dark:bg-slate-800/50 rounded-lg px-3 py-2.5 pl-9 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-300 dark:border-slate-600 transition-all"
                value={value}
                onChange={onChange}
            />
            <Calendar className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
        </div>
    </div>
);

const TimeInput = ({ label, value, onChange }: any) => (
    <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{label}</label>
        <div className="relative">
            <input
                type="time"
                className="w-full bg-white dark:bg-slate-800/50 rounded-lg px-3 py-2.5 pl-9 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 border border-slate-300 dark:border-slate-600 transition-all"
                value={value}
                onChange={onChange}
            />
            <Clock className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
        </div>
    </div>
);
