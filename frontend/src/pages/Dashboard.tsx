import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Play, Upload as UploadIcon, LogOut } from 'lucide-react';
import UploadModal from '../components/UploadModal';

interface Video {
    _id: string;
    title: string;
    status: string;
    sensitivity: string;
    processingProgress: number;
    duration: number;
    size: number;
    createdAt: string;
    category?: string;
    uploader: {
        username: string;
    };
}

const Dashboard = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const [showUpload, setShowUpload] = useState(false);

    // Advanced Filtering States
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('newest');
    const [category, setCategory] = useState('all');

    useEffect(() => {
        fetchVideos();
    }, [filter, sort, category]);

    useEffect(() => {
        if (!socket) return;

        socket.on('video:queued', () => {
            fetchVideos();
        });

        socket.on('video:progress', (data: { videoId: string, progress: number, status: string }) => {
            setVideos(prev => prev.map(v =>
                v._id === data.videoId ? { ...v, status: data.status, processingProgress: data.progress } : v
            ));
        });

        socket.on('video:completed', (data: { videoId: string, status: string, sensitivity: string }) => {
            setVideos(prev => prev.map(v =>
                v._id === data.videoId ? { ...v, status: data.status, sensitivity: data.sensitivity, processingProgress: 100 } : v
            ));
        });

        return () => {
            socket.off('video:queued');
            socket.off('video:progress');
            socket.off('video:completed');
        };
    }, [socket]);

    const fetchVideos = async () => {
        try {
            const { data } = await api.get(`/videos?sensitivity=${filter}&sort=${sort}&category=${category}`);
            setVideos(data);
        } catch (err) {
            console.error(err);
        }
    };

    const isEditor = user?.roles.includes('editor') || user?.roles.includes('admin');

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        if (window.confirm('Are you sure you want to delete this video?')) {
            try {
                await api.delete(`/videos/${id}`);
                setVideos(prev => prev.filter(v => v._id !== id));
            } catch (err) {
                console.error(err);
                alert('Failed to delete video');
            }
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden transition-all duration-500">
            {/* Decoration Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            {/* Top Navigation */}
            <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <Play size={22} className="text-white fill-current ml-0.5" />
                                </div>
                                <span className="font-bold text-xl text-slate-800 tracking-tight">StreamFlow</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-sm font-semibold text-slate-700">{user?.username}</span>
                                <span className="text-xs text-indigo-600 uppercase tracking-wider font-bold bg-indigo-50 px-2 py-0.5 rounded-full">{user?.roles[0]}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2.5 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 hover:shadow-md"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 glass-panel p-6 rounded-3xl bg-white/40 backdrop-blur-lg border border-white/40 shadow-xl">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Video Library</h1>
                        <p className="mt-2 text-slate-600 font-medium">Manage and organize your creative content</p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Filter Controls */}
                        <div className="flex items-center gap-2">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-white/50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none shadow-sm cursor-pointer hover:bg-white/80 transition-colors"
                            >
                                <option value="all">All Categories</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Education">Education</option>
                                <option value="Music">Music</option>
                                <option value="Vlog">Vlog</option>
                                <option value="Tech">Tech</option>
                                <option value="General">General</option>
                            </select>

                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="bg-white/50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none shadow-sm cursor-pointer hover:bg-white/80 transition-colors"
                            >
                                <option value="all">All content</option>
                                <option value="safe">Safe Only</option>
                                <option value="flagged">Flagged Only</option>
                            </select>

                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="bg-white/50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none shadow-sm cursor-pointer hover:bg-white/80 transition-colors"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="size_desc">Largest Size</option>
                                <option value="size_asc">Smallest Size</option>
                            </select>
                        </div>

                        {isEditor && (
                            <button
                                onClick={() => setShowUpload(true)}
                                className="inline-flex items-center px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 gap-2.5"
                            >
                                <UploadIcon size={20} />
                                Upload
                            </button>
                        )}
                    </div>
                </div>

                {/* Video Grid */}
                {videos.length === 0 ? (
                    <div className="text-center py-24 bg-white/50 backdrop-blur-md rounded-3xl border border-white/50 shadow-lg">
                        <div className="mx-auto h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <Play size={40} className="text-indigo-400 ml-1" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">No videos yet</h3>
                        <p className="mt-2 text-slate-500 max-w-sm mx-auto">Your library is currently empty. Upload your first video to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {videos.map((video) => (
                            <div key={video._id} className="group bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-2xl hover:bg-white/90 transition-all duration-300 transform hover:-translate-y-1 flex flex-col relative">
                                {/* Thumbnail/Status Area */}
                                <div className="aspect-video bg-slate-200 relative overflow-hidden group-hover:shadow-inner">
                                    {video.status === 'processed' ? (
                                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center group">
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-indigo-900 to-purple-800 mix-blend-overlay"></div>

                                            <Link to={`/videos/${video._id}`} className="relative z-10 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20 shadow-xl">
                                                <Play size={28} className="ml-1 fill-white" />
                                            </Link>
                                            <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg text-[10px] text-white font-bold tracking-wider">
                                                HD
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-50">
                                            <div className="w-full max-w-[120px] mb-4">
                                                {video.status === 'processing' ? (
                                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${video.processingProgress}%` }}></div>
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 text-slate-300 mx-auto animate-pulse">
                                                        <UploadIcon size={48} strokeWidth={1} />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{video.status}</span>
                                            {video.status === 'processing' && <span className="text-xs text-slate-500 mt-1 font-mono">{Math.round(video.processingProgress)}%</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-slate-800 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors" title={video.title}>
                                                {video.title || 'Untitled Video'}
                                            </h3>

                                            {/* Delete Button (Only for Editors/Admins) */}
                                            {isEditor && (
                                                <button
                                                    onClick={(e) => handleDelete(e, video._id)}
                                                    className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                                                    title="Delete Video"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="text-xs text-slate-400 mt-1 flex flex-col gap-1">
                                            <span className="flex items-center gap-1">
                                                <span className="font-medium text-slate-500">By {(video as any).uploader?.username || 'Unknown'}</span>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-indigo-500 font-medium">{video.category || 'General'}</span>
                                            </span>
                                            <span>Added {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100/50">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${video.sensitivity === 'safe' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    video.sensitivity === 'flagged' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                }`}>
                                                {video.sensitivity === 'safe' ? 'Safe' :
                                                    video.sensitivity === 'flagged' ? 'Flagged' : 'Pending'}
                                            </span>
                                        </div>
                                        {/* File Size Indicator */}
                                        <span className="text-[10px] font-mono text-slate-400">
                                            {(video.size / 1024 / 1024).toFixed(1)} MB
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => { fetchVideos(); setShowUpload(false); }} />}
            </main>
        </div>
    );
};

export default Dashboard;
