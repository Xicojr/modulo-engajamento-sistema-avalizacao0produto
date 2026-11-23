import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'O nome do produto é obrigatório.' })
    .trim()
    .min(2, { message: 'O nome do produto deve ter no mínimo 2 caracteres.' })
    .max(500, { message: 'O nome do produto deve ter no máximo 500 caracteres.' }),
  description: z
    .string()
    .trim()
    .max(2000, { message: 'A descrição deve ter no máximo 2000 caracteres.' })
    .optional()
    .nullable(),
  image_url: z
    .string()
    .trim()
    .url({ message: 'Informe uma URL válida para a imagem.' })
    .optional()
    .nullable()
    .or(z.literal('')),
  external_link: z
    .string({ required_error: 'O link externo é obrigatório.' })
    .trim()
    .url({ message: 'Informe uma URL válida para o link externo (ex: https://exemplo.com).' }),
  score: z.boolean().optional().default(false),
});

export const productQuerySchema = z.object({
  page: z.coerce
    .number({ invalid_type_error: 'Página deve ser um número.' })
    .int()
    .positive({ message: 'A página deve ser maior que 0.' })
    .default(1),
  limit: z.coerce
    .number({ invalid_type_error: 'Limite deve ser um número.' })
    .int()
    .positive({ message: 'O limite deve ser maior que 0.' })
    .max(50, { message: 'O limite máximo por página é 50.' })
    .default(6),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
