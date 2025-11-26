import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function PaymentSettingsManagement() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        transferDiscount: 20,
        installmentsCount: 3,
        installmentsActive: true
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data } = await api.get('/payment-settings');
            setSettings(data);
        } catch (error) {
            console.error('Error loading payment settings:', error);
            toast.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validaciones
        if (settings.transferDiscount < 0 || settings.transferDiscount > 100) {
            toast.error('El descuento debe estar entre 0 y 100');
            return;
        }

        if (settings.installmentsCount < 1 || settings.installmentsCount > 24) {
            toast.error('Las cuotas deben estar entre 1 y 24');
            return;
        }

        setSaving(true);
        try {
            const { data } = await api.put('/payment-settings', settings);
            setSettings(data);
            toast.success('Configuración actualizada correctamente');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error(error.response?.data?.error || 'Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                </div>
            </AdminLayout>
        );
    }

    // Cálculos de ejemplo
    const examplePrice = 100000;
    const transferPrice = Math.round(examplePrice * (1 - settings.transferDiscount / 100));
    const installmentPrice = Math.round(examplePrice / settings.installmentsCount);

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-primary">💳 Configuración de Pagos</h1>
                    <p className="text-gray-600 mt-2">
                        Configurá los métodos de pago y descuentos que se mostrarán a los clientes
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Descuento por Transferencia */}
                    <Card>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            🏦 Descuento por Transferencia / Efectivo
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Porcentaje de descuento (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={settings.transferDiscount}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        transferDiscount: parseFloat(e.target.value) || 0
                                    })}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Este descuento se aplicará sobre el precio de venta
                                </p>
                            </div>

                            {/* Preview */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-700 font-medium mb-2">Vista previa:</p>
                                <div className="space-y-1">
                                    <p className="text-gray-700">
                                        Precio lista: <span className="font-bold">${examplePrice.toLocaleString('es-AR')}</span>
                                    </p>
                                    <p className="text-green-600 font-bold">
                                        Precio transferencia: ${transferPrice.toLocaleString('es-AR')}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Ahorro: ${(examplePrice - transferPrice).toLocaleString('es-AR')} ({settings.transferDiscount}% OFF)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Cuotas sin Interés */}
                    <Card>
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            💰 Cuotas sin Interés
                        </h2>

                        <div className="space-y-4">
                            {/* Switch para activar/desactivar */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-900">Activar cuotas sin interés</p>
                                    <p className="text-sm text-gray-500">
                                        Mostrar opción de pago en cuotas a los clientes
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={settings.installmentsActive}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            installmentsActive: e.target.checked
                                        })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {settings.installmentsActive && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cantidad de cuotas
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={settings.installmentsCount}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                installmentsCount: parseInt(e.target.value)
                                            })}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 9, 12, 18, 24].map(count => (
                                                <option key={count} value={count}>
                                                    {count} {count === 1 ? 'cuota' : 'cuotas'}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Las cuotas se calculan sobre el precio de lista
                                        </p>
                                    </div>

                                    {/* Preview */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-700 font-medium mb-2">Vista previa:</p>
                                        <div className="space-y-1">
                                            <p className="text-gray-700">
                                                Precio lista: <span className="font-bold">${examplePrice.toLocaleString('es-AR')}</span>
                                            </p>
                                            <p className="text-blue-600 font-bold">
                                                {settings.installmentsCount} x ${installmentPrice.toLocaleString('es-AR')}
                                            </p>
                                            <p className="text-sm text-blue-600">
                                                Total: ${(installmentPrice * settings.installmentsCount).toLocaleString('es-AR')}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={loadSettings}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Configuración'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
