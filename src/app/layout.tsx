import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';

export const metadata: Metadata = {
  title: 'Criação de Conta | Módulo de Engajamento',
  description: 'Sistema de engajamento e avaliação de produtos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
