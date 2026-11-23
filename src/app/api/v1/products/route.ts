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

function normalizeProductInput(raw: unknown) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;

  const copy = { ...(raw as Record<string, unknown>) };

  // Normalizar external_link a partir de url se necessário
  if (!copy.external_link && copy.url) {
    let link = String(copy.url).trim();
    if (link.startsWith('/')) {
      link = `https://www.amazon.com.br${link}`;
    }
    copy.external_link = link;
  }

  // Normalizar image_url a partir de image se necessário
  if (!copy.image_url && copy.image) {
    copy.image_url = String(copy.image).trim();
  }

  // Normalizar description a partir de price se description não foi passada
  if (!copy.description && copy.price) {
    copy.description = `Preço: R$ ${String(copy.price).trim()}`;
  }

  // Normalizar score se for string
  if (typeof copy.score === 'string') {
    copy.score = (copy.score as string).toLowerCase() === 'true';
  }

  return copy;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody || (typeof rawBody !== 'object' && !Array.isArray(rawBody))) {
      return NextResponse.json(
        {
          error: 'Má formatação de dados. O corpo da requisição deve ser um JSON válido.',
        },
        { status: 400 },
      );
    }

    // Suporte a lote (Array de produtos)
    if (Array.isArray(rawBody)) {
      if (rawBody.length === 0) {
        return NextResponse.json(
          { error: 'A lista de produtos não pode ser vazia.' },
          { status: 400 },
        );
      }

      const createdList = [];
      const validationErrors = [];

      for (let i = 0; i < rawBody.length; i++) {
        const item = rawBody[i];
        const normalized = normalizeProductInput(item);
        const validation = createProductSchema.safeParse(normalized);

        if (!validation.success) {
          validationErrors.push({
            index: i,
            name:
              typeof item === 'object' && item && 'name' in item
                ? String((item as Record<string, unknown>).name)
                : `Item ${i}`,
            errors: validation.error.format(),
          });
        } else {
          const id = nanoid();
          const product = await createProduct({
            id,
            name: validation.data.name,
            description: validation.data.description,
            image_url: validation.data.image_url,
            external_link: validation.data.external_link,
            score: validation.data.score,
          });
          createdList.push(product);
        }
      }

      if (createdList.length === 0 && validationErrors.length > 0) {
        return NextResponse.json(
          {
            error: 'Nenhum produto pôde ser cadastrado devido a erros de validação.',
            details: validationErrors,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          message: `${createdList.length} produto(s) cadastrado(s) com sucesso!`,
          count: createdList.length,
          products: createdList,
          errors: validationErrors.length > 0 ? validationErrors : undefined,
        },
        { status: 201 },
      );
    }

    // Suporte a produto individual (Objeto)
    const normalized = normalizeProductInput(rawBody);
    const validation = createProductSchema.safeParse(normalized);

    if (!validation.success) {
      console.warn('[Products POST Validation Failed]:', {
        body: rawBody,
        errors: validation.error.format(),
      });
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
