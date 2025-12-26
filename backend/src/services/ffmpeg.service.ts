import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

export const getVideoMetadata = (filePath: string): Promise<ffmpeg.FfprobeData> => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata);
        });
    });
};

export const processVideoFile = (filePath: string, outputDir: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(filePath);
        }, 2000);
    });
};
