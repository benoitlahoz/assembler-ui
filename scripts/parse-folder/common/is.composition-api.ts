// Strict detection of a non-empty <script ... setup ...> block in a Vue SFC

/**
 * Detects if an SFC contains a non-empty <script ... setup ...> block.
 * @param vueSource The SFC source code
 * @returns true if a non-empty <script setup> block is present
 */
export function isCompositionApi(vueSource: string): boolean {
  const scriptBlockRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptBlockRegex.exec(vueSource))) {
    const attrs = match[1];
    const isSetupBlock = /\bsetup\b/i.test(attrs || '');
    if (isSetupBlock) {
      return true;
    }
  }
  return false;
}
