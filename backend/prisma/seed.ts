import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@assetflow.com',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const itDept = await prisma.department.upsert({
    where: { name: 'IT Support' },
    update: {},
    create: {
      name: 'IT Support',
      status: 'ACTIVE',
    }
  });

  const laptopCategory = await prisma.assetCategory.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: {
      name: 'Laptops',
      description: 'Company Laptops',
    }
  });

  console.log('Seed successful.', { admin: admin.email, itDept: itDept.name, laptopCategory: laptopCategory.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
