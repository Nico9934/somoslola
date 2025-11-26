import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

const payment = new Payment(client);

export const createPayment = async (paymentData) => {
    try {
        const result = await payment.create({
            body: {
                transaction_amount: paymentData.amount,
                token: paymentData.token,
                description: paymentData.description,
                installments: paymentData.installments,
                payment_method_id: paymentData.paymentMethodId,
                payer: {
                    email: paymentData.email,
                    first_name: paymentData.firstName,
                    last_name: paymentData.lastName,
                }
            }
        });

        return result;
    } catch (error) {
        console.error('Error al procesar pago:', error);
        throw error;
    }
};
