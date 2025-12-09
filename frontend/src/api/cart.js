import api from './axios';

export const cartService = {
    async createOrGet() {
        const { data } = await api.post('/cart');
        return data;
    },

    async getById(cartId) {
        const { data } = await api.get(`/cart/${cartId}`);
        return data;
    },

    async getSummary(cartId, paymentMethod = 'TRANSFER') {
        const { data } = await api.get(`/cart/${cartId}/summary`, {
            params: { paymentMethod }
        });
        return data;
    },

    async addItem(cartId, variantId, quantity) {
        const { data } = await api.post(`/cart/${cartId}/items`, { variantId, quantity });
        return data;
    },

    async updateItem(cartId, variantId, quantity) {
        const { data } = await api.patch(`/cart/${cartId}/variant/${variantId}`, { quantity });
        return data;
    },

    async removeItem(cartId, variantId) {
        const { data } = await api.delete(`/cart/${cartId}/variant/${variantId}`);
        return data;
    },
};
