import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const rolex = await prisma.brand.upsert({
    where: { slug: 'rolex' },
    update: { name: 'Rolex' },
    create: { name: 'Rolex', slug: 'rolex' }
  })

  const omega = await prisma.brand.upsert({
    where: { slug: 'omega' },
    update: { name: 'Omega' },
    create: { name: 'Omega', slug: 'omega' }
  })

  await prisma.watchModel.upsert({
    where: { brandId_slug: { brandId: rolex.id, slug: 'submariner-126610' } },
    update: { name: 'Submariner', reference: '126610' },
    create: {
      name: 'Submariner',
      reference: '126610',
      slug: 'submariner-126610',
      brandId: rolex.id
    }
  })

  await prisma.watchModel.upsert({
    where: { brandId_slug: { brandId: rolex.id, slug: 'daytona-116500' } },
    update: { name: 'Daytona', reference: '116500' },
    create: {
      name: 'Daytona',
      reference: '116500',
      slug: 'daytona-116500',
      brandId: rolex.id
    }
  })

  await prisma.watchModel.upsert({
    where: { brandId_slug: { brandId: omega.id, slug: 'seamaster-300m' } },
    update: { name: 'Seamaster 300M', reference: '210.30' },
    create: {
      name: 'Seamaster 300M',
      reference: '210.30',
      slug: 'seamaster-300m',
      brandId: omega.id
    }
  })

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
