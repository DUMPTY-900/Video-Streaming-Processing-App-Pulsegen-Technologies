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
    createdAt: string;
}

const Dashboard = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        fetchVideos();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('video:queued', () => {
            // Optimistically update or re-fetch
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
            const { data } = await api.get('/videos');
            setVideos(data);
        } catch (err) {
            console.error(err);
        }
    };

    const isEditor = user?.roles.includes('editor') || user?.roles.includes('admin');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <Play size={20} className="text-white fill-current" />
                                </div>
                                <span className="font-bold text-xl text-gray-900 tracking-tight">StreamFlow</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-sm font-medium text-gray-900">{user?.username}</span>
                                <span className="text-xs text-gray-500 uppercase tracking-wide">{user?.roles[0]}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition duration-200"
                                title="Sign Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage and view your organization's content</p>
                    </div>
                    {isEditor && (
                        <button
                            onClick={() => setShowUpload(true)}
                            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 gap-2 transform hover:-translate-y-0.5"
                        >
                            <UploadIcon size={18} />
                            Upload New Video
                        </button>
                    )}
                </div>

                {/* Video Grid */}
                {videos.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="mx-auto h-12 w-12 text-gray-400">
                            <Play size={48} strokeWidth={1} />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No videos yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by uploading a new video.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {videos.map((video) => (
                            <div key={video._id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col">
                                {/* Thumbnail/Status Area */}
                                <div className="aspect-video bg-gray-100 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                                    {video.status === 'processed' ? (
                                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                            {/* Simulate Thumbnail (would normally be an image) */}
                                            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
                                            <Link to={`/videos/${video._id}`} className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 hover:scale-110 transition-all duration-200">
                                                <Play size={24} className="ml-1 fill-current" />
                                            </Link>
                                            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs text-white font-mono">
                                                HD
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gray-50">
                                            <div className="w-full max-w-[120px] mb-3">
                                                {video.status === 'processing' ? (
                                                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${video.processingProgress}%` }}></div>
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 text-gray-300 mx-auto">
                                                        <UploadIcon size={40} strokeWidth={1.5} />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{video.status}</span>
                                            {video.status === 'processing' && <span className="text-xs text-indigo-500 mt-1">{Math.round(video.processingProgress)}%</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={video.title}>
                                            {video.title || 'Untitled Video'}
                                        </h3>
                                    </div>

                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${video.sensitivity === 'safe' ? 'bg-green-100 text-green-800' :
                                                video.sensitivity === 'flagged' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {video.sensitivity === 'safe' ? 'Safe Content' :
                                                video.sensitivity === 'flagged' ? 'Flagged' : 'Pending Review'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
