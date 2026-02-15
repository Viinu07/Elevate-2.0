
import { api } from './fetchClient';
import type { User } from './userService';

export interface Team {
    id: string;
    name: string;
    art_id?: string;
    art_name?: string;
    members?: User[];
}

export interface ART {
    id: string;
    name: string;
    teams?: Team[];
}

export interface TeamUpdate {
    id: string;
    content: string;
    team_id: string;
    user_id: string;
    user_name: string;
    created_at: string;
}

export const teamService = {
    getTeams: () => api.get<Team[]>('/teams/'),
    createTeam: (team: Omit<Team, 'id' | 'members'>) => api.post<Team>('/teams/', team),
    updateTeam: (id: string, team: Partial<Team>) => api.put<Team>(`/teams/${id}`, team),
    deleteTeam: (id: string) => api.delete<Team>(`/teams/${id}`),

    // ARTs
    getARTs: () => api.get<ART[]>('/teams/arts/'),
    createART: (art: Omit<ART, 'id' | 'teams'>) => api.post<ART>('/teams/arts/', art),
    updateART: (id: string, art: Partial<ART>) => api.put<ART>(`/teams/arts/${id}`, art),
    deleteART: (id: string) => api.delete<ART>(`/teams/arts/${id}`),

    // Updates
    getTeamUpdates: (teamId: string) => api.get<TeamUpdate[]>(`/teams/${teamId}/updates`),
    createTeamUpdate: (teamId: string, content: string) => api.post<TeamUpdate>(`/teams/${teamId}/updates`, { content }),
};
