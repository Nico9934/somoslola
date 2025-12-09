import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { inputs, buttons } from '../../styles';
import { stockNotificationsService } from '../../api/stockNotifications';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function StockNotificationModal({ variant, product, onClose }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: user?.email || '',
        name: user?.name || '',
        phone: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await stockNotificationsService.create({
                ...formData,
                variantId: variant.id
            });

            toast.success('¡Listo! Te avisaremos cuando tengamos stock disponible');
            onClose();
        } catch (error) {
            console.error('Error al solicitar notificación:', error);
            if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Error al solicitar notificación');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Obtener nombre de la variante con atributos
    const getVariantName = () => {
        if (!variant.attributeValues || variant.attributeValues.length === 0) {
            return variant.sku;
        }
        return variant.attributeValues
            .map(av => av.attributeValue.value)
            .join(' - ');
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[100] animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-none max-w-md w-full p-6 animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Avisame cuando esté disponible
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {product.name} - {getVariantName()}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="bg-warm-50 border border-gray-200 rounded-none p-4 mb-6">
                        <p className="text-sm text-gray-700">
                            📬 Te contactaremos por email y/o WhatsApp cuando tengamos stock de este producto.
                            También podemos conseguírtelo por pedido especial.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className={inputs.group}>
                            <label className={inputs.label}>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={inputs.text}
                                required
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className={inputs.group}>
                            <label className={inputs.label}>Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={inputs.text}
                                placeholder="Tu nombre"
                            />
                        </div>

                        <div className={inputs.group}>
                            <label className={inputs.label}>WhatsApp (opcional)</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={inputs.text}
                                placeholder="11-1234-5678"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className={buttons.full}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className={buttons.full}
                            >
                                {loading ? 'Enviando...' : 'Notificarme'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
