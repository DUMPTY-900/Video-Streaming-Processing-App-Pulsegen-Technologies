import { Request, Response } from 'express';
import Video from '../models/Video';
import path from 'path';
import fs from 'fs';
import { io } from '../server';
import { processVideo } from '../services/processing.service';

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private (Editor/Admin)
export const uploadVideo = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description } = req.body;

        // Create video record
        const video = await Video.create({
            title: title || req.file.originalname,
            description,
            originalFilename: req.file.originalname,
            storedPath: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploader: req.user?._id,
            tenantId: req.user?.tenantId,
            status: 'uploaded',
            processingProgress: 0
        });

        processVideo(video._id.toString());

        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// @desc    Get all videos
// @route   GET /api/videos
// @access  Private
export const getVideos = async (req: Request, res: Response) => {
    try {
        const videos = await Video.find({ tenantId: req.user?.tenantId })
            .sort({ createdAt: -1 })
            .populate('uploader', 'username');
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
export const getVideo = async (req: Request, res: Response) => {
    try {
        const video = await Video.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
        if (video) {
            res.json(video);
        } else {
            res.status(404).json({ message: 'Video not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// @desc    Stream video
// @route   GET /api/videos/:id/stream
// @access  Private
export const streamVideo = async (req: Request, res: Response) => {
    try {
        const video = await Video.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const videoPath = video.storedPath;

        // Check if file actually exists (handling ephemeral storage wipes)
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({
                message: 'Video file not found. It may have been deleted due to server restart (Ephemeral Storage).'
            });
        }

        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': video.mimeType || 'video/mp4',
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': video.mimeType || 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: 'Stream error', error });
        }
    }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (Admin/Editor)
export const deleteVideo = async (req: Request, res: Response) => {
    try {
        const video = await Video.findOne({ _id: req.params.id, tenantId: req.user?.tenantId });

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Delete file from filesystem
        if (fs.existsSync(video.storedPath)) {
            fs.unlinkSync(video.storedPath);
        }

        await video.deleteOne();

        res.json({ message: 'Video removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
