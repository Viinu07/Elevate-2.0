import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../../../api/v2/events';
import type { EventDetailResponse } from '../../../../api/v2/types';
import { EventStatus } from '../../../../api/v2/types';
import { StatusBadge } from '../../../../shared/components/v2/StatusBadge';
import { ParticipantList } from './ParticipantList';
import { LinkedReleasesList } from './LinkedReleasesList';

export const EventDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            if (!id) return;
            try {
                const data = await eventsAPI.get(id);
                setEvent(data);
            } catch (err) {
                setError('Failed to load event details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading event details...</div>;
    if (error || !event) return <div className="p-8 text-center text-red-500">{error || 'Event not found'}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    ← Back to Events
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.name}</h1>
                        <div className="flex items-center space-x-4">
                            <StatusBadge status={event.status} />
                            <span className="text-gray-500">
                                {new Date(event.date_time).toLocaleString()}
                            </span>
                            {event.event_type && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
                                    {event.event_type}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        {/* Actions would go here */}
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Details Card */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Organizer</label>
                                <div className="mt-1 flex items-center">
                                    <span className="text-gray-900">{event.organizer_name}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Meeting Link</label>
                                <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 block">
                                    {event.meeting_link}
                                </a>
                            </div>
                            {event.agenda && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Agenda</label>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{event.agenda}</p>
                                </div>
                            )}
                            {event.expectations && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Expectations</label>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{event.expectations}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes (if completed) */}
                    {event.notes && (
                        <div className="bg-white shadow rounded-lg p-6 border-l-4 border-yellow-400">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Notes</h3>
                            <p className="text-gray-900 whitespace-pre-wrap">{event.notes}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <ParticipantList
                        participants={event.participants}
                        onAddParticipant={() => console.log('Add participant clicked')}
                    />

                    <LinkedReleasesList
                        releases={[]} // Placeholder for now
                        onLinkRelease={() => console.log('Link release clicked')}
                    />
                </div>
            </div>
        </div>
    );
};
