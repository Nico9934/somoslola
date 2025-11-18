import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Estadísticas generales para el panel admin
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Obtiene estadísticas generales del sistema
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get("/summary", authMiddleware, adminOnly, async (_, res) => {
    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });

    const totalSales = await prisma.order.aggregate({
        _sum: { total: true },
    });

    const ticketPromedio =
        totalOrders > 0 ? totalSales._sum.total / totalOrders : 0;

    res.json({
        totalOrders,
        totalCustomers,
        totalSales: totalSales._sum.total ?? 0,
        ticketPromedio,
    });
});

/**
 * @swagger
 * /dashboard/top-products:
 *   get:
 *     summary: Obtiene los productos más vendidos
 *     tags: [Dashboard]
 */
router.get("/top-products", authMiddleware, adminOnly, async (_, res) => {
    const data = await prisma.orderItem.groupBy({
        by: ["variantId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
    });

    const results = [];

    for (const item of data) {
        const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
        });

        results.push({
            product: variant.product.name,
            sku: variant.sku,
            vendidos: item._sum.quantity,
        });
    }

    res.json(results);
});

/**
 * @swagger
 * /dashboard/sales-by-month:
 *   get:
 *     summary: Ventas agrupadas por mes
 *     tags: [Dashboard]
 */
router.get("/sales-by-month", authMiddleware, adminOnly, async (_, res) => {
    const rows = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', "createdAt") AS mes,
      SUM(total) AS total
    FROM "Order"
    GROUP BY mes
    ORDER BY mes ASC;
  `;

    res.json(rows);
});

/**
 * @swagger
 * /dashboard/sales-by-day:
 *   get:
 *     summary: Ventas de los últimos 30 días
 *     tags: [Dashboard]
 */
router.get("/sales-by-day", authMiddleware, adminOnly, async (_, res) => {
    const rows = await prisma.$queryRaw`
    SELECT 
      DATE("createdAt") AS dia,
      SUM(total) AS total
    FROM "Order"
    WHERE "createdAt" >= NOW() - INTERVAL '30 days'
    GROUP BY dia
    ORDER BY dia ASC;
  `;

    res.json(rows);
});

export default router;
