import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Particles } from '@/shared/components/Particles';

// Define the 3 main sections
const featuredSections = [
    {
        id: 'awards',
        title: 'Awards',
        description: 'Recognition for excellence in design and innovation.',
        color: 'from-amber-200 to-yellow-400',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
        )
    },
    {
        id: 'events',
        title: 'Events',
        description: 'Join our global community at upcoming summits.',
        color: 'from-purple-200 to-indigo-400',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" /></svg>
        )
    },
    {
        id: 'happenings',
        title: 'Happenings',
        description: 'The latest updates, news, and company milestones.',
        color: 'from-emerald-200 to-teal-400',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /><path d="m15 5 3 3" /></svg>
        )
    },
];

export default function LandingPage() {
    const navigate = useNavigate();

    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full bg-[#fcfcfc] overflow-x-hidden selection:bg-indigo-500/10 relative">

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-50 p-4 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all duration-300 transform ${showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                    }`}
                aria-label="Scroll to top"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
            </button>

            {/* Hero Section */}
            <div className="h-screen w-full flex flex-col items-center justify-center relative">
                {/* Interactive Background */}
                <Particles />

                {/* Brand Section */}
                <div className="flex flex-col items-center gap-8 mb-16 z-10 relative">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl shadow-xl flex items-center justify-center text-white relative group cursor-pointer hover:scale-105 transition-transform duration-300">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                        </div>
                        <span className="text-6xl font-bold text-slate-900 tracking-tighter">Elevate</span>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                    >
                        Let's Explore
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                </div>

                {/* 3 Main Trade Cards */}
                <div className="w-full max-w-5xl px-4 z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredSections.map((section) => (
                        <div
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[32px] p-8 h-[400px] flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] group"
                        >
                            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${section.color} flex items-center justify-center text-slate-900 mb-6 group-hover:rotate-6 transition-transform`}>
                                {section.icon}
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">{section.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-light">{section.description}</p>
                            </div>

                            <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Containers */}
            <div id="awards" className="min-h-screen flex items-center justify-center bg-slate-50/50 relative py-20 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-4 block">Excellence</span>
                    <h2 className="text-5xl font-bold text-slate-900 mb-8">Our Awards</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-16">
                        Recognized by industry leaders for setting new standards in software delivery and team collaboration.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="text-4xl mb-4">🏆</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Best SaaS 2025</h3>
                            <p className="text-slate-500">TechCrunch Disrupt</p>
                        </div>
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <div className="text-4xl mb-4">⭐</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Design of the Year</h3>
                            <p className="text-slate-500">Awwwards</p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="events" className="min-h-screen flex items-center justify-center bg-white relative py-20 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="text-indigo-500 font-bold tracking-widest uppercase text-sm mb-4 block">Community</span>
                    <h2 className="text-5xl font-bold text-slate-900 mb-8">Upcoming Events</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-16">
                        Connect with developers, designers, and product leaders from around the globe.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-6 p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all text-left group">
                            <div className="w-16 h-16 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                                <span className="text-xs uppercase">Mar</span>
                                <span className="text-xl">14</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Elevate Summit 2026</h3>
                                <p className="text-slate-500">San Francisco, CA • In-person & Virtual</p>
                            </div>
                            <button className="px-6 py-2 rounded-full bg-slate-900 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Register</button>
                        </div>
                        <div className="flex items-center gap-6 p-6 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all text-left group">
                            <div className="w-16 h-16 bg-indigo-50 rounded-xl flex flex-col items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                                <span className="text-xs uppercase">Apr</span>
                                <span className="text-xl">02</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Product Design Workshop</h3>
                                <p className="text-slate-500">Live Webinar</p>
                            </div>
                            <button className="px-6 py-2 rounded-full bg-slate-900 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">Join</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="happenings" className="min-h-screen flex items-center justify-center bg-slate-50/50 relative py-20 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <span className="text-teal-500 font-bold tracking-widest uppercase text-sm mb-4 block">Updates</span>
                    <h2 className="text-5xl font-bold text-slate-900 mb-8">Happenings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        <div className="bg-white h-64 rounded-3xl border border-slate-100 p-8 flex flex-col justify-end text-left shadow-sm hover:-translate-y-2 transition-transform cursor-pointer relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Team" className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-20 text-white">
                                <span className="text-xs font-bold bg-teal-500 px-2 py-1 rounded mb-2 inline-block">New</span>
                                <h3 className="text-lg font-bold">Office Expansion</h3>
                            </div>
                        </div>
                        <div className="bg-white h-64 rounded-3xl border border-slate-100 p-8 flex flex-col justify-end text-left shadow-sm hover:-translate-y-2 transition-transform cursor-pointer relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                            <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80" alt="Tech" className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-20 text-white">
                                <h3 className="text-lg font-bold">Series B Funding</h3>
                            </div>
                        </div>
                        <div className="bg-white h-64 rounded-3xl border border-slate-100 p-8 flex flex-col justify-end text-left shadow-sm hover:-translate-y-2 transition-transform cursor-pointer relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80" alt="Meeting" className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-700" />
                            <div className="relative z-20 text-white">
                                <h3 className="text-lg font-bold">Q2 Roadmap</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 text-center text-slate-400 text-sm bg-white">
                <p>&copy; 2026 Elevate Improvise. All rights reserved.</p>
            </footer>
        </div >
    );
}
