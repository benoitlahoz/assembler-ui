/**
 * Types et interfaces pour le système de check-in
 */

import type { Ref, ComputedRef, InjectionKey } from 'vue';

// ==========================================
// TYPES DE BASE
// ==========================================

/** Type d'événement émis par le desk */
export type DeskEventType = 'check-in' | 'check-out' | 'update' | 'clear';

/** Payload d'événement typé selon le type */
export type DeskEventPayload<T = any> = {
  'check-in': { id: string | number; data: T; timestamp: number };
  'check-out': { id: string | number; timestamp: number };
  update: { id: string | number; data: T; timestamp: number };
  clear: { timestamp: number };
};

/** Callback pour les événements du desk */
export type DeskEventCallback<T = any, E extends DeskEventType = DeskEventType> = (
  payload: DeskEventPayload<T>[E]
) => void;

export interface CheckInItem<T = any> {
  id: string | number;
  data: T;
  timestamp?: number;
  meta?: CheckInItemMeta;
}

/** Métadonnées structurées pour les items */
export interface CheckInItemMeta {
  /** Groupe auquel appartient l'item */
  group?: string;
  /** Position/ordre dans le groupe */
  order?: number;
  /** Priorité pour le tri */
  priority?: number;
  /** Métadonnées utilisateur personnalisées */
  user?: Record<string, any>;
}

// ==========================================
// TYPES DE SLOTS (natifs)
// ==========================================

/** Configuration d'un slot */
export interface SlotConfig {
  /** ID unique du slot */
  id: string;
  /** Type de slot (toolbar, menu, panel, etc.) */
  type: string;
  /** Métadonnées du slot */
  meta?: Record<string, any>;
}

/** API des slots intégrée au desk */
export interface SlotsAPI<T = any> {
  /** Enregistre un nouveau slot */
  register: (slotId: string, slotType: string, meta?: Record<string, any>) => void;
  /** Désenregistre un slot */
  unregister: (slotId: string) => void;
  /** Récupère les items d'un slot spécifique */
  get: (slotId: string) => CheckInItem<T>[];
  /** Vérifie si un slot existe */
  has: (slotId: string) => boolean;
  /** Liste tous les slots */
  list: () => SlotConfig[];
  /** Nettoie tous les slots */
  clear: () => void;
}

// ==========================================
// TYPES DE HOOKS (plugins simplifiés)
// ==========================================

/** Hook simple qui s'intègre dans le lifecycle du desk */
export interface DeskHook<T = any> {
  /** Nom du hook */
  name: string;
  /** Appelé après un check-in */
  onCheckIn?: (item: CheckInItem<T>) => void;
  /** Appelé après un check-out */
  onCheckOut?: (id: string | number) => void;
  /** Appelé après une mise à jour */
  onUpdate?: (item: CheckInItem<T>) => void;
  /** Appelé après un clear */
  onClear?: () => void;
  /** Nettoyage du hook */
  cleanup?: () => void;
}

/** API des hooks */
export interface HooksAPI<T = any> {
  /** Ajoute un hook */
  add: (hook: DeskHook<T>) => void;
  /** Retire un hook par son nom */
  remove: (name: string) => boolean;
  /** Liste tous les hooks actifs */
  list: () => string[];
}

// ==========================================
// INTERFACES DU DESK
// ==========================================

export interface CheckInDesk<T = any, TContext extends Record<string, any> = {}> {
  /**
   * Registry interne des items. ⚠️ NE PAS UTILISER DIRECTEMENT dans les templates.
   * Utilisez plutôt les helpers : get(), getAll(), ou le computed getRegistry().
   * Map n'est pas réactive, seul le Ref l'est.
   */
  registry: Readonly<Ref<Map<string | number, CheckInItem<T>>>>;
  /** API des slots intégrée */
  slots: SlotsAPI<T>;
  /** API des hooks (plugins simplifiés) */
  hooks: HooksAPI<T>;
  checkIn: (id: string | number, data: T, meta?: CheckInItemMeta) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: GetAllOptions<T>) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (updates: Array<{ id: string | number; data: Partial<T> }>) => void;
  /** Écoute un type d'événement */
  on: <E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>) => () => void;
  /** Retire un listener d'événement */
  off: <E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>) => void;
  /** Émet un événement (usage interne principalement) */
  emit: <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], 'timestamp'>
  ) => void;
  /** Récupère les items d'un groupe spécifique (computed) */
  getGroup: (group: string, options?: SortOptions<T>) => ComputedRef<CheckInItem<T>[]>;
  /** Computed de tous les items */
  items: ComputedRef<CheckInItem<T>[]>;
}

export interface GetAllOptions<T = any> {
  sortBy?: keyof T | 'timestamp' | `meta.${string}`;
  order?: 'asc' | 'desc';
  group?: string;
  filter?: (item: CheckInItem<T>) => boolean;
}

export interface SortOptions<T = any> {
  sortBy?: keyof T | 'timestamp' | `meta.${string}`;
  order?: 'asc' | 'desc';
}

export interface CheckInDeskOptions<T = any, TContext extends Record<string, any> = {}> {
  /** Contexte additionnel à merger avec le desk (typé) */
  context?: TContext;
  /** Callback appelé avant le check-in d'un item */
  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;
  /** Callback appelé après le check-in d'un item */
  onCheckIn?: (id: string | number, data: T) => void;
  /** Callback appelé avant le check-out d'un item */
  onBeforeCheckOut?: (id: string | number) => void | boolean;
  /** Callback appelé après le check-out d'un item */
  onCheckOut?: (id: string | number) => void;
  /** Active le mode debug avec logging */
  debug?: boolean;
  /** Hooks personnalisés à installer */
  hooks?: DeskHook<T>[];
}

export interface CheckInOptions<T = any> {
  /** Lève une erreur si le desk n'existe pas */
  required?: boolean;
  /** Auto check-in au montage du composant */
  autoCheckIn?: boolean;
  /** ID de l'item à enregistrer */
  id?: string | number;
  /** Données de l'item à enregistrer (peut être async) */
  data?: T | (() => T) | (() => Promise<T>);
  /** Fonction pour générer un ID unique si non fourni */
  generateId?: () => string | number;
  /** Watch les changements de data pour mettre à jour l'enregistrement */
  watchData?: boolean;
  /** Watch shallow au lieu de deep (meilleure performance) */
  shallow?: boolean;
  /** Condition réactive pour check-in/out automatique */
  watchCondition?: (() => boolean) | Ref<boolean>;
  /** Métadonnées additionnelles */
  meta?: CheckInItemMeta;
  /** Groupe auquel appartient cet item (pour filtrage/organisation) */
  group?: string;
  /** Position/ordre de l'item (pour tri) */
  position?: number;
  /** Priorité de l'item (pour tri) */
  priority?: number;
  /** Active le mode debug avec logging */
  debug?: boolean;
}

// ==========================================
// TYPES POUR INJECTION
// ==========================================

export interface DeskProvider<T = any, TContext extends Record<string, any> = {}> {
  desk: CheckInDesk<T, TContext> & TContext;
  DeskInjectionKey: InjectionKey<CheckInDesk<T, TContext> & TContext>;
}

export interface CheckInReturn<T = any, TContext extends Record<string, any> = {}> {
  desk: (CheckInDesk<T, TContext> & TContext) | null;
  checkOut: () => void;
  updateSelf: (newData?: T) => void;
}
