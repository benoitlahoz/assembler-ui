# ControlGrid - Démos

## 📋 Démos disponibles

### 1. SimpleDemo
**Démo simple avec des contrôles pré-placés**

Une grille avec 5 contrôles déjà positionnés :
- 4 boutons de contrôle média (Play, Pause, Stop, Record)
- 1 contrôle de volume

Fonctionnalités :
- ✅ Visualisation de la grille
- ✅ Drag & drop pour réorganiser
- ✅ Suppression via bouton ✕
- ❌ Pas d'ajout de nouveaux contrôles

**Cas d'usage :** Démonstration de base, interface read-only avec drag & drop

---

### 2. InteractiveDemo
**Démo interactive avec toolbar et ajout de contrôles**

Une grille avec toolbar permettant d'ajouter dynamiquement des contrôles.

Fonctionnalités :
- ✅ Ajout de contrôles via toolbar
- ✅ 4 templates pré-définis (Button, Wide Button, Square, Tall)
- ✅ Drag & drop pour réorganiser
- ✅ Suppression individuelle
- ✅ Bouton "Réinitialiser" pour revenir à l'état initial
- ✅ Bouton "Tout effacer" pour vider la grille
- ✅ Info en temps réel (nombre de contrôles, taille de la grille)

**Cas d'usage :** Éditeur de layout, construction d'interface personnalisée

---

## 🎯 Différences principales

| Fonctionnalité | SimpleDemo | InteractiveDemo |
|----------------|------------|-----------------|
| **Contrôles pré-placés** | 5 | 1 |
| **Ajout de contrôles** | ❌ | ✅ |
| **Toolbar** | ❌ | ✅ |
| **Templates** | ❌ | ✅ (4) |
| **Réinitialisation** | ❌ | ✅ |
| **Info en temps réel** | ❌ | ✅ |
| **Complexité** | Basique | Avancée |

---

## 💡 Utilisation

### SimpleDemo
Idéal pour :
- Démonstration rapide
- Interface de contrôle fixe
- Visualisation du drag & drop

### InteractiveDemo
Idéal pour :
- Construction d'interface personnalisée
- Tests de différents layouts
- Démonstration complète des fonctionnalités

---

## 🔧 Personnalisation

Les deux démos peuvent être personnalisées :

```vue
<ControlGrid
  :cell-size="100"    <!-- Taille des cellules -->
  :gap="12"           <!-- Espacement -->
  :min-columns="4"    <!-- Colonnes minimum -->
  :show-grid="true"   <!-- Afficher la grille -->
/>
```

---

**Pour plus d'informations, consultez [README.md](../README.md)**
