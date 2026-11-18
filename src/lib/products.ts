import { supabase } from './supabase';

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  external_link: string;
  score: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
}

export interface ListProductsResult {
  products: Product[];
  nextCursor: number | null;
  total: number;
}

// Seed de produtos de demonstração para ambiente local e testes
const initialProductsSeed: Product[] = [
  {
    id: 'prod_raycast_01',
    name: 'Raycast Pro',
    description:
      'Launcher ultra-rápido para desenvolvedores e criadores. Automatize fluxos com comandos extensíveis e IA integrada.',
    image_url:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    external_link: 'https://raycast.com',
    score: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: 'prod_linear_02',
    name: 'Linear Workflows',
    description:
      'Acompanhamento de sprints e roadmap desenhado para equipes de engenharia focadas em velocidade e precisão.',
    image_url:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    external_link: 'https://linear.app',
    score: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'prod_supabase_03',
    name: 'Supabase Platform',
    description:
      'Backend as a Service open-source com PostgreSQL dedicado, realtime subscriptions, autenticação e storage integrado.',
    image_url:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    external_link: 'https://supabase.com',
    score: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'prod_figma_04',
    name: 'Figma Design Suite',
    description:
      'Ambiente colaborativo na nuvem para design de sistemas visuais, bibliotecas de componentes e testes com usuários.',
    image_url:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    external_link: 'https://figma.com',
    score: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'prod_vercel_05',
    name: 'Vercel Edge Cloud',
    description:
      'Plataforma para frameworks web modernos com deploys atômicos instantâneos, analytics em tempo real e edge computing.',
    image_url:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    external_link: 'https://vercel.com',
    score: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'prod_obsidian_06',
    name: 'Obsidian Notes',
    description:
      'Base de conhecimento pessoal extensível estruturada em arquivos Markdown locais com visualização de grafo bidirecional.',
    image_url:
      'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80',
    external_link: 'https://obsidian.md',
    score: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'prod_resend_07',
    name: 'Resend Email API',
    description:
      'Infraestrutura moderna para envio e acompanhamento de e-mails transacionais com React Email e alta entregabilidade.',
    image_url:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    external_link: 'https://resend.com',
    score: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
  {
    id: 'prod_cron_08',
    name: 'Notion Calendar',
    description:
      'Calendário veloz integrado a múltiplos provedores, atalhos de teclado ágeis e sincronização com documentos de equipe.',
    image_url:
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    external_link: 'https://notion.so',
    score: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'prod_tailwind_09',
    name: 'Tailwind UI Lab',
    description:
      'Biblioteca de componentes modernos e acessíveis construídos para escalabilidade estética e código limpo.',
    image_url:
      'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=800&q=80',
    external_link: 'https://tailwindcss.com',
    score: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
  },
];

// In-memory store fallback para desenvolvimento e testes
const inMemoryProducts: Product[] = [...initialProductsSeed];

export async function listProducts(params: ListProductsParams = {}): Promise<ListProductsResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, Math.min(50, params.limit ?? 6));
  const offset = (page - 1) * limit;

  if (supabase) {
    const countQuery = await supabase.from('products').select('*', { count: 'exact', head: true });
    if (countQuery.error) {
      console.error('[Supabase] Erro ao contar produtos:', countQuery.error);
      throw countQuery.error;
    }

    const total = countQuery.count ?? 0;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[Supabase] Erro ao listar produtos:', error);
      throw error;
    }

    const products = (data as Product[]) || [];
    const nextCursor = offset + products.length < total ? page + 1 : null;

    return {
      products,
      nextCursor,
      total,
    };
  }

  // Fallback in-memory
  const sorted = [...inMemoryProducts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const total = sorted.length;
  const products = sorted.slice(offset, offset + limit);
  const nextCursor = offset + products.length < total ? page + 1 : null;

  return {
    products,
    nextCursor,
    total,
  };
}

export async function findProductById(id: string): Promise<Product | null> {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();

    if (error) {
      console.error('[Supabase] Erro ao buscar produto por id:', error);
      throw error;
    }

    return (data as Product | null) || null;
  }

  const found = inMemoryProducts.find((p) => p.id === id);
  return found || null;
}

export async function createProduct(
  data: Omit<Product, 'created_at' | 'updated_at'>,
): Promise<Product> {
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...data,
    description: data.description ?? null,
    image_url: data.image_url ?? null,
    score: Boolean(data.score),
    created_at: now,
    updated_at: now,
  };

  if (supabase) {
    const { data: inserted, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Erro ao inserir produto:', error);
      throw error;
    }

    return inserted as Product;
  }

  inMemoryProducts.unshift(newProduct);
  return newProduct;
}

/**
 * Utilitário para reiniciar o estado em memória nos testes
 */
export function resetInMemoryProducts(): void {
  inMemoryProducts.length = 0;
  inMemoryProducts.push(...initialProductsSeed);
}
