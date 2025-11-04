/**
 * useDragDrop - Composable pour gérer le drag and drop avec intersection précise
 *
 * @category interactions
 * @type registry:hook
 *
 * @demo FileListDemo
 * @demo TimelineDemo
 * @demo KanbanDemo
 * @demo PaletteCanvasDemo
 * @demo FreeLayoutDemo
 * @demo AdaptiveModeDemo
 */

import { ref, computed, type Ref } from 'vue';
import { useElementBounding } from '@vueuse/core';

export interface DragDropItem<T = any> {
  /** Identifiant unique de l'item */
  id: string;
  /** Largeur de l'item (en unités, ex: cellules de grille) */
  width: number;
  /** Hauteur de l'item (en unités, ex: cellules de grille) */
  height: number;
  /** Données additionnelles */
  data?: T;
}

export interface DragDropPosition {
  /** Position X (ex: colonne) */
  x: number;
  /** Position Y (ex: ligne) */
  y: number;
}

export interface DragDropBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface DragDropState<T = any> {
  /** Item actuellement en cours de drag */
  item: DragDropItem<T> | null;
  /** Indique si l'item vient du conteneur ou de l'extérieur */
  fromContainer: boolean;
  /** Position de survol actuelle */
  hoverPosition: DragDropPosition | null;
  /** Indicateur si le placement est valide */
  isValid: boolean;
  /** En cours de drag */
  isDragging: boolean;
}

export interface UseDragDropOptions {
  /**
   * Taille de l'unité de base (ex: taille d'une cellule en pixels).
   * Si non fourni, utilise les dimensions de l'item draggé (mode adaptatif)
   */
  unitSize?: number;
  /** Espacement entre les unités (en pixels) */
  gap?: number;
  /** Fonction de validation de placement */
  validatePlacement?: (
    x: number,
    y: number,
    width: number,
    height: number,
    excludeId?: string
  ) => boolean;
}

export interface UseDragDropReturn<T = any> {
  /** État du drag */
  dragState: Ref<DragDropState<T>>;
  /** Offset du clic initial */
  dragOffset: Ref<{ x: number; y: number } | null>;
  /** Démarre le drag */
  startDrag: (event: DragEvent, item: DragDropItem<T>, fromContainer?: boolean) => void;
  /** Gère le survol */
  handleDragOver: (
    event: DragEvent,
    containerBounds: DragDropBounds,
    getPosition: (bounds: DragDropBounds) => DragDropPosition | null
  ) => DragDropPosition | null;
  /** Termine le drag */
  endDrag: () => void;
  /** Calcule le rectangle virtuel de l'item en cours de drag */
  getVirtualBounds: (clientX: number, clientY: number) => DragDropBounds | null;
  /** Récupère les données de l'item depuis le dataTransfer */
  getItemFromDataTransfer: (dataTransfer: DataTransfer | null) => DragDropItem<T> | null;
}

/**
 * Composable pour gérer le drag and drop avec intersection précise
 */
