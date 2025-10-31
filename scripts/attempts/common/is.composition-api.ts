// Détection stricte d'un bloc <script ... setup ...> non vide dans un SFC Vue

/**
 * Détecte si un SFC contient un bloc <script ... setup ...> non vide.
 * @param vueSource Le code source du SFC
 * @returns true si un bloc <script setup> non vide est présent
 */
export function isCompositionApi(vueSource: string): boolean {
  const scriptBlockRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptBlockRegex.exec(vueSource))) {
    const attrs = match[1];
    const content = match[2];
    const isSetupBlock = /\bsetup\b/i.test(attrs || '');
    if (isSetupBlock && content && content.trim().length > 0) {
      return true;
    }
  }
  return false;
}
