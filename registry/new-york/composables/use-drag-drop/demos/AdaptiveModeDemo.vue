<!--
  🎯 Mode Adaptatif - Drag sans unitSize
  Exemple d'utilisation de useDragDrop en mode adaptatif (sans unitSize)
-->
<script setup lang="ts">
import { ref } from 'vue';
import { useDragDrop } from '../useDragDrop';

interface Card {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number; // Largeur en pixels
  height: number; // Hauteur en pixels
  color: string;
}

const workspace = ref<HTMLElement | null>(null);

const cards = ref<Card[]>([
  {
    id: 'card-1',
    title: 'Note 1',
    content: 'Cette carte peut être déplacée librement',
    x: 50,
    y: 50,
    width: 250,
    height: 150,
    color: 'bg-yellow-100 border-yellow-300',
  },
  {
    id: 'card-2',
    title: 'Note 2',
    content: 'Chaque carte a sa propre taille',
    x: 350,
    y: 100,
    width: 200,
    height: 120,
    color: 'bg-blue-100 border-blue-300',
  },
  {
    id: 'card-3',
    title: 'Note 3',
    content: 'Pas besoin de définir unitSize !',
    x: 150,
    y: 250,
    width: 300,
    height: 180,
    color: 'bg-pink-100 border-pink-300',
  },
]);

// Mode adaptatif : pas de unitSize !
const { dragState, startDrag, handleDragOverSimple, endDrag } = useDragDrop({
  containerRef: workspace,
  gap: 0, // Pas d'espacement en mode adaptatif
});

const onDragStart = (event: DragEvent, card: Card) => {
  startDrag(
    event,
    {
      id: card.id,
      width: card.width, // Les dimensions sont en pixels
      height: card.height, // directement, pas en unités
      data: card,
    },
    true
  );
};

const onDragOver = (event: DragEvent) => {
  handleDragOverSimple?.(event, (virtualBounds, containerBounds) => {
    // En mode adaptatif, retourner directement les pixels
    return {
      x: Math.round(virtualBounds.left - containerBounds.left),
      y: Math.round(virtualBounds.top - containerBounds.top),
    };
  });
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();

  if (dragState.value.item && dragState.value.hoverPosition) {
    const card = cards.value.find((c) => c.id === dragState.value.item!.id);
    if (card) {
      card.x = dragState.value.hoverPosition.x;
      card.y = dragState.value.hoverPosition.y;
    }
  }

  endDrag();
};

const selectedCard = ref<string | null>(null);

const addCard = () => {
  const colors = [
    'bg-yellow-100 border-yellow-300',
    'bg-blue-100 border-blue-300',
    'bg-pink-100 border-pink-300',
    'bg-green-100 border-green-300',
    'bg-purple-100 border-purple-300',
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);

  const newCard: Card = {
    id: `card-${Date.now()}`,
    title: 'Nouvelle note',
    content: 'Double-cliquez pour modifier',
    x: 20,
    y: 20,
    width: 250,
    height: 150,
    color: colors[randomIndex]!,
  };

  cards.value.push(newCard);
  selectedCard.value = newCard.id;
};

const removeCard = (id: string) => {
  cards.value = cards.value.filter((c) => c.id !== id);
  if (selectedCard.value === id) {
    selectedCard.value = null;
  }
};

const resizeCard = (card: Card, delta: number) => {
  card.width = Math.max(150, card.width + delta);
  card.height = Math.max(100, card.height + delta);
};
</script>

