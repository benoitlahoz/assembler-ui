/**
 * Composable pour gérer la configuration de la grille
 *
 * @type registry:composable
 * @category controls
 */

import { ref } from 'vue';
import type { GridConfig } from '../../components/controls-grid';

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
