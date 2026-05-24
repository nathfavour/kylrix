import { TelemetryNiche } from './context-engine';

export interface WorkflowStep {
  actionId: string; // e.g. "workspace.note.editor.click.save_btn"
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface WorkflowChain {
  id: string;
  name: string;
  description: string;
  niche: TelemetryNiche;
  steps: WorkflowStep[];
  createdAt: string;
}

/**
 * Creates an unambiguous hierarchical action ID following our niche terminology.
 * Formats parameters strictly to: niche.app.context.action.element
 * 
 * Example: makeActionId('workspace', 'note', 'editor', 'click', 'save_button')
 * Returns: "workspace.note.editor.click.save_button"
 */
export function makeActionId(
  niche: TelemetryNiche,
  app: string,
  context: string,
  action: string,
  element: string
): string {
  const clean = (str: string) => String(str || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return `${clean(niche)}.${clean(app)}.${clean(context)}.${clean(action)}.${clean(element)}`;
}

/**
 * Validates whether an action ID matches our hierarchical pattern
 */
export function isValidActionId(actionId: string): boolean {
  if (!actionId) return false;
  const parts = actionId.split('.');
  return parts.length === 5 && parts.every(part => part.length > 0);
}
