import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(messages);
  } catch { return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = await db.contactMessage.create({
      data: { name: body.name, email: body.email, phone: body.phone, subject: body.subject, message: body.message },
    });
    return NextResponse.json(message, { status: 201 });
  } catch { return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 }); }
}