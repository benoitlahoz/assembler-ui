<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import { useCheckIn } from '../useCheckIn';
import AirportPassenger from './AirportPassenger.vue';

interface PassengerData {
  name: string;
  seat: string;
  baggage: number;
  fareClass: 'Business' | 'Premium' | 'Eco';
  checkedInAt?: Date;
}

// Le comptoir d'enregistrement de l'aéroport
const flightNumber = ref('AF1234');
const gate = ref('A12');
const departureTime = ref('14:30');

// Mapping des classes tarifaires vers les groupes d'embarquement
const boardingGroups = ref({
  Business: 'A',
  Premium: 'B',
  Eco: 'C',
});

// Poids maximum de bagages par classe tarifaire (en kg)
const maxBaggageWeight = {
  Business: 40,
  Premium: 30,
  Eco: 23,
};

// Fonction pour ajouter un bagage (vérifie le poids maximum)
const addBaggage = (passengerId: string, weight: number = 10): boolean => {
  const passenger = airportDesk.desk.get(passengerId);
  if (!passenger) return false;

  const currentWeight = passenger.data.baggage;
  const maxWeight = maxBaggageWeight[passenger.data.fareClass];
  const newWeight = currentWeight + weight;

  if (newWeight > maxWeight) {
    console.log(
      `❌ ${passenger.data.name}: Impossible d'ajouter ${weight}kg (max ${maxWeight}kg, actuel ${currentWeight}kg)`
    );
    return false;
  }

  // Mise à jour directe du registry
  passenger.data.baggage = newWeight;
  airportDesk.desk.registry.value.set(passengerId, passenger);
  console.log(
    `➕ ${passenger.data.name}: Ajout de ${weight}kg de bagages (${currentWeight}kg → ${newWeight}kg)`
  );
  return true;
};

// Fonction pour retirer un bagage
const removeBaggage = (passengerId: string, weight: number = 10): boolean => {
  const passenger = airportDesk.desk.get(passengerId);
  if (!passenger) return false;

  const currentWeight = passenger.data.baggage;
  const newWeight = Math.max(0, currentWeight - weight);

  // Mise à jour directe du registry
  passenger.data.baggage = newWeight;
  airportDesk.desk.registry.value.set(passengerId, passenger);
  console.log(
    `➖ ${passenger.data.name}: Retrait de ${weight}kg de bagages (${currentWeight}kg → ${newWeight}kg)`
  );
  return true;
};

// Fonction pour assigner un nouveau siège (responsabilité du desk)
const assignSeat = (passengerId: string, passengerName: string) => {
  const rows = ['8', '12', '15', '18', '22', '25'];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rowPart = rows[Math.floor(Math.random() * rows.length)];
  const letterPart = letters[Math.floor(Math.random() * letters.length)];

  if (rowPart && letterPart) {
    const newSeat = rowPart + letterPart;
    const passenger = airportDesk.desk.get(passengerId);
    const oldSeat = passenger?.data.seat;

    // Mise à jour directe du registry pour éviter de re-déclencher onCheckIn
    if (passenger) {
      passenger.data.seat = newSeat;
      airportDesk.desk.registry.value.set(passengerId, passenger);
    }

    if (oldSeat) {
      console.log(`💺 Le comptoir a changé le siège de ${passengerName}: ${oldSeat} → ${newSeat}`);
    } else {
      console.log(`💺 Le comptoir a assigné le siège ${newSeat} à ${passengerName}`);
    }

    return newSeat;
  }
  return null;
};

const { openDesk } = useCheckIn<
  PassengerData,
  {
    flightNumber: typeof flightNumber;
    gate: typeof gate;
    departureTime: typeof departureTime;
    boardingGroups: typeof boardingGroups;
    maxBaggageWeight: typeof maxBaggageWeight;
    assignSeat: typeof assignSeat;
    addBaggage: typeof addBaggage;
    removeBaggage: typeof removeBaggage;
  }
>();

// Ouverture du comptoir d'enregistrement avec les infos du vol
const airportDesk = openDesk({
  context: {
    flightNumber,
    gate,
    departureTime,
    boardingGroups,
    maxBaggageWeight,
    assignSeat,
    addBaggage,
    removeBaggage,
  },
  debug: true,
  onCheckIn: (id, data) => {
    // Le comptoir assigne automatiquement un siège lors de l'enregistrement
    const assignedSeat = assignSeat(String(id), data.name);
    console.log(`✅ ${data.name} s'est enregistré(e) au comptoir avec le siège ${assignedSeat} !`);
  },
  onCheckOut: (id) => {
    console.log(`🚪 Passager ${id} a quitté le comptoir`);
  },
});

// Fournir le deskSymbol pour que les enfants puissent l'injecter
provide('airportDesk', { deskSymbol: airportDesk.deskSymbol });

// Liste des passagers enregistrés
const passengers = computed(() => {
  const all = airportDesk.desk.getAll();
  // Trier par classe tarifaire (Business > Premium > Eco)
  const fareOrder = { Business: 0, Premium: 1, Eco: 2 };
  return all.sort((a, b) => fareOrder[a.data.fareClass] - fareOrder[b.data.fareClass]);
});

// Statistiques du vol
const stats = computed(() => ({
  total: passengers.value.length,
  groupA: passengers.value.filter((p) => boardingGroups.value[p.data.fareClass] === 'A').length,
  groupB: passengers.value.filter((p) => boardingGroups.value[p.data.fareClass] === 'B').length,
  groupC: passengers.value.filter((p) => boardingGroups.value[p.data.fareClass] === 'C').length,
  totalWeight: passengers.value.reduce((sum, p) => sum + p.data.baggage, 0),
}));

