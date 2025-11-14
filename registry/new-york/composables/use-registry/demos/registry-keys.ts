/**
 * Shared registry keys for demos
 */
import { useRegistry, type InjectionKey, type RegistryContext } from '../useRegistry';

const registry = useRegistry();

// ==========================================
// Accordion Demo
// ==========================================
export interface AccordionItemData {
  title: string;
  open?: boolean;
}

export const AccordionRegistryKey = registry.createKey<AccordionItemData>('AccordionDemo');

// ==========================================
// Tabs Demo
// ==========================================
export interface TabItemData {
  label: string;
  disabled?: boolean;
  icon?: string;
}

export const TabsRegistryKey = registry.createKey<TabItemData>('TabsDemo');

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

export const ToolbarRegistryKey = registry.createKey<ToolItemData>('ToolbarDemo');
