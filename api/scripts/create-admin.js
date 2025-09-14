import { prisma } from '../src/libs/prisma.ts';
import bcrypt from 'bcrypt';

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@cupcakes.com',
        passwordHash,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Admin criado com sucesso:', {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Email já existe!');
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

createAdmin()
  .finally(() => prisma.$disconnect());