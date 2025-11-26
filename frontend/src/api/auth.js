import api from './axios';

export const authService = {
    async login(email, password) {
        const guestCartId = localStorage.getItem('cartId');
        const { data } = await api.post('/auth/login', {
            email,
            password,
            guestCartId: guestCartId || undefined
        });
        return data;
    },

    async register(email, password, role = 'CUSTOMER') {
        const guestCartId = localStorage.getItem('cartId');
        const { data } = await api.post('/auth/register', {
            email,
            password,
            role,
            guestCartId: guestCartId || undefined
        });
        return data;
    },

    async getMe() {
        const { data } = await api.get('/auth/me');
        return data;
    },
};
