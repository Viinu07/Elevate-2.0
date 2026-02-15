import v2Client from './client';
import type { EndorsementCreate, EndorsementResponse, CommentResponse } from './types';

export const endorsementsAPI = {
    // Create endorsement
    create: async (data: EndorsementCreate): Promise<EndorsementResponse> => {
        const response = await v2Client.post<EndorsementResponse>('/endorsements/', data);
        return response.data;
    },

    // List endorsements
    list: async (params?: { skip?: number; limit?: number }): Promise<EndorsementResponse[]> => {
        const response = await v2Client.get<EndorsementResponse[]>('/endorsements/', { params });
        return response.data;
    },

    // Social
    like: async (endorsementId: string): Promise<boolean> => {
        const response = await v2Client.post<boolean>(`/endorsements/${endorsementId}/like`);
        return response.data;
    },

    getLikes: async (endorsementId: string): Promise<any[]> => {
        // Returns list of users
        const response = await v2Client.get<any[]>(`/endorsements/${endorsementId}/likes`);
        return response.data;
    },

    addComment: async (endorsementId: string, content: string): Promise<CommentResponse> => {
        const response = await v2Client.post<CommentResponse>(`/endorsements/${endorsementId}/comments`, { content });
        return response.data;
    },

    getComments: async (endorsementId: string): Promise<CommentResponse[]> => {
        const response = await v2Client.get<CommentResponse[]>(`/endorsements/${endorsementId}/comments`);
        return response.data;
    },

    delete: async (endorsementId: string): Promise<void> => {
        await v2Client.delete(`/endorsements/${endorsementId}`);
    },
};
