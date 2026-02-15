import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collabService, type AwardCategory, type Vote } from '@/api/collabService';
import { feedbackService, type Feedback } from '@/api/feedbackService';
import { votingService, type VotingStatus, type AllResults } from '@/api/votingService';

export type { AwardCategory, Vote, Feedback };

// Aggregated Vote Count
export interface VoteCount {
    awardCategoryId: string;
    nominee: string;
    count: number;
    voters: string[];
}

// Leaderboard Entry
export interface LeaderboardEntry {
    rank: 1 | 2 | 3;
    nominee: string;
    voteCount: number;
    percentage: number;
}

interface CollabState {
    feedback: { received: Feedback[], sent: Feedback[] };
    awards: {
        categories: AwardCategory[];
        votes: Vote[];
        activeVoting: {
            isOpen: boolean;
            startDate: string;
            endDate: string;
        };
    };
    voting: {
        status: VotingStatus | null;
        results: AllResults | null;
    };
    isLoading: boolean;
    error: string | null;
}

const initialState: CollabState = {
    feedback: { received: [], sent: [] },
    awards: {
        categories: [],
        votes: [],
        activeVoting: {
            isOpen: true,
            startDate: '2024-02-01T00:00:00Z',
            endDate: '2024-02-29T23:59:59Z'
        }
    },
    voting: {
        status: null,
        results: null
    },
    isLoading: false,
    error: null,
};

export const fetchAwards = createAsyncThunk('collab/fetchAwards', async () => {
    return await collabService.getAwards();
});

export const fetchMyVotes = createAsyncThunk('collab/fetchMyVotes', async () => {
    return await collabService.getMyVotes();
});

export const submitVote = createAsyncThunk(
    'collab/submitVote',
    async (voteData: { categoryId: string; nomineeId: string; nominatorId: string; reason?: string }) => {
        return await collabService.createVote({
            award_category_id: voteData.categoryId,
            nominee_id: voteData.nomineeId,
            nominator_id: voteData.nominatorId,
            reason: voteData.reason
        });
    }
);

export const fetchReceivedFeedback = createAsyncThunk('collab/fetchReceivedFeedback', async (userId: string) => {
    return await feedbackService.getReceived(userId);
});

export const fetchSentFeedback = createAsyncThunk('collab/fetchSentFeedback', async (userId: string) => {
    return await feedbackService.getSent(userId);
});

export const sendFeedback = createAsyncThunk(
    'collab/sendFeedback',
    async (feedbackData: { from_user_id: string; to_user_id: string; content: string }) => {
        return await feedbackService.create(feedbackData);
    }
);

// Voting status and results thunks
export const fetchVotingStatus = createAsyncThunk('collab/fetchVotingStatus', async () => {
    return await votingService.getVotingStatus();
});

export const toggleVotingStatus = createAsyncThunk(
    'collab/toggleVotingStatus',
    async (data: { isOpen?: boolean; resultsVisible?: boolean; updatedBy?: string }) => {
        return await votingService.updateVotingStatus(data.isOpen, data.resultsVisible, data.updatedBy);
    }
);

export const fetchVotingResults = createAsyncThunk('collab/fetchVotingResults', async () => {
    return await votingService.getAllResults();
});

export const createAwardCategory = createAsyncThunk(
    'collab/createAwardCategory',
    async (categoryData: { name: string; icon: string; description: string }) => {
        return await collabService.createAwardCategory(categoryData);
    }
);

// Helper thunk to load all initial data
export const fetchCollabData = createAsyncThunk('collab/fetchAll', async (userId: string, { dispatch }) => {
    await Promise.all([
        dispatch(fetchAwards()),
        dispatch(fetchMyVotes()),
        dispatch(fetchReceivedFeedback(userId)),
        dispatch(fetchSentFeedback(userId)),
        dispatch(fetchVotingStatus()),
        dispatch(fetchVotingResults())
    ]);
});

const collabSlice = createSlice({
    name: 'collab',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Awards
            .addCase(fetchAwards.fulfilled, (state, action) => {
                state.awards.categories = action.payload;
            })
            .addCase(createAwardCategory.fulfilled, (state, action) => {
                state.awards.categories.push(action.payload);
            })
            // Votes
            .addCase(fetchMyVotes.fulfilled, (state, action) => {
                state.awards.votes = action.payload;
            })
            .addCase(submitVote.fulfilled, (state, action) => {
                state.awards.votes.push(action.payload);
            })
            // Feedback
            .addCase(fetchReceivedFeedback.fulfilled, (state, action) => {
                state.feedback.received = action.payload;
            })
            .addCase(fetchSentFeedback.fulfilled, (state, action) => {
                state.feedback.sent = action.payload;
            })
            .addCase(sendFeedback.fulfilled, (state, action) => {
                state.feedback.sent.push(action.payload);
            })
            // Voting Status
            .addCase(fetchVotingStatus.fulfilled, (state, action) => {
                state.voting.status = action.payload;
            })
            .addCase(toggleVotingStatus.fulfilled, (state, action) => {
                state.voting.status = action.payload;
            })
            // Voting Results
            .addCase(fetchVotingResults.fulfilled, (state, action) => {
                state.voting.results = action.payload;
            });
    },
});

export default collabSlice.reducer;

