import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../../../../api/v2/notifications';
import type { NotificationResponse } from '../../../../api/v2/types';
import { Bell } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
        // Poll for notifications every minute
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await notificationsAPI.list();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error('Failed to load notifications', err);
        }
    };

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await notificationsAPI.markRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read', err);
        }
    };



    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold text-center leading-none flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-20 border border-gray-200">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                                                <span className="text-xs text-gray-400 mt-1 block">
                                                    {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(e) => handleMarkRead(notification.id, e)}
                                                    className="ml-2 h-2 w-2 bg-blue-500 rounded-full hover:bg-blue-600"
                                                    title="Mark as read"
                                                ></button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                    No notifications yet.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
