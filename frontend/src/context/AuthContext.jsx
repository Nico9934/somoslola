import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authService.getMe()
                .then(setUser)
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const { token } = await authService.login(email, password);
        localStorage.setItem('token', token);
        const userData = await authService.getMe();
        setUser(userData);
        return userData;
    };

    const register = async (email, password) => {
        await authService.register(email, password);
        return login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('cartId');
        setUser(null);
    };

    const isAdmin = user?.role === 'ADMIN';
    const isCustomer = user?.role === 'CUSTOMER';

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            loading,
            isAdmin,
            isCustomer,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
