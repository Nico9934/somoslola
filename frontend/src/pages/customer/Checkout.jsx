import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../api/orders';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import MercadoPagoForm from '../../components/customer/MercadoPagoForm';
import { toast } from 'react-toastify';
import { text, badges, layout, buttons, inputs, alerts } from '../../styles';
import { orderSummary } from '../../styles/components';

export default function Checkout() {
    const { cart, clearCart, loadCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [calculatingShipping, setCalculatingShipping] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false); // Nueva bandera

    // Datos del formulario
    const [formData, setFormData] = useState({
        // Paso 1: Datos personales y envío
        email: user?.email || '',
        customerName: user?.name || '',
        customerPhone: '',
        shippingAddress: '',
        shippingNeighborhood: '', // Barrio
        shippingCity: '',
        shippingState: '',
        shippingPostalCode: '',
        shippingCost: 0,

        // Paso 2: Método de pago
        paymentMethod: 'TRANSFER', // CARD o TRANSFER (por defecto transferencia)
    });

    useEffect(() => {
        // Redirigir si no hay carrito o está vacío (pero NO si ya se completó la orden)
        if (!orderCompleted && (!cart || cart.items?.length === 0)) {
            toast.warning('Tu carrito está vacío');
            navigate('/products');
        }
    }, [cart, navigate, orderCompleted]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateShipping = async () => {
        if (!formData.shippingPostalCode) {
            toast.warning('Ingresa un código postal');
            return;
        }

        setCalculatingShipping(true);
        try {
            const { data } = await ordersService.calculateShipping(formData.shippingPostalCode);
            setFormData(prev => ({ ...prev, shippingCost: data.shippingCost }));
            toast.success(`Costo de envío calculado: $${data.shippingCost}`);
        } catch (error) {
            console.error('❌ Error al calcular envío:', error);
            toast.error('Error al calcular costo de envío');
        } finally {
            setCalculatingShipping(false);
        }
    };

    const validateStep1 = () => {
        const { email, customerName, customerPhone, shippingAddress, shippingCity, shippingState, shippingPostalCode, shippingCost } = formData;

        if (!email || !customerName || !customerPhone || !shippingAddress || !shippingCity || !shippingState || !shippingPostalCode) {
            toast.error('Por favor completa todos los campos obligatorios');
            return false;
        }

        if (shippingCost === 0) {
            toast.error('Debes calcular el costo de envío');
            return false;
        }

        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && !validateStep1()) {
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        // Si es pago con tarjeta, no hacer nada aquí
        // El pago se procesa desde handlePaymentSubmit
        if (formData.paymentMethod === 'CARD') {
            return;
        }

        // Solo para transferencia bancaria
        setLoading(true);
        try {
            if (!cart?.id) {
                toast.error('Error: No se encontró el carrito');
                return;
            }

            const orderData = {
                cartId: cart.id,
                email: formData.email,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                shippingAddress: formData.shippingAddress,
                shippingNeighborhood: formData.shippingNeighborhood,
                shippingCity: formData.shippingCity,
                shippingState: formData.shippingState,
                shippingPostalCode: formData.shippingPostalCode,
                shippingCost: formData.shippingCost,
                paymentMethod: formData.paymentMethod,
            };

            const { data } = await ordersService.createOrder(orderData);

            console.log('✅ Orden creada:', data);
            toast.success('¡Pedido realizado con éxito! 🎉');

            // Marcar que la orden se completó (previene redirección)
            setOrderCompleted(true);

            // Limpiar carrito
            clearCart();
            localStorage.removeItem('cartId');

            // Navegar a confirmación
            navigate(`/order-confirmation/${data.order.id}`, { state: { order: data.order } });
        } catch (error) {
            console.error('❌ Error al crear orden:', error);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Error al procesar el pedido');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (paymentData) => {
        setProcessingPayment(true);

        try {
            if (!cart?.id) {
                toast.error('Error: No se encontró el carrito');
                return;
            }

            // 1. Crear la orden primero
            const orderData = {
                cartId: cart.id,
                email: formData.email,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                shippingAddress: formData.shippingAddress,
                shippingNeighborhood: formData.shippingNeighborhood,
                shippingCity: formData.shippingCity,
                shippingState: formData.shippingState,
                shippingPostalCode: formData.shippingPostalCode,
                shippingCost: formData.shippingCost,
                paymentMethod: 'CARD',
            };

            const { data: orderResponse } = await ordersService.createOrder(orderData);
            const order = orderResponse.order;

            // 2. Procesar el pago con Mercado Pago
            const paymentResponse = await fetch('http://localhost:4000/payments/process', {
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
                toast.success('¡Pago procesado con éxito! 🎉');

                // Marcar que la orden se completó
                setOrderCompleted(true);

                // Limpiar carrito
                clearCart();
                localStorage.removeItem('cartId');

                // Navegar a confirmación
                navigate(`/order-confirmation/${order.id}`, {
                    state: { order }
                });
            } else {
                toast.error(`Pago rechazado: ${result.statusDetail || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error('❌ Error al procesar el pago:', error);
            toast.error('Error al procesar el pago');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handlePaymentError = (error) => {
        console.error('Error en formulario de pago:', error);
        toast.error('Error al cargar el formulario de pago');
    };

    const calculateSubtotal = () => {
        if (!cart?.items) return 0;
        const subtotal = cart.items.reduce((sum, item) => {
            const price = item.variant?.promotionPrice || item.variant?.salePrice || 0;
            return sum + (price * item.quantity);
        }, 0);
        return subtotal;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const shipping = parseFloat(formData.shippingCost) || 0;
        return subtotal + shipping;
    };

    if (!cart || cart.items?.length === 0) {
        return null;
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Indicador de pasos */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <StepIndicator number={1} label="Datos de envío" active={currentStep === 1} completed={currentStep > 1} />
                        <div className={`w-16 h-1 mx-2 ${currentStep > 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <StepIndicator number={2} label="Método de pago" active={currentStep === 2} completed={currentStep > 2} />
                        <div className={`w-16 h-1 mx-2 ${currentStep > 2 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <StepIndicator number={3} label="Confirmación" active={currentStep === 3} completed={false} />
                    </div>
                </div>

                <h1 className={`${text.pageTitle} text-center`}>Finalizar Compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario */}
                    <div className="lg:col-span-2">
                        <Card variant="bordered">
                            {/* PASO 1: Datos de envío */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <h2 className={text.sectionTitle}>Datos de Envío</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={inputs.group}>
                                            <label className={inputs.label}>Nombre Completo *</label>
                                            <input
                                                type="text"
                                                name="customerName"
                                                value={formData.customerName}
                                                onChange={handleChange}
                                                className={inputs.text}
                                                required
                                            />
                                        </div>
                                        <div className={inputs.group}>
                                            <label className={inputs.label}>Teléfono *</label>
                                            <input
                                                type="tel"
                                                name="customerPhone"
                                                value={formData.customerPhone}
                                                onChange={handleChange}
                                                placeholder="11-1234-5678"
                                                className={inputs.text}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={inputs.group}>
                                        <label className={inputs.label}>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={inputs.text}
                                            required
                                        />
                                    </div>

                                    <div className={inputs.group}>
                                        <label className={inputs.label}>Dirección *</label>
                                        <input
                                            type="text"
                                            name="shippingAddress"
                                            value={formData.shippingAddress}
                                            onChange={handleChange}
                                            placeholder="Calle, número, piso, depto"
                                            className={inputs.text}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={inputs.group}>
                                            <label className={inputs.label}>Barrio (opcional)</label>
                                            <input
                                                type="text"
                                                name="shippingNeighborhood"
                                                value={formData.shippingNeighborhood}
                                                onChange={handleChange}
                                                placeholder="Ej: Palermo, Recoleta"
                                                className={inputs.text}
                                            />
                                        </div>
                                        <div className={inputs.group}>
                                            <label className={inputs.label}>Código Postal *</label>
                                            <input
                                                type="text"
                                                name="shippingPostalCode"
                                                value={formData.shippingPostalCode}
                                                onChange={handleChange}
                                                placeholder="1234"
                                                className={inputs.text}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={inputs.group}>
                                            <label className={inputs.label}>Ciudad *</label>
                                            <input
                                                type="text"
                                                name="shippingCity"
                                                value={formData.shippingCity}
                                                onChange={handleChange}
                                                className={inputs.text}
                                                required
                                            />
                                        </div>
                                        <div className={inputs.group}>
                                            <label className={inputs.label}>Provincia *</label>
                                            <input
                                                type="text"
                                                name="shippingState"
                                                value={formData.shippingState}
                                                onChange={handleChange}
                                                className={inputs.text}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={inputs.group}>
                                        <label className={inputs.label}>Código Postal (para calcular envío) *</label>
                                        <div className="flex gap-2">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    name="shippingPostalCode"
                                                    value={formData.shippingPostalCode}
                                                    onChange={handleChange}
                                                    placeholder="1234"
                                                    className={`${inputs.text} flex-1`}
                                                    required
                                                />
                                                <Button
                                                    onClick={calculateShipping}
                                                    disabled={calculatingShipping}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    {calculatingShipping ? <Spinner size="sm" /> : 'Calcular'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {formData.shippingCost > 0 && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <p className="text-green-800 font-medium">
                                                💰 Costo de envío: ${formData.shippingCost.toFixed(2)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleNextStep}>
                                            Continuar
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* PASO 2: Método de pago */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>

                                    <div className="space-y-3">
                                        <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${formData.paymentMethod === 'TRANSFER' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="TRANSFER"
                                                checked={formData.paymentMethod === 'TRANSFER'}
                                                onChange={handleChange}
                                                className="mt-1 mr-3"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">🏦 Transferencia o depósito bancario</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Recibirás los datos bancarios al confirmar tu pedido
                                                </p>
                                            </div>
                                        </label>

                                        <label className={`flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${formData.paymentMethod === 'CARD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="CARD"
                                                checked={formData.paymentMethod === 'CARD'}
                                                onChange={handleChange}
                                                className="mt-1 mr-3"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">💳 Tarjeta de Crédito/Débito</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Paga de forma segura con tu tarjeta
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {formData.paymentMethod === 'TRANSFER' && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm text-blue-900 font-medium mb-2">
                                                ℹ️ Importante sobre transferencias bancarias:
                                            </p>
                                            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                                <li>Recibirás los datos bancarios por email al confirmar el pedido</li>
                                                <li>El pedido se procesará al recibir el comprobante de pago</li>
                                                <li>Recordá incluir el número de pedido en el comprobante</li>
                                            </ul>
                                        </div>
                                    )}

                                    {formData.paymentMethod === 'CARD' && (
                                        <div className="mt-6 border-2 border-gray-300 rounded-lg p-6">
                                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Datos de la tarjeta</h3>

                                            <MercadoPagoForm
                                                amount={calculateTotal()}
                                                onSubmit={handlePaymentSubmit}
                                                onError={handlePaymentError}
                                            />

                                            {processingPayment && (
                                                <div className="mt-4 text-center">
                                                    <Spinner />
                                                    <p className="text-sm text-gray-600 mt-2">Procesando pago...</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-4">
                                        <Button onClick={handlePreviousStep} variant="outline">
                                            Volver
                                        </Button>
                                        {formData.paymentMethod === 'TRANSFER' && (
                                            <Button onClick={handleNextStep}>
                                                Continuar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PASO 3: Confirmación */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold mb-4">Confirmar Pedido</h2>

                                    <div className="space-y-3">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium mb-2">📦 Datos de Envío</h3>
                                            <div className="text-sm space-y-1">
                                                <p><strong>Nombre:</strong> {formData.customerName}</p>
                                                <p><strong>Email:</strong> {formData.email}</p>
                                                <p><strong>Teléfono:</strong> {formData.customerPhone}</p>
                                                <p><strong>Dirección:</strong> {formData.shippingAddress}</p>
                                                <p><strong>Ciudad:</strong> {formData.shippingCity}, {formData.shippingState}</p>
                                                <p><strong>CP:</strong> {formData.shippingPostalCode}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium mb-2">💳 Método de Pago</h3>
                                            <p className="text-sm">
                                                {formData.paymentMethod === 'CARD' ? '💳 Tarjeta de Crédito/Débito' : '🏦 Transferencia Bancaria'}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium mb-2">🛍️ Productos</h3>
                                            <div className="space-y-2">
                                                {cart.items.map((item) => {
                                                    const price = item.variant?.promotionPrice || item.variant?.salePrice || 0;
                                                    return (
                                                        <div key={item.id} className="flex justify-between text-sm">
                                                            <span>
                                                                {item.variant.product.name}
                                                                <span className="text-gray-600"> (x{item.quantity})</span>
                                                            </span>
                                                            <span>${(price * item.quantity).toLocaleString()}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <Button onClick={handlePreviousStep} variant="outline">
                                            Volver
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? <Spinner size="sm" /> : 'Confirmar Pedido'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Resumen del pedido */}
                    <div className="lg:col-span-1">
                        <Card variant="bordered">
                            <h3 className={text.sectionTitle}>Resumen del Pedido</h3>

                            <div className={orderSummary.container}>
                                <div className={orderSummary.row}>
                                    <span className={orderSummary.label}>Subtotal ({cart.items?.length} items)</span>
                                    <span className={orderSummary.value}>${calculateSubtotal().toFixed(2)}</span>
                                </div>

                                <div className={orderSummary.row}>
                                    <span className={orderSummary.label}>Envío</span>
                                    <span className={orderSummary.value}>${(parseFloat(formData.shippingCost) || 0).toFixed(2)}</span>
                                </div>

                                <div className={orderSummary.divider}></div>
                                <div className={orderSummary.totalRow}>
                                    <span className={orderSummary.totalLabel}>Total</span>
                                    <span className={orderSummary.totalValue}>${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Componente auxiliar para indicadores de paso
function StepIndicator({ number, label, active, completed }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                ${completed ? 'bg-green-500 text-white' : active ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}
            `}>
                {completed ? '✓' : number}
            </div>
            <span className={`text-xs mt-1 ${active ? 'font-semibold' : 'text-gray-600'}`}>
                {label}
            </span>
        </div>
    );
}
