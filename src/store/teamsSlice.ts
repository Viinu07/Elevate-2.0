import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamService, type Team, type ART, type TeamUpdate } from '@/api/teamService';
import { userService } from '@/api/userService';

export type { Team, ART, TeamUpdate };

// Types
export interface TeamsState {
    arts: ART[];
    teams: Team[]; // Keep a flat list accessible if needed, but UI will mostly use `arts`
    currentTeamUpdates: TeamUpdate[];
    isLoading: boolean;
    error: string | null;
}

const initialState: TeamsState = {
    arts: [],
    teams: [],
    currentTeamUpdates: [],
    isLoading: false,
    error: null,
};

// Async Thunks - ARTs
export const fetchARTs = createAsyncThunk('teams/fetchARTs', async () => {
    return await teamService.getARTs();
});

export const addART = createAsyncThunk('teams/addART', async (name: string) => {
    return await teamService.createART({ name });
});

export const updateART = createAsyncThunk('teams/updateART', async ({ id, name }: { id: string; name: string }) => {
    return await teamService.updateART(id, { name });
});

export const deleteART = createAsyncThunk('teams/deleteART', async (id: string) => {
    await teamService.deleteART(id);
    return id;
});

// Async Thunks - Teams
export const fetchTeams = createAsyncThunk('teams/fetchTeams', async () => {
    return await teamService.getTeams();
});

export const addTeam = createAsyncThunk('teams/addTeam', async ({ artId, name }: { artId: string; name: string }) => {
    return await teamService.createTeam({ art_id: artId, name });
});

export const updateTeam = createAsyncThunk('teams/updateTeam', async ({ id, name }: { id: string; name: string }) => {
    return await teamService.updateTeam(id, { name });
});

export const deleteTeam = createAsyncThunk('teams/deleteTeam', async (id: string) => {
    await teamService.deleteTeam(id);
    return id;
});

// Async Thunks - Updates
export const fetchTeamUpdates = createAsyncThunk('teams/fetchTeamUpdates', async (teamId: string) => {
    return await teamService.getTeamUpdates(teamId);
});

export const addTeamUpdate = createAsyncThunk('teams/addTeamUpdate', async ({ teamId, content }: { teamId: string; content: string }) => {
    return await teamService.createTeamUpdate(teamId, content);
});

// Async Thunks - Members
// For now, adding a member creates a new user and assigns them to the team.
// In a real app, this might be selecting an existing user or inviting via email.
export const addMember = createAsyncThunk(
    'teams/addMember',
    async ({ artId: _artId, teamId, name, role }: { artId: string; teamId: string; name: string; role?: string }) => {
        // Create user with team_id
        const newUser = await userService.createUser({
            name,
            role,
            team_id: teamId
        });
        return newUser;
    }
);

export const removeMember = createAsyncThunk(
    'teams/removeMember',
    async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
        // Delete the user entirely
        await userService.deleteUser(memberId);
        return { teamId, memberId };
    }
);


const teamsSlice = createSlice({
    name: 'teams',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch ARTs
            .addCase(fetchARTs.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchARTs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.arts = action.payload;
            })
            .addCase(fetchARTs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch ARTs';
            })
            // Add ART
            .addCase(addART.fulfilled, (state, action) => {
                state.arts.push({ ...action.payload, teams: [] });
            })
            // Update ART
            .addCase(updateART.fulfilled, (state, action) => {
                const index = state.arts.findIndex(a => a.id === action.payload.id);
                if (index !== -1) {
                    state.arts[index] = { ...state.arts[index], ...action.payload };
                }
            })
            // Delete ART
            .addCase(deleteART.fulfilled, (state, action) => {
                state.arts = state.arts.filter(a => a.id !== action.payload);
            })
            // Fetch Teams - Optional if we use fetchARTs as primary
            // But if called, it populates the flat list
            .addCase(fetchTeams.fulfilled, (state, action) => {
                state.teams = action.payload;
            })
            // Add Team
            .addCase(addTeam.fulfilled, (state, action) => {
                const team = action.payload;
                state.teams.push(team);

                // Add to ART's team list
                const art = state.arts.find(a => a.id === team.art_id);
                if (art) {
                    if (!art.teams) art.teams = [];
                    art.teams.push({ ...team, members: [] });
                }
            })
            // Update Team
            .addCase(updateTeam.fulfilled, (state, action) => {
                const updatedTeam = action.payload;
                // Update flat list
                const teamIndex = state.teams.findIndex(t => t.id === updatedTeam.id);
                if (teamIndex !== -1) {
                    state.teams[teamIndex] = { ...state.teams[teamIndex], ...updatedTeam };
                }

                // Update within ART
                const art = state.arts.find(a => a.id === updatedTeam.art_id);
                if (art && art.teams) {
                    const artTeamIndex = art.teams.findIndex(t => t.id === updatedTeam.id);
                    if (artTeamIndex !== -1) {
                        // Preserve members when updating team details
                        const members = art.teams[artTeamIndex].members;
                        art.teams[artTeamIndex] = { ...art.teams[artTeamIndex], ...updatedTeam, members };
                    }
                }
            })
            // Delete Team
            .addCase(deleteTeam.fulfilled, (state, action) => {
                const teamId = action.payload;
                // Remove from flat list
                state.teams = state.teams.filter(t => t.id !== teamId);

                // Remove from ARTs
                state.arts.forEach(art => {
                    if (art.teams) {
                        art.teams = art.teams.filter(t => t.id !== teamId);
                    }
                });
            })
            // Fetch/Add Team Updates
            .addCase(fetchTeamUpdates.pending, (state) => {
                state.currentTeamUpdates = [];
            })
            .addCase(fetchTeamUpdates.fulfilled, (state, action) => {
                state.currentTeamUpdates = action.payload;
            })
            .addCase(addTeamUpdate.fulfilled, (state, action) => {
                state.currentTeamUpdates.unshift(action.payload);
            })
            // Add Member
            .addCase(addMember.fulfilled, (state, action) => {
                const user = action.payload;
                if (!user.team_id) return;

                // Find the team in the nested structure
                for (const art of state.arts) {
                    const team = art.teams?.find(t => t.id === user.team_id);
                    if (team) {
                        if (!team.members) team.members = [];
                        team.members.push(user);
                        break;
                    }
                }
            })
            // Remove Member
            .addCase(removeMember.fulfilled, (state, action) => {
                const { teamId, memberId } = action.payload;
                for (const art of state.arts) {
                    const team = art.teams?.find(t => t.id === teamId);
                    if (team && team.members) {
                        team.members = team.members.filter(m => m.id !== memberId);
                        break;
                    }
                }
            });
    },
});

export default teamsSlice.reducer;
