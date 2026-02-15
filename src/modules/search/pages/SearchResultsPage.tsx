import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAPI } from '../../../../api/v2/search';
import type { SearchResult } from '../../../../api/v2/types';
import { SearchResultType } from '../../../../api/v2/types';
import { Loader2 } from 'lucide-react';

export const SearchResultsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const data = await searchAPI.search(query);
                setResults(data);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    const getTypeColor = (type: SearchResultType) => {
        switch (type) {
            case SearchResultType.RELEASE: return 'bg-blue-100 text-blue-700';
            case SearchResultType.WORK_ITEM: return 'bg-indigo-100 text-indigo-700';
            case SearchResultType.TASK: return 'bg-green-100 text-green-700';
            case SearchResultType.EVENT: return 'bg-amber-100 text-amber-700';
            case SearchResultType.USER: return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Results</h1>
            <p className="text-gray-500 mb-8">Showing results for <span className="font-semibold text-gray-900">"{query}"</span></p>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No results found for "{query}"</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {results.map((result) => (
                            <li key={`${result.type}-${result.id}`}>
                                <Link to={result.url} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-medium text-blue-600 truncate">
                                                {result.title}
                                            </div>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(result.type)}`}>
                                                    {result.type}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                {result.subtitle && (
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        {result.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
