import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Valida y corrige la integridad de las reservas de stock al inicio del servidor
 * Esto previene que inconsistencias antiguas afecten el funcionamiento en producción
 */
export async function validateStockIntegrity() {
    console.log('🔍 Validando integridad de stock...');

    try {
        let fixedCount = 0;

        // 1. Obtener todos los stocks con reservas
        const stocksWithReservations = await prisma.stock.findMany({
            where: {
                OR: [
                    { reservedQty: { gt: 0 } },
                    { reservedQty: { lt: 0 } }
                ]
            },
            include: {
                variant: {
                    include: {
                        product: true
                    }
                }
            }
        });

        for (const stock of stocksWithReservations) {
            // Calcular reservas reales en carritos
            const cartItems = await prisma.cartItem.findMany({
                where: { variantId: stock.variantId }
            });

            const actualReserved = cartItems.reduce((sum, item) => sum + item.quantity, 0);

            // Si hay diferencia, corregir
            if (stock.reservedQty !== actualReserved) {
                console.warn(`⚠️  Inconsistencia en ${stock.variant.product.name} (${stock.variant.sku})`);
                console.warn(`   DB: ${stock.reservedQty} reservados | Real: ${actualReserved} en carritos`);

                await prisma.stock.update({
                    where: { id: stock.id },
                    data: { reservedQty: actualReserved }
                });

                console.log(`   ✅ Corregido a ${actualReserved}`);
                fixedCount++;
            }
        }

        // 2. Limpiar items expirados que el cron pudo haber dejado
        const now = new Date();
        const expiredItems = await prisma.cartItem.findMany({
            where: { expiresAt: { lt: now } }
        });

        if (expiredItems.length > 0) {
            console.warn(`⚠️  Encontrados ${expiredItems.length} items expirados`);

            for (const item of expiredItems) {
                await prisma.$transaction(async (tx) => {
                    await tx.stock.update({
                        where: { variantId: item.variantId },
                        data: { reservedQty: { decrement: item.quantity } }
                    });
                    await tx.cartItem.delete({ where: { id: item.id } });
                });
            }

            console.log(`   ✅ Limpiados ${expiredItems.length} items expirados`);
            fixedCount += expiredItems.length;
        }

        if (fixedCount === 0) {
            console.log('✅ Integridad de stock verificada - Todo OK');
        } else {
            console.log(`✅ Integridad de stock restaurada - ${fixedCount} correcciones aplicadas`);
        }

    } catch (error) {
        console.error('❌ Error validando integridad de stock:', error);
        // No lanzar error para no detener el inicio del servidor
    }
}
