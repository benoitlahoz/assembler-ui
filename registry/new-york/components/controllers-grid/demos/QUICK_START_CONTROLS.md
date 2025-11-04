# Quick Start - Control Button & Controllers Grid

## Installation rapide

### 1. Importer les composants nécessaires

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ControllersGrid } from '~/registry/new-york/components/controllers-grid';
import { useControlRegistry } from '~/registry/new-york/composables/use-control-registry';
import { controlDefinitions } from '~/registry/new-york/components/controllers-grid/controls';
</script>
```

### 2. Enregistrer les contrôles (une fois au démarrage)

```vue
<script setup lang="ts">
import { onMounted } from 'vue';

const { registerControls, createControlInstance } = useControlRegistry();

onMounted(() => {
  // Enregistrer tous les contrôles prédéfinis
  registerControls(controlDefinitions);
});
</script>
```

### 3. Utiliser la grille

```vue
<script setup lang="ts">
const gridItems = ref([]);

// Ajouter un contrôle programmatiquement
const addButton = () => {
  const instance = createControlInstance('button-control');
  if (instance) {
    gridItems.value.push(instance);
  }
};
</script>

<template>
  <div>
    <button @click="addButton">Ajouter un bouton</button>
    
    <ControllersGrid
      v-model:items="gridItems"
      :cell-size="80"
      :gap="8"
    />
  </div>
</template>
```

## Exemple complet avec palette

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ControllersGrid } from '~/registry/new-york/components/controllers-grid';
import { useControlRegistry } from '~/registry/new-york/composables/use-control-registry';
import { controlDefinitions } from '~/registry/new-york/components/controllers-grid/controls';

const { registerControls, getAllControls, createControlInstance } = useControlRegistry();

const gridItems = ref([]);
const availableControls = ref([]);

onMounted(() => {
  registerControls(controlDefinitions);
  availableControls.value = getAllControls();
});

const handleDragStart = (event: DragEvent, controlId: string) => {
  const instance = createControlInstance(controlId);
  if (instance && event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(instance));
  }
};
</script>

<template>
  <div class="flex gap-4">
    <!-- Palette -->
    <aside class="w-64 space-y-2">
      <h3>Contrôles disponibles</h3>
      <div
        v-for="control in availableControls"
        :key="control.id"
        class="p-3 bg-card rounded border cursor-grab"
        :draggable="true"
        @dragstart="handleDragStart($event, control.id)"
      >
        {{ control.icon }} {{ control.name }}
      </div>
    </aside>

    <!-- Grille -->
    <main class="flex-1">
      <ControllersGrid
        v-model:items="gridItems"
        :cell-size="80"
        :gap="8"
        :min-columns="6"
      />
    </main>
  </div>
</template>
```

## Utiliser ControlButton seul (sans grille)

```vue
<script setup lang="ts">
import { ControlButton } from '~/registry/new-york/components/control-button';
</script>

<template>
  <!-- Taille fixe -->
  <div class="w-20 h-20">
    <ControlButton color="#3b82f6" variant="default" shape="square">
      <span class="text-2xl">▶</span>
    </ControlButton>
  </div>

  <!-- Avec variable CSS -->
  <div class="w-24 h-24">
    <ControlButton color="--primary" variant="outline" shape="circle">
      <span class="text-2xl">●</span>
    </ControlButton>
  </div>
</template>
```

## Créer un contrôle personnalisé

```vue
<!-- MonBouton.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { ControlButton } from '~/registry/new-york/components/control-button';

const isActive = ref(false);

const toggle = () => {
  isActive.value = !isActive.value;
  console.log('Actif:', isActive.value);
};
</script>

<template>
  <ControlButton
    color="#f59e0b"
    variant="default"
    :class="{ 'ring-2': isActive }"
    @click="toggle"
  >
    <span>{{ isActive ? '■' : '▶' }}</span>
  </ControlButton>
</template>
```

Puis l'enregistrer:

```typescript
import MonBouton from './MonBouton.vue';

registerControl({
  id: 'mon-bouton',
  name: 'Mon Bouton',
  component: MonBouton,
  defaultSize: { width: 1, height: 1 },
  category: 'custom',
});
```

## Contrôles disponibles

| ID | Icône | Taille | Description |
|----|-------|--------|-------------|
| `button-control` | ▶ | 1×1 | Bouton play |
| `button-stop` | ■ | 1×1 | Bouton stop |
| `button-record` | ● | 1×1 | Bouton record |
| `button-wide` | WIDE | 2×1 | Bouton large |
| `button-tall` | TALL | 1×2 | Bouton haut |
| `button-big` | ✦ | 2×2 | Grand bouton |

## Voir les démos

- **ControlButtonDemo** - Utilisation avec grille et drag-and-drop
- **ControlRegistryDemo** - Système complet avec palette
- **PlaygroundDemo** - Tester les variantes interactivement

Consultez `docs/CONTROL_REGISTRY_GUIDE.md` pour la documentation complète.
