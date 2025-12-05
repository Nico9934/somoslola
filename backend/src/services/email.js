import emailService from './emailService.js';

/**
 * Wrapper functions para mantener compatibilidad con código existente
 * Estas funciones llaman al nuevo EmailService que usa templates mejorados
 */

/**
 * Enviar email de nuevo pedido al admin
 */
export const sendNewOrderEmailToAdmin = async (order) => {
    return await emailService.sendNewOrderNotification(order);
};

/**
 * Enviar email al admin cuando suben comprobante
 */
export const sendPaymentProofUploadedToAdmin = async (order) => {
    return await emailService.sendPaymentProofNotification(order);
};

/**
 * Enviar email de confirmación al cliente
 */
export const sendOrderConfirmationToCustomer = async (order) => {
    return await emailService.sendOrderConfirmation(order, order.email);
};

/**
 * Enviar email cuando cambia el estado del pedido
 * @param {Object} order - Orden completa
 * @param {string} newStatus - Nuevo estado
 * @param {string} trackingNumber - Número de seguimiento (opcional)
 */
export const sendOrderStatusChangeToCustomer = async (order, newStatus, trackingNumber = null) => {
    return await emailService.sendOrderStatusChange(order, order.email, newStatus, trackingNumber);
};
