import { isVueNativeAttr } from './is.vue-native.attr';

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
  // Extraction robuste : détecte tous les <slot ...> (auto-fermants, classiques, multilignes)
  const slotsMap: Record<string, SlotInfo> = {};
  // 1. Regroupe tous les slots (auto-fermants ou fermés explicitement)
  const slotRegex = /<slot([^>]*)\/>|<slot([^>]*)>(?:[\s\S]*?)<\/slot>/gim;
  let match;
  while ((match = slotRegex.exec(templateCode))) {
    // match[1] = attrs pour slot auto-fermants, match[2] = attrs pour slot fermés explicitement
    const attrs = (match[1] !== undefined ? match[1] : match[2]) || '';
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
      if (k && !isVueNativeAttr(k) && !k.startsWith('v-')) params.push(k);
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
        for (const k of keys) if (k && !isVueNativeAttr(k) && !k.startsWith('v-')) params.push(k);
      }
    }

    // Recherche d'un commentaire HTML juste au-dessus du slot (ignore lignes vides/espaces)
    let description = '';
    const beforeSlot = templateCode.slice(0, match.index);
    const lines = beforeSlot.split(/\r?\n/);
    let foundComment = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.trim() === '') continue;
      // Accepte indentation avant le commentaire
      const commentMatch = line.match(/<!--([\s\S]*?)-->/);
      if (commentMatch) {
        foundComment = commentMatch[1].replace(/^\s+|\s+$/g, '');
        break;
      } else {
        // Si on trouve une ligne non vide et non commentaire, on arrête
        break;
      }
    }
    if (foundComment) {
      description = foundComment;
    }

    // Toujours ajouter le slot, description vide si pas de commentaire
    if (!slotsMap[name]) {
      slotsMap[name] = {
        name,
        params: params.length ? params.join(', ') : '-',
        description: description,
      };
    }
  }

  return Object.values(slotsMap).map((slot) => ({
    name: slot.name,
    params: slot.params ?? '-',
    description: slot.description ?? '',
  }));
};
