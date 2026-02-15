import v2Client from './client';
import type { NotificationResponse, NotificationPreferenceResponse } from './types';

export const notificationsAPI = {
    list: async (unreadOnly: boolean = false): Promise<NotificationResponse[]> => {
        const response = await v2Client.get('/notifications/', { params: { unread_only: String(unreadOnly) } });
        return response.data as NotificationResponse[];
    },

    markRead: async (id: string): Promise<NotificationResponse> => {
        const response = await v2Client.patch(`/notifications/${id}/read`);
        return response.data as NotificationResponse;
    },

    markAllRead: async (): Promise<void> => {
        await v2Client.post('/notifications/read-all');
    },

    getPreferences: async (): Promise<NotificationPreferenceResponse[]> => {
        const response = await v2Client.get('/notifications/preferences');
        return response.data as NotificationPreferenceResponse[];
    },
};
