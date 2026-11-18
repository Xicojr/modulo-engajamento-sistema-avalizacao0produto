import { createProduct, listProducts } from '@/lib/products';
import { createProductSchema, productQuerySchema } from '@/lib/validations/product';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const queryValidation = productQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          error: 'Parâmetros de paginação inválidos.',
          details: queryValidation.error.format(),
        },
        { status: 400 },
      );
    }

    const { page, limit } = queryValidation.data;
    const data = await listProducts({ page, limit });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[Products GET API Error]:', error);
    return NextResponse.json(
      {
        error: 'Erro interno ao consultar catálogo de produtos.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody || typeof rawBody !== 'object') {
      return NextResponse.json(
        {
          error: 'Má formatação de dados. O corpo da requisição deve ser um JSON válido.',
        },
        { status: 400 },
      );
    }

    const validation = createProductSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos fornecidos para o produto.',
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const id = nanoid();
    const product = await createProduct({
      id,
      name: validation.data.name,
      description: validation.data.description,
      image_url: validation.data.image_url,
      external_link: validation.data.external_link,
      score: validation.data.score,
    });

    return NextResponse.json(
      {
        message: 'Produto cadastrado com sucesso!',
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[Products POST API Error]:', error);
    return NextResponse.json(
      {
        error: 'Erro interno ao cadastrar produto.',
      },
      { status: 500 },
    );
  }
}
