import { useState, useEffect } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { toast } from 'react-toastify';
import { ArrowUp, ArrowDown } from 'lucide-react';

export default function HeroBannersManagement() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBanner, setEditingBanner] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        imageUrl: '',
        link: '',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const { data } = await api.get('/hero-banners?includeInactive=true');
            setBanners(data);
        } catch (error) {
            console.error('❌ Error al cargar banners:', error);
            toast.error('Error al cargar banners');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño del archivo (10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB en bytes
        if (file.size > maxSize) {
            toast.error('El archivo es demasiado grande. Máximo 10MB permitido.');
            e.target.value = ''; // Limpiar el input
            return;
        }

        setUploadingImage(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const { data } = await api.post('/upload/product-image', formDataUpload);
            setFormData(prev => ({ ...prev, imageUrl: data.url }));
            toast.success('Imagen subida exitosamente');
        } catch (error) {
            console.error('❌ Error al subir imagen:', error);
            const errorMessage = error.response?.data?.error || 'Error al subir imagen';
            toast.error(errorMessage);
            e.target.value = ''; // Limpiar el input en caso de error
        } finally {
            setUploadingImage(false);
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            imageUrl: banner.imageUrl,
            link: banner.link || '',
            order: banner.order,
            isActive: banner.isActive
        });
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditingBanner(null);
        setFormData({
            title: '',
            subtitle: '',
            imageUrl: '',
            link: '',
            order: 0,
            isActive: true
        });
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.imageUrl) {
            toast.error('La imagen es requerida');
            return;
        }

        try {
            if (editingBanner) {
                await api.put(`/hero-banners/${editingBanner.id}`, formData);
                toast.success('Banner actualizado');
            } else {
                await api.post('/hero-banners', formData);
                toast.success('Banner creado');
            }

            fetchBanners();
            handleCancel();
        } catch (error) {
            console.error('❌ Error al guardar banner:', error);
            toast.error(error.response?.data?.error || 'Error al guardar banner');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este banner?')) return;

        try {
            await api.delete(`/hero-banners/${id}`);
            toast.success('Banner eliminado');
            fetchBanners();
        } catch (error) {
            console.error('❌ Error al eliminar banner:', error);
            toast.error('Error al eliminar banner');
        }
    };

    const handleToggleActive = async (banner) => {
        try {
            await api.put(`/hero-banners/${banner.id}`, {
                ...banner,
                isActive: !banner.isActive
            });
            toast.success(banner.isActive ? 'Banner desactivado' : 'Banner activado');
            fetchBanners();
        } catch (error) {
            console.error('❌ Error al actualizar banner:', error);
            toast.error('Error al actualizar banner');
        }
    };

    const handleReorder = async (id, direction) => {
        const index = banners.findIndex(b => b.id === id);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === banners.length - 1)
        ) {
            return;
        }

        const newBanners = [...banners];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBanners[index], newBanners[swapIndex]] = [newBanners[swapIndex], newBanners[index]];

        // Actualizar órdenes
        try {
            await Promise.all(
                newBanners.map((banner, idx) =>
                    api.put(`/hero-banners/${banner.id}`, { ...banner, order: idx })
                )
            );
            fetchBanners();
        } catch (error) {
            console.error('❌ Error al reordenar:', error);
            toast.error('Error al reordenar');
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
                title="Banners del Hero"
                showSearch={false}
                showCreateButton={false}
            >
                <div className="mb-4 flex justify-end">
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancelar' : '+ Nuevo Banner'}
                    </Button>
                </div>

                {/* Formulario */}
                {showForm && (
                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Imagen * <span className="text-xs text-gray-500">(Recomendado: 1920x600px)</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="NUEVA COLECCIÓN"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Subtítulo (opcional)</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    placeholder="Descubre las últimas tendencias"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Imagen * <span className="text-xs text-gray-500">(Recomendado: 1920x600px, máx. 10MB)</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    disabled={uploadingImage}
                                />
                                {uploadingImage && <p className="text-sm text-gray-500 mt-1">Subiendo...</p>}
                                {formData.imageUrl && (
                                    <img
                                        src={formData.imageUrl}
                                        alt="Preview"
                                        className="mt-2 h-32 w-full object-cover rounded"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Link (opcional)</label>
                                <input
                                    type="text"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    placeholder="/products?category=nueva-coleccion"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-4 h-4"
                                />
                                <label className="text-sm font-medium">Banner activo</label>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="submit" disabled={uploadingImage}>
                                    {editingBanner ? 'Actualizar' : 'Crear'}
                                </Button>
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancelar
                                </Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Lista de banners */}
                <div className="space-y-4">
                    {banners.length === 0 ? (
                        <Card>
                            <p className="text-center text-gray-500 py-8">No hay banners configurados</p>
                        </Card>
                    ) : (
                        banners.map((banner, index) => (
                            <Card key={banner.id}>
                                <div className="flex gap-4">
                                    <img
                                        src={banner.imageUrl}
                                        alt={banner.title}
                                        className="w-32 h-20 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{banner.title}</h3>
                                        {banner.subtitle && (
                                            <p className="text-sm text-gray-600">{banner.subtitle}</p>
                                        )}
                                        <div className="flex gap-2 mt-2">
                                            <span className={`text-xs px-2 py-1 rounded ${banner.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {banner.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                                Orden: {banner.order}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReorder(banner.id, 'up')}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReorder(banner.id, 'down')}
                                                disabled={index === banners.length - 1}
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleToggleActive(banner)}
                                            >
                                                {banner.isActive ? '👁️' : '🚫'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(banner)}
                                            >
                                                ✏️
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(banner.id)}
                                            >
                                                🗑️
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </AdminPageLayout>
        </AdminLayout>
    );
}
