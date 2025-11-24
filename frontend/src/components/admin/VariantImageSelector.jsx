import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';

export default function VariantImageSelector({ image, onChange }) {
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const { data } = await api.post('/upload/product-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            onChange({
                url: data.url,
                publicId: data.publicId
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir imagen: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!image) return;

        try {
            await api.delete('/upload/delete-image', {
                data: { publicId: image.publicId }
            });
            onChange(null);
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error al eliminar imagen');
        }
    };

    return (
        <div className="flex items-center justify-center">
            {image ? (
                <div className="relative group">
                    <img
                        src={image.url}
                        alt="Variante"
                        className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />
                    {uploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-secondary"></div>
                    ) : (
                        <Upload className="w-5 h-5 text-gray-400" />
                    )}
                </label>
            )}
        </div>
    );
}
