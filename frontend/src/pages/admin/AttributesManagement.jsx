import { useState, useEffect } from 'react';
import { attributesService } from '../../api/attributes';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export default function AttributesManagement() {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isValueModalOpen, setIsValueModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [editingValue, setEditingValue] = useState(null);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        type: 'SELECT',
        unit: '',
    });

    const [valueFormData, setValueFormData] = useState({
        value: '',
        hexColor: '',
    });

    useEffect(() => {
        loadAttributes();
    }, []);

    const loadAttributes = async () => {
        try {
            const data = await attributesService.getAll(true);
            setAttributes(data);
        } catch (error) {
            console.error('Error loading attributes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (attribute = null) => {
        if (attribute) {
            setEditingAttribute(attribute);
            setFormData({
                name: attribute.name,
                type: attribute.type,
                unit: attribute.unit || '',
            });
        } else {
            setEditingAttribute(null);
            setFormData({ name: '', type: 'SELECT', unit: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAttribute) {
                await attributesService.update(editingAttribute.id, formData);
            } else {
                await attributesService.create(formData);
            }
            setIsModalOpen(false);
            loadAttributes();
        } catch (error) {
            alert('Error al guardar atributo');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro? Esto eliminará todos los valores asociados')) return;

        try {
            await attributesService.delete(id);
            loadAttributes();
        } catch (error) {
            alert('Error al eliminar atributo');
        }
    };

    // VALORES
    const handleOpenValueModal = (attribute, value = null) => {
        setSelectedAttribute(attribute);
        if (value) {
            setEditingValue(value);
            setValueFormData({
                value: value.value,
                hexColor: value.hexColor || '',
            });
        } else {
            setEditingValue(null);
            setValueFormData({ value: '', hexColor: '' });
        }
        setIsValueModalOpen(true);
    };

    const handleSubmitValue = async (e) => {
        e.preventDefault();
        try {
            if (editingValue) {
                await attributesService.updateValue(
                    selectedAttribute.id,
                    editingValue.id,
                    valueFormData
                );
            } else {
                await attributesService.addValue(selectedAttribute.id, valueFormData);
            }
            setIsValueModalOpen(false);
            loadAttributes();
        } catch (error) {
            alert('Error al guardar valor');
        }
    };

    const handleDeleteValue = async (attributeId, valueId) => {
        if (!confirm('¿Eliminar este valor?')) return;

        try {
            await attributesService.deleteValue(attributeId, valueId);
            loadAttributes();
        } catch (error) {
            alert('Error al eliminar valor');
        }
    };

    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const filteredAttributes = attributes.filter(attr =>
        attr.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                title="Atributos de Productos"
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                onCreateClick={() => handleOpenModal()}
                createButtonLabel="Nuevo Atributo"
            >
                <div className="space-y-4">
                    {filteredAttributes.map((attribute) => {
                        const isExpanded = expandedIds.has(attribute.id);
                        return (
                            <Card key={attribute.id}>
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => toggleExpand(attribute.id)}
                                                    className="text-muted hover:text-primary transition-colors"
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-5 w-5" />
                                                    ) : (
                                                        <ChevronRight className="h-5 w-5" />
                                                    )}
                                                </button>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-primary">
                                                        {attribute.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                            {attribute.type}
                                                        </span>
                                                        {attribute.unit && (
                                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                                {attribute.unit}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-muted">
                                                            {attribute.values?.length || 0} valores
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenValueModal(attribute)}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Valor
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenModal(attribute)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleDelete(attribute.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Valores expandidos */}
                                    {isExpanded && attribute.values && attribute.values.length > 0 && (
                                        <div className="pl-8 pt-3 border-t">
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                {attribute.values.map((value) => (
                                                    <div
                                                        key={value.id}
                                                        className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:border-secondary transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                            {value.hexColor && (
                                                                <div
                                                                    className="w-5 h-5 rounded border border-gray-300 flex-shrink-0"
                                                                    style={{ backgroundColor: value.hexColor }}
                                                                />
                                                            )}
                                                            <span className="text-sm truncate">{value.value}</span>
                                                        </div>
                                                        <div className="flex gap-1 ml-2">
                                                            <button
                                                                onClick={() => handleOpenValueModal(attribute, value)}
                                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                            >
                                                                <Edit2 className="h-3 w-3 text-gray-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteValue(attribute.id, value.id)}
                                                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                                            >
                                                                <Trash2 className="h-3 w-3 text-red-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {isExpanded && (!attribute.values || attribute.values.length === 0) && (
                                        <div className="pl-8 pt-3 border-t text-center text-muted text-sm">
                                            No hay valores. Haz clic en "+ Valor" para agregar.
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}

                    {filteredAttributes.length === 0 && (
                        <Card>
                            <p className="text-center text-muted py-8">
                                No hay atributos. Crea el primero para empezar.
                            </p>
                        </Card>
                    )}
                </div>
            </AdminPageLayout>

            {/* Modal Atributo */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAttribute ? 'Editar Atributo' : 'Nuevo Atributo'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Ej: Color, Tamaño, Capacidad"
                    />

                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">
                            Tipo
                        </label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            <option value="SELECT">Lista de opciones</option>
                            <option value="NUMBER">Numérico</option>
                            <option value="TEXT">Texto</option>
                        </select>
                    </div>

                    <Input
                        label="Unidad (opcional)"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="Ej: ml, cm, kg"
                    />

                    <Button type="submit" className="w-full">
                        {editingAttribute ? 'Actualizar' : 'Crear'}
                    </Button>
                </form>
            </Modal>

            {/* Modal Valor */}
            <Modal
                isOpen={isValueModalOpen}
                onClose={() => setIsValueModalOpen(false)}
                title={editingValue ? 'Editar Valor' : `Agregar Valor a "${selectedAttribute?.name}"`}
            >
                <form onSubmit={handleSubmitValue} className="space-y-4">
                    <Input
                        label="Valor"
                        value={valueFormData.value}
                        onChange={(e) => setValueFormData({ ...valueFormData, value: e.target.value })}
                        required
                        placeholder="Ej: Rojo, XL, 500"
                    />

                    {selectedAttribute?.type === 'SELECT' && (
                        <div>
                            <label className="block text-sm font-medium text-primary mb-1">
                                Color Hexadecimal (opcional)
                            </label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="color"
                                    value={valueFormData.hexColor || '#000000'}
                                    onChange={(e) => setValueFormData({ ...valueFormData, hexColor: e.target.value })}
                                    className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                    title="Selecciona un color"
                                />
                                <div className="flex-1">
                                    <Input
                                        value={valueFormData.hexColor}
                                        onChange={(e) => setValueFormData({ ...valueFormData, hexColor: e.target.value.toUpperCase() })}
                                        placeholder="#FF0000"
                                        maxLength={7}
                                    />
                                </div>
                                {valueFormData.hexColor && (
                                    <button
                                        type="button"
                                        onClick={() => setValueFormData({ ...valueFormData, hexColor: '' })}
                                        className="px-3 py-2 text-sm text-gray-500 hover:text-red-600"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                💡 Si agregas un color, el valor se mostrará como círculo de color en lugar de texto
                            </p>
                        </div>
                    )}

                    <Button type="submit" className="w-full">
                        {editingValue ? 'Actualizar' : 'Agregar'}
                    </Button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
