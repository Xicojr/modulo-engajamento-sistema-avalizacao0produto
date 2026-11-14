import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-xl">
        <Card className="border border-slate-200/80 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Módulo de Engajamento
            </CardTitle>
            <CardDescription className="text-base text-slate-600 mt-2">
              Sistema de engajamento e avaliação de produtos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="rounded-lg bg-slate-100/80 p-4 border border-slate-200 text-sm text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Autenticação segura implementada com Bcrypt</span>
              </div>
              <p className="text-slate-600 pl-6">
                Crie sua conta para acessar o sistema com separação de nomes, validações em tempo
                real e integração segura.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/auth/sign-up" className="w-full">
                <Button className="w-full h-11 text-base gap-2 font-medium shadow-md">
                  <UserPlus className="h-5 w-5" />
                  Ir para Criação de Conta
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
