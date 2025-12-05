import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkCartExpiry() {
    console.log('🔍 === DIAGNÓSTICO DE EXPIRACIÓN DE CARRITO ===\n');

    const now = new Date();
    console.log('⏰ Fecha/Hora ACTUAL del servidor Node.js:');
    console.log('   ISO:', now.toISOString());
    console.log('   Local:', now.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }));
    console.log('   Timestamp:', now.getTime());
    console.log('');

    // Obtener todos los items del carrito
    const allItems = await prisma.cartItem.findMany({
        include: {
            cart: true,
            variant: {
                include: {
                    stock: true,
                    product: true
                }
            }
        }
    });

    console.log(`📦 Total de items en carritos: ${allItems.length}\n`);

    if (allItems.length === 0) {
        console.log('✅ No hay items en carritos actualmente.\n');
    } else {
        for (const item of allItems) {
            const expiresAt = item.expiresAt;
            const reservedAt = item.reservedAt;
            const isExpired = expiresAt < now;
            const timeUntilExpiry = expiresAt.getTime() - now.getTime();
            const minutesUntilExpiry = Math.floor(timeUntilExpiry / 1000 / 60);
            const secondsUntilExpiry = Math.floor((timeUntilExpiry / 1000) % 60);

            console.log(`📌 Item ID: ${item.id}`);
            console.log(`   Producto: ${item.variant.product.name}`);
            console.log(`   SKU: ${item.variant.sku}`);
            console.log(`   Cantidad: ${item.quantity}`);
            console.log(`   Reservado en: ${reservedAt ? reservedAt.toISOString() : 'N/A'}`);
            console.log(`   Expira en: ${expiresAt.toISOString()}`);
            console.log(`   Estado: ${isExpired ? '❌ EXPIRADO' : '✅ VIGENTE'}`);

            if (!isExpired) {
                console.log(`   Tiempo restante: ${minutesUntilExpiry}m ${secondsUntilExpiry}s`);
            } else {
                console.log(`   Expiró hace: ${Math.abs(minutesUntilExpiry)}m ${Math.abs(secondsUntilExpiry)}s`);
            }

            console.log(`   Stock total: ${item.variant.stock.quantity}`);
            console.log(`   Stock reservado: ${item.variant.stock.reservedQty}`);
            console.log('');
        }
    }

    // Verificar items expirados
    const expiredItems = await prisma.cartItem.findMany({
        where: {
            expiresAt: {
                lt: now
            }
        }
    });

    console.log(`⚠️  Items EXPIRADOS encontrados: ${expiredItems.length}`);

    if (expiredItems.length > 0) {
        console.log('   Estos items deberían ser limpiados por el cron job.\n');
    }

    // Ver información de stocks con reservas
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

    console.log(`📊 Stocks con reservas activas: ${stocksWithReservations.length}\n`);

    for (const stock of stocksWithReservations) {
        console.log(`   • ${stock.variant.product.name} (${stock.variant.sku})`);
        console.log(`     Total: ${stock.quantity} | Reservado: ${stock.reservedQty} | Disponible: ${stock.quantity - stock.reservedQty}`);
    }

    console.log('\n🔍 === FIN DIAGNÓSTICO ===');

    await prisma.$disconnect();
}

checkCartExpiry().catch(console.error);
