import { AppProviders } from './providers';
import { AppRoutes } from './routes';
import '@/styles/global.css';

export default function App() {
    return (
        <AppProviders>
            <AppRoutes />
        </AppProviders>
    );
}