// Embarquement de tous les passagers d'un groupe
const boardGroup = (group: 'A' | 'B' | 'C') => {
  const groupPassengers = passengers.value
    .filter((p) => boardingGroups.value[p.data.fareClass] === group)
    .map((p) => p.id);

  console.log(`📢 Embarquement du groupe ${group}: ${groupPassengers.length} passagers`);
};

// Liste initiale des passagers (données de base)
const passengersList = ref([
  { id: 'passenger-1', name: 'Sophie Martin', fareClass: 'Business' as const },
  { id: 'passenger-2', name: 'Jean Dupont', fareClass: 'Premium' as const },
  { id: 'passenger-3', name: 'Marie Lambert', fareClass: 'Business' as const },
  { id: 'passenger-4', name: 'Pierre Dubois', fareClass: 'Eco' as const },
  { id: 'passenger-5', name: 'Claire Bernard', fareClass: 'Premium' as const },
]);

// Changer de porte
const changeGate = () => {
  const gates = ['A12', 'B5', 'C8', 'D3'];
  const currentIndex = gates.indexOf(gate.value);
  const newGate = gates[(currentIndex + 1) % gates.length];
  if (newGate) gate.value = newGate;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Panneau d'affichage du vol -->
    <div class="bg-primary/10 p-4 rounded-lg border-2 border-primary">
      <h3 class="text-lg font-bold mb-3">✈️ Panneau d'affichage - Comptoir d'enregistrement</h3>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div class="text-muted-foreground">Vol</div>
          <div class="font-mono font-bold">{{ flightNumber }}</div>
        </div>
        <div>
          <div class="text-muted-foreground">Porte</div>
          <div class="font-mono font-bold">{{ gate }}</div>
        </div>
        <div>
          <div class="text-muted-foreground">Départ</div>
          <div class="font-mono font-bold">{{ departureTime }}</div>
        </div>
      </div>
      <button
        @click="changeGate"
        class="mt-3 px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
      >
        🔄 Changer de porte
      </button>
    </div>

    <!-- Statistiques d'enregistrement -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-muted p-4 rounded-lg">
        <h4 class="font-semibold mb-2">📊 Passagers enregistrés</h4>
        <div class="text-3xl font-bold">{{ stats.total }}</div>
      </div>
      <div class="bg-muted p-4 rounded-lg">
        <h4 class="font-semibold mb-2">🧳 Total Luggages Weight</h4>
        <div class="text-3xl font-bold">{{ stats.totalWeight }}kg</div>
      </div>
    </div>

    <!-- Groupes d'embarquement -->
    <div class="space-y-2">
      <h4 class="font-semibold">Groupes d'embarquement</h4>
      <div class="flex gap-4">
        <div
          class="flex-1 p-3 bg-green-100 dark:bg-green-900/20 rounded border border-green-300 dark:border-green-700"
        >
          <div class="text-sm text-muted-foreground">Groupe A (Business)</div>
          <div class="text-2xl font-bold">{{ stats.groupA }}</div>
          <button
            @click="boardGroup('A')"
            :disabled="stats.groupA === 0"
            class="mt-2 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎫 Embarquer
          </button>
        </div>
        <div
          class="flex-1 p-3 bg-blue-100 dark:bg-blue-900/20 rounded border border-blue-300 dark:border-blue-700"
        >
          <div class="text-sm text-muted-foreground">Groupe B (Premium)</div>
          <div class="text-2xl font-bold">{{ stats.groupB }}</div>
          <button
            @click="boardGroup('B')"
            :disabled="stats.groupB === 0"
            class="mt-2 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎫 Embarquer
          </button>
        </div>
        <div
          class="flex-1 p-3 bg-orange-100 dark:bg-orange-900/20 rounded border border-orange-300 dark:border-orange-700"
        >
          <div class="text-sm text-muted-foreground">Groupe C (Eco)</div>
          <div class="text-2xl font-bold">{{ stats.groupC }}</div>
          <button
            @click="boardGroup('C')"
            :disabled="stats.groupC === 0"
            class="mt-2 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎫 Embarquer
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des passagers (s'enregistrent automatiquement via leurs composants) -->
    <!-- Le desk est injecté via provide/inject par openDesk -->
    <div class="space-y-2">
      <h4 class="font-semibold">🛂 Comptoir d'enregistrement</h4>
      <div class="space-y-2">
        <AirportPassenger
          v-for="passenger in passengersList"
          :key="passenger.id"
          :id="passenger.id"
          :name="passenger.name"
          :fare-class="passenger.fareClass"
        />
      </div>
    </div>

    <!-- Légende -->
    <div class="text-xs text-muted-foreground space-y-1 border-t pt-4">
      <div><strong>💡 Métaphore :</strong></div>
      <div>• <strong>Desk</strong> = Comptoir d'enregistrement de l'aéroport</div>
      <div>
        • <strong>Check-in</strong> = Passager s'enregistre avec ses données (nom, siège, bagages)
      </div>
      <div>• <strong>Check-out</strong> = Passager quitte le comptoir (composant démonté)</div>
      <div>• <strong>Extra context</strong> = Infos partagées du vol (numéro, porte, heure)</div>
      <div>• <strong>Registry</strong> = Liste des passagers enregistrés triée par groupe</div>
    </div>
  </div>
</template>
