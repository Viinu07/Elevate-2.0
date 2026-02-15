import React from 'react';

// Mock activity interface for now
interface ActivityItem {
    id: string;
    type: 'ENDORSEMENT' | 'RELEASE' | 'TASK';
    title: string;
    timestamp: string;
}

export const ActivityFeed: React.FC = () => {
    const activities: ActivityItem[] = [
        { id: '1', type: 'ENDORSEMENT', title: 'Received "Team Player" endorsement from Sarah', timestamp: '2 hours ago' },
        { id: '2', type: 'TASK', title: 'Completed task "Review Q3 Roadmap"', timestamp: 'Yesterday' },
        { id: '3', type: 'RELEASE', title: 'Managed release v2.4.0', timestamp: '3 days ago' },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="flow-root">
                <ul className="-mb-8">
                    {activities.map((activity, activityIdx) => (
                        <li key={activity.id}>
                            <div className="relative pb-8">
                                {activityIdx !== activities.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.type === 'ENDORSEMENT' ? 'bg-purple-100 text-purple-600' :
                                            activity.type === 'RELEASE' ? 'bg-blue-100 text-blue-600' :
                                                'bg-green-100 text-green-600'
                                        }`}>
                                        <span className="text-xs font-bold">{activity.type[0]}</span>
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-500">{activity.title}</p>
                                        </div>
                                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                            <time>{activity.timestamp}</time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
