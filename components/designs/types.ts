'use client';

import type React from 'react';

export type DesignExportFormat = 'png' | 'svg';

export interface DesignFlyerProps {
  className?: string;
}

export interface DesignFlyerDefinition {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  component: React.ForwardRefExoticComponent<DesignFlyerProps & React.RefAttributes<HTMLDivElement>>;
  preview: React.ComponentType;
}
