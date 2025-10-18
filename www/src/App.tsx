import React, { useState, useEffect, useRef } from 'react';
// Chart.js library is loaded via CDN in the environment, so we don't import it directly.

// --- TypeScript Interfaces ---

interface Event {
    id: string;
    title: string;
    category: string;
    date: string;
    organizer?: string;
    status?: 'Active' | 'Approved' | 'Rejected';
    statusClass?: string;
}

interface CategoryData {
    [key: string]: number;
}

interface AnalyticsData {
    dailySignups: number[];
    categories: CategoryData;
}

// --- MOCK DATA ---
const API_BASE_URL: string = 'http://localhost:3000'; // Target the Node.js API (No longer used for login)

const MOCK_ANALYTICS: AnalyticsData = {
    dailySignups: [20, 25, 30, 15, 40, 45, 35, 50, 60, 48, 32, 28, 55, 62, 70, 58, 42, 35, 50, 60, 75, 80, 65, 50, 40, 30, 25, 35, 45, 55],
    categories: {
        'Education': 220,
        'Volunteering': 180,
        'Fitness & Health': 300,
        'Arts & Culture': 150,
        'Technology': 90
    }
};

const INITIAL_PENDING_EVENTS: Event[] = [
    { id: 'p1', title: 'Late Night Coding Session (MERN)', category: 'Technology', date: '2025-11-10', organizer: 'Dev Guy' },
    { id: 'p2', title: 'Local Dog Walking Meetup', category: 'Fitness & Health', date: '2025-11-05', organizer: 'Jane Doe' },
    { id: 'p3', title: 'Financial Literacy Workshop', category: 'Education', date: '2025-11-12', organizer: 'Smart Money Inc.' }
];

const MANAGED_EVENTS: Event[] = [
    { id: 'm1', title: 'Local Study Group - Algebra II', status: 'Active', statusClass: 'bg-blue-100 text-blue-800' },
    { id: 'm2', title: 'Community Garden Planting Day', status: 'Approved', statusClass: 'bg-green-100 text-green-800' },
    { id: 'm3', title: 'Weekly Running Club Meetup', status: 'Active', statusClass: 'bg-blue-100 text-blue-800' },
];

// --- Sub-Components ---

interface UserTrendChartProps {
    data: number[];
}

/**
 * Chart component for displaying Line Chart (User Trend).
 * Uses useRef and useEffect to integrate Chart.js.
 */
const UserTrendChart: React.FC<UserTrendChartProps> = ({ data }) => {
    // Specify the ref type for a canvas element
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // Ref for the Chart.js instance itself
    const chartInstance = useRef<any>(null); // Use any for Chart.js instance as its type is complex

    useEffect(() => {
        if (!canvasRef.current) return;
        
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const dates: string[] = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d.toISOString().split('T')[0].substring(5); // Format MM-DD
        });

        // Ensure window.Chart is available before instantiation
        if (window.Chart) {
            chartInstance.current = new (window as any).Chart(canvasRef.current, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'New Signups',
                        data: data,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { type: 'category', title: { display: true, text: 'Day' } },
                        y: { beginAtZero: true, title: { display: true, text: 'Users' } }
                    }
                }
            });
        }


        // Cleanup function
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">User Sign-up Trend (Past 30 Days)</h3>
            <p className="text-sm text-gray-500 mb-4">Tracks daily user acquisition, indicating marketing effectiveness and platform growth velocity.</p>
            <div className="chart-container h-[350px]">
                <canvas ref={canvasRef} id="userTrendChart"></canvas>
            </div>
        </div>
    );
};

interface CategoryChartProps {
    categories: CategoryData;
}

/**
 * Chart component for displaying Doughnut Chart (Category Distribution).
 * Uses useRef and useEffect to integrate Chart.js.
 */
