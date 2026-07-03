export type AgenticZone =
  | 'note'
  | 'flow'
  | 'vault'
  | 'connect'
  | 'projects'
  | 'accounts'
  | 'settings'
  | 'agents'
  | 'workspace';

export type QuickActionKind = 'prompt' | 'instant' | 'navigate';

export interface AgenticPageContext {
  zone: AgenticZone;
  route: string;
  resourceId?: string;
  title: string;
  subtitle: string;
  placeholder: string;
  accentApp: string;
  systemHint: string;
}

export interface QuickWorkflowAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  kind: QuickActionKind;
  prompt?: string;
  href?: string;
  autoRun?: boolean;
}

const ZONE_META: Record<
  AgenticZone,
  Pick<AgenticPageContext, 'title' | 'subtitle' | 'placeholder' | 'accentApp' | 'systemHint'>
> = {
  note: {
    title: 'Ideas',
    subtitle: 'Capture, refine, and turn notes into action.',
    placeholder: 'Draft an outline, summarize, or reshape a note…',
    accentApp: 'note',
    systemHint: 'User is in Ideas (notes). Help with writing, summarizing, tagging, and turning notes into tasks.',
  },
  flow: {
    title: 'Flow',
    subtitle: 'Plan tasks, goals, and what happens next.',
    placeholder: 'Prioritize work, plan the week, or break down a goal…',
    accentApp: 'flow',
    systemHint: 'User is in Flow (tasks, goals, calendar). Help with prioritization, scheduling, and productivity.',
  },
  vault: {
    title: 'Vault',
    subtitle: 'Keep logins safe and easy to manage.',
    placeholder: 'Check password strength, suggest secrets, or audit entries…',
    accentApp: 'vault',
    systemHint: 'User is in Vault (passwords and secure items). Help with security hygiene and credential management.',
  },
  connect: {
    title: 'Connect',
    subtitle: 'Messages, calls, and team coordination.',
    placeholder: 'Draft a reply, plan a follow-up, or summarize a thread…',
    accentApp: 'connect',
    systemHint: 'User is in Connect (chat and calls). Help with communication drafts and coordination.',
  },
  projects: {
    title: 'Projects',
    subtitle: 'Ship work with linked notes, tasks, and people.',
    placeholder: 'Summarize status, plan next steps, or draft updates…',
    accentApp: 'root',
    systemHint: 'User is in Projects. Help with project status, collaborators, and linking workspace objects.',
  },
  accounts: {
    title: 'Accounts',
    subtitle: 'Profile, billing, and identity settings.',
    placeholder: 'Ask about your plan, profile, or account setup…',
    accentApp: 'accounts',
    systemHint: 'User is in Accounts. Help with profile, billing, and identity questions.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Tune alerts, security, and workspace preferences.',
    placeholder: 'Configure notifications, security, or preferences…',
    accentApp: 'accounts',
    systemHint: 'User is in Settings. Help with configuration and preferences.',
  },
  agents: {
    title: 'Smart System',
    subtitle: 'Run agents and automate recurring work.',
    placeholder: 'Describe what the system should handle for you…',
    accentApp: 'root',
    systemHint: 'User is managing agents. Help design goals, automations, and execution plans.',
  },
  workspace: {
    title: 'Workspace',
    subtitle: 'Your full Kylrix environment at a glance.',
    placeholder: 'Ask anything across notes, flow, vault, and projects…',
    accentApp: 'root',
    systemHint: 'User is in the general workspace. Help across notes, tasks, vault, and projects.',
  },
};

function resolveZone(pathname: string): AgenticZone {
  if (pathname.startsWith('/app')) return 'note';
  if (pathname.startsWith('/flow')) return 'flow';
  if (pathname.startsWith('/vault')) return 'vault';
  if (pathname.startsWith('/connect')) return 'connect';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/accounts')) return 'accounts';
  if (pathname.startsWith('/settings/agents') || pathname.startsWith('/agents')) return 'agents';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'workspace';
}

function extractResourceId(pathname: string, zone: AgenticZone): string | undefined {
  const segments = pathname.split('/').filter(Boolean);
  if (zone === 'projects' && segments[0] === 'projects' && segments[1]) return segments[1];
  if (zone === 'note' && segments[0] === 'app' && segments[1] && segments[1] !== 'shared') return segments[1];
  if (zone === 'connect' && segments[1]) return segments[1];
  return undefined;
}

