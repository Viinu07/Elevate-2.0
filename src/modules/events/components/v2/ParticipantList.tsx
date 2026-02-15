import React from 'react';
import { ParticipantResponse, RSVPStatus } from '../../../../api/v2/types';

interface ParticipantListProps {
    participants: ParticipantResponse[];
    onAddParticipant?: () => void;
}

const rsvpColors: Record<string, string> = {
    [RSVPStatus.ACCEPTED]: 'bg-green-100 text-green-800',
    [RSVPStatus.DECLINED]: 'bg-red-100 text-red-800',
    [RSVPStatus.TENTATIVE]: 'bg-yellow-100 text-yellow-800',
    [RSVPStatus.PENDING]: 'bg-gray-100 text-gray-800',
};

export const ParticipantList: React.FC<ParticipantListProps> = ({ participants, onAddParticipant }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Participants ({participants.length})</h3>
                {onAddParticipant && (
                    <button
                        onClick={onAddParticipant}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        + Add
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {participants.map(p => (
                    <div key={p.id} className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 mr-3">
                                {p.user_name.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-900">{p.user_name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rsvpColors[p.rsvp_status] || 'bg-gray-100'}`}>
                            {p.rsvp_status}
                        </span>
                    </div>
                ))}
                {participants.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No participants yet</p>
                )}
            </div>
        </div>
    );
};
