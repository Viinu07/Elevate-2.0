import v2Client from './client';
import type {
    TestingCycleCreate,
    TestingCycleResponse,
    TestExecutionCreate,
    TestExecutionResponse
} from './types';

export const testingAPI = {
    createCycle: async (data: TestingCycleCreate): Promise<TestingCycleResponse> => {
        const response = await v2Client.post('/testing/cycles', data);
        return response.data;
    },

    getReleaseCycles: async (releaseId: string): Promise<TestingCycleResponse[]> => {
        const response = await v2Client.get(`/testing/releases/${releaseId}/cycles`);
        return response.data;
    },

    createExecution: async (data: TestExecutionCreate): Promise<TestExecutionResponse> => {
        const response = await v2Client.post('/testing/executions', data);
        return response.data;
    },

    getCycleExecutions: async (cycleId: string): Promise<TestExecutionResponse[]> => {
        const response = await v2Client.get(`/testing/cycles/${cycleId}/executions`);
        return response.data;
    },
};
