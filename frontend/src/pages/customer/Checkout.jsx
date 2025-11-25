import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../api/orders';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

export default function Checkout() {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [calculatingShipping, setCalculatingShipping] = useState(false);

    // Datos del formulario
    const [formData, setFormData] = useState({
        // Paso 1: Datos personales y envío
        email: user?.email || '',
        customerName: user?.name || '',
        customerPhone: '',
        shippingAddress: '',
        shippingCity: '',
        shippingState: '',
        shippingPostalCode: '',
        shippingCost: 0,

        // Paso 2: Método de pago
        paymentMethod: 'CARD', // CARD o TRANSFER
    });

    useEffect(() => {
        // Redirigir si no hay carrito o está vacío
        if (!cart || cart.items?.length === 0) {
            toast.warning('Tu carrito está vacío');
            navigate('/products');
        }
    }, [cart, navigate]);

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
            toast.error('Por favor completa todos los campos');
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
        setLoading(true);
        try {
            const cartId = localStorage.getItem('cartId');

            const orderData = {
                cartId,
                email: formData.email,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                shippingAddress: formData.shippingAddress,
                shippingCity: formData.shippingCity,
                shippingState: formData.shippingState,
                shippingPostalCode: formData.shippingPostalCode,
                shippingCost: formData.shippingCost,
                paymentMethod: formData.paymentMethod,
            };

            const { data } = await ordersService.createOrder(orderData);

            console.log('✅ Orden creada:', data);
            toast.success('¡Pedido realizado con éxito! 🎉');

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

    const calculateSubtotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => sum + (item.variant.product.basePrice * item.quantity), 0);
    };

    const calculateTotal = () => {
        return calculateSubtotal() + formData.shippingCost;
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

                <h1 className="text-3xl font-bold mb-6 text-center">Finalizar Compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario */}
                    <div className="lg:col-span-2">
                        <Card>
                            {/* PASO 1: Datos de envío */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold mb-4">Datos de Envío</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
                                            <input
                                                type="text"
                                                name="customerName"
                                                value={formData.customerName}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Teléfono *</label>
                                            <input
                                                type="tel"
                                                name="customerPhone"
                                                value={formData.customerPhone}
                                                onChange={handleChange}
                                                placeholder="11-1234-5678"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dirección *</label>
                                        <input
                                            type="text"
                                            name="shippingAddress"
                                            value={formData.shippingAddress}
                                            onChange={handleChange}
                                            placeholder="Calle, número, piso, depto"
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Ciudad *</label>
                                            <input
                                                type="text"
                                                name="shippingCity"
                                                value={formData.shippingCity}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Provincia *</label>
                                            <input
                                                type="text"
                                                name="shippingState"
                                                value={formData.shippingState}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Código Postal *</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    name="shippingPostalCode"
                                                    value={formData.shippingPostalCode}
                                                    onChange={handleChange}
                                                    placeholder="1234"
                                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                        <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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

                                        <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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
                                                    <span className="font-medium">🏦 Transferencia Bancaria</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Recibirás los datos bancarios por email
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {formData.paymentMethod === 'TRANSFER' && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm text-blue-800">
                                                ℹ️ Una vez confirmado el pedido, te enviaremos los datos para realizar la transferencia.
                                                El pedido se procesará al recibir el comprobante.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-4">
                                        <Button onClick={handlePreviousStep} variant="outline">
                                            Volver
                                        </Button>
                                        <Button onClick={handleNextStep}>
                                            Continuar
                                        </Button>
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
                                                {cart.items.map((item) => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span>
                                                            {item.variant.product.name}
                                                            <span className="text-gray-600"> (x{item.quantity})</span>
                                                        </span>
                                                        <span>${(item.variant.product.basePrice * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
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
                        <Card>
                            <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal ({cart.items?.length} items)</span>
                                    <span>${calculateSubtotal().toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Envío</span>
                                    <span>${formData.shippingCost.toFixed(2)}</span>
                                </div>

                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
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