const CategoryChart: React.FC<CategoryChartProps> = ({ categories }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        if (window.Chart) {
            chartInstance.current = new (window as any).Chart(canvasRef.current, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categories),
                    datasets: [{
                        data: Object.values(categories),
                        backgroundColor: ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#06b6d4'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            });
        }

        // Cleanup function
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [categories]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Event Category Distribution</h3>
            <p className="text-sm text-gray-500 mb-4">Shows the composition of all events, identifying popular and underserved niche categories.</p>
            <div className="chart-container h-[350px]">
                <canvas ref={canvasRef} id="categoryChart"></canvas>
            </div>
        </div>
    );
};

interface AnalyticsViewProps {
    pendingCount: number;
}

/**
 * Main Analytics View component
 */
const AnalyticsView: React.FC<AnalyticsViewProps> = ({ pendingCount }) => (
    <div id="analytics-view" className="view-content space-y-8">
        <p className="text-gray-600">This section provides a data-driven overview of the platform's health, user engagement, and content distribution, crucial for strategic decision-making.</p>
        
        {/* Kicker Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Total Approved Events</p>
                <p className="text-4xl font-bold text-slate-800 mt-1">1,240</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Total Registered Users</p>
                <p className="text-4xl font-bold text-slate-800 mt-1">8,950</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <p className="text-sm font-medium text-gray-500">Pending Submissions</p>
                <p className="text-4xl font-bold text-red-600 mt-1">{pendingCount}</p>
            </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <UserTrendChart data={MOCK_ANALYTICS.dailySignups} />
            <CategoryChart categories={MOCK_ANALYTICS.categories} />
        </div>
    </div>
);

interface EventCardProps {
    event: Event;
    onAction: (id: string, action: 'approve' | 'reject') => void;
}

/**
 * Event Moderation Card component
 */
const EventCard: React.FC<EventCardProps> = ({ event, onAction }) => (
    <div className="bg-white p-5 rounded-xl shadow-md border border-yellow-200 flex justify-between items-start">
        <div>
            <h4 className="text-xl font-bold text-slate-800">{event.title}</h4>
            <p className="text-sm text-gray-500 mt-1">Category: {event.category} | Date: {event.date}</p>
            <p className="text-sm text-gray-500">Organizer: {event.organizer}</p>
        </div>
        <div className="flex space-x-2 mt-1">
            <button 
                onClick={() => onAction(event.id, 'approve')}
                className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-green-600 transition duration-150"
            >
                Approve
            </button>
            <button 
                onClick={() => onAction(event.id, 'reject')}
                className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-600 transition duration-150"
            >
                Reject
            </button>
        </div>
    </div>
);

interface ModerationViewProps {
    pendingEvents: Event[];
    setPendingEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

/**
 * Event Moderation View component
 */
const ModerationView: React.FC<ModerationViewProps> = ({ pendingEvents, setPendingEvents }) => {
    
    // Handler to remove event from list upon approval/rejection
    const handleModerationAction = (id: string, action: 'approve' | 'reject') => {
        // In a real app, this would be an API call to the backend.
        console.log(`Simulating ${action} for event ${id}.`);
        
        // Optimistic UI update: remove the event from local state
        setPendingEvents(prevEvents => prevEvents.filter(e => e.id !== id));
    };

    return (
        <div id="moderation-view" className="view-content space-y-6">
            <p className="text-gray-600">This dedicated moderation queue is where you approve or reject new event submissions, ensuring all content aligns with community guidelines before going live on the mobile app.</p>
            
            {pendingEvents.length > 0 ? (
                <div id="moderation-list" className="space-y-4">
                    {pendingEvents.map(event => (
                        <EventCard key={event.id} event={event} onAction={handleModerationAction} />
                    ))}
                </div>
            ) : (
                <div id="moderation-empty" className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-200">
                    <p className="text-2xl font-bold text-green-600">🎉 All clear!</p>
                    <p className="text-gray-500 mt-2">No pending events requiring moderation at this time.</p>
                </div>
            )}
        </div>
    );
};

/**
 * My Managed Events View component
 */
const MyEventsView: React.FC = () => (
    <div id="my-events-view" className="view-content space-y-6">
        <p className="text-gray-600">This view lists all events you have personally created and manage. From here, you can quickly see event status, edit details, or view attendance reports for your specific submissions.</p>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Your Active Events</h3>
            <ul className="space-y-3 text-slate-700">
                {MANAGED_EVENTS.map(event => (
                    <li key={event.id} className="flex justify-between items-center border-b pb-2">
                        <span>{event.title}</span>
                        <span className={`text-sm ${event.statusClass} px-3 py-1 rounded-full`}>{event.status}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

type ViewName = 'analytics' | 'moderation' | 'my-events';

/**
 * Main App Component
 */
const App: React.FC = () => {
    // State Management for Authentication and Navigation
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<ViewName>('analytics');
    const [loginMessage, setLoginMessage] = useState<string>('');
    const [email, setEmail] = useState<string>('org@example.com'); // Pre-filled for convenience
    const [password, setPassword] = useState<string>('password123'); // Pre-filled for convenience
    const [authToken, setAuthToken] = useState<string | null>(null);

    // State for Moderation Queue
    const [pendingEvents, setPendingEvents] = useState<Event[]>(INITIAL_PENDING_EVENTS);

    // Dynamic Title for Header
    const viewTitleMap: Record<ViewName, string> = {
        'analytics': 'Analytics Dashboard',
        'moderation': 'Event Moderation',
        'my-events': 'My Managed Events'
    };
    const title = viewTitleMap[currentView];

    // Handle user login - Modified for 'login with anything' for easy testing
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginMessage('Logging in...');
        
        // For development/testing, any non-empty input is accepted.
        if (email.trim() !== '' && password.trim() !== '') {
            // Simulate network latency
            setTimeout(() => {
                setAuthToken('DEV_MOCK_TOKEN_' + Math.random().toString(36).substring(2, 9));
                setIsAuthenticated(true);
                setLoginMessage('');
            }, 500); 
        } else {
            setLoginMessage('Please enter an email and password.');
        }
    };

    // Handle user logout
    const handleLogout = () => {
        setIsAuthenticated(false);
        setAuthToken(null);
        setCurrentView('analytics'); // Reset view on logout
        setLoginMessage('');
    };

    // Conditional Rendering of Main View Content
    const renderView = (): JSX.Element => {
        switch (currentView) {
            case 'analytics':
                return <AnalyticsView pendingCount={pendingEvents.length} />;
            case 'moderation':
                return <ModerationView pendingEvents={pendingEvents} setPendingEvents={setPendingEvents} />;
            case 'my-events':
                return <MyEventsView />;
            default:
                return <AnalyticsView pendingCount={pendingEvents.length} />;
        }
    };

    // The Dashboard HTML requires a minimal container setup.
    return (
        <div className="bg-gray-100 min-h-screen flex">
            
            {/* Login Screen (Conditional) */}
            {!isAuthenticated && (
                <div id="login-screen" className="absolute inset-0 z-50 flex items-center justify-center bg-gray-50 transition-opacity duration-300">
                    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
                        <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Admin Login</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={email} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    value={password} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
                                    required 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>
                            <button type="submit" className="w-full py-2.5 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200">
                                Sign In
                            </button>
                            {loginMessage && (
                                <div className="mt-4 text-center text-red-500 text-sm">
                                    {loginMessage}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Main Dashboard Layout (Conditional) */}
            {isAuthenticated && (
                <div id="dashboard-layout" className="w-full flex">
                    
                    {/* Sidebar Navigation */}
                    <nav className="hidden md:block w-64 bg-slate-800 text-white flex-shrink-0 min-h-screen p-4 shadow-xl">
                        <div className="text-2xl font-bold mb-8 text-blue-400">Admin Panel</div>
                        <ul className="space-y-2">
                            {Object.keys(viewTitleMap).map((viewId) => (
                                <li key={viewId}>
                                    <button 
                                        data-view={viewId} 
                                        onClick={() => setCurrentView(viewId as ViewName)}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition duration-150 ${currentView === viewId ? 'bg-blue-600 font-semibold' : 'hover:bg-slate-700'}`}
                                    >
                                        <span className="text-xl">
                                            {viewId === 'analytics' ? '📊' : viewId === 'moderation' ? '📝' : '🗓️'}
                                        </span>
                                        <span>
                                            {viewTitleMap[viewId as ViewName]}
                                            {viewId === 'moderation' && (
                                                <span className="ml-2 font-bold">({pendingEvents.length})</span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button 
                            id="logout-button" 
                            onClick={handleLogout}
                            className="w-full py-2.5 mt-8 border border-slate-700 text-slate-400 font-semibold rounded-lg hover:bg-slate-700 transition duration-200"
                        >
                            Log Out
                        </button>
                    </nav>

                    {/* Main Content Area */}
                    <div className="flex-grow p-4 md:p-8 overflow-y-auto">
                        <header className="mb-8 flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
                        </header>

                        {/* Render the selected view */}
                        {renderView()}

                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
