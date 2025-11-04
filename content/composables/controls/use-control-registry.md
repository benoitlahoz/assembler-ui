---
title: useControlRegistry
description: Control Registry Composable
---

  <p class="text-pretty mt-4"><br>Gère l'enregistrement et la récupération de composants de contrôle<br>pour être utilisés dans ControlsGrid. Fusionne les fonctionnalités<br>de useControlRegistry et useComponentPalette.</p>

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

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

:::code-tree{default-value="src/composables/use-control-registry/useControlRegistry.ts"}

```ts [src/composables/use-control-registry/useControlRegistry.ts]
import { ref, shallowRef, type Component } from "vue";
import type {
  GridItem,
  GridItemTemplate,
} from "../../components/controls-grid";

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

  label?: string;
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
const itemCounter = ref(0);

export function useControlRegistry() {
  const registerControl = (
    definition: ControlDefinition | Component,
    options?: Partial<Omit<ControlDefinition, "component">>,
  ) => {
    let controlDef: ControlDefinition;

    if (
      (typeof definition === "object" && "setup" in definition) ||
      "render" in definition
    ) {
      if (!options?.id) {
        console.error(
          "Un ID est requis lors de l'enregistrement d'un composant brut",
        );
        return;
      }

      controlDef = {
        id: options.id,
        name: options.name || options.id,
        description: options.description,
        component: definition as Component,
        defaultProps: options.defaultProps,
        defaultSize: options.defaultSize || { width: 1, height: 1 },
        category: options.category,
        icon: options.icon,
        color: options.color,
        label: options.label || options.name || options.id,
      };
    } else {
      controlDef = definition as ControlDefinition;
    }

    if (registeredControls.value.has(controlDef.id)) {
      console.warn(
        `Control with id "${controlDef.id}" is already registered. Overwriting.`,
      );
    }

    registeredControls.value.set(controlDef.id, {
      ...controlDef,
      component: shallowRef(controlDef.component),
      label: controlDef.label || controlDef.name,
    });
  };

  const registerControls = (definitions: (ControlDefinition | Component)[]) => {
    definitions.forEach((def) => {
      if ("id" in def) {
        registerControl(def);
      } else {
        console.warn(
          "Impossible d'enregistrer un composant brut sans options. Utilisez registerControl avec options.",
        );
      }
    });
  };

  const registerControlFromFile = async (
    filePath: string,
    options: Partial<Omit<ControlDefinition, "component">> & { id: string },
  ): Promise<boolean> => {
    try {
      const module = await import(filePath);
      const component = module.default || module;

      if (!component) {
        console.error(`Aucun composant trouvé dans ${filePath}`);
        return false;
      }

      registerControl(component, options);
      return true;
    } catch (error) {
      console.error(
        `Erreur lors du chargement du composant depuis ${filePath}:`,
        error,
      );
      return false;
    }
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

    itemCounter.value++;
    const instanceId = `${controlId}-${itemCounter.value}`;

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

  const createItemFromControl = (
    controlId: string,
  ): Omit<GridItem, "x" | "y"> | null => {
    const control = getControl(controlId);
    if (!control) {
      console.error(`Control with id "${controlId}" not found in registry`);
      return null;
    }

    itemCounter.value++;
    const instanceId = `${controlId}-${itemCounter.value}`;

    return {
      id: instanceId,
      width: control.defaultSize?.width ?? 1,
      height: control.defaultSize?.height ?? 1,
      component: control.component,
      color: control.color,
      ...control.defaultProps,
    };
  };

  const controlToTemplate = (controlId: string): GridItemTemplate | null => {
    const control = getControl(controlId);
    if (!control) {
      console.error(`Control with id "${controlId}" not found in registry`);
      return null;
    }

    return {
      id: control.id,
      width: control.defaultSize?.width ?? 1,
      height: control.defaultSize?.height ?? 1,
      component: control.component,
      color: control.color,
      label: control.label || control.name,
      icon: control.icon,
      ...control.defaultProps,
    };
  };

  const getAllTemplates = (): GridItemTemplate[] => {
    return getAllControls().map((control) => ({
      id: control.id,
      width: control.defaultSize?.width ?? 1,
      height: control.defaultSize?.height ?? 1,
      component: control.component,
      color: control.color,
      label: control.label || control.name,
      icon: control.icon,
      ...control.defaultProps,
    }));
  };

  const filterTemplatesBySize = (
    maxWidth: number,
    maxHeight: number,
  ): GridItemTemplate[] => {
    return getAllTemplates().filter(
      (template) => template.width <= maxWidth && template.height <= maxHeight,
    );
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
    registerControlFromFile,

    getControl,
    getAllControls,
    getControlsByCategory,
    hasControl,

    createControlInstance,
    createItemFromControl,

    controlToTemplate,
    getAllTemplates,
    filterTemplatesBySize,

    unregisterControl,
    clearRegistry,
  };
}
```
:::

## API
::hr-underline
::

  ### Returns

| Property | Type | Description |
|----------|------|-------------|
| `registerControl`{.primary .text-primary} | `any` | Enregistrement de contrôles |
| `registerControls`{.primary .text-primary} | `any` | — |
| `registerControlFromFile`{.primary .text-primary} | `any` | — |
| `getControl`{.primary .text-primary} | `any` | Récupération de contrôles |
| `getAllControls`{.primary .text-primary} | `any` | — |
| `getControlsByCategory`{.primary .text-primary} | `any` | — |
| `hasControl`{.primary .text-primary} | `any` | — |
| `createControlInstance`{.primary .text-primary} | `any` | Création d&#39;instances et items |
| `createItemFromControl`{.primary .text-primary} | `any` | — |
| `controlToTemplate`{.primary .text-primary} | `any` | Gestion de templates (palette) |
| `getAllTemplates`{.primary .text-primary} | `any` | — |
| `filterTemplatesBySize`{.primary .text-primary} | `any` | — |
| `unregisterControl`{.primary .text-primary} | `any` | Gestion du registre |
| `clearRegistry`{.primary .text-primary} | `any` | — |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `ControlDefinition`{.primary .text-primary} | `interface` | — |
| `ControlInstance`{.primary .text-primary} | `interface` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
