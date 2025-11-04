import { ref, computed, type Ref } from 'vue';
import type { GridItem, GridItemTemplate, GridConfig } from './types';
import { GridUtils } from './types';

/**
 * Composable pour gérer l'état et les opérations d'une grille de contrôles
 */
export function useControlsGrid(initialItems: GridItem[] = []) {
  // État
  const items = ref<GridItem[]>([...initialItems]);
  const selectedItemId = ref<string | null>(null);
  const history = ref<GridItem[][]>([]);
  const historyIndex = ref(-1);
  const maxHistorySize = 50;

  // Computed
  const selectedItem = computed(() => {
    if (!selectedItemId.value) return null;
    return items.value.find((item) => item.id === selectedItemId.value) || null;
  });

  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  const totalArea = computed(() => {
    return items.value.reduce((sum, item) => sum + GridUtils.calculateArea(item), 0);
  });

  // Méthodes
  const addToHistory = () => {
    // Supprime l'historique après l'index actuel
    history.value = history.value.slice(0, historyIndex.value + 1);

    // Ajoute l'état actuel
    history.value.push(JSON.parse(JSON.stringify(items.value)));

    // Limite la taille de l'historique
    if (history.value.length > maxHistorySize) {
      history.value.shift();
    } else {
      historyIndex.value++;
    }
  };

  const undo = () => {
    if (!canUndo.value) return;

    historyIndex.value--;
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
  };

  const redo = () => {
    if (!canRedo.value) return;

    historyIndex.value++;
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
  };

  const addItem = (item: GridItem) => {
    items.value.push(item);
    addToHistory();
  };

  const removeItem = (id: string) => {
    const index = items.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      items.value.splice(index, 1);
      if (selectedItemId.value === id) {
        selectedItemId.value = null;
      }
      addToHistory();
    }
  };

  const updateItem = (id: string, updates: Partial<GridItem>) => {
    const index = items.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates } as GridItem;
      addToHistory();
    }
  };

  const clearItems = () => {
    items.value = [];
    selectedItemId.value = null;
    addToHistory();
  };

  const selectItem = (id: string | null) => {
    selectedItemId.value = id;
  };

  const duplicateItem = (id: string, offsetX = 1, offsetY = 0) => {
    const item = items.value.find((item) => item.id === id);
    if (!item) return null;

    const newItem = GridUtils.cloneItemAtPosition(item, item.x + offsetX, item.y + offsetY);

    items.value.push(newItem);
    addToHistory();

    return newItem;
  };

  const exportConfig = () => {
    return {
      items: items.value,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  };

  const importConfig = (config: { items: GridItem[] }) => {
    items.value = config.items;
    selectedItemId.value = null;
    addToHistory();
  };

  const saveToLocalStorage = (key = 'controls-grid-config') => {
    try {
      localStorage.setItem(key, JSON.stringify(exportConfig()));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  };

  const loadFromLocalStorage = (key = 'controls-grid-config') => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const config = JSON.parse(data);
        importConfig(config);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return false;
    }
  };

  const sortItems = () => {
    items.value = GridUtils.sortItems(items.value);
  };

  const getItemById = (id: string) => {
    return items.value.find((item) => item.id === id);
  };

  const getItemsAtPosition = (x: number, y: number) => {
    return items.value.filter(
      (item) => x >= item.x && x < item.x + item.width && y >= item.y && y < item.y + item.height
    );
  };

  // Initialiser l'historique
  if (items.value.length > 0) {
    addToHistory();
  }

  return {
    // État
    items,
    selectedItemId,
    selectedItem,
    canUndo,
    canRedo,
    totalArea,

    // Méthodes
    addItem,
    removeItem,
    updateItem,
    clearItems,
    selectItem,
    duplicateItem,
    undo,
    redo,
    exportConfig,
    importConfig,
    saveToLocalStorage,
    loadFromLocalStorage,
    sortItems,
    getItemById,
    getItemsAtPosition,
  };
}

/**
 * Composable pour gérer une palette de templates de composants
 */
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

/**
 * Composable pour gérer la configuration de la grille
 */
export function useGridConfig(initialConfig: Partial<GridConfig> = {}) {
  const config = ref<GridConfig>({
    cellSize: initialConfig.cellSize || 80,
    gap: initialConfig.gap || 8,
    columns: initialConfig.columns || 6,
    rows: initialConfig.rows || 6,
    width: initialConfig.width || 0,
    height: initialConfig.height || 0,
  });

  const updateConfig = (updates: Partial<GridConfig>) => {
    config.value = { ...config.value, ...updates };
  };

  const resetConfig = () => {
    config.value = {
      cellSize: 80,
      gap: 8,
      columns: 6,
      rows: 6,
      width: 0,
      height: 0,
    };
  };

  const calculateGridSize = (containerWidth: number, containerHeight: number) => {
    const columns = Math.floor(containerWidth / (config.value.cellSize + config.value.gap));
    const rows = Math.floor(containerHeight / (config.value.cellSize + config.value.gap));

    updateConfig({
      columns,
      rows,
      width: containerWidth,
      height: containerHeight,
    });
  };

  return {
    config,
    updateConfig,
    resetConfig,
    calculateGridSize,
  };
}
