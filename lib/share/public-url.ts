import { PublicResourceType, PublicUrlOptions } from './resource-types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.kylrix.space';

/**
 * Ruthless Sharing: Canonical URL Builder
 * 
 * Follows the "Public URL Law":
 * {appPrefix}/{singularNoun}/{id}
 */
export function buildPublicResourceUrl(
  type: PublicResourceType,
  id: string,
  options: PublicUrlOptions = {}
): string {
  const { projectId } = options;

  // 1. Project-scoped hierarchy
  if (projectId) {
    const kind = getProjectKind(type);
    return `${BASE_URL}/projects/${projectId}/${kind}/${id}`;
  }

  // 2. Standalone public guest URLs
  switch (type) {
    case 'note': 
      return `${BASE_URL}/note/${id}`;
    
    case 'credential': 
      return `${BASE_URL}/vault/${id}`;
    
    case 'totp': 
      return `${BASE_URL}/vault/totp/${id}`;
    
    case 'goal':
    case 'task': 
      return `${BASE_URL}/flow/goal/${id}`;
    
    case 'form': 
      return `${BASE_URL}/flow/form/${id}`;
    
    case 'event': 
      return `${BASE_URL}/flow/event/${id}`;
    
    case 'project': 
      return `${BASE_URL}/project/${id}`;
    
    case 'huddle':
    case 'call': 
      return `${BASE_URL}/connect/call/${id}`;
    
    case 'moment': 
      return `${BASE_URL}/connect/post/${id}`;
    
    default: 
      return `${BASE_URL}/${type}/${id}`;
  }
}

/**
 * Flagship collapses: /note/notes -> /note, etc.
 */
export function buildInternalFlagshipUrl(app: 'note' | 'vault' | 'flow'): string {
  return `/${app}`;
}

/**
 * Maps resource types to singular kinds used in project hierarchy routes.
 * /projects/[pid]/[kind]/[id]
 */
function getProjectKind(type: PublicResourceType): string {
  switch (type) {
    case 'note': return 'note';
    case 'credential': return 'secret';
    case 'totp': return 'totp';
    case 'goal':
    case 'task': return 'goal';
    case 'form': return 'form';
    case 'event': return 'event';
    case 'project': return 'project';
    default: return type;
  }
}
