import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fixStockReservations() {
    console.log('🔧 === REPARACIÓN DE RESERVAS DE STOCK ===\n');

    // 1. Obtener todos los stocks con reservas
    const stocksWithReservations = await prisma.stock.findMany({
        where: {
            reservedQty: {
                gt: 0
            }
        },
        include: {
            variant: {
                include: {
                    product: true
                }
            }
        }
    });

    console.log(`📊 Total de stocks con reservas: ${stocksWithReservations.length}\n`);

    for (const stock of stocksWithReservations) {
        console.log(`\n🔍 Analizando: ${stock.variant.product.name} (${stock.variant.sku})`);
        console.log(`   Stock actual - Total: ${stock.quantity} | Reservado: ${stock.reservedQty}`);

        // Buscar todos los items en carritos para esta variante
        const cartItems = await prisma.cartItem.findMany({
            where: {
                variantId: stock.variantId
            }
        });

        const totalReservedInCarts = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        console.log(`   Items en carritos: ${cartItems.length}`);
        console.log(`   Cantidad total en carritos: ${totalReservedInCarts}`);
        console.log(`   Diferencia: ${stock.reservedQty - totalReservedInCarts}`);

        if (stock.reservedQty !== totalReservedInCarts) {
            console.log(`   ⚠️  INCONSISTENCIA DETECTADA!`);
            console.log(`   Corrigiendo reservedQty de ${stock.reservedQty} a ${totalReservedInCarts}...`);

            await prisma.stock.update({
                where: { id: stock.id },
                data: { reservedQty: totalReservedInCarts }
            });

            console.log(`   ✅ Corregido!`);
        } else {
            console.log(`   ✅ Stock consistente`);
        }
    }

    // 2. Verificar stocks con reservedQty negativo
    const negativeStocks = await prisma.stock.findMany({
        where: {
            reservedQty: {
                lt: 0
            }
        },
        include: {
            variant: {
                include: {
                    product: true
                }
            }
        }
    });

    if (negativeStocks.length > 0) {
        console.log(`\n⚠️  Stocks con reservas NEGATIVAS: ${negativeStocks.length}`);
        for (const stock of negativeStocks) {
            console.log(`   • ${stock.variant.product.name} (${stock.variant.sku}): ${stock.reservedQty}`);
            console.log(`     Corrigiendo a 0...`);
            await prisma.stock.update({
                where: { id: stock.id },
                data: { reservedQty: 0 }
            });
            console.log(`     ✅ Corregido!`);
        }
    }

    console.log('\n\n📊 === RESUMEN FINAL ===');

    const finalStocks = await prisma.stock.findMany({
        where: {
            reservedQty: {
                gt: 0
            }
        },
        include: {
            variant: {
                include: {
                    product: true
                }
            }
        }
    });

    for (const stock of finalStocks) {
        const available = stock.quantity - stock.reservedQty;
        console.log(`\n   ${stock.variant.product.name} (${stock.variant.sku})`);
        console.log(`   Total: ${stock.quantity} | Reservado: ${stock.reservedQty} | Disponible: ${available}`);
    }

    console.log('\n✅ === REPARACIÓN COMPLETADA ===\n');

    await prisma.$disconnect();
}

fixStockReservations().catch(console.error);
