import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { searchAPI } from '../../api/v2/search';
import type { SearchResult } from '../../api/v2/types';
import { SearchResultType } from '../../api/v2/types';

export const GlobalSearchBar: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const data = await searchAPI.search(query);
                    setResults(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);
        setQuery('');
        navigate(result.url);
    };

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
        <div ref={wrapperRef} className="relative w-full max-w-md">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
                    placeholder="Search anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {loading ? (
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : query.length > 0 ? (
                        <button onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}>
                            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    ) : null}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <ul>
                        {results.map((result) => (
                            <li
                                key={`${result.type}-${result.id}`}
                                onClick={() => handleSelect(result)}
                                className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0">
                                        <span className={`flex-shrink-0 inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${getTypeColor(result.type)}`}>
                                            {result.type}
                                        </span>
                                        <p className="ml-3 text-sm font-medium text-gray-900 truncate">
                                            {result.title}
                                        </p>
                                    </div>
                                </div>
                                {result.subtitle && (
                                    <p className="mt-1 ml-12 text-xs text-gray-500 truncate">
                                        {result.subtitle}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <div className="px-4 py-2 bg-slate-50 text-xs text-center text-gray-500 border-t border-gray-100">
                        Press Enter to see all results
                    </div>
                </div>
            )}
        </div>
    );
};
