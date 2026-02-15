import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { releaseService, type ReleaseWorkItem as ApiWorkItem, type CreateReleaseWorkItem } from '../api/releaseService';

export interface TestingGate {
    status: 'Pending' | 'In Progress' | 'Passed' | 'Failed' | 'Waived';
    date?: string;
}

export interface WorkItem {
    id: string;
    title: string;
    release: string;
    team: string;
    status: 'Proposed' | 'Currently Working' | 'Completed';
    completedAt?: string;
    poc_id?: string | null;
    // Compliance
    pvsTesting: boolean;
    pvsIntakeNumber?: string;
    scrumAlignDetails?: string;
    warrantyCallNeeded: boolean;
    confluenceUpdated: boolean;
    cscaIntake: 'Yes' | 'No' | 'Exempt';
    // Gates
    unitTesting: TestingGate;
    systemTesting: TestingGate;
    intTesting: TestingGate;
}

interface ReleasesState {
    releases: string[];
    workItems: WorkItem[];
    loading: boolean;
    error: string | null;
}

const initialState: ReleasesState = {
    releases: ['v2.4.0 (Nov)', 'v2.5.0 (Dec)', 'v3.0.0-beta'],
    workItems: [],
    loading: false,
    error: null
};

// Helper to map API response to Redux State
const mapApiToWorkItem = (item: ApiWorkItem): WorkItem => {
    return {
        id: item.id.toString(),
        title: item.title,
        release: item.release_version,
        team: item.team_name,
        status: item.status,
        completedAt: item.completed_at || undefined,
        poc_id: item.poc_id,
        pvsTesting: item.pvs_testing,
        pvsIntakeNumber: item.pvs_intake_number || undefined,
        warrantyCallNeeded: item.warranty_call_needed,
        confluenceUpdated: item.confluence_updated,
        cscaIntake: item.csca_intake as 'Yes' | 'No' | 'Exempt',
        unitTesting: {
            status: item.unit_testing_checked ? 'Passed' : 'Pending',
            date: item.unit_testing_date || undefined
        },
        systemTesting: {
            status: item.system_testing_checked ? 'Passed' : 'Pending',
            date: item.system_testing_date || undefined
        },
        intTesting: {
            status: item.int_testing_checked ? 'Passed' : 'Pending',
            date: item.int_testing_date || undefined
        }
    };
};

// Async Thunks
export const fetchWorkItems = createAsyncThunk(
    'releases/fetchWorkItems',
    async () => {
        const response = await releaseService.getAll();
        return response;
    }
);

export const createWorkItem = createAsyncThunk(
    'releases/createWorkItem',
    async (item: Omit<WorkItem, 'id'>) => {
        // Map Frontend -> Backend
        const apiItem: CreateReleaseWorkItem = {
            title: item.title,
            team_name: item.team,
            release_version: item.release,
            description: '', // Default
            poc_id: item.poc_id || null,
            unit_testing_checked: item.unitTesting.status === 'Passed',
            unit_testing_date: item.unitTesting.date || null,
            system_testing_checked: item.systemTesting.status === 'Passed',
            system_testing_date: item.systemTesting.date || null,
            int_testing_checked: item.intTesting.status === 'Passed',
            int_testing_date: item.intTesting.date || null,
            pvs_testing: item.pvsTesting,
            pvs_intake_number: item.pvsIntakeNumber || null,
            warranty_call_needed: item.warrantyCallNeeded,
            confluence_updated: item.confluenceUpdated,
            csca_intake: item.cscaIntake,
            status: item.status,
            is_completed: item.status === 'Completed',
            completed_at: item.completedAt || null,
            release_date: null
        };
        const response = await releaseService.create(apiItem);
        return response;
    }
);

export const updateWorkItemStatusAsync = createAsyncThunk(
    'releases/updateStatus',
    async ({ id, status }: { id: string, status: 'Proposed' | 'Currently Working' | 'Completed' }) => {
        const response = await releaseService.update(parseInt(id), { status });
        return response;
    }
);

const releasesSlice = createSlice({
    name: 'releases',
    initialState,
    reducers: {
        // Keep these for optimistic updates or legacy support if needed
        addWorkItem: (state, action: PayloadAction<WorkItem>) => {
            state.workItems.push(action.payload);
        },
        updateGateStatus: (state, action: PayloadAction<{ id: string, gate: 'unitTesting' | 'systemTesting' | 'intTesting', status: TestingGate }>) => {
            const item = state.workItems.find(i => i.id === action.payload.id);
            if (item) {
                item[action.payload.gate] = action.payload.status;
            }
        },
        updateWorkItemStatus: (state, action: PayloadAction<{ id: string, status: 'Proposed' | 'Currently Working' | 'Completed' }>) => {
            const item = state.workItems.find(i => i.id === action.payload.id);
            if (item) {
                item.status = action.payload.status;
                if (action.payload.status === 'Completed') {
                    item.completedAt = new Date().toISOString();
                }
            }
        },
        addRelease: (state, action: PayloadAction<string>) => {
            state.releases.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkItems.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkItems.fulfilled, (state, action) => {
                state.loading = false;
                state.workItems = action.payload.map(mapApiToWorkItem);
            })
            .addCase(fetchWorkItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch work items';
            })
            .addCase(createWorkItem.fulfilled, (state, action) => {
                state.workItems.push(mapApiToWorkItem(action.payload));
            })
            .addCase(updateWorkItemStatusAsync.fulfilled, (state, action) => {
                const index = state.workItems.findIndex(i => i.id === action.payload.id.toString());
                if (index !== -1) {
                    state.workItems[index] = mapApiToWorkItem(action.payload);
                }
            });
    }
});

export const { addWorkItem, updateGateStatus, updateWorkItemStatus, addRelease } = releasesSlice.actions;
export default releasesSlice.reducer;
