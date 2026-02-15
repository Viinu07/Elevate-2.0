import React from 'react';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const getColors = (status: string) => {
        const s = status.toUpperCase();
        if (['LIVE', 'COMPLETED', 'DONE', 'PASS', 'PRODUCTION'].includes(s)) return 'bg-green-100 text-green-800';
        if (['IN_PROGRESS', 'DEVELOPMENT', 'TESTING', 'ON_TRACK'].includes(s)) return 'bg-blue-100 text-blue-800';
        if (['PLANNING', 'TODO', 'PENDING', 'UPCOMING'].includes(s)) return 'bg-gray-100 text-gray-800';
        if (['FAIL', 'BLOCKED', 'CANCELLED', 'RISK', 'HIGH'].includes(s)) return 'bg-red-100 text-red-800';
        if (['WARNING', 'MEDIUM', 'STAGING'].includes(s)) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-100 text-gray-800';
    };

    const classes = `inline-flex items-center font-medium rounded-full ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-sm'
        } ${getColors(status)}`;

    return (
        <span className={classes}>
            {status.replace('_', ' ')}
        </span>
    );
};
