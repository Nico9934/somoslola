import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY || "",
});

// Configurar remitente
const sentFrom = new Sender(
    process.env.MAILERSEND_FROM_EMAIL || "no-reply@yourdomain.com",
    process.env.MAILERSEND_FROM_NAME || "SomosLola"
);

/**
 * Enviar email de nuevo pedido al admin
 */
export const sendNewOrderEmailToAdmin = async (order) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.warn("⚠️ ADMIN_EMAIL no configurado en .env");
            return;
        }

        const recipients = [new Recipient(adminEmail, "Admin")];

        // Calcular subtotal (sin envío)
        const subtotal = order.total - order.shippingCost;

        const personalization = [
            {
                email: adminEmail,
                data: {
                    order_number: order.id,
                    customer_name: order.customerName,
                    customer_email: order.email,
                    customer_phone: order.customerPhone,
                    total: `$${order.total.toLocaleString()}`,
                    subtotal: `$${subtotal.toLocaleString()}`,
                    shipping_cost: `$${order.shippingCost.toLocaleString()}`,
                    payment_method: order.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Tarjeta',
                    shipping_address: order.shippingAddress,
                    shipping_city: order.shippingCity,
                    shipping_state: order.shippingState,
                    shipping_postal_code: order.shippingPostalCode,
                    admin_panel_url: "http://localhost:5173/admin/orders"
                },
            }
        ];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject(`🛍️ Nuevo pedido #${order.id} - $${order.total.toLocaleString()}`)
            .setTemplateId(process.env.MAILERSEND_TEMPLATE_NEW_ORDER || '')
            .setPersonalization(personalization);

        await mailerSend.email.send(emailParams);
        console.log(`📧 Email de nuevo pedido enviado a admin`);
    } catch (error) {
        console.error("❌ Error al enviar email de nuevo pedido:", error);
    }
};

/**
 * Enviar email al admin cuando suben comprobante
 */
export const sendPaymentProofUploadedToAdmin = async (order) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) return;

        const recipients = [new Recipient(adminEmail, "Admin")];

        const personalization = [
            {
                email: adminEmail,
                data: {
                    order_number: order.id,
                    customer_name: order.customerName,
                    customer_email: order.email,
                    total: `$${order.total.toLocaleString()}`,
                    payment_proof_url: order.paymentProof,
                    admin_panel_url: "http://localhost:5173/admin/orders"
                },
            }
        ];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject(`📄 Comprobante subido - Pedido #${order.id}`)
            .setTemplateId(process.env.MAILERSEND_TEMPLATE_PAYMENT_PROOF || '')
            .setPersonalization(personalization);

        await mailerSend.email.send(emailParams);
        console.log(`📧 Email de comprobante subido enviado a admin`);
    } catch (error) {
        console.error("❌ Error al enviar email de comprobante:", error);
    }
};

/**
 * Enviar email de confirmación al cliente
 */
export const sendOrderConfirmationToCustomer = async (order) => {
    try {
        const recipients = [new Recipient(order.email, order.customerName)];

        const personalization = [
            {
                email: order.email,
                data: {
                    customer_name: order.customerName,
                    order_number: order.id,
                    total: `$${order.total.toLocaleString()}`,
                    subtotal: `$${(order.total - order.shippingCost).toLocaleString()}`,
                    shipping_cost: `$${order.shippingCost.toLocaleString()}`,
                    payment_method: order.paymentMethod === 'TRANSFER' ? 'Transferencia' : 'Tarjeta',
                    show_transfer_info: order.paymentMethod === 'TRANSFER',
                    cbu: "0000003100012345678901",
                    alias: "HEADD.CLUB",
                    account_holder: "Rosario Sanchez",
                    order_url: `http://localhost:5173/order-confirmation/${order.id}`
                },
            }
        ];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject(`✅ Pedido confirmado #${order.id} - SomosLola`)
            .setTemplateId(process.env.MAILERSEND_TEMPLATE_ORDER_CONFIRMATION || '')
            .setPersonalization(personalization);

        await mailerSend.email.send(emailParams);
        console.log(`📧 Email de confirmación enviado a ${order.email}`);
    } catch (error) {
        console.error("❌ Error al enviar email de confirmación:", error);
    }
};

/**
 * Enviar email cuando cambia el estado del pedido
 */
export const sendOrderStatusChangeToCustomer = async (order, newStatus) => {
    try {
        const recipients = [new Recipient(order.email, order.customerName)];

        const statusMessages = {
            PAID: {
                title: "Pago confirmado",
                message: "Tu pago ha sido confirmado. Procesaremos tu pedido pronto.",
                emoji: "✅"
            },
            SHIPPED: {
                title: "Pedido enviado",
                message: "Tu pedido ha sido enviado y está en camino.",
                emoji: "📦"
            },
            COMPLETED: {
                title: "Pedido completado",
                message: "Tu pedido ha sido entregado. ¡Esperamos que lo disfrutes!",
                emoji: "🎉"
            },
            CANCELLED: {
                title: "Pedido cancelado",
                message: "Tu pedido ha sido cancelado. Si tenés dudas, contactanos.",
                emoji: "❌"
            }
        };

        const statusInfo = statusMessages[newStatus];
        if (!statusInfo) return;

        const personalization = [
            {
                email: order.email,
                data: {
                    customer_name: order.customerName,
                    order_number: order.id,
                    status_title: statusInfo.title,
                    status_message: statusInfo.message,
                    status_emoji: statusInfo.emoji,
                    total: `$${order.total.toLocaleString()}`,
                    order_url: `http://localhost:5173/order-confirmation/${order.id}`
                },
            }
        ];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject(`${statusInfo.emoji} ${statusInfo.title} - Pedido #${order.id}`)
            .setTemplateId(process.env.MAILERSEND_TEMPLATE_STATUS_CHANGE || '')
            .setPersonalization(personalization);

        await mailerSend.email.send(emailParams);
        console.log(`📧 Email de cambio de estado enviado a ${order.email}`);
    } catch (error) {
        console.error("❌ Error al enviar email de cambio de estado:", error);
    }
};
