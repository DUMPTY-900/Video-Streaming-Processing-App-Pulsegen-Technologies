import React, { useState } from 'react';
import api from '../api/axios';
import { X } from 'lucide-react';

interface UploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('video', file!);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('category', category);

        try {
            await api.post('/videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setProgress(percentCompleted);
                },
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Upload failed');
            setUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden transform transition-all z-10 animate-blob">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">Upload Video</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r mb-6 flex items-start">
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* File Drop Area (Simulated) */}
                        <div className="group relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Video File</label>
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                                }`}>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    required={!file} // Only required if no file selected yet
                                />
                                {file ? (
                                    <div className="flex flex-col items-center text-indigo-700">
                                        <div className="p-2 bg-indigo-100 rounded-full mb-2">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </div>
                                        <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                                        <span className="text-xs text-indigo-500 mt-1">Click to change</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-500">
                                        <svg className="w-8 h-8 mb-2 text-gray-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                        <span className="text-sm font-medium">Click to select video</span>
                                        <span className="text-xs text-gray-400 mt-1">MP4, MOV, MKV supported</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Give your video a catchy title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Category</label>
                            <input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                placeholder="e.g. Gaming, Vlog, Education"
                                list="category-suggestions"
                            />
                            <datalist id="category-suggestions">
                                <option value="Gaming" />
                                <option value="Education" />
                                <option value="Music" />
                                <option value="Vlog" />
                                <option value="Tech" />
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                                rows={3}
                                placeholder="What's this video about?"
                            />
                        </div>

                        {uploading ? (
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    <span>Uploading</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.4)]"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!file}
                            >
                                Start Upload
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
