import React, { useEffect, useState } from 'react';
import { profilesAPI } from '@/api/v2/profiles';
import type { UserProfileFullResponse } from '@/api/v2/types';
import { ActivityFeed } from '../components/v2/ActivityFeed';

export const UserProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfileFullResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profilesAPI.getMe();
                setProfile(data);
            } catch (err) {
                console.error('Failed to load profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">Profile not found</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex justify-between items-end -mt-12 mb-4">
                        <div className="flex items-end">
                            <img
                                className="h-24 w-24 rounded-2xl ring-4 ring-white shadow-lg bg-white"
                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`}
                                alt={profile.name}
                            />
                            <div className="ml-4 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                                <p className="text-sm text-gray-500">{profile.profile?.title || 'Team Member'} • {profile.profile?.department || 'Engineering'}</p>
                            </div>
                        </div>
                        <div className="text-right mb-1">
                            <div className="text-3xl font-bold text-indigo-600">{profile.impact_score}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Impact Score</div>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-6 max-w-2xl">
                        {profile.profile?.bio || 'No bio provided yet.'}
                    </p>

                    <div className="flex gap-2 mb-6">
                        {profile.profile?.skills?.map((skill: string) => (
                            <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"> # {skill} </span>
                        ))}
                        {(!profile.profile?.skills || profile.profile.skills.length === 0) && (
                            <span className="text-sm text-gray-400 italic">No skills listed</span>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                        <div className="text-center">
                            <span className="block text-2xl font-bold text-gray-900">{profile.endorsements_count}</span>
                            <span className="text-xs text-gray-500">Endorsements</span>
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <span className="block text-2xl font-bold text-gray-900">{profile.work_items_count}</span>
                            <span className="text-xs text-gray-500">Work Items</span>
                        </div>
                        <div className="text-center border-l border-gray-100">
                            <span className="block text-2xl font-bold text-gray-900">{profile.tasks_count}</span>
                            <span className="text-xs text-gray-500">Tasks</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <ActivityFeed />
                    </div>
                </div>
                <div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Joined</span>
                                <span className="text-gray-900">{new Date(profile.profile?.joined_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Location</span>
                                <span className="text-gray-900">{profile.profile?.location || 'Remote'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Social</span>
                                <span className="text-gray-900">-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
