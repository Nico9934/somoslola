import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Testear que el hash funciona correctamente
const testAuth = async () => {
    console.log('\n🔍 DIAGNÓSTICO DE AUTENTICACIÓN\n');
    console.log('='.repeat(50));
    
    // 1. Testear bcrypt
    console.log('\n1️⃣ Test de bcrypt:');
    const password = 'prueba1';
    const hash = await bcrypt.hash(password, 10);
    console.log('   Password:', password);
    console.log('   Hash generado:', hash);
    
    const isValid = await bcrypt.compare(password, hash);
    console.log('   ✅ Verifica correctamente:', isValid);
    
    // 2. Verificar usuarios en BD
    console.log('\n2️⃣ Usuarios en la base de datos:');
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            password: true,
            role: true
        }
    });
    
    console.log(`   Total usuarios: ${users.length}\n`);
    
    for (const user of users) {
        console.log(`   📧 ${user.email}`);
        console.log(`      Role: ${user.role}`);
        console.log(`      Hash: ${user.password.substring(0, 20)}...`);
        
        // Testear contraseña común
        if (user.email === 'prueba1@test.com') {
            const testPassword = 'prueba1';
            const match = await bcrypt.compare(testPassword, user.password);
            console.log(`      🔐 Password "${testPassword}" ${match ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        }
        
        if (user.email === 'admin@somoslola.com') {
            const testPassword = 'admin123';
            const match = await bcrypt.compare(testPassword, user.password);
            console.log(`      🔐 Password "${testPassword}" ${match ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        }
        
        console.log('');
    }
    
    console.log('='.repeat(50));
    
    await prisma.$disconnect();
};

testAuth().catch(console.error);
