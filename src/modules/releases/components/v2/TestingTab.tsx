import React, { useEffect, useState } from 'react';
import { testingAPI } from '../../../../api/v2/testing';
import { TestExecutionStatus } from '@/api/v2/types';
import type { TestingCycleResponse, TestExecutionResponse } from '@/api/v2/types';

interface TestingTabProps {
    releaseId: string;
}

export const TestingTab: React.FC<TestingTabProps> = ({ releaseId }) => {
    const [cycles, setCycles] = useState<TestingCycleResponse[]>([]);
    const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
    const [executions, setExecutions] = useState<TestExecutionResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCycles();
    }, [releaseId]);

    useEffect(() => {
        if (selectedCycleId) {
            loadExecutions(selectedCycleId);
        } else {
            setExecutions([]);
        }
    }, [selectedCycleId]);

    const loadCycles = async () => {
        try {
            const data = await testingAPI.getReleaseCycles(releaseId);
            setCycles(data);
            if (data.length > 0 && !selectedCycleId) {
                setSelectedCycleId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to load cycles', err);
        } finally {
            setLoading(false);
        }
    };

    const loadExecutions = async (cycleId: string) => {
        try {
            const data = await testingAPI.getCycleExecutions(cycleId);
            setExecutions(data);
        } catch (err) {
            console.error('Failed to load executions', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case TestExecutionStatus.PASS: return 'bg-green-100 text-green-800';
            case TestExecutionStatus.FAIL: return 'bg-red-100 text-red-800';
            case TestExecutionStatus.BLOCKED: return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div>Loading testing data...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 border-r border-gray-200 pr-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Test Cycles</h3>
                    <button className="text-xs text-blue-600 hover:text-blue-800">+ New Cycle</button>
                </div>
                <div className="space-y-2">
                    {cycles.map(cycle => (
                        <div
                            key={cycle.id}
                            onClick={() => setSelectedCycleId(cycle.id)}
                            className={`p-3 rounded-md cursor-pointer transition-colors ${selectedCycleId === cycle.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                                }`}
                        >
                            <div className="flex justify-between">
                                <span className="font-medium text-sm text-gray-900">{cycle.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${cycle.pass_rate >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {cycle.pass_rate}% Pass
                                </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                {cycle.status}
                            </div>
                        </div>
                    ))}
                    {cycles.length === 0 && <div className="text-sm text-gray-500 italic">No test cycles yet.</div>}
                </div>
            </div>

            <div className="lg:col-span-3">
                {selectedCycleId ? (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Execution Results</h3>
                            <button className="text-sm text-blue-600 hover:text-blue-800">+ Run Test</button>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Case</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executed At</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {executions.map(exec => (
                                    <tr key={exec.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {exec.title}
                                            {exec.defect_id && <span className="ml-2 text-xs text-red-500">Defect: {exec.defect_id}</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(exec.status)}`}>
                                                {exec.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {exec.executed_at ? new Date(exec.executed_at).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {executions.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">No executions recorded for this cycle.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">Select a test cycle to view results.</div>
                )}
            </div>
        </div>
    );
};
