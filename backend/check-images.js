const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
    try {
        const products = await prisma.product.findMany({
            include: {
                variants: {
                    include: {
                        images: true
                    }
                }
            }
        });

        console.log('\n📦 Total productos:', products.length);

        products.forEach(p => {
            console.log(`\n🏷️ Producto: ${p.name} (ID: ${p.id})`);
            console.log(`   Variantes: ${p.variants.length}`);

            p.variants.forEach(v => {
                console.log(`   - SKU: ${v.sku}`);
                console.log(`     Imágenes: ${v.images?.length || 0}`);
                if (v.images && v.images.length > 0) {
                    v.images.forEach(img => {
                        console.log(`       → ${img.url.substring(0, 80)}...`);
                    });
                }
            });
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkImages();
