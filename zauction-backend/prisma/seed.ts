// Seed script to create initial admin user
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zauction.com' },
    update: {},
    create: {
      email: 'admin@zauction.com',
      passwordHash: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
      status: 'approved',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create regular test user
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@zauction.com' },
    update: {},
    create: {
      email: 'user@zauction.com',
      passwordHash: userPassword,
      fullName: 'Test User',
      role: 'user',
      status: 'approved',
    },
  });

  console.log('✅ Test user created:', user.email);
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@zauction.com / admin123');
  console.log('User:  user@zauction.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
