import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder type until Release types are fully defined in V2
interface LinkedRelease {
    id: string;
    version: string;
    name: string;
    status: string;
    relationship_type: string;
}

interface LinkedReleasesListProps {
    releases: LinkedRelease[];
    onLinkRelease?: () => void;
}

export const LinkedReleasesList: React.FC<LinkedReleasesListProps> = ({ releases, onLinkRelease }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Related Entities</h3>
                {onLinkRelease && (
                    <button
                        onClick={onLinkRelease}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        + Link
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {releases.length > 0 ? (
                    releases.map(release => (
                        <div key={release.id} className="border border-gray-200 rounded-md p-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        <Link to={`/releases/${release.id}`} className="hover:underline">
                                            🚀 {release.version} - {release.name}
                                        </Link>
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">Status: {release.status}</p>
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-50 px-1 rounded">
                                    {release.relationship_type}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500 italic">No linked releases</p>
                )}
            </div>
        </div>
    );
};
