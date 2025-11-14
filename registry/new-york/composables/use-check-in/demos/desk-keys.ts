/**
 * Shared check-in desk keys for demos
 */
import { useCheckIn } from '../useCheckIn';

const checkIn = useCheckIn();

// ==========================================
// Accordion Demo
// ==========================================
export interface AccordionItemData {
  title: string;
  open?: boolean;
}

export const AccordionDesk = checkIn.createDesk<AccordionItemData>('AccordionDemo');

// ==========================================
// Tabs Demo
// ==========================================
export interface TabItemData {
  label: string;
  disabled?: boolean;
  icon?: string;
}

export const TabsDesk = checkIn.createDesk<TabItemData>('TabsDemo');

// ==========================================
// Toolbar Demo
// ==========================================
export interface ToolItemData {
  label: string;
  icon?: string;
  type: 'button' | 'toggle' | 'separator';
  active?: boolean;
  disabled?: boolean;
}

export const ToolbarDesk = checkIn.createDesk<ToolItemData>('ToolbarDemo');
