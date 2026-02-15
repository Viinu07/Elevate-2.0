import { useState, useEffect } from 'react';
import { eventService, type Event } from '@/api/eventService';
import { Trash2, Clock, Video, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const data = await eventService.getEvents();
            setEvents(data);
        } catch (error) {
            console.error('Failed to load events:', error);
        }
    };

    const handleDeleteEvent = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent navigation when clicking delete
        if (!window.confirm("Are you sure you want to delete this event?")) return;

        try {
            await eventService.deleteEvent(id);
            await loadEvents();
        } catch (error) {
            console.error('Failed to delete event:', error);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.getDate().toString(),
            month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
            time: date.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        };
    };

    const getGradient = (index: number) => {
        const gradients = [
            'from-pink-500 to-rose-500',
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-indigo-500',
            'from-amber-400 to-orange-500'
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto w-full">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Events</h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">Join the conversation and learn something new.</p>
                </div>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <Calendar size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xl">No events yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event, index) => {
                        const { day, month, time } = formatDateTime(event.date_time);
                        return (
                            <div
                                key={event.id}
                                onClick={() => navigate(`/events/${event.id}`)}
                                className="group bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                {/* Image/Gradient Banner */}
                                <div className={`h-32 bg-gradient-to-r ${getGradient(index)} relative p-6`}>
                                    <button
                                        onClick={(e) => handleDeleteEvent(e, event.id)}
                                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-red-500/80 transition-all z-10"
                                        title="Delete event"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="p-6 relative">
                                    {/* Floating Date Badge */}
                                    <div className="absolute -top-10 left-6 bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-lg border border-slate-50 dark:border-slate-700 text-center min-w-[70px]">
                                        <div className="text-xs font-bold text-red-500 uppercase tracking-widest">{month}</div>
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{day}</div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{event.name}</h3>

                                        <div className="space-y-2 mt-4 text-sm text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} />
                                                {time}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                {event.organizer_name || 'Unknown'}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Video size={16} />
                                                Online Meeting
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(event.meeting_link, '_blank');
                                            }}
                                            className="w-full mt-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white transition-all shadow-lg shadow-blue-500/30 hover:scale-105"
                                        >
                                            Join Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
