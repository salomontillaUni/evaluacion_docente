import { NextRequest, NextResponse } from 'next/server';
import { queryGemini } from '@/lib/geminiService';

export async function POST(req: NextRequest) {
  try {
    const { comentario, docenteNombre } = await req.json();

    if (!comentario) {
      return NextResponse.json(
        { error: 'El comentario es requerido' },
        { status: 400 }
      );
    }

    const result = await queryGemini(comentario, docenteNombre);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in analyze API Route:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
