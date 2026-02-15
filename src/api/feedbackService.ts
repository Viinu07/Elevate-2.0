
import { api } from './fetchClient';

export interface Feedback {
    id: string;
    from_user_id: string;
    to_user_id: string;
    content: string;
    date: string;
    from_user_name?: string;
    to_user_name?: string;
    reaction?: string;
    reply?: string;
}

export const feedbackService = {
    getReceived: (userId: string) => api.get<Feedback[]>(`/feedback/received?user_id=${userId}`),
    getSent: (userId: string) => api.get<Feedback[]>(`/feedback/sent?user_id=${userId}`),
    create: (feedback: { from_user_id: string; to_user_id: string; content: string }) =>
        api.post<Feedback>('/feedback/', feedback),
    updateReply: (feedbackId: string, reply: string) =>
        api.patch<Feedback>(`/feedback/${feedbackId}/reply?reply=${encodeURIComponent(reply)}`)
};
