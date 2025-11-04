---
title: useControlRegistry
description: Control Registry Composable
---

  <p class="text-pretty mt-4"><br>Gère l'enregistrement et la récupération de composants de contrôle<br>pour être utilisés dans ControlsGrid</p>

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-control-registry.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-control-registry.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-control-registry.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-control-registry.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/use-control-registry/useControlRegistry.ts"}

```ts [src/components/ui/use-control-registry/useControlRegistry.ts]
import { ref, shallowRef, type Component } from "vue";

export interface ControlDefinition {
  id: string;
  name: string;
  description?: string;
  component: Component;
  defaultProps?: Record<string, any>;
  defaultSize?: {
    width: number;
    height: number;
  };
  category?: string;
  icon?: string;
  color?: string;
}

export interface ControlInstance {
  id: string;
  controlId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  component: Component;
  props?: Record<string, any>;
  color?: string;
}

const registeredControls = ref<Map<string, ControlDefinition>>(new Map());

export function useControlRegistry() {
  const registerControl = (definition: ControlDefinition) => {
    if (registeredControls.value.has(definition.id)) {
      console.warn(
        `Control with id "${definition.id}" is already registered. Overwriting.`,
      );
    }

    registeredControls.value.set(definition.id, {
      ...definition,
      component: shallowRef(definition.component),
    });
  };

  const registerControls = (definitions: ControlDefinition[]) => {
    definitions.forEach(registerControl);
  };

  const getControl = (id: string): ControlDefinition | undefined => {
    return registeredControls.value.get(id);
  };

  const getAllControls = (): ControlDefinition[] => {
    return Array.from(registeredControls.value.values());
  };

  const getControlsByCategory = (category: string): ControlDefinition[] => {
    return getAllControls().filter((control) => control.category === category);
  };

  const createControlInstance = (
    controlId: string,
    position?: { x: number; y: number },
    customProps?: Record<string, any>,
  ): Partial<ControlInstance> | null => {
    const control = getControl(controlId);
    if (!control) {
      console.error(`Control with id "${controlId}" not found in registry`);
      return null;
    }

    const instanceId = `${controlId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: instanceId,
      controlId: control.id,
      x: position?.x ?? 0,
      y: position?.y ?? 0,
      width: control.defaultSize?.width ?? 1,
      height: control.defaultSize?.height ?? 1,
      component: control.component,
      props: {
        ...control.defaultProps,
        ...customProps,
        id: instanceId,
      },
      color: customProps?.color ?? control.color,
    };
  };

  const unregisterControl = (id: string): boolean => {
    return registeredControls.value.delete(id);
  };

  const clearRegistry = () => {
    registeredControls.value.clear();
  };

  const hasControl = (id: string): boolean => {
    return registeredControls.value.has(id);
  };

  return {
    registerControl,
    registerControls,
    getControl,
    getAllControls,
    getControlsByCategory,
    createControlInstance,
    unregisterControl,
    clearRegistry,
    hasControl,
  };
}
```
:::

## useControlRegistry
::hr-underline
::

Control Registry Composable

Gère l&#39;enregistrement et la récupération de composants de contrôle
pour être utilisés dans ControlsGrid

---

::tip
You can copy and adapt this template for any component documentation.
::