
import { api } from './fetchClient';

export interface Event {
    id: string;
    name: string;
    date_time: string;
    meeting_link: string;
    organizer_id: string;
    organizer_name?: string;
    created_at: string;
}

export const eventService = {
    getEvents: () => api.get<Event[]>('/events/'),
    createEvent: (event: Omit<Event, 'id' | 'created_at' | 'organizer_name'>) =>
        api.post<Event>('/events/', event),
    deleteEvent: (id: string) => api.delete<Event>(`/events/${id}`)
};