export function resolveAgenticPageContext(pathname: string): AgenticPageContext {
  const route = pathname || '/';
  const zone = resolveZone(route);
  const meta = ZONE_META[zone];
  const resourceId = extractResourceId(route, zone);

  let title = meta.title;
  let subtitle = meta.subtitle;
  let systemHint = meta.systemHint;

  if (zone === 'projects' && resourceId) {
    title = 'Project room';
    subtitle = 'Status, people, and linked work in one place.';
    systemHint = `User is viewing project ${resourceId}. Help with status summaries, collaborator updates, and next steps.`;
  }

  if (zone === 'note' && resourceId) {
    title = 'Note editor';
    subtitle = 'Polish this note or branch it into tasks.';
    systemHint = `User is editing note ${resourceId}. Help rewrite, summarize, extract tasks, and improve clarity.`;
  }

  return {
    zone,
    route,
    resourceId,
    title,
    subtitle,
    placeholder: meta.placeholder,
    accentApp: meta.accentApp,
    systemHint,
  };
}

export function getQuickWorkflows(context: AgenticPageContext): QuickWorkflowAction[] {
  const { zone, resourceId } = context;

  switch (zone) {
    case 'note':
      return [
        {
          id: 'note-outline',
          label: 'Draft outline',
          description: 'Structure a new idea fast',
          icon: 'pen-line',
          kind: 'instant',
          prompt: 'Create a tight outline for a new idea note with 4–6 sections and starter bullets.',
          autoRun: true,
        },
        {
          id: 'note-summarize',
          label: 'Summarize pinned',
          description: 'Condense what matters now',
          icon: 'sparkles',
          kind: 'instant',
          prompt: 'Summarize my most important pinned notes into 5 bullet points with suggested next actions.',
          autoRun: true,
        },
        {
          id: 'note-to-tasks',
          label: 'Turn into tasks',
          description: 'Extract actionable steps',
          icon: 'list-todo',
          kind: 'instant',
          prompt: resourceId
            ? `From note ${resourceId}, extract a prioritized task list with owners and due hints.`
            : 'From my latest notes, extract a prioritized task list with owners and due hints.',
          autoRun: true,
        },
        {
          id: 'note-shared',
          label: 'Open shared',
          description: 'Browse shared notes',
          icon: 'share-2',
          kind: 'navigate',
          href: '/app/shared',
        },
      ];

    case 'flow':
      return [
        {
          id: 'flow-week',
          label: 'Plan my week',
          description: 'Map priorities by day',
          icon: 'calendar-range',
          kind: 'instant',
          prompt: 'Build a 5-day plan from my open tasks: top 3 priorities per day with time blocks.',
          autoRun: true,
        },
        {
          id: 'flow-overdue',
          label: 'Triage overdue',
          description: 'Rescue or reschedule',
          icon: 'alarm-clock',
          kind: 'instant',
          prompt: 'Review overdue tasks, rank by impact, and suggest reschedule or delegation options.',
          autoRun: true,
        },
        {
          id: 'flow-focus',
          label: 'Today focus',
          description: 'Pick the next 3 moves',
          icon: 'target',
          kind: 'instant',
          prompt: 'Pick the 3 highest-leverage tasks I should finish today and explain why.',
          autoRun: true,
        },
        {
          id: 'flow-open',
          label: 'Open Flow',
          description: 'Jump to task board',
          icon: 'kanban',
          kind: 'navigate',
          href: '/flow',
        },
      ];

    case 'vault':
      return [
        {
          id: 'vault-audit',
          label: 'Security check',
          description: 'Spot weak patterns',
          icon: 'shield-check',
          kind: 'instant',
          prompt: 'Give a vault hygiene checklist: reused passwords, stale entries, and rotation priorities.',
          autoRun: true,
        },
        {
          id: 'vault-password',
          label: 'New password',
          description: 'Strong random secret',
          icon: 'key-round',
          kind: 'instant',
          prompt: 'Generate a 20-character password with symbols and a memorable passphrase alternative.',
          autoRun: true,
        },
        {
          id: 'vault-organize',
          label: 'Organize labels',
          description: 'Group similar logins',
          icon: 'tags',
          kind: 'instant',
          prompt: 'Suggest a simple label system for my vault entries by app type and risk level.',
          autoRun: true,
        },
        {
          id: 'vault-open',
          label: 'Open Vault',
          description: 'Manage secrets',
          icon: 'lock',
          kind: 'navigate',
          href: '/vault',
        },
      ];

    case 'connect':
      return [
        {
          id: 'connect-reply',
          label: 'Draft reply',
          description: 'Clear, friendly tone',
          icon: 'message-square',
          kind: 'prompt',
          prompt: 'Draft a concise reply that acknowledges the message and proposes next steps:',
        },
        {
          id: 'connect-followup',
          label: 'Follow-up plan',
          description: 'Who does what by when',
          icon: 'users',
          kind: 'instant',
          prompt: 'Create a follow-up plan from recent conversations with owners and deadlines.',
          autoRun: true,
        },
        {
          id: 'connect-huddle',
          label: 'Start huddle',
          description: 'Open live calls',
          icon: 'video',
          kind: 'navigate',
          href: '/connect/calls',
        },
        {
          id: 'connect-summarize',
          label: 'Thread summary',
          description: 'Catch up in seconds',
          icon: 'sparkles',
          kind: 'instant',
          prompt: 'Summarize the latest chat activity into decisions, blockers, and open questions.',
          autoRun: true,
        },
      ];

    case 'projects':
      return [
        {
          id: 'project-status',
          label: 'Status snapshot',
          description: 'Where things stand',
          icon: 'bar-chart-3',
          kind: 'instant',
          prompt: resourceId
            ? `Summarize project ${resourceId}: progress, risks, blockers, and recommended next 3 actions.`
            : 'Summarize my active projects with progress, risks, and next actions.',
          autoRun: true,
        },
        {
          id: 'project-update',
          label: 'Draft update',
          description: 'Share with the team',
          icon: 'send',
          kind: 'instant',
          prompt: resourceId
            ? `Write a short project update for ${resourceId} suitable for collaborators.`
            : 'Write a short project update suitable for collaborators.',
          autoRun: true,
        },
        {
          id: 'project-link',
          label: 'Link objects',
          description: 'Notes, tasks, secrets',
          icon: 'link-2',
          kind: 'navigate',
          href: resourceId ? `/projects/${resourceId}` : '/projects',
        },
        {
          id: 'project-list',
          label: 'All projects',
          description: 'Browse portfolio',
          icon: 'folder-kanban',
          kind: 'navigate',
          href: '/projects',
        },
      ];

    case 'settings':
      return [
        {
          id: 'settings-telegram',
          label: 'Telegram alerts',
          description: 'Fine-tune notifications',
          icon: 'bell',
          kind: 'navigate',
          href: '/settings',
        },
        {
          id: 'settings-security',
          label: 'Security review',
          description: 'Passkeys and sudo',
          icon: 'shield',
          kind: 'instant',
          prompt: 'Give a short security checklist for my Kylrix account: passkeys, sudo mode, and alert settings.',
          autoRun: true,
        },
        {
          id: 'settings-agents',
          label: 'Manage agents',
          description: 'Automations hub',
          icon: 'bot',
          kind: 'navigate',
          href: '/settings/agents',
        },
      ];

    case 'agents':
      return [
        {
          id: 'agents-goal',
          label: 'Design agent goal',
          description: 'Clear mission statement',
          icon: 'compass',
          kind: 'prompt',
          prompt: 'Help me write a focused agent goal that automates:',
        },
        {
          id: 'agents-routine',
          label: 'Daily routine',
          description: 'Morning triage agent',
          icon: 'refresh-cw',
          kind: 'instant',
          prompt: 'Propose a daily triage agent routine for tasks, notes, and inbox follow-ups.',
          autoRun: true,
        },
        {
          id: 'agents-open',
          label: 'Agent settings',
          description: 'Full configuration',
          icon: 'settings',
          kind: 'navigate',
          href: '/settings/agents',
        },
      ];

    case 'accounts':
      return [
        {
          id: 'accounts-plan',
          label: 'Plan overview',
          description: 'What Pro unlocks',
          icon: 'credit-card',
          kind: 'instant',
          prompt: 'Explain what changes when I upgrade to Pro for smart system features.',
          autoRun: true,
        },
        {
          id: 'accounts-profile',
          label: 'Profile tips',
          description: 'Polish public identity',
          icon: 'user',
          kind: 'instant',
          prompt: 'Suggest improvements for my public profile and display name.',
          autoRun: true,
        },
      ];

    default:
      return [
        {
          id: 'ws-brief',
          label: 'Morning brief',
          description: 'Cross-app snapshot',
          icon: 'sunrise',
          kind: 'instant',
          prompt: 'Give a morning brief across notes, tasks, vault alerts, and projects.',
          autoRun: true,
        },
        {
          id: 'ws-notes',
          label: 'Go to Ideas',
          description: 'Notes workspace',
          icon: 'lightbulb',
          kind: 'navigate',
          href: '/app',
        },
        {
          id: 'ws-flow',
          label: 'Go to Flow',
          description: 'Tasks and goals',
          icon: 'workflow',
          kind: 'navigate',
          href: '/flow',
        },
        {
          id: 'ws-vault',
          label: 'Go to Vault',
          description: 'Secure storage',
          icon: 'lock',
          kind: 'navigate',
          href: '/vault',
        },
      ];
  }
}

export function buildInstantPrompt(userPrompt: string, context: AgenticPageContext): string {
  const lines = [
    `Page: ${context.title} (${context.zone})`,
    `Route: ${context.route}`,
    context.resourceId ? `Resource: ${context.resourceId}` : null,
    `Context: ${context.systemHint}`,
    '',
    `User request: ${userPrompt.trim()}`,
  ].filter(Boolean);

  return lines.join('\n');
}
