import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';

dotenv.config();

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

connectDB();

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
import videoRoutes from './routes/video.routes';

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);


    socket.on('join', (room) => {
        socket.join(room);
    });

    socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
