import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen w-full bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glows ambientais sutis */}
      <div className="absolute top-1/4 left-1/4 -ml-40 -mt-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -mr-40 -mb-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-8 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
          {/* Header com badge */}
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-50">
                Conta criada com sucesso
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Seu cadastro foi concluído e suas credenciais foram salvas com segurança no banco de
                dados.
              </p>
            </div>
          </div>

          {/* Cartão de Próximos Passos no Contexto de Engajamento */}
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/90 p-5 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-slate-100">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span>Módulo de Engajamento Desbloqueado</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Você agora tem permissão para configurar fluxos de coleta de reviews, monitorar
              índices de satisfação e visualizar análises de sentimentos dos seus produtos.
            </p>
            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Criptografia Bcrypt ativa
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                Pronto para uso
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3 pt-2">
            <Link href="/" className="w-full block">
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                <span>Acessar Painel da Plataforma</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/auth/sign-up" className="w-full block text-center">
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
              >
                Cadastrar outra conta
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
