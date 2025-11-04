/**
 * Control Registry Composable
 *
 * Gère l'enregistrement et la récupération de composants de contrôle
 * pour être utilisés dans ControlsGrid
 *
 * @category composables
 */

import { ref, shallowRef, type Component } from 'vue';

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
  /**
   * Enregistre un nouveau contrôle dans le registre
   */
  const registerControl = (definition: ControlDefinition) => {
    if (registeredControls.value.has(definition.id)) {
      console.warn(`Control with id "${definition.id}" is already registered. Overwriting.`);
    }

    registeredControls.value.set(definition.id, {
      ...definition,
      component: shallowRef(definition.component),
    });
  };

  /**
   * Enregistre plusieurs contrôles à la fois
   */
  const registerControls = (definitions: ControlDefinition[]) => {
    definitions.forEach(registerControl);
  };

  /**
   * Récupère un contrôle par son ID
   */
  const getControl = (id: string): ControlDefinition | undefined => {
    return registeredControls.value.get(id);
  };

  /**
   * Récupère tous les contrôles enregistrés
   */
  const getAllControls = (): ControlDefinition[] => {
    return Array.from(registeredControls.value.values());
  };

  /**
   * Récupère les contrôles par catégorie
   */
  const getControlsByCategory = (category: string): ControlDefinition[] => {
    return getAllControls().filter((control) => control.category === category);
  };

  /**
   * Crée une instance d'un contrôle pour la grille
   */
  const createControlInstance = (
    controlId: string,
    position?: { x: number; y: number },
    customProps?: Record<string, any>
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

  /**
   * Supprime un contrôle du registre
   */
  const unregisterControl = (id: string): boolean => {
    return registeredControls.value.delete(id);
  };

  /**
   * Vide le registre
   */
  const clearRegistry = () => {
    registeredControls.value.clear();
  };

  /**
   * Vérifie si un contrôle est enregistré
   */
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
