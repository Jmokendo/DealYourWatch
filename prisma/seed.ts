import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const rolex = await prisma.brand.create({
    data: { name: 'Rolex', slug: 'rolex' }
  })

  const omega = await prisma.brand.create({
    data: { name: 'Omega', slug: 'omega' }
  })

  await prisma.watchModel.createMany({
    data: [
      {
        name: 'Submariner',
        reference: '126610',
        slug: 'submariner-126610',
        brandId: rolex.id
      },
      {
        name: 'Daytona',
        reference: '116500',
        slug: 'daytona-116500',
        brandId: rolex.id
      },
      {
        name: 'Seamaster 300M',
        reference: '210.30',
        slug: 'seamaster-300m',
        brandId: omega.id
      }
    ]
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