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
        fileSize: 10 * 1024 * 1024, // 10MB máximo
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

        // Subir a Cloudinary usando buffer con alta calidad
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'somoslola/products',
                    resource_type: 'image',
                    transformation: [
                        { width: 2000, height: 2000, crop: 'limit' },
                        { quality: 90 }
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

        // Manejar errores específicos de Multer
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'El archivo es demasiado grande. Máximo 10MB permitido.'
            });
        }

        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});

/**
 * @swagger
 * /api/upload/payment-proof:
 *   post:
 *     summary: Subir comprobante de pago (cualquier usuario autenticado)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 */
router.post('/payment-proof', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        console.log('\n📄 POST /upload/payment-proof - Subir comprobante de pago');

        if (!req.file) {
            console.log('❌ No se recibió archivo');
            return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
        }

        console.log('📋 Archivo recibido:', {
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: `${(req.file.size / 1024).toFixed(2)} KB`
        });

        // Subir a Cloudinary con alta calidad
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'somoslola/payment-proofs',
                    resource_type: 'image',
                    transformation: [
                        { width: 2000, height: 2000, crop: 'limit' },
                        { quality: 90 }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        console.log('✅ Comprobante subido a Cloudinary:', result.secure_url);

        res.json({
            url: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('❌ Error al subir comprobante:', error);
        res.status(500).json({ error: 'Error al subir el comprobante' });
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

// Middleware para manejar errores de Multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'El archivo es demasiado grande. Máximo 10MB permitido.'
            });
        }
        return res.status(400).json({ error: error.message });
    }

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    next();
});

export default router;
