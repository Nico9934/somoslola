import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Configurar Multer para usar memoria (buffer)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        // Solo permitir imágenes
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'), false);
        }
    }
});

/**
 * @swagger
 * /api/upload/product-image:
 *   post:
 *     summary: Subir imagen de producto a Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 publicId:
 *                   type: string
 */
router.post('/product-image', authMiddleware, adminOnly, upload.single('image'), async (req, res) => {
    try {
        console.log('\n📸 POST /upload/product-image - Subir imagen');

        if (!req.file) {
            console.log('❌ No se recibió archivo');
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }

        console.log('📋 Archivo recibido:', {
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: `${(req.file.size / 1024).toFixed(2)} KB`
        });

        // Subir a Cloudinary usando buffer
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'somoslola/products',
                    resource_type: 'image',
                    transformation: [
                        { width: 1000, height: 1000, crop: 'limit' },
                        { quality: 'auto:good' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        console.log('✅ Imagen subida a Cloudinary:', result.secure_url);

        res.json({
            url: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('❌ Error al subir imagen:', error);
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});

/**
 * @swagger
 * /api/upload/delete-image:
 *   delete:
 *     summary: Eliminar imagen de Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Imagen eliminada
 */
router.delete('/delete-image', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { publicId } = req.body;
        console.log('\n🗑️ DELETE /upload/delete-image - Eliminar imagen');
        console.log('Public ID:', publicId);

        if (!publicId) {
            return res.status(400).json({ error: 'Se requiere el publicId' });
        }

        const result = await cloudinary.uploader.destroy(publicId);
        console.log('✅ Imagen eliminada:', result);

        res.json({ message: 'Imagen eliminada exitosamente', result });
    } catch (error) {
        console.error('❌ Error al eliminar imagen:', error);
        res.status(500).json({ error: 'Error al eliminar la imagen' });
    }
});

export default router;
