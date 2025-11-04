/**
 * Composable pour gérer une palette de templates de composants
 *
 * @type registry:composable
 * @category controls
 */

import { ref } from 'vue';
import type { GridItem, GridItemTemplate } from '../../components/controls-grid';

export function useComponentPalette(templates: GridItemTemplate[] = []) {
  const availableTemplates = ref<GridItemTemplate[]>([...templates]);
  const itemCounter = ref(0);

  const createItemFromTemplate = (template: GridItemTemplate): Omit<GridItem, 'x' | 'y'> => {
    itemCounter.value++;
    const { label, color, icon, ...rest } = template;

    return {
      ...rest,
      id: `${template.id}-${itemCounter.value}`,
    };
  };

  const addTemplate = (template: GridItemTemplate) => {
    availableTemplates.value.push(template);
  };

  const removeTemplate = (id: string) => {
    const index = availableTemplates.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      availableTemplates.value.splice(index, 1);
    }
  };

  const getTemplateById = (id: string) => {
    return availableTemplates.value.find((t) => t.id === id);
  };

  const filterTemplatesBySize = (maxWidth: number, maxHeight: number) => {
    return availableTemplates.value.filter((t) => t.width <= maxWidth && t.height <= maxHeight);
  };

  return {
    availableTemplates,
    createItemFromTemplate,
    addTemplate,
    removeTemplate,
    getTemplateById,
    filterTemplatesBySize,
  };
}
