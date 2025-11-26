# Integración de Mercado Pago

## 🎯 Resumen
Esta guía explica cómo integrar Mercado Pago para pagos con tarjeta en tu e-commerce.

---

## 📋 Pasos para la integración

### 1. Crear cuenta en Mercado Pago
1. Ir a https://www.mercadopago.com.ar/developers
2. Crear una cuenta de desarrollador (gratuita)
3. Obtener las credenciales:
   - **Public Key** (para el frontend)
   - **Access Token** (para el backend)

### 2. Modo de prueba (Sandbox)
Mercado Pago ofrece un modo de prueba **GRATUITO** donde:
- ✅ No se cobran dineros reales
- ✅ Puedes usar tarjetas de prueba
- ✅ Probar todo el flujo de pago

**Tarjetas de prueba para Argentina:**
```
Mastercard Aprobada:
  Número: 5031 7557 3453 0604
  CVV: 123
  Fecha: Cualquier fecha futura
  Nombre: APRO

Visa Rechazada:
  Número: 4509 9535 6623 3704
  CVV: 123
  Fecha: Cualquier fecha futura
  Nombre: OTHE
```

Más tarjetas: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing

---

## 🔧 Implementación Técnica

### Paso 1: Instalar SDK

**Backend:**
```bash
cd backend
npm install mercadopago
```

**Frontend:**
```bash
cd frontend
npm install @mercadopago/sdk-react
```

### Paso 2: Configurar variables de entorno

**backend/.env**
```env
# Mercado Pago - MODO PRUEBA
MP_ACCESS_TOKEN=TEST-1234567890-xxxxxx-xxxxxxxxx
MP_PUBLIC_KEY=TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxx

# Cambiar a producción cuando estés listo
# MP_ACCESS_TOKEN=APP-1234567890-xxxxxx-xxxxxxxxx
# MP_PUBLIC_KEY=APP-xxxxxxxxxxxx-xxxxxx-xxxxxxxxx
```

### Paso 3: Crear servicio de pago en el backend

**backend/src/services/mercadopago.js**
```javascript
import mercadopago from 'mercadopago';

// Configurar con tu Access Token
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN
});

export const createPayment = async (paymentData) => {
    try {
        const payment = await mercadopago.payment.create({
            transaction_amount: paymentData.amount,
            token: paymentData.token, // Token de la tarjeta desde el frontend
            description: paymentData.description,
            installments: paymentData.installments,
            payment_method_id: paymentData.paymentMethodId,
            payer: {
                email: paymentData.email,
                first_name: paymentData.firstName,
                last_name: paymentData.lastName,
            }
        });

        return payment;
    } catch (error) {
        console.error('Error al procesar pago:', error);
        throw error;
    }
};
```

### Paso 4: Crear ruta de pago

**backend/src/routes/payments.js**
```javascript
import express from 'express';
import { createPayment } from '../services/mercadopago.js';
import { prisma } from '../config/database.js';

const router = express.Router();

// Procesar pago con Mercado Pago
router.post('/process', async (req, res) => {
    try {
        const { orderId, token, paymentMethodId, installments } = req.body;

        // Obtener orden
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        // Crear pago en Mercado Pago
        const payment = await createPayment({
            amount: order.total,
            token,
            description: `Pedido #${order.id}`,
            installments,
            paymentMethodId,
            email: order.email,
            firstName: order.customerName.split(' ')[0],
            lastName: order.customerName.split(' ').slice(1).join(' '),
        });

        // Actualizar orden según resultado
        if (payment.body.status === 'approved') {
            await prisma.order.update({
                where: { id: orderId },
                data: { 
                    status: 'PAID',
                    paymentId: payment.body.id.toString(),
                },
            });

            return res.json({ 
                success: true, 
                paymentId: payment.body.id,
                status: payment.body.status,
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                status: payment.body.status,
                statusDetail: payment.body.status_detail,
            });
        }
    } catch (error) {
        console.error('Error al procesar pago:', error);
        res.status(500).json({ error: 'Error al procesar el pago' });
    }
});

export default router;
```

Registrar en **backend/src/index.js**:
```javascript
import paymentsRoutes from './routes/payments.js';
app.use('/api/payments', paymentsRoutes);
```

### Paso 5: Actualizar schema de Prisma

**backend/prisma/schema.prisma**
```prisma
model Order {
  // ... campos existentes
  paymentId     String?  // ID del pago en Mercado Pago
  paymentStatus String?  // approved, pending, rejected, etc.
}
```

Ejecutar migración:
```bash
cd backend
npx prisma migrate dev --name add_payment_fields
```

### Paso 6: Implementar frontend - Formulario de tarjeta

**frontend/src/components/customer/MercadoPagoForm.jsx**
```jsx
import { useEffect, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

// Inicializar con tu Public Key
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);

