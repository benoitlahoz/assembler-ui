/**
 * ControlsGrid - Composant de grille drag-and-drop
 *
 * @type registry:ui
 * @category controls
 *
 * @demo SimpleExample
 * @demo AdvancedExample
 * @demo ControlRegistryDemo
 * @demo ComponentRegistration
 */

import type { Component } from 'vue';

export { default as ControlsGrid } from './ControlsGrid.vue';
export { default as ControlsToolbar } from './ControlsToolbar.vue';

// ============================================================================
// Types
// ============================================================================

/**
 * Composant à enregistrer dans la grille
 */
export interface ComponentToRegister {
  /** Nom unique du composant */
  name: string;
  /** Le composant Vue à enregistrer */
  component: Component;
}

/**
 * Interface représentant un item dans la grille
 */
export interface GridItem {
  /** Identifiant unique de l'item */
  id: string;
  /** Position X dans la grille (0-based, en nombre de cellules) */
  x: number;
  /** Position Y dans la grille (0-based, en nombre de cellules) */
  y: number;
  /** Largeur en nombre de cellules */
  width: number;
  /** Hauteur en nombre de cellules */
  height: number;
  /** Composant Vue optionnel à rendre */
  component?: any;
  /** Couleur de fond du contrôleur */
  color?: string;
  /** Propriétés additionnelles personnalisées */
  [key: string]: any;
}

/**
 * Position dans la grille
 */
export interface GridPosition {
  /** Colonne (0-based) */
  x: number;
  /** Ligne (0-based) */
  y: number;
}

/**
 * Dimensions dans la grille
 */
export interface GridDimensions {
  /** Largeur en cellules */
  width: number;
  /** Hauteur en cellules */
  height: number;
}

/**
 * Configuration de la grille
 */
export interface GridConfig {
  /** Taille de base d'une cellule en pixels */
  cellSize: number;
  /** Espacement entre les cellules en pixels */
  gap: number;
  /** Nombre de colonnes calculé */
  columns: number;
  /** Nombre de lignes calculé */
  rows: number;
  /** Largeur totale de la grille en pixels */
  width: number;
  /** Hauteur totale de la grille en pixels */
  height: number;
}

/**
 * Template pour créer de nouveaux items
 */
export interface GridItemTemplate extends Omit<GridItem, 'x' | 'y'> {
  /** Label affiché dans la palette */
  label?: string;
  /** Couleur de fond du template */
  color?: string;
  /** Icône optionnelle */
  icon?: string;
}

/**
 * Événements émis par la grille
 */
export interface GridEvents {
  /** Émis quand la liste des items est modifiée */
  'update:items': (items: GridItem[]) => void;
  /** Émis quand un nouvel item est placé */
  'item-placed': (item: GridItem) => void;
  /** Émis quand un item est déplacé */
  'item-moved': (item: GridItem) => void;
  /** Émis quand un item est supprimé */
  'item-removed': (id: string) => void;
  /** Émis quand la configuration de la grille change */
  'config-changed': (config: GridConfig) => void;
}

/**
 * Méthodes exposées par le composant
 */
export interface GridMethods {
  /** Ajoute un item à la première position disponible */
  addItem: (item: Omit<GridItem, 'x' | 'y'>) => GridItem | null;
  /** Ajoute un item en utilisant un composant enregistré */
  addItemByComponent: (
    componentName: string,
    width?: number,
    height?: number,
    additionalProps?: Record<string, any>
  ) => GridItem | null;
  /** Supprime un item par son ID */
  removeItem: (id: string) => void;
  /** Vide complètement la grille */
  clearGrid: () => void;
  /** Récupère un composant enregistré par son nom */
  getComponent: (name: string) => Component | undefined;
  /** Récupère la liste des noms de tous les composants enregistrés */
  getRegisteredComponents: () => string[];
  /** Vérifie si une position est occupée */
  isCellOccupied?: (x: number, y: number, excludeId?: string) => boolean;
  /** Vérifie si un placement est valide */
  isValidPlacement?: (
    x: number,
    y: number,
    width: number,
    height: number,
    excludeId?: string
  ) => boolean;
  /** Trouve la première position disponible */
  findAvailablePosition?: (width: number, height: number) => GridPosition | null;
}

