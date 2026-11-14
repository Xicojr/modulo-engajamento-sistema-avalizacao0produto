'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SignUpInput, signUpSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MessageSquareCheck,
  ShieldCheck,
  Star,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

interface SignUpApiResponse {
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
}

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const passwordValue = watch('password', '');

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpInput) => {
      setServerError(null);

      const response = await fetch('/api/v1/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData: SignUpApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.',
        );
      }

      return responseData;
    },
    onSuccess: () => {
      // Acceptance criteria: Navegar para '/auth/sign-up/sucess'
      router.push('/auth/sign-up/sucess');
    },
    onError: (error: Error) => {
      setServerError(error.message);
    },
  });

  const onSubmit = (values: SignUpInput) => {
    signUpMutation.mutate(values);
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 flex flex-col lg:grid lg:grid-cols-12">
      {/* 
        ========================================================================
        Coluna Esquerda: Showcase Editorial de Engajamento & Avaliação de Produtos
        Ancorada no universo real do produto (confiança, ratings, feedback auditado)
        ========================================================================
      */}
      <aside className="relative hidden lg:flex lg:col-span-5 bg-slate-950 text-white flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-slate-900">
        {/* Glow sutil de profundidade */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Marca & Contexto */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Módulo de Engajamento & Avaliação
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-50 leading-[1.15]">
              Onde a voz do cliente constrói produtos melhores.
            </h1>
            <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-md">
              Colete feedbacks autênticos, meça a satisfação de ponta a ponta e transforme
              avaliações de produto em decisões de compra conscientes.
            </p>
          </div>
        </div>

        {/* Card em Destaque: Exemplo Tangível de Avaliação de Produto */}
        <div className="relative z-10 my-8">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-6 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="ml-2 text-xs font-semibold text-slate-200">5.0</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Avaliação Auditada
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed italic">
              “A clareza dos feedbacks dos clientes aumentou nossa taxa de recompra em 28%. A
              plataforma tornou visível o que nossos usuários realmente sentem.”
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-200">Camila Duarte</p>
                <p className="text-slate-500">Head de Produto • E-commerce Tech</p>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                <span>+94% de engajamento</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Painel Esquerdo: Métricas e Garantias */}
        <div className="relative z-10 pt-6 border-t border-slate-900 grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <p className="text-slate-500 font-medium">Autenticidade</p>
            <p className="text-slate-200 font-semibold flex items-center gap-1.5">
              <MessageSquareCheck className="h-4 w-4 text-blue-400" />
              100% de reviews reais
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 font-medium">Segurança de Dados</p>
            <p className="text-slate-200 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Bcrypt & Salt Dedicado
            </p>
          </div>
        </div>
      </aside>

      {/* 
        ========================================================================
        Coluna Direita: Fluxo de Cadastro e Formulário Refinado
        ========================================================================
      */}
      <section className="flex-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen">
        {/* Barra superior de navegação / login */}
        <header className="flex items-center justify-between w-full max-w-xl mx-auto pb-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              E
            </div>
            <span className="font-semibold text-sm text-slate-900">Engajamento & Reviews</span>
          </div>

          <div className="ml-auto text-xs sm:text-sm text-slate-500">
            Já possui uma conta?{' '}
            <Link
              href="/"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-1"
            >
              Fazer login
            </Link>
          </div>
        </header>

        {/* Conteúdo Central do Formulário */}
        <div className="w-full max-w-xl mx-auto my-auto py-4">
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Crie sua conta de acesso
            </h2>
            <p className="text-sm text-slate-600">
              Comece a gerenciar avaliações e métricas de satisfação dos seus produtos.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Acceptance criteria: Alert em vermelho no formulário caso haja erro */}
            {serverError && (
              <Alert
                variant="destructive"
                className="border-red-300 bg-red-50/90 text-red-900 py-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="ml-2">
                  <AlertTitle className="text-sm font-semibold text-red-900">
                    Não foi possível concluir seu cadastro
                  </AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm text-red-700 mt-0.5">
                    {serverError}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Campos separados: Primeiro Nome e Sobrenome */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name" className="text-xs font-semibold text-slate-700">
                  Primeiro Nome
                </Label>
                <Input
                  id="first_name"
                  placeholder="Ex: Carlos"
                  autoComplete="given-name"
                  error={Boolean(errors.first_name)}
                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 text-sm transition-all"
                  {...register('first_name')}
                  disabled={signUpMutation.isPending}
                />
                {errors.first_name && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="last_name" className="text-xs font-semibold text-slate-700">
                  Sobrenome
                </Label>
                <Input
                  id="last_name"
                  placeholder="Ex: Mendes"
                  autoComplete="family-name"
                  error={Boolean(errors.last_name)}
                  className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 text-sm transition-all"
                  {...register('last_name')}
                  disabled={signUpMutation.isPending}
                />
                {errors.last_name && (
                  <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                E-mail Profissional ou Pessoal
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="carlos.mendes@empresa.com"
                autoComplete="email"
                error={Boolean(errors.email)}
                className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 text-sm transition-all"
                {...register('email')}
                disabled={signUpMutation.isPending}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Senha
                </Label>
                {passwordValue.length > 0 && (
                  <span className="text-[11px] text-slate-500">
                    {passwordValue.length < 6 ? 'Mínimo de 6 caracteres' : 'Tamanho adequado'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha forte"
                  autoComplete="new-password"
                  error={Boolean(errors.password)}
                  className="h-11 bg-white border-slate-200 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 text-sm transition-all"
                  {...register('password')}
                  disabled={signUpMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirmação de Senha */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password_confirmation"
                className="text-xs font-semibold text-slate-700"
              >
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repita sua senha exatamente igual"
                  autoComplete="new-password"
                  error={Boolean(errors.password_confirmation)}
                  className="h-11 bg-white border-slate-200 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 text-sm transition-all"
                  {...register('password_confirmation')}
                  disabled={signUpMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar confirmação de senha'
                      : 'Exibir confirmação de senha'
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Botão de Envio Principal */}
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                disabled={signUpMutation.isPending}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {signUpMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processando e criando conta...</span>
                  </>
                ) : (
                  <>
                    <span>Criar Minha Conta</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Credenciais protegidas com criptografia Bcrypt e salt dedicado.</span>
              </div>
            </div>
          </form>
        </div>

        {/* Rodapé da Coluna Direita */}
        <footer className="w-full max-w-xl mx-auto pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Módulo de Engajamento de Produtos.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 transition-colors cursor-pointer">
              Privacidade
            </span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">
              Termos de Uso
            </span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Segurança</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
