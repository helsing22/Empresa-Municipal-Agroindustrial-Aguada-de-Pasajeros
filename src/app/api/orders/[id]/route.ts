import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const order = await db.order.update({ where: { id }, data: { status: body.status }, include: { items: true } });
    return NextResponse.json(order);
  } catch { return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 }); }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Error al eliminar pedido' }, { status: 500 }); }
}