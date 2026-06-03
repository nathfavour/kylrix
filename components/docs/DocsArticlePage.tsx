'use client';

import NextLink from 'next/link';
import DocsShell from '@/components/docs/DocsShell';
import { DocsCard, DocsLandingAction, getDocsArticleBySlug } from '@/components/docs/catalog';

export default function DocsArticlePage({ slug }: { slug?: string[] }) {
  const normalizedSlug = slug?.join('/') || '';
  const article = getDocsArticleBySlug(normalizedSlug);

  return (
    <DocsShell>
      {article ? (
        article.render()
      ) : (
        <div className="space-y-6">
          <div>
            <span className="text-[#6366F1] font-black text-xs tracking-[0.24em] block uppercase">
              DOCUMENTATION
            </span>
            <h1 className="text-3xl md:text-4xl font-black mt-3 tracking-tight text-white">
              Page not found
            </h1>
            <p className="text-white/70 mt-4 max-w-2xl leading-relaxed text-sm md:text-base">
              That topic does not exist yet. Use the sidebar search or jump back to the docs landing page.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <NextLink 
              href="/docs" 
              className="px-6 py-3 bg-[#6366F1] hover:bg-[#6366F1]/90 text-black font-extrabold rounded-[10px] text-sm transition-all text-center inline-block"
            >
              Back to Docs
            </NextLink>
            <DocsLandingAction />
          </div>
          <div className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="font-extrabold mb-4 text-sm md:text-base text-white">
              Suggested topic
            </h2>
            <DocsCard article={getDocsArticleBySlug('overview')!} />
          </div>
        </div>
      )}
    </DocsShell>
  );
}
