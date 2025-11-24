import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';

export default function ImageUpload({ images = [], onChange, maxImages = 5 }) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > maxImages) {
            alert(`Máximo ${maxImages} imágenes permitidas`);
            return;
        }

        setUploading(true);
        const newImages = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setUploadProgress(((i + 1) / files.length) * 100);

                const formData = new FormData();
                formData.append('image', file);

                const { data } = await api.post('/upload/product-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                // Cloudinary devuelve el publicId completo (incluyendo folder)
                newImages.push({
                    url: data.url,
                    publicId: data.publicId // Ya viene completo de Cloudinary
                });
            }

            onChange([...images, ...newImages]);
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Error al subir imágenes: ' + (error.response?.data?.error || error.message));
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleRemove = async (index) => {
        const imageToRemove = images[index];

        try {
            // Eliminar de Cloudinary
            await api.delete('/upload/delete-image', {
                data: { publicId: imageToRemove.publicId }
            });

            // Actualizar estado
            const newImages = images.filter((_, i) => i !== index);
            onChange(newImages);
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error al eliminar imagen');
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    Imágenes del Producto ({images.length}/{maxImages})
                </label>
            </div>

            {/* Grid de imágenes - Layout horizontal compacto */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {/* Grid de imágenes - Layout horizontal compacto */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <div key={index} className="relative group flex-shrink-0">
                            <img
                                src={image.url}
                                alt={`Producto ${index + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-1 left-1 bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded">
                                    Principal
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Botón para agregar más imágenes */}
                    {images.length < maxImages && (
                        <label className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-secondary hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={uploading}
                            />
                            {uploading ? (
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary mx-auto mb-1"></div>
                                    <p className="text-[10px] text-gray-500">{uploadProgress.toFixed(0)}%</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                    <span className="text-[10px] text-gray-500">Subir</span>
                                </>
                            )}
                        </label>
                    )}
                </div>

                {images.length === 0 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-1">No hay imágenes</p>
                        <p className="text-xs text-gray-400">La primera imagen será la principal</p>
                    </div>
                )}

                <p className="text-xs text-gray-500">
                    💡 La primera imagen será la imagen principal del producto. Puedes arrastrar para reordenar.
                </p>
            </div>
        </div>
    );

}
