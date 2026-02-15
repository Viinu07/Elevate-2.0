import v2Client from './client';
import type { TaskCreate, TaskResponse } from './types';

export const tasksAPI = {
    create: async (data: TaskCreate): Promise<TaskResponse> => {
        const response = await v2Client.post('/tasks/', data);
        return response.data as TaskResponse;
    },

    list: async (filters?: {
        assigned_to_id?: string;
        linked_event_id?: string;
        linked_release_id?: string;
    }): Promise<TaskResponse[]> => {
        const response = await v2Client.get('/tasks/', { params: filters });
        return response.data as TaskResponse[];
    },

    update: async (id: string, data: Partial<TaskCreate>): Promise<TaskResponse> => {
        const response = await v2Client.put(`/tasks/${id}`, data);
        return response.data as TaskResponse;
    },

    delete: async (id: string): Promise<TaskResponse> => {
        const response = await v2Client.delete(`/tasks/${id}`);
        return response.data as TaskResponse;
    },
};
