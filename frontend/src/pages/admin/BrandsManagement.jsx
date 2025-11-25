import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';

export default function BrandsManagement() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        logo: ''
    });

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        try {
            const { data } = await api.get('/brands');
            setBrands(data);
        } catch (error) {
            console.error('Error loading brands:', error);
            toast.error('Error al cargar marcas');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (brand = null) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                logo: brand.logo || ''
            });
        } else {
            setEditingBrand(null);
            setFormData({ name: '', logo: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingBrand) {
                await api.put(`/brands/${editingBrand.id}`, formData);
                toast.success('Marca actualizada');
            } else {
                await api.post('/brands', formData);
                toast.success('Marca creada');
            }

            setIsModalOpen(false);
            loadBrands();
        } catch (error) {
            console.error('Error al guardar marca:', error);
            toast.error(error.response?.data?.error || 'Error al guardar marca');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta marca?')) return;

        try {
            await api.delete(`/brands/${id}`);
            toast.success('Marca eliminada');
            loadBrands();
        } catch (error) {
            console.error('Error al eliminar marca:', error);
            toast.error(error.response?.data?.error || 'Error al eliminar marca');
        }
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                title="Marcas"
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                onCreateClick={() => handleOpenModal()}
            >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBrands.map((brand) => (
                        <Card key={brand.id}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {brand.logo && (
                                        <img
                                            src={brand.logo}
                                            alt={brand.name}
                                            className="h-12 w-12 object-contain mb-2"
                                        />
                                    )}
                                    <h3 className="text-lg font-semibold text-primary">{brand.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {brand._count?.products || 0} producto(s)
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenModal(brand)}
                                    >
                                        ✏️
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(brand.id)}
                                    >
                                        🗑️
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </AdminPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingBrand ? 'Editar Marca' : 'Nueva Marca'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Ej: Nike, Adidas..."
                    />
                    <Input
                        label="Logo URL (opcional)"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="https://ejemplo.com/logo.png"
                    />
                    <Button type="submit" className="w-full">
                        {editingBrand ? 'Actualizar' : 'Crear'}
                    </Button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
