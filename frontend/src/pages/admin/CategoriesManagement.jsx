import { useState, useEffect } from 'react';
import { categoriesService } from '../../api/categories';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

export default function CategoriesManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoriesService.getAll();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
        } else {
            setEditingCategory(null);
            setName('');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await categoriesService.update(editingCategory.id, name);
            } else {
                await categoriesService.create(name);
            }

            setIsModalOpen(false);
            loadCategories();
        } catch (error) {
            alert('Error al guardar categoría');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

        try {
            await categoriesService.delete(id);
            loadCategories();
        } catch (error) {
            alert('Error al eliminar categoría');
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                title="Categorías"
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                onCreateClick={() => handleOpenModal()}
            >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category) => (
                        <Card key={category.id}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-primary">{category.name}</h3>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenModal(category)}
                                    >
                                        ✏️
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(category.id)}
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
                title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Ej: Remeras, Pantalones..."
                    />
                    <Button type="submit" className="w-full">
                        {editingCategory ? 'Actualizar' : 'Crear'}
                    </Button>
                </form>
            </Modal>
        </AdminLayout>
    );
}
