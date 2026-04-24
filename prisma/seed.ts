import bcrypt from 'bcryptjs';
import { getPrisma } from '../lib/prisma'

const prisma = getPrisma()

async function main() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? 'jmoquendo@admin.com'
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? 'Jmokendo31$'

  const rolex = await prisma.brand.upsert({
    where: { slug: 'rolex' },
    update: {},
    create: { name: 'Rolex', slug: 'rolex' },
  })

  const omega = await prisma.brand.upsert({
    where: { slug: 'omega' },
    update: {},
    create: { name: 'Omega', slug: 'omega' },
  })

  const watchModels = [
    { name: 'Submariner', reference: '126610', slug: 'submariner-126610', brandId: rolex.id },
    { name: 'Daytona', reference: '116500', slug: 'daytona-116500', brandId: rolex.id },
    { name: 'Seamaster 300M', reference: '210.30', slug: 'seamaster-300m', brandId: omega.id },
  ]

  for (const model of watchModels) {
    await prisma.watchModel.upsert({
      where: { brandId_slug: { brandId: model.brandId, slug: model.slug } },
      update: {},
      create: model,
    })
  }

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  })

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10)
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    })
    console.log(`✅ Super admin created: ${superAdminEmail}`)
  } else if (existingSuperAdmin.role !== 'SUPER_ADMIN') {
    await prisma.user.update({
      where: { id: existingSuperAdmin.id },
      data: { role: 'SUPER_ADMIN' },
    })
    console.log(`✅ Existing user updated to SUPER_ADMIN: ${superAdminEmail}`)
  } else {
    console.log(`✅ SUPER_ADMIN already exists: ${superAdminEmail}`)
  }

  console.log('✅ Seed ejecutado correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
