import v2Client from './client';
import type { UserProfileFullResponse, ProfileBase } from './types';

export const profilesAPI = {
    getMe: async (): Promise<UserProfileFullResponse> => {
        const response = await v2Client.get<UserProfileFullResponse>('/profiles/me');
        return response.data;
    },

    updateMe: async (data: Partial<ProfileBase>): Promise<UserProfileFullResponse> => {
        const response = await v2Client.put<UserProfileFullResponse>('/profiles/me', data);
        return response.data;
    },

    list: async (params?: { skip?: number; limit?: number }): Promise<UserProfileFullResponse[]> => {
        const response = await v2Client.get<UserProfileFullResponse[]>('/profiles/', { params });
        return response.data;
    },

    getUser: async (userId: string): Promise<UserProfileFullResponse> => {
        const response = await v2Client.get<UserProfileFullResponse>(`/profiles/${userId}`);
        return response.data;
    }
};
