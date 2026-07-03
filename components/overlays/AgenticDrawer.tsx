'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlarmClock,
  ArrowLeft,
  BarChart3,
  Bell,
  Bot,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Compass,
  CreditCard,
  FolderKanban,
  Kanban,
  KeyRound,
  Lightbulb,
  Link2,
  ListTodo,
  Lock,
  MessageSquare,
  PenLine,
  Play,
  Plug,
  Plus,
  Power,
  RefreshCw,
  Send,
  Settings,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Tags,
  Target,
  User,
  Users,
  Video,
  Workflow,
  X,
  AlertCircle,
} from 'lucide-react';

import { useAgenticDrawer } from '@/context/AgenticDrawerContext';
import { useAuth } from '@/context/auth/AuthContext';
import { AgenticService } from '@/lib/services/agentic';
import { runMyAgent, executeInstantRequestAction } from '@/lib/actions/agentic';
import {
  buildInstantPrompt,
  getQuickWorkflows,
  resolveAgenticPageContext,
  type QuickWorkflowAction,
} from '@/lib/agentic/context-workflows';
import { getAppColor } from '@/lib/ecosystem-app-colors';
import { useProUpgrade } from '@/context/ProUpgradeContext';
import { hasPaidKylrixPlan } from '@/lib/utils';
import { account } from '@/lib/appwrite/client';

type AgentFramework = 'kylrix' | 'openclaw' | 'hermes';

type AgentStatus = 'idle' | 'working';

interface AgentRow {
  $id: string;
  ownerId: string;
  parentId?: string | null;
  publicKey?: string | null;
  config?: string;
  status?: string;
  $updatedAt?: string;
}

const frameworks: Array<{ id: AgentFramework; title: string; comingSoon?: boolean }> = [
  { id: 'kylrix', title: 'Kylrix Internal' },
  { id: 'openclaw', title: 'OpenClaw', comingSoon: true },
  { id: 'hermes', title: 'Hermes', comingSoon: true },
];

const QUICK_ICON_MAP: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  'pen-line': PenLine,
  sparkles: Sparkles,
  'list-todo': ListTodo,
  'share-2': Share2,
  'calendar-range': CalendarRange,
  'alarm-clock': AlarmClock,
  target: Target,
  kanban: Kanban,
  'shield-check': ShieldCheck,
  'key-round': KeyRound,
  tags: Tags,
  lock: Lock,
  'message-square': MessageSquare,
  users: Users,
  video: Video,
  'bar-chart-3': BarChart3,
  send: Send,
  'link-2': Link2,
  'folder-kanban': FolderKanban,
  bell: Bell,
  shield: Shield,
  bot: Bot,
  compass: Compass,
  'refresh-cw': RefreshCw,
  settings: Settings,
  'credit-card': CreditCard,
  user: User,
  sunrise: Sunrise,
  lightbulb: Lightbulb,
  workflow: Workflow,
};

function zoneBadgeLabel(zone: string): string {
  switch (zone) {
    case 'note':
      return 'IDEAS';
    case 'flow':
      return 'FLOW';
    case 'vault':
      return 'VAULT';
    case 'connect':
      return 'CONNECT';
    case 'projects':
      return 'PROJECTS';
    case 'settings':
      return 'SETTINGS';
    case 'agents':
      return 'SMART SYSTEM';
    case 'accounts':
      return 'ACCOUNTS';
    default:
      return 'WORKSPACE';
  }
}

function formatUpdatedAgo(value?: string): string {
  if (!value) return 'Just now';
  const ts = new Date(value).getTime();
  if (!Number.isFinite(ts)) return 'updated just now';
  const deltaMs = Date.now() - ts;
  if (deltaMs < 60_000) return 'updated just now';
  const mins = Math.floor(deltaMs / 60_000);
  if (mins < 60) return `updated ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `updated ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `updated ${days}d ago`;
}

interface DrawerShellProps {
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
  isExpanded?: boolean;
  setIsExpanded?: (val: boolean) => void;
  zIndexClass: string;
  children: React.ReactNode;
  showDragHandle?: boolean;
}

