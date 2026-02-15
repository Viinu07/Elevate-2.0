
import { api } from './fetchClient';

export interface AwardCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export interface Vote {
    id: string;
    award_category_id: string;
    nominator_id: string;
    nominee_id: string;
    nominee_name?: string;
    reason?: string;
    timestamp: string;
}

export interface Feedback {
    id: string;
    from_user_id: string;
    to_user_id: string;
    content: string;
    type: string;
    sentiment: string;
    date: string;
}

export const collabService = {
    getAwards: () => api.get<AwardCategory[]>('/collab/awards'),
    createAwardCategory: (category: { name: string; icon: string; description: string }) =>
        api.post<AwardCategory>('/collab/categories', category),
    createVote: (vote: { award_category_id: string; nominee_id: string; nominator_id: string; reason?: string }) =>
        api.post<Vote>('/collab/votes', vote),
    getMyVotes: () => api.get<Vote[]>('/collab/votes/me'),
    createFeedback: (feedback: { to_user_id: string; content: string; type: string; sentiment: string }) =>
        api.post<Feedback>('/collab/feedback', { ...feedback, from_user_id: '09103f63-7cc3-4c8f-8095-e5a038b1fc17' }), // Todo: get real user ID
    getMyFeedback: () => api.get<Feedback[]>('/collab/feedback/me'),
};
