import express from 'express';
import { uploadVideo, getVideos, getVideo, streamVideo, deleteVideo } from '../controllers/video.controller';
import { protect } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import upload from '../middlewares/upload';

const router = express.Router();

router.post('/', protect, authorize('editor', 'admin'), upload.single('video'), uploadVideo);
router.get('/', protect, getVideos);
router.get('/:id', protect, getVideo);
router.get('/:id/stream', protect, streamVideo);
router.delete('/:id', protect, authorize('editor', 'admin'), deleteVideo);

export default router;
