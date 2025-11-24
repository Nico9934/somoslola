# 📸 Sistema de Imágenes con Cloudinary

## Descripción General

Sistema completo de carga y gestión de imágenes de productos utilizando Cloudinary como servicio de almacenamiento en la nube.

## Arquitectura

```
Frontend (React)
    ↓
ImageUpload Component
    ↓ FormData (multipart/form-data)
Backend (Express)
    ↓
Multer Middleware (memory storage)
    ↓
Cloudinary API
    ↓
Cloud Storage (somoslola/products)
```

## Componentes

### 1. Backend - Upload Route (`backend/src/routes/upload.js`)

**Endpoint POST /upload/product-image**
- Middleware: `multer.single('image')`
- Configuración:
  - Storage: Memory (buffer-based)
  - File size limit: 5MB
  - File filter: Solo imágenes (jpg, jpeg, png, gif, webp)
  
- Proceso:
  1. Recibe el archivo en memoria
  2. Valida tamaño y tipo
  3. Sube a Cloudinary usando buffer
  4. Aplica transformaciones:
     - Resize: max 1000x1000px
     - Quality: auto
     - Folder: somoslola/products
  5. Retorna: `{ url, publicId }`

**Endpoint DELETE /upload/delete-image**
- Body: `{ publicId: "somoslola/products/abc123" }`
- Elimina imagen de Cloudinary
- Retorna: `{ message: "Imagen eliminada" }`

### 2. Frontend - ImageUpload Component (`frontend/src/components/admin/ImageUpload.jsx`)

**Props:**
- `images`: Array de objetos `{ url, publicId }`
- `onChange`: Callback que recibe el nuevo array de imágenes
- `maxImages`: Número máximo de imágenes (default: 5)

**Características:**
- Drag & drop (TODO)
- Preview de imágenes en grid
- Indicador de carga con progreso
- Botón de eliminar por imagen
- Marca la primera como "Principal"
- Validación de límite de imágenes

**Estados:**
- `uploading`: Boolean, indica si hay upload en progreso
- `uploadProgress`: Number (0-100), porcentaje de progreso

### 3. Integración en ProductFormUnified

**Estado:**
```javascript
const [images, setImages] = useState([]);
```

**Carga en Edit Mode:**
```javascript
// Cargar imágenes existentes del producto
if (product.images && product.images.length > 0) {
    const existingImages = product.images.map(img => {
        // Extrae publicId de URL de Cloudinary
        const publicId = extractPublicId(img.url);
        return { url: img.url, publicId };
    });
    setImages(existingImages);
}
```

**Guardado (Create/Update):**
```javascript
// En handleSubmit
const data = {
    name: formData.name,
    description: formData.description,
    categoryId: parseInt(formData.categoryId),
    images: images.map(img => ({ url: img.url })), // Solo enviar URLs
    variants: [...]
};
```

### 4. Backend - Products Routes

**POST /products**
```javascript
const product = await prisma.product.create({
    data: {
        name,
        description,
        categoryId,
        images: images && images.length > 0 ? {
            create: images.map(img => ({ url: img.url }))
        } : undefined,
        variants: {...}
    }
});
```

**PUT /products/:id**
```javascript
// Actualizar imágenes: eliminar existentes y crear nuevas
if (images !== undefined) {
    await prisma.productImage.deleteMany({
        where: { productId: id }
    });
    
    updateData.images = {
        create: images.map(img => ({ url: img.url }))
    };
}
```

**GET /products y GET /products/:id**
```javascript
include: {
    images: true, // Incluir imágenes en la respuesta
    variants: {...},
    category: true
}
```

## Base de Datos

**Modelo ProductImage:**
```prisma
model ProductImage {
  id        Int     @id @default(autoincrement())
  url       String
  productId Int
  product   Product @relation(fields: [productId], references: [id])
}
```

**Relación en Product:**
```prisma
model Product {
  id          Int                @id @default(autoincrement())
  name        String
  description String?
  categoryId  Int
  images      ProductImage[]     // Relación uno a muchos
  variants    ProductVariant[]
  // ...
}
```

## Flujo de Trabajo

### Crear Producto con Imágenes

1. Usuario selecciona imágenes en ImageUpload component
2. ImageUpload sube cada archivo a Cloudinary
3. Cloudinary retorna URL y publicId
4. URLs se almacenan en estado `images`
5. Al guardar producto, se envían URLs al backend
6. Backend crea registros en ProductImage con las URLs

### Editar Producto

1. Se cargan imágenes existentes del producto
2. Se extraen publicIds de las URLs para permitir eliminación
3. Usuario puede agregar/eliminar imágenes
4. Al guardar:
   - Se eliminan TODAS las imágenes existentes
   - Se crean nuevas con el array actualizado
   - Las imágenes eliminadas de Cloudinary quedan huérfanas (TODO: cleanup)

### Eliminar Imagen

1. Usuario hace click en botón X de una imagen
2. Se llama a DELETE /upload/delete-image con publicId
3. Cloudinary elimina la imagen
4. Se actualiza el estado local removiendo la imagen del array

## Configuración Cloudinary

**Archivo:** `backend/src/config/cloudinary.js`

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
```

**Variables de Entorno (.env):**
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Transformaciones de Imagen

Todas las imágenes subidas se transforman automáticamente:

```javascript
{
    folder: 'somoslola/products',
    resource_type: 'image',
    transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' }
    ]
}
```

- **crop: 'limit'**: Redimensiona solo si la imagen es más grande
- **quality: 'auto'**: Cloudinary optimiza automáticamente
- **folder**: Organiza por carpetas en Cloudinary

## Mejoras Futuras (TODO)

- [ ] Drag & drop real (react-dropzone)
- [ ] Reordenar imágenes (drag to reorder)
- [ ] Crop/resize antes de subir
- [ ] Múltiples tamaños (thumbnails, medium, large)
- [ ] Lazy loading de imágenes
- [ ] Progressive image loading (blur-up)
- [ ] Cleanup automático de imágenes huérfanas
- [ ] Comprimir antes de subir (client-side)
- [ ] Galería con lightbox
- [ ] Zoom en hover

## Testing

### Prueba Manual

1. Ir a `/admin/products/new`
2. Completar nombre, descripción, categoría
3. Hacer click en "Subir imagen"
4. Seleccionar 1-5 imágenes (max 5MB cada una)
5. Verificar preview de imágenes
6. Eliminar alguna imagen (click en X)
7. Generar variantes
8. Guardar producto
9. Verificar que las imágenes se guardaron
10. Editar el producto
11. Verificar que las imágenes se cargan
12. Agregar/eliminar imágenes
13. Guardar cambios

### Casos de Error

- Intentar subir archivo > 5MB → Error
- Intentar subir archivo no-imagen → Error
- Intentar subir más de 5 imágenes → Alerta
- Error de red al subir → Mensaje de error

## Logs y Debug

**Backend:**
```bash
🖼️ Actualizando imágenes del producto...
   ✅ Imágenes existentes eliminadas
   ✅ 3 nuevas imágenes agregadas
```

**Frontend:**
```javascript
console.log('🖼️ Imágenes existentes:', product.images.length);
```

## Seguridad

- ✅ Validación de tipo MIME en backend
- ✅ Límite de tamaño de archivo (5MB)
- ✅ Solo usuarios admin pueden subir imágenes
- ✅ Buffer-based upload (más seguro que disk storage)
- ⚠️ TODO: Validar dimensiones mínimas/máximas
- ⚠️ TODO: Escaneo de malware
- ⚠️ TODO: Rate limiting en upload endpoint
