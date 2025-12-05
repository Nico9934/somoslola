import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.js";
import emailService from "../services/emailService.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario (cliente o admin)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, ADMIN]
 *                 default: CUSTOMER
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: El email ya está registrado
 */
router.post("/register", async (req, res) => {
    const { email, password, role = "CUSTOMER", guestCartId } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "El email ya está registrado" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, role } });

    // 🛒 Migrar carrito guest al nuevo usuario
    if (guestCartId) {
        try {
            const guestCart = await prisma.cart.findUnique({
                where: { id: guestCartId },
                include: { items: true }
            });

            if (guestCart && guestCart.userId === null && guestCart.items.length > 0) {
                console.log(`🔄 Migrando carrito guest #${guestCartId} a nuevo usuario #${user.id}`);

                // Crear carrito para el nuevo usuario con los items del guest
                const userCart = await prisma.cart.create({
                    data: { userId: user.id }
                });

                // Transferir todos los items
                await prisma.cartItem.updateMany({
                    where: { cartId: guestCartId },
                    data: {
                        cartId: userCart.id,
                        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
                    }
                });

                // Eliminar carrito guest
                await prisma.cart.delete({ where: { id: guestCartId } });
                console.log(`✅ Carrito migrado exitosamente`);
            }
        } catch (error) {
            console.error('❌ Error al migrar carrito:', error);
            // No fallar el registro por error en migración
        }
    }

    res.json({ message: "Usuario registrado correctamente" });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión (admin o cliente)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Devuelve un token JWT
 */

router.post("/login", async (req, res) => {
    const { email, password, guestCartId } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    // 🛒 Migrar carrito guest al usuario autenticado
    if (guestCartId) {
        try {
            const guestCart = await prisma.cart.findUnique({
                where: { id: guestCartId },
                include: { items: true }
            });

            if (guestCart && guestCart.userId === null && guestCart.items.length > 0) {
                console.log(`🔄 Migrando carrito guest #${guestCartId} a usuario #${user.id}`);

                // Buscar o crear carrito del usuario
                let userCart = await prisma.cart.findFirst({
                    where: { userId: user.id },
                    include: { items: true }
                });

                if (!userCart) {
                    userCart = await prisma.cart.create({
                        data: { userId: user.id },
                        include: { items: true }
                    });
                }

                // Migrar items del guest cart al user cart
                for (const guestItem of guestCart.items) {
                    // Verificar si el usuario ya tiene ese item
                    const existingItem = userCart.items.find(
                        item => item.variantId === guestItem.variantId
                    );

                    if (existingItem) {
                        // Sumar cantidades
                        await prisma.cartItem.update({
                            where: { id: existingItem.id },
                            data: {
                                quantity: existingItem.quantity + guestItem.quantity,
                                expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Renovar expiración
                            }
                        });
                        console.log(`✅ Item existente actualizado: variant #${guestItem.variantId}`);
                    } else {
                        // Transferir item al carrito del usuario
                        await prisma.cartItem.update({
                            where: { id: guestItem.id },
                            data: {
                                cartId: userCart.id,
                                expiresAt: new Date(Date.now() + 5 * 60 * 1000) // Renovar expiración
                            }
                        });
                        console.log(`✅ Item migrado: variant #${guestItem.variantId}`);
                    }
                }

                // Eliminar carrito guest vacío
                await prisma.cart.delete({ where: { id: guestCartId } });
                console.log(`🗑️ Carrito guest #${guestCartId} eliminado`);
            }
        } catch (error) {
            console.error('❌ Error al migrar carrito:', error);
            // No fallar el login por error en migración
        }
    }

    res.json({ token });
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtiene los datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: No autorizado
 */
router.get("/me", authMiddleware, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, role: true }
    });

    res.json(user);
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Código de recuperación enviado al email
 *       404:
 *         description: Email no registrado
 */
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        // Verificar que el email existe
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "Email no registrado" });
        }

        // Generar código de 6 dígitos
        const token = Math.floor(100000 + Math.random() * 900000).toString();

        // Expiración en 15 minutos
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Invalidar tokens anteriores del mismo email
        await prisma.passwordResetToken.deleteMany({
            where: { email, used: false }
        });

        // Guardar token en la base de datos
        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expiresAt,
                used: false
            }
        });

        // Enviar email con el código
        await emailService.sendPasswordRecovery(email, token);

        res.json({
            message: "Código de recuperación enviado a tu email",
            expiresIn: 15 // minutos
        });
    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).json({ error: "Error al procesar solicitud" });
    }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablece la contraseña usando el código recibido
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *                 description: Código de 6 dígitos
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Código inválido o expirado
 *       404:
 *         description: Email no registrado
 */
router.post("/reset-password", async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        // Verificar que el email existe
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "Email no registrado" });
        }

        // Buscar token válido
        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                email,
                token,
                used: false,
                expiresAt: { gte: new Date() }
            }
        });

        if (!resetToken) {
            return res.status(400).json({
                error: "Código inválido o expirado. Solicita uno nuevo."
            });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        // Marcar token como usado
        await prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true }
        });

        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).json({ error: "Error al restablecer contraseña" });
    }
});

export default router;
