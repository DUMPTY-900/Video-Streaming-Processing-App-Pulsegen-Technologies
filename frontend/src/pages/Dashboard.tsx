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
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Video Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Welcome, {user?.username}</span>
                        <button onClick={logout} className="p-2 text-gray-500 hover:text-red-500">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Library</h2>
                    {isEditor && (
                        <button
                            onClick={() => setShowUpload(true)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                        >
                            <UploadIcon size={18} /> Upload Video
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div key={video._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
                            <div className="h-40 bg-gray-200 rounded mb-4 flex items-center justify-center relative overflow-hidden">
                                {video.status === 'processed' ? (
                                    <Link to={`/videos/${video._id}`} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition">
                                        <Play size={48} className="text-white" />
                                    </Link>
                                ) : (
                                    <div className="text-gray-500 text-sm flex flex-col items-center">
                                        <span>{video.status}</span>
                                        {video.status === 'processing' && (
                                            <div className="w-24 h-2 bg-gray-300 rounded mt-2">
                                                <div className="h-full bg-blue-500 rounded" style={{ width: `${video.processingProgress}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <h3 className="font-semibold text-lg truncate" title={video.title}>{video.title || 'Untitled'}</h3>
                            <div className="mt-2 flex justify-between items-center text-sm">
                                <span className={`px-2 py-1 rounded ${video.sensitivity === 'safe' ? 'bg-green-100 text-green-800' :
                                    video.sensitivity === 'flagged' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {video.sensitivity}
                                </span>
                                <span className="text-gray-500">
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={() => { fetchVideos(); setShowUpload(false); }} />}
            </div>
        </div>
    );
};

export default Dashboard;
