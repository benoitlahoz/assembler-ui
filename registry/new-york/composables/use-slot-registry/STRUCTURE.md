# Structure du projet useSlotRegistry

```
use-slot-registry/
│
├── 📄 useSlotRegistry.ts              # Composable principal (450 lignes)
│   ├── Types & Interfaces
│   │   ├── SlotType, SlotPosition
│   │   ├── SlotScopedProps, SlotRenderFunction
│   │   ├── SlotDefinition<TScope>
│   │   ├── SlotRegistryOptions<TScope, TContext>
│   │   ├── RegisterSlotOptions<TScope>
│   │   └── SlotRegistry<TScope, TContext>
│   │
│   ├── createSlotRegistry()
│   │   ├── getSlots()              → Filtrage et tri
│   │   ├── renderSlots()           → Rendu de tous les slots
│   │   ├── slots (computed)        → Auto-render
│   │   ├── getSlotsByGroup()       → Computed par groupe
│   │   └── renderGroup()           → Rendu d'un groupe
│   │
│   ├── registerSlot()
│   │   └── Enregistrement de slots avec auto-register
│   │
│   └── createSlot (helpers)
│       ├── fromComponent()
│       ├── fromRender()
│       └── fromVNode()
│
├── 📄 index.ts                        # Exports publics
│   ├── useSlotRegistry
│   ├── Types (SlotDefinition, etc.)
│   └── Re-exports de useCheckIn
│
├── 📄 assemblerjs.json                # Métadonnées du registry
│   ├── name: "use-slot-registry"
│   ├── category: "data"
│   ├── type: "registry:hook"
│   ├── files: [useSlotRegistry.ts]
│   ├── registryDependencies: ["use-check-in"]
│   └── docs: "content/composables/data/use-slot-registry.md"
│
├── 📁 demos/                          # 4 exemples complets
│   │
│   ├── 1️⃣ Dynamic Toolbar
│   │   ├── DynamicToolbarDemo.vue          # Parent avec 3 groupes
│   │   ├── DynamicToolbarButton.vue        # Bouton enregistrable
│   │   └── DynamicToolbarSeparator.vue     # Séparateur
│   │
│   ├── 2️⃣ Breadcrumb Manager
│   │   ├── BreadcrumbManagerDemo.vue       # Navigation avec scope
│   │   └── BreadcrumbItem.vue              # Item avec séparateur conditionnel
│   │
│   ├── 3️⃣ Notification Provider
│   │   ├── NotificationProviderDemo.vue    # Gestionnaire de toasts
│   │   └── NotificationItem.vue            # Toast avec auto-remove
│   │
│   └── 4️⃣ Context Menu
│       ├── ContextMenuDemo.vue             # Menu clic-droit
│       └── ContextMenuItem.vue             # Item de menu
│
├── 📁 .private/                       # Exemples avancés
│   └── examples.ts                    # 5 patterns sophistiqués
│       ├── Command Palette            # Avec recherche
│       ├── Dialog Manager             # Avec z-index stacking
│       ├── Layout extensible          # Multi-zones
│       ├── Notification System        # 4 positions
│       └── Dynamic Form Builder       # Avec validation
│
├── 📄 useSlotRegistry.test.ts         # Tests unitaires (400+ lignes)
│   ├── createSlotRegistry()
│   ├── registerSlot()
│   ├── getSlots() - filtrage/tri
│   ├── renderSlots() - rendu
│   ├── Scoped Slots
│   ├── Réactivité
│   ├── Compatibilité useCheckIn
│   └── Edge Cases
│
├── 📚 Documentation
│   │
│   ├── 📄 README.md                   # Guide rapide
│   │   ├── Vue d'ensemble
│   │   ├── Architecture
│   │   ├── Contenu du package
│   │   ├── Installation
│   │   ├── Cas d'usage
│   │   ├── Exemples rapides
│   │   ├── API principale
│   │   ├── Compatibilité
│   │   ├── Patterns avancés
│   │   └── Différences avec useCheckIn
│   │
│   ├── 📄 MIGRATION.md                # Guide de migration
│   │   ├── Quand migrer ?
│   │   ├── Exemple avant/après
│   │   ├── Checklist (4 étapes)
│   │   ├── Migration progressive
│   │   ├── Bonnes pratiques
│   │   └── Pièges à éviter
│   │
│   ├── 📄 SUMMARY.md                  # Récapitulatif complet
│   │   ├── Ce qui a été créé
│   │   ├── Cas d'usage couverts
│   │   ├── Fonctionnalités principales
│   │   ├── Comparaison avec useCheckIn
│   │   ├── Principes de design
│   │   └── Liens utiles
│   │
│   └── 📄 CHANGELOG.md                # Historique des versions
│       └── [1.0.0] - 2025-11-16
│           ├── Features
│           ├── Documentation
│           ├── Démos
│           ├── Tests
│           └── Compatibilité
│
└── 📄 ../PATTERNS.md                  # Comparaison des patterns
    ├── Architecture check-in vs slot-registry
    ├── Quel pattern utiliser ?
    ├── Tableau comparatif
    ├── Compatibilité
    ├── Patterns de combinaison
    ├── Exemples par cas d'usage
    └── Principes de design
```