export function useDragDrop<T = any>(options: UseDragDropOptions): UseDragDropReturn<T> {
  const { unitSize, gap = 0, validatePlacement } = options;

  // État du drag
  const dragState = ref<DragDropState<T>>({
    item: null,
    fromContainer: false,
    hoverPosition: null,
    isValid: false,
    isDragging: false,
  }) as Ref<DragDropState<T>>;

  // Offset du clic initial pour un drag précis
  const dragOffset = ref<{ x: number; y: number } | null>(null);

  /**
   * Démarre le drag d'un item
   */
  const startDrag = (event: DragEvent, item: DragDropItem<T>, fromContainer = false) => {
    dragState.value.item = { ...item };
    dragState.value.fromContainer = fromContainer;
    dragState.value.isDragging = true;

    // Calculer l'offset du clic par rapport au coin supérieur gauche de l'élément
    if (event.target instanceof HTMLElement) {
      const targetRect = event.target.getBoundingClientRect();

      // Position du clic relative à l'élément
      const offsetX = event.clientX - targetRect.left;
      const offsetY = event.clientY - targetRect.top;

      dragOffset.value = { x: offsetX, y: offsetY };
    }

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify(item));
    }
  };

  /**
   * Calcule le rectangle virtuel de l'item en cours de drag
   */
  const getVirtualBounds = (clientX: number, clientY: number): DragDropBounds | null => {
    if (!dragState.value.item) return null;

    // Mode adaptatif : si unitSize n'est pas fourni, utilise les dimensions de l'item
    // Mode grille : si unitSize est fourni, calcule en fonction des unités
    const itemWidth =
      unitSize !== undefined
        ? dragState.value.item.width * (unitSize + gap) - gap
        : dragState.value.item.width; // Utilise width directement comme pixels
    const itemHeight =
      unitSize !== undefined
        ? dragState.value.item.height * (unitSize + gap) - gap
        : dragState.value.item.height; // Utilise height directement comme pixels

    // Utiliser l'offset du clic ou centrer par défaut
    const offsetX = dragOffset.value?.x ?? itemWidth / 2;
    const offsetY = dragOffset.value?.y ?? itemHeight / 2;

    return {
      left: clientX - offsetX,
      top: clientY - offsetY,
      right: clientX - offsetX + itemWidth,
      bottom: clientY - offsetY + itemHeight,
      width: itemWidth,
      height: itemHeight,
    };
  };

  /**
   * Récupère l'item depuis le dataTransfer
   */
  const getItemFromDataTransfer = (dataTransfer: DataTransfer | null): DragDropItem<T> | null => {
    if (!dataTransfer) return null;

    try {
      const data = dataTransfer.getData('application/json');
      if (data) {
        return JSON.parse(data) as DragDropItem<T>;
      }
    } catch (e) {
      console.error('Erreur lors du parsing des données de drag:', e);
    }

    return null;
  };

  /**
   * Gère le survol pendant le drag
   */
  const handleDragOver = (
    event: DragEvent,
    containerBounds: DragDropBounds,
    getPosition: (bounds: DragDropBounds) => DragDropPosition | null
  ): DragDropPosition | null => {
    event.preventDefault();

    if (!dragState.value.item) {
      // Si pas d'item, essayer de le récupérer depuis dataTransfer
      const item = getItemFromDataTransfer(event.dataTransfer);
      if (item) {
        dragState.value.item = item;
      }
    }

    if (event.dataTransfer) {
      const effect = event.dataTransfer.effectAllowed;
      if (effect === 'copy' || effect === 'copyMove') {
        event.dataTransfer.dropEffect = 'copy';
      } else {
        event.dataTransfer.dropEffect = 'move';
      }
    }

    // Calculer le rectangle virtuel
    const virtualBounds = getVirtualBounds(event.clientX, event.clientY);
    if (!virtualBounds) return null;

    // Calculer la position basée sur l'intersection
    const pos = getPosition(virtualBounds);
    if (!pos) return null;

    // Valider le placement si une fonction de validation est fournie
    if (validatePlacement && dragState.value.item) {
      const excludeId = dragState.value.fromContainer ? dragState.value.item.id : undefined;
      const isValid = validatePlacement(
        pos.x,
        pos.y,
        dragState.value.item.width,
        dragState.value.item.height,
        excludeId
      );

      dragState.value.hoverPosition = pos;
      dragState.value.isValid = isValid;

      if (!isValid && event.dataTransfer) {
        event.dataTransfer.dropEffect = 'none';
      }
    } else {
      dragState.value.hoverPosition = pos;
      dragState.value.isValid = true;
    }

    return pos;
  };

  /**
   * Termine le drag
   */
  const endDrag = () => {
    dragState.value.item = null;
    dragState.value.fromContainer = false;
    dragState.value.hoverPosition = null;
    dragState.value.isValid = false;
    dragState.value.isDragging = false;
    dragOffset.value = null;
  };

  return {
    dragState,
    dragOffset,
    startDrag,
    handleDragOver,
    endDrag,
    getVirtualBounds,
    getItemFromDataTransfer,
  };
}

/**
 * Utilitaires pour le calcul d'intersection
 */
export class DragDropUtils {
  /**
   * Calcule la cellule avec la plus grande surface d'intersection
   */
  static getPositionByIntersection(
    elementBounds: DragDropBounds,
    containerBounds: DragDropBounds,
    unitSize: number,
    gap: number,
    columns: number,
    rows: number
  ): DragDropPosition | null {
    let maxIntersectionArea = 0;
    let bestPosition = { x: 0, y: 0 };

    // Parcourir toutes les cellules potentiellement intersectées
    const startX = Math.max(
      0,
      Math.floor((elementBounds.left - containerBounds.left - gap) / (unitSize + gap))
    );
    const endX = Math.min(
      columns - 1,
      Math.ceil((elementBounds.right - containerBounds.left - gap) / (unitSize + gap))
    );
    const startY = Math.max(
      0,
      Math.floor((elementBounds.top - containerBounds.top - gap) / (unitSize + gap))
    );
    const endY = Math.min(
      rows - 1,
      Math.ceil((elementBounds.bottom - containerBounds.top - gap) / (unitSize + gap))
    );

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        // Calculer les coordonnées de la cellule
        const cellLeft = containerBounds.left + gap + x * (unitSize + gap);
        const cellTop = containerBounds.top + gap + y * (unitSize + gap);
        const cellRight = cellLeft + unitSize;
        const cellBottom = cellTop + unitSize;

        // Calculer l'intersection
        const intersectionLeft = Math.max(elementBounds.left, cellLeft);
        const intersectionTop = Math.max(elementBounds.top, cellTop);
        const intersectionRight = Math.min(elementBounds.right, cellRight);
        const intersectionBottom = Math.min(elementBounds.bottom, cellBottom);

        // Aire d'intersection
        const intersectionWidth = Math.max(0, intersectionRight - intersectionLeft);
        const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);
        const intersectionArea = intersectionWidth * intersectionHeight;

        if (intersectionArea > maxIntersectionArea) {
          maxIntersectionArea = intersectionArea;
          bestPosition = { x, y };
        }
      }
    }

    // Retourner la meilleure position uniquement si une intersection significative existe
    return maxIntersectionArea > 0 ? bestPosition : null;
  }

  /**
   * Convertit une position en pixels en position de grille
   */
  static pixelToGrid(
    pixelX: number,
    pixelY: number,
    unitSize: number,
    gap: number
  ): DragDropPosition {
    const x = Math.floor(pixelX / (unitSize + gap));
    const y = Math.floor(pixelY / (unitSize + gap));
    return { x, y };
  }

  /**
   * Convertit une position de grille en position en pixels
   */
  static gridToPixel(
    gridX: number,
    gridY: number,
    unitSize: number,
    gap: number
  ): { x: number; y: number } {
    const x = gridX * (unitSize + gap);
    const y = gridY * (unitSize + gap);
    return { x, y };
  }
}
