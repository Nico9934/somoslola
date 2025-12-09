import { useState, useEffect } from 'react';
import { stockNotificationsService } from '../../api/stockNotifications';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { text, badges, buttons } from '../../styles';

const statusLabels = {
    PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    NOTIFIED: { label: 'Notificado', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    CONTACTED: { label: 'Contactado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    ORDERED: { label: 'Pedido realizado', color: 'bg-green-100 text-green-800 border-green-200' },
    CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

export default function StockNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        loadNotifications();
    }, [selectedStatus]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedStatus) params.status = selectedStatus;

            const data = await stockNotificationsService.getAll(params);
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast.error('Error al cargar notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await stockNotificationsService.update(id, { status: newStatus });
            toast.success('Estado actualizado');
            loadNotifications();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Error al actualizar estado');
        }
    };

    const handleSaveNotes = async (id) => {
        try {
            await stockNotificationsService.update(id, { notes: editData[id] });
            toast.success('Notas guardadas');
            setEditingId(null);
            loadNotifications();
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Error al guardar notas');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta notificación?')) return;

        try {
            await stockNotificationsService.delete(id);
            toast.success('Notificación eliminada');
            loadNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Error al eliminar notificación');
        }
    };

    const getVariantName = (notification) => {
        if (!notification.variant?.attributeValues || notification.variant.attributeValues.length === 0) {
            return notification.variant?.sku || 'N/A';
        }
        return notification.variant.attributeValues
            .map(av => av.attributeValue.value)
            .join(' - ');
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

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <h1 className={text.pageTitle}>Notificaciones de Stock</h1>

                {/* Filtros */}
                <Card variant="bordered" className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedStatus === '' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedStatus('')}
                        >
                            Todas
                        </Button>
                        {Object.keys(statusLabels).map(status => (
                            <Button
                                key={status}
                                variant={selectedStatus === status ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedStatus(status)}
                            >
                                {statusLabels[status].label}
                            </Button>
                        ))}
                    </div>
                </Card>

                {/* Tabla de notificaciones */}
                {notifications.length === 0 ? (
                    <Card variant="bordered">
                        <p className={text.muted}>No hay notificaciones</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(notification => (
                            <Card key={notification.id} variant="bordered">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                    {/* Info del producto */}
                                    <div className="lg:col-span-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {notification.variant?.product?.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {getVariantName(notification)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            SKU: {notification.variant?.sku}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Stock actual: {notification.variant?.stock?.quantity || 0}
                                        </p>
                                    </div>

                                    {/* Info del cliente */}
                                    <div className="lg:col-span-3">
                                        <p className="text-sm font-medium text-gray-900">{notification.name || 'Sin nombre'}</p>
                                        <p className="text-sm text-gray-600">{notification.email}</p>
                                        {notification.phone && (
                                            <p className="text-sm text-gray-600">
                                                📱 {notification.phone}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Solicitado: {new Date(notification.createdAt).toLocaleDateString('es-AR')}
                                        </p>
                                    </div>

                                    {/* Estado y acciones */}
                                    <div className="lg:col-span-5">
                                        <div className="mb-3">
                                            <span className={`inline-block px-3 py-1 text-sm font-medium border rounded-none ${statusLabels[notification.status].color}`}>
                                                {statusLabels[notification.status].label}
                                            </span>
                                        </div>

                                        {/* Select de estado */}
                                        <select
                                            value={notification.status}
                                            onChange={(e) => handleUpdateStatus(notification.id, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-none text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-black"
                                        >
                                            {Object.keys(statusLabels).map(status => (
                                                <option key={status} value={status}>
                                                    {statusLabels[status].label}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Notas */}
                                        <div className="mb-2">
                                            {editingId === notification.id ? (
                                                <div>
                                                    <textarea
                                                        value={editData[notification.id] || ''}
                                                        onChange={(e) => setEditData({ ...editData, [notification.id]: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                                        rows="2"
                                                        placeholder="Notas..."
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                        <Button size="sm" onClick={() => handleSaveNotes(notification.id)}>
                                                            Guardar
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        {notification.notes || 'Sin notas'}
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(notification.id);
                                                            setEditData({ ...editData, [notification.id]: notification.notes || '' });
                                                        }}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Editar notas
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Botón eliminar */}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(notification.id)}
                                            className="w-full mt-2"
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
