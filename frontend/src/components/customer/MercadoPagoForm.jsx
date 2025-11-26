import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';

// Inicializar Mercado Pago con la Public Key
const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

if (publicKey) {
    initMercadoPago(publicKey, {
        locale: 'es-AR',
        advancedFraudPrevention: false // Deshabilitar en desarrollo
    });
}

export default function MercadoPagoForm({ amount, onSubmit, onError }) {
    // Validar que amount sea un número válido
    const validAmount = typeof amount === 'number' && !isNaN(amount) && amount > 0
        ? amount
        : 0;

    if (!publicKey) {
        return (
            <div className="text-center py-8 text-red-600">
                <p>Error: VITE_MP_PUBLIC_KEY no está configurada</p>
            </div>
        );
    }

    if (validAmount === 0) {
        return (
            <div className="text-center py-8 text-red-600">
                <p>Error: El monto debe ser mayor a 0</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <CardPayment
                initialization={{ amount: validAmount }}
                onSubmit={onSubmit}
                onError={onError}
                locale="es-AR"
            />
        </div>
    );
}
