import { z } from 'zod';

export const feedbackSchema = z.object({
  score: z.coerce
    .number({
      required_error: 'A nota de avaliação é obrigatória.',
      invalid_type_error: 'A nota deve ser um número.',
    })
    .int({ message: 'A nota deve ser um número inteiro.' })
    .min(1, { message: 'A nota mínima permitida é 1.' })
    .max(5, { message: 'A nota máxima permitida é 5.' }),
  comment: z
    .string({ required_error: 'O comentário é obrigatório.' })
    .trim()
    .min(3, { message: 'O comentário deve ter no mínimo 3 caracteres.' })
    .max(1000, { message: 'O comentário deve ter no máximo 1000 caracteres.' }),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
