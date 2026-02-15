import { lazy, Suspense } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';
import { AppLayout } from '@/shared/components/AppLayout';
import { FantasySpinner } from '@/shared/components/FantasySpinner';

const ArtPage = lazy(() => import('@/modules/art/ArtPage'));
const TeamsPage = lazy(() => import('@/modules/teams/TeamsPage'));
const TeamDetailsPage = lazy(() => import('@/modules/teams/TeamDetailsPage'));
const ReleasesPage = lazy(() => import('@/modules/releases/ReleasesPage'));
const FeedbackPage = lazy(() => import('@/modules/feedback/FeedbackPage'));
const EventsPage = lazy(() => import('@/modules/events/EventsPage'));
const EventDetailsPage = lazy(() => import('@/modules/events/pages/EventDetailsPage').then(module => ({ default: module.EventDetailsPage })));

const AdminPage = lazy(() => import('@/modules/admin/AdminPage'));
const ProfilePage = lazy(() => import('@/modules/profile/ProfilePage'));
const AwardsPage = lazy(() => import('@/modules/collab/AwardsPage'));
const RecognitionWall = lazy(() => import('@/modules/recognition/components/v2/RecognitionWall').then(module => ({ default: module.RecognitionWall })));
const ReleaseDetailsPageV2 = lazy(() => import('@/modules/releases/components/v2/ReleaseDetailsPage').then(module => ({ default: module.ReleaseDetailsPage })));
const AnalyticsDashboard = lazy(() => import('@/modules/analytics/components/v2/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));
const UserProfilePage = lazy(() => import('@/modules/profile/pages/UserProfilePage').then(module => ({ default: module.UserProfilePage })));
const AdvancedAnalyticsPage = lazy(() => import('@/modules/analytics/pages/AdvancedAnalyticsPage').then(module => ({ default: module.AdvancedAnalyticsPage })));
const SearchResultsPage = lazy(() => import('@/modules/search/pages/SearchResultsPage').then(module => ({ default: module.SearchResultsPage })));
const LiveFeedDashboard = lazy(() => import('@/modules/dashboard/LiveFeedDashboard').then(module => ({ default: module.LiveFeedDashboard })));

export function AppRoutes() {
    const element = useRoutes([
        {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
        },
        {
            element: <AppLayout />,
            children: [
                { path: 'dashboard', element: <LiveFeedDashboard /> },
                { path: 'search', element: <SearchResultsPage /> },
                { path: 'art', element: <ArtPage /> },
                { path: 'teams', element: <TeamsPage /> },
                { path: 'teams/:teamId', element: <TeamDetailsPage /> },
                { path: 'releases', element: <ReleasesPage /> },
                { path: 'releases/:id', element: <ReleaseDetailsPageV2 /> },
                { path: 'analytics', element: <AnalyticsDashboard /> },
                { path: 'profile/:userId', element: <UserProfilePage /> },
                { path: 'analytics/advanced', element: <AdvancedAnalyticsPage /> },
                { path: 'analytics/advanced', element: <AdvancedAnalyticsPage /> },
                { path: 'feedback', element: <FeedbackPage /> },
                { path: 'events', element: <EventsPage /> },
                { path: 'events/:id', element: <EventDetailsPage /> },
                { path: 'admin', element: <AdminPage /> },
                { path: 'profile', element: <ProfilePage /> },
                { path: 'awards', element: <AwardsPage /> },
                { path: 'recognition', element: <RecognitionWall /> },
            ],
        },
        { path: '*', element: <Navigate to="/" replace /> },
    ]);

    return (
        <Suspense fallback={
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <FantasySpinner size={80} color="#3b82f6" />
            </div>
        }>
            {element}
        </Suspense>
    );
}
