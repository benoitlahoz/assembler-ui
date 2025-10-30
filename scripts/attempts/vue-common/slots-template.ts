import { nativeAttrs } from './vue-native';

export interface SlotInfo {
  name: string;
  params?: string;
  description?: string;
}

/**
 * Extrait les slots et leurs paramètres du template d'un SFC Vue.
 * @param templateCode code source du template (string)
 * @returns tableau d'objets SlotInfo
 */
export const extractSlotsFromTemplate = (templateCode: string): SlotInfo[] => {
  // Parsing naïf basé sur la profondeur des balises pour ne garder que les slots du composant
  // Nouvelle version : parcours ligne à ligne, suivi de la profondeur réelle
  const slotsMap: Record<string, SlotInfo> = {};
  const lines = templateCode.split(/\r?\n/);
  let inRoot = false;
  let depth = 0;
  let lastComment = '';
  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    // Détection du début du composant racine (ex : <Button ...>)
    if (!inRoot && line.match(/^<([A-Z][\w-]*)\b/)) {
      inRoot = true;
      depth = 1;
      continue;
    }
    if (inRoot) {
      // Suivi de la profondeur dans le composant racine
      if (line.match(/^<([A-Z][\w-]*)\b/) && !line.startsWith('<slot')) depth++;
      if (line.match(/^<\/[A-Z][\w-]*>/)) depth--;
      // Récupère le commentaire HTML précédent
      const commentMatch = line.match(/<!--\s*(.*?)\s*-->/);
      if (commentMatch && typeof commentMatch[1] === 'string') {
        lastComment = commentMatch[1].trim();
        continue;
      }
      // Si on sort du composant racine, on arrête
      if (depth === 0) {
        inRoot = false;
        continue;
      }
      // Slots enfants directs du composant racine (profondeur 1)
      if (depth === 1 && line.includes('<slot')) {
        // Gère les slots auto-fermants et classiques
        const slotTag =
          line.match(/<slot([^>]*)\/?>(.*?)<\/slot>?/) || line.match(/<slot([^>]*)\/>/);
        if (slotTag) {
          const attrs = slotTag[1] || '';
          let name = 'default';
          // name="..."
          const nameAttr = attrs.match(/\bname\s*=\s*(["'`])([\s\S]*?)\1/);
          // :name= ou v-bind:name=
          const dynamicNameAttr = attrs.match(/(?::|v-bind:)name\s*=\s*(["'`])([\s\S]*?)\1/);
          if (dynamicNameAttr && typeof dynamicNameAttr[2] === 'string') {
            let val = dynamicNameAttr[2].trim();
            val = val.replace(/^\(|\)$/g, '');
            let staticString = val.match(/^'([^']+)'$|^"([^"]+)"$|^`([^`]+)`$/);
            if (!staticString && val.startsWith("'")) {
              staticString = val.match(/^'([^']+)'$/);
            }
            if (staticString) {
              name = staticString[1] ?? staticString[2] ?? staticString[3] ?? 'default';
            } else {
              name = val || 'default';
            }
          } else if (nameAttr && typeof nameAttr[2] === 'string') {
            name = nameAttr[2];
          }
          // Recherche des params :foo, v-bind:foo, v-bind="{ foo, bar }"
          const params: string[] = [];
          const paramRegex = /[:@]([\w-]+)=/g;
          let p;
          while ((p = paramRegex.exec(attrs))) {
            const k = p[1];
            if (k && !nativeAttrs.has(k) && !k.startsWith('v-')) params.push(k);
          }
          // v-bind="{ foo, bar }"
          const vbindObj = attrs.match(/v-bind=["']\{([^}]+)\}["']/);
          if (vbindObj) {
            const vbindVal = vbindObj[1];
            if (typeof vbindVal === 'string' && vbindVal !== undefined) {
              const keys =
                typeof vbindVal === 'string'
                  ? (vbindVal ?? '').split(',').map((s) => {
                      const parts = s.trim().split(':');
                      return parts.length > 0 && parts[0] !== undefined ? parts[0].trim() : '';
                    })
                  : [];
              for (const k of keys)
                if (k && !nativeAttrs.has(k) && !k.startsWith('v-')) params.push(k);
            }
          }
          if (!slotsMap[name]) {
            slotsMap[name] = {
              name,
              params: params.length ? params.join(', ') : '-',
              description: lastComment || '',
            };
          } else {
            if (params.length && slotsMap[name]) {
              slotsMap[name]!.params = params.join(', ');
            }
            if (lastComment && slotsMap[name] && !slotsMap[name]!.description) {
              slotsMap[name]!.description = lastComment;
            }
            if (!slotsMap[name]!.params) slotsMap[name]!.params = '-';
            if (!slotsMap[name]!.description) slotsMap[name]!.description = '';
          }
          lastComment = '';
        }
      }
    }
  }
  return Object.values(slotsMap).map((slot) => ({
    name: slot.name,
    params: slot.params ?? '-',
    description: slot.description ?? '',
  }));
};
