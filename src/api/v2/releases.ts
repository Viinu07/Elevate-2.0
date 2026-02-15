import v2Client from './client';
import type { ReleaseCreate, ReleaseResponse, WorkItemCreate, WorkItemResponse } from './types';

export const releasesAPI = {
    create: async (data: ReleaseCreate): Promise<ReleaseResponse> => {
        const response = await v2Client.post('/releases/', data);
        return response.data;
    },

    list: async (params?: { skip?: number; limit?: number }): Promise<ReleaseResponse[]> => {
        const response = await v2Client.get('/releases/', { params });
        return response.data;
    },

    get: async (releaseId: string): Promise<ReleaseResponse> => {
        const response = await v2Client.get(`/releases/${releaseId}`);
        return response.data;
    },

    createWorkItem: async (releaseId: string, data: WorkItemCreate): Promise<WorkItemResponse> => {
        const response = await v2Client.post(`/releases/${releaseId}/work-items`, data);
        return response.data;
    },

    getWorkItems: async (releaseId: string): Promise<WorkItemResponse[]> => {
        const response = await v2Client.get(`/releases/${releaseId}/work-items`);
        return response.data;
    },
};
