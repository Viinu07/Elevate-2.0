import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { releasesAPI } from '../../../../api/v2/releases';
import type { ReleaseResponse, WorkItemResponse } from '../../../../api/v2/types';

import { StatusBadge } from '../../../../shared/components/v2/StatusBadge'; // Assuming compatible
import { Tabs } from '../../../../shared/components/v2/Tabs';
import { TestingTab } from './TestingTab';
import { TaskList } from '../../../tasks/components/v2/TaskList';

export const ReleaseDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [release, setRelease] = useState<ReleaseResponse | null>(null);
    const [workItems, setWorkItems] = useState<WorkItemResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [releaseData, itemsData] = await Promise.all([
                    releasesAPI.get(id),
                    releasesAPI.getWorkItems(id)
                ]);
                setRelease(releaseData);
                setWorkItems(itemsData);
            } catch (err) {
                console.error('Failed to load release details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading release...</div>;
    if (!release) return <div className="p-8 text-center text-red-500">Release not found</div>;

    const OverviewTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Release Health</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded text-center">
                            <span className={`block text-3xl font-bold ${release.health_score > 80 ? 'text-green-600' : release.health_score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {release.health_score}%
                            </span>
                            <span className="text-xs text-gray-500">Overall Score</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded text-center">
                            <span className="block text-3xl font-bold text-blue-600">
                                {release.completion_percentage}%
                            </span>
                            <span className="text-xs text-gray-500">Completion</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${release.completion_percentage}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Log</h3>
                    <div className="text-sm text-gray-500 italic">No active risks.</div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <TaskList releaseId={id!} />
                </div>
            </div>
        </div>
    );

    const ScopeTab = () => (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Work Items ({workItems.length})</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">+ Add Item</button>
            </div>
            <ul className="divide-y divide-gray-200">
                {workItems.map(item => (
                    <li key={item.id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                                <div className="flex items-center mt-1 space-x-2">
                                    <span className="text-xs text-gray-500">#{item.id.substring(0, 6)}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.type}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${item.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>{item.priority}</span>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">{item.status}</span>
                        </div>
                    </li>
                ))}
                {workItems.length === 0 && <li className="px-6 py-8 text-center text-gray-500 italic">No work items linked</li>}
            </ul>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4">← Back to Releases</button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            {release.name || release.version}
                            <StatusBadge status={release.status} />
                        </h1>
                        <p className="text-gray-500 mt-1">Release Management V2</p>
                    </div>
                </div>
            </div>

            <Tabs tabs={[
                { id: 'overview', label: 'Overview', content: <OverviewTab /> },
                { id: 'scope', label: 'Scope', content: <ScopeTab /> },
                { id: 'testing', label: 'Testing', content: <TestingTab releaseId={id!} /> },
                { id: 'timeline', label: 'Timeline', content: <div className="p-8 text-center text-gray-500">Timeline view coming soon</div> },
            ]} />
        </div>
    );
};
