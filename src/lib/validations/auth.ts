import { z } from 'zod';

export const signUpSchema = z
  .object({
    first_name: z
      .string({ required_error: 'Primeiro nome é obrigatório' })
      .trim()
      .min(2, 'O primeiro nome deve conter pelo menos 2 caracteres'),
    last_name: z
      .string({ required_error: 'Sobrenome é obrigatório' })
      .trim()
      .min(2, 'O sobrenome deve conter pelo menos 2 caracteres'),
    email: z
      .string({ required_error: 'E-mail é obrigatório' })
      .trim()
      .email('Informe um e-mail válido')
      .toLowerCase(),
    password: z
      .string({ required_error: 'Senha é obrigatória' })
      .min(6, 'A senha deve conter pelo menos 6 caracteres'),
    password_confirmation: z
      .string({ required_error: 'Confirmação de senha é obrigatória' })
      .min(6, 'A confirmação de senha deve conter pelo menos 6 caracteres'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .email('Informe um e-mail válido')
    .toLowerCase(),
  password: z.string({ required_error: 'Senha é obrigatória' }).min(1, 'Senha é obrigatória'),
});

export type SignInInput = z.infer<typeof signInSchema>;
