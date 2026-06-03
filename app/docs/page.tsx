'use client';

import DocsShell from '@/components/docs/DocsShell';
import {
  DOCS_ARTICLES,
  DOCS_CATEGORIES,
  DOCS_FEATURED,
  DocsCard,
  DocsLandingAction,
  DocsLandingHero,
  DocsLandingSearchTip,
} from '@/components/docs/catalog';

export default function DocsPage() {
  return (
    <DocsShell>
      <div className="space-y-12">
        <DocsLandingHero />
        
        <div className="flex flex-col md:flex-row gap-4">
          <DocsLandingAction />
          <DocsLandingSearchTip />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOCS_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const count = DOCS_ARTICLES.filter((article) => article.category === category.id).length;
            return (
              <div 
                key={category.id} 
                className="p-6 h-full bg-white/[0.03] border rounded-2xl"
                style={{ borderColor: `${category.accent}20` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div style={{ color: category.accent }}>
                    <Icon size={18} />
                  </div>
                  <span className="font-black text-xs tracking-wider block uppercase" style={{ color: category.accent }}>
                    {category.title}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black mb-2 text-white">
                  {count} article{count === 1 ? '' : 's'}
                </h3>
                <p className="text-white/65 leading-relaxed text-sm">
                  {category.summary}
                </p>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-2xl font-black mb-6 text-white">
            Featured docs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DOCS_FEATURED.map((article) => (
              <div key={article.slug}>
                <DocsCard article={article} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DocsShell>
  );
}
