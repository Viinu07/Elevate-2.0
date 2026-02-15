import v2Client from './client';
import type { DashboardMetrics, VelocityMetric, ReleaseTrendMetric, EndorsementInsight, RiskItem } from './types';

export const analyticsAPI = {
    getDashboardMetrics: async (): Promise<DashboardMetrics> => {
        const response = await v2Client.get('/analytics/dashboard');
        return response.data as DashboardMetrics;
    },

    async getReleaseTrends(): Promise<ReleaseTrendMetric[]> {
        const response = await v2Client.get('/analytics/trends/releases');
        return response.data as ReleaseTrendMetric[];
    },
    async getEndorsementInsights(): Promise<EndorsementInsight[]> {
        const response = await v2Client.get('/analytics/insights/endorsements');
        return response.data as EndorsementInsight[];
    },
    async getRiskHeatmap(): Promise<RiskItem[]> {
        const response = await v2Client.get('/analytics/heatmap/risk');
        return response.data as RiskItem[];
    },

    getVelocityMetrics: async (): Promise<VelocityMetric[]> => {
        const response = await v2Client.get('/analytics/velocity');
        return response.data as VelocityMetric[];
    },
};
