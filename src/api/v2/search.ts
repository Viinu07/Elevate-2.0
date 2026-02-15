import v2Client from './client';
import type { SearchResult } from './types';

export const searchAPI = {
    search: async (query: string): Promise<SearchResult[]> => {
        const response = await v2Client.get(`/search/?q=${encodeURIComponent(query)}`);
        return response.data;
    }
};
