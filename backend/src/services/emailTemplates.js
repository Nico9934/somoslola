/**
 * Templates HTML para emails con diseño Somos Lola
 * Colores: #fdf9f3 (warm-50), #f8f3e8 (warm-100), #000 (negro)
 * Font: Work Sans
 */

const LOGO_URL = 'https://res.cloudinary.com/dl2jw7fkm/image/upload/v1764911972/somoslola/products/bfvvbfvxnd6bfyicof2f.png'; // Reemplazar con URL real del logo

/**
 * Template base con estructura común
 */
const baseTemplate = (content, title = 'Somos Lola') => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #fdf9f3;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
        }
        
        .email-wrapper {
            width: 100%;
            background-color: #fdf9f3;
            padding: 40px 0;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 0;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background-color: #000000;
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 20px;
        }
        
        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 600;
            margin: 0;
            line-height: 1.3;
        }
        
        .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }
        
        .content p {
            margin: 0 0 16px 0;
            font-size: 15px;
        }
        
        .content h2 {
            font-size: 20px;
            font-weight: 600;
            color: #000000;
            margin: 24px 0 16px 0;
        }
        
        .content h3 {
            font-size: 18px;
            font-weight: 600;
            color: #000000;
            margin: 20px 0 12px 0;
        }
        
        .info-box {
            background-color: #fdf9f3;
            border-left: 4px solid #000000;
            padding: 20px;
            margin: 24px 0;
        }
        
        .alert-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 24px 0;
        }
        
        .success-box {
            background-color: #dcfce7;
            border-left: 4px solid #16a34a;
            padding: 20px;
            margin: 24px 0;
        }
        
        .button {
            display: inline-block;
            background-color: #000000;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            font-size: 15px;
            font-weight: 600;
            border-radius: 0;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }
        
        .button:hover {
            background-color: #fdf9f3;
            color: #000000 !important;
            border: 2px solid #000000;
        }
        
        .table-wrapper {
            margin: 24px 0;
            overflow-x: auto;
        }
        
        .order-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .order-table thead {
            background-color: #f8f3e8;
        }
        
        .order-table th {
            padding: 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: #000000;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .order-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        
        .total-row {
            font-size: 18px;
            font-weight: 700;
            color: #000000;
        }
        
        .footer {
            background-color: #f8f3e8;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            margin: 8px 0;
            font-size: 13px;
            color: #666666;
            line-height: 1.5;
        }
        
        .footer a {
            color: #000000;
            text-decoration: none;
            font-weight: 500;
        }
        
        .social-links {
            margin: 20px 0;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #000000;
            text-decoration: none;
        }
        
        @media only screen and (max-width: 600px) {
            .email-wrapper {
                padding: 20px 0;
            }
            
            .email-container {
                width: 100% !important;
                margin: 0 !important;
            }
            
            .header, .content, .footer {
                padding: 24px 20px !important;
            }
            
            .header h1 {
                font-size: 24px !important;
            }
            
            .logo {
                max-width: 150px !important;
            }
            
            .order-table th,
            .order-table td {
                padding: 8px !important;
                font-size: 12px !important;
            }
        }
    </style>
</head>
<body>
    <table class="email-wrapper" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <table class="email-container" cellpadding="0" cellspacing="0" border="0">
                    ${content}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * Footer común para todos los emails
 */
const footer = () => `
<tr>
    <td class="footer">
        <p style="font-weight: 600; color: #000000; margin-bottom: 16px;">Somos Lola</p>
        <p>Indumentaria femenina con estilo</p>
        <div class="social-links">
            <a href="https://instagram.com/somoslola">Instagram</a> • 
            <a href="https://facebook.com/somoslola">Facebook</a> • 
            <a href="mailto:${process.env.ADMIN_EMAIL || 'contacto@somoslola.com'}">Email</a>
        </div>
        <p style="margin-top: 20px; font-size: 12px;">
            © ${new Date().getFullYear()} Somos Lola. Todos los derechos reservados.
        </p>
        <p style="font-size: 11px; color: #999999;">
            Este es un correo automático, por favor no respondas a este mensaje.
        </p>
    </td>
</tr>
`;

/**
 * Template: Recuperación de contraseña
 */
export const passwordRecoveryTemplate = (token) => {
    const content = `
        <tr>
            <td class="header">
                <img src="${LOGO_URL}" alt="Somos Lola" class="logo" />
                <h1>🔐 Recuperación de Contraseña</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <p style="font-size: 16px;">Hola,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Somos Lola</strong>.</p>
                <p>Usá el siguiente código de verificación para continuar:</p>
                
                <div class="info-box" style="text-align: center; padding: 30px 20px;">
                    <div style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #000000; font-family: 'Courier New', monospace;">
                        ${token}
                    </div>
                    <p style="margin-top: 16px; font-size: 13px; color: #666666;">
                        Este código expira en 15 minutos
                    </p>
                </div>
                
                <div class="alert-box">
                    <p style="margin: 0; font-weight: 500;">
                        ⚠️ Si no solicitaste este cambio, ignorá este correo. Tu contraseña actual permanecerá sin cambios.
                    </p>
                </div>
                
                <p style="margin-top: 32px;">Saludos,<br><strong>El equipo de Somos Lola</strong></p>
            </td>
        </tr>
        ${footer()}
    `;

    return baseTemplate(content, 'Recuperación de Contraseña - Somos Lola');
};

/**
 * Template: Confirmación de pedido al cliente
 */
export const orderConfirmationTemplate = (order) => {
    const itemsList = order.items?.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                ${item.productName || item.variant?.product?.name || 'Producto'}
                ${item.variantSku ? `<br><span style="font-size: 12px; color: #666;">SKU: ${item.variantSku}</span>` : ''}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
                $${item.price.toLocaleString('es-AR')}
            </td>
        </tr>
    `).join('') || '';

    const subtotal = order.total - (order.shippingCost || 0);

    const content = `
        <tr>
            <td class="header">
                <img src="${LOGO_URL}" alt="Somos Lola" class="logo" />
                <h1>✅ ¡Pedido Confirmado!</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <p style="font-size: 16px;">¡Hola${order.customerName ? ` ${order.customerName}` : ''}!</p>
                <p>Gracias por tu compra. Recibimos tu pedido correctamente y lo estamos procesando.</p>
                
                <div class="info-box">
                    <h3 style="margin-top: 0;">📦 Pedido #${order.id}</h3>
                    <p style="margin: 8px 0;"><strong>Estado:</strong> Pendiente</p>
                    <p style="margin: 8px 0;"><strong>Método de pago:</strong> ${order.paymentMethod === 'TRANSFER' ? 'Transferencia Bancaria' : 'Mercado Pago'}</p>
                    <p style="margin: 8px 0;"><strong>Fecha:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                
                <h3>📋 Detalle del pedido:</h3>
                <div class="table-wrapper">
                    <table class="order-table">
                        <thead>
                            <tr>
                                <th style="text-align: left;">Producto</th>
                                <th style="text-align: center;">Cant.</th>
                                <th style="text-align: right;">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                            <tr>
                                <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Subtotal:</td>
                                <td style="padding: 12px; text-align: right; font-weight: 600;">$${subtotal.toLocaleString('es-AR')}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Envío:</td>
                                <td style="padding: 12px; text-align: right; font-weight: 600;">$${(order.shippingCost || 0).toLocaleString('es-AR')}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="2" style="padding: 16px 12px; text-align: right; background-color: #f8f3e8;">TOTAL:</td>
                                <td style="padding: 16px 12px; text-align: right; background-color: #f8f3e8;">$${order.total.toLocaleString('es-AR')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                ${order.paymentMethod === 'TRANSFER' ? `
                    <div class="alert-box">
                        <h3 style="margin-top: 0;">💳 Datos para transferencia:</h3>
                        <p style="margin: 8px 0;"><strong>CBU:</strong> 0000003100012345678901</p>
                        <p style="margin: 8px 0;"><strong>Alias:</strong> HEADD.CLUB</p>
                        <p style="margin: 8px 0;"><strong>Titular:</strong> Rosario Sanchez</p>
                        <p style="margin-top: 16px; color: #dc2626; font-weight: 600;">
                            ⚠️ Por favor, enviá el comprobante de pago respondiendo a este correo o por WhatsApp.
                        </p>
                    </div>
                ` : ''}
                
                ${order.shippingAddress ? `
                    <div class="info-box">
                        <h3 style="margin-top: 0;">📍 Dirección de envío:</h3>
                        <p style="margin: 4px 0;">${order.shippingAddress}</p>
                        ${order.shippingNeighborhood ? `<p style="margin: 4px 0;">${order.shippingNeighborhood}</p>` : ''}
                        <p style="margin: 4px 0;">${order.shippingCity}, ${order.shippingState}</p>
                        <p style="margin: 4px 0;">CP: ${order.shippingPostalCode}</p>
                    </div>
                ` : ''}
                
                <p style="margin-top: 32px;">Te mantendremos informado sobre el estado de tu pedido.</p>
                <p>Saludos,<br><strong>El equipo de Somos Lola</strong></p>
            </td>
        </tr>
        ${footer()}
    `;

    return baseTemplate(content, `Pedido #${order.id} Confirmado - Somos Lola`);
};

/**
 * Template: Notificación de nuevo pedido al admin
 */
export const newOrderAdminTemplate = (order) => {
    const itemsList = order.items?.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                ${item.productName || item.variant?.product?.name || 'Producto'}
                ${item.variantSku ? `<br><span style="font-size: 12px; color: #666;">SKU: ${item.variantSku}</span>` : ''}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
                $${item.price.toLocaleString('es-AR')}
            </td>
        </tr>
    `).join('') || '';

    const subtotal = order.total - (order.shippingCost || 0);

    const content = `
        <tr>
            <td class="header">
                <img src="${LOGO_URL}" alt="Somos Lola" class="logo" />
                <h1>🔔 Nuevo Pedido Recibido</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <div class="alert-box">
                    <h3 style="margin-top: 0;">📦 Pedido #${order.id}</h3>
                    <p style="margin: 8px 0;"><strong>Cliente:</strong> ${order.customerName || 'N/A'}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${order.email || 'N/A'}</p>
                    <p style="margin: 8px 0;"><strong>Teléfono:</strong> ${order.customerPhone || 'N/A'}</p>
                    <p style="margin: 8px 0;"><strong>Método de pago:</strong> ${order.paymentMethod === 'TRANSFER' ? 'Transferencia Bancaria' : 'Mercado Pago'}</p>
                    <p style="margin: 8px 0; font-size: 18px; font-weight: 700; color: #000;">
                        <strong>Total:</strong> $${order.total.toLocaleString('es-AR')}
                    </p>
                </div>
                
                <h3>📋 Productos:</h3>
                <div class="table-wrapper">
                    <table class="order-table">
                        <thead>
                            <tr>
                                <th style="text-align: left;">Producto</th>
                                <th style="text-align: center;">Cant.</th>
                                <th style="text-align: right;">Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                            <tr>
                                <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Subtotal:</td>
                                <td style="padding: 12px; text-align: right; font-weight: 600;">$${subtotal.toLocaleString('es-AR')}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600;">Envío:</td>
                                <td style="padding: 12px; text-align: right; font-weight: 600;">$${(order.shippingCost || 0).toLocaleString('es-AR')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                ${order.shippingAddress ? `
                    <div class="info-box">
                        <h3 style="margin-top: 0;">📍 Dirección de envío:</h3>
                        <p style="margin: 4px 0;">${order.shippingAddress}</p>
                        ${order.shippingNeighborhood ? `<p style="margin: 4px 0;">${order.shippingNeighborhood}</p>` : ''}
                        <p style="margin: 4px 0;">${order.shippingCity}, ${order.shippingState}</p>
                        <p style="margin: 4px 0;">CP: ${order.shippingPostalCode}</p>
                    </div>
                ` : ''}
                
                ${order.notes ? `
                    <div class="info-box">
                        <h3 style="margin-top: 0;">📝 Notas del cliente:</h3>
                        <p style="margin: 0;">${order.notes}</p>
                    </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 32px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders/${order.id}" class="button">
                        Ver Pedido en Admin Panel
                    </a>
                </div>
            </td>
        </tr>
        ${footer()}
    `;

    return baseTemplate(content, `Nuevo Pedido #${order.id} - Somos Lola Admin`);
};

/**
 * Template: Cambio de estado del pedido
 */
export const orderStatusChangeTemplate = (order, newStatus, trackingNumber = null) => {
    const statusConfig = {
        PAID: {
            title: 'Pago Confirmado',
            message: 'Tu pago ha sido confirmado. Estamos preparando tu pedido.',
            emoji: '✅',
            color: '#16a34a'
        },
        PROCESSING: {
            title: 'Pedido en Preparación',
            message: 'Estamos preparando tu pedido con mucho cuidado.',
            emoji: '📦',
            color: '#2563eb'
        },
        SHIPPED: {
            title: 'Pedido Enviado',
            message: '¡Tu pedido está en camino! Pronto lo tendrás en tus manos.',
            emoji: '🚚',
            color: '#9333ea'
        },
        DELIVERED: {
            title: 'Pedido Entregado',
            message: 'Tu pedido ha sido entregado. ¡Esperamos que lo disfrutes!',
            emoji: '🎉',
            color: '#16a34a'
        },
        CANCELLED: {
            title: 'Pedido Cancelado',
            message: 'Tu pedido ha sido cancelado. Si tenés dudas, contactanos.',
            emoji: '❌',
            color: '#dc2626'
        }
    };

    const config = statusConfig[newStatus] || statusConfig.PROCESSING;

    const content = `
        <tr>
            <td class="header">
                <img src="${LOGO_URL}" alt="Somos Lola" class="logo" />
                <h1>${config.emoji} ${config.title}</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <p style="font-size: 16px;">¡Hola${order.customerName ? ` ${order.customerName}` : ''}!</p>
                
                <div class="success-box" style="border-left-color: ${config.color};">
                    <h3 style="margin-top: 0; color: ${config.color};">Pedido #${order.id}</h3>
                    <p style="margin: 8px 0; font-size: 16px;">${config.message}</p>
                    <p style="margin: 8px 0;"><strong>Estado actual:</strong> ${config.title}</p>
                </div>
                
                ${newStatus === 'SHIPPED' && trackingNumber ? `
                    <div class="info-box">
                        <h3 style="margin-top: 0;">📍 Número de Seguimiento</h3>
                        <p style="font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #000; margin: 12px 0; font-family: 'Courier New', monospace;">
                            ${trackingNumber}
                        </p>
                        <p style="margin: 8px 0; font-size: 13px; color: #666;">
                            Podés usar este código para hacer el seguimiento de tu envío.
                        </p>
                    </div>
                ` : ''}
                
                <p style="margin-top: 32px;">Si tenés alguna pregunta, no dudes en contactarnos.</p>
                <p>Saludos,<br><strong>El equipo de Somos Lola</strong></p>
            </td>
        </tr>
        ${footer()}
    `;

    return baseTemplate(content, `${config.emoji} ${config.title} - Pedido #${order.id}`);
};

/**
 * Template: Comprobante de pago recibido (Admin)
 */
export const paymentProofAdminTemplate = (order) => {
    const content = `
        <tr>
            <td class="header">
                <img src="${LOGO_URL}" alt="Somos Lola" class="logo" />
                <h1>📄 Comprobante de Pago Recibido</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <div class="info-box">
                    <h3 style="margin-top: 0;">Pedido #${order.id}</h3>
                    <p style="margin: 8px 0;"><strong>Cliente:</strong> ${order.customerName}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${order.email}</p>
                    <p style="margin: 8px 0;"><strong>Total:</strong> $${order.total.toLocaleString('es-AR')}</p>
                </div>
                
                <p>El cliente ha subido un comprobante de pago.</p>
                
                <div style="text-align: center; margin: 24px 0;">
                    <a href="${order.paymentProof}" class="button" target="_blank">
                        Ver Comprobante
                    </a>
                </div>
                
                <p>Revisá el comprobante y confirmá el pago desde el panel de administración.</p>
                
                <div style="text-align: center; margin-top: 32px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders/${order.id}" class="button">
                        Ir al Pedido
                    </a>
                </div>
            </td>
        </tr>
        ${footer()}
    `;

    return baseTemplate(content, `Comprobante Recibido - Pedido #${order.id}`);
};

/**
 * Template: Stock disponible
 */
export const stockAvailableTemplate = (notification) => {
    const content = `
        <tr>
            <td class="header">
                <img src="${LOGO_URL}" alt="Somos Lola" class="logo" />
                <h1>🎉 ¡Producto Disponible!</h1>
            </td>
        </tr>
        <tr>
            <td class="content">
                <p style="font-size: 16px;">Hola${notification.name ? ` ${notification.name}` : ''},</p>
                <p>¡Buenas noticias! El producto que solicitaste ya está disponible en stock.</p>
                
                <div class="success-box">
                    <h3 style="margin-top: 0;">${notification.variant?.product?.name || 'Producto'}</h3>
                    ${notification.variant?.sku ? `<p style="margin: 8px 0;"><strong>SKU:</strong> ${notification.variant.sku}</p>` : ''}
                    ${notification.variant?.salePrice ? `
                        <p style="margin: 16px 0; font-size: 28px; font-weight: 700; color: #000;">
                            $${notification.variant.salePrice.toLocaleString('es-AR')}
                        </p>
                    ` : ''}
                </div>
                
                <p style="font-size: 14px; color: #dc2626; font-weight: 600;">
                    ⏱️ ¡Apresúrate! El stock es limitado y se agota rápido.
                </p>
                
                <div style="text-align: center; margin-top: 32px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${notification.variant?.productId}" class="button">
                        Ver Producto
                    </a>
                </div>
                
                <p style="margin-top: 32px;">Saludos,<br><strong>El equipo de Somos Lola</strong></p>
            </td>
        </tr>
        ${footer()}
    `;

    return baseTemplate(content, 'Producto Disponible - Somos Lola');
};
