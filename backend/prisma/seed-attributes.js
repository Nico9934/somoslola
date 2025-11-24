import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de atributos...');

    // Limpiar atributos existentes (opcional)
    await prisma.variantAttributeValue.deleteMany();
    await prisma.productAttribute.deleteMany();
    await prisma.attributeValue.deleteMany();
    await prisma.attribute.deleteMany();

    // 1. COLOR
    const colorAttribute = await prisma.attribute.create({
        data: {
            name: 'Color',
            slug: 'color',
            type: 'SELECT',
            sortOrder: 1,
            values: {
                create: [
                    { value: 'Rojo', hexColor: '#FF0000', sortOrder: 1 },
                    { value: 'Azul', hexColor: '#0000FF', sortOrder: 2 },
                    { value: 'Verde', hexColor: '#00FF00', sortOrder: 3 },
                    { value: 'Amarillo', hexColor: '#FFFF00', sortOrder: 4 },
                    { value: 'Negro', hexColor: '#000000', sortOrder: 5 },
                    { value: 'Blanco', hexColor: '#FFFFFF', sortOrder: 6 },
                    { value: 'Gris', hexColor: '#808080', sortOrder: 7 },
                    { value: 'Naranja', hexColor: '#FFA500', sortOrder: 8 },
                    { value: 'Rosa', hexColor: '#FFC0CB', sortOrder: 9 },
                    { value: 'Violeta', hexColor: '#8B00FF', sortOrder: 10 },
                ]
            }
        }
    });
    console.log('✅ Color creado con 10 valores');

    // 2. TALLE / TAMAÑO (Ropa)
    const talleAttribute = await prisma.attribute.create({
        data: {
            name: 'Talle',
            slug: 'talle',
            type: 'SELECT',
            sortOrder: 2,
            values: {
                create: [
                    { value: 'XXS', sortOrder: 1 },
                    { value: 'XS', sortOrder: 2 },
                    { value: 'S', sortOrder: 3 },
                    { value: 'M', sortOrder: 4 },
                    { value: 'L', sortOrder: 5 },
                    { value: 'XL', sortOrder: 6 },
                    { value: 'XXL', sortOrder: 7 },
                    { value: 'XXXL', sortOrder: 8 },
                ]
            }
        }
    });
    console.log('✅ Talle creado con 8 valores');

    // 3. CAPACIDAD (Líquidos)
    const capacidadAttribute = await prisma.attribute.create({
        data: {
            name: 'Capacidad',
            slug: 'capacidad',
            type: 'NUMBER',
            unit: 'ml',
            sortOrder: 3,
            values: {
                create: [
                    { value: '250', sortOrder: 1 },
                    { value: '500', sortOrder: 2 },
                    { value: '750', sortOrder: 3 },
                    { value: '1000', sortOrder: 4 },
                    { value: '1500', sortOrder: 5 },
                    { value: '2000', sortOrder: 6 },
                ]
            }
        }
    });
    console.log('✅ Capacidad creado con 6 valores');

    // 4. MATERIAL
    const materialAttribute = await prisma.attribute.create({
        data: {
            name: 'Material',
            slug: 'material',
            type: 'SELECT',
            sortOrder: 4,
            values: {
                create: [
                    { value: 'Algodón', sortOrder: 1 },
                    { value: 'Poliéster', sortOrder: 2 },
                    { value: 'Algodón/Poliéster', sortOrder: 3 },
                    { value: 'Acero Inoxidable', sortOrder: 4 },
                    { value: 'Plástico', sortOrder: 5 },
                    { value: 'Vidrio', sortOrder: 6 },
                    { value: 'Aluminio', sortOrder: 7 },
                    { value: 'Cerámica', sortOrder: 8 },
                ]
            }
        }
    });
    console.log('✅ Material creado con 8 valores');

    // 5. TAMAÑO NUMÉRICO (Calzado)
    const numeroAttribute = await prisma.attribute.create({
        data: {
            name: 'Número',
            slug: 'numero',
            type: 'NUMBER',
            sortOrder: 5,
            values: {
                create: [
                    { value: '35', sortOrder: 1 },
                    { value: '36', sortOrder: 2 },
                    { value: '37', sortOrder: 3 },
                    { value: '38', sortOrder: 4 },
                    { value: '39', sortOrder: 5 },
                    { value: '40', sortOrder: 6 },
                    { value: '41', sortOrder: 7 },
                    { value: '42', sortOrder: 8 },
                    { value: '43', sortOrder: 9 },
                    { value: '44', sortOrder: 10 },
                    { value: '45', sortOrder: 11 },
                ]
            }
        }
    });
    console.log('✅ Número creado con 11 valores');

    // 6. PESO (para productos vendidos por peso)
    const pesoAttribute = await prisma.attribute.create({
        data: {
            name: 'Peso',
            slug: 'peso',
            type: 'NUMBER',
            unit: 'kg',
            sortOrder: 6,
            values: {
                create: [
                    { value: '0.5', sortOrder: 1 },
                    { value: '1', sortOrder: 2 },
                    { value: '2', sortOrder: 3 },
                    { value: '5', sortOrder: 4 },
                    { value: '10', sortOrder: 5 },
                ]
            }
        }
    });
    console.log('✅ Peso creado con 5 valores');

    // 7. ALTO (Medidas)
    const altoAttribute = await prisma.attribute.create({
        data: {
            name: 'Alto',
            slug: 'alto',
            type: 'NUMBER',
            unit: 'cm',
            sortOrder: 7,
            values: {
                create: [
                    { value: '10', sortOrder: 1 },
                    { value: '15', sortOrder: 2 },
                    { value: '20', sortOrder: 3 },
                    { value: '25', sortOrder: 4 },
                    { value: '30', sortOrder: 5 },
                ]
            }
        }
    });
    console.log('✅ Alto creado con 5 valores');

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('📊 Atributos creados: 7');
    console.log('📦 Valores totales: ~53');
}

main()
    .catch((e) => {
        console.error('❌ Error en seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
