import v2Client from './client';
import type {
    Event,
    EventCreate,
    EventUpdate,
    EventDetailResponse,
    EventListItem,
    ParticipantCreate,
    EventStatusUpdate,
    VoteCreate,
    VoteCount,
} from './types';

export const eventsAPI = {
    // Create event
    create: async (data: EventCreate): Promise<Event> => {
        const response = await v2Client.post('/events/', data);
        return response.data as Event;
    },

    // Get event with relations
    get: async (eventId: string): Promise<EventDetailResponse> => {
        const response = await v2Client.get(`/events/${eventId}`);
        return response.data as EventDetailResponse;
    },

    // Update event
    update: async (eventId: string, data: EventUpdate): Promise<Event> => {
        // Note: The backend endpoint for generic update isn't implemented in the snippet yet
        // but typically would be PUT /events/{id}
        const response = await v2Client.put(`/events/${eventId}`, data);
        return response.data as Event;
    },

    // List events with filters
    list: async (params?: {
        skip?: number;
        limit?: number;
        event_type?: string;
        status?: string;
        organizer_id?: string;
    }): Promise<EventListItem[]> => {
        const response = await v2Client.get('/events/', { params });
        return response.data as EventListItem[];
    },

    // Add participant
    addParticipant: async (
        eventId: string,
        data: ParticipantCreate
    ): Promise<any> => {
        const response = await v2Client.post(
            `/events/${eventId}/participants`,
            data
        );
        return response.data;
    },

    // Change status
    changeStatus: async (
        eventId: string,
        data: EventStatusUpdate
    ): Promise<Event> => {
        const response = await v2Client.patch(`/events/${eventId}/status`, data);
        return response.data as Event;
    },

    delete: async (eventId: string): Promise<void> => {
        await v2Client.delete(`/events/${eventId}`);
    },

    // Social
    like: async (eventId: string): Promise<boolean> => {
        const response = await v2Client.post<boolean>(`/events/${eventId}/like`);
        return response.data;
    },

    getLikes: async (eventId: string): Promise<any[]> => {
        const response = await v2Client.get<any[]>(`/events/${eventId}/likes`);
        return response.data;
    },

    addComment: async (eventId: string, content: string): Promise<any> => {
        const response = await v2Client.post<any>(`/events/${eventId}/comments`, { content });
        return response.data;
    },

    getComments: async (eventId: string): Promise<any[]> => {
        const response = await v2Client.get<any[]>(`/events/${eventId}/comments`);
        return response.data;
    },

    // Voting
    vote: async (eventId: string, data: VoteCreate): Promise<boolean> => {
        const response = await v2Client.post<boolean>(`/events/${eventId}/vote`, data);
        return response.data;
    },

    getVotes: async (eventId: string): Promise<VoteCount[]> => {
        const response = await v2Client.get<VoteCount[]>(`/events/${eventId}/votes`);
        return response.data;
    },
};
