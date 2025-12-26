import mongoose, { Document, Schema } from 'mongoose';

export interface IVideo extends Document {
    title: string;
    description: string;
    originalFilename: string;
    storedPath: string;
    mimeType: string;
    size: number;
    duration: number;
    status: 'uploaded' | 'processing' | 'processed' | 'failed';
    sensitivity: 'safe' | 'flagged' | 'unknown';
    processingProgress: number;
    uploader: mongoose.Types.ObjectId;
    tenantId: string;
}

const VideoSchema: Schema = new Schema({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    originalFilename: { type: String, required: true },
    storedPath: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    duration: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['uploaded', 'processing', 'processed', 'failed'],
        default: 'uploaded'
    },
    sensitivity: {
        type: String,
        enum: ['safe', 'flagged', 'unknown'],
        default: 'unknown'
    },
    category: { type: String, default: 'General' },
    processingProgress: { type: Number, default: 0 },
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<IVideo>('Video', VideoSchema);
