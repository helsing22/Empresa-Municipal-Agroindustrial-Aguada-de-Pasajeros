import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const where: Record<string, unknown> = { active: true };
    if (category) where.category = { slug: category };
    if (search) where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    if (featured === 'true') where.featured = true;
    const products = await db.product.findMany({
      where, include: { category: true }, orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch { return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await db.product.create({
      data: { name: body.name, slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), description: body.description, shortDesc: body.shortDesc, price: parseFloat(body.price), unit: body.unit || 'unidad', stock: parseInt(body.stock) || 0, weight: body.weight, categoryId: body.categoryId, featured: body.featured || false, active: body.active !== false },
    });
    return NextResponse.json(product, { status: 201 });
  } catch { return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 }); }
}