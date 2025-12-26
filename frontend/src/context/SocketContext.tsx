import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { token, user } = useAuth();

    // Get API Base URL from env or fallback (remove /api if present as socket connects to root)
    const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace('/api', '');

    useEffect(() => {
    };
} else {
    if (socket) {
        socket.close();
        setSocket(null);
    }
        }
    }, [token, user]);

return (
    <SocketContext.Provider value={{ socket }}>
        {children}
    </SocketContext.Provider>
);
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within a SocketProvider');
    return context;
};
