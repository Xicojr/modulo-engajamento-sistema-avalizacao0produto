'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import * as React from 'react';
import { StarRating } from './star-rating';

interface FeedbackFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ productId, onSuccess }: FeedbackFormProps) {
  const [score, setScore] = React.useState<number>(5);
  const [comment, setComment] = React.useState<string>('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (payload: { score: number; comment: string }) => {
      const response = await fetch(`/api/v1/products/${productId}/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar avaliação.');
      }

      return data;
    },
    onSuccess: () => {
      setSuccessMessage('Sua avaliação foi publicada com sucesso!');
      setComment('');
      setScore(5);
      setFormError(null);

      // Invalida as queries de feedback, resumo por IA e dados do produto para sincronização instantânea
      queryClient.invalidateQueries({ queryKey: ['product-feedbacks', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-ai-summary', productId] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });

      onSuccess?.();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    },
    onError: (err: Error) => {
      setFormError(err.message);
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (score < 1 || score > 5) {
      setFormError('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 3) {
      setFormError('O comentário deve ter pelo menos 3 caracteres.');
      return;
    }

    if (trimmedComment.length > 1000) {
      setFormError('O comentário deve ter no máximo 1000 caracteres.');
      return;
    }

    feedbackMutation.mutate({ score, comment: trimmedComment });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-5"
    >
      <div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Deixe sua avaliação
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Compartilhe com a comunidade o que você achou deste produto.
        </p>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Seletor de Estrelas */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-zinc-800 dark:text-zinc-200 block">
          Sua nota
        </Label>
        <div className="flex items-center gap-3">
          <StarRating
            score={score}
            interactive
            onChange={(newScore) => {
              setScore(newScore);
              if (formError) setFormError(null);
            }}
            size="lg"
          />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {score === 1 && 'Péssimo'}
            {score === 2 && 'Ruim'}
            {score === 3 && 'Razoável'}
            {score === 4 && 'Muito bom'}
            {score === 5 && 'Excelente'}
          </span>
        </div>
      </div>

      {/* Comentário */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="feedback-comment"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Seu comentário
          </Label>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{comment.length}/1000</span>
        </div>

        <textarea
          id="feedback-comment"
          rows={4}
          value={comment}
          maxLength={1000}
          onChange={(e) => {
            setComment(e.target.value);
            if (formError) setFormError(null);
          }}
          placeholder="Conte sobre sua experiência, pontos fortes e possíveis melhorias..."
          disabled={feedbackMutation.isPending}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-zinc-100 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors resize-y disabled:opacity-50"
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={feedbackMutation.isPending || comment.trim().length < 3}
          className="gap-2 px-5 py-2.5 font-medium"
        >
          {feedbackMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Publicar avaliação
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
