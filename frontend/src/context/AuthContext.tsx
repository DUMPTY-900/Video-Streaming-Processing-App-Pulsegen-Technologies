import { createContext, useContext, useState, useEffect } from 'react';

interface User {
    _id: string;
    username: string;
    email: string;
    roles: string[];
    tenantId: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: any) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (token) {
            // Ideally verify token with backend, for now decode or assume valid if simpler
            // Let's just store the user object in localstorage too for simplicity in this demo
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setLoading(false);
    }, [token]);

    const login = (data: any) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            _id: data._id,
            username: data.username,
            email: data.email,
            roles: data.roles,
            tenantId: data.tenantId
        }));
        setToken(data.token);
        setUser({
            _id: data._id,
            username: data.username,
            email: data.email,
            roles: data.roles,
            tenantId: data.tenantId
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
