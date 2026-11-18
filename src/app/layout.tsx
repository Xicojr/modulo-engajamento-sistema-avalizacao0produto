import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { AuthProvider } from '@/components/providers/auth-provider';
import { QueryProvider } from '@/components/providers/query-provider';

export const metadata: Metadata = {
  title: 'Módulo de Engajamento e Avaliação de Produtos',
  description: 'Sistema seguro de engajamento e avaliação de produtos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900 flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <Header />
            <div className="flex-1 flex flex-col">{children}</div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
