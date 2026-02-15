import v2Client from './client';
import type { CommentResponse } from './types';

export interface Comment {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar?: string;
    content: string;
    created_at: string;
}

export interface Post {
    id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_role?: string;
    author_team?: string;
    created_at: string;
    images?: string[];
    likes: number;
    comments: number;
    liked_by_user: boolean;
}

export interface CreatePostPayload {
    content: string;
    images?: string[];
}

export const postsAPI = {
    list: async (skip = 0, limit = 20) => {
        const response = await v2Client.get<Post[]>(`/posts/`, {
            params: { skip, limit }
        });
        return response.data;
    },

    create: async (payload: CreatePostPayload) => {
        const response = await v2Client.post<Post>(`/posts/`, payload);
        return response.data;
    },

    like: async (postId: string) => {
        const response = await v2Client.post<boolean>(`/posts/${postId}/like`);
        return response.data;
    },

    getLikes: async (postId: string) => {
        const response = await v2Client.get<{ id: string, name: string, avatar: string }[]>(`/posts/${postId}/likes`);
        return response.data;
    },

    addComment: async (postId: string, content: string): Promise<CommentResponse> => {
        const response = await v2Client.post<CommentResponse>(`/posts/${postId}/comments`, { content });
        return response.data;
    },

    delete: async (postId: string): Promise<boolean> => {
        const response = await v2Client.delete<boolean>(`/posts/${postId}`);
        return response.data;
    },

    getComments: async (postId: string) => {
        const response = await v2Client.get<Comment[]>(`/posts/${postId}/comments`);
        return response.data;
    }
};
