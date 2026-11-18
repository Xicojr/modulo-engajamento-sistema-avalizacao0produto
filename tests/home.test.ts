import { beforeEach, describe, expect, it } from 'bun:test';
import { GET, POST } from '@/app/api/v1/products/route';
import { findProductById, resetInMemoryProducts } from '@/lib/products';

describe('Home & Products Catalog Feature (specs/home.md & plans/home.md)', () => {
  beforeEach(() => {
    resetInMemoryProducts();
  });

  describe('GET /api/v1/products', () => {
    it('should list products with default pagination and status 200', async () => {
      const request = new Request('http://localhost:3000/api/v1/products');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products.length).toBeGreaterThan(0);
      expect(typeof data.total).toBe('number');
      expect(data.total).toBeGreaterThanOrEqual(9);
      expect(data.nextCursor).toBe(2);

      // Verify product item structure
      const firstProduct = data.products[0];
      expect(firstProduct.id).toBeDefined();
      expect(firstProduct.name).toBeDefined();
      expect(firstProduct.external_link).toBeDefined();
      expect(firstProduct.created_at).toBeDefined();
      expect(typeof firstProduct.score).toBe('boolean');
    });

    it('should respect custom page and limit parameters', async () => {
      const request = new Request('http://localhost:3000/api/v1/products?page=1&limit=3');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.products.length).toBe(3);
      expect(data.nextCursor).toBe(2);

      // Fetch page 2
      const requestPage2 = new Request('http://localhost:3000/api/v1/products?page=2&limit=3');
      const responsePage2 = await GET(requestPage2);
      const dataPage2 = await responsePage2.json();

      expect(responsePage2.status).toBe(200);
      expect(dataPage2.products.length).toBe(3);
      expect(dataPage2.nextCursor).toBe(3);

      // Products on page 1 and page 2 must be distinct
      const idsPage1 = data.products.map((p: { id: string }) => p.id);
      const idsPage2 = dataPage2.products.map((p: { id: string }) => p.id);
      for (const id of idsPage2) {
        expect(idsPage1.includes(id)).toBe(false);
      }
    });

    it('should return nextCursor null when reaching end of catalog', async () => {
      const request = new Request('http://localhost:3000/api/v1/products?page=100&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.products).toEqual([]);
      expect(data.nextCursor).toBeNull();
    });

    it('should return 400 when invalid query parameters are provided', async () => {
      const request = new Request('http://localhost:3000/api/v1/products?page=-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Parâmetros de paginação inválidos.');
      expect(data.details.page._errors).toBeDefined();
    });
  });

  describe('POST /api/v1/products', () => {
    it('should successfully create a new product with 201 status and nanoid id', async () => {
      const payload = {
        name: 'Design Studio Ultra',
        description: 'Solução completa para design de componentes e protótipos de alta fidelidade.',
        image_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e',
        external_link: 'https://designstudio.example.com',
        score: true,
      };

      const request = new Request('http://localhost:3000/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBe('Produto cadastrado com sucesso!');
      expect(body.product).toBeDefined();
      expect(body.product.id).toBeDefined();
      expect(typeof body.product.id).toBe('string');
      expect(body.product.id.length).toBeGreaterThan(5);
      expect(body.product.name).toBe(payload.name);
      expect(body.product.description).toBe(payload.description);
      expect(body.product.image_url).toBe(payload.image_url);
      expect(body.product.external_link).toBe(payload.external_link);
      expect(body.product.score).toBe(true);

      // Verify product can be retrieved via findProductById
      const saved = await findProductById(body.product.id);
      expect(saved).not.toBeNull();
      expect(saved?.id).toBe(body.product.id);
      expect(saved?.name).toBe(payload.name);
    });

    it('should return 400 when body is malformed or invalid JSON', async () => {
      const request = new Request('http://localhost:3000/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-valid-json',
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Má formatação de dados');
    });

    it('should return 400 when required fields are missing', async () => {
      const payload = {
        description: 'Falta o name e o external_link',
      };

      const request = new Request('http://localhost:3000/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Dados inválidos fornecidos para o produto.');
      expect(body.details.name._errors).toBeDefined();
      expect(body.details.external_link._errors).toBeDefined();
    });

    it('should return 400 when external_link is not a valid URL', async () => {
      const payload = {
        name: 'Produto Com Link Ruim',
        external_link: 'not-a-url',
      };

      const request = new Request('http://localhost:3000/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.details.external_link._errors).toContain(
        'Informe uma URL válida para o link externo (ex: https://exemplo.com).',
      );
    });
  });
});
