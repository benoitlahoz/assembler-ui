/**
 * Control Registry Composable
 *
 * Gère l'enregistrement et la récupération de composants de contrôle
 * pour être utilisés dans ControlsGrid. Fusionne les fonctionnalités
 * de useControlRegistry et useComponentPalette.
 *
 * @type registry:hook
 * @category controls
 */

import { ref, shallowRef, type Component } from 'vue';
import type { GridItem, GridItemTemplate } from '../../components/control-grid';

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
  /** Label affiché dans la palette */
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
  /**
   * Enregistre un nouveau contrôle dans le registre
   * Accepte soit une définition complète, soit un composant brut
   */
  const registerControl = (
    definition: ControlDefinition | Component,
    options?: Partial<Omit<ControlDefinition, 'component'>>
  ) => {
    let controlDef: ControlDefinition;

    // Si c'est un composant brut, créer une définition à partir des options
    if ((typeof definition === 'object' && 'setup' in definition) || 'render' in definition) {
      if (!options?.id) {
        console.error("Un ID est requis lors de l'enregistrement d'un composant brut");
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
      // C'est une définition complète
      controlDef = definition as ControlDefinition;
    }

    if (registeredControls.value.has(controlDef.id)) {
      console.warn(`Control with id "${controlDef.id}" is already registered. Overwriting.`);
    }

    registeredControls.value.set(controlDef.id, {
      ...controlDef,
      component: shallowRef(controlDef.component),
      label: controlDef.label || controlDef.name,
    });
  };

  /**
   * Enregistre plusieurs contrôles à la fois
   */
  const registerControls = (definitions: (ControlDefinition | Component)[]) => {
    definitions.forEach((def) => {
      if ('id' in def) {
        registerControl(def);
      } else {
        console.warn(
          "Impossible d'enregistrer un composant brut sans options. Utilisez registerControl avec options."
        );
      }
    });
  };

  /**
   * Enregistre un contrôle à partir d'un fichier de composant
   * Charge dynamiquement le composant et l'enregistre
   */
  const registerControlFromFile = async (
    filePath: string,
    options: Partial<Omit<ControlDefinition, 'component'>> & { id: string }
  ): Promise<boolean> => {
    try {
      // Import dynamique du composant
      const module = await import(/* @vite-ignore */ filePath);
      const component = module.default || module;

      if (!component) {
        console.error(`Aucun composant trouvé dans ${filePath}`);
        return false;
      }

      registerControl(component, options);
      return true;
    } catch (error) {
      console.error(`Erreur lors du chargement du composant depuis ${filePath}:`, error);
      return false;
    }
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

  /**
   * Crée un item de grille à partir d'un template de contrôle
   * Similaire à createItemFromTemplate de useComponentPalette
   */
  const createItemFromControl = (controlId: string): Omit<GridItem, 'x' | 'y'> | null => {
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

  /**
   * Convertit un contrôle en template de grille pour la palette
   */
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

  /**
   * Récupère tous les contrôles sous forme de templates pour la palette
   */
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

  /**
   * Filtre les templates par taille maximale
   */
  const filterTemplatesBySize = (maxWidth: number, maxHeight: number): GridItemTemplate[] => {
    return getAllTemplates().filter(
      (template) => template.width <= maxWidth && template.height <= maxHeight
    );
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
    // Enregistrement de contrôles
    registerControl,
    registerControls,
    registerControlFromFile,

    // Récupération de contrôles
    getControl,
    getAllControls,
    getControlsByCategory,
    hasControl,

    // Création d'instances et items
    createControlInstance,
    createItemFromControl,

    // Gestion de templates (palette)
    controlToTemplate,
    getAllTemplates,
    filterTemplatesBySize,

    // Gestion du registre
    unregisterControl,
    clearRegistry,
  };
}
