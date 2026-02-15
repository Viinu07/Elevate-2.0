
const getBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
        if (!apiUrl.startsWith('http')) {
            return `https://${apiUrl}/api/v2`;
        }
        return `${apiUrl}/api/v2`;
    }
    return '/api/v2';
};

const BASE_URL = getBaseUrl();

interface FetchConfig extends RequestInit {
    params?: Record<string, string | number | undefined>;
}

interface AxiosLikeResponse<T> {
    data: T;
    status: number;
    statusText: string;
}

class V2Client {
    private async request<T>(endpoint: string, options: FetchConfig = {}): Promise<AxiosLikeResponse<T>> {
        const { params, ...init } = options;

        let url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}${searchParams.toString()}`;
        }

        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(init.headers as Record<string, string>),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            ...init,
            headers,
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized
            if (response.status === 401) {
                console.warn('Unauthorized access to V2 API');
                // Optional: Redirect to login
            }

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const errorMessage = errorBody.detail || errorBody.message || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return {
                    data: {} as T,
                    status: response.status,
                    statusText: response.statusText
                };
            }

            const data = await response.json();
            return {
                data,
                status: response.status,
                statusText: response.statusText
            };

        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    get<T>(url: string, config?: FetchConfig) {
        return this.request<T>(url, { method: 'GET', ...config });
    }

    post<T>(url: string, data?: any, config?: FetchConfig) {
        return this.request<T>(url, { method: 'POST', body: JSON.stringify(data), ...config });
    }

    put<T>(url: string, data?: any, config?: FetchConfig) {
        return this.request<T>(url, { method: 'PUT', body: JSON.stringify(data), ...config });
    }

    delete<T>(url: string, config?: FetchConfig) {
        return this.request<T>(url, { method: 'DELETE', ...config });
    }

    patch<T>(url: string, data?: any, config?: FetchConfig) {
        return this.request<T>(url, { method: 'PATCH', body: JSON.stringify(data), ...config });
    }
}

const v2Client = new V2Client();
export default v2Client;
