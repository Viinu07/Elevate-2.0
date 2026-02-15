import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { Particles } from '../../shared/components/Particles';
import { fetchARTs } from '../../store/teamsSlice';
import { fetchVotingResults } from '../../store/collabSlice';

const SLIDES = [
    { id: 'welcome', title: 'Welcome to Elevate' },
    { id: 'what', title: 'What is Elevate?' },
    { id: 'teams', title: 'Track Your Teams' },
    { id: 'awards', title: 'Recognize Excellence' },
    { id: 'events', title: 'Stay Connected' },
    { id: 'feedback', title: 'Give Feedback' },
    { id: 'start', title: 'Get Started' }
];

export default function DashboardPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);

    // Get stats from Redux
    const arts = useSelector((state: RootState) => state.teams.arts);
    const votes = useSelector((state: RootState) => state.collab.awards.votes);
    const votingResults = useSelector((state: RootState) => state.collab.voting.results);
    const teamCount = arts.flatMap(art => art.teams).length;

    // Calculate total votes from voting results
    const totalVotes = votingResults
        ? Object.values(votingResults).reduce((total: number, category: any) => {
            const categoryTotal = category.top_3?.reduce((sum: number, nominee: any) => sum + (nominee.vote_count || 0), 0) || 0;
            return total + categoryTotal;
        }, 0)
        : votes.length;

    // Fetch data on mount for real-time counts
    useEffect(() => {
        dispatch(fetchARTs());
        dispatch(fetchVotingResults());
    }, [dispatch]);

    // Mouse drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);
        setCurrentX(e.clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setCurrentX(e.clientX);
    };

    const handleMouseUp = () => {
        if (!isDragging) return;

        const diff = startX - currentX;
        const threshold = 50; // Minimum drag distance to trigger slide change

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Dragged left - next slide
                setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
            } else {
                // Dragged right - previous slide
                setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
            }
        }

        setIsDragging(false);
        setStartX(0);
        setCurrentX(0);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    return (
        <div className="h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 relative transition-colors duration-500">
            {/* Particles Background */}
            <Particles />

            {/* Floating Background Elements (Enhanced for both themes) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Main Carousel Container */}
            <div
                className="relative z-10 h-full w-full flex items-center justify-center px-8 cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >

                {/* Slide Content */}
                <div className="w-full max-w-6xl">

                    {/* Slide 1: Welcome */}
                    {currentSlide === 0 && (
                        <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-12 transition-all duration-500 hover:bg-white/15 dark:hover:bg-black/20 hover:shadow-2xl hover:scale-[1.02]">
                            <div className="flex items-center justify-center gap-6 mb-8 group">
                                {/* Animated Logo with Fantasy Effects */}
                                <div className="relative">
                                    {/* Outer glow ring */}
                                    <div className="absolute inset-0 w-24 h-24 bg-gradient-to-tr from-blue-400 to-cyan-300 rounded-3xl blur-xl opacity-0 group-hover:opacity-70 transition-all duration-500 group-hover:scale-150"></div>

                                    {/* Rotating ring */}
                                    <div className="absolute inset-0 w-24 h-24 border-4 border-cyan-400/30 rounded-3xl group-hover:rotate-180 transition-transform duration-1000 group-hover:scale-125"></div>

                                    {/* Particle effects */}
                                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-cyan-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="absolute -top-2 -left-2 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.4s' }}></div>
                                    <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ animationDelay: '0.6s' }}></div>

                                    {/* Main logo */}
                                    <div className="relative w-24 h-24 bg-gradient-to-tr from-blue-400 to-cyan-300 rounded-3xl shadow-2xl flex items-center justify-center animate-in zoom-in duration-500 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 cursor-pointer">
                                        <svg
                                            width="48"
                                            height="48"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="group-hover:scale-125 transition-transform duration-500"
                                        >
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" className="group-hover:stroke-yellow-200 transition-colors duration-500" />
                                        </svg>

                                        {/* Inner sparkle */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                        </div>
                                    </div>

                                    {/* Floating sparkles */}
                                    <div className="absolute top-0 left-1/2 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-8 transition-all duration-700"></div>
                                    <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-y-8 transition-all duration-700" style={{ transitionDelay: '0.1s' }}></div>
                                    <div className="absolute top-1/2 left-0 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-x-8 transition-all duration-700" style={{ transitionDelay: '0.2s' }}></div>
                                    <div className="absolute top-1/2 right-0 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-x-8 transition-all duration-700" style={{ transitionDelay: '0.3s' }}></div>
                                </div>

                                <h1 className="text-7xl font-black text-slate-800 dark:text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-purple-300 transition-all duration-500 group-hover:scale-105 shadow-black/10 drop-shadow-lg">
                                    Elevate
                                </h1>
                            </div>
                            <p className="text-3xl text-slate-700 dark:text-blue-100 font-light animate-in fade-in duration-700 drop-shadow-md" style={{ animationDelay: '300ms' }}>
                                Your Team Excellence Platform
                            </p>
                            <div className="flex items-center justify-center gap-4 text-xl text-cyan-700 dark:text-cyan-300 animate-in fade-in duration-700 font-medium" style={{ animationDelay: '600ms' }}>
                                <span>Track</span>
                                <span className="text-slate-400 dark:text-white/50">•</span>
                                <span>Recognize</span>
                                <span className="text-slate-400 dark:text-white/50">•</span>
                                <span>Celebrate</span>
                            </div>
                        </div>
                    )}

                    {/* Slide 2: What is Elevate */}
                    {currentSlide === 1 && (
                        <div className="text-center space-y-12 animate-in fade-in slide-in-from-right-4 duration-700 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-12 transition-all duration-500 hover:bg-white/15 dark:hover:bg-black/20 hover:shadow-2xl hover:scale-[1.02]">
                            <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-8 drop-shadow-md">What is Elevate?</h2>
                            <p className="text-2xl text-slate-700 dark:text-blue-100 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
                                A comprehensive platform designed to help teams organize, recognize achievements, and stay connected.
                            </p>
                            <div className="grid grid-cols-3 gap-8 mt-12">
                                {[
                                    { icon: '👥', label: 'Organize Teams', delay: '0ms' },
                                    { icon: '🏆', label: 'Celebrate Wins', delay: '200ms' },
                                    { icon: '📅', label: 'Track Events', delay: '400ms' }
                                ].map((item, i) => (
                                    <div key={i} className="animate-in zoom-in duration-500" style={{ animationDelay: item.delay }}>
                                        <div className="text-6xl mb-4 drop-shadow-md">{item.icon}</div>
                                        <p className="text-lg text-cyan-700 dark:text-cyan-300 font-semibold">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Slide 3: Track Teams */}
                    {currentSlide === 2 && (
                        <div className="text-center space-y-12 animate-in fade-in slide-in-from-left-4 duration-700 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-12 transition-all duration-500 hover:bg-white/15 dark:hover:bg-black/20 hover:shadow-2xl hover:scale-[1.02]">
                            <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-8 drop-shadow-md">Track Your Teams</h2>
                            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-inner">
                                <div className="flex items-center justify-center gap-8 mb-8">
                                    <div className="text-center animate-in zoom-in duration-500">
                                        <div className="text-6xl font-black text-cyan-700 dark:text-cyan-300 drop-shadow-sm">{arts.length}</div>
                                        <div className="text-sm text-slate-600 dark:text-blue-200 uppercase tracking-wider mt-2 font-bold">ARTs</div>
                                    </div>
                                    <div className="text-4xl text-slate-400 dark:text-white/30">→</div>
                                    <div className="text-center animate-in zoom-in duration-500" style={{ animationDelay: '200ms' }}>
                                        <div className="text-6xl font-black text-blue-700 dark:text-blue-300 drop-shadow-sm">{teamCount}</div>
                                        <div className="text-sm text-slate-600 dark:text-blue-200 uppercase tracking-wider mt-2 font-bold">Teams</div>
                                    </div>
                                    <div className="text-4xl text-slate-400 dark:text-white/30">→</div>
                                    <div className="text-center animate-in zoom-in duration-500" style={{ animationDelay: '400ms' }}>
                                        <div className="text-6xl font-black text-purple-700 dark:text-purple-300 drop-shadow-sm">∞</div>
                                        <div className="text-sm text-slate-600 dark:text-blue-200 uppercase tracking-wider mt-2 font-bold">Members</div>
                                    </div>
                                </div>
                                <p className="text-xl text-slate-700 dark:text-blue-200">Visualize your entire organization at a glance</p>
                            </div>
                        </div>
                    )}

                    {/* Slide 4: Awards */}
                    {currentSlide === 3 && (
                        <div className="text-center space-y-12 animate-in fade-in zoom-in duration-700 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-12 transition-all duration-500 hover:bg-white/15 dark:hover:bg-black/20 hover:shadow-2xl hover:scale-[1.02]">
                            <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-8 drop-shadow-md">Recognize Excellence</h2>
                            <div className="flex items-end justify-center gap-8">
                                {/* Podium */}
                                <div className="text-center animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '400ms' }}>
                                    <div className="text-5xl mb-4 drop-shadow-md">🥈</div>
                                    <div className="w-32 h-40 bg-gradient-to-t from-slate-300 to-slate-100 dark:to-slate-300 rounded-t-2xl flex items-center justify-center shadow-lg">
                                        <span className="text-3xl font-black text-slate-700">2nd</span>
                                    </div>
                                </div>
                                <div className="text-center animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '200ms' }}>
                                    <div className="text-6xl mb-4 animate-bounce drop-shadow-md">🥇</div>
                                    <div className="w-32 h-56 bg-gradient-to-t from-amber-400 to-yellow-200 dark:to-yellow-400 rounded-t-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/30">
                                        <span className="text-4xl font-black text-amber-800">1st</span>
                                    </div>
                                </div>
                                <div className="text-center animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '600ms' }}>
                                    <div className="text-5xl mb-4 drop-shadow-md">🥉</div>
                                    <div className="w-32 h-32 bg-gradient-to-t from-orange-400 to-orange-200 dark:to-orange-400 rounded-t-2xl flex items-center justify-center shadow-lg">
                                        <span className="text-3xl font-black text-orange-900">3rd</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-2xl text-slate-700 dark:text-blue-200 mt-8 drop-shadow-sm">{totalVotes} votes cast across all awards</p>
                        </div>
                    )}

                    {/* Slide 5: Events */}
                    {currentSlide === 4 && (
                        <div className="text-center space-y-12 animate-in fade-in slide-in-from-top-4 duration-700 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-12 transition-all duration-500 hover:bg-white/15 dark:hover:bg-black/20 hover:shadow-2xl hover:scale-[1.02]">
                            <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-8 drop-shadow-md">Stay Connected</h2>
                            <div className="max-w-2xl mx-auto space-y-6">
                                {[
                                    { icon: '📅', title: 'Team Events', desc: 'Never miss important moments' },
                                    { icon: '🎉', title: 'Celebrations', desc: 'Recognize milestones together' },
                                    { icon: '🤝', title: 'Collaboration', desc: 'Build stronger connections' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 bg-white/40 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 animate-in slide-in-from-left-4 duration-500 hover:bg-white/60 dark:hover:bg-white/10 transition-colors" style={{ animationDelay: `${i * 150}ms` }}>
                                        <div className="text-5xl drop-shadow-md">{item.icon}</div>
                                        <div className="text-left">
                                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{item.title}</h3>
                                            <p className="text-slate-600 dark:text-blue-200">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Slide 6: Feedback */}
                    {currentSlide === 5 && (
                        <div className="text-center space-y-12 animate-in fade-in zoom-in duration-700 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-12 transition-all duration-500 hover:bg-white/15 dark:hover:bg-black/20 hover:shadow-2xl hover:scale-[1.02]">
                            <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-8 drop-shadow-md">Give Feedback</h2>
                            <div className="relative">
                                <div className="text-9xl animate-pulse drop-shadow-lg">💬</div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 bg-pink-500/30 rounded-full blur-2xl animate-ping"></div>
                                </div>
                            </div>
                            <p className="text-2xl text-slate-700 dark:text-blue-200 max-w-2xl mx-auto drop-shadow-sm">
                                Build a culture of appreciation with instant kudos and meaningful feedback
                            </p>
                        </div>
                    )}

                    {/* Slide 7: Get Started */}
                    {currentSlide === 6 && (
                        <div className="text-center space-y-12 animate-in fade-in zoom-in duration-700 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-12 transition-all duration-500 hover:bg-white/15 dark:hover:bg-black/20 hover:shadow-2xl hover:scale-[1.02]">
                            <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-8 drop-shadow-md">Ready to Explore?</h2>
                            <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                                {[
                                    { path: '/teams', icon: '👥', label: 'Teams', color: 'from-blue-500 to-cyan-400' },
                                    { path: '/awards', icon: '🏆', label: 'Awards', color: 'from-amber-500 to-orange-400' },
                                    { path: '/events', icon: '📅', label: 'Events', color: 'from-purple-500 to-pink-400' },
                                    { path: '/feedback', icon: '💬', label: 'Feedback', color: 'from-emerald-500 to-teal-400' },
                                    { path: '/releases', icon: '🚀', label: 'Releases', color: 'from-indigo-500 to-blue-400' },
                                    { path: '/admin', icon: '⚙️', label: 'Admin', color: 'from-slate-600 to-slate-400' }
                                ].map((item, i) => (
                                    <button
                                        key={item.path}
                                        onClick={() => navigate(item.path)}
                                        className="group bg-white/40 dark:bg-white/5 backdrop-blur-lg hover:bg-white/60 dark:hover:bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all hover:scale-105 hover:-translate-y-2 animate-in zoom-in duration-500"
                                        style={{ animationDelay: `${i * 100}ms` }}
                                    >
                                        <div className={`text-5xl mb-3 group-hover:scale-110 transition-transform drop-shadow-md`}>{item.icon}</div>
                                        <div className="text-lg font-bold text-slate-700 dark:text-white">{item.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {SLIDES.map((slide, index) => (
                    <button
                        key={slide.id}
                        onClick={() => goToSlide(index)}
                        className={`transition-all ${currentSlide === index
                            ? 'w-12 h-3 bg-slate-800 dark:bg-white'
                            : 'w-3 h-3 bg-slate-400/40 dark:bg-white/40 hover:bg-slate-800/60 dark:hover:bg-white/60'
                            } rounded-full shadow-sm`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Arrow Controls */}
            <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                className="absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all hover:scale-110 z-20 shadow-lg group"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-800 dark:text-white group-hover:scale-110 transition-transform" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                </svg>
            </button>
            <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/40 dark:bg-white/10 hover:bg-white/60 dark:hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all hover:scale-110 z-20 shadow-lg group"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-800 dark:text-white group-hover:scale-110 transition-transform" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                </svg>
            </button>
        </div>
    );
}