function DrawerShell({
  isOpen,
  onClose,
  isDesktop,
  isExpanded = false,
  setIsExpanded,
  zIndexClass,
  children,
  showDragHandle = true
}: DrawerShellProps) {
  if (!isOpen) return null;

  const isFullscreen = !isDesktop && isExpanded;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isFullscreen ? 'z-[10000]' : zIndexClass}`}
        onClick={onClose}
      />
      {/* Drawer Body */}
      <div
        className={`fixed bg-[#161412] border-[#34322F] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'z-[10001] inset-0 h-[100dvh] max-h-[100dvh] w-full rounded-none border-0'
            : isDesktop
              ? `${zIndexClass} top-[88px] right-0 h-[calc(100vh-88px)] w-[460px] border-l border-t rounded-tl-[24px]`
              : `${zIndexClass} bottom-0 left-0 right-0 h-[60dvh] border-t rounded-t-[24px]`
        }`}
      >
        {/* Mobile Drag Handle */}
        {!isDesktop && showDragHandle && !isFullscreen && (
          <div
            className="flex justify-center py-3 cursor-pointer select-none"
            onClick={onClose}
          >
            <div className="w-10 h-1 rounded bg-[#3D3A36]" />
          </div>
        )}
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </>
  );
}

export function AgenticDrawer() {
  const { isOpen, closeAgenticDrawer, consumePendingPrompt } = useAgenticDrawer();
  const { user } = useAuth();
  const { openProUpgrade } = useProUpgrade();
  const pathname = usePathname() || '/';
  const router = useRouter();
  const isPro = hasPaidKylrixPlan(user);
  const promptInputRef = useRef<HTMLInputElement>(null);

  const pageContext = useMemo(() => resolveAgenticPageContext(pathname), [pathname]);
  const accent = useMemo(() => getAppColor(pageContext.accentApp), [pageContext.accentApp]);
  const quickWorkflows = useMemo(() => getQuickWorkflows(pageContext), [pageContext]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showAgents, setShowAgents] = useState(false);
  const [runningWorkflowId, setRunningWorkflowId] = useState<string | null>(null);

  // Nested Overlay State Controllers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFrameworkOpen, setIsFrameworkOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const [framework, setFramework] = useState<AgentFramework>('kylrix');
  const [agentName, setAgentName] = useState('');
  const [agentGoal, setAgentGoal] = useState('');
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingAgentId, setUpdatingAgentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Instant command states
  const [instantPrompt, setInstantPrompt] = useState('');
  const [instantResponse, setInstantResponse] = useState<string | null>(null);
  const [executingInstant, setExecutingInstant] = useState(false);
  const [instantError, setInstantError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setIsCreateOpen(false);
      setIsFrameworkOpen(false);
      setSelectedAgentId(null);
      setFramework('kylrix');
      setAgentName('');
      setAgentGoal('');
      setError(null);
      setIsExpanded(false);
      setInstantPrompt('');
      setInstantResponse(null);
      setInstantError(null);
      setShowAgents(false);
      setRunningWorkflowId(null);
    }
  }, [isOpen]);

  const runInstant = useCallback(
    async (rawPrompt: string) => {
      const trimmed = rawPrompt.trim();
      if (!trimmed) return;

      if (!isPro) {
        openProUpgrade('Smart System request');
        return;
      }

      setExecutingInstant(true);
      setInstantError(null);
      setInstantResponse(null);
      try {
        const jwt = await account.createJWT().then((res: { jwt?: string }) => res?.jwt || '').catch(() => undefined);
        const contextualPrompt = buildInstantPrompt(trimmed, pageContext);
        const res = await executeInstantRequestAction(contextualPrompt, jwt, {
          zone: pageContext.zone,
          route: pageContext.route,
          title: pageContext.title,
          systemHint: pageContext.systemHint,
          resourceId: pageContext.resourceId,
        });
        if (res.success) {
          setInstantResponse(res.response);
        }
      } catch (err: unknown) {
        setInstantError(err instanceof Error ? err.message : 'Execution failed.');
      } finally {
        setExecutingInstant(false);
        setRunningWorkflowId(null);
      }
    },
    [isPro, openProUpgrade, pageContext],
  );

  const handleQuickAction = useCallback(
    async (action: QuickWorkflowAction) => {
      if (action.kind === 'navigate' && action.href) {
        closeAgenticDrawer();
        router.push(action.href);
        return;
      }

      const prompt = action.prompt || '';
      if (action.kind === 'prompt') {
        setInstantPrompt(prompt);
        promptInputRef.current?.focus();
        return;
      }

      if (!prompt) return;
      setInstantPrompt(prompt);
      if (action.autoRun) {
        setRunningWorkflowId(action.id);
        await runInstant(prompt);
      }
    },
    [closeAgenticDrawer, router, runInstant],
  );

  useEffect(() => {
    if (!isOpen) return;
    const pending = consumePendingPrompt();
    if (pending?.prompt) {
      setInstantPrompt(pending.prompt);
      if (pending.autoRun) {
        void runInstant(pending.prompt);
      } else {
        promptInputRef.current?.focus();
      }
    }
  }, [isOpen, consumePendingPrompt, runInstant]);

  const fetchAgents = useCallback(async () => {
    if (!user?.$id) {
      setAgents([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await AgenticService.listMyAgents(user.$id);
      setAgents(rows as unknown as AgentRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load agents.');
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    if (!isOpen || !user?.$id) return;
    void fetchAgents();
  }, [fetchAgents, isOpen, user?.$id]);

  const createAgent = useCallback(async () => {
    if (!user?.$id || !agentName.trim()) return;

    if (!isPro) {
      openProUpgrade('Create AI Agent');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await AgenticService.createMyAgent({
        userId: user.$id,
        name: agentName.trim(),
        goal: agentGoal.trim(),
        framework,
      });
      setAgentName('');
      setAgentGoal('');
      setIsCreateOpen(false);
      await fetchAgents();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create agent.');
    } finally {
      setSaving(false);
    }
  }, [agentGoal, agentName, fetchAgents, framework, isPro, openProUpgrade, user?.$id]);

  const setAgentStatus = useCallback(async (agent: AgentRow, status: AgentStatus) => {
    if (!user?.$id) return;
    setUpdatingAgentId(agent.$id);
    setError(null);
    try {
      await AgenticService.setMyAgentStatus(user.$id, agent.$id, status);
      setAgents((prev) => prev.map((entry) => (entry.$id === agent.$id ? { ...entry, status } : entry)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update agent status.');
    } finally {
      setUpdatingAgentId(null);
    }
  }, [user?.$id]);

  const runAgentNow = useCallback(async (agent: AgentRow) => {
    if (!user?.$id) return;

    if (!isPro) {
      openProUpgrade('Run AI Agent');
      return;
    }

    setUpdatingAgentId(agent.$id);
    setError(null);
    try {
      await AgenticService.setMyAgentStatus(user.$id, agent.$id, 'working');
      setAgents((prev) => prev.map((entry) => (entry.$id === agent.$id ? { ...entry, status: 'working' } : entry)));
      await runMyAgent(agent.$id);
      await fetchAgents();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not run agent.');
      await fetchAgents();
    } finally {
      setUpdatingAgentId(null);
    }
  }, [fetchAgents, isPro, openProUpgrade, user?.$id]);

  const parsedAgents = useMemo(() => {
    return agents.map((agent) => {
      let config: { name?: string; goal?: string; framework?: string; lastSummary?: string | null; lastError?: string | null } = {};
      try {
        config = JSON.parse(agent.config || '{}');
      } catch {
        config = {};
      }
      return {
        ...agent,
        name: config.name || `Agent ${agent.$id.slice(0, 6)}`,
        goal: config.goal || 'No goal defined yet.',
        framework: (config.framework as AgentFramework) || 'kylrix',
        status: agent.status === 'working' ? 'working' : 'idle',
        lastSummary: config.lastSummary || null,
        lastError: config.lastError || null,
      };
    });
  }, [agents]);

  const selectedAgent = useMemo(() => {
    return parsedAgents.find((a) => a.$id === selectedAgentId) || null;
  }, [parsedAgents, selectedAgentId]);

  const runSummary = useMemo(() => {
    const working = parsedAgents.filter((a) => a.status === 'working').length;
    return {
      total: parsedAgents.length,
      working,
      idle: Math.max(parsedAgents.length - working, 0),
    };
  }, [parsedAgents]);

  return (
    <>
      <DrawerShell
        isOpen={isOpen}
        onClose={closeAgenticDrawer}
        isDesktop={isDesktop}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        zIndexClass="z-[1300]"
      >
        <div className="px-5 md:px-7 pb-6 pt-3 md:pt-6 flex-1 flex flex-col min-h-0 font-satoshi">
          {/* Context header */}
          <div className="flex items-start justify-between mb-5 flex-shrink-0">
            <div className="flex items-start gap-3.5 min-w-0">
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center bg-[#0B0A09] border flex-shrink-0"
                style={{ borderColor: `${accent}33`, boxShadow: `0 0 18px ${accent}22` }}
              >
                <Sparkles size={18} style={{ color: accent }} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[9px] font-black tracking-[0.18em] px-2 py-0.5 rounded-md border"
                    style={{ color: accent, borderColor: `${accent}33`, backgroundColor: `${accent}12` }}
                  >
                    {zoneBadgeLabel(pageContext.zone)}
                  </span>
                  {runSummary.working > 0 && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#F59E0B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                      {runSummary.working} running
                    </span>
                  )}
                </div>
                <h2 className="text-white font-extrabold text-[17px] font-clash tracking-tight leading-tight truncate">
                  {pageContext.title}
                </h2>
                <p className="text-[#9B9691] text-xs font-semibold leading-snug">
                  {pageContext.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!isDesktop && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? 'Scale down' : 'Scale up'}
                  className="p-1.5 text-[#E8E6E3] bg-[#0A0908] border border-[#34322F] rounded-lg hover:bg-[#1C1A18] transition"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              )}
              <button
                type="button"
                onClick={closeAgenticDrawer}
                aria-label="Close"
                className="p-1.5 text-[#E8E6E3] bg-[#0A0908] border border-[#34322F] rounded-lg hover:bg-[#1C1A18] transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4">
            {/* Command bar */}
            <div
              className="flex flex-col gap-3 p-4 rounded-[20px] bg-[#0B0A09] border border-white/5 relative overflow-hidden"
              style={{ boxShadow: `0 -8px 28px rgba(0,0,0,0.35), 0 12px 32px rgba(0,0,0,0.45)` }}
            >
              <div
                className="absolute -top-8 -right-6 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-70"
                style={{ background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)` }}
              />
              <div className="flex items-center gap-2 relative z-10">
                <span className="text-white text-[11px] font-black uppercase tracking-wider font-clash">
                  Do it now
                </span>
                {!isPro && (
                  <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    PRO
                  </span>
                )}
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await runInstant(instantPrompt);
                }}
                className="relative z-10"
              >
                <input
                  ref={promptInputRef}
                  type="text"
                  value={instantPrompt}
                  onChange={(e) => setInstantPrompt(e.target.value)}
                  placeholder={pageContext.placeholder}
                  disabled={executingInstant}
                  className="w-full pl-3.5 pr-12 py-3.5 rounded-xl bg-[#161412] border border-white/5 text-xs text-white font-semibold placeholder:text-[#9B9691]/45 focus:outline-none transition-all duration-300 disabled:opacity-50"
                  style={{
                    boxShadow: executingInstant ? `0 0 0 1px ${accent}55` : undefined,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = `${accent}66`;
                    e.currentTarget.style.boxShadow = `0 0 14px ${accent}22`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="submit"
                  disabled={executingInstant || !instantPrompt.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white disabled:bg-white/5 disabled:text-[#9B9691]/40 transition-all duration-300 cursor-pointer"
                  style={{ backgroundColor: executingInstant || !instantPrompt.trim() ? undefined : accent }}
                >
                  {executingInstant ? (
                    <RefreshCw size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                </button>
              </form>

              {instantError && (
                <div className="flex items-center gap-2 text-[10px] text-red-400 relative z-10">
                  <AlertCircle size={12} className="flex-shrink-0" />
                  <span className="font-semibold">{instantError}</span>
                </div>
              )}

              {instantResponse && (
                <div className="p-3.5 rounded-xl bg-[#161412] border border-white/5 max-h-[180px] overflow-y-auto relative z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-[#9B9691] font-bold uppercase tracking-wider">Result</span>
                    <button
                      type="button"
                      onClick={() => setInstantResponse(null)}
                      className="text-[10px] font-bold transition-colors cursor-pointer"
                      style={{ color: accent }}
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-white/95 text-xs whitespace-pre-wrap leading-relaxed">
                    {instantResponse}
                  </p>
                </div>
              )}
            </div>

            {/* Quick workflows */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#9B9691] font-clash">
                  Quick workflows
                </span>
                <span className="text-[10px] font-semibold text-white/30">
                  {quickWorkflows.length} for this page
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {quickWorkflows.map((action) => {
                  const Icon = QUICK_ICON_MAP[action.icon] || Sparkles;
                  const isRunning = runningWorkflowId === action.id || (executingInstant && instantPrompt === action.prompt);
                  return (
                    <button
                      key={action.id}
                      type="button"
                      disabled={isRunning}
                      onClick={() => void handleQuickAction(action)}
                      className="group text-left p-3.5 rounded-[16px] bg-[#0B0A09] border border-white/5 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60"
                      style={{
                        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${accent}44`;
                        e.currentTarget.style.boxShadow = `0 10px 24px rgba(0,0,0,0.35), 0 0 16px ${accent}18`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
                      }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 border"
                          style={{ color: accent, borderColor: `${accent}33`, backgroundColor: `${accent}10` }}
                        >
                          {isRunning ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Icon size={14} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-[12px] font-extrabold font-clash leading-tight truncate">
                            {action.label}
                          </p>
                          <p className="text-[#9B9691] text-[10px] font-semibold mt-0.5 leading-snug line-clamp-2">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Agents (collapsible) */}
            <div className="rounded-[20px] bg-[#0B0A09] border border-white/5 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAgents((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#161412] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Bot size={15} style={{ color: accent }} />
                  <span className="text-white text-xs font-extrabold font-clash">Your agents</span>
                  <span className="text-[10px] font-bold text-[#9B9691]">
                    {runSummary.total} · {runSummary.working} active
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-[#9B9691] transition-transform ${showAgents ? 'rotate-90' : ''}`}
                />
              </button>

              {showAgents && (
                <div className="px-4 pb-4 flex flex-col gap-2.5 border-t border-white/5 pt-3">
                  {error && <span className="text-[#FCA5A5] text-xs">{error}</span>}

                  {loading ? (
                    <div className="py-8 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 animate-spin" style={{ color: accent }} />
                    </div>
                  ) : parsedAgents.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-[#9B9691] text-xs font-semibold">
                        No agents yet. Create one to automate recurring work.
                      </p>
                    </div>
                  ) : (
                    parsedAgents.map((agent) => {
                      const isWorking = agent.status === 'working';
                      return (
                        <button
                          key={agent.$id}
                          type="button"
                          onClick={() => setSelectedAgentId(agent.$id)}
                          className="w-full text-left p-3 rounded-xl bg-[#161412] border border-white/5 hover:border-white/10 transition"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-white font-extrabold text-[12px] font-clash truncate">
                                {agent.name}
                              </p>
                              <p className="text-[10px] text-[#9B9691] font-semibold mt-0.5">
                                {formatUpdatedAgo(agent.$updatedAt)}
                              </p>
                            </div>
                            <span
                              className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border flex-shrink-0"
                              style={
                                isWorking
                                  ? { color: accent, borderColor: `${accent}44`, backgroundColor: `${accent}14` }
                                  : { color: '#10B981', borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.12)' }
                              }
                            >
                              {agent.status}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}

                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-xs text-white transition cursor-pointer"
                    style={{ backgroundColor: accent }}
                  >
                    <Plus size={15} />
                    <span>New agent</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerShell>

      {/* NESTED OVERLAY 1: Initialize/Create Assistant Drawer */}
      {isCreateOpen && (
        <DrawerShell
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          isDesktop={isDesktop}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          zIndexClass="z-[1400]"
        >
          <div className="px-5 md:px-7 pb-6 pt-3 md:pt-6 flex-1 flex flex-col min-h-0 font-satoshi">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  aria-label="Back"
                  className="p-1.5 text-[#E8E6E3] bg-[#0A0908] border border-[#34322F] rounded-lg hover:bg-[#1C1A18] transition"
                >
                  <ArrowLeft size={16} />
                </button>
                <h3 className="text-white font-extrabold text-base font-clash tracking-tight">
                  Initialize Agent
                </h3>
              </div>
              {!isDesktop && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? 'Scale down' : 'Scale up'}
                  className="p-1.5 text-[#E8E6E3] bg-[#0A0908] border border-[#34322F] rounded-lg hover:bg-[#1C1A18] transition"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              )}
            </div>

            {/* Main Form Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 min-h-0">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9B9691] tracking-wider uppercase font-clash">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(event) => setAgentName(event.target.value)}
                  placeholder="e.g., Workspace Orchestrator"
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0908] border border-[#34322F] text-sm text-white font-semibold placeholder:text-[#9B9691]/40 focus:outline-none focus:border-[#6366F1] transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9B9691] tracking-wider uppercase font-clash">
                  Goal / Instructions
                </label>
                <textarea
                  value={agentGoal}
                  onChange={(event) => setAgentGoal(event.target.value)}
                  placeholder="e.g., Triage overdue tasks and notify team members..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0908] border border-[#34322F] text-sm text-white font-semibold placeholder:text-[#9B9691]/40 focus:outline-none focus:border-[#6366F1] transition resize-none leading-relaxed"
                />
              </div>

              {/* Framework Selector Trigger */}
              <div
                onClick={() => setIsFrameworkOpen(true)}
                className="p-4 rounded-xl bg-[#0A0908] border border-[#34322F] cursor-pointer hover:bg-[#1C1A18] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Plug size={18} className="text-[#6366F1]" />
                    <div className="flex flex-col">
                      <span className="text-[#9B9691] text-[10px] font-bold uppercase tracking-wider">
                        Runtime Host
                      </span>
                      <span className="text-white text-sm font-extrabold mt-0.5">
                        {framework === 'kylrix' ? 'Internal Engine' : framework}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#9B9691]" />
                </div>
              </div>

              <p className="text-[#9B9691] text-[11px] leading-relaxed px-1">
                Agents orchestrate workspace tools and run secure local pipelines.
              </p>
            </div>

            {/* Action Footer */}
            <div className="mt-auto pt-4 flex-shrink-0">
              <button
                type="button"
                onClick={async () => {
                  await createAgent();
                }}
                disabled={saving || !agentName.trim() || !user?.$id}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-sm bg-[#6366F1] hover:bg-[#575CF0] text-white disabled:bg-white/5 disabled:text-[#9B9691] transition cursor-pointer"
              >
                {saving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  'Ready'
                )}
              </button>
            </div>
          </div>
        </DrawerShell>
      )}

      {/* NESTED OVERLAY 2: Select Runtime Framework Drawer */}
      {isFrameworkOpen && (
        <DrawerShell
          isOpen={isFrameworkOpen}
          onClose={() => setIsFrameworkOpen(false)}
          isDesktop={isDesktop}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          zIndexClass="z-[1500]"
        >
          <div className="px-5 md:px-7 pb-6 pt-3 md:pt-6 flex-1 flex flex-col min-h-0 font-satoshi">
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsFrameworkOpen(false)}
                aria-label="Back"
                className="p-1.5 text-[#E8E6E3] bg-[#0A0908] border border-[#34322F] rounded-lg hover:bg-[#1C1A18] transition"
              >
                <ArrowLeft size={16} />
              </button>
              <h3 className="text-white font-extrabold text-base font-clash tracking-tight">
                Select Runtime
              </h3>
            </div>

            {/* Main List */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
              {frameworks.map((item) => {
                const selected = item.id === framework;
                const disabled = Boolean(item.comingSoon);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!disabled) {
                        setFramework(item.id);
                        setIsFrameworkOpen(false);
                      }
                    }}
                    className={`p-4 rounded-2xl bg-[#0A0908] border transition ${
                      selected ? 'border-[#6366F1]' : 'border-[#34322F]'
                    } ${disabled ? 'opacity-50 cursor-default' : 'cursor-pointer hover:bg-[#1C1A18]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-clash font-extrabold text-sm ${disabled ? 'text-[#9B9691]' : 'text-white'}`}>
                        {item.title}{item.comingSoon ? ' (Coming soon)' : ''}
                      </span>
                      {selected && <Check size={16} className="text-[#6366F1]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DrawerShell>
      )}

      {/* NESTED OVERLAY 3: Agent Details System Panel Drawer */}
      {selectedAgent && (
        <DrawerShell
          isOpen={Boolean(selectedAgent)}
          onClose={() => setSelectedAgentId(null)}
          isDesktop={isDesktop}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          zIndexClass="z-[1400]"
        >
          <div className="px-5 md:px-7 pb-6 pt-3 md:pt-6 flex-1 flex flex-col min-h-0 font-satoshi">
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedAgentId(null)}
                aria-label="Back"
                className="p-1.5 text-[#E8E6E3] bg-[#0A0908] border border-[#34322F] rounded-lg hover:bg-[#1C1A18] transition"
              >
                <ArrowLeft size={16} />
              </button>
              <h3 className="text-white font-extrabold text-base font-clash tracking-tight">
                Agent Configuration
              </h3>
            </div>

            {/* Main Details Panel */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6 min-h-0">
              {/* Name and State Card */}
              <div className="p-4 rounded-2xl bg-[#0A0908] border border-[#34322F]">
                <h4 className="text-white font-black text-lg font-clash mb-3 leading-snug">
                  {selectedAgent.name}
                </h4>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      selectedAgent.status === 'working'
                        ? 'bg-[#6366F1]/15 border-[#6366F1]/30 text-[#6366F1]'
                        : 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                    }`}
                  >
                    {selectedAgent.status}
                  </span>
                  <span className="text-[#9B9691] text-xs font-semibold">
                    {selectedAgent.framework === 'kylrix' ? 'Internal Engine' : selectedAgent.framework}
                  </span>
                </div>
              </div>

              {/* Goal Description Card */}
              <div className="flex flex-col gap-1.5">
                <h5 className="text-[#9B9691] text-[10px] font-bold uppercase tracking-wider px-1">
                  Objective Goal
                </h5>
                <div className="p-4 rounded-xl bg-[#0A0908] border border-[#34322F]">
                  <p className="text-white/85 text-xs leading-relaxed">
                    {selectedAgent.goal}
                  </p>
                </div>
              </div>

              {/* Logs & Run Summaries Card */}
              {(selectedAgent.lastSummary || selectedAgent.lastError) && (
                <div className="flex flex-col gap-1.5">
                  <h5 className="text-[#9B9691] text-[10px] font-bold uppercase tracking-wider px-1">
                    Agent Logs & Output
                  </h5>
                  <div className="p-4 rounded-xl bg-[#0A0908] border border-[#34322F]">
                    {selectedAgent.lastError ? (
                      <div className="flex gap-2.5 items-start">
                        <AlertCircle size={16} className="text-[#EF4444] mt-0.5 flex-shrink-0" />
                        <span className="text-[#FCA5A5] text-[11px] font-mono leading-relaxed break-all">
                          Error: {selectedAgent.lastError}
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2.5 items-start">
                        <RefreshCw size={16} className="text-[#10B981] mt-0.5 flex-shrink-0" />
                        <span className="text-white/70 text-[11px] font-mono leading-relaxed">
                          {selectedAgent.lastSummary}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="mt-auto pt-4 flex-shrink-0">
              {selectedAgent.status === 'working' ? (
                <button
                  type="button"
                  disabled={updatingAgentId === selectedAgent.$id}
                  onClick={async () => {
                    await setAgentStatus(selectedAgent, 'idle');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-sm bg-[#EF4444] hover:bg-[#DC2626] text-white disabled:opacity-50 transition cursor-pointer"
                >
                  <Power size={16} />
                  <span>Deactivate / Set Idle</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updatingAgentId === selectedAgent.$id}
                  onClick={async () => {
                    await runAgentNow(selectedAgent);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-extrabold text-sm bg-[#10B981] hover:bg-[#059669] text-white disabled:opacity-50 transition cursor-pointer"
                >
                  <Play size={16} />
                  <span>Run Agent Now</span>
                </button>
              )}
            </div>
          </div>
        </DrawerShell>
      )}
    </>
  );
}
