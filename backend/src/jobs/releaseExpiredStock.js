import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function releaseExpiredStock() {
  try {
    const now = new Date();

    const expired = await prisma.cartItem.findMany({
      where: { expiresAt: { lt: now } },
      include: {
        variant: {
          include: {
            stock: true,
            product: true
          }
        }
      }
    });

    if (expired.length === 0) {
      return; // No hay items expirados
    }

    console.log(`♻️ [${now.toISOString()}] Procesando ${expired.length} reservas expiradas...`);

    for (const item of expired) {
      try {
        // Usar transacción para garantizar atomicidad
        await prisma.$transaction(async (tx) => {
          // Liberar stock reservado
          await tx.stock.update({
            where: { variantId: item.variantId },
            data: {
              reservedQty: {
                decrement: item.quantity
              }
            }
          });

          // Eliminar item del carrito
          await tx.cartItem.delete({ where: { id: item.id } });
        });

        console.log(`   ✅ Liberado: ${item.variant.product.name} (${item.variant.sku}) - Qty: ${item.quantity}`);
      } catch (error) {
        console.error(`   ❌ Error liberando item ${item.id}:`, error.message);
        // Continuar con los demás items aunque uno falle
      }
    }

    console.log(`♻️ Liberación completada: ${expired.length} items procesados`);
  } catch (error) {
    console.error('❌ Error en releaseExpiredStock:', error);
  }
}
