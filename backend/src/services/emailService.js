import transporter from '../config/email.js';
import {
    passwordRecoveryTemplate,
    orderConfirmationTemplate,
    newOrderAdminTemplate,
    orderStatusChangeTemplate,
    paymentProofAdminTemplate,
    stockAvailableTemplate
} from './emailTemplates.js';

/**
 * Servicio de envío de emails con Nodemailer
 */
class EmailService {
    constructor() {
        this.from = process.env.EMAIL_FROM || 'Somos Lola <noreply@somoslola.com>';
    }

    /**
     * Enviar email de recuperación de contraseña
     */
    async sendPasswordRecovery(email, token) {
        const mailOptions = {
            from: this.from,
            to: email,
            subject: '🔐 Recuperación de Contraseña - Somos Lola',
            html: passwordRecoveryTemplate(token),
            text: `Código de recuperación: ${token}\n\nEste código expira en 15 minutos.\nSi no solicitaste este cambio, ignora este correo.`
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email de recuperación enviado:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error enviando email de recuperación:', error);
            throw error;
        }
    }

    /**
     * Enviar confirmación de pedido al cliente
     */
    async sendOrderConfirmation(order, customerEmail) {
        const mailOptions = {
            from: this.from,
            to: customerEmail || order.email,
            subject: `✅ Pedido #${order.id} Confirmado - Somos Lola`,
            html: orderConfirmationTemplate(order)
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email de confirmación enviado al cliente:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error enviando confirmación al cliente:', error);
            throw error;
        }
    }

    /**
     * Notificar al admin sobre nuevo pedido
     */
    async sendNewOrderNotification(order) {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.warn('⚠️ ADMIN_EMAIL no configurado, no se envió notificación');
            return;
        }

        const mailOptions = {
            from: this.from,
            to: adminEmail,
            subject: `🔔 Nuevo Pedido #${order.id} - $${order.total.toLocaleString('es-AR')}`,
            html: newOrderAdminTemplate(order)
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Notificación enviada al admin:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error enviando notificación al admin:', error);
            // No lanzamos error para no bloquear la creación del pedido
        }
    }

    /**
     * Notificar disponibilidad de stock
     */
    async sendStockAvailableNotification(notification) {
        const mailOptions = {
            from: this.from,
            to: notification.email,
            subject: '🎉 ¡Producto Disponible! - Somos Lola',
            html: stockAvailableTemplate(notification)
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Notificación de stock enviada:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error enviando notificación de stock:', error);
            throw error;
        }
    }

    /**
     * Notificar cambio de estado de pedido
     * @param {Object} order - Orden completa
     * @param {string} customerEmail - Email del cliente
     * @param {string} newStatus - Nuevo estado (PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
     * @param {string} trackingNumber - Número de seguimiento (opcional, requerido para SHIPPED)
     */
    async sendOrderStatusChange(order, customerEmail, newStatus, trackingNumber = null) {
        const mailOptions = {
            from: this.from,
            to: customerEmail || order.email,
            subject: `📦 Actualización Pedido #${order.id} - Somos Lola`,
            html: orderStatusChangeTemplate(order, newStatus, trackingNumber)
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email de cambio de estado enviado:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error enviando cambio de estado:', error);
            throw error;
        }
    }

    /**
     * Notificar comprobante de pago recibido al admin
     */
    async sendPaymentProofNotification(order) {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.warn('⚠️ ADMIN_EMAIL no configurado');
            return;
        }

        const mailOptions = {
            from: this.from,
            to: adminEmail,
            subject: `📄 Comprobante Recibido - Pedido #${order.id}`,
            html: paymentProofAdminTemplate(order)
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Notificación de comprobante enviada al admin:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error enviando notificación de comprobante:', error);
        }
    }
}

export default new EmailService();
