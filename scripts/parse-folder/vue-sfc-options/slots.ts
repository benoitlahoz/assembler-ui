import { extractSlotsFromTemplate } from '../common/extract-slots-from-template';

export interface SlotInfo {
  name: string;
  description: string;
  params?: string;
}

/**
 * Extrait les slots d'un composant Vue classique (Options API) à partir du template.
 * @param templateContent code source du template (string)
 * @returns tableau d'objets SlotInfo
 */
export const extractSlots = (templateContent?: string): SlotInfo[] => {
  const slotsMap: Record<string, SlotInfo> = {};
  if (templateContent) {
    const templateSlots = extractSlotsFromTemplate(templateContent);
    for (const slot of templateSlots) {
      slotsMap[slot.name] = {
        name: slot.name,
        description: slot.description || '',
        params: slot.params || '-',
      };
    }
  }
  return Object.values(slotsMap);
};
