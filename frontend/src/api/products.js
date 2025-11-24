import api from './axios';

export const productsService = {
    async getAll() {
        const { data } = await api.get('/products');
        return data;
    },

    async getById(id) {
        const { data } = await api.get(`/products/${id}`);
        return data;
    },

    async create(productData) {
        const { data } = await api.post('/products', productData);
        return data;
    },

    async update(id, productData) {
        const { data } = await api.put(`/products/${id}`, productData);
        return data;
    },

    async delete(id) {
        const { data } = await api.delete(`/products/${id}`);
        return data;
    },

    // Asignar atributos a producto
    async assignAttributes(id, attributeIds) {
        const { data } = await api.post(`/products/${id}/attributes`, { attributeIds });
        return data;
    },

    // Generar variantes automáticamente
    async generateVariants(id, deleteExisting = false, selectedValues = null) {
        const { data } = await api.post(`/products/${id}/variants/generate`, {
            deleteExisting,
            selectedValues  // { attributeId: [valueId1, valueId2, ...] }
        });
        return data;
    },

    // Actualizar variante
    async updateVariant(productId, variantId, variantData) {
        const { data } = await api.put(`/products/${productId}/variants/${variantId}`, variantData);
        return data;
    },

    // Crear nueva variante
    async createVariant(productId, variantData) {
        const { data } = await api.post(`/products/${productId}/variants`, variantData);
        return data;
    },

    // Eliminar variante
    async deleteVariant(productId, variantId) {
        const { data } = await api.delete(`/products/${productId}/variants/${variantId}`);
        return data;
    },
};
