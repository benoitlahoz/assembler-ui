---
title: useQuadtree
description: Generic Quadtree composable for efficient spatial queries
---

  <p class="text-pretty mt-4">Inspired by timohausmann/quadtree-js</p>

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-quadtree.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-quadtree.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-quadtree.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-quadtree.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/use-quadtree/useQuadtree.ts"}

```ts [src/components/ui/use-quadtree/useQuadtree.ts]
import { ref, readonly, type Ref } from "vue";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any;
}

export interface QuadtreeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuadtreeConfig {
  bounds: QuadtreeBounds;

  maxObjects?: number;

  maxLevels?: number;
}

class QuadtreeNode<T extends Rect = Rect> {
  private maxObjects: number;
  private maxLevels: number;
  private level: number;
  private bounds: QuadtreeBounds;
  private objects: T[] = [];
  private nodes: QuadtreeNode<T>[] = [];

  constructor(
    bounds: QuadtreeBounds,
    maxObjects = 10,
    maxLevels = 4,
    level = 0,
  ) {
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.bounds = bounds;
  }

  private split(): void {
    const nextLevel = this.level + 1;
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nodes[0] = new QuadtreeNode<T>(
      { x: x + subWidth, y, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel,
    );

    this.nodes[1] = new QuadtreeNode<T>(
      { x, y, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel,
    );

    this.nodes[2] = new QuadtreeNode<T>(
      { x, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel,
    );

    this.nodes[3] = new QuadtreeNode<T>(
      { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel,
    );
  }

  private getIndex(rect: Rect): number[] {
    const indexes: number[] = [];
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const startIsNorth = rect.y < horizontalMidpoint;
    const startIsWest = rect.x < verticalMidpoint;
    const endIsEast = rect.x + rect.width > verticalMidpoint;
    const endIsSouth = rect.y + rect.height > horizontalMidpoint;

    if (startIsNorth && endIsEast) {
      indexes.push(0);
    }

    if (startIsWest && startIsNorth) {
      indexes.push(1);
    }

    if (startIsWest && endIsSouth) {
      indexes.push(2);
    }

    if (endIsEast && endIsSouth) {
      indexes.push(3);
    }

    return indexes;
  }

  insert(rect: T): void {
    if (this.nodes.length) {
      const indexes = this.getIndex(rect);
      for (const index of indexes) {
        this.nodes[index]?.insert(rect);
      }
      return;
    }

    this.objects.push(rect);

    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (!this.nodes.length) {
        this.split();
      }

      for (const obj of this.objects) {
        const indexes = this.getIndex(obj);
        for (const index of indexes) {
          this.nodes[index]?.insert(obj);
        }
      }

      this.objects = [];
    }
  }

  retrieve(rect: Rect): T[] {
    const indexes = this.getIndex(rect);
    let returnObjects = [...this.objects];

    if (this.nodes.length) {
      for (const index of indexes) {
        const nodeResults = this.nodes[index]?.retrieve(rect);
        if (nodeResults) {
          returnObjects = returnObjects.concat(nodeResults);
        }
      }
    }

    if (this.level === 0) {
      return Array.from(new Set(returnObjects));
    }

    return returnObjects;
  }

  clear(): void {
    this.objects = [];

    for (const node of this.nodes) {
      node?.clear();
    }

    this.nodes = [];
  }

  size(): number {
    let count = this.objects.length;

    if (this.nodes.length) {
      for (const node of this.nodes) {
        count += node.size();
      }
    }

    return count;
  }

  getBounds(): QuadtreeBounds {
    return { ...this.bounds };
  }
}

export function useQuadtree<T extends Rect = Rect>(config: QuadtreeConfig) {
  const { bounds, maxObjects = 10, maxLevels = 4 } = config;

  const tree = ref<QuadtreeNode<T>>(
    new QuadtreeNode<T>(bounds, maxObjects, maxLevels, 0),
  ) as Ref<QuadtreeNode<T>>;

  const insert = (rect: T): void => {
    tree.value.insert(rect);
  };

  const retrieve = (rect: Rect): T[] => {
    return tree.value.retrieve(rect);
  };

  const clear = (): void => {
    tree.value.clear();
  };

  const size = (): number => {
    return tree.value.size();
  };

  const getBounds = (): QuadtreeBounds => {
    return tree.value.getBounds();
  };

  const recreate = (newConfig?: Partial<QuadtreeConfig>): void => {
    const cfg = { bounds, maxObjects, maxLevels, ...newConfig };
    tree.value = new QuadtreeNode<T>(
      cfg.bounds,
      cfg.maxObjects,
      cfg.maxLevels,
      0,
    );
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

export type UseQuadtreeReturn<T extends Rect = Rect> = ReturnType<
  typeof useQuadtree<T>
>;
```
:::

::tip
You can copy and adapt this template for any component documentation.
::