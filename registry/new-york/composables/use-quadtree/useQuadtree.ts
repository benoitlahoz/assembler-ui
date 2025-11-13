/**
 * Generic Quadtree composable for efficient spatial queries
 * Inspired by timohausmann/quadtree-js
 *
 * @type registry:hook
 * @category data
 *
 * @example
 * ```ts
 * const { tree, insert, retrieve, clear, size } = useQuadtree({
 *   bounds: { x: 0, y: 0, width: 800, height: 600 },
 *   maxObjects: 10,
 *   maxLevels: 4
 * });
 *
 * insert({ x: 100, y: 100, width: 50, height: 50, id: 1 });
 * const candidates = retrieve({ x: 90, y: 90, width: 20, height: 20 });
 * ```
 */

import { ref, readonly, type Ref } from 'vue';

/**
 * Rectangle interface - all objects in the quadtree must conform to this
 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any; // Allow additional properties
}

/**
 * Bounds of a quadtree node
 */
export interface QuadtreeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Configuration for quadtree creation
 */
export interface QuadtreeConfig {
  /** Bounds of the root quadtree node */
  bounds: QuadtreeBounds;
  /** Maximum objects a node can hold before splitting (default: 10) */
  maxObjects?: number;
  /** Maximum depth levels (default: 4) */
  maxLevels?: number;
}

/**
 * Quadtree node implementation
 */
class QuadtreeNode<T extends Rect = Rect> {
  private maxObjects: number;
  private maxLevels: number;
  private level: number;
  private bounds: QuadtreeBounds;
  private objects: T[] = [];
  private nodes: QuadtreeNode<T>[] = [];

  constructor(bounds: QuadtreeBounds, maxObjects = 10, maxLevels = 4, level = 0) {
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.bounds = bounds;
  }

  /**
   * Split the node into 4 subnodes
   */
  private split(): void {
    const nextLevel = this.level + 1;
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    // top right (northeast)
    this.nodes[0] = new QuadtreeNode<T>(
      { x: x + subWidth, y, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );

    // top left (northwest)
    this.nodes[1] = new QuadtreeNode<T>(
      { x, y, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );

    // bottom left (southwest)
    this.nodes[2] = new QuadtreeNode<T>(
      { x, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );

    // bottom right (southeast)
    this.nodes[3] = new QuadtreeNode<T>(
      { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );
  }

  /**
   * Determine which node indices the object belongs to
   * Returns array of indices (0-3) that the object intersects
   */
  private getIndex(rect: Rect): number[] {
    const indexes: number[] = [];
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const startIsNorth = rect.y < horizontalMidpoint;
    const startIsWest = rect.x < verticalMidpoint;
    const endIsEast = rect.x + rect.width > verticalMidpoint;
    const endIsSouth = rect.y + rect.height > horizontalMidpoint;

    // top-right quad (northeast)
    if (startIsNorth && endIsEast) {
      indexes.push(0);
    }

    // top-left quad (northwest)
    if (startIsWest && startIsNorth) {
      indexes.push(1);
    }

    // bottom-left quad (southwest)
    if (startIsWest && endIsSouth) {
      indexes.push(2);
    }

    // bottom-right quad (southeast)
    if (endIsEast && endIsSouth) {
      indexes.push(3);
    }

    return indexes;
  }

  /**
   * Insert object into the quadtree
   */
  insert(rect: T): void {
    // If we have subnodes, call insert on matching subnodes
    if (this.nodes.length) {
      const indexes = this.getIndex(rect);
      for (const index of indexes) {
        this.nodes[index]?.insert(rect);
      }
      return;
    }

    // Otherwise, store object here
    this.objects.push(rect);

    // Max objects reached and can still subdivide
    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      // Split if we don't already have subnodes
      if (!this.nodes.length) {
        this.split();
      }

      // Add all objects to their corresponding subnodes
      for (const obj of this.objects) {
        const indexes = this.getIndex(obj);
        for (const index of indexes) {
          this.nodes[index]?.insert(obj);
        }
      }

      // Clean up this node
      this.objects = [];
    }
  }

  /**
   * Return all objects that could collide with the given rect
   */
  retrieve(rect: Rect): T[] {
    const indexes = this.getIndex(rect);
    let returnObjects = [...this.objects];

    // If we have subnodes, retrieve their objects
    if (this.nodes.length) {
      for (const index of indexes) {
        const nodeResults = this.nodes[index]?.retrieve(rect);
        if (nodeResults) {
          returnObjects = returnObjects.concat(nodeResults);
        }
      }
    }

    // Remove duplicates at root level
    if (this.level === 0) {
      return Array.from(new Set(returnObjects));
    }

    return returnObjects;
  }

  /**
   * Clear the quadtree
   */
  clear(): void {
    this.objects = [];

    for (const node of this.nodes) {
      node?.clear();
    }

    this.nodes = [];
  }

  /**
   * Get total number of objects in tree
   */
  size(): number {
    let count = this.objects.length;

    if (this.nodes.length) {
      for (const node of this.nodes) {
        count += node.size();
      }
    }

    return count;
  }

  /**
   * Get bounds of this node
   */
  getBounds(): QuadtreeBounds {
    return { ...this.bounds };
  }
}

/**
 * Composable for creating and managing a quadtree
 */
export function useQuadtree<T extends Rect = Rect>(config: QuadtreeConfig) {
  const { bounds, maxObjects = 10, maxLevels = 4 } = config;

  // Create the quadtree root
  const tree = ref<QuadtreeNode<T>>(new QuadtreeNode<T>(bounds, maxObjects, maxLevels, 0)) as Ref<
    QuadtreeNode<T>
  >;

  /**
   * Insert an object into the quadtree
   */
  const insert = (rect: T): void => {
    tree.value.insert(rect);
  };

  /**
   * Retrieve all objects that could collide with the given rect
   */
  const retrieve = (rect: Rect): T[] => {
    return tree.value.retrieve(rect);
  };

  /**
   * Clear all objects from the quadtree
   */
  const clear = (): void => {
    tree.value.clear();
  };

  /**
   * Get total number of objects in the tree
   */
  const size = (): number => {
    return tree.value.size();
  };

  /**
   * Get bounds of the root node
   */
  const getBounds = (): QuadtreeBounds => {
    return tree.value.getBounds();
  };

  /**
   * Recreate the tree with new configuration
   */
  const recreate = (newConfig?: Partial<QuadtreeConfig>): void => {
    const cfg = { bounds, maxObjects, maxLevels, ...newConfig };
    tree.value = new QuadtreeNode<T>(cfg.bounds, cfg.maxObjects, cfg.maxLevels, 0);
  };

  return {
    tree: readonly(tree),
    insert,
    retrieve,
    clear,
    size,
    getBounds,
    recreate,
  };
}

/**
 * Type export for the return type of useQuadtree
 */
export type UseQuadtreeReturn<T extends Rect = Rect> = ReturnType<typeof useQuadtree<T>>;
