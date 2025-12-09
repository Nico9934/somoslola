import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../api/orders';
import { cartService } from '../../api/cart';
import Layout from '../../components/ui/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import MercadoPagoForm from '../../components/customer/MercadoPagoForm';
import OrderConfirmationStep from '../../components/customer/OrderConfirmationStep';
import { toast } from 'react-toastify';
import { text, inputs } from '../../styles';
import { orderSummary } from '../../styles/components';

export default function Checkout() {
    const { cart, clearCart, loading: cartLoading } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [calculatingShipping, setCalculatingShipping] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [orderCompleted, setOrderCompleted] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null); // Orden completada para mostrar en paso 4
    const [cartSummary, setCartSummary] = useState(null); // Resumen del carrito desde backend

    // Estados para el paso 4 (confirmación)
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const fileInputRef = useRef(null);

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
        paymentMethod: null, // Sin método preseleccionado
    });

    useEffect(() => {
        // Redirigir si no hay carrito o está vacío (pero NO si ya se completó la orden o estamos en paso 4)
        // IMPORTANTE: Solo validar después de que el carrito termine de cargar
        if (!cartLoading && !orderCompleted && currentStep !== 4 && (!cart || cart.items?.length === 0)) {
            toast.warning('Tu carrito está vacío');
            navigate('/products');
        }
    }, [cart, cartLoading, navigate, orderCompleted, currentStep]);

    // Cargar resumen del carrito desde backend cuando cambia el método de pago
    useEffect(() => {
        const loadCartSummary = async () => {
            // Solo cargar resumen con método de pago si estamos en paso 2 o superior
            if (cart?.id && currentStep >= 2) {
                try {
                    const summary = await cartService.getSummary(cart.id, formData.paymentMethod);
                    console.log('📊 Cart Summary loaded:', summary);
                    console.log('💰 Pricing:', summary?.pricing);
                    setCartSummary(summary);
                } catch (error) {
                    console.error('Error loading cart summary:', error);
                }
            }
        };
        loadCartSummary();
    }, [cart?.id, formData.paymentMethod, currentStep]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validar si se intenta seleccionar tarjeta pero no está habilitada
        if (name === 'paymentMethod' && value === 'CARD') {
            // Verificar si las cuotas están activas en el backend
            if (cartSummary?.paymentSettings?.installmentsActive === false) {
                toast.warning('El pago con tarjeta no está disponible por el momento');
                return; // No permitir el cambio
            }
        }

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

    const validateStep2 = () => {
        if (!formData.paymentMethod) {
            toast.error('Por favor selecciona un método de pago');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        if (currentStep === 1 && !validateStep1()) {
            return;
        }
        if (currentStep === 2 && !validateStep2()) {
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
            setCompletedOrder(data.order);

            // Ir al paso 4 (confirmación) ANTES de limpiar carrito
            setCurrentStep(4);

            // Limpiar carrito después de cambiar de paso
            setTimeout(() => {
                clearCart();
                localStorage.removeItem('cartId');
            }, 100);
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
                setCompletedOrder(order);

                // Ir al paso 4 (confirmación) ANTES de limpiar carrito
                setCurrentStep(4);

                // Limpiar carrito después de cambiar de paso
                setTimeout(() => {
                    clearCart();
                    localStorage.removeItem('cartId');
                }, 100);
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

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor selecciona una imagen');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('El archivo no debe superar 5MB');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);

        try {
            // Subir imagen al backend (Cloudinary)
            const formData = new FormData();
            formData.append('image', file);

            const uploadResponse = await fetch('http://localhost:4000/upload/payment-proof', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData,
            });

            const uploadData = await uploadResponse.json();

            if (!uploadData.url) {
                throw new Error('Error al subir imagen');
            }

            // Guardar URL en la orden
            await ordersService.uploadPaymentProof(completedOrder.id, uploadData.url);

            // Actualizar orden local
            setCompletedOrder({ ...completedOrder, paymentProof: uploadData.url });
            setUploadSuccess(true);
            toast.success('Comprobante subido exitosamente');

            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
            console.error('Error al subir comprobante:', error);
            toast.error('Error al subir el comprobante. Por favor intenta de nuevo.');
        } finally {
            setUploading(false);
            // Limpiar el input para permitir subir el mismo archivo de nuevo
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handlePaymentError = (error) => {
        console.error('Error en formulario de pago:', error);
        toast.error('Error al cargar el formulario de pago');
    };

    // Calcular subtotal base (sin descuentos de método de pago)
    const calculateBaseSubtotal = () => {
        if (!cart?.items) return 0;
        return cart.items.reduce((sum, item) => {
            const price = item.variant?.promotionPrice || item.variant?.salePrice || 0;
            return sum + (price * item.quantity);
        }, 0);
    };

    // Calcular subtotal final (con descuento si aplica)
    const calculateSubtotal = () => {
        const baseSubtotal = calculateBaseSubtotal();

        // Solo aplicar descuento de transferencia si:
        // 1. Estamos en paso 2 o superior
        // 2. Hay método de pago seleccionado
        // 3. El método es TRANSFER
        // 4. Tenemos el resumen del backend
        if (currentStep >= 2 &&
            formData.paymentMethod === 'TRANSFER' &&
            cartSummary?.pricing?.subtotalWithTransferDiscount) {
            return cartSummary.pricing.subtotalWithTransferDiscount;
        }

        return baseSubtotal;
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const shipping = parseFloat(formData.shippingCost) || 0;
        return subtotal + shipping;
    };

    // Mostrar spinner mientras carga el carrito
    if (cartLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </Layout>
        );
    }

    // Solo mostrar "sin carrito" si NO estamos en paso 4 (confirmación)
    if (currentStep !== 4 && (!cart || cart.items?.length === 0)) {
        return null;
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Indicador de pasos */}
                <div className="mb-12">
                    <div className="flex items-center justify-center mb-2">
                        <div className="flex items-center">
                            <StepIndicator number={1} label="Datos de envío" active={currentStep === 1} completed={currentStep > 1} />
                            <div className="w-20 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden relative">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                    initial={{ width: '0%' }}
                                    animate={{ width: currentStep > 1 ? '100%' : '0%' }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                />
                            </div>
                            <StepIndicator number={2} label="Método de pago" active={currentStep === 2} completed={currentStep > 2} />
                            <div className="w-20 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden relative">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                    initial={{ width: '0%' }}
                                    animate={{ width: currentStep > 2 ? '100%' : '0%' }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                />
                            </div>
                            <StepIndicator number={3} label="Revisión" active={currentStep === 3} completed={currentStep > 3} />
                            <div className="w-20 h-1 mx-2 bg-gray-200 rounded-full overflow-hidden relative">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                    initial={{ width: '0%' }}
                                    animate={{ width: currentStep > 3 ? '100%' : '0%' }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                />
                            </div>
                            <StepIndicator number={4} label="Confirmado" active={currentStep === 4} completed={false} />
                        </div>
                    </div>
                </div>

                <h1 className={`${text.pageTitle} text-center`}>
                    {currentStep === 4 ? '¡Pedido Confirmado!' : 'Finalizar Compra'}
                </h1>

                <div className={`grid grid-cols-1 gap-6 ${currentStep === 4 ? '' : 'lg:grid-cols-3'}`}>
                    {/* Formulario */}
                    <div className={currentStep === 4 ? 'max-w-2xl mx-auto' : 'lg:col-span-2'}>
                        <Card variant="bordered">
                            <AnimatePresence mode="wait">
                                {/* PASO 1: Datos de envío */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="space-y-4"
                                    >
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
                                    </motion.div>
                                )}

                                {/* PASO 2: Método de pago */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="space-y-4"
                                    >
                                        <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>

                                        <div className="space-y-3">
                                            <motion.label
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'TRANSFER' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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
                                            </motion.label>

                                            <motion.label
                                                whileHover={{ scale: cartSummary?.paymentSettings?.installmentsActive === false ? 1 : 1.02 }}
                                                whileTap={{ scale: cartSummary?.paymentSettings?.installmentsActive === false ? 1 : 0.98 }}
                                                className={`flex items-start p-4 border-2 rounded-lg transition-all duration-200 ${cartSummary?.paymentSettings?.installmentsActive === false
                                                    ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                                                    : formData.paymentMethod === 'CARD'
                                                        ? 'border-blue-500 bg-blue-50 shadow-md cursor-pointer'
                                                        : 'border-gray-200 cursor-pointer hover:border-gray-300 hover:shadow-sm'
                                                    }`}>
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="CARD"
                                                    checked={formData.paymentMethod === 'CARD'}
                                                    onChange={handleChange}
                                                    disabled={cartSummary?.paymentSettings?.installmentsActive === false}
                                                    className="mt-1 mr-3"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`font-medium ${cartSummary?.paymentSettings?.installmentsActive === false
                                                            ? 'text-gray-500'
                                                            : ''
                                                            }`}>
                                                            💳 Tarjeta de Crédito/Débito
                                                            {cartSummary?.paymentSettings?.installmentsActive === false && (
                                                                <span className="ml-2 text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">No disponible</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {cartSummary?.paymentSettings?.installmentsActive === false
                                                            ? 'Este método de pago no está disponible temporalmente'
                                                            : 'Paga de forma segura con tu tarjeta'
                                                        }
                                                    </p>
                                                </div>
                                            </motion.label>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {formData.paymentMethod === 'TRANSFER' && (
                                                <motion.div
                                                    key="transfer-info"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                                                >
                                                    <p className="text-sm text-blue-900 font-medium mb-2">
                                                        ℹ️ Importante sobre transferencias bancarias:
                                                    </p>
                                                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                                        <li>Podrás ver los datos bancarios al finalizar la compra</li>
                                                        <li>El pedido se procesará al recibir el comprobante de pago</li>
                                                        <li>Si la transferencia no se hace un día habil, el pago puede demorar en el impacto</li>
                                                    </ul>
                                                </motion.div>
                                            )}

                                            {formData.paymentMethod === 'CARD' && (
                                                <motion.div
                                                    key="card-form"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="mt-6 border-2 border-gray-300 rounded-lg p-6"
                                                >
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
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="flex justify-between pt-4">
                                            <Button onClick={handlePreviousStep} variant="outline">
                                                Volver
                                            </Button>
                                            {formData.paymentMethod === 'TRANSFER' && (
                                                <Button onClick={handleNextStep}>
                                                    Continuar
                                                </Button>
                                            )}
                                            {!formData.paymentMethod && (
                                                <Button onClick={handleNextStep} variant="outline" disabled>
                                                    Selecciona un método de pago
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* PASO 3: Confirmación */}
                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="space-y-4"
                                    >
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
                                    </motion.div>
                                )}

                                {/* PASO 4: Confirmación de pedido COMPLETA */}
                                {currentStep === 4 && completedOrder && (
                                    <OrderConfirmationStep
                                        order={completedOrder}
                                        uploading={uploading}
                                        uploadSuccess={uploadSuccess}
                                        fileInputRef={fileInputRef}
                                        onFileUpload={handleFileUpload}
                                    />
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>

                    {/* Resumen del pedido - Solo mostrar en pasos 1-3 */}
                    {currentStep < 4 && (
                        <div className="lg:col-span-1">
                            <Card variant="bordered">
                                <h3 className={text.sectionTitle}>Resumen del Pedido</h3>

                                <div className={orderSummary.container}>
                                    <div className={orderSummary.row}>
                                        <span className={orderSummary.label}>Subtotal ({cart?.items?.length || 0} items)</span>
                                        <span className={orderSummary.value}>
                                            {/* Solo mostrar descuento si estamos en paso 2+ y método es TRANSFER */}
                                            {currentStep >= 2 && formData.paymentMethod === 'TRANSFER' && cartSummary?.pricing?.subtotalWithTransferDiscount ? (
                                                <>
                                                    <span className="line-through text-gray-400 mr-2">
                                                        ${calculateBaseSubtotal().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-green-600 font-semibold">
                                                        ${cartSummary.pricing.subtotalWithTransferDiscount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </>
                                            ) : (
                                                `$${calculateBaseSubtotal().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            )}
                                        </span>
                                    </div>

                                    {/* Badge de descuento solo en paso 2+ con transferencia */}
                                    {currentStep >= 2 && formData.paymentMethod === 'TRANSFER' && cartSummary?.pricing?.transferDiscount > 0 && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-2">
                                            <p className="text-sm text-green-800 font-medium">
                                                🎉 ¡{cartSummary.pricing.transferDiscount}% OFF por transferencia!
                                            </p>
                                        </div>
                                    )}

                                    <div className={orderSummary.row}>
                                        <span className={orderSummary.label}>Envío</span>
                                        <span className={orderSummary.value}>${(parseFloat(formData.shippingCost) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    <div className={orderSummary.divider}></div>
                                    <div className={orderSummary.totalRow}>
                                        <span className={orderSummary.totalLabel}>Total: </span>
                                        <span className={orderSummary.totalValue}>${calculateTotal().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

// Componente auxiliar para indicadores de paso
function StepIndicator({ number, label, active, completed }) {
    return (
        <div className="flex flex-col items-center">
            <motion.div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                transition-all duration-300 relative
                ${completed ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg' :
                        active ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-4 ring-blue-200' :
                            'bg-gray-200 text-gray-500'}
            `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    scale: active ? [1, 1.05, 1] : 1,
                }}
                transition={{
                    scale: {
                        repeat: active ? Infinity : 0,
                        duration: 2,
                        ease: 'easeInOut'
                    }
                }}
            >
                {completed ? (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                        ✓
                    </motion.span>
                ) : (
                    number
                )}
            </motion.div>
            <span className={`text-xs mt-2 font-medium transition-colors ${active ? 'text-blue-600' : completed ? 'text-green-600' : 'text-gray-500'
                }`}>
                {label}
            </span>
        </div>
    );
}
