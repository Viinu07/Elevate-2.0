import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '@/store';
import type { ReactNode } from 'react';

const queryClient = new QueryClient();

interface ProvidersProps {
    children: ReactNode;
}

export function AppProviders({ children }: ProvidersProps) {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    {children}
                </BrowserRouter>
            </QueryClientProvider>
        </Provider>
    );
}
