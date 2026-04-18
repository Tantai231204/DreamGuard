// NOTE: Icon components are imported at usage sites (StepAudit, StepLogistics)
// to avoid importing JSX into a .ts file.
import type { TradeInAudit, CollectionType } from './types';
import type React from 'react';

export const STEPS = ['selection', 'audit', 'images', 'logistics', 'summary'] as const;

export const STEP_LABELS: Record<string, string> = {
  selection: 'Select Items',
  audit: 'Condition Check',
  images: 'Verification Photos',
  logistics: 'Collection',
  summary: 'Confirm',
};

export const STEP_TITLES: Record<string, string> = {
  selection: 'Step 1 of 5 — Select Items',
  audit: 'Step 2 of 5 — Condition Check',
  images: 'Step 3 of 5 — Verification Photos',
  logistics: 'Step 4 of 5 — Collection Method',
  summary: 'Step 5 of 5 — Confirm',
};

export interface AuditItemDef {
  key: keyof TradeInAudit;
  label: string;
  desc: string;
  Icon: React.ElementType;
}

export interface LogisticsOptionDef {
  type: CollectionType;
  title: string;
  desc: string;
  badge: string | null;
  Icon: React.ElementType;
}
