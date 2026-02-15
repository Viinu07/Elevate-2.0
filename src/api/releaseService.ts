import { api } from './fetchClient';

export interface TestingGate {
    checked: boolean;
    date: string | null;
}

export interface ReleaseWorkItem {
    id: number;
    title: string;
    team_name: string;
    release_version: string;
    description: string;
    poc_id: string | null;
    poc_name?: string;


    // Testing Gates
    unit_testing_checked: boolean;
    unit_testing_date: string | null;

    system_testing_checked: boolean;
    system_testing_date: string | null;

    int_testing_checked: boolean;
    int_testing_date: string | null;

    // Compliance & Ops
    pvs_testing: boolean;
    pvs_intake_number: string | null;
    warranty_call_needed: boolean;
    confluence_updated: boolean;
    csca_intake: string;

    // Status & Timeline
    status: 'Proposed' | 'Currently Working' | 'Completed';
    is_completed: boolean;
    completed_at: string | null;
    release_date: string | null;
}

// Type for creating a new item (ID is handled by backend or optional if we want to support optimistic UI)
export type CreateReleaseWorkItem = Omit<ReleaseWorkItem, 'id'> & { id?: number };

export const releaseService = {
    getAll: () => api.get<ReleaseWorkItem[]>('/releases/'),

    create: (data: CreateReleaseWorkItem) => api.post<ReleaseWorkItem>('/releases/', data),

    update: (id: number, data: Partial<ReleaseWorkItem>) => api.put<ReleaseWorkItem>(`/releases/${id}`, data),

    delete: (id: number) => api.delete<ReleaseWorkItem>(`/releases/${id}`)
};
