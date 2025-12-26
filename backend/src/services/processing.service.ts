import Video from '../models/Video';
import { getVideoMetadata } from './ffmpeg.service';
import { analyzeVideoContent } from './sensitivity.service';
import { io } from '../server';

export const processVideo = async (videoId: string) => {
    try {
        const video = await Video.findById(videoId);
        if (!video) return;

        // Update status to processing
        video.status = 'processing';
        video.processingProgress = 0;
        await video.save();
        io.emit('video:progress', { videoId, status: 'processing', progress: 0 });

        // Step 1: Metadata Extraction
        io.emit('video:progress', { videoId, status: 'processing', progress: 10, message: 'Extracting metadata...' });
        try {
            const metadata = await getVideoMetadata(video.storedPath);
            video.duration = metadata.format.duration || 0;
            // video.resolution = ...
        } catch (err) {
            console.error('FFmpeg error:', err);

        }

        video.processingProgress = 30;
        await video.save();
        io.emit('video:progress', { videoId, status: 'processing', progress: 30, message: 'Metadata extracted' });

        // Step 2: Transcoding (Simulated)
        let progress = 30;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 80) clearInterval(interval);
            else {
                io.emit('video:progress', { videoId, status: 'processing', progress });
            }
        }, 500);

        // Wait for "transcoding"
        await new Promise(resolve => setTimeout(resolve, 4000));
        clearInterval(interval);

        video.processingProgress = 80;
        await video.save();
        io.emit('video:progress', { videoId, status: 'processing', progress: 80, message: 'Analyzing content...' });

        // Step 3: Sensitivity Analysis
        const analysis = await analyzeVideoContent(video.storedPath, video.title, video.description);
        video.sensitivity = analysis.result;

        // Finalize
        video.status = 'processed';
        video.processingProgress = 100;
        await video.save();

        io.emit('video:completed', {
            videoId,
            status: 'processed',
            sensitivity: video.sensitivity,
            progress: 100
        });

    } catch (error) {
        console.error('Processing error:', error);
        await Video.findByIdAndUpdate(videoId, { status: 'failed' });
        io.emit('video:error', { videoId, error: 'Processing failed' });
    }
};
