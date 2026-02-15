import { api } from './fetchClient';
import { type Vote } from './collabService';

export interface VotingStatus {
    id: string;
    is_voting_open: boolean;
    results_visible: boolean;
    updated_at: string;
    updated_by?: string;
}

export interface CategoryResult {
    category_id: string;
    category_name: string;
    category_icon: string;
    total_votes: number;
    top_3: {
        nominee_id: string;
        nominee_name: string;
        vote_count: number;
    }[];
}

export interface AllResults {
    [categoryId: string]: CategoryResult;
}

export const votingService = {
    getVotingStatus: () => api.get<VotingStatus>('/voting/status'),

    updateVotingStatus: (isOpen?: boolean, resultsVisible?: boolean, updatedBy?: string) =>
        api.put<VotingStatus>('/voting/status', {
            is_voting_open: isOpen,
            results_visible: resultsVisible,
            updated_by: updatedBy
        }),

    getAllResults: () => api.get<AllResults>('/voting/results'),

    createVote: (vote: { categoryId: string; nomineeId: string; nominatorId: string; reason?: string }) =>
        api.post<Vote>('/collab/votes', vote),
};
