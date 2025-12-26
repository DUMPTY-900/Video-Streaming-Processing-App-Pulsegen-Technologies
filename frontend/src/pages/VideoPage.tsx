import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Calendar, FileVideo, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const VideoPage = () => {
    const { id } = useParams();
    const [video, setVideo] = useState<any>(null);

    // Get API Base URL from env or fallback (remove trailing slash if present)
    const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const { data } = await api.get(`/videos/${id}`);
                setVideo(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchVideo();
    }, [id]);

    if (!video) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <div className="p-2 rounded-full bg-slate-900 border border-slate-700 group-hover:border-indigo-500 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    <span className="font-medium">Back to Library</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Player */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-white/10">
                            <video
                                controls
                                className="w-full aspect-video bg-black"
                                src={`${API_BASE}/api/videos/${id}/stream`}
                                poster="" // Could add a poster URL here if available
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                {video.title}
                            </h1>
                            <p className="mt-4 text-slate-400 leading-relaxed text-lg">
                                {video.description || 'No description provided for this video.'}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar - Metadata */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <FileVideo size={20} className="text-indigo-400" />
                                Video Details
                            </h3>

                            <div className="space-y-6">
                                {/* Status Card */}
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2 block">Content Sensitivity</span>
                                    <div className="flex items-center gap-3">
                                        {video.sensitivity === 'safe' ? (
                                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                <CheckCircle size={24} className="text-emerald-500" />
                                            </div>
                                        ) : video.sensitivity === 'flagged' ? (
                                            <div className="p-2 bg-rose-500/10 rounded-lg">
                                                <AlertTriangle size={24} className="text-rose-500" />
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                                <Shield size={24} className="text-amber-500" />
                                            </div>
                                        )}
                                        <div>
                                            <span className={`block font-bold capitalize ${video.sensitivity === 'safe' ? 'text-emerald-400' :
                                                    video.sensitivity === 'flagged' ? 'text-rose-400' : 'text-amber-400'
                                                }`}>
                                                {video.sensitivity}
                                            </span>
                                            <span className="text-xs text-slate-500">Automated Analysis</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400">
                                            <Calendar size={14} />
                                            <span className="text-xs font-medium">Uploaded</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-200">
                                            {new Date(video.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400">
                                            <Clock size={14} />
                                            <span className="text-xs font-medium">File Size</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-200">
                                            {(video.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
