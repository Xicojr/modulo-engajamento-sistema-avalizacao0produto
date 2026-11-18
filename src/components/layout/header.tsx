'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, MessageSquare, UserPlus } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              Módulo de Engajamento
            </span>
            <span className="text-[11px] font-medium text-slate-500 leading-none">
              Avaliação & Satisfação de Produtos
            </span>
          </div>
        </Link>

        {/* Auth Navigation */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 animate-pulse rounded-md bg-slate-200" />
            </div>
          ) : user ? (
            /* Logged In State: Avatar (DiceBear) + Name + Email + Sign Out */
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-full bg-slate-100/80 py-1 pl-1 pr-3 border border-slate-200/60 shadow-sm">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    `${user.first_name} ${user.last_name}`,
                  )}&backgroundColor=2563eb,0284c7,4f46e5&textColor=ffffff`}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="h-8 w-8 rounded-full ring-2 ring-white object-cover"
                />
                <div className="flex flex-col text-left text-xs">
                  <span className="font-semibold text-slate-900 leading-tight">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="text-slate-500 text-[11px] leading-tight">{user.email}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="h-9 gap-1.5 border-slate-200 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Encerrar sessão"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          ) : (
            /* Visitor / Logged Out State: Sign In and Sign Up buttons */
            <div className="flex items-center gap-2">
              <Link href="/auth/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </Button>
              </Link>

              <Link href="/auth/sign-up">
                <Button
                  size="sm"
                  className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm shadow-blue-500/20"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Criar conta</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
