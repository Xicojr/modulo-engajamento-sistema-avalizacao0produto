'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SignInInput, signInSchema } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MessageSquareCheck,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInInput) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(values);

      if (result.success) {
        const params =
          typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const redirectTarget = params?.get('redirect') || '/';
        router.push(redirectTarget);
      } else {
        setErrorMessage(result.error || 'Email ou senha inválidos.');
      }
    } catch {
      setErrorMessage('Email ou senha inválidos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 flex flex-col lg:grid lg:grid-cols-12">
      {/* 
        ========================================================================
        Coluna Esquerda: Showcase Editorial do Painel de Avaliações
        ========================================================================
      */}
      <aside className="relative hidden lg:flex lg:col-span-5 bg-slate-950 text-white flex-col justify-between p-10 xl:p-14 overflow-hidden border-r border-slate-900">
        {/* Glow de profundidade */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Marca & Contexto */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Módulo de Engajamento & Avaliação
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-bold tracking-tight text-slate-50 leading-[1.15]">
              Bem-vindo de volta ao seu painel de feedback.
            </h1>
            <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-md">
              Acompanhe o que os clientes pensam dos seus produtos em tempo real e tome decisões
              orientadas por reputação autêntica.
            </p>
          </div>
        </div>

        {/* Card em Destaque */}
        <div className="relative z-10 my-8">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 p-6 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Resumo de Engajamento
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="h-3 w-3" />
                Sessão Segura
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">4.9</span>
                <div className="flex items-center text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400" />
                </div>
                <span className="text-xs text-slate-400 ml-auto">+14% este mês</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mais de 12.800 avaliações auditadas e verificadas por compradores reais na
                plataforma.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé do Painel Esquerdo */}
        <div className="relative z-10 pt-6 border-t border-slate-900 grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <p className="text-slate-500 font-medium">Acesso Rápido</p>
            <p className="text-slate-200 font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Sessões Criptografadas
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 font-medium">Privacidade</p>
            <p className="text-slate-200 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Cookies HTTP-only
            </p>
          </div>
        </div>
      </aside>

      {/* 
        ========================================================================
        Coluna Direita: Formulário de Login (Sign-In)
        ========================================================================
      */}
      <section className="flex-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen">
        {/* Barra superior de navegação */}
        <header className="flex items-center justify-between w-full max-w-md mx-auto pb-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              E
            </div>
            <span className="font-semibold text-sm text-slate-900">Engajamento & Reviews</span>
          </div>

          <div className="ml-auto text-xs sm:text-sm text-slate-500">
            Ainda não tem conta?{' '}
            <Link
              href="/auth/sign-up"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors ml-1"
            >
              Criar conta gratuita
            </Link>
          </div>
        </header>

        {/* Conteúdo Central do Formulário */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Acesse sua conta
            </h2>
            <p className="text-sm text-slate-600">
              Digite seu e-mail e senha cadastrados para entrar na plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Requisito de Aceitação: Alert em vermelho no formulário caso haja erro */}
            {errorMessage && (
              <Alert
                variant="destructive"
                className="border-red-300 bg-red-50/90 text-red-900 py-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <div className="ml-2">
                  <AlertTitle className="text-sm font-semibold text-red-900">
                    Falha na autenticação
                  </AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm text-red-700 mt-0.5">
                    {errorMessage}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* E-mail */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                autoComplete="email"
                error={Boolean(errors.email)}
                className="h-11 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 text-sm transition-all"
                {...register('email')}
                disabled={isSubmitting}
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
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha de acesso"
                  autoComplete="current-password"
                  error={Boolean(errors.password)}
                  className="h-11 bg-white border-slate-200 pr-11 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600 text-sm transition-all"
                  {...register('password')}
                  disabled={isSubmitting}
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

            {/* Botão de Envio Principal */}
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar na Plataforma</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                <Lock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>Autenticação protegida por sessão HMAC-SHA256 e cookies HttpOnly.</span>
              </div>
            </div>
          </form>
        </div>

        {/* Rodapé da Coluna Direita */}
        <footer className="w-full max-w-md mx-auto pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Módulo de Engajamento de Produtos.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-800 transition-colors cursor-pointer">
              Ajuda & Suporte
            </span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">Segurança</span>
          </div>
        </footer>
      </section>
    </main>
  );
}
