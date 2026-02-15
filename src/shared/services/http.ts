
interface HttpOptions extends RequestInit {
    data?: any;
}

class HttpService {
    private async request<T>(url: string, options: HttpOptions = {}): Promise<T> {
        const { data, headers, ...customConfig } = options;
        const config: RequestInit = {
            ...customConfig,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            // Handle specific status codes here if needed
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || response.statusText);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    get<T>(url: string, options?: Omit<HttpOptions, 'body'>) {
        return this.request<T>(url, { ...options, method: 'GET' });
    }

    post<T>(url: string, data?: any, options?: Omit<HttpOptions, 'body'>) {
        return this.request<T>(url, { ...options, data, method: 'POST' });
    }

    put<T>(url: string, data?: any, options?: Omit<HttpOptions, 'body'>) {
        return this.request<T>(url, { ...options, data, method: 'PUT' });
    }

    delete<T>(url: string, options?: Omit<HttpOptions, 'body'>) {
        return this.request<T>(url, { ...options, method: 'DELETE' });
    }
}

export const http = new HttpService();