export default function MercadoPagoForm({ amount, onSubmit, onError }) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            onError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <CardPayment
                initialization={{ amount }}
                onSubmit={handleSubmit}
                onError={onError}
                locale="es-AR"
            />
        </div>
    );
}
```

**frontend/.env**
```env
VITE_MP_PUBLIC_KEY=TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxx
```

### Paso 7: Integrar en Checkout

**frontend/src/pages/customer/Checkout.jsx**

Agregar al state:
```javascript
const [showPaymentForm, setShowPaymentForm] = useState(false);
const [processingPayment, setProcessingPayment] = useState(false);
```

Modificar la sección de método de pago:
```jsx
{formData.paymentMethod === 'CARD' && (
    <div className="mt-4 border border-gray-300 p-6">
        <h3 className="text-sm font-bold mb-4">Datos de la tarjeta</h3>
        
        <MercadoPagoForm
            amount={calculateTotal()}
            onSubmit={handlePaymentSubmit}
            onError={handlePaymentError}
        />
    </div>
)}
```

Agregar handlers:
```javascript
const handlePaymentSubmit = async (paymentData) => {
    setProcessingPayment(true);
    
    try {
        // Primero crear la orden
        const { data: order } = await ordersService.createOrder({
            ...formData,
            cartId: cart.id,
            shippingCost: parseFloat(formData.shippingCost),
        });

        // Luego procesar el pago
        const paymentResponse = await fetch('/api/payments/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: order.id,
                token: paymentData.token,
                paymentMethodId: paymentData.payment_method_id,
                installments: paymentData.installments,
            }),
        });

        const result = await paymentResponse.json();

        if (result.success) {
            navigate(`/order-confirmation/${order.id}`, { 
                state: { order } 
            });
        } else {
            toast.error('Pago rechazado: ' + result.statusDetail);
        }
    } catch (error) {
        toast.error('Error al procesar el pago');
        console.error(error);
    } finally {
        setProcessingPayment(false);
    }
};

const handlePaymentError = (error) => {
    console.error('Error en formulario de pago:', error);
    toast.error('Error al cargar el formulario de pago');
};
```

---

## 🧪 Testing en desarrollo

### 1. Configurar credenciales de prueba
- Usar las credenciales TEST-xxxxx que te da Mercado Pago
- NO usar las credenciales de producción (APP-xxxxx)

### 2. Usar tarjetas de prueba
```
✅ Aprobada: 5031 7557 3453 0604 (APRO)
❌ Rechazada: 4509 9535 6623 3704 (OTHE)
⏳ Pendiente: 5031 4332 1540 6351 (CONT)
```

### 3. Probar flujo completo
1. Agregar productos al carrito
2. Ir al checkout
3. Seleccionar "Tarjeta de crédito/débito"
4. Llenar datos con tarjeta de prueba
5. Verificar que se procese el pago
6. Ver orden confirmada

### 4. Verificar en dashboard de Mercado Pago
- Ver los pagos de prueba en: https://www.mercadopago.com.ar/activities/test
- No aparecerán en el dashboard de producción

---

## 🚀 Pasar a producción

### 1. Obtener credenciales de producción
- En el dashboard de Mercado Pago, ir a "Credenciales"
- Copiar las credenciales de **Producción** (APP-xxxxx)

### 2. Actualizar variables de entorno
```env
# Producción
MP_ACCESS_TOKEN=APP-1234567890-xxxxxx-xxxxxxxxx
MP_PUBLIC_KEY=APP-xxxxxxxxxxxx-xxxxxx-xxxxxxxxx
```

### 3. Configurar Webhook (opcional pero recomendado)
Para recibir notificaciones de cambios de estado:

```javascript
// backend/src/routes/webhooks.js
router.post('/mercadopago', async (req, res) => {
    const { type, data } = req.body;

    if (type === 'payment') {
        const paymentId = data.id;
        
        // Consultar estado del pago
        const payment = await mercadopago.payment.get(paymentId);
        
        // Actualizar orden según estado
        if (payment.body.status === 'approved') {
            await prisma.order.update({
                where: { paymentId: paymentId.toString() },
                data: { status: 'PAID' },
            });
        }
    }

    res.sendStatus(200);
});
```

---

## 💰 Costos

- **Cuenta de desarrollador:** GRATIS
- **Modo de prueba:** GRATIS (ilimitado)
- **Comisiones en producción:** ~3-4% + IVA por transacción
- Sin costos fijos mensuales

---

## 📚 Recursos adicionales

- Documentación oficial: https://www.mercadopago.com.ar/developers
- SDK React: https://github.com/mercadopago/sdk-react
- Tarjetas de prueba: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing
- Soporte: https://www.mercadopago.com.ar/developers/es/support

---

## ✅ Checklist de implementación

- [ ] Crear cuenta en Mercado Pago Developers
- [ ] Obtener credenciales de TEST
- [ ] Instalar dependencias (backend y frontend)
- [ ] Configurar variables de entorno
- [ ] Crear servicio de pagos en backend
- [ ] Actualizar schema de Prisma
- [ ] Implementar formulario en frontend
- [ ] Probar con tarjetas de prueba
- [ ] Verificar flujo completo
- [ ] Obtener credenciales de producción
- [ ] Configurar webhook (opcional)
- [ ] Desplegar a producción

---

## 🔒 Seguridad

**NUNCA:**
- ❌ Guardar números de tarjeta en tu base de datos
- ❌ Exponer el Access Token en el frontend
- ❌ Commitear credenciales en Git

**SIEMPRE:**
- ✅ Usar variables de entorno
- ✅ Procesar pagos solo en el backend
- ✅ Validar datos antes de procesar
- ✅ Usar HTTPS en producción