## 📊 Statistiques

### Code

- **Composable principal:** ~450 lignes
- **Démos:** 4 exemples × 2 fichiers = 8 fichiers
- **Tests:** ~400 lignes
- **Exemples avancés:** ~500 lignes
- **Total code:** ~1800 lignes

### Documentation

- **Documentation principale:** ~800 lignes (content/composables/data/use-slot-registry.md)
- **README:** ~300 lignes
- **MIGRATION:** ~400 lignes
- **PATTERNS:** ~500 lignes
- **SUMMARY:** ~200 lignes
- **CHANGELOG:** ~200 lignes
- **Total documentation:** ~2400 lignes

### Types

- 8 interfaces TypeScript
- 2 types génériques (TScope, TContext)
- Support complet de TypeScript
- 100% type-safe

## 🎯 Cas d'usage couverts

### Démos (4)

1. ✅ **Toolbar** - Groupes, position, disabled
2. ✅ **Breadcrumb** - Scoped slots, séparateurs conditionnels
3. ✅ **Notifications** - Auto-remove, visibilité, animations
4. ✅ **Context Menu** - Teleport, position dynamique

### Exemples avancés (5)

1. ✅ **Command Palette** - Recherche, sélection clavier
2. ✅ **Dialog Manager** - Z-index stacking, backdrop
3. ✅ **Layout** - Multi-zones, collapsible
4. ✅ **Notification System** - 4 positions, priorités
5. ✅ **Form Builder** - Validation, groupes

## 🔗 Dépendances

### Internes

- `use-check-in` (requis) - Système de base

### Externes

- `vue` (peer) - Vue 3.x
- Aucune autre dépendance !

## 📦 Installation

```bash
npx @assembler-ui/cli add use-slot-registry
```

→ Installe automatiquement `use-check-in` comme dépendance.

## 🚀 Prochaines étapes

### Possibles extensions futures

1. **useActionRegistry** - Actions/commandes (command palette++)
2. **useRouteRegistry** - Routes dynamiques par modules
3. **useValidatorRegistry** - Validateurs réutilisables
4. **useMiddlewareRegistry** - Pipeline de middlewares
5. **useThemeRegistry** - Thèmes/styles par composants

### Améliorations possibles

- [ ] Support du SSR (Server-Side Rendering)
- [ ] Animations de transition entre slots
- [ ] Drag & drop pour réordonner
- [ ] Persistence (localStorage)
- [ ] Undo/redo
- [ ] History tracking

## 📝 Notes

- **Créé le:** 16 novembre 2025
- **Par:** GitHub Copilot
- **Inspiré par:** Suggestion ChatGPT
- **Version:** 1.0.0
- **License:** MIT
