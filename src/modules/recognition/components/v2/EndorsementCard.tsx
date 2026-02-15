import React from 'react';
import { Calendar } from 'lucide-react';
import type { EndorsementResponse } from '../../../../api/v2/types';

interface EndorsementCardProps {
    endorsement: EndorsementResponse;
}

const categoryColors: Record<string, string> = {
    'Innovation': 'bg-purple-100 text-purple-800 border-purple-200',
    'Teamwork': 'bg-blue-100 text-blue-800 border-blue-200',
    'Leadership': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Excellence': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Integrity': 'bg-green-100 text-green-800 border-green-200',
};

export const EndorsementCard: React.FC<EndorsementCardProps> = ({ endorsement }) => {
    const colorClass = categoryColors[endorsement.category] || 'bg-gray-100 text-gray-800 border-gray-200';
    const isEventAward = !!endorsement.event_name;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {endorsement.giver_name.charAt(0)}
                    </div>
                    <span className="text-gray-500 text-sm">➜</span>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {endorsement.receiver_name.charAt(0)}
                    </div>

                    <div className="flex flex-col ml-2">
                        <span className="text-sm font-medium text-gray-900">
                            {endorsement.receiver_name}
                        </span>
                        <span className="text-xs text-gray-500">
                            from {endorsement.giver_name}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 items-end">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                        {endorsement.category}
                    </span>
                    {isEventAward && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                            <Calendar size={12} />
                            Event Award
                        </span>
                    )}
                </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">
                "{endorsement.message}"
            </p>

            {isEventAward && (
                <div className="mt-2 px-3 py-1.5 bg-amber-50/50 border border-amber-100 rounded-lg">
                    <p className="text-xs text-amber-700">
                        <span className="font-semibold">Awarded at:</span> {endorsement.event_name}
                    </p>
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                    {new Date(endorsement.created_at).toLocaleDateString()}
                </span>
                <button className="text-xs text-gray-400 hover:text-red-500">
                    ♥ Layak
                </button>
            </div>
        </div>
    );
};
