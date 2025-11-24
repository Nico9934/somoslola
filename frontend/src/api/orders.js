import api from './axios';

export const ordersService = {
    async checkout(cartId, email) {
        const { data } = await api.post('/orders/checkout', { cartId, email });
        return data;
    },

    async getAll() {
        const { data } = await api.get('/orders');
        return data;
    },

    async getById(id) {
        const { data } = await api.get(`/orders/${id}`);
        return data;
    },

    async updateStatus(id, status) {
        const { data } = await api.put(`/orders/${id}/status`, { status });
        return data;
    },
};
