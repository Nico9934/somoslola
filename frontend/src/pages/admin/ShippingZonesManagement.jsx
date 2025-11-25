import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

export default function ShippingZonesManagement() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingZone, setEditingZone] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        cpStart: '',
        cpEnd: '',
        price: ''
    });

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const { data } = await api.get('/shipping-zones');
            setZones(data);
        } catch (error) {
            console.error('❌ Error al cargar zonas:', error);
            toast.error('Error al cargar zonas de envío');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (zone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name,
            cpStart: zone.cpStart || '',
            cpEnd: zone.cpEnd || '',
            price: zone.price
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditingZone(null);
        setFormData({ name: '', cpStart: '', cpEnd: '', price: '' });
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error('Nombre y precio son requeridos');
            return;
        }

        try {
            const payload = {
                name: formData.name,
                cpStart: formData.cpStart ? Number(formData.cpStart) : null,
                cpEnd: formData.cpEnd ? Number(formData.cpEnd) : null,
                price: Number(formData.price)
            };

            if (editingZone) {
                await api.put(`/shipping-zones/${editingZone.id}`, payload);
                toast.success('Zona actualizada exitosamente');
            } else {
                await api.post('/shipping-zones', payload);
                toast.success('Zona creada exitosamente');
            }

            fetchZones();
            handleCancel();
        } catch (error) {
            console.error('❌ Error al guardar zona:', error);
            toast.error(error.response?.data?.error || 'Error al guardar zona');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta zona?')) return;

        try {
            await api.delete(`/shipping-zones/${id}`);
            toast.success('Zona eliminada');
            fetchZones();
        } catch (error) {
            console.error('❌ Error al eliminar zona:', error);
            toast.error('Error al eliminar zona');
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

    return (
        <AdminLayout>
            <AdminPageLayout
                title="Zonas de Envío"
                showSearch={false}
                showCreateButton={false}
            >
                <div className="mb-4 flex justify-end">
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancelar' : '+ Nueva Zona'}
                    </Button>
                </div>

                {/* Formulario */}
                {showForm && (
                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingZone ? 'Editar Zona' : 'Nueva Zona'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nombre de la Zona *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ej: CABA / GBA"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        CP Inicio (opcional)
                                    </label>
                                    <input
                                        type="number"
                                        name="cpStart"
                                        value={formData.cpStart}
                                        onChange={handleChange}
                                        placeholder="1000"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Dejar vacío para zona sin rango (fallback)
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        CP Fin (opcional)
                                    </label>
                                    <input
                                        type="number"
                                        name="cpEnd"
                                        value={formData.cpEnd}
                                        onChange={handleChange}
                                        placeholder="1999"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Precio de Envío ($) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="3500"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit">
                                    {editingZone ? 'Actualizar' : 'Crear'}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Tabla de zonas */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">CP Inicio</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">CP Fin</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {zones.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                            No hay zonas de envío configuradas
                                        </td>
                                    </tr>
                                ) : (
                                    zones.map((zone) => (
                                        <tr key={zone.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <span className="font-medium">{zone.name}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {zone.cpStart !== null ? (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                        {zone.cpStart}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {zone.cpEnd !== null ? (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                                                        {zone.cpEnd}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold text-green-600">
                                                    ${zone.price.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEdit(zone)}
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleDelete(zone.id)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Información adicional */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Cómo funciona:</h3>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>
                            <strong>Con rango de CP:</strong> El sistema buscará zonas donde el código postal del cliente
                            esté entre CP Inicio y CP Fin
                        </li>
                        <li>
                            <strong>Sin rango (fallback):</strong> Si dejas CP Inicio y CP Fin vacíos, esta zona se usará
                            como predeterminada cuando no haya coincidencia
                        </li>
                        <li>
                            <strong>Prioridad:</strong> Las zonas con rango específico tienen prioridad sobre las zonas sin rango
                        </li>
                    </ul>
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
}
