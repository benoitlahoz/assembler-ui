/**
 * Gestionnaire de plugins pour le système de check-in
 * Coordonne l'installation et le cycle de vie des plugins
 */

import type { Plugin, PluginContext } from './types';

export class PluginManager<T = any> {
  private plugins = new Map<string, Plugin<T>>();
  private context: PluginContext<T> | null = null;

  constructor() {}

  /**
   * Initialise le gestionnaire avec un contexte
   */
  initialize(context: PluginContext<T>) {
    this.context = context;
    context.debug('[PluginManager] Initialized with context');
  }

  /**
   * Installe un ou plusieurs plugins
   */
  install(...plugins: Plugin<T>[]) {
    if (!this.context) {
      throw new Error('[PluginManager] Context not initialized. Call initialize() first.');
    }

    for (const plugin of plugins) {
      if (this.plugins.has(plugin.name)) {
        this.context.debug(`[PluginManager] Plugin '${plugin.name}' already installed, skipping`);
        continue;
      }

      this.context.debug(`[PluginManager] Installing plugin '${plugin.name}'`);
      plugin.install(this.context);
      this.plugins.set(plugin.name, plugin);
    }
  }

  /**
   * Récupère un plugin par son nom
   */
  get<P extends Plugin<T>>(name: string): P | undefined {
    return this.plugins.get(name) as P | undefined;
  }

  /**
   * Vérifie si un plugin est installé
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Désinstalle un plugin
   */
  uninstall(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      this.context?.debug(`[PluginManager] Plugin '${name}' not found`);
      return false;
    }

    this.context?.debug(`[PluginManager] Uninstalling plugin '${name}'`);
    plugin.cleanup?.();
    this.plugins.delete(name);
    return true;
  }

  /**
   * Nettoie tous les plugins
   */
  cleanup() {
    this.context?.debug(`[PluginManager] Cleaning up ${this.plugins.size} plugins`);

    for (const [name, plugin] of this.plugins) {
      this.context?.debug(`[PluginManager] Cleaning up plugin '${name}'`);
      plugin.cleanup?.();
    }

    this.plugins.clear();
  }

  /**
   * Liste tous les plugins installés
   */
  list(): string[] {
    return Array.from(this.plugins.keys());
  }
}
