
import { api } from './fetchClient';
import v2Client from './v2/client';

export interface User {
    id: string;
    name: string;
    role?: string;
    team_id?: string;
    // Flat API fields
    team_name?: string;
    art_id?: string;
    art_name?: string;
}

export const userService = {
    getUsers: () => api.get<User[]>('/users/'),
    getCurrentUser: async () => {
        try {
            const response = await v2Client.get<User>('/auth/me');
            return response.data;
        } catch (error) {
            // Fallback for unauthenticated state or dev mode without token
            const users = await api.get<User[]>('/users/');
            return users[0] || null;
        }
    },
    createUser: (user: Omit<User, 'id'>) => api.post<User>('/users/', user),
    updateUser: (id: string, user: Partial<User>) => api.put<User>(`/users/${id}`, user),
    deleteUser: (id: string) => api.delete<User>(`/users/${id}`),
    loginAs: async (userId: string) => {
        const response = await v2Client.post<{ access_token: string, token_type: string }>('/auth/login-as', { user_id: userId });
        return response.data;
    },
};
