'use client';

import React from 'react';
import {
  BookOpen,
  FileCode2,
  FolderGit2,
  Search,
  ShieldCheck,
  Workflow,
  Wrench,
  Sparkles,
} from 'lucide-react';
import NextLink from 'next/link';
import { CodeBlock } from '@/components/ui/DocsUI';

export type DocsCategoryId = 'getting-started' | 'codebases' | 'security' | 'reference';

export interface DocsCategory {
  id: DocsCategoryId;
  title: string;
  summary: string;
  accent: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface DocsArticle {
  slug: string;
  title: string;
  summary: string;
  category: DocsCategoryId;
  featured?: boolean;
  keywords: string[];
  render: () => React.ReactNode;
}

const Section = ({ eyebrow, title, children }: { eyebrow?: string; title: string; children: React.ReactNode }) => (
  <div className="space-y-4">
    {eyebrow && (
      <span className="text-[10px] text-[#6366F1] font-black uppercase tracking-wider block">
        {eyebrow}
      </span>
    )}
    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
      {title}
    </h3>
    {children}
  </div>
);

const Callout = ({ title, text, accent = '#6366F1' }: { title: string; text: string; accent?: string }) => (
  <div
    className="p-5 rounded-2xl"
    style={{
      backgroundColor: `${accent}14`, // ~8% opacity
      border: `1px solid ${accent}29`, // ~16% opacity
    }}
  >
    <span className="text-xs font-black block mb-2 tracking-wider" style={{ color: accent }}>
      {title}
    </span>
    <p className="text-white/75 text-sm leading-relaxed">
      {text}
    </p>
  </div>
);

const ArticleFrame = ({ children, eyebrow, title, summary }: { children: React.ReactNode; eyebrow: string; title: string; summary: string }) => (
  <div className="space-y-8">
    <div>
      <span className="text-xs text-[#6366F1] font-black uppercase tracking-[0.24em] block">
        {eyebrow}
      </span>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mt-3 tracking-tight">
        {title}
      </h1>
      <p className="text-white/65 mt-4 max-w-4xl text-sm md:text-base leading-relaxed">
        {summary}
      </p>
    </div>
    {children}
  </div>
);

const categories: DocsCategory[] = [
  { id: 'getting-started', title: 'Getting Started', summary: 'Onboarding, architecture, and the first integration steps.', accent: '#6366F1', icon: Sparkles },
  { id: 'codebases', title: 'Codebases', summary: 'Living documentation for Note, Vault, Flow, and Connect.', accent: '#EC4899', icon: FolderGit2 },
  { id: 'security', title: 'Security & Trust', summary: 'Identity, encryption tiers, session model, and guardrails.', accent: '#10B981', icon: ShieldCheck },
  { id: 'reference', title: 'Reference', summary: 'Product suites, integrations, and contribution workflows.', accent: '#F59E0B', icon: FileCode2 }];

const articles: DocsArticle[] = [
  {
    slug: 'overview',
    title: 'Overview',
    summary: 'A map of the ecosystem, its apps, and the rules that keep the graph coherent.',
    category: 'getting-started',
    featured: true,
    keywords: ['ecosystem', 'apps', 'overview', 'graph', 'landing'],
    render: () => (
      <ArticleFrame eyebrow="INTRODUCTION" title="The Reactive Graph" summary="Kylrix is organized as a graph of specialized apps, not a monolith. Docs should mirror that shape: start broad, then fan out by topic and codebase.">
        <div className="space-y-6">
          <Callout title="Core rule" text="Point to the source of truth instead of duplicating state across apps. Docs should explain where the source lives and why." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Accounts', body: 'Root of trust, sessions, passkeys, and ecosystem identity.' },
              { title: 'Vault', body: 'Zero-knowledge state store for secrets, wallets, and MEK-backed data.' },
              { title: 'Flow', body: 'Action engine for work state, schedules, and orchestration.' },
              { title: 'Connect', body: 'Real-time communication with read/unread integrity.' }].map((item) => (
              <div key={item.title} className="p-5 h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <h3 className="font-extrabold text-white mb-2 text-base">
                  {item.title}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ArticleFrame>
    ),
  },
  {
    slug: 'quick-start',
    title: 'Quick Start',
    summary: 'Understand the suites, clone the repo, and start from the product docs.',
    category: 'getting-started',
    featured: true,
    keywords: ['install', 'setup', 'quick start', 'repo', 'suites'],
    render: () => (
      <ArticleFrame eyebrow="GETTING STARTED" title="Quick Start" summary="Start with product understanding first, then move into local development and contribution flows.">
        <div className="space-y-6">
          <CodeBlock
            languages={{
              typescript: 'pnpm install\npnpm dev',
              go: 'Read /docs/architecture before introducing new services or handlers.',
              python: 'For scripts, align with existing data and auth boundaries in /lib and /functions.',
              dart: 'Use /docs/connect and /docs/vault as behavior references when changing UX flows.',
            }}
          />
          <Callout
            title="Next step"
            text="After quick start, read architecture, then jump into the suite-specific docs (Note, Vault, Flow, Connect)."
          />
        </div>
      </ArticleFrame>
    ),
  },
  {
    slug: 'architecture',
    title: 'Architecture',
    summary: 'How the ecosystem, routing, and data flow are meant to stay coherent.',
    category: 'getting-started',
    keywords: ['architecture', 'routing', 'state', 'source of truth'],
    render: () => (
      <ArticleFrame eyebrow="SYSTEMS" title="Architecture Principles" summary="The docs should explain the same architecture that the apps enforce: source of truth first, no unnecessary duplication, and clear boundaries around transient versus persistent state.">
        <div className="space-y-6">
          <Section title="Three layers of meaning">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Pulse', body: 'Live, transient state that should move in realtime rather than sit in tables.' },
                { title: 'Notification', body: 'Persistent pointers for noteworthy events that the UI evaluates on activity.' },
                { title: 'Universal session', body: 'One authenticated session spans the ecosystem and powers cross-app access.' }].map((item) => (
                <div key={item.title} className="p-5 h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                  <h3 className="font-extrabold text-white mb-2 text-base">
                    {item.title}
                  </h3>
                  <p className="text-white/65 text-sm leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </Section>
          <CodeBlock
            languages={{
              typescript: '// Example of a docs-driven pointer to the source app\nconst source = getEcosystemUrl("vault");',
              go: '// Cross-app access still follows the same source-of-truth rule',
              python: '# Document the data owner first, then the consumer',
              dart: '// The route should explain the object, not clone it',
            }}
          />
        </div>
      </ArticleFrame>
    ),
  },
  {
    slug: 'note',
    title: 'Note',
    summary: 'Why the Note codebase is structured around privacy, sharing, and AI-assisted organization.',
    category: 'codebases',
    featured: true,
    keywords: ['note', 'notes', 'sharing', 'ai', 'privacy'],
    render: () => (
      <ArticleFrame eyebrow="CODEBASE GUIDE" title="Note" summary="Note docs should explain why features are implemented the way they are in code, not just what the UI does.">
        <div className="space-y-6">
          <Callout
            title="Identity and sharing"
            text="Notes are tied to a user unless they are deliberate ghost notes. Public visibility is link-only, and docs should repeat that rule clearly."
            accent="#EC4899"
          />
          <Section title="What belongs here">
            <div className="space-y-3">
              {[
                'Search and retrieval behavior',
                'Ghost note isolation and link-only access',
                'Sharing flows and collaborator rules',
                'AI enrichment and content intelligence'].map((label) => (
                <div key={label} className="px-4 py-3 bg-white/[0.04] border border-white/[0.05] rounded-xl">
                  <span className="text-sm font-semibold text-white">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </ArticleFrame>
    ),
  },
  {
    slug: 'vault',
    title: 'Vault',
    summary: 'Zero-knowledge storage, master passwords, MEK handling, and unlock behavior.',
    category: 'codebases',
    keywords: ['vault', 'mek', 'unlock', 'decrypt', 'master password'],
    render: () => (
      <ArticleFrame eyebrow="CODEBASE GUIDE" title="Vault" summary="Vault docs should focus on how the encryption tiers work, what happens during unlock and reset flows, and why the system behaves that way.">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Tier 2', body: 'Client-side decrypted state backed by the Master Encryption Key.' },
              { title: 'Reset impact', body: 'A master password reset invalidates old MEKs and wipes unreadable Tier 2 material.' },
              { title: 'Passkeys', body: 'Wrapped to the old MEK and purged on reset to avoid stale access.' }].map((item) => (
              <div key={item.title} className="p-5 h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <h3 className="font-extrabold text-white mb-2 text-base">
                  {item.title}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <CodeBlock
            languages={{
              typescript: '// Vault docs should explain why data becomes unreadable after reset.',
              go: '// Any server-side helper still needs to respect the zero-knowledge boundary.',
              python: '# No plaintext fallback in the documentation or in the code.',
              dart: '// Unlocks should be described as derived state, not a permanent session.',
            }}
          />
        </div>
      </ArticleFrame>
    ),
  },
  {
    slug: 'security',
    title: 'Security',
    summary: 'Threat model, session model, encryption tiers, and what each docs page must reinforce.',
    category: 'security',
    featured: true,
    keywords: ['security', 'threat model', 'e2ee', 'passkeys', 'session', 'identity'],
    render: () => (
      <ArticleFrame eyebrow="SECURITY" title="Security Model" summary="This category should stitch together the trust model across all apps so readers can trace why each protection exists.">
        <div className="space-y-6">
          <Section title="What docs should repeatedly clarify">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Database encryption', body: 'Decrypted before the UI sees it.' },
                { title: 'Zero-knowledge', body: 'Vault and Connect DMs stay client-decrypted with the MEK.' },
                { title: 'Documented boundaries', body: 'Every article should say what is allowed, what is link-only, and what gets wiped.' }].map((item) => (
                <div key={item.title} className="p-5 h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                  <h3 className="font-extrabold text-white mb-2 text-base">
                    {item.title}
                  </h3>
                  <p className="text-white/65 text-sm leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </Section>
          <Callout
            title="Cross-reference"
            text="Security docs should link back to Note for ghost note behavior, Vault for MEK resets, and Connect for encrypted messages and read-state integrity."
            accent="#10B981"
          />
        </div>
      </ArticleFrame>
    ),
  },
  {
    slug: 'connect',
    title: 'Connect',
    summary: 'Messaging, call state, and integrity rules for realtime communication.',
    category: 'codebases',
    keywords: ['connect', 'chat', 'call', 'realtime', 'messaging'],
    render: () => (
      <ArticleFrame eyebrow="CODEBASE GUIDE" title="Connect" summary="Connect docs should focus on realtime pulses, encrypted DMs, read/unread integrity, and why transient state stays transient.">
        <div className="space-y-6">
          <Callout
            title="Realtime first"
            text="When communication is live, docs should explain the pulse path rather than the database path whenever possible."
            accent="#F59E0B"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Calls', body: 'Session setup, active call state, and why call history is a separate read model.' },
              { title: 'Messages', body: 'Encrypted DMs and the rules that protect unread/read integrity.' },
              { title: 'Presence', body: 'Transient signals should use realtime rather than long-lived tables.' }].map((item) => (
              <div key={item.title} className="p-5 h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <h3 className="font-extrabold text-white mb-2 text-base">
                  {item.title}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ArticleFrame>
    ),
  },
  {
    slug: 'flow',
    title: 'Flow',
    summary: 'Work orchestration, task state, schedules, and action pipelines.',
    category: 'codebases',
    keywords: ['flow', 'tasks', 'schedule', 'orchestration', 'calendar'],
    render: () => (
      <ArticleFrame eyebrow="CODEBASE GUIDE" title="Flow" summary="Flow docs should capture the action engine: how work gets queued, why tasks live where they do, and how calendars and work state fit together.">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Tasks', body: 'Explain task lifecycles, status transitions, and where source-of-truth state lives.' },
              { title: 'Calendar', body: 'Show how schedule views relate to work state rather than duplicating it.' },
              { title: 'Automation', body: 'Document orchestration triggers and reusable action patterns.' }].map((item) => (
              <div key={item.title} className="p-5 h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <h3 className="font-extrabold text-white mb-2 text-base">
                  {item.title}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ArticleFrame>
    ),
  },
  {
    slug: 'integrations',
    title: 'Integrations',
    summary: 'How external systems should connect without violating ecosystem boundaries.',
    category: 'reference',
    featured: true,
    keywords: ['integrations', 'webhooks', 'automation', 'accounts', 'boundaries'],
    render: () => (
      <ArticleFrame eyebrow="REFERENCE" title="Integrations" summary="Integrations should preserve source-of-truth ownership: read from the owning suite, write through the owning boundary.">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Suite ownership', body: 'Use Note, Vault, Flow, and Connect docs to determine where each object is authoritative.' },
              { title: 'Auth boundary', body: 'Route privileged operations through trusted account/session flows, never ad-hoc credentials.' },
              { title: 'Operational safety', body: 'Document retry, idempotency, and failure behavior before shipping integrations.' }].map((item) => (
              <div key={item.title} className="p-5 h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <h3 className="font-extrabold text-white mb-2 text-base">
                  {item.title}
                </h3>
                <p className="text-white/65 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <Callout title="Integration checklist" text="Define owner suite, auth model, failure semantics, and observability before implementation." accent="#F59E0B" />
        </div>
      </ArticleFrame>
    ),
  },
  {
    slug: 'contributing',
    title: 'Contributing',
    summary: 'Guide for engineers contributing to the Kylrix codebase and shared runtime.',
    category: 'reference',
    keywords: ['contributing', 'codebase', 'pull requests', 'architecture', 'standards'],
    render: () => (
      <ArticleFrame eyebrow="REFERENCE" title="Contributing" summary="Contribution docs should help engineers ship safely across suites without breaking shared infrastructure.">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Understand the suite first', body: 'Start from the relevant docs page (Note, Vault, Flow, Connect) before touching code.' },
              { title: 'Preserve trusted bridges', body: 'Reuse known working paths and references instead of rewriting foundations.' },
              { title: 'Cross-surface consistency', body: 'When changing shared behavior, verify route, drawer, and topbar consistency across suites.' }].map((item) => (
              <div key={item.title} className="p-5 h-full bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-[#F59E0B] flex-shrink-0">
                    {item.title === 'Understand the suite first' ? <Workflow size={16} /> : <Wrench size={16} />}
                  </div>
                  <h3 className="font-extrabold text-white text-base">
                    {item.title}
                  </h3>
                </div>
                <p className="text-white/65 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <Callout title="Pull request quality" text="Keep changes surgical, update directly related docs, and avoid unrelated refactors in the same PR." accent="#F59E0B" />
        </div>
      </ArticleFrame>
    ),
  },
];

export const DOCS_CATEGORIES = categories;
export const DOCS_ARTICLES = articles;
const DOCS_ARTICLE_ALIASES: Record<string, string> = {
  identity: 'security',
  developers: 'contributing',
};

export const DOCS_FEATURED = articles.filter((article) => article.featured);

export const getDocsArticleBySlug = (slug: string) =>
  DOCS_ARTICLES.find((article) => article.slug === slug) ||
  DOCS_ARTICLES.find((article) => article.slug === DOCS_ARTICLE_ALIASES[slug]) ||
  null;

export const getDocsCategory = (id: DocsCategoryId) => DOCS_CATEGORIES.find((category) => category.id === id) || null;

export const getDocsArticleSearchText = (article: DocsArticle) =>
  [article.title, article.summary, article.category, ...article.keywords].join(' ').toLowerCase();

export const searchDocsArticles = (query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return DOCS_ARTICLES;
  return DOCS_ARTICLES.filter((article) => getDocsArticleSearchText(article).includes(normalized));
};

export const DocsCard = ({
  article,
  selected = false,
}: {
  article: DocsArticle;
  selected?: boolean;
}) => {
  const category = getDocsCategory(article.category);
  const Icon = category?.icon || BookOpen;
  const accentColor = category?.accent || '#6366F1';

  return (
    <div
      className={`p-5 rounded-2xl h-full transition-all border ${
        selected ? 'bg-white/[0.05]' : 'bg-white/[0.025]'
      }`}
      style={{
        borderColor: selected ? `${accentColor}52` : 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div style={{ color: accentColor }}>
          <Icon size={18} />
        </div>
        <span className="font-black text-xs tracking-wider block uppercase" style={{ color: accentColor }}>
          {category?.title}
        </span>
      </div>
      <h3 className="font-extrabold text-white mb-2 text-base">
        {article.title}
      </h3>
      <p className="text-white/65 text-sm leading-relaxed">
        {article.summary}
      </p>
    </div>
  );
};

export const DocsLandingHero = () => (
  <div className="space-y-4">
    <span className="text-[#6366F1] font-black text-xs tracking-[0.3em] block uppercase">
      DOCUMENTATION
    </span>
    <h1 className="font-black text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-none">
      Master the <br /> Ecosystem.
    </h1>
    <p className="max-w-3xl text-white/60 text-lg md:text-xl leading-relaxed">
      Searchable, categorized documentation for the ecosystem, its codebases, its security model, and its reference material.
    </p>
  </div>
);

export const DocsLandingSearchTip = () => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
    <Search size={16} className="text-white/60" />
    <p className="text-white/60 text-sm">
      Use the sidebar search to jump across topics, codebases, and reference pages.
    </p>
  </div>
);

export const DocsLandingAction = () => (
  <NextLink
    href="/docs/quick-start"
    className="px-6 py-3 bg-[#6366F1] hover:bg-[#6366F1]/90 text-black font-extrabold rounded-[10px] text-sm transition-all text-center inline-block"
  >
    Start with Quick Start
  </NextLink>
);

export const DocsRenderArticle = ({ slug }: { slug: string }) => {
  const article = getDocsArticleBySlug(slug);
  if (!article) return null;
  return <>{article.render()}</>;
};
