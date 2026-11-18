import { supabase } from '@/lib/supabase';

export interface ProductFeedback {
  id: string;
  score: number;
  comment: string;
  created_at: string;
  created_by: string;
  product_id: string;
  author?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// In-memory fallback store for development and automated testing
const mockSeedFeedbacks: ProductFeedback[] = [
  {
    id: 'fb-seed-1',
    score: 5,
    comment:
      'Excelente produto! Superou todas as minhas expectativas em termos de velocidade e usabilidade.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    created_by: 'acc-seed-1',
    product_id: 'prod-1',
    author: {
      first_name: 'Mariana',
      last_name: 'Costa',
      email: 'mariana.costa@example.com',
    },
  },
  {
    id: 'fb-seed-2',
    score: 4,
    comment:
      'Muito bom e fácil de usar. O design é incrível, apenas senti falta de algumas integrações extras.',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    created_by: 'acc-seed-2',
    product_id: 'prod-1',
    author: {
      first_name: 'Rafael',
      last_name: 'Mendes',
      email: 'rafael.mendes@example.com',
    },
  },
  {
    id: 'fb-seed-3',
    score: 5,
    comment:
      'Indispensável no meu dia a dia de trabalho. A performance e a estabilidade são surreais!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    created_by: 'acc-seed-3',
    product_id: 'prod-2',
    author: {
      first_name: 'Beatriz',
      last_name: 'Lins',
      email: 'beatriz.lins@example.com',
    },
  },
];

let inMemoryFeedbacks: ProductFeedback[] = [...mockSeedFeedbacks];

export function resetInMemoryFeedbacks(): void {
  inMemoryFeedbacks = [...mockSeedFeedbacks];
}

export async function listFeedbacksByProductId(productId: string): Promise<ProductFeedback[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('products_feedbacks')
      .select(`
        id,
        score,
        comment,
        created_at,
        created_by,
        product_id,
        accounts (
          first_name,
          last_name,
          email
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase] Error listing feedbacks:', error);
      throw error;
    }

    // Map nested accounts to author
    return (data || []).map((item) => {
      const rawAuthor = item.accounts as
        | { first_name: string; last_name: string; email: string }
        | { first_name: string; last_name: string; email: string }[]
        | null;

      const author = Array.isArray(rawAuthor) ? rawAuthor[0] : rawAuthor;

      return {
        id: item.id,
        score: item.score,
        comment: item.comment,
        created_at: item.created_at,
        created_by: item.created_by,
        product_id: item.product_id,
        author: author || undefined,
      };
    });
  }

  return inMemoryFeedbacks
    .filter((fb) => fb.product_id === productId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createFeedback(
  data: Omit<ProductFeedback, 'created_at'>,
): Promise<ProductFeedback> {
  const now = new Date().toISOString();
  const newFeedback: ProductFeedback = {
    ...data,
    created_at: now,
  };

  if (supabase) {
    const { data: inserted, error } = await supabase
      .from('products_feedbacks')
      .insert([
        {
          id: newFeedback.id,
          score: newFeedback.score,
          comment: newFeedback.comment,
          created_at: newFeedback.created_at,
          created_by: newFeedback.created_by,
          product_id: newFeedback.product_id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Error creating feedback:', error);
      throw error;
    }

    return {
      ...inserted,
      author: newFeedback.author,
    };
  }

  inMemoryFeedbacks.unshift(newFeedback);
  return newFeedback;
}

export async function getFeedbackStats(
  productId: string,
): Promise<{ averageScore: number; totalCount: number }> {
  const feedbacks = await listFeedbacksByProductId(productId);
  const totalCount = feedbacks.length;

  if (totalCount === 0) {
    return { averageScore: 0, totalCount: 0 };
  }

  const sum = feedbacks.reduce((acc, curr) => acc + curr.score, 0);
  const averageScore = Math.round((sum / totalCount) * 10) / 10;

  return { averageScore, totalCount };
}
