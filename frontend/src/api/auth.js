import api from './axios';

export const authService = {
    async login(email, password) {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },

    async register(email, password, role = 'CUSTOMER') {
        const { data } = await api.post('/auth/register', { email, password, role });
        return data;
    },

    async getMe() {
        const { data } = await api.get('/auth/me');
        return data;
    },
};
