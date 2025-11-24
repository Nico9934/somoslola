import api from './axios';

export const categoriesService = {
    async getAll() {
        const { data } = await api.get('/categories');
        return data;
    },

    async create(name) {
        const { data } = await api.post('/categories', { name });
        return data;
    },

    async update(id, name) {
        const { data } = await api.put(`/categories/${id}`, { name });
        return data;
    },

    async delete(id) {
        const { data } = await api.delete(`/categories/${id}`);
        return data;
    },
};
