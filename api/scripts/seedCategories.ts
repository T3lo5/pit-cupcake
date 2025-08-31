import { prisma } from '../src/libs/prisma.js';

async function main() {
  const defaults = [
    { name: 'Clássicos', slug: 'classicos' },
    { name: 'Especiais', slug: 'especiais' },
    { name: 'Diet/Zero', slug: 'diet-zero' },
    { name: 'Sazonais', slug: 'sazonais' },
  ];

  for (const c of defaults) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log('Categorias seedadas.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
