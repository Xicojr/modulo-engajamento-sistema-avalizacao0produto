import { describe, expect, it } from 'bun:test';
import {
  GET as getFeedbacks,
  POST as postFeedback,
} from '@/app/api/v1/products/[id]/feedbacks/route';
import { GET as getProductById } from '@/app/api/v1/products/[id]/route';
import { resetInMemoryFeedbacks } from '@/lib/feedbacks';
import { createProduct, resetInMemoryProducts } from '@/lib/products';
import { createSessionToken } from '@/lib/session';

describe('Feedback Feature (specs/feedback.md & plans/feedback.md)', () => {
  const dummyUser = {
    id: 'acc_tester_42',
    email: 'tester.feedback@example.com',
    first_name: 'Camila',
    last_name: 'Duarte',
  };

  it('GET /api/v1/products/[id] should return 200 with product details for valid ID', async () => {
    resetInMemoryProducts();
    const req = new Request('http://localhost:3000/api/v1/products/prod_raycast_01');
    const res = await getProductById(req, { params: { id: 'prod_raycast_01' } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.product).toBeDefined();
    expect(data.product.id).toBe('prod_raycast_01');
    expect(data.product.name).toBe('Raycast Pro');
  });

  it('GET /api/v1/products/[id] should return 404 when product is not found', async () => {
    const req = new Request('http://localhost:3000/api/v1/products/non_existent_id');
    const res = await getProductById(req, { params: { id: 'non_existent_id' } });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Produto não encontrado.');
  });

  it('GET /api/v1/products/[id]/feedbacks should return 200 with list of feedbacks and stats', async () => {
    resetInMemoryFeedbacks();
    const req = new Request('http://localhost:3000/api/v1/products/prod-1/feedbacks');
    const res = await getFeedbacks(req, { params: { id: 'prod-1' } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.feedbacks)).toBe(true);
    expect(data.feedbacks.length).toBeGreaterThanOrEqual(1);
    expect(data.totalCount).toBeGreaterThanOrEqual(1);
    expect(typeof data.averageScore).toBe('number');
  });

  it('GET /api/v1/products/[id]/feedbacks should return 200 with empty list when no feedbacks exist', async () => {
    const emptyProductId = 'prod_without_reviews';
    const req = new Request(`http://localhost:3000/api/v1/products/${emptyProductId}/feedbacks`);
    const res = await getFeedbacks(req, { params: { id: emptyProductId } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.feedbacks).toEqual([]);
    expect(data.totalCount).toBe(0);
    expect(data.averageScore).toBe(0);
  });

  it('POST /api/v1/products/[id]/feedbacks should block unauthenticated visitors with 401', async () => {
    const req = new Request('http://localhost:3000/api/v1/products/prod_raycast_01/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: 5, comment: 'Excelente produto, super recomendo!' }),
    });

    const res = await postFeedback(req, { params: { id: 'prod_raycast_01' } });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Você precisa estar autenticado para enviar uma avaliação.');
  });

  it('POST /api/v1/products/[id]/feedbacks should return 401 when auth_session cookie is invalid or tampered', async () => {
    const req = new Request('http://localhost:3000/api/v1/products/prod_raycast_01/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'auth_session=invalid.token.payload',
      },
      body: JSON.stringify({ score: 5, comment: 'Excelente produto, super recomendo!' }),
    });

    const res = await postFeedback(req, { params: { id: 'prod_raycast_01' } });
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Você precisa estar autenticado para enviar uma avaliação.');
  });

  it('POST /api/v1/products/[id]/feedbacks should return 400 when body is malformed JSON', async () => {
    const sessionToken = createSessionToken(dummyUser);
    const req = new Request('http://localhost:3000/api/v1/products/prod_raycast_01/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_session=${sessionToken}`,
      },
      body: 'invalid-json-content',
    });

    const res = await postFeedback(req, { params: { id: 'prod_raycast_01' } });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Formato de requisição inválido');
  });

  it('POST /api/v1/products/[id]/feedbacks should return 400 when score is out of 1-5 range', async () => {
    const sessionToken = createSessionToken(dummyUser);

    // Score 0 (below min 1)
    const reqLow = new Request('http://localhost:3000/api/v1/products/prod_raycast_01/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_session=${sessionToken}`,
      },
      body: JSON.stringify({ score: 0, comment: 'Comentário válido' }),
    });
    const resLow = await postFeedback(reqLow, { params: { id: 'prod_raycast_01' } });
    expect(resLow.status).toBe(400);

    // Score 6 (above max 5)
    const reqHigh = new Request('http://localhost:3000/api/v1/products/prod_raycast_01/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_session=${sessionToken}`,
      },
      body: JSON.stringify({ score: 6, comment: 'Comentário válido' }),
    });
    const resHigh = await postFeedback(reqHigh, { params: { id: 'prod_raycast_01' } });
    expect(resHigh.status).toBe(400);
  });

  it('POST /api/v1/products/[id]/feedbacks should return 400 when comment is too short (< 3 chars)', async () => {
    const sessionToken = createSessionToken(dummyUser);
    const req = new Request('http://localhost:3000/api/v1/products/prod_raycast_01/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_session=${sessionToken}`,
      },
      body: JSON.stringify({ score: 4, comment: 'Oi' }),
    });

    const res = await postFeedback(req, { params: { id: 'prod_raycast_01' } });
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.details.comment._errors).toContain('O comentário deve ter no mínimo 3 caracteres.');
  });

  it('POST /api/v1/products/[id]/feedbacks should return 404 when product does not exist', async () => {
    const sessionToken = createSessionToken(dummyUser);
    const req = new Request('http://localhost:3000/api/v1/products/missing_prod_id/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_session=${sessionToken}`,
      },
      body: JSON.stringify({ score: 5, comment: 'Comentário para produto inexistente' }),
    });

    const res = await postFeedback(req, { params: { id: 'missing_prod_id' } });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Produto não encontrado para avaliação.');
  });

  it('POST /api/v1/products/[id]/feedbacks should successfully create feedback with status 201 for authenticated user', async () => {
    resetInMemoryFeedbacks();
    resetInMemoryProducts();

    const productId = 'prod_raycast_01';
    const sessionToken = createSessionToken(dummyUser);
    const commentText = 'Fluxo de trabalho impecável. Aumentou muito minha produtividade!';

    const postReq = new Request(`http://localhost:3000/api/v1/products/${productId}/feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_session=${sessionToken}`,
      },
      body: JSON.stringify({
        score: 5,
        comment: commentText,
      }),
    });

    const postRes = await postFeedback(postReq, { params: { id: productId } });
    const postData = await postRes.json();

    expect(postRes.status).toBe(201);
    expect(postData.message).toBe('Avaliação registrada com sucesso!');
    expect(postData.feedback).toBeDefined();
    expect(postData.feedback.id).toBeDefined();
    expect(typeof postData.feedback.id).toBe('string');
    expect(postData.feedback.score).toBe(5);
    expect(postData.feedback.comment).toBe(commentText);
    expect(postData.feedback.created_by).toBe(dummyUser.id);
    expect(postData.feedback.product_id).toBe(productId);
    expect(postData.feedback.author).toEqual({
      first_name: dummyUser.first_name,
      last_name: dummyUser.last_name,
      email: dummyUser.email,
    });

    // Verify feedback appears in GET /api/v1/products/[id]/feedbacks
    const getReq = new Request(`http://localhost:3000/api/v1/products/${productId}/feedbacks`);
    const getRes = await getFeedbacks(getReq, { params: { id: productId } });
    const getData = await getRes.json();

    expect(getRes.status).toBe(200);
    const found = getData.feedbacks.find((fb: { id: string }) => fb.id === postData.feedback.id);
    expect(found).toBeDefined();
    expect(found.score).toBe(5);
    expect(found.comment).toBe(commentText);
    expect(getData.totalCount).toBeGreaterThanOrEqual(1);
  });
});
