
const getBaseUrl = () => {
    // In production (Render), VITE_API_URL might be provided by the backend service link
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
        if (apiUrl.startsWith('/')) {
            return `${apiUrl}/v1`;
        }
        // If it's just a hostname (from Render 'host' property), add https://
        if (!apiUrl.startsWith('http')) {
            return `https://${apiUrl}/api/v1`;
        }
        return `${apiUrl}/api/v1`;
    }
    // Default for local development (uses Vite proxy)
    return '/api/v1';
};

const BASE_URL = getBaseUrl();

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number>;
}

class FetchClient {
    private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        const { params, ...init } = options;

        let url = `${BASE_URL}${endpoint}`;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                searchParams.append(key, String(value));
            });
            url += `?${searchParams.toString()}`;
        }

        const token = localStorage.getItem('token');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(init.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...init,
            headers,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
        }

        // Handle empty responses (e.g. 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    get<T>(endpoint: string, params?: Record<string, string | number>) {
        return this.request<T>(endpoint, { method: 'GET', params });
    }

    post<T>(endpoint: string, body: unknown, options?: FetchOptions) {
        return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options });
    }

    put<T>(endpoint: string, body: unknown) {
        return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
    }

    patch<T>(endpoint: string, body?: unknown) {
        return this.request<T>(endpoint, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
    }

    delete<T>(endpoint: string) {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new FetchClient();
