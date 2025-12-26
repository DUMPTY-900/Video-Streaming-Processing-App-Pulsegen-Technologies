import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir);
    },
    filename(req, file, cb) {
        // Unique filename: fieldname-timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const checkFileType = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const filetypes = /mp4|mov|avi|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('video/');

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only! (Wait, Videos only!)'));
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /mp4|mov|avi|mkv/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = file.mimetype.startsWith('video/');

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Videos only!'));
        }
    },
});

export default upload;