/**
 * Props du composant ControlsGrid
 */
export interface GridProps {
  /** Taille de base d'une cellule en pixels */
  cellSize?: number;
  /** Espacement entre les cellules en pixels */
  gap?: number;
  /** Nombre minimum de colonnes */
  minColumns?: number;
  /** Items actuellement placés dans la grille */
  items?: GridItem[];
  /** Afficher la grille en pointillés */
  showGrid?: boolean;
  /** Activer le snap automatique à la grille */
  snapToGrid?: boolean;
  /** Composants à enregistrer dans la grille */
  components?: ComponentToRegister[];
}

/**
 * État du drag en cours
 */
export interface DragState {
  /** Item en cours de drag */
  item: GridItem | null;
  /** Indique si l'item vient de la grille ou de l'extérieur */
  fromGrid: boolean;
  /** Position de survol actuelle */
  hoverPosition: GridPosition | null;
  /** Indicateur si le placement est valide */
  isValid: boolean;
}

// ============================================================================
// Utilitaires
// ============================================================================

/**
 * Utilitaires pour la grille
 */
export class GridUtils {
  /**
   * Convertit une position en pixels en position de grille
   */
  static pixelToGrid(pixelX: number, pixelY: number, cellSize: number, gap: number): GridPosition {
    const x = Math.floor(pixelX / (cellSize + gap));
    const y = Math.floor(pixelY / (cellSize + gap));
    return { x, y };
  }

  /**
   * Convertit une position de grille en position en pixels
   */
  static gridToPixel(
    gridX: number,
    gridY: number,
    cellSize: number,
    gap: number
  ): { x: number; y: number } {
    const x = gridX * (cellSize + gap);
    const y = gridY * (cellSize + gap);
    return { x, y };
  }

  /**
   * Vérifie si deux items se chevauchent
   */
  static doItemsOverlap(item1: GridItem, item2: GridItem): boolean {
    return !(
      item1.x + item1.width <= item2.x ||
      item2.x + item2.width <= item1.x ||
      item1.y + item1.height <= item2.y ||
      item2.y + item2.height <= item1.y
    );
  }

  /**
   * Calcule l'aire occupée par un item
   */
  static calculateArea(item: GridItem): number {
    return item.width * item.height;
  }

  /**
   * Génère un ID unique pour un item
   */
  static generateId(prefix = 'item'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clone un item avec de nouvelles coordonnées
   */
  static cloneItemAtPosition(item: GridItem, x: number, y: number): GridItem {
    return {
      ...item,
      id: this.generateId(item.id.split('-')[0]),
      x,
      y,
    };
  }

  /**
   * Valide qu'un item a des dimensions valides
   */
  static isValidItem(item: Partial<GridItem>): boolean {
    return (
      typeof item.id === 'string' &&
      typeof item.width === 'number' &&
      typeof item.height === 'number' &&
      item.width > 0 &&
      item.height > 0
    );
  }

  /**
   * Trie les items par position (de gauche à droite, de haut en bas)
   */
  static sortItems(items: GridItem[]): GridItem[] {
    return [...items].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
  }

  /**
   * Trouve tous les items qui se chevauchent avec une position donnée
   */
  static findOverlappingItems(
    items: GridItem[],
    x: number,
    y: number,
    width: number,
    height: number,
    excludeId?: string
  ): GridItem[] {
    const testItem: GridItem = {
      id: 'test',
      x,
      y,
      width,
      height,
    };

    return items.filter((item) => {
      if (excludeId && item.id === excludeId) return false;
      return this.doItemsOverlap(item, testItem);
    });
  }
}