<template>
  <div class="w-full h-full flex bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r p-4">
      <h3 class="font-bold text-lg mb-4">Mode Adaptatif</h3>

      <div class="space-y-4">
        <button
          @click="addCard"
          class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          ➕ Ajouter une carte
        </button>

        <div v-if="selectedCard" class="p-3 bg-slate-100 rounded">
          <h4 class="font-semibold text-sm mb-3">Carte sélectionnée</h4>

          <div class="space-y-2">
            <div class="text-xs">
              <span class="text-slate-600">ID:</span>
              <code class="ml-1 text-xs">{{ selectedCard }}</code>
            </div>

            <div class="flex gap-2">
              <button
                @click="resizeCard(cards.find((c) => c.id === selectedCard)!, 20)"
                class="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                ➕ Agrandir
              </button>
              <button
                @click="resizeCard(cards.find((c) => c.id === selectedCard)!, -20)"
                class="flex-1 px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
              >
                ➖ Réduire
              </button>
            </div>

            <button
              @click="removeCard(selectedCard)"
              class="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 p-3 bg-blue-50 rounded text-xs">
        <p class="font-semibold text-blue-900 mb-2">✨ Avantages</p>
        <ul class="text-blue-800 space-y-1">
          <li>• Pas besoin de unitSize</li>
          <li>• Chaque item a sa taille</li>
          <li>• Positionnement libre</li>
          <li>• Adapté aux interfaces fluides</li>
        </ul>
      </div>

      <div class="mt-4 p-3 bg-slate-100 rounded text-xs">
        <p class="font-semibold mb-2">📊 Statistiques</p>
        <div class="space-y-1 text-slate-600">
          <div>Cartes: {{ cards.length }}</div>
          <div>Mode: Adaptatif</div>
          <div>unitSize: <code>undefined</code></div>
        </div>
      </div>
    </aside>

    <!-- Workspace -->
    <div class="flex-1 p-8">
      <div class="mb-4">
        <h2 class="text-2xl font-bold mb-2">Workspace - Mode Adaptatif</h2>
        <p class="text-sm text-slate-600">
          En mode adaptatif, width et height sont interprétés comme des pixels directement
        </p>
      </div>

      <div
        ref="workspace"
        class="relative w-full h-[700px] bg-white rounded-lg shadow-lg border-2 border-slate-200 overflow-hidden"
        @dragover="onDragOver"
        @drop="onDrop"
      >
        <!-- Grid pattern -->
        <div
          class="absolute inset-0 pointer-events-none opacity-5"
          style="
            background-image:
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
          "
        ></div>

        <!-- Cards -->
        <div
          v-for="card in cards"
          :key="card.id"
          :style="{
            position: 'absolute' as const,
            left: `${card.x}px`,
            top: `${card.y}px`,
            width: `${card.width}px`,
            height: `${card.height}px`,
          }"
          :class="[
            'border-2 rounded-lg cursor-move transition-all p-4',
            'shadow-md hover:shadow-xl',
            card.color,
            selectedCard === card.id ? 'ring-4 ring-blue-400' : '',
            dragState.isDragging && dragState.item?.id === card.id ? 'opacity-40' : 'opacity-100',
          ]"
          draggable="true"
          @dragstart="onDragStart($event, card)"
          @dragend="endDrag"
          @click="selectedCard = card.id"
          @dblclick="removeCard(card.id)"
        >
          <div class="font-bold text-sm mb-2">{{ card.title }}</div>
          <div class="text-xs text-slate-700">{{ card.content }}</div>

          <div class="absolute bottom-2 right-2 text-xs text-slate-400 font-mono">
            {{ card.width }}×{{ card.height }}px
          </div>
        </div>

        <!-- Hover preview -->
        <div
          v-if="dragState.isDragging && dragState.hoverPosition && dragState.item"
          :style="{
            position: 'absolute' as const,
            left: `${dragState.hoverPosition.x}px`,
            top: `${dragState.hoverPosition.y}px`,
            width: `${dragState.item.width}px`,
            height: `${dragState.item.height}px`,
          }"
          class="border-2 border-dashed border-blue-400 bg-blue-100 bg-opacity-30 rounded-lg pointer-events-none"
        ></div>

        <!-- Empty state -->
        <div
          v-if="cards.length === 0"
          class="absolute inset-0 flex items-center justify-center text-slate-400"
        >
          <div class="text-center">
            <div class="text-6xl mb-4">📝</div>
            <p class="text-lg">Ajoutez votre première carte</p>
          </div>
        </div>
      </div>

      <!-- Code example -->
      <div
        class="mt-6 p-4 bg-slate-800 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto"
      >
        <div class="text-green-400 mb-2">// Mode adaptatif - sans unitSize</div>
        <div>
          <span class="text-purple-400">const</span> {{ '{' }} dragState, startDrag, handleDragOver,
          endDrag {{ '}' }} = <span class="text-yellow-400">useDragDrop</span>({{ '{' }}
        </div>
        <div class="pl-4 text-slate-400">// unitSize: non défini ✨</div>
        <div class="pl-4">gap: <span class="text-blue-400">0</span>,</div>
        <div>{{ '})' }};</div>
        <div class="mt-2 text-slate-400">
          <div>// width et height sont en pixels directement</div>
          <div>startDrag(event, {{ '{' }} id, width: 250, height: 150 {{ '}' }});</div>
        </div>
      </div>
    </div>
  </div>
</template>
