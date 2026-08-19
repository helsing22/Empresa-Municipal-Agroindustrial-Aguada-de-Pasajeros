import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const orders = await db.order.findMany({ orderBy: { createdAt: 'desc' }, include: { items: true } });
    return NextResponse.json(orders);
  } catch { return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const count = await db.order.count();
    const orderNumber = `GR-${String(count + 1).padStart(4, '0')}`;
    const order = await db.order.create({
      data: {
        orderNumber, customerName: body.customerName, customerPhone: body.customerPhone,
        customerEmail: body.customerEmail, address: body.address, notes: body.notes,
        total: parseFloat(body.total), paymentMethod: body.paymentMethod,
        items: { create: body.items.map((item: { productId: string; productName: string; price: number; quantity: number; unit: string }) => ({ productId: item.productId, productName: item.productName, price: item.price, quantity: item.quantity, unit: item.unit })) },
      },
      include: { items: true },
    });
    return NextResponse.json(order, { status: 201 });
  } catch { return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 }); }
}