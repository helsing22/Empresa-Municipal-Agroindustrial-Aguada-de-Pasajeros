import { db } from '../src/lib/db';

const CATEGORIES = [
  { name: 'Agricultura', slug: 'agricultura', description: 'Frutas, verduras y productos frescos de la granja', order: 1 },
  { name: 'Ganadería', slug: 'ganaderia', description: 'Productos lácteos, carnes y derivados', order: 2 },
  { name: 'Insumos', slug: 'insumos', description: 'Semillas, fertilizantes y herramientas agrícolas', order: 3 },
  { name: 'Servicios', slug: 'servicios', description: 'Consultoría agrícola, transporte y más', order: 4 },
];

const PRODUCTS: Record<string, Array<{
  name: string; slug: string; description: string; shortDesc: string; price: number; unit: string; stock: number; weight: string; featured: boolean;
}>> = {
  agricultura: [
    { name: 'Tomates Frescos', slug: 'tomates-frescos', description: 'Tomates maduros cosechados directamente de nuestra granja. Ideales para ensaladas, salsas y guisos. Cultivados sin pesticidas químicos.', shortDesc: 'Tomates orgánicos de la granja', price: 25, unit: 'lb', stock: 200, weight: '1 lb', featured: true },
    { name: 'Lechuga Criolla', slug: 'lechuga-criolla', description: 'Lechuga fresca y crujiente, perfecta para ensaladas y acompañamientos. Cosechada el mismo día de la entrega.', shortDesc: 'Lechuga recién cosechada', price: 15, unit: 'unidad', stock: 150, weight: '1 unidad', featured: true },
    { name: 'Plátanos Burro', slug: 'platanos-burro', description: 'Plátanos burro maduros, ideales para cocinar o comer naturalmente. Rico en potasio y fibra.', shortDesc: 'Plátanos frescos de calidad', price: 20, unit: 'lb', stock: 300, weight: '1 lb', featured: false },
    { name: 'Papa Nacional', slug: 'papa-nacional', description: 'Papas nacionales de excelente calidad. Perfectas para hervir, freír o hacer puré.', shortDesc: 'Papas frescas de la tierra', price: 30, unit: 'lb', stock: 250, weight: '1 lb', featured: true },
    { name: 'Boniato (Batata)', slug: 'boniato-batata', description: 'Boniato dulce y nutritivo, cultivado en suelos fértiles de Cienfuegos. Excelente fuente de vitamina A.', shortDesc: 'Boniato dulce y nutritivo', price: 18, unit: 'lb', stock: 180, weight: '1 lb', featured: false },
    { name: 'Yuca Fresca', slug: 'yuca-fresca', description: 'Yuca fresca de primera calidad. Ideal para hervir, hacer fufú o casabe.', shortDesc: 'Yuca recién cosechada', price: 12, unit: 'lb', stock: 400, weight: '1 lb', featured: false },
    { name: 'Mango Tommy', slug: 'mango-tommy', description: 'Mangos Tommy Atkins jugosos y dulces, cosechados en su punto óptimo de madurez.', shortDesc: 'Mangos jugosos de temporada', price: 10, unit: 'lb', stock: 100, weight: '1 lb', featured: true },
    { name: 'Ajo Morado', slug: 'ajo-morado', description: 'Ajo morado de alta calidad con intenso sabor. Esencial en la cocina cubana.', shortDesc: 'Ajo morado intenso y aromático', price: 50, unit: 'lb', stock: 80, weight: '1 lb', featured: false },
  ],
  ganaderia: [
    { name: 'Leche Fresca de Vaca', slug: 'leche-fresca-vaca', description: 'Leche fresca de vaca, ordeñada diariamente. Sin conservantes ni aditivos.', shortDesc: 'Leche fresca diaria', price: 40, unit: 'litro', stock: 100, weight: '1 litro', featured: true },
    { name: 'Queso Crema artesanal', slug: 'queso-crema-artesanal', description: 'Queso crema elaborado artesanalmente con leche fresca de nuestra granja. Sabor suave y textura cremosa.', shortDesc: 'Queso cremoso artesanal', price: 150, unit: 'lb', stock: 30, weight: '1 lb', featured: true },
    { name: 'Huevos de Granja', slug: 'huevos-de-granja', description: 'Huevos de gallinas criadas en libre pastoreo. Yemas de color anaranjado intenso, alto valor nutricional.', shortDesc: 'Huevos camperos frescos', price: 5, unit: 'unidad', stock: 500, weight: '1 unidad', featured: true },
    { name: 'Carne de Res (Lomo)', slug: 'carne-res-lomo', description: 'Lomo de res de primera calidad, proveniente de nuestro ganado alimentado con pastos naturales.', shortDesc: 'Lomo de res premium', price: 350, unit: 'lb', stock: 20, weight: '1 lb', featured: false },
    { name: 'Pollo de Granja', slug: 'pollo-de-granja', description: 'Pollo criado en condiciones naturales, alimentado con granos y vegetales de la finca.', shortDesc: 'Pollo criado naturalmente', price: 250, unit: 'lb', stock: 50, weight: '1 lb', featured: false },
    { name: 'Yogur Natural', slug: 'yogur-natural', description: 'Yogur natural elaborado con leche fresca de la granja. Sin azúcar añadida ni conservantes.', shortDesc: 'Yogur natural artesanal', price: 35, unit: 'unidad', stock: 60, weight: '250 ml', featured: false },
  ],
  insumos: [
    { name: 'Semillas de Tomate', slug: 'semillas-tomate', description: 'Semillas de tomate de alta germinación, variedad adaptada al clima cubano. Ideal para siembra en primavera.', shortDesc: 'Semillas de alta germinación', price: 100, unit: 'sobre', stock: 200, weight: '1 sobre', featured: false },
    { name: 'Fertilizante Orgánico', slug: 'fertilizante-organico', description: 'Fertilizante orgánico producido en nuestra granja a partir de compostaje natural. Rico en nutrientes.', shortDesc: 'Compost orgánico de la granja', price: 80, unit: 'saco', stock: 50, weight: '10 kg', featured: true },
    { name: 'Abono Natural', slug: 'abono-natural', description: 'Abono natural elaborado con estiércol de ganado procesado. Mejora la estructura del suelo.', shortDesc: 'Abono 100% natural', price: 60, unit: 'saco', stock: 80, weight: '5 kg', featured: false },
    { name: 'Machete Agrícola', slug: 'machete-agricola', description: 'Machete de alta calidad para trabajos agrícolas. Hoja de acero resistente con mango ergonómico.', shortDesc: 'Herramienta de trabajo profesional', price: 500, unit: 'unidad', stock: 15, weight: '1 unidad', featured: false },
  ],
  servicios: [
    { name: 'Consultoría Agrícola', slug: 'consultoria-agricola', description: 'Servicio de asesoría técnica para optimizar sus cultivos. Nuestros expertos le ayudarán a mejorar rendimientos.', shortDesc: 'Asesoría técnica profesional', price: 500, unit: 'sesión', stock: 99, weight: '2 horas', featured: true },
    { name: 'Visita Guiada a la Granja', slug: 'visita-granja', description: 'Recorrido guiado por nuestras instalaciones. Conozca nuestros procesos de cultivo y cría de ganado.', shortDesc: 'Experiencia educativa en la granja', price: 200, unit: 'persona', stock: 30, weight: '1 visita', featured: true },
    { name: 'Servicio de Transporte Agrícola', slug: 'transporte-agricola', description: 'Servicio de transporte para sus productos agrícolas. Cubrimos toda la provincia de Cienfuegos.', shortDesc: 'Transporte local de productos', price: 300, unit: 'viaje', stock: 50, weight: '1 viaje', featured: false },
  ],
};

async function seed() {
  console.log('🌱 Sembrando datos de la Granja de Aguada...');

  // Create categories
  for (const cat of CATEGORIES) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    console.log(`  ✓ Categoría: ${cat.name}`);
  }

  // Create products
  for (const [catSlug, products] of Object.entries(PRODUCTS)) {
    const category = await db.category.findUnique({ where: { slug: catSlug } });
    if (!category) continue;

    for (const prod of products) {
      await db.product.upsert({
        where: { slug: prod.slug },
        update: prod,
        create: { ...prod, categoryId: category.id },
      });
      console.log(`  ✓ Producto: ${prod.name}`);
    }
  }

  console.log('\n✅ Datos sembrados correctamente');
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
