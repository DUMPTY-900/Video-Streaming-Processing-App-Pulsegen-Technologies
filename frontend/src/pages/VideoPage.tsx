import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft } from 'lucide-react';

const VideoPage = () => {
    const { id } = useParams();
    const [video, setVideo] = useState<any>(null);

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

    if (!video) return <div className="p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                <ArrowLeft size={20} /> Back to Library
            </Link>

            <div className="max-w-5xl mx-auto">
                <video
                    controls
                    className="w-full aspect-video bg-gray-900 rounded-lg shadow-2xl"
                    src={`http://localhost:5000/api/videos/${id}/stream`}
                >
                    Your browser does not support the video tag.
                </video>

                <div className="mt-6">
                    <h1 className="text-3xl font-bold">{video.title}</h1>
                    <div className="mt-4 flex gap-4">
                        <div className="bg-gray-800 px-4 py-2 rounded">
                            <span className="text-gray-400 block text-xs">Sensitivity</span>
                            <span className="capitalize font-semibold">{video.sensitivity}</span>
                        </div>
                        <div className="bg-gray-800 px-4 py-2 rounded">
                            <span className="text-gray-400 block text-xs">Size</span>
                            <span className="font-semibold">{(video.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                    <p className="mt-6 text-gray-300">
                        {video.description || 'No description provided.'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
