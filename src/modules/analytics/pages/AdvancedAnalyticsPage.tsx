import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../../api/v2/analytics';
import type { ReleaseTrendMetric, EndorsementInsight, RiskItem } from '../../../api/v2/types';

export const AdvancedAnalyticsPage: React.FC = () => {
    const [trends, setTrends] = useState<ReleaseTrendMetric[]>([]);
    const [endorsements, setEndorsements] = useState<EndorsementInsight[]>([]);
    const [risk, setRisk] = useState<RiskItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendsData, endorsementsData, riskData] = await Promise.all([
                    analyticsAPI.getReleaseTrends(),
                    analyticsAPI.getEndorsementInsights(),
                    analyticsAPI.getRiskHeatmap()
                ]);
                setTrends(trendsData);
                setEndorsements(endorsementsData);
                setRisk(riskData);
            } catch (err) {
                console.error('Failed to load advanced analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading deep insights...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Advanced Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Cultural Values Insight */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Culture: Top Endorsed Values</h3>
                    <div className="space-y-4">
                        {endorsements.map((item) => (
                            <div key={item.value}>
                                <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
                                    <span>{item.value}</span>
                                    <span>{item.count}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-purple-600 h-2.5 rounded-full"
                                        style={{ width: `${(item.count / 50) * 100}%` }} // Mock scaling
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Release Success Trend */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Release Success Trend</h3>
                    <div className="flex items-end space-x-4 h-48 mt-4">
                        {trends.map((item) => (
                            <div key={item.month} className="flex-1 flex flex-col justify-end items-center group">
                                <div
                                    className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600 relative"
                                    style={{ height: `${item.success_rate}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Success: {item.success_rate}%<br />Health: {item.avg_health}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Risk Heatmap */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">System Risk Heatmap</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {risk.map((item) => (
                        <div
                            key={item.component}
                            className={`p-4 rounded-lg border ${item.risk_score > 70 ? 'bg-red-50 border-red-200' :
                                item.risk_score > 30 ? 'bg-yellow-50 border-yellow-200' :
                                    'bg-green-50 border-green-200'
                                }`}
                        >
                            <h4 className={`font-bold ${item.risk_score > 70 ? 'text-red-800' :
                                item.risk_score > 30 ? 'text-yellow-800' :
                                    'text-green-800'
                                }`}>{item.component}</h4>
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                                <div className="flex justify-between">
                                    <span>Risk Score:</span>
                                    <span className="font-mono font-bold">{item.risk_score}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Defects:</span>
                                    <span className="font-mono font-bold">{item.defect_count}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
