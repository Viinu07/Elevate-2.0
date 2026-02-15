import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { VoteCount, LeaderboardEntry } from './collabSlice';

/**
 * Selector: Get vote counts aggregated by award category
 * Returns a map of categoryId -> array of VoteCount objects
 */
export const selectVoteCountsByAward = createSelector(
    [(state: RootState) => state.collab.awards.votes],
    (votes) => {
        const counts: Record<string, VoteCount[]> = {};

        votes.forEach(vote => {
            if (!counts[vote.award_category_id]) {
                counts[vote.award_category_id] = [];
            }

            const nomineeName = vote.nominee_name || 'Unknown Nominee';

            const existingCount = counts[vote.award_category_id]
                .find(c => c.nominee === nomineeName);

            if (existingCount) {
                existingCount.count++;
                existingCount.voters.push(vote.nominator_id);
            } else {
                counts[vote.award_category_id].push({
                    awardCategoryId: vote.award_category_id,
                    nominee: nomineeName,
                    count: 1,
                    voters: [vote.nominator_id]
                });
            }
        });

        return counts;
    }
);

/**
 * Selector: Get top 3 nominees for each award category
 * Returns a map of categoryId -> array of LeaderboardEntry (top 3)
 */
export const selectTop3ByAward = createSelector(
    [selectVoteCountsByAward],
    (voteCounts) => {
        const leaderboards: Record<string, LeaderboardEntry[]> = {};

        Object.entries(voteCounts).forEach(([categoryId, counts]) => {
            const totalVotes = counts.reduce((sum, c) => sum + c.count, 0);

            leaderboards[categoryId] = counts
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((entry, index) => ({
                    rank: (index + 1) as 1 | 2 | 3,
                    nominee: entry.nominee,
                    voteCount: entry.count,
                    percentage: totalVotes > 0 ? (entry.count / totalVotes) * 100 : 0
                }));
        });

        return leaderboards;
    }
);

/**
 * Selector: Get all votes cast by a specific nominator
 */
export const selectVotesByNominator = (nominator: string) =>
    createSelector(
        [(state: RootState) => state.collab.awards.votes],
        (votes) => votes.filter(v => v.nominator_id === nominator)
    );

/**
 * Selector: Get all votes cast by a specific voter (alias for selectVotesByNominator)
 */
export const selectVotesByVoter = (state: RootState, voter: string) =>
    state.collab.awards.votes.filter(v => v.nominator_id === voter);

/**
 * Selector: Get all votes received by a specific nominee
 */
export const selectVotesForNominee = (nominee: string) =>
    createSelector(
        [(state: RootState) => state.collab.awards.votes],
        (votes) => votes.filter(v => v.nominee_name === nominee)
    );

/**
 * Selector: Check if a user has already voted in a specific category
 */
export const selectHasVotedInCategory = (nominator: string, categoryId: string) =>
    createSelector(
        [(state: RootState) => state.collab.awards.votes],
        (votes) => votes.some(v => v.nominator_id === nominator && v.award_category_id === categoryId)
    );

/**
 * Selector: Get total vote count across all categories
 */
export const selectTotalVotes = createSelector(
    [(state: RootState) => state.collab.awards.votes],
    (votes) => votes.length
);

/**
 * Selector: Get unique voters count
 */
export const selectUniqueVotersCount = createSelector(
    [(state: RootState) => state.collab.awards.votes],
    (votes) => new Set(votes.map(v => v.nominator_id)).size
);

/**
 * Selector: Get voting statistics
 */
export const selectVotingStats = createSelector(
    [
        (state: RootState) => state.collab.awards.votes,
        (state: RootState) => state.collab.awards.categories
    ],
    (votes, categories) => {
        const totalVotes = votes.length;
        const uniqueVoters = new Set(votes.map(v => v.nominator_id)).size;
        const uniqueNominees = new Set(votes.map(v => v.nominee_name)).size;

        const votesByCategory = categories.map(cat => ({
            categoryId: cat.id,
            categoryName: cat.name,
            voteCount: votes.filter(v => v.award_category_id === cat.id).length
        }));

        return {
            totalVotes,
            uniqueVoters,
            uniqueNominees,
            categoriesCount: categories.length,
            votesByCategory
        };
    }
);
