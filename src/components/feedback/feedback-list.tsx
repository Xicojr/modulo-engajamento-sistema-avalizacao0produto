'use client';

import type { ProductFeedback } from '@/lib/feedbacks';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { StarRating } from './star-rating';

interface FeedbackListProps {
  feedbacks: ProductFeedback[];
  isLoading?: boolean;
}

export function FeedbackList({ feedbacks, isLoading = false }: FeedbackListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((skeletonId) => (
          <div
            key={skeletonId}
            className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 animate-pulse space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-900 rounded" />
              </div>
            </div>
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded" />
              <div className="h-3.5 w-4/5 bg-zinc-100 dark:bg-zinc-900 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Nenhuma avaliação ainda
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
          Ainda não há avaliações para este produto. Seja o primeiro a compartilhar sua experiência!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((fb) => {
        const authorName = fb.author
          ? `${fb.author.first_name} ${fb.author.last_name}`.trim()
          : 'Usuário verificado';

        const avatarSeed = fb.author?.first_name
          ? `${fb.author.first_name}+${fb.author.last_name}`
          : fb.created_by || 'Anonymous';

        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`;

        let relativeDate = '';
        try {
          relativeDate = formatDistanceToNow(new Date(fb.created_at), {
            addSuffix: true,
            locale: ptBR,
          });
        } catch {
          relativeDate = 'recentemente';
        }

        return (
          <article
            key={fb.id}
            className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 flex-shrink-0">
                  <Image
                    src={avatarUrl}
                    alt={authorName}
                    fill
                    sizes="40px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {authorName}
                  </h4>
                  <time
                    dateTime={fb.created_at}
                    className="text-xs text-zinc-500 dark:text-zinc-400"
                  >
                    {relativeDate}
                  </time>
                </div>
              </div>

              <div className="flex-shrink-0">
                <StarRating score={fb.score} size="sm" />
              </div>
            </div>

            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
              {fb.comment}
            </p>
          </article>
        );
      })}
    </div>
  );
}
