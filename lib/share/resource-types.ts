export type PublicResourceType = 
  | 'note' 
  | 'credential' 
  | 'totp' 
  | 'task' 
  | 'goal' 
  | 'form' 
  | 'event' 
  | 'project' 
  | 'huddle' 
  | 'call' 
  | 'moment';

export interface PublicUrlOptions {
  projectId?: string;
  isGuest?: boolean;
}
